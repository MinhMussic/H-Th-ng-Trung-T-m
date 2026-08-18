import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import {
  X,
  Download,
  FileSpreadsheet,
  Printer,
  Calendar,
  Filter,
  Search,
  DollarSign,
  CreditCard,
  Banknote,
  Receipt,
  FileCheck2,
  Building2,
  HelpCircle,
  Edit3,
  CheckCircle2,
  ArrowUpDown,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  UserCheck,
  Briefcase,
  Store,
  BookOpen,
  Music,
  ShieldCheck,
  Info
} from 'lucide-react';
import {
  TaxReportFilterState,
  TaxRevenueRecord,
  RevenueSourceCategory,
  TaxPaymentMethodCategory,
  TaxPeriodType,
  FacilityTaxType,
  TuitionPayment
} from '../../types';
import {
  filterAndBuildTaxRecords,
  exportHouseholdTaxReportToExcel,
  exportEnterpriseTaxReportToExcel,
  exportTaxReportToExcel,
  exportTaxReportToCSV,
  printTaxReportPDF,
  getPeriodDisplayText,
  vietnameseNumberToWords,
  getRevenueCategoryLabel
} from '../../utils/taxCompliance';

interface TaxRevenueReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaxRevenueReportModal: React.FC<TaxRevenueReportModalProps> = ({
  isOpen,
  onClose
}) => {
  const { tuitionPayments, students, branding, updateTuitionPayment, updateBranding } = useData();

  // Date constants
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentQuarter = Math.ceil(currentMonth / 3);

  // Active business facility type (HKD vs Enterprise)
  const initialFacilityType: FacilityTaxType = branding.facilityType || 'household';
  const [selectedFacilityType, setSelectedFacilityType] = useState<FacilityTaxType>(initialFacilityType);

  // Filter State
  const [filter, setFilter] = useState<TaxReportFilterState>({
    facilityType: initialFacilityType,
    periodType: 'month',
    selectedMonth: currentMonth,
    selectedQuarter: currentQuarter,
    selectedYear: currentYear,
    startDate: `${currentYear}-01-01`,
    endDate: `${currentYear}-12-31`,
    revenueSource: 'all',
    paymentMethod: 'all',
    statusFilter: 'all',
    searchQuery: ''
  });

  // Sync facilityType in filter
  const handleFacilityTypeChange = (type: FacilityTaxType) => {
    setSelectedFacilityType(type);
    setFilter((prev) => ({ ...prev, facilityType: type }));
  };

  // Quick Period Selection helpers
  const applyQuickPeriod = (type: 'this_month' | 'q1' | 'q2' | 'q3' | 'q4' | 'whole_year') => {
    if (type === 'this_month') {
      setFilter((prev) => ({
        ...prev,
        periodType: 'month',
        selectedMonth: currentMonth,
        selectedYear: currentYear
      }));
    } else if (type === 'q1') {
      setFilter((prev) => ({
        ...prev,
        periodType: 'quarter',
        selectedQuarter: 1,
        selectedYear: currentYear
      }));
    } else if (type === 'q2') {
      setFilter((prev) => ({
        ...prev,
        periodType: 'quarter',
        selectedQuarter: 2,
        selectedYear: currentYear
      }));
    } else if (type === 'q3') {
      setFilter((prev) => ({
        ...prev,
        periodType: 'quarter',
        selectedQuarter: 3,
        selectedYear: currentYear
      }));
    } else if (type === 'q4') {
      setFilter((prev) => ({
        ...prev,
        periodType: 'quarter',
        selectedQuarter: 4,
        selectedYear: currentYear
      }));
    } else if (type === 'whole_year') {
      setFilter((prev) => ({
        ...prev,
        periodType: 'year',
        selectedYear: currentYear
      }));
    }
  };

  // Inline editing state for individual transactions
  const [editingPayment, setEditingPayment] = useState<TuitionPayment | null>(null);
  const [editPayerName, setEditPayerName] = useState('');
  const [editTaxId, setEditTaxId] = useState('');
  const [editTaxRate, setEditTaxRate] = useState<number>(0);
  const [editRevenueSource, setEditRevenueSource] = useState<'tuition' | 'instruments_books' | 'services_other'>('tuition');
  const [editInvoiceCode, setEditInvoiceCode] = useState('');

  // Business Profile Info Edit State
  const [isEditingBusinessProfile, setIsEditingBusinessProfile] = useState(false);
  const [hkdName, setHkdName] = useState(branding.householdName || branding.centerName || 'HỘ KINH DOANH TRUNG TÂM ÂM NHẠC MINH MUSIC');
  const [hkdOwner, setHkdOwner] = useState(branding.householdOwner || branding.legalRepresentative || 'Nguyễn Văn Minh');
  const [hkdTaxCode, setHkdTaxCode] = useState(branding.householdTaxCode || branding.centerTaxCode || '8499281902');
  const [hkdCccd, setHkdCccd] = useState(branding.householdCccd || '079085012345');
  const [hkdAddress, setHkdAddress] = useState(branding.householdBusinessAddress || branding.address || '123 Đường Âm Nhạc, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh');
  const [hkdMainCareer, setHkdMainCareer] = useState(branding.householdMainCareer || '8559 - Giáo dục khác chưa được phân vào đâu (Đào tạo âm nhạc, dạy đàn, thanh nhạc, bán lẻ nhạc cụ)');

  const [companyName, setCompanyName] = useState(branding.companyName || 'CÔNG TY TNHH GIÁO DỤC ÂM NHẠC MINH MUSIC');
  const [companyTaxCode, setCompanyTaxCode] = useState(branding.companyTaxCode || branding.centerTaxCode || '0316889988');
  const [companyAddress, setCompanyAddress] = useState(branding.companyAddress || branding.address || '123 Đường Âm Nhạc, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh');
  const [legalRep, setLegalRep] = useState(branding.legalRepresentative || 'Nguyễn Văn Minh');
  const [chiefAccountant, setChiefAccountant] = useState(branding.chiefAccountant || 'Trần Thị Thu Thủy');

  // Compute records & summaries
  const { records, summary } = useMemo(() => {
    return filterAndBuildTaxRecords(tuitionPayments, students, filter);
  }, [tuitionPayments, students, filter]);

  if (!isOpen) return null;

  const handleExportHouseholdExcel = () => {
    exportHouseholdTaxReportToExcel(records, summary, filter, branding);
  };

  const handleExportEnterpriseExcel = () => {
    exportEnterpriseTaxReportToExcel(records, summary, filter, branding);
  };

  const handleExportSmartExcel = () => {
    exportTaxReportToExcel(records, summary, filter, branding, selectedFacilityType);
  };

  const handleExportCSV = () => {
    exportTaxReportToCSV(records, summary, filter, branding, selectedFacilityType);
  };

  const handlePrintPDF = () => {
    printTaxReportPDF(records, summary, filter, branding, selectedFacilityType);
  };

  const openQuickEdit = (rec: TaxRevenueRecord) => {
    const rawPayment = tuitionPayments.find((p) => p.id === rec.id);
    if (!rawPayment) return;

    setEditingPayment(rawPayment);
    setEditPayerName(rawPayment.payerName || rec.payerOrStudentName);
    setEditTaxId(rawPayment.taxIdOrCccd || (rec.taxIdOrCccd !== '---' ? rec.taxIdOrCccd : ''));
    setEditTaxRate(rec.taxRatePercent);
    setEditRevenueSource((rawPayment.revenueSource as any) || 'tuition');
    setEditInvoiceCode(rawPayment.invoiceCode || rec.invoiceCode);
  };

  const saveQuickEdit = () => {
    if (!editingPayment) return;

    const totalAmount = editingPayment.amount;
    let preTax = totalAmount;
    let taxAmount = 0;

    if (editTaxRate > 0) {
      preTax = Math.round(totalAmount / (1 + editTaxRate / 100));
      taxAmount = totalAmount - preTax;
    }

    updateTuitionPayment(editingPayment.id, {
      payerName: editPayerName,
      taxIdOrCccd: editTaxId,
      taxRate: editTaxRate,
      preTaxAmount: preTax,
      taxAmount: taxAmount,
      revenueSource: editRevenueSource,
      invoiceCode: editInvoiceCode
    });

    setEditingPayment(null);
  };

  const saveBusinessProfileInfo = () => {
    updateBranding({
      facilityType: selectedFacilityType,
      householdName: hkdName,
      householdOwner: hkdOwner,
      householdTaxCode: hkdTaxCode,
      householdCccd: hkdCccd,
      householdBusinessAddress: hkdAddress,
      householdMainCareer: hkdMainCareer,
      companyName,
      companyTaxCode,
      companyAddress,
      centerTaxCode: selectedFacilityType === 'household' ? hkdTaxCode : companyTaxCode,
      legalRepresentative: legalRep,
      chiefAccountant
    });
    setIsEditingBusinessProfile(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-7xl max-h-[96vh] flex flex-col overflow-hidden my-auto">
        {/* ============================================================ */}
        {/* MODAL HEADER */}
        {/* ============================================================ */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-sky-500/20 border border-sky-400/30 text-sky-400 rounded-2xl shrink-0 shadow-xs">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black font-heading tracking-wide">
                  Báo Cáo Doanh Thu & Xuất Dữ Liệu Thuế
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-500/30 text-sky-200 border border-sky-400/30 uppercase tracking-wider">
                  {selectedFacilityType === 'household' ? 'Mẫu 01/CNKD (TT 40/2021/TT-BTC)' : 'Mẫu Doanh Nghiệp (TT 80/2021/TT-BTC)'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Chuẩn Luật Thuế VN
                </span>
              </div>
              <p className="text-xs text-sky-200/80 mt-1">
                Kỳ tính thuế: <strong className="text-white font-mono">{getPeriodDisplayText(filter)}</strong> • Đơn vị: {selectedFacilityType === 'household' ? (branding.householdName || branding.centerName) : (branding.companyName || branding.centerName)} (MST: {selectedFacilityType === 'household' ? (branding.householdTaxCode || branding.centerTaxCode || '8499281902') : (branding.companyTaxCode || branding.centerTaxCode || '0316889988')})
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full lg:w-auto justify-end flex-wrap">
            {/* Direct Export Buttons for Both Formats */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
              <button
                onClick={handleExportHouseholdExcel}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedFacilityType === 'household'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                title="Xuất Bảng kê mẫu 01/CNKD cho Hộ Kinh Doanh (Theo TT 40/2021/TT-BTC)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel Mẫu 01/CNKD</span>
              </button>

              <button
                onClick={handleExportEnterpriseExcel}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedFacilityType === 'company'
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                title="Xuất Bảng kê thuế GTGT Hóa đơn cho Doanh Nghiệp (Theo TT 80/2021/TT-BTC)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel Mẫu DN</span>
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Xuất file CSV mã hóa UTF-8 BOM"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <button
              onClick={handlePrintPDF}
              className="px-3 py-2 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title="Xem bản in & Lưu dưới dạng PDF có dấu và chữ ký"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MODAL BODY */}
        {/* ============================================================ */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* 1. FACILITY TYPE & REGISTRATION SELECTOR */}
          <div className="bg-gradient-to-r from-amber-50/80 via-sky-50/60 to-indigo-50/80 dark:from-slate-800/80 dark:to-slate-850 p-4 sm:p-5 rounded-2xl border border-amber-200/80 dark:border-slate-700 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-heading">
                    Loại Hình Cơ Sở & Quy Mô Kê Khai Thuế:
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Hệ thống tự động áp dụng chính sách thuế suất, tỷ lệ thuế TNCN/GTGT và biểu mẫu xuất tương ứng
                </p>
              </div>

              {/* Facility Type Selector Radio Buttons */}
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleFacilityTypeChange('household')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    selectedFacilityType === 'household'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Hộ Kinh Doanh Cá Thể (Mẫu 01/CNKD)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFacilityTypeChange('company')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    selectedFacilityType === 'company'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Doanh Nghiệp / Công Ty (Mẫu Doanh Nghiệp)</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingBusinessProfile(!isEditingBusinessProfile)}
                className="px-3 py-1.5 text-xs font-bold text-sky-700 dark:text-sky-400 bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 rounded-xl hover:bg-sky-50 flex items-center gap-1.5 transition-colors cursor-pointer self-start md:self-auto shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingBusinessProfile ? 'Đóng cấu hình hồ sơ' : 'Chỉnh sửa Hồ Sơ Pháp Nhân'}</span>
              </button>
            </div>

            {/* Editable Profile Drawer */}
            {isEditingBusinessProfile && (
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-sky-200 dark:border-sky-800 shadow-sm space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    <span>Cấu hình thông tin đăng ký thuế cho: {selectedFacilityType === 'household' ? 'HỘ KINH DOANH' : 'DOANH NGHIỆP'}</span>
                  </span>
                  <button
                    onClick={saveBusinessProfileInfo}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Lưu và Áp Dụng Mặc Định</span>
                  </button>
                </div>

                {selectedFacilityType === 'household' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Tên Hộ Kinh Doanh:
                      </label>
                      <input
                        type="text"
                        value={hkdName}
                        onChange={(e) => setHkdName(e.target.value)}
                        placeholder="HỘ KINH DOANH TRUNG TÂM ÂM NHẠC MINH MUSIC"
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Mã Số Thuế Hộ Kinh Doanh:
                      </label>
                      <input
                        type="text"
                        value={hkdTaxCode}
                        onChange={(e) => setHkdTaxCode(e.target.value)}
                        placeholder="8499281902"
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-amber-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Họ Tên Chủ Hộ / Đại Diện:
                      </label>
                      <input
                        type="text"
                        value={hkdOwner}
                        onChange={(e) => setHkdOwner(e.target.value)}
                        placeholder="Nguyễn Văn Minh"
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Số CCCD / CMND Chủ Hộ:
                      </label>
                      <input
                        type="text"
                        value={hkdCccd}
                        onChange={(e) => setHkdCccd(e.target.value)}
                        placeholder="079085012345"
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Địa Điểm Hoạt Động Kinh Doanh:
                      </label>
                      <input
                        type="text"
                        value={hkdAddress}
                        onChange={(e) => setHkdAddress(e.target.value)}
                        placeholder="123 Đường Âm Nhạc, P. Bến Nghé, Q.1, TP.HCM"
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Mã Ngành Nghề Chính:
                      </label>
                      <input
                        type="text"
                        value={hkdMainCareer}
                        onChange={(e) => setHkdMainCareer(e.target.value)}
                        placeholder="8559 - Giáo dục khác chưa được phân vào đâu"
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Tên Doanh Nghiệp / Công Ty:
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="CÔNG TY TNHH GIÁO DỤC ÂM NHẠC MINH MUSIC"
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Mã Số Thuế Doanh Nghiệp (MST):
                      </label>
                      <input
                        type="text"
                        value={companyTaxCode}
                        onChange={(e) => setCompanyTaxCode(e.target.value)}
                        placeholder="0316889988"
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-indigo-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Người Đại Diện Theo Pháp Luật / Giám Đốc:
                      </label>
                      <input
                        type="text"
                        value={legalRep}
                        onChange={(e) => setLegalRep(e.target.value)}
                        placeholder="Nguyễn Văn Minh"
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Kế Toán Trưởng / Người Phụ Trách Kế Toán:
                      </label>
                      <input
                        type="text"
                        value={chiefAccountant}
                        onChange={(e) => setChiefAccountant(e.target.value)}
                        placeholder="Trần Thị Thu Thủy"
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Địa Chỉ Trụ Sở Chính:
                      </label>
                      <input
                        type="text"
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        placeholder="123 Đường Âm Nhạc, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. FILTER CONTROLS & QUICK PERIOD SHORTCUTS */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            {/* Quick Period Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>Chọn nhanh kỳ khai:</span>
                </span>
                <button
                  type="button"
                  onClick={() => applyQuickPeriod('this_month')}
                  className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Tháng Này (T{currentMonth})
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickPeriod('q1')}
                  className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Quý 1 (T1-T3)
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickPeriod('q2')}
                  className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Quý 2 (T4-T6)
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickPeriod('q3')}
                  className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Quý 3 (T7-T9)
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickPeriod('q4')}
                  className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Quý 4 (T10-T12)
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickPeriod('whole_year')}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-extrabold cursor-pointer shadow-2xs"
                >
                  Cả Năm {currentYear}
                </button>
              </div>

              {/* Period Type Switcher */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs overflow-x-auto">
                <button
                  onClick={() => setFilter((prev) => ({ ...prev, periodType: 'month' }))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                    filter.periodType === 'month'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Tháng
                </button>
                <button
                  onClick={() => setFilter((prev) => ({ ...prev, periodType: 'quarter' }))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                    filter.periodType === 'quarter'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Quý
                </button>
                <button
                  onClick={() => setFilter((prev) => ({ ...prev, periodType: 'year' }))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                    filter.periodType === 'year'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Năm
                </button>
                <button
                  onClick={() => setFilter((prev) => ({ ...prev, periodType: 'custom' }))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                    filter.periodType === 'custom'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Khoảng Ngày
                </button>
              </div>
            </div>

            {/* Detailed Filter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {/* Dynamic Period Selectors */}
              {filter.periodType === 'month' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Tháng Kê Khai:</label>
                    <select
                      value={filter.selectedMonth}
                      onChange={(e) => setFilter((prev) => ({ ...prev, selectedMonth: parseInt(e.target.value, 10) }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 cursor-pointer"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          Tháng {m < 10 ? `0${m}` : m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Năm:</label>
                    <select
                      value={filter.selectedYear}
                      onChange={(e) => setFilter((prev) => ({ ...prev, selectedYear: parseInt(e.target.value, 10) }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 cursor-pointer"
                    >
                      {[2024, 2025, 2026, 2027].map((y) => (
                        <option key={y} value={y}>
                          Năm {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {filter.periodType === 'quarter' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Quý Kê Khai:</label>
                    <select
                      value={filter.selectedQuarter}
                      onChange={(e) => setFilter((prev) => ({ ...prev, selectedQuarter: parseInt(e.target.value, 10) }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 cursor-pointer"
                    >
                      <option value={1}>Quý I (T1 - T3)</option>
                      <option value={2}>Quý II (T4 - T6)</option>
                      <option value={3}>Quý III (T7 - T9)</option>
                      <option value={4}>Quý IV (T10 - T12)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Năm:</label>
                    <select
                      value={filter.selectedYear}
                      onChange={(e) => setFilter((prev) => ({ ...prev, selectedYear: parseInt(e.target.value, 10) }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 cursor-pointer"
                    >
                      {[2024, 2025, 2026, 2027].map((y) => (
                        <option key={y} value={y}>
                          Năm {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {filter.periodType === 'year' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Năm Kê Khai:</label>
                  <select
                    value={filter.selectedYear}
                    onChange={(e) => setFilter((prev) => ({ ...prev, selectedYear: parseInt(e.target.value, 10) }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    {[2024, 2025, 2026, 2027].map((y) => (
                      <option key={y} value={y}>
                        Năm {y}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {filter.periodType === 'custom' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Từ ngày:</label>
                    <input
                      type="date"
                      value={filter.startDate}
                      onChange={(e) => setFilter((prev) => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Đến ngày:</label>
                    <input
                      type="date"
                      value={filter.endDate}
                      onChange={(e) => setFilter((prev) => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </>
              )}

              {/* Tách nguồn Doanh thu theo Ngành nghề Thuế */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Ngành Nghề Thuế:</label>
                <select
                  value={filter.revenueSource}
                  onChange={(e) => setFilter((prev) => ({ ...prev, revenueSource: e.target.value as RevenueSourceCategory }))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  <option value="all">Tất cả nguồn thu</option>
                  <option value="tuition">🎓 Dạy nhạc / Học phí (Mã 8559 - KCT GTGT)</option>
                  <option value="instruments_books">🎸 Bán nhạc cụ / Giáo trình (Hàng hóa)</option>
                  <option value="services_other">🏢 Dịch vụ phụ trợ / Khảo thí / Cho thuê</option>
                </select>
              </div>

              {/* Payment Method Category */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Hình Thức TT:</label>
                <select
                  value={filter.paymentMethod}
                  onChange={(e) => setFilter((prev) => ({ ...prev, paymentMethod: e.target.value as TaxPaymentMethodCategory }))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  <option value="all">Tất cả hình thức</option>
                  <option value="bank_transfer">Chuyển khoản / VietQR</option>
                  <option value="cash">Tiền mặt tại quầy</option>
                  <option value="e_wallet">Ví điện tử / Thẻ</option>
                </select>
              </div>

              {/* Search Box */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Tìm kiếm nhanh:</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={filter.searchQuery}
                    onChange={(e) => setFilter((prev) => ({ ...prev, searchQuery: e.target.value }))}
                    placeholder="Mã HĐ, tên, CCCD..."
                    className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. SUMMARY STATS CARDS (SPLIT BY TAX NATURE) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Dạy nhạc / Học phí (Mã 8559) */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Nguồn 1: Dạy Nhạc / Học Phí
                </span>
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-xl">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-heading mt-2">
                {summary.totalEducationRevenue.toLocaleString('vi-VN')} đ
              </p>
              <div className="mt-1 space-y-0.5">
                <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200">
                  ✓ Không chịu thuế GTGT (Mã 8559)
                </span>
                <p className="text-[10px] text-slate-500">
                  {selectedFacilityType === 'household' ? `TNCN HKD (2%): ${Math.round(summary.totalEducationRevenue * 0.02).toLocaleString('vi-VN')} đ` : 'Kê khai chỉ tiêu [26] trên Tờ khai 01/GTGT'}
                </p>
              </div>
            </div>

            {/* Card 2: Bán giáo trình, nhạc cụ & dịch vụ phụ trợ */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Nguồn 2: Nhạc Cụ & Dịch Vụ
                </span>
                <div className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-xl">
                  <Music className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-black text-amber-700 dark:text-amber-400 font-heading mt-2">
                {(summary.totalGoodsRevenue + summary.totalServicesRevenue).toLocaleString('vi-VN')} đ
              </p>
              <div className="mt-1 space-y-0.5">
                <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200">
                  Phân phối hàng hóa & Dịch vụ
                </span>
                <p className="text-[10px] text-slate-500">
                  {selectedFacilityType === 'household'
                    ? `Thuế HKD (1% - 5%): ${(summary.totalVatHousehold + (summary.totalPitHousehold - Math.round(summary.totalEducationRevenue * 0.02))).toLocaleString('vi-VN')} đ`
                    : `GTGT đầu ra: ${summary.totalVatEnterprise.toLocaleString('vi-VN')} đ`}
                </p>
              </div>
            </div>

            {/* Card 3: Tổng Thực Thu Toàn Bộ */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-sky-200 dark:border-sky-900/60 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Tổng Doanh Thu Thực Thu
                </span>
                <div className="p-2 bg-sky-100 dark:bg-sky-950 text-sky-600 rounded-xl">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-black text-sky-700 dark:text-sky-400 font-heading mt-2">
                {summary.totalRevenue.toLocaleString('vi-VN')} đ
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 italic line-clamp-1" title={vietnameseNumberToWords(summary.totalRevenue)}>
                {vietnameseNumberToWords(summary.totalRevenue)}
              </p>
            </div>

            {/* Card 4: Nghĩa vụ thuế ước tính */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {selectedFacilityType === 'household' ? 'Tổng Thuế Hộ Kinh Doanh' : 'Tổng Thuế GTGT Doanh Nghiệp'}
                </span>
                <div className="p-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 rounded-xl">
                  <FileCheck2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-black text-indigo-700 dark:text-indigo-400 font-heading mt-2">
                {selectedFacilityType === 'household'
                  ? `${summary.totalTaxHousehold.toLocaleString('vi-VN')} đ`
                  : `${summary.totalVatEnterprise.toLocaleString('vi-VN')} đ`}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                {selectedFacilityType === 'household'
                  ? `GTGT: ${summary.totalVatHousehold.toLocaleString('vi-VN')} đ | TNCN: ${summary.totalPitHousehold.toLocaleString('vi-VN')} đ`
                  : `DT chưa thuế: ${summary.totalPreTax.toLocaleString('vi-VN')} đ`}
              </p>
            </div>
          </div>

          {/* 4. TAX COMPLIANCE BREAKDOWN SUMMARY TABLE */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-md border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Bảng Phân Bổ Nghĩa Vụ Thuế Theo Quy Định Hiện Hành ({selectedFacilityType === 'household' ? 'Hộ Kinh Doanh - TT 40/2021/TT-BTC' : 'Doanh Nghiệp - TT 80/2021/TT-BTC'})
                </h4>
              </div>
              <span className="text-[11px] font-mono text-sky-300">
                Tổng cộng: {summary.paidCount} giao dịch đã hoàn tất
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-400 font-bold border-b border-slate-800">
                    <th className="py-2 px-2">Nhóm Doanh Thu</th>
                    <th className="py-2 px-2">Căn Cứ Pháp Lý & Thuế Suất</th>
                    <th className="py-2 px-2 text-right">Doanh Thu (VNĐ)</th>
                    {selectedFacilityType === 'household' ? (
                      <>
                        <th className="py-2 px-2 text-center">Thuế GTGT</th>
                        <th className="py-2 px-2 text-right">Tiền GTGT</th>
                        <th className="py-2 px-2 text-center">Thuế TNCN</th>
                        <th className="py-2 px-2 text-right">Tiền TNCN</th>
                        <th className="py-2 px-2 text-right text-amber-300 font-bold">Tổng Thuế HKD</th>
                      </>
                    ) : (
                      <>
                        <th className="py-2 px-2 text-center">Chỉ Tiêu Tờ Khai 01/GTGT</th>
                        <th className="py-2 px-2 text-center">Thuế Suất GTGT</th>
                        <th className="py-2 px-2 text-right text-indigo-300 font-bold">Thuế GTGT Đầu Ra</th>
                        <th className="py-2 px-2 text-right text-emerald-300 font-bold">Tổng Thanh Toán</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {/* Nhóm 1: Dạy nhạc */}
                  <tr className="hover:bg-white/5">
                    <td className="py-2 px-2 font-sans font-semibold text-emerald-300">
                      1. Dạy nhạc / Học phí (Mã ngành 8559)
                    </td>
                    <td className="py-2 px-2 font-sans text-slate-300">
                      Không chịu thuế GTGT (Khoản 13 Đ4 TT 219/2013)
                    </td>
                    <td className="py-2 px-2 text-right font-bold">
                      {summary.totalEducationRevenue.toLocaleString('vi-VN')} đ
                    </td>
                    {selectedFacilityType === 'household' ? (
                      <>
                        <td className="py-2 px-2 text-center text-slate-400">0%</td>
                        <td className="py-2 px-2 text-right text-slate-400">0 đ</td>
                        <td className="py-2 px-2 text-center text-amber-300">2.0%</td>
                        <td className="py-2 px-2 text-right text-amber-300">
                          {Math.round(summary.totalEducationRevenue * 0.02).toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-amber-400">
                          {Math.round(summary.totalEducationRevenue * 0.02).toLocaleString('vi-VN')} đ
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 px-2 text-center text-slate-300 font-sans">Chỉ tiêu [26]</td>
                        <td className="py-2 px-2 text-center text-slate-400 font-sans">KCT (0%)</td>
                        <td className="py-2 px-2 text-right text-slate-400">0 đ</td>
                        <td className="py-2 px-2 text-right font-bold text-emerald-400">
                          {summary.totalEducationRevenue.toLocaleString('vi-VN')} đ
                        </td>
                      </>
                    )}
                  </tr>

                  {/* Nhóm 2: Hàng hóa */}
                  <tr className="hover:bg-white/5">
                    <td className="py-2 px-2 font-sans font-semibold text-amber-300">
                      2. Phân phối nhạc cụ, giáo trình, phụ kiện
                    </td>
                    <td className="py-2 px-2 font-sans text-slate-300">
                      Phân phối hàng hóa (HKD: GTGT 1%, TNCN 0.5% | DN: GTGT 8%)
                    </td>
                    <td className="py-2 px-2 text-right font-bold">
                      {summary.totalGoodsRevenue.toLocaleString('vi-VN')} đ
                    </td>
                    {selectedFacilityType === 'household' ? (
                      <>
                        <td className="py-2 px-2 text-center text-emerald-300">1.0%</td>
                        <td className="py-2 px-2 text-right text-emerald-300">
                          {Math.round(summary.totalGoodsRevenue * 0.01).toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-2 px-2 text-center text-amber-300">0.5%</td>
                        <td className="py-2 px-2 text-right text-amber-300">
                          {Math.round(summary.totalGoodsRevenue * 0.005).toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-amber-400">
                          {(Math.round(summary.totalGoodsRevenue * 0.01) + Math.round(summary.totalGoodsRevenue * 0.005)).toLocaleString('vi-VN')} đ
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 px-2 text-center text-slate-300 font-sans">Chỉ tiêu [32a]</td>
                        <td className="py-2 px-2 text-center text-sky-300 font-sans">8%</td>
                        <td className="py-2 px-2 text-right text-indigo-300">
                          {(summary.totalGoodsRevenue - summary.totalGoodsPreTax).toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-emerald-400">
                          {summary.totalGoodsRevenue.toLocaleString('vi-VN')} đ
                        </td>
                      </>
                    )}
                  </tr>

                  {/* Nhóm 3: Dịch vụ khác */}
                  <tr className="hover:bg-white/5">
                    <td className="py-2 px-2 font-sans font-semibold text-sky-300">
                      3. Dịch vụ phụ trợ / Cho thuê phòng tập / Khảo thí
                    </td>
                    <td className="py-2 px-2 font-sans text-slate-300">
                      Dịch vụ khác (HKD: GTGT 5%, TNCN 2% | DN: GTGT 10%)
                    </td>
                    <td className="py-2 px-2 text-right font-bold">
                      {summary.totalServicesRevenue.toLocaleString('vi-VN')} đ
                    </td>
                    {selectedFacilityType === 'household' ? (
                      <>
                        <td className="py-2 px-2 text-center text-emerald-300">5.0%</td>
                        <td className="py-2 px-2 text-right text-emerald-300">
                          {Math.round(summary.totalServicesRevenue * 0.05).toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-2 px-2 text-center text-amber-300">2.0%</td>
                        <td className="py-2 px-2 text-right text-amber-300">
                          {Math.round(summary.totalServicesRevenue * 0.02).toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-amber-400">
                          {(Math.round(summary.totalServicesRevenue * 0.05) + Math.round(summary.totalServicesRevenue * 0.02)).toLocaleString('vi-VN')} đ
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 px-2 text-center text-slate-300 font-sans">Chỉ tiêu [32]</td>
                        <td className="py-2 px-2 text-center text-sky-300 font-sans">10%</td>
                        <td className="py-2 px-2 text-right text-indigo-300">
                          {(summary.totalServicesRevenue - summary.totalServicesPreTax).toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-emerald-400">
                          {summary.totalServicesRevenue.toLocaleString('vi-VN')} đ
                        </td>
                      </>
                    )}
                  </tr>

                  {/* Tổng cộng */}
                  <tr className="bg-white/10 font-bold">
                    <td colSpan={2} className="py-2.5 px-2 text-white uppercase font-sans">
                      TỔNG CỘNG NGHĨA VỤ THUẾ PHẢI NỘP TRONG KỲ
                    </td>
                    <td className="py-2.5 px-2 text-right text-white">
                      {summary.totalRevenue.toLocaleString('vi-VN')} đ
                    </td>
                    {selectedFacilityType === 'household' ? (
                      <>
                        <td></td>
                        <td className="py-2.5 px-2 text-right text-emerald-300">
                          {summary.totalVatHousehold.toLocaleString('vi-VN')} đ
                        </td>
                        <td></td>
                        <td className="py-2.5 px-2 text-right text-amber-300">
                          {summary.totalPitHousehold.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-2.5 px-2 text-right text-amber-300 text-sm">
                          {summary.totalTaxHousehold.toLocaleString('vi-VN')} đ
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2.5 px-2 text-center text-slate-300 font-sans">[34] & [35]</td>
                        <td></td>
                        <td className="py-2.5 px-2 text-right text-indigo-300 text-sm">
                          {summary.totalVatEnterprise.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-2.5 px-2 text-right text-emerald-300 text-sm">
                          {summary.totalRevenue.toLocaleString('vi-VN')} đ
                        </td>
                      </>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. TAX COMPLIANCE TRANSACTION TABLE */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-800/40">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white font-heading">
                  Bảng Kê Chi Tiết Giao Dịch & Biên Nhận Thu ({records.length} Bản Ghi)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Phân loại chi tiết từng khoản thu theo quy định mã ngành 8559 và hàng hóa dịch vụ
                </p>
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Đã thu: {summary.paidCount} | Chờ thu: {summary.pendingCount} | Hoàn tiền: {summary.refundedCount}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold uppercase border-b border-slate-200 dark:border-slate-700">
                    <th className="py-3 px-3 text-center w-10">STT</th>
                    <th className="py-3 px-3">Mã Hóa Đơn</th>
                    <th className="py-3 px-3">Ngày Kê Khai</th>
                    <th className="py-3 px-3">Người Nộp / Học Viên</th>
                    <th className="py-3 px-3">Mã Số Thuế / CCCD</th>
                    <th className="py-3 px-3 min-w-[180px]">Nội Dung Thu</th>
                    <th className="py-3 px-3">Nhóm Ngành Thuế</th>
                    <th className="py-3 px-3 text-right font-black text-slate-900 dark:text-white">Thực Thu (VNĐ)</th>
                    {selectedFacilityType === 'household' ? (
                      <>
                        <th className="py-3 px-3 text-right">Thuế GTGT</th>
                        <th className="py-3 px-3 text-right">Thuế TNCN</th>
                        <th className="py-3 px-3 text-right text-amber-700 dark:text-amber-400 font-bold">Tổng Thuế HKD</th>
                      </>
                    ) : (
                      <>
                        <th className="py-3 px-3 text-right">Trước Thuế</th>
                        <th className="py-3 px-3 text-center">Thuế %</th>
                        <th className="py-3 px-3 text-right text-indigo-700 dark:text-indigo-400 font-bold">Thuế GTGT</th>
                      </>
                    )}
                    <th className="py-3 px-3">Hình Thức</th>
                    <th className="py-3 px-3 text-center">Trạng Thái</th>
                    <th className="py-3 px-3 text-center">Sửa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="py-8 text-center text-slate-400">
                        Không có dữ liệu phát sinh trong kỳ kê khai này. Vui lòng thay đổi bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    records.map((r) => (
                      <tr
                        key={r.id}
                        className="hover:bg-sky-50/40 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <td className="py-3 px-3 text-center font-mono text-slate-400">{r.stt}</td>

                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-sky-900 bg-sky-100 dark:bg-sky-950 dark:text-sky-300 px-2 py-0.5 rounded text-[11px]">
                            {r.invoiceCode}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                          {r.paymentDate}
                        </td>

                        <td className="py-3 px-3">
                          <strong className="text-slate-900 dark:text-white block">{r.payerOrStudentName}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">HV: {r.studentCode || 'HV---'}</span>
                        </td>

                        <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                          {r.taxIdOrCccd !== '---' ? (
                            <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                              {r.taxIdOrCccd}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">---</span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                            {r.revenueContent}
                          </p>
                          {r.notes && <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{r.notes}</p>}
                        </td>

                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                            r.taxGroup === 'education_8559'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : r.taxGroup === 'goods_retail'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                          }`}>
                            {r.taxGroup === 'education_8559' ? 'Dạy nhạc 8559' : r.taxGroup === 'goods_retail' ? 'Nhạc cụ/Sách' : 'Dịch vụ phụ trợ'}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-black text-slate-900 dark:text-white text-[12px]">
                          <span className={r.isRefunded ? 'text-rose-600' : 'text-emerald-700 dark:text-emerald-400'}>
                            {r.totalCollectedAmount.toLocaleString('vi-VN')} đ
                          </span>
                        </td>

                        {selectedFacilityType === 'household' ? (
                          <>
                            <td className="py-3 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                              {r.taxGroup === 'goods_retail' ? `${Math.round(r.totalCollectedAmount * 0.01).toLocaleString('vi-VN')} đ` : r.taxGroup === 'services_auxiliary' ? `${Math.round(r.totalCollectedAmount * 0.05).toLocaleString('vi-VN')} đ` : '0 đ'}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-amber-700 dark:text-amber-400">
                              {r.pitTaxAmount.toLocaleString('vi-VN')} đ
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-amber-800 dark:text-amber-300">
                              {r.totalTaxObligation.toLocaleString('vi-VN')} đ
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                              {r.preTaxAmount.toLocaleString('vi-VN')} đ
                            </td>
                            <td className="py-3 px-3 text-center font-mono font-bold text-sky-700 dark:text-sky-400">
                              {r.taxRatePercent}%
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-indigo-700 dark:text-indigo-400">
                              {r.taxAmount > 0 ? `${r.taxAmount.toLocaleString('vi-VN')} đ` : '0 đ'}
                            </td>
                          </>
                        )}

                        <td className="py-3 px-3">
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            {r.paymentMethodDisplay}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                              r.isRefunded
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : r.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {r.statusDisplay}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => openQuickEdit(r)}
                            className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Điều chỉnh thông tin kê khai của giao dịch này"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MODAL FOOTER */}
        {/* ============================================================ */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-500 shrink-0" />
            <span>
              Chế độ hiện tại: <strong className="text-slate-800 dark:text-slate-200">{selectedFacilityType === 'household' ? 'Hộ Kinh Doanh (Mẫu 01/CNKD)' : 'Doanh Nghiệp / Công Ty (Mẫu DN)'}</strong>. Bấm nút tương ứng để xuất file Excel chuẩn.
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            <button
              onClick={handleExportHouseholdExcel}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Xuất Excel HKD (01/CNKD)</span>
            </button>

            <button
              onClick={handleExportEnterpriseExcel}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Xuất Excel Doanh Nghiệp</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* INLINE TRANSACTION EDIT MODAL */}
      {/* ============================================================ */}
      {editingPayment && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-900 dark:text-white font-heading flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-sky-600" />
                <span>Chỉnh Sửa Thông Tin Kê Khai Thuế</span>
              </h3>
              <button
                onClick={() => setEditingPayment(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mã Hóa Đơn / Chứng Từ:
                </label>
                <input
                  type="text"
                  value={editInvoiceCode}
                  onChange={(e) => setEditInvoiceCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-sky-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Người Nộp Thuế / Học Viên:
                </label>
                <input
                  type="text"
                  value={editPayerName}
                  onChange={(e) => setEditPayerName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mã Số Thuế Cá Nhân / Số CCCD:
                </label>
                <input
                  type="text"
                  value={editTaxId}
                  onChange={(e) => setEditTaxId(e.target.value)}
                  placeholder="Nhập MST cá nhân hoặc số CCCD 12 số"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nhóm Nguồn Thu:
                  </label>
                  <select
                    value={editRevenueSource}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setEditRevenueSource(val);
                      if (val === 'tuition') setEditTaxRate(0);
                      else if (val === 'instruments_books') setEditTaxRate(8);
                      else setEditTaxRate(10);
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium cursor-pointer"
                  >
                    <option value="tuition">Dạy nhạc / Học phí (Mã 8559)</option>
                    <option value="instruments_books">Bán nhạc cụ / Giáo trình</option>
                    <option value="services_other">Dịch vụ phụ trợ khác</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Thuế Suất GTGT (%):
                  </label>
                  <select
                    value={editTaxRate}
                    onChange={(e) => setEditTaxRate(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold cursor-pointer"
                  >
                    <option value={0}>0% (Không chịu thuế)</option>
                    <option value={8}>8% (Nhạc cụ, giáo trình)</option>
                    <option value={10}>10% (Dịch vụ, khảo thí)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingPayment(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={saveQuickEdit}
                className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs cursor-pointer"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
