import React, { useState, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { Student, TuitionPayment } from '../../types';
import {
  X,
  CreditCard,
  Upload,
  Camera,
  CheckCircle2,
  Calendar,
  Clock,
  QrCode,
  Copy,
  Check,
  Trash2,
  AlertCircle,
  FileImage,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentProofUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetStudent: Student;
  tuition?: TuitionPayment | null;
  isParentView?: boolean;
  parentName?: string;
  onSuccess?: () => void;
}

export const PaymentProofUploadModal: React.FC<PaymentProofUploadModalProps> = ({
  isOpen,
  onClose,
  targetStudent,
  tuition,
  isParentView = false,
  parentName,
  onSuccess
}) => {
  const { branding, bankConfig: ctxBankConfig, formatTransferContent, submitPaymentReceipt } = useData();

  const bank = ctxBankConfig || branding?.bankAccount || {
    bankId: 'MBBank',
    bankCode: '970422',
    accountNumber: '0901888999',
    accountHolder: 'TRUNG TAM AM NHAC MINH MUSIC',
    branchName: 'Chi nhánh Sài Gòn - TP.HCM',
    customQrUrl: '',
    useCustomQr: false,
    memoFormat: 'CODE_SUBJECT_MONTH'
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Default values
  const defaultAmount = tuition?.amount || 2400000;
  const studentCodeOrName = bank?.memoFormat === 'NAME_SUBJECT_MONTH' 
    ? targetStudent.fullName 
    : (targetStudent.code || targetStudent.fullName);

  const defaultBillingMonth = tuition?.billingMonth || `Tháng ${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`;
  const defaultSubject = tuition?.subjectName || targetStudent.enrolledSubjects?.[0] || 'Piano';

  const defaultSyntax = tuition?.transferSyntax || formatTransferContent(
    studentCodeOrName,
    defaultSubject,
    defaultBillingMonth
  );

  // Form states
  const [proofAmount, setProofAmount] = useState<number>(defaultAmount);
  const [proofSyntax, setProofSyntax] = useState<string>(defaultSyntax);
  
  // Date & Time of transfer (YYYY-MM-DDTHH:mm)
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const initialDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

  const [transferDateTime, setTransferDateTime] = useState<string>(initialDateTime);
  const [proofUrl, setProofUrl] = useState<string>('');
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [proofNotes, setProofNotes] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Direct Image File Upload Handler from Mobile/Camera/Desktop
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh biên lai (JPG, PNG, WebP, HEIC...)');
      return;
    }

    setUploadedFileName(file.name);

    // Read and compress image
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) return;

      // Create an image object to compress for smooth storage
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setUploadedImagePreview(compressedDataUrl);
        setProofUrl(compressedDataUrl);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setUploadedImagePreview('');
    setUploadedFileName('');
    setProofUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!proofUrl.trim() && !proofNotes.trim()) {
      alert('Vui lòng chụp/tải lên ảnh biên lai chuyển khoản hoặc ghi chú mã giao dịch ngân hàng!');
      return;
    }

    setIsSubmitting(true);

    const formattedTransferTime = transferDateTime ? transferDateTime.replace('T', ' ') : new Date().toLocaleString('vi-VN');

    const notePayload = [
      isParentView ? `Phụ huynh ${parentName || ''} nộp cho học viên.` : '',
      `Thời gian chuyển khoản: ${formattedTransferTime}`,
      proofNotes ? `Ghi chú: ${proofNotes}` : ''
    ].filter(Boolean).join(' | ');

    submitPaymentReceipt({
      tuitionPaymentId: tuition?.id,
      studentId: targetStudent.id,
      studentName: targetStudent.fullName,
      studentCode: targetStudent.code,
      amount: proofAmount,
      transferSyntax: proofSyntax,
      receiptProofUrl: proofUrl,
      receiptProofFileName: uploadedFileName || 'bien_lai_chuyen_khoan.jpg',
      transferDateTime: formattedTransferTime,
      notes: notePayload
    });

    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {}

    setIsSubmitting(false);
    onClose();
    if (onSuccess) onSuccess();
  };

  // VietQR Dynamic URL
  const vietQrUrl = bank.useCustomQr && bank.customQrUrl
    ? bank.customQrUrl
    : `https://img.vietqr.io/image/${bank.bankId || 'MBBank'}-${bank.accountNumber || '0901888999'}-compact2.png?amount=${proofAmount}&addInfo=${encodeURIComponent(proofSyntax)}&accountName=${encodeURIComponent(bank.accountHolder || 'TRUNG TAM AM NHAC')}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header - Thân thiện trên mobile */}
        <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-xs">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-heading">
                Nộp Biên Lai Học Phí & Quét Mã QR
              </h3>
              <p className="text-rose-100 text-xs mt-0.5">
                Học viên: <strong className="text-white">{targetStudent.fullName}</strong> ({targetStudent.code || 'HV'})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200 text-xs space-y-4">
          
          {/* Quick Bank Info & VietQR Preview */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-white p-2 rounded-xl shadow-xs border border-slate-200 shrink-0">
              <img
                src={vietQrUrl}
                alt="VietQR nộp học phí"
                className="w-28 h-28 object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-1.5 flex-1 w-full text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-bold">Ngân hàng:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{bank.bankId || 'MBBank'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-bold">Số tài khoản:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-rose-600 dark:text-rose-400 text-xs">
                    {bank.accountNumber || '0901888999'}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(bank.accountNumber || '0901888999', 'Số tài khoản')}
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="Sao chép STK"
                  >
                    {copiedField === 'Số tài khoản' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-bold">Chủ tài khoản:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                  {bank.accountHolder || 'TRUNG TAM AM NHAC MINH MUSIC'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 font-bold">Nội dung CK:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400 text-[11px] bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                    {proofSyntax}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(proofSyntax, 'Cú pháp CK')}
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="Sao chép nội dung CK"
                  >
                    {copiedField === 'Cú pháp CK' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Amount and Syntax Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Số tiền đã chuyển (VNĐ) (*):
              </label>
              <input
                type="number"
                value={proofAmount}
                onChange={(e) => setProofAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-extrabold text-xs"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Cú pháp / Nội dung ghi trên bill (*):
              </label>
              <input
                type="text"
                value={proofSyntax}
                onChange={(e) => setProofSyntax(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-xs"
                required
              />
            </div>
          </div>

          {/* Ngày & Giờ đã chuyển khoản */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Ngày & Giờ bạn đã thực hiện chuyển khoản (*):</span>
            </label>
            <input
              type="datetime-local"
              value={transferDateTime}
              onChange={(e) => setTransferDateTime(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold text-xs"
              required
            />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              Thời gian in trên hóa đơn ngân hàng để kế toán đối soát nhanh nhất.
            </p>
          </div>

          {/* Direct File Upload From Phone/Camera/Device */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileImage className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Ảnh chụp màn hình biên lai chuyển khoản (Tải trực tiếp từ điện thoại):</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {!uploadedImagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-5 border-2 border-dashed border-rose-300 dark:border-rose-800/60 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-50 rounded-2xl text-center cursor-pointer transition-all space-y-2 group"
              >
                <div className="w-12 h-12 mx-auto bg-rose-100 dark:bg-rose-900/40 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-300 group-hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
                    Bấm vào đây để Chụp Ảnh hoặc Chọn Ảnh Biên Lai từ Điện Thoại / Máy Tính
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Hỗ trợ tất cả định dạng ảnh JPG, PNG, HEIC, chụp camera trực tiếp
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-[11px] shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Chọn Tệp Ảnh Biên Lai</span>
                </span>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                      {uploadedFileName || 'Ảnh biên lai đã chọn'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg cursor-pointer"
                    >
                      Đổi ảnh khác
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-1 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg cursor-pointer"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="relative max-h-48 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-black/5 flex items-center justify-center">
                  <img
                    src={uploadedImagePreview}
                    alt="Biên lai học phí preview"
                    className="max-h-48 object-contain rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Hoặc tùy chọn dán link */}
            <div className="mt-2">
              <input
                type="text"
                value={uploadedImagePreview ? '' : proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="Hoặc dán đường link ảnh Google Drive, Imgur nếu có..."
                disabled={!!uploadedImagePreview}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 text-[11px] disabled:opacity-40"
              />
            </div>
          </div>

          {/* Ghi chú thêm */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Ghi chú thêm (Mã giao dịch FT, ngân hàng gửi...):
            </label>
            <textarea
              rows={2}
              value={proofNotes}
              onChange={(e) => setProofNotes(e.target.value)}
              placeholder="Ví dụ: Chuyển từ app Techcombank tài khoản Tran Van A lúc 15h00..."
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs resize-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-600 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer whitespace-nowrap"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-6 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-extrabold rounded-xl shadow-md flex items-center gap-2 cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang gửi...' : 'Xác Nhận Nộp Biên Lai'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
