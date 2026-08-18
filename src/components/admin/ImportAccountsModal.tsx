import React, { useState, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  FileText,
  Key,
  Layers,
  Settings2,
  Trash2,
  Edit3,
  RefreshCw,
  Info
} from 'lucide-react';
import {
  ImportType,
  ParsedImportRow,
  generateTemplateExcel,
  generateTemplateCSV,
  parseUploadedFile
} from '../../utils/importHelper';
import { Student, Teacher, UserAccount, Guardian } from '../../types';

interface ImportAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  defaultType?: ImportType;
}

export const ImportAccountsModal: React.FC<ImportAccountsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultType = 'STUDENT'
}) => {
  const {
    students,
    teachers,
    guardians,
    addStudent,
    addTeacher,
    addGuardian,
    addStudentGuardianLink,
    updateStudent,
    updateTeacher
  } = useData();

  const { accounts, addAccount } = useAuth();

  const [importType, setImportType] = useState<ImportType>(defaultType);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedImportRow[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [filterView, setFilterView] = useState<'ALL' | 'VALID' | 'WARNING' | 'ERROR'>('ALL');
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<{
    successCount: number;
    accountsCount: number;
    guardiansCount: number;
    skippedCount: number;
  } | null>(null);

  // Import Configurations
  const [autoCreateAccounts, setAutoCreateAccounts] = useState<boolean>(true);
  const [defaultPassword, setDefaultPassword] = useState<string>('MinhMusic@2024');
  const [autoLinkGuardians, setAutoLinkGuardians] = useState<boolean>(true);
  const [updateExistingRecords, setUpdateExistingRecords] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Handle file upload and parsing
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessingFile(true);
    setImportResult(null);

    try {
      const parsed = await parseUploadedFile(
        selectedFile,
        importType,
        students,
        teachers,
        accounts
      );
      setParsedRows(parsed);
    } catch (error: any) {
      alert(`Lỗi khi đọc file: ${error?.message || 'Không thể xử lý file Excel/CSV này'}`);
      setParsedRows([]);
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setIsProcessingFile(true);
      setImportResult(null);
      try {
        const parsed = await parseUploadedFile(
          droppedFile,
          importType,
          students,
          teachers,
          accounts
        );
        setParsedRows(parsed);
      } catch (error: any) {
        alert(`Lỗi khi đọc file: ${error?.message || 'Không thể xử lý file'}`);
        setParsedRows([]);
      } finally {
        setIsProcessingFile(false);
      }
    }
  };

  // Change Import Type (reset state or re-parse)
  const handleChangeType = async (type: ImportType) => {
    setImportType(type);
    setImportResult(null);
    if (file) {
      setIsProcessingFile(true);
      try {
        const parsed = await parseUploadedFile(
          file,
          type,
          students,
          teachers,
          accounts
        );
        setParsedRows(parsed);
      } catch (e) {
        // ignore
      } finally {
        setIsProcessingFile(false);
      }
    }
  };

  // Remove a row from parsed list
  const handleRemoveRow = (rowNumber: number) => {
    setParsedRows(prev => prev.filter(r => r.rowNumber !== rowNumber));
  };

  // Quick fix row field
  const handleQuickFixRow = (rowNumber: number, field: string, val: any) => {
    setParsedRows(prev =>
      prev.map(r => {
        if (r.rowNumber === rowNumber) {
          const updated = { ...r, [field]: val };
          // Re-evaluate validation
          const errors: string[] = [];
          if (!updated.fullName) errors.push('Thiếu họ và tên');
          if (!updated.email) errors.push('Thiếu email');
          updated.errors = errors;
          updated.isValid = errors.length === 0;
          return updated;
        }
        return r;
      })
    );
  };

  // Summary Metrics
  const totalRows = parsedRows.length;
  const validRows = parsedRows.filter(r => r.isValid && r.warnings.length === 0);
  const warningRows = parsedRows.filter(r => r.isValid && r.warnings.length > 0);
  const errorRows = parsedRows.filter(r => !r.isValid);

  const displayRows = parsedRows.filter(r => {
    if (filterView === 'VALID') return r.isValid && r.warnings.length === 0;
    if (filterView === 'WARNING') return r.isValid && r.warnings.length > 0;
    if (filterView === 'ERROR') return !r.isValid;
    return true;
  });

  // Execute Batch Import
  const handleExecuteImport = async () => {
    const importableRows = parsedRows.filter(r => r.isValid);
    if (importableRows.length === 0) {
      alert('Không có dòng dữ liệu hợp lệ nào để nhập.');
      return;
    }

    setIsImporting(true);

    let successCount = 0;
    let accountsCount = 0;
    let guardiansCount = 0;
    let skippedCount = parsedRows.length - importableRows.length;

    try {
      const nowStr = new Date().toISOString().split('T')[0];

      for (let i = 0; i < importableRows.length; i++) {
        const row = importableRows[i];
        const uniqueSuffix = `${Date.now()}-${i}`;

        if (importType === 'STUDENT') {
          // 1. Check if student already exists
          const existingStu = students.find(
            s => s.code.toUpperCase() === row.code.toUpperCase() || (row.email && s.email?.toLowerCase() === row.email.toLowerCase())
          );

          let studentId = existingStu?.id || `stu-${uniqueSuffix}`;

          if (existingStu) {
            if (updateExistingRecords) {
              updateStudent(existingStu.id, {
                fullName: row.fullName || existingStu.fullName,
                phone: row.phone || existingStu.phone,
                email: row.email || existingStu.email,
                birthDate: row.birthDate || existingStu.birthDate,
                gender: row.gender || existingStu.gender,
                address: row.address || existingStu.address,
                enrolledSubjects: row.subjectsOrSpecialties.length > 0 ? row.subjectsOrSpecialties : existingStu.enrolledSubjects,
                guardianName: row.guardianName || existingStu.guardianName,
                guardianPhone: row.guardianPhone || existingStu.guardianPhone,
                guardianRelation: row.guardianRelation || existingStu.guardianRelation,
                status: (row.status as any) || existingStu.status,
                notes: row.notes ? `${existingStu.notes || ''} | ${row.notes}` : existingStu.notes
              });
              studentId = existingStu.id;
              successCount++;
            }
          } else {
            const newStudent: Student = {
              id: studentId,
              code: row.code,
              fullName: row.fullName,
              phone: row.phone || undefined,
              email: row.email || undefined,
              birthDate: row.birthDate,
              gender: row.gender,
              address: row.address || undefined,
              enrolledSubjects: row.subjectsOrSpecialties,
              guardianName: row.guardianName || undefined,
              guardianPhone: row.guardianPhone || undefined,
              guardianRelation: row.guardianRelation || undefined,
              status: (row.status as any) || 'active',
              totalLessons: 24,
              completedLessons: 0,
              remainingLessons: 24,
              stars: 20,
              totalStars: 20,
              rewardPoints: 20,
              joinDate: nowStr,
              notes: row.notes || `Nhập từ file Excel/CSV ngày ${new Date().toLocaleDateString('vi-VN')}`
            };
            addStudent(newStudent);
            successCount++;
          }

          // 2. Link or create Guardian if info present
          if (autoLinkGuardians && row.guardianName && row.guardianPhone) {
            const existingG = guardians.find(
              g => g.phone === row.guardianPhone || g.fullName.toLowerCase() === row.guardianName!.toLowerCase()
            );

            let gId = existingG?.id;
            if (!existingG) {
              gId = `gd-${uniqueSuffix}`;
              addGuardian({
                code: `PH${String(guardians.length + guardiansCount + 1).padStart(3, '0')}`,
                fullName: row.guardianName,
                phone: row.guardianPhone,
                email: `${row.guardianPhone}@minhmusic.family`,
                relation: (row.guardianRelation as any) || 'Phụ huynh',
                address: row.address || 'TP. Hồ Chí Minh',
                linkedStudentIds: [studentId],
                isPrimaryContact: true,
                isNotificationReceiver: true,
                isTuitionResponsible: true,
                hasUserAccount: false,
                status: 'active',
                notes: `Phụ huynh của học viên ${row.fullName}`
              });
              guardiansCount++;
            }

            if (gId) {
              addStudentGuardianLink({
                studentId: studentId,
                guardianId: gId,
                studentName: row.fullName,
                guardianName: row.guardianName,
                relationship: (row.guardianRelation as any) || 'Phụ huynh',
                canViewLearning: true,
                canViewPayments: true,
                canSubmitPayments: true,
                canRequestScheduleChange: true,
                canRequestReservation: true,
                canRegisterCourses: true,
                canRedeemRewards: true,
                receiveNotifications: true,
                isPrimary: true,
                status: 'active'
              });
            }
          }

          // 3. Auto create UserAccount
          if (autoCreateAccounts && row.createAccount && row.email) {
            const existingAcc = accounts.find(a => a.email.toLowerCase() === row.email.toLowerCase());
            if (!existingAcc) {
              const newUid = `usr-stu-${uniqueSuffix}`;
              await addAccount({
                uid: newUid,
                email: row.email.toLowerCase(),
                displayName: row.fullName,
                phone: row.phone,
                role: 'STUDENT',
                roles: ['STUDENT'],
                primaryRole: 'STUDENT',
                status: 'active',
                profileId: studentId,
                studentProfileId: studentId,
                profileName: row.fullName,
                profileCode: row.code,
                gender: row.gender,
                birthDate: row.birthDate,
                address: row.address,
                guardianName: row.guardianName,
                guardianPhone: row.guardianPhone,
                guardianRelation: row.guardianRelation,
                password: row.password || defaultPassword,
                note: `Tài khoản học viên tạo tự động từ file nhập liệu ngày ${nowStr}`
              });
              accountsCount++;
            }
          }
        } else if (importType === 'TEACHER') {
          // TEACHER import
          const existingTch = teachers.find(
            t => t.code.toUpperCase() === row.code.toUpperCase() || (row.email && t.email?.toLowerCase() === row.email.toLowerCase())
          );

          let teacherId = existingTch?.id || `tch-${uniqueSuffix}`;

          if (existingTch) {
            if (updateExistingRecords) {
              updateTeacher(existingTch.id, {
                fullName: row.fullName || existingTch.fullName,
                phone: row.phone || existingTch.phone,
                email: row.email || existingTch.email,
                birthDate: row.birthDate || existingTch.birthDate,
                gender: row.gender || existingTch.gender,
                specialties: row.subjectsOrSpecialties.length > 0 ? row.subjectsOrSpecialties : existingTch.specialties,
                hourlyRate: row.hourlyRate || existingTch.hourlyRate,
                status: (row.status as any) || existingTch.status,
                bio: row.notes || existingTch.bio
              });
              teacherId = existingTch.id;
              successCount++;
            }
          } else {
            const newTeacher: Teacher = {
              id: teacherId,
              code: row.code,
              fullName: row.fullName,
              phone: row.phone || '0901000000',
              email: row.email,
              birthDate: row.birthDate,
              gender: row.gender,
              specialties: row.subjectsOrSpecialties,
              hourlyRate: row.hourlyRate || 300000,
              status: (row.status as any) || 'active',
              bio: row.notes || 'Giảng viên âm nhạc',
              hireDate: nowStr,
              joinDate: nowStr
            };
            addTeacher(newTeacher);
            successCount++;
          }

          // Auto create UserAccount for Teacher
          if (autoCreateAccounts && row.createAccount && row.email) {
            const existingAcc = accounts.find(a => a.email.toLowerCase() === row.email.toLowerCase());
            if (!existingAcc) {
              const newUid = `usr-tch-${uniqueSuffix}`;
              await addAccount({
                uid: newUid,
                email: row.email.toLowerCase(),
                displayName: row.fullName,
                phone: row.phone,
                role: 'TEACHER',
                roles: ['TEACHER'],
                primaryRole: 'TEACHER',
                status: 'active',
                profileId: teacherId,
                teacherProfileId: teacherId,
                profileName: row.fullName,
                profileCode: row.code,
                gender: row.gender,
                birthDate: row.birthDate,
                address: row.address,
                specialties: row.subjectsOrSpecialties,
                password: row.password || defaultPassword,
                note: `Tài khoản giáo viên tạo tự động từ file nhập liệu ngày ${nowStr}`
              });
              accountsCount++;
            }
          }
        } else {
          // GENERIC ACCOUNT import
          const existingAcc = accounts.find(a => a.email.toLowerCase() === row.email.toLowerCase());
          if (!existingAcc) {
            const newUid = `usr-gen-${uniqueSuffix}`;
            await addAccount({
              uid: newUid,
              email: row.email.toLowerCase(),
              displayName: row.fullName,
              phone: row.phone,
              role: row.accountRole,
              roles: [row.accountRole],
              primaryRole: row.accountRole,
              status: 'active',
              profileCode: row.code,
              profileName: row.fullName,
              password: row.password || defaultPassword,
              note: row.notes || `Tài khoản tạo từ file nhập liệu ngày ${nowStr}`
            });
            successCount++;
            accountsCount++;
          }
        }
      }

      setImportResult({
        successCount,
        accountsCount,
        guardiansCount,
        skippedCount
      });

      onSuccess(
        `Đã nhập thành công ${successCount} ${
          importType === 'STUDENT' ? 'học viên' : importType === 'TEACHER' ? 'giáo viên' : 'tài khoản'
        } và khởi tạo ${accountsCount} tài khoản đăng nhập!`
      );
    } catch (err: any) {
      alert(`Đã xảy ra lỗi trong quá trình nhập: ${err?.message || err}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-md shadow-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white font-heading">
                  Nhập Dữ Liệu Tự Động Từ Excel / CSV
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Tự động liên kết tài khoản
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nhập danh sách học viên, giáo viên hoặc tài khoản từ file bảng tính để tiết kiệm thời gian nhập liệu thủ công.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* 1. Chọn đối tượng nhập liệu */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              1. Chọn Loại Dữ Liệu Cần Nhập:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleChangeType('STUDENT')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  importType === 'STUDENT'
                    ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 ring-2 ring-emerald-400/30 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className={`w-4 h-4 ${importType === 'STUDENT' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-black text-slate-900 dark:text-white">Danh Sách Học Viên</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tạo hồ sơ học viên & cấp tài khoản học viên (STUDENT)
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleChangeType('TEACHER')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  importType === 'TEACHER'
                    ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 ring-2 ring-blue-400/30 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Users className={`w-4 h-4 ${importType === 'TEACHER' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-black text-slate-900 dark:text-white">Danh Sách Giáo Viên</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tạo hồ sơ giáo viên & cấp tài khoản giảng dạy (TEACHER)
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleChangeType('ACCOUNT')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  importType === 'ACCOUNT'
                    ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/40 ring-2 ring-purple-400/30 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className={`w-4 h-4 ${importType === 'ACCOUNT' ? 'text-purple-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-black text-slate-900 dark:text-white">Tài Khoản Phân Quyền</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Nhập danh sách tài khoản theo vai trò (Admin, GV, HV, PH)
                </p>
              </button>
            </div>
          </div>

          {/* 2. Tải File Mẫu Chuẩn */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  Chưa có file mẫu? Tải biểu mẫu chuẩn đã định dạng sẵn cột:
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Biểu mẫu gồm các cột tiêu chuẩn, hướng dẫn ngày sinh, giới tính và hỗ trợ tiếng Việt có dấu.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => generateTemplateExcel(importType)}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>TẢI MẪU EXCEL (.XLSX)</span>
              </button>
              <button
                type="button"
                onClick={() => generateTemplateCSV(importType)}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>MẪU CSV</span>
              </button>
            </div>
          </div>

          {/* 3. Vùng Kéo thả / Chọn file */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              2. Tải Lên File Dữ Liệu (.xlsx, .xls, .csv):
            </label>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all ${
                file
                  ? 'border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 hover:border-emerald-500'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center gap-2">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-emerald-600">
                  <Upload className="w-6 h-6" />
                </div>
                {file ? (
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB • Nhận diện được {parsedRows.length} dòng dữ liệu
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Kéo và thả file Excel hoặc CSV vào đây, hoặc <span className="text-emerald-600 dark:text-emerald-400 underline">bấm để chọn file</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Hỗ trợ tự động chuẩn hóa tiêu đề tiếng Việt (Họ và Tên, Email, SĐT, Ngày sinh, Môn học,...)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. Tùy chọn cấu hình tự động tạo tài khoản & mật khẩu */}
          <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-900/40 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-900 dark:text-purple-300">
              <Settings2 className="w-4 h-4 text-purple-600" />
              <span>3. Tùy Chọn Tự Động Khởi Tạo & Đồng Bộ Tài Khoản:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCreateAccounts}
                  onChange={(e) => setAutoCreateAccounts(e.target.checked)}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
                <span>Tự động cấp tài khoản đăng nhập (Firebase Auth / RBAC)</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                  Mật khẩu mặc định:
                </span>
                <input
                  type="text"
                  value={defaultPassword}
                  onChange={(e) => setDefaultPassword(e.target.value)}
                  placeholder="MinhMusic@2024"
                  className="text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-purple-700 dark:text-purple-300 w-full"
                />
              </div>

              {importType === 'STUDENT' && (
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoLinkGuardians}
                    onChange={(e) => setAutoLinkGuardians(e.target.checked)}
                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Tự động tạo & liên kết hồ sơ Phụ huynh nếu có SĐT phụ huynh</span>
                </label>
              )}

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={updateExistingRecords}
                  onChange={(e) => setUpdateExistingRecords(e.target.checked)}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
                <span>Cập nhật thông tin nếu mã hoặc email đã tồn tại</span>
              </label>
            </div>
          </div>

          {/* 5. Xem trước & Kiểm tra dữ liệu (Preview Table) */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    4. Bảng Xem Trước & Kết Quả Kiểm Tra ({parsedRows.length} dòng):
                  </span>
                </div>

                {/* Filter Badges */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFilterView('ALL')}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${
                      filterView === 'ALL'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Tất cả ({totalRows})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterView('VALID')}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${
                      filterView === 'VALID'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    Hợp lệ ({validRows.length})
                  </button>
                  {warningRows.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterView('WARNING')}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${
                        filterView === 'WARNING'
                          ? 'bg-amber-600 text-white'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      Cảnh báo ({warningRows.length})
                    </button>
                  )}
                  {errorRows.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterView('ERROR')}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${
                        filterView === 'ERROR'
                          ? 'bg-rose-600 text-white'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      Lỗi ({errorRows.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl max-h-72">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider bg-slate-50 dark:bg-slate-800/80 sticky top-0 z-10">
                      <th className="py-2.5 px-3 text-center">Dòng</th>
                      <th className="py-2.5 px-3">Mã</th>
                      <th className="py-2.5 px-3">Họ và Tên</th>
                      <th className="py-2.5 px-3">Email Đăng Nhập</th>
                      <th className="py-2.5 px-3">SĐT</th>
                      <th className="py-2.5 px-3">Ngày Sinh</th>
                      <th className="py-2.5 px-3">
                        {importType === 'TEACHER' ? 'Bộ Môn / Thù Lao' : 'Môn Học / Phụ Huynh'}
                      </th>
                      <th className="py-2.5 px-3 text-center">Tạo TK?</th>
                      <th className="py-2.5 px-3">Trạng Thái Xác Thực</th>
                      <th className="py-2.5 px-3 text-right">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {displayRows.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-6 text-center text-slate-400 italic">
                          Không có dòng dữ liệu nào theo bộ lọc này
                        </td>
                      </tr>
                    ) : (
                      displayRows.map((row) => (
                        <tr
                          key={row.rowNumber}
                          className={`transition-colors ${
                            !row.isValid
                              ? 'bg-rose-50/40 dark:bg-rose-950/20'
                              : row.warnings.length > 0
                              ? 'bg-amber-50/30 dark:bg-amber-950/10'
                              : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <td className="py-2 px-3 text-center font-mono font-bold text-slate-400">
                            #{row.rowNumber}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                            <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px]">
                              {row.code}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                            {row.fullName || (
                              <span className="text-rose-500 italic">Chưa có tên</span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-600 dark:text-slate-400">
                            {row.email}
                          </td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                            {row.phone || '-'}
                          </td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                            {row.birthDate}
                          </td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                            {importType === 'TEACHER' ? (
                              <div>
                                <span className="font-bold">{row.subjectsOrSpecialties.join(', ')}</span>
                                {row.hourlyRate && (
                                  <span className="text-[11px] text-emerald-600 ml-1">
                                    • {row.hourlyRate.toLocaleString('vi-VN')} đ
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div>
                                <div>{row.subjectsOrSpecialties.join(', ')}</div>
                                {row.guardianName && (
                                  <div className="text-[10px] text-slate-400">
                                    PH: {row.guardianName} ({row.guardianPhone || '-'})
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {row.createAccount ? (
                              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full font-bold text-[10px]">
                                Có
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full font-bold text-[10px]">
                                Không
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {row.isValid && row.warnings.length === 0 && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Hợp lệ
                              </span>
                            )}
                            {row.isValid && row.warnings.length > 0 && (
                              <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold space-y-0.5">
                                {row.warnings.map((w, i) => (
                                  <div key={i} className="flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                                    <span>{w}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {!row.isValid && (
                              <div className="text-[10px] text-rose-600 dark:text-rose-400 font-bold space-y-0.5">
                                {row.errors.map((e, i) => (
                                  <div key={i} className="flex items-center gap-1">
                                    <XCircle className="w-3 h-3 text-rose-500" />
                                    <span>{e}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(row.rowNumber)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Xóa dòng này khỏi danh sách nhập"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import Result Notice */}
          {importResult && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 text-white rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                    Nhập dữ liệu thành công!
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Đã nhập <strong>{importResult.successCount}</strong> hồ sơ, khởi tạo <strong>{importResult.accountsCount}</strong> tài khoản đăng nhập, và liên kết <strong>{importResult.guardiansCount}</strong> phụ huynh.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
              >
                Hoàn tất
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Hủy & Đóng
          </button>

          <div className="flex items-center gap-2">
            {parsedRows.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setParsedRows([]);
                  setFile(null);
                }}
                className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Xóa File & Chọn Lại</span>
              </button>
            )}

            <button
              type="button"
              disabled={parsedRows.filter(r => r.isValid).length === 0 || isImporting}
              onClick={handleExecuteImport}
              className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                parsedRows.filter(r => r.isValid).length === 0 || isImporting
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/25'
              }`}
            >
              {isImporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý nhập dữ liệu...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>
                    BẮT ĐẦU NHẬP {parsedRows.filter(r => r.isValid).length} DÒNG HỢP LỆ
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
