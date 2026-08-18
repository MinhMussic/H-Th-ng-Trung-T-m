import * as XLSX from 'xlsx';
import {
  TuitionPayment,
  Student,
  TenantBranding,
  TaxReportFilterState,
  TaxRevenueRecord,
  RevenueSourceCategory,
  TaxPaymentMethodCategory,
  TaxPeriodType,
  FacilityTaxType
} from '../types';
import { downloadCSV } from './exportReports';

/**
 * Convert Vietnamese number to words (Đọc số tiền thành chữ tiếng Việt chuẩn xác)
 */
export const vietnameseNumberToWords = (num: number): string => {
  if (!num || isNaN(num) || num === 0) return 'Không đồng';
  const isNegative = num < 0;
  let absNum = Math.abs(Math.round(num));

  const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];

  const readThreeDigits = (n: number, isHighestGroup = false): string => {
    let result = '';
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (h === 0 && t === 0 && u === 0) return '';

    if (h > 0 || !isHighestGroup) {
      result += `${digits[h]} trăm `;
    }

    if (t > 1) {
      result += `${digits[t]} mươi `;
      if (u === 1) result += 'mốt ';
      else if (u === 4) result += 'tư ';
      else if (u === 5) result += 'lăm ';
      else if (u > 0) result += `${digits[u]} `;
    } else if (t === 1) {
      result += 'mười ';
      if (u === 1) result += 'một ';
      else if (u === 4) result += 'bốn ';
      else if (u === 5) result += 'lăm ';
      else if (u > 0) result += `${digits[u]} `;
    } else if (t === 0) {
      if (u > 0) {
        if (h > 0 || !isHighestGroup) result += `lẻ ${digits[u]} `;
        else result += `${digits[u]} `;
      }
    }

    return result.trim();
  };

  const groups: number[] = [];
  while (absNum > 0) {
    groups.push(absNum % 1000);
    absNum = Math.floor(absNum / 1000);
  }

  let words = '';
  for (let i = groups.length - 1; i >= 0; i--) {
    const groupVal = groups[i];
    if (groupVal > 0) {
      const isHighest = i === groups.length - 1;
      const groupWords = readThreeDigits(groupVal, isHighest);
      words += `${groupWords} ${units[i]} `;
    }
  }

  words = words.trim();
  if (!words) return 'Không đồng';

  // Capitalize first letter
  const finalStr = words.charAt(0).toUpperCase() + words.slice(1) + ' đồng' + (isNegative ? ' (âm)' : '');
  return finalStr.replace(/\s+/g, ' ');
};

/**
 * Get period title display in Vietnamese
 */
export const getPeriodDisplayText = (filter: TaxReportFilterState): string => {
  if (filter.periodType === 'month') {
    return `Tháng ${filter.selectedMonth.toString().padStart(2, '0')}/${filter.selectedYear}`;
  }
  if (filter.periodType === 'quarter') {
    return `Quý ${filter.selectedQuarter}/${filter.selectedYear}`;
  }
  if (filter.periodType === 'year') {
    return `Năm ${filter.selectedYear}`;
  }
  return `Từ ngày ${filter.startDate} đến ngày ${filter.endDate}`;
};

/**
 * Map payment category to human readable Vietnamese name
 */
export const getRevenueCategoryLabel = (source?: string): string => {
  switch (source) {
    case 'tuition':
      return 'Dạy nhạc / Học phí (Mã ngành 8559 - Đào tạo)';
    case 'instruments_books':
      return 'Bán giáo trình / Nhạc cụ / Phụ kiện';
    case 'services_other':
      return 'Dịch vụ phụ trợ & Khảo thí';
    default:
      return 'Dạy nhạc / Học phí (Mã ngành 8559 - Đào tạo)';
  }
};

/**
 * Filter and compute tax compliance records for both Hộ Kinh Doanh and Doanh Nghiệp
 */
export const filterAndBuildTaxRecords = (
  payments: TuitionPayment[],
  students: Student[],
  filter: TaxReportFilterState
): {
  records: TaxRevenueRecord[];
  summary: {
    totalCount: number;
    totalRevenue: number;
    totalPreTax: number;
    // Tách nguồn doanh thu
    totalEducationRevenue: number; // Nguồn 1: Dạy nhạc (Mã ngành 8559) - KCT GTGT
    totalGoodsRevenue: number; // Nguồn 2: Bán nhạc cụ, sách giáo trình
    totalGoodsPreTax: number;
    totalServicesRevenue: number; // Nguồn 3: Dịch vụ phụ trợ / cho thuê / khảo thí
    totalServicesPreTax: number;
    // Nghĩa vụ thuế Hộ Kinh Doanh (TT 40/2021/TT-BTC)
    totalVatHousehold: number; // Tổng thuế GTGT HKD
    totalPitHousehold: number; // Tổng thuế TNCN HKD
    totalTaxHousehold: number; // Tổng nghĩa vụ thuế HKD (GTGT + TNCN)
    // Nghĩa vụ thuế Doanh Nghiệp (TT 80/2021/TT-BTC)
    totalVatEnterprise: number; // Thuế GTGT đầu ra Doanh Nghiệp (8% hoặc 10%)
    totalTax: number; // Standard fallback
    // Payment breakdown
    totalCash: number;
    totalBankTransfer: number;
    totalEWallet: number;
    paidCount: number;
    pendingCount: number;
    refundedCount: number;
    refundedAmount: number;
    taxZeroCount: number;
    taxPositiveCount: number;
  };
} => {
  const records: TaxRevenueRecord[] = [];

  payments.forEach((p) => {
    // 1. Date filter
    const paymentDateStr = p.paymentDate || p.dueDate || '';
    if (!paymentDateStr) return;

    const [yearStr, monthStr] = paymentDateStr.split('-');
    const itemYear = parseInt(yearStr, 10);
    const itemMonth = parseInt(monthStr, 10);
    const itemQuarter = Math.ceil(itemMonth / 3);

    if (filter.periodType === 'month') {
      if (itemYear !== filter.selectedYear || itemMonth !== filter.selectedMonth) return;
    } else if (filter.periodType === 'quarter') {
      if (itemYear !== filter.selectedYear || itemQuarter !== filter.selectedQuarter) return;
    } else if (filter.periodType === 'year') {
      if (itemYear !== filter.selectedYear) return;
    } else if (filter.periodType === 'custom') {
      if (filter.startDate && paymentDateStr < filter.startDate) return;
      if (filter.endDate && paymentDateStr > filter.endDate) return;
    }

    // 2. Revenue source filter
    const itemSource: RevenueSourceCategory = (p.revenueSource as RevenueSourceCategory) || 'tuition';
    if (filter.revenueSource !== 'all' && itemSource !== filter.revenueSource) {
      return;
    }

    // 3. Payment Method category
    const rawMethod = (p.paymentMethod || '').toLowerCase();
    let methodCategory: 'bank_transfer' | 'cash' | 'e_wallet' = 'bank_transfer';
    if (p.paymentMethodCategory) {
      if (p.paymentMethodCategory === 'cash') methodCategory = 'cash';
      else if (p.paymentMethodCategory === 'e_wallet') methodCategory = 'e_wallet';
      else methodCategory = 'bank_transfer';
    } else {
      if (rawMethod.includes('tiền mặt') || rawMethod.includes('cash')) {
        methodCategory = 'cash';
      } else if (rawMethod.includes('momo') || rawMethod.includes('zalo') || rawMethod.includes('ví') || rawMethod.includes('wallet')) {
        methodCategory = 'e_wallet';
      } else {
        methodCategory = 'bank_transfer';
      }
    }

    if (filter.paymentMethod !== 'all' && methodCategory !== filter.paymentMethod) {
      return;
    }

    // 4. Status filter
    const isRefunded = p.status === 'refunded' || Boolean(p.isRefunded);
    const isPaid = p.status === 'paid' || p.status === 'completed';
    const isPending = p.status === 'pending' || p.status === 'overdue';

    if (filter.statusFilter === 'paid' && (!isPaid || isRefunded)) return;
    if (filter.statusFilter === 'refunded' && !isRefunded) return;
    if (filter.statusFilter === 'pending' && !isPending) return;

    // 5. Search query
    const student = students.find((s) => s.id === p.studentId);
    const studentName = p.studentName || student?.fullName || '';
    const studentCode = p.studentCode || student?.code || '';
    const payerName = p.payerName || studentName;
    const taxId = p.taxIdOrCccd || student?.citizenId || student?.taxId || '';
    const invoiceCode = p.invoiceCode || p.code || `HD-${p.id.slice(-6).toUpperCase()}`;
    const revenueContent = p.courseName || p.subjectName || p.invoiceNote || (itemSource === 'instruments_books' ? 'Bán nhạc cụ & giáo trình' : 'Thu học phí khóa học');

    if (filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase().trim();
      const match =
        studentName.toLowerCase().includes(q) ||
        payerName.toLowerCase().includes(q) ||
        studentCode.toLowerCase().includes(q) ||
        taxId.toLowerCase().includes(q) ||
        invoiceCode.toLowerCase().includes(q) ||
        revenueContent.toLowerCase().includes(q);
      if (!match) return;
    }

    // 6. Tax calculation according to Vietnamese Tax Law (TT 40/2021/TT-BTC for HKD & TT 80/2021/TT-BTC for Enterprise)
    const totalAmount = p.amount || 0;
    let taxGroup: 'education_8559' | 'goods_retail' | 'services_auxiliary' = 'education_8559';
    let taxGroupLabel = 'Mã 8559 - Đào tạo / Học phí (Không chịu thuế GTGT)';
    let vatRateEnterprise = 0;
    let vatAmountEnterprise = 0;
    let preTaxAmount = totalAmount;
    let pitRateHousehold = 0;
    let pitAmountHousehold = 0;
    let vatRateHousehold = 0;
    let vatAmountHousehold = 0;

    if (itemSource === 'tuition') {
      // Nguồn 1: Dạy nhạc / Học phí (Mã ngành 8559 - Giáo dục/Đào tạo)
      // GTGT: Không chịu thuế (KCT)
      // HKD: TNCN 2% theo tỷ lệ dịch vụ đào tạo
      taxGroup = 'education_8559';
      taxGroupLabel = 'Mã 8559 - Dạy nhạc / Học phí (KCT GTGT, TNCN 2%)';
      vatRateEnterprise = 0;
      vatAmountEnterprise = 0;
      preTaxAmount = totalAmount;
      vatRateHousehold = 0;
      vatAmountHousehold = 0;
      pitRateHousehold = 2.0; // 2% TNCN HKD
      pitAmountHousehold = Math.round(totalAmount * 0.02);
    } else if (itemSource === 'instruments_books') {
      // Nguồn 2: Bán giáo trình, bán/cho thuê nhạc cụ, phụ kiện (Phân phối hàng hóa)
      // GTGT DN: 8% (hoặc 10%)
      // HKD: GTGT 1%, TNCN 0.5%
      taxGroup = 'goods_retail';
      taxGroupLabel = 'Phân phối hàng hóa / Nhạc cụ / Giáo trình (GTGT 8%, HKD 1.5%)';
      vatRateEnterprise = p.taxRate ?? 8;
      preTaxAmount = Math.round(totalAmount / (1 + vatRateEnterprise / 100));
      vatAmountEnterprise = totalAmount - preTaxAmount;
      vatRateHousehold = 1.0; // 1% GTGT HKD
      vatAmountHousehold = Math.round(totalAmount * 0.01);
      pitRateHousehold = 0.5; // 0.5% TNCN HKD
      pitAmountHousehold = Math.round(totalAmount * 0.005);
    } else {
      // Nguồn 3: Dịch vụ phụ trợ khác, cho thuê phòng tập, tổ chức khảo thí
      // GTGT DN: 10%
      // HKD: GTGT 5%, TNCN 2%
      taxGroup = 'services_auxiliary';
      taxGroupLabel = 'Dịch vụ phụ trợ / Khảo thí / Cho thuê (GTGT 10%, HKD 7%)';
      vatRateEnterprise = p.taxRate ?? 10;
      preTaxAmount = Math.round(totalAmount / (1 + vatRateEnterprise / 100));
      vatAmountEnterprise = totalAmount - preTaxAmount;
      vatRateHousehold = 5.0; // 5% GTGT HKD
      vatAmountHousehold = Math.round(totalAmount * 0.05);
      pitRateHousehold = 2.0; // 2% TNCN HKD
      pitAmountHousehold = Math.round(totalAmount * 0.02);
    }

    const totalTaxObligation = vatAmountHousehold + pitAmountHousehold;

    let statusDisplay = 'Đã thu';
    if (isRefunded) statusDisplay = 'Hoàn tiền';
    else if (isPending) statusDisplay = 'Chờ nộp';

    let methodDisplay = 'Chuyển khoản / VietQR';
    if (methodCategory === 'cash') methodDisplay = 'Tiền mặt';
    else if (methodCategory === 'e_wallet') methodDisplay = 'Ví điện tử';

    records.push({
      stt: 0, // will re-index
      id: p.id,
      invoiceCode,
      paymentDate: paymentDateStr,
      payerOrStudentName: payerName,
      studentCode,
      taxIdOrCccd: taxId || '---',
      revenueContent,
      revenueCategoryName: getRevenueCategoryLabel(itemSource),
      taxGroup,
      taxGroupLabel,
      preTaxAmount: isRefunded ? -preTaxAmount : preTaxAmount,
      taxRatePercent: vatRateEnterprise,
      taxAmount: isRefunded ? -vatAmountEnterprise : vatAmountEnterprise,
      pitTaxRatePercent: pitRateHousehold,
      pitTaxAmount: isRefunded ? -pitAmountHousehold : pitAmountHousehold,
      totalTaxObligation: isRefunded ? -totalTaxObligation : totalTaxObligation,
      totalCollectedAmount: isRefunded ? -totalAmount : totalAmount,
      paymentMethodDisplay: methodDisplay,
      paymentMethodCategory: methodCategory,
      status: isRefunded ? 'refunded' : isPaid ? 'paid' : 'pending',
      statusDisplay,
      isRefunded,
      notes: p.invoiceNote || (p.transferSyntax ? `Cú pháp: ${p.transferSyntax}` : '')
    });
  });

  // Sort by date ascending
  records.sort((a, b) => a.paymentDate.localeCompare(b.paymentDate));
  records.forEach((r, idx) => {
    r.stt = idx + 1;
  });

  // Calculate summaries
  let totalRevenue = 0;
  let totalPreTax = 0;
  let totalEducationRevenue = 0;
  let totalGoodsRevenue = 0;
  let totalGoodsPreTax = 0;
  let totalServicesRevenue = 0;
  let totalServicesPreTax = 0;
  let totalVatEnterprise = 0;
  let totalVatHousehold = 0;
  let totalPitHousehold = 0;
  let totalCash = 0;
  let totalBankTransfer = 0;
  let totalEWallet = 0;
  let paidCount = 0;
  let pendingCount = 0;
  let refundedCount = 0;
  let refundedAmount = 0;
  let taxZeroCount = 0;
  let taxPositiveCount = 0;

  records.forEach((r) => {
    if (r.status === 'paid') {
      paidCount++;
      totalRevenue += r.totalCollectedAmount;
      totalPreTax += r.preTaxAmount;
      totalVatEnterprise += r.taxAmount;

      if (r.taxGroup === 'education_8559') {
        totalEducationRevenue += r.totalCollectedAmount;
        totalPitHousehold += r.pitTaxAmount;
        taxZeroCount++;
      } else if (r.taxGroup === 'goods_retail') {
        totalGoodsRevenue += r.totalCollectedAmount;
        totalGoodsPreTax += r.preTaxAmount;
        totalVatHousehold += Math.round(r.totalCollectedAmount * 0.01);
        totalPitHousehold += Math.round(r.totalCollectedAmount * 0.005);
        taxPositiveCount++;
      } else {
        totalServicesRevenue += r.totalCollectedAmount;
        totalServicesPreTax += r.preTaxAmount;
        totalVatHousehold += Math.round(r.totalCollectedAmount * 0.05);
        totalPitHousehold += Math.round(r.totalCollectedAmount * 0.02);
        taxPositiveCount++;
      }

      if (r.paymentMethodCategory === 'cash') totalCash += r.totalCollectedAmount;
      else if (r.paymentMethodCategory === 'e_wallet') totalEWallet += r.totalCollectedAmount;
      else totalBankTransfer += r.totalCollectedAmount;
    } else if (r.status === 'refunded') {
      refundedCount++;
      refundedAmount += Math.abs(r.totalCollectedAmount);
    } else {
      pendingCount++;
    }
  });

  const totalTaxHousehold = totalVatHousehold + totalPitHousehold;

  return {
    records,
    summary: {
      totalCount: records.length,
      totalRevenue,
      totalPreTax,
      totalEducationRevenue,
      totalGoodsRevenue,
      totalGoodsPreTax,
      totalServicesRevenue,
      totalServicesPreTax,
      totalVatHousehold,
      totalPitHousehold,
      totalTaxHousehold,
      totalVatEnterprise,
      totalTax: totalVatEnterprise,
      totalCash,
      totalBankTransfer,
      totalEWallet,
      paidCount,
      pendingCount,
      refundedCount,
      refundedAmount,
      taxZeroCount,
      taxPositiveCount
    }
  };
};

/**
 * Xuất file Excel Mẫu Hộ Kinh Doanh (Mẫu 01/CNKD - Phụ lục TT 40/2021/TT-BTC)
 */
export const exportHouseholdTaxReportToExcel = (
  records: TaxRevenueRecord[],
  summary: ReturnType<typeof filterAndBuildTaxRecords>['summary'],
  filter: TaxReportFilterState,
  branding: TenantBranding,
  filename?: string
) => {
  const periodText = getPeriodDisplayText(filter);
  const dateExport = new Date().toLocaleDateString('vi-VN');
  const actualFilename =
    filename ||
    `Mau_01_CNKD_Ho_Kinh_Doanh_${filter.periodType}_${filter.selectedYear}_${Date.now().toString().slice(-6)}.xlsx`;

  const ownerName = branding.householdOwner || branding.legalRepresentative || 'Nguyễn Văn Minh';
  const hkdName = branding.householdName || branding.centerName || 'HỘ KINH DOANH TRUNG TÂM ÂM NHẠC MINH MUSIC';
  const taxCode = branding.householdTaxCode || branding.centerTaxCode || '8499281902';
  const cccd = branding.householdCccd || '079085012345';
  const address = branding.householdBusinessAddress || branding.address || '123 Đường Âm Nhạc, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh';
  const mainCareer = branding.householdMainCareer || '8559 - Giáo dục khác chưa được phân vào đâu (Đào tạo âm nhạc, dạy đàn, thanh nhạc, bán lẻ nhạc cụ)';

  const aoa: any[][] = [];

  // 1. Quốc hiệu & Tiêu đề văn bản chuẩn TT 40/2021/TT-BTC
  aoa.push(['CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM']);
  aoa.push(['Độc lập - Tự do - Hạnh phúc']);
  aoa.push(['------------------------------------']);
  aoa.push([]);
  aoa.push(['BẢNG KÊ HOẠT ĐỘNG KINH DOANH TRONG KỲ CỦA HỘ KINH DOANH, CÁ NHÂN KINH DOANH']);
  aoa.push(['(Kèm theo Tờ khai mẫu 01/CNKD - Ban hành kèm theo Thông tư số 40/2021/TT-BTC ngày 01/06/2021 của Bộ Tài chính)']);
  aoa.push([`[Kỳ tính thuế: ${periodText}]`]);
  aoa.push([`Ngày lập bảng kê: ${dateExport} | Đơn vị tiền tệ: Đồng Việt Nam (VNĐ)`]);
  aoa.push([]);

  // 2. Thông tin Hộ kinh doanh nộp thuế
  aoa.push(['I. THÔNG TIN NGƯỜI NỘP THUẾ & HỘ KINH DOANH:']);
  aoa.push([`[01] Tên Hộ kinh doanh / Cơ sở:`, hkdName.toUpperCase()]);
  aoa.push([`[02] Tên Người nộp thuế / Chủ hộ kinh doanh:`, ownerName]);
  aoa.push([`[03] Mã số thuế (MST) Hộ kinh doanh:`, taxCode]);
  aoa.push([`[04] Số CCCD / CMND chủ hộ:`, cccd]);
  aoa.push([`[05] Địa chỉ địa điểm kinh doanh:`, address]);
  aoa.push([`[06] Ngành nghề kinh doanh chính:`, mainCareer]);
  aoa.push([]);

  // 3. Phần Tổng hợp Doanh thu & Nghĩa vụ thuế theo từng nhóm ngành nghề
  aoa.push(['II. TỔNG HỢP DOANH THU & NGHĨA VỤ THUẾ THEO TỪNG NHÓM NGÀNH NGHỀ (TT 40/2021/TT-BTC):']);
  aoa.push([
    'STT',
    'Nhóm Ngành Nghề Tính Thuế',
    'Căn Cứ Pháp Lý & Mã Ngành',
    'Doanh Thu Tính Thuế (VNĐ)',
    'Tỷ Lệ Thuế GTGT (%)',
    'Tiền Thuế GTGT (VNĐ)',
    'Tỷ Lệ Thuế TNCN (%)',
    'Tiền Thuế TNCN (VNĐ)',
    'Tổng Nghĩa Vụ Thuế (VNĐ)'
  ]);

  // Nhóm 1: Dạy nhạc (Mã ngành 8559)
  const pitTuition = Math.round(summary.totalEducationRevenue * 0.02);
  aoa.push([
    1,
    '1. Dịch vụ đào tạo âm nhạc, dạy đàn, học phí',
    'Mã ngành 8559 (Không chịu thuế GTGT theo Luật thuế GTGT)',
    summary.totalEducationRevenue,
    '0% (KCT)',
    0,
    '2.0%',
    pitTuition,
    pitTuition
  ]);

  // Nhóm 2: Bán giáo trình, bán nhạc cụ, phụ kiện
  const vatGoods = Math.round(summary.totalGoodsRevenue * 0.01);
  const pitGoods = Math.round(summary.totalGoodsRevenue * 0.005);
  aoa.push([
    2,
    '2. Phân phối, cung cấp hàng hóa (Nhạc cụ, giáo trình, phụ kiện)',
    'Phân phối hàng hóa (Phụ lục I - TT 40/2021/TT-BTC)',
    summary.totalGoodsRevenue,
    '1.0%',
    vatGoods,
    '0.5%',
    pitGoods,
    vatGoods + pitGoods
  ]);

  // Nhóm 3: Dịch vụ phụ trợ khác / cho thuê
  const vatServices = Math.round(summary.totalServicesRevenue * 0.05);
  const pitServices = Math.round(summary.totalServicesRevenue * 0.02);
  aoa.push([
    3,
    '3. Dịch vụ phụ trợ khác, cho thuê phòng tập, tổ chức thi',
    'Dịch vụ khác (Phụ lục I - TT 40/2021/TT-BTC)',
    summary.totalServicesRevenue,
    '5.0%',
    vatServices,
    '2.0%',
    pitServices,
    vatServices + pitServices
  ]);

  // Tổng cộng Phần II
  const totalVatHkd = vatGoods + vatServices;
  const totalPitHkd = pitTuition + pitGoods + pitServices;
  const totalTaxHkd = totalVatHkd + totalPitHkd;

  aoa.push([
    'TỔNG CỘNG',
    'TỔNG DOANH THU & NGHĨA VỤ THUẾ HỘ KINH DOANH PHẢI NỘP',
    '',
    summary.totalRevenue,
    '',
    totalVatHkd,
    '',
    totalPitHkd,
    totalTaxHkd
  ]);
  aoa.push([`Số tiền thuế phải nộp bằng chữ: ${vietnameseNumberToWords(totalTaxHkd)}`]);
  aoa.push([]);

  // 4. Phần Chi tiết giao dịch phát sinh
  aoa.push(['III. BẢNG KÊ CHI TIẾT DOANH THU VÀ BIÊN NHẬN THU PHÁT SINH TRONG KỲ:']);
  const detailHeaders = [
    'STT',
    'Mã Biên Nhận / HĐ',
    'Ngày Thu',
    'Họ Tên Học Viên / Người Nộp',
    'Mã Học Viên',
    'CCCD / MST',
    'Nội Dung Thu / Học Phần',
    'Nhóm Ngành Thuế',
    'Số Tiền Thực Thu (VNĐ)',
    'Tỷ Lệ GTGT',
    'Thuế GTGT (VNĐ)',
    'Tỷ Lệ TNCN',
    'Thuế TNCN (VNĐ)',
    'Tổng Thuế (VNĐ)',
    'Phương Thức TT',
    'Trạng Thái',
    'Ghi Chú'
  ];
  aoa.push(detailHeaders);

  records.forEach((r) => {
    aoa.push([
      r.stt,
      r.invoiceCode,
      r.paymentDate,
      r.payerOrStudentName,
      r.studentCode,
      r.taxIdOrCccd,
      r.revenueContent,
      r.taxGroupLabel,
      r.totalCollectedAmount,
      r.taxGroup === 'education_8559' ? '0%' : r.taxGroup === 'goods_retail' ? '1%' : '5%',
      r.taxGroup === 'goods_retail' ? Math.round(r.totalCollectedAmount * 0.01) : r.taxGroup === 'services_auxiliary' ? Math.round(r.totalCollectedAmount * 0.05) : 0,
      `${r.pitTaxRatePercent}%`,
      r.pitTaxAmount,
      r.totalTaxObligation,
      r.paymentMethodDisplay,
      r.statusDisplay,
      r.notes
    ]);
  });

  aoa.push([]);
  aoa.push([
    'TỔNG CỘNG THỰC THU',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    summary.totalRevenue,
    '',
    totalVatHkd,
    '',
    totalPitHkd,
    totalTaxHkd,
    '',
    `Tổng ${summary.paidCount} giao dịch`,
    ''
  ]);

  aoa.push([]);
  aoa.push(['Tôi cam đoan số liệu khai trên là đúng và hoàn toàn chịu trách nhiệm trước pháp luật về tính chính xác của số liệu này.']);
  aoa.push([]);
  aoa.push(['', '', '', '', '', '', '', `......, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`]);
  aoa.push(['', '', '', '', '', '', '', 'NGƯỜI NỘP THUẾ / CHỦ HỘ KINH DOANH']);
  aoa.push(['', '', '', '', '', '', '', '(Ký, ghi rõ họ và tên)']);
  aoa.push([]);
  aoa.push([]);
  aoa.push(['', '', '', '', '', '', '', ownerName]);

  // Convert to Excel sheet
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Column widths
  ws['!cols'] = [
    { wch: 6 },  // STT
    { wch: 18 }, // Mã HĐ
    { wch: 12 }, // Ngày
    { wch: 26 }, // Tên HV
    { wch: 12 }, // Mã HV
    { wch: 16 }, // CCCD
    { wch: 30 }, // Nội dung
    { wch: 32 }, // Nhóm ngành
    { wch: 18 }, // Số tiền
    { wch: 12 }, // % GTGT
    { wch: 15 }, // Tiền GTGT
    { wch: 12 }, // % TNCN
    { wch: 15 }, // Tiền TNCN
    { wch: 16 }, // Tổng thuế
    { wch: 20 }, // PT thanh toán
    { wch: 14 }, // Trạng thái
    { wch: 25 }  // Ghi chú
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Mau_01_CNKD_HoKinhDoanh');
  XLSX.writeFile(wb, actualFilename);
};

/**
 * Xuất file Excel Mẫu Doanh Nghiệp (Bảng kê Hóa đơn kèm Tờ khai 01/GTGT theo TT 80/2021/TT-BTC)
 */
export const exportEnterpriseTaxReportToExcel = (
  records: TaxRevenueRecord[],
  summary: ReturnType<typeof filterAndBuildTaxRecords>['summary'],
  filter: TaxReportFilterState,
  branding: TenantBranding,
  filename?: string
) => {
  const periodText = getPeriodDisplayText(filter);
  const dateExport = new Date().toLocaleDateString('vi-VN');
  const actualFilename =
    filename ||
    `Bang_Ke_Thue_GTGT_Doanh_Nghiep_${filter.periodType}_${filter.selectedYear}_${Date.now().toString().slice(-6)}.xlsx`;

  const companyName = branding.companyName || branding.centerName || 'CÔNG TY TNHH GIÁO DỤC ÂM NHẠC MINH MUSIC';
  const taxCode = branding.companyTaxCode || branding.centerTaxCode || '0316889988';
  const address = branding.companyAddress || branding.address || '123 Đường Âm Nhạc, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh';
  const legalRep = branding.legalRepresentative || 'Nguyễn Văn Minh';
  const accountant = branding.chiefAccountant || 'Trần Thị Thu Thủy';

  const aoa: any[][] = [];

  // 1. Header Doanh Nghiệp
  aoa.push([companyName.toUpperCase()]);
  aoa.push([`Mã số thuế doanh nghiệp: ${taxCode} | Hotline: ${branding.hotline || '0901.888.999'}`]);
  aoa.push([`Địa chỉ trụ sở: ${address}`]);
  aoa.push([]);

  // 2. Tiêu đề Bảng kê theo Thông tư 80/2021/TT-BTC
  aoa.push(['BẢNG KÊ HÓA ĐƠN, CHỨNG TỪ HÀNG HÓA DỊCH VỤ BÁN RA']);
  aoa.push(['(Kèm theo Tờ khai thuế GTGT Mẫu 01/GTGT & Quyết toán tài chính doanh nghiệp)']);
  aoa.push([`Kỳ tính thuế: ${periodText}`]);
  aoa.push([`Ngày lập biểu: ${dateExport} | Đơn vị tính: Đồng Việt Nam (VNĐ)`]);
  aoa.push([]);

  // 3. Phân loại theo từng nhóm doanh thu thuế suất
  aoa.push(['I. TỔNG HỢP CHỈ TIÊU KÊ KHAI THUẾ GTGT BÁN RA (MẪU 01/GTGT):']);
  aoa.push([
    'STT',
    'Chỉ Tiêu Hàng Hóa, Dịch Vụ Bán Ra',
    'Chỉ Tiêu Tờ Khai 01/GTGT',
    'Doanh Thu Chưa Thuế (VNĐ)',
    'Thuế Suất GTGT (%)',
    'Thuế GTGT Đầu Ra (VNĐ)',
    'Tổng Thanh Toán (VNĐ)'
  ]);

  // Hàng 1: Không chịu thuế GTGT
  aoa.push([
    1,
    '1. Hàng hóa, dịch vụ không chịu thuế GTGT (Mã ngành 8559 - Đào tạo, dạy học âm nhạc)',
    'Chỉ tiêu [26]',
    summary.totalEducationRevenue,
    'Không chịu thuế',
    0,
    summary.totalEducationRevenue
  ]);

  // Hàng 2: Thuế suất 8%
  const vat8 = summary.totalGoodsRevenue - summary.totalGoodsPreTax;
  aoa.push([
    2,
    '2. Hàng hóa, dịch vụ chịu thuế suất GTGT 8% (Nhạc cụ, sách giáo trình giảm thuế)',
    'Chỉ tiêu [32a]',
    summary.totalGoodsPreTax,
    '8%',
    vat8,
    summary.totalGoodsRevenue
  ]);

  // Hàng 3: Thuế suất 10%
  const vat10 = summary.totalServicesRevenue - summary.totalServicesPreTax;
  aoa.push([
    3,
    '3. Hàng hóa, dịch vụ chịu thuế suất GTGT 10% (Phí khảo thí, cho thuê phòng tập, dịch vụ khác)',
    'Chỉ tiêu [32]',
    summary.totalServicesPreTax,
    '10%',
    vat10,
    summary.totalServicesRevenue
  ]);

  // Tổng cộng Phần I
  aoa.push([
    'TỔNG',
    'TỔNG CỘNG DOANH THU VÀ THUẾ GTGT ĐẦU RA BÁN RA',
    'Chỉ tiêu [34] & [35]',
    summary.totalPreTax,
    '',
    summary.totalVatEnterprise,
    summary.totalRevenue
  ]);
  aoa.push([`Tổng thuế GTGT đầu ra bằng chữ: ${vietnameseNumberToWords(summary.totalVatEnterprise)}`]);
  aoa.push([]);

  // 4. Chi tiết từng hóa đơn bán ra
  aoa.push(['II. BẢNG KÊ CHI TIẾT HÓA ĐƠN / CHỨNG TỪ BÁN RA:']);
  const entHeaders = [
    'STT',
    'Mã Hóa Đơn / Giao Dịch',
    'Ngày Lập HĐ',
    'Tên Người Mua / Học Viên',
    'Mã Học Viên',
    'Mã Số Thuế / CCCD Người Mua',
    'Mặt Hàng / Dịch Vụ',
    'Nhóm Phân Loại Thuế',
    'Doanh Thu Chưa Thuế (VNĐ)',
    'Thuế Suất GTGT',
    'Thuế GTGT Đầu Ra (VNĐ)',
    'Tổng Tiền Thanh Toán (VNĐ)',
    'Hình Thức Thanh Toán',
    'Trạng Thái',
    'Ghi Chú'
  ];
  aoa.push(entHeaders);

  records.forEach((r) => {
    aoa.push([
      r.stt,
      r.invoiceCode,
      r.paymentDate,
      r.payerOrStudentName,
      r.studentCode,
      r.taxIdOrCccd,
      r.revenueContent,
      r.taxGroupLabel,
      r.preTaxAmount,
      `${r.taxRatePercent}%`,
      r.taxAmount,
      r.totalCollectedAmount,
      r.paymentMethodDisplay,
      r.statusDisplay,
      r.notes
    ]);
  });

  aoa.push([]);
  aoa.push([
    'TỔNG CỘNG',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    summary.totalPreTax,
    '',
    summary.totalVatEnterprise,
    summary.totalRevenue,
    '',
    `Tổng ${summary.paidCount} HĐ đã thu`,
    ''
  ]);

  aoa.push([]);
  aoa.push([
    'NGƯỜI LẬP BIỂU',
    '',
    '',
    'KẾ TOÁN TRƯỞNG',
    '',
    '',
    '',
    '',
    'NGƯỜI ĐẠI DIỆN THEO PHÁP LUẬT / GIÁM ĐỐC'
  ]);
  aoa.push([
    '(Ký, ghi rõ họ tên)',
    '',
    '',
    '(Ký, ghi rõ họ tên)',
    '',
    '',
    '',
    '',
    '(Ký, đóng dấu, ghi rõ họ tên)'
  ]);
  aoa.push([]);
  aoa.push([]);
  aoa.push([
    'Người lập báo cáo',
    '',
    '',
    accountant,
    '',
    '',
    '',
    '',
    legalRep
  ]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 12 },
    { wch: 26 },
    { wch: 12 },
    { wch: 16 },
    { wch: 30 },
    { wch: 32 },
    { wch: 18 },
    { wch: 14 },
    { wch: 16 },
    { wch: 18 },
    { wch: 20 },
    { wch: 14 },
    { wch: 25 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Bang_Ke_GTGT_Doanh_Nghiep');
  XLSX.writeFile(wb, actualFilename);
};

/**
 * Điều phối xuất file Excel thông minh dựa trên facilityType
 */
export const exportTaxReportToExcel = (
  records: TaxRevenueRecord[],
  summary: ReturnType<typeof filterAndBuildTaxRecords>['summary'],
  filter: TaxReportFilterState,
  branding: TenantBranding,
  forceFacilityType?: FacilityTaxType,
  filename?: string
) => {
  const targetType = forceFacilityType || filter.facilityType || branding.facilityType || 'household';
  if (targetType === 'household') {
    exportHouseholdTaxReportToExcel(records, summary, filter, branding, filename);
  } else {
    exportEnterpriseTaxReportToExcel(records, summary, filter, branding, filename);
  }
};

/**
 * Xuất file CSV định dạng UTF-8 có dấu
 */
export const exportTaxReportToCSV = (
  records: TaxRevenueRecord[],
  summary: ReturnType<typeof filterAndBuildTaxRecords>['summary'],
  filter: TaxReportFilterState,
  branding: TenantBranding,
  facilityType: FacilityTaxType = 'household',
  filename?: string
) => {
  const periodText = getPeriodDisplayText(filter);
  const actualFilename = filename || `Bao_Cao_Thue_${facilityType}_${filter.selectedYear}_${Date.now().toString().slice(-6)}.csv`;

  let rows: (string | number)[][] = [];

  if (facilityType === 'household') {
    rows = [
      ['BẢNG KÊ HOẠT ĐỘNG KINH DOANH HỘ KINH DOANH (MẪU 01/CNKD - TT 40/2021/TT-BTC)'],
      [`Tên Hộ kinh doanh: ${branding.householdName || branding.centerName || ''}`],
      [`Chủ hộ kinh doanh: ${branding.householdOwner || branding.legalRepresentative || ''}`],
      [`Mã số thuế HKD: ${branding.householdTaxCode || branding.centerTaxCode || ''}`],
      [`Kỳ tính thuế: ${periodText}`],
      [],
      [
        'STT',
        'Mã Hóa Đơn',
        'Ngày Thu',
        'Họ Tên Học Viên',
        'Mã Học Viên',
        'CCCD/MST',
        'Nội Dung Thu',
        'Nhóm Ngành Thuế',
        'Thực Thu (VNĐ)',
        '% Thuế GTGT',
        'Tiền Thuế GTGT (VNĐ)',
        '% Thuế TNCN',
        'Tiền Thuế TNCN (VNĐ)',
        'Tổng Nghĩa Vụ Thuế (VNĐ)',
        'Phương Thức TT',
        'Trạng Thái',
        'Ghi Chú'
      ],
      ...records.map((r) => [
        r.stt,
        r.invoiceCode,
        r.paymentDate,
        r.payerOrStudentName,
        r.studentCode,
        r.taxIdOrCccd,
        r.revenueContent,
        r.taxGroupLabel,
        r.totalCollectedAmount,
        r.taxGroup === 'education_8559' ? '0%' : r.taxGroup === 'goods_retail' ? '1%' : '5%',
        r.taxGroup === 'goods_retail' ? Math.round(r.totalCollectedAmount * 0.01) : r.taxGroup === 'services_auxiliary' ? Math.round(r.totalCollectedAmount * 0.05) : 0,
        `${r.pitTaxRatePercent}%`,
        r.pitTaxAmount,
        r.totalTaxObligation,
        r.paymentMethodDisplay,
        r.statusDisplay,
        r.notes
      ]),
      [],
      [
        'TỔNG CỘNG',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        summary.totalRevenue,
        '',
        summary.totalVatHousehold,
        '',
        summary.totalPitHousehold,
        summary.totalTaxHousehold,
        '',
        `Tổng ${summary.paidCount} giao dịch`,
        ''
      ]
    ];
  } else {
    rows = [
      ['BẢNG KÊ HÓA ĐƠN CHỨNG TỪ DOANH THU THUẾ GTGT DOANH NGHIỆP (TT 80/2021/TT-BTC)'],
      [`Tên Doanh nghiệp: ${branding.companyName || branding.centerName || ''}`],
      [`Mã số thuế DN: ${branding.companyTaxCode || branding.centerTaxCode || ''}`],
      [`Kỳ kê khai: ${periodText}`],
      [],
      [
        'STT',
        'Mã Hóa Đơn',
        'Ngày Lập HĐ',
        'Tên Học Viên / Khách Hàng',
        'Mã Học Viên',
        'Mã Số Thuế / CCCD',
        'Mặt Hàng Dịch Vụ',
        'Nhóm Ngành Thuế',
        'Doanh Thu Trước Thuế (VNĐ)',
        'Thuế Suất GTGT (%)',
        'Tiền Thuế GTGT (VNĐ)',
        'Tổng Thanh Toán (VNĐ)',
        'Phương Thức TT',
        'Trạng Thái',
        'Ghi Chú'
      ],
      ...records.map((r) => [
        r.stt,
        r.invoiceCode,
        r.paymentDate,
        r.payerOrStudentName,
        r.studentCode,
        r.taxIdOrCccd,
        r.revenueContent,
        r.taxGroupLabel,
        r.preTaxAmount,
        `${r.taxRatePercent}%`,
        r.taxAmount,
        r.totalCollectedAmount,
        r.paymentMethodDisplay,
        r.statusDisplay,
        r.notes
      ]),
      [],
      [
        'TỔNG CỘNG',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        summary.totalPreTax,
        '',
        summary.totalVatEnterprise,
        summary.totalRevenue,
        '',
        `Tổng ${summary.paidCount} HĐ`,
        ''
      ]
    ];
  }

  const csvString = rows
    .map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\r\n');

  downloadCSV(csvString, actualFilename);
};

/**
 * In hoặc xuất PDF báo cáo thuế chuẩn A4
 */
export const printTaxReportPDF = (
  records: TaxRevenueRecord[],
  summary: ReturnType<typeof filterAndBuildTaxRecords>['summary'],
  filter: TaxReportFilterState,
  branding: TenantBranding,
  facilityType: FacilityTaxType = 'household'
) => {
  const periodText = getPeriodDisplayText(filter);
  const dateExport = new Date().toLocaleDateString('vi-VN');

  const isHKD = facilityType === 'household';
  const entityName = isHKD
    ? branding.householdName || branding.centerName || 'HỘ KINH DOANH TRUNG TÂM ÂM NHẠC MINH MUSIC'
    : branding.companyName || branding.centerName || 'CÔNG TY TNHH GIÁO DỤC ÂM NHẠC MINH MUSIC';
  const taxCode = isHKD
    ? branding.householdTaxCode || branding.centerTaxCode || '8499281902'
    : branding.companyTaxCode || branding.centerTaxCode || '0316889988';
  const ownerOrRep = isHKD
    ? branding.householdOwner || branding.legalRepresentative || 'Nguyễn Văn Minh'
    : branding.legalRepresentative || 'Nguyễn Văn Minh';
  const accountant = branding.chiefAccountant || 'Trần Thị Thu Thủy';
  const address = isHKD
    ? branding.householdBusinessAddress || branding.address || 'Quận 1, TP. Hồ Chí Minh'
    : branding.companyAddress || branding.address || 'Quận 1, TP. Hồ Chí Minh';

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>${isHKD ? 'Mau_01_CNKD_Ho_Kinh_Doanh' : 'Bang_Ke_Thue_Doanh_Nghiep'} - ${periodText}</title>
      <style>
        @page {
          size: A4 landscape;
          margin: 20mm 15mm 20mm 25mm; /* Trên: 20mm, Phải: 15mm, Dưới: 20mm, Trái: 25mm */
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        body {
          font-family: 'Times New Roman', Times, serif, system-ui;
          font-size: 11pt;
          color: #000000;
          line-height: 1.4;
          margin: 0;
          padding: 0;
          background: #ffffff;
        }
        .header-box {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 14px;
          border-bottom: 2px solid #000000;
          padding-bottom: 8px;
        }
        .brand-section {
          width: 58%;
        }
        .brand-name {
          font-weight: bold;
          text-transform: uppercase;
          font-size: 11pt;
          margin: 0 0 2px 0;
        }
        .brand-info {
          font-size: 9.5pt;
          color: #222222;
          margin: 1px 0;
        }
        .national-motto {
          width: 40%;
          text-align: center;
        }
        .national-title {
          font-size: 10pt;
          font-weight: bold;
          text-transform: uppercase;
          margin: 0 0 2px 0;
        }
        .motto-text {
          font-size: 9.5pt;
          font-weight: bold;
          margin: 0 0 2px 0;
        }
        .motto-line {
          width: 120px;
          height: 1px;
          background: #000000;
          margin: 3px auto 4px auto;
        }
        .form-code-badge {
          font-size: 8.5pt;
          font-style: italic;
          color: #333333;
        }
        .title-section {
          text-align: center;
          margin: 14px 0 10px 0;
        }
        .title-section h2 {
          margin: 0;
          font-size: 14pt;
          text-transform: uppercase;
          font-weight: bold;
          letter-spacing: 0.5px;
        }
        .title-section p {
          margin: 3px 0 0 0;
          font-style: italic;
          font-size: 10pt;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px 20px;
          font-size: 10pt;
          margin-bottom: 12px;
          background: #fbfbfb;
          padding: 8px 12px;
          border: 1px solid #000000;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12px;
          font-size: 9.5pt;
          page-break-inside: auto;
        }
        thead {
          display: table-header-group;
        }
        tfoot {
          display: table-footer-group;
        }
        tr {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        th, td {
          border: 1px solid #000000;
          padding: 5px 6px;
          color: #000000;
        }
        th {
          background: #f2f2f2;
          text-align: center;
          font-weight: bold;
          font-size: 9pt;
          text-transform: uppercase;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .font-bold { font-weight: bold; }
        .bg-total { background-color: #f2f2f2; font-weight: bold; }
        .signatures {
          display: grid;
          grid-template-columns: ${isHKD ? '1fr 1fr' : '1fr 1fr 1fr'};
          margin-top: 24px;
          text-align: center;
          font-size: 10pt;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .sig-title {
          font-weight: bold;
          text-transform: uppercase;
        }
        .sig-sub {
          font-size: 8.5pt;
          font-style: italic;
          color: #444444;
          margin-top: 2px;
        }
        .sig-space {
          height: 60px;
        }
        .sig-name {
          font-weight: bold;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="header-box">
        <div class="brand-section">
          <div class="brand-name">${entityName}</div>
          <div class="brand-info">Mã số thuế: <strong>${taxCode}</strong> | Hotline: ${branding.hotline || '0901.888.999'}</div>
          <div class="brand-info">Địa chỉ: ${address}</div>
        </div>
        <div class="national-motto">
          <div class="national-title">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div class="motto-text">Độc lập - Tự do - Hạnh phúc</div>
          <div class="motto-line"></div>
          <div class="form-code-badge">
            ${isHKD ? 'Mẫu số: 01/CNKD (TT 40/2021/TT-BTC)' : 'Mẫu số: 01-1/GTGT (TT 80/2021/TT-BTC)'}
          </div>
        </div>
      </div>

      <div class="title-section">
        <h2>${isHKD ? 'BẢNG KÊ HOẠT ĐỘNG KINH DOANH HỘ KINH DOANH (MẪU 01/CNKD)' : 'BẢNG KÊ HÓA ĐƠN, CHỨNG TỪ HÀNG HÓA DỊCH VỤ BÁN RA'}</h2>
        <p>Kỳ tính thuế: <strong>${periodText}</strong> - Ngày lập: ${dateExport}</p>
      </div>

      <div class="info-grid">
        <div><strong>Người nộp thuế / Đại diện:</strong> ${ownerOrRep}</div>
        <div><strong>Mã số thuế:</strong> ${taxCode}</div>
        <div><strong>Quy mô cơ sở:</strong> ${isHKD ? 'Hộ kinh doanh cá thể' : 'Doanh nghiệp / Công ty'}</div>
        <div><strong>Ngành nghề chính:</strong> 8559 - Giáo dục khác (Đào tạo âm nhạc, dạy đàn, nhạc cụ)</div>
      </div>

      <!-- TỔNG HỢP NGHĨA VỤ THUẾ -->
      <div style="font-weight: bold; margin-bottom: 4px; font-size: 10pt;">
        I. TỔNG HỢP DOANH THU & NGHĨA VỤ THUẾ THEO TỪNG NHÓM NGÀNH NGHỀ:
      </div>
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Nhóm Ngành Nghề Doanh Thu</th>
            <th>Quy Định & Mã Ngành</th>
            <th>Doanh Thu (VNĐ)</th>
            ${isHKD ? '<th>Thuế GTGT</th><th>Tiền GTGT (VNĐ)</th><th>Thuế TNCN</th><th>Tiền TNCN (VNĐ)</th><th>Tổng Thuế HKD (VNĐ)</th>' : '<th>Chỉ Tiêu Tờ Khai</th><th>Thuế Suất GTGT</th><th>Thuế GTGT Đầu Ra (VNĐ)</th><th>Tổng Thanh Toán (VNĐ)</th>'}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-center">1</td>
            <td>Dạy nhạc / Học phí (Mã ngành 8559)</td>
            <td>Không chịu thuế GTGT</td>
            <td class="text-right font-bold">${summary.totalEducationRevenue.toLocaleString('vi-VN')} đ</td>
            ${isHKD ? '<td class="text-center">0%</td><td class="text-right">0 đ</td><td class="text-center">2.0%</td><td class="text-right">' + Math.round(summary.totalEducationRevenue * 0.02).toLocaleString('vi-VN') + ' đ</td><td class="text-right font-bold">' + Math.round(summary.totalEducationRevenue * 0.02).toLocaleString('vi-VN') + ' đ</td>' : '<td class="text-center">[26]</td><td class="text-center">KCT (0%)</td><td class="text-right">0 đ</td><td class="text-right font-bold">' + summary.totalEducationRevenue.toLocaleString('vi-VN') + ' đ</td>'}
          </tr>
          <tr>
            <td class="text-center">2</td>
            <td>Bán giáo trình, nhạc cụ, phụ kiện</td>
            <td>Phân phối hàng hóa</td>
            <td class="text-right font-bold">${summary.totalGoodsRevenue.toLocaleString('vi-VN')} đ</td>
            ${isHKD ? '<td class="text-center">1.0%</td><td class="text-right">' + Math.round(summary.totalGoodsRevenue * 0.01).toLocaleString('vi-VN') + ' đ</td><td class="text-center">0.5%</td><td class="text-right">' + Math.round(summary.totalGoodsRevenue * 0.005).toLocaleString('vi-VN') + ' đ</td><td class="text-right font-bold">' + (Math.round(summary.totalGoodsRevenue * 0.01) + Math.round(summary.totalGoodsRevenue * 0.005)).toLocaleString('vi-VN') + ' đ</td>' : '<td class="text-center">[32a]</td><td class="text-center">8%</td><td class="text-right">' + (summary.totalGoodsRevenue - summary.totalGoodsPreTax).toLocaleString('vi-VN') + ' đ</td><td class="text-right font-bold">' + summary.totalGoodsRevenue.toLocaleString('vi-VN') + ' đ</td>'}
          </tr>
          <tr>
            <td class="text-center">3</td>
            <td>Dịch vụ phụ trợ / cho thuê phòng tập</td>
            <td>Dịch vụ phụ trợ khác</td>
            <td class="text-right font-bold">${summary.totalServicesRevenue.toLocaleString('vi-VN')} đ</td>
            ${isHKD ? '<td class="text-center">5.0%</td><td class="text-right">' + Math.round(summary.totalServicesRevenue * 0.05).toLocaleString('vi-VN') + ' đ</td><td class="text-center">2.0%</td><td class="text-right">' + Math.round(summary.totalServicesRevenue * 0.02).toLocaleString('vi-VN') + ' đ</td><td class="text-right font-bold">' + (Math.round(summary.totalServicesRevenue * 0.05) + Math.round(summary.totalServicesRevenue * 0.02)).toLocaleString('vi-VN') + ' đ</td>' : '<td class="text-center">[32]</td><td class="text-center">10%</td><td class="text-right">' + (summary.totalServicesRevenue - summary.totalServicesPreTax).toLocaleString('vi-VN') + ' đ</td><td class="text-right font-bold">' + summary.totalServicesRevenue.toLocaleString('vi-VN') + ' đ</td>'}
          </tr>
          <tr class="bg-total">
            <td colspan="3" class="text-center font-bold">TỔNG CỘNG NGHĨA VỤ THUẾ TRONG KỲ</td>
            <td class="text-right font-bold">${summary.totalRevenue.toLocaleString('vi-VN')} đ</td>
            ${isHKD ? '<td></td><td class="text-right font-bold">' + summary.totalVatHousehold.toLocaleString('vi-VN') + ' đ</td><td></td><td class="text-right font-bold">' + summary.totalPitHousehold.toLocaleString('vi-VN') + ' đ</td><td class="text-right font-bold">' + summary.totalTaxHousehold.toLocaleString('vi-VN') + ' đ</td>' : '<td class="text-center font-bold">[34] & [35]</td><td></td><td class="text-right font-bold">' + summary.totalVatEnterprise.toLocaleString('vi-VN') + ' đ</td><td class="text-right font-bold">' + summary.totalRevenue.toLocaleString('vi-VN') + ' đ</td>'}
          </tr>
        </tbody>
      </table>

      <!-- CHI TIẾT GIAO DỊCH -->
      <div style="font-weight: bold; margin-top: 10px; margin-bottom: 4px; font-size: 10pt;">
        II. CHI TIẾT TỪNG BIÊN NHẬN / HÓA ĐƠN PHÁT SINH TRONG KỲ (${records.length} giao dịch):
      </div>
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Mã HĐ</th>
            <th>Ngày</th>
            <th>Học Viên / Người Nộp</th>
            <th>Mã HV</th>
            <th>CCCD / MST</th>
            <th>Nội Dung</th>
            <th>Nhóm Ngành</th>
            <th>Doanh Thu (VNĐ)</th>
            ${isHKD ? '<th>Thuế GTGT</th><th>Thuế TNCN</th><th>Tổng Thuế</th>' : '<th>Trước Thuế</th><th>Thuế GTGT</th>'}
            <th>Phương Thức</th>
            <th>Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          ${records.map(r => `
            <tr>
              <td class="text-center">${r.stt}</td>
              <td class="font-bold text-center">${r.invoiceCode}</td>
              <td class="text-center">${r.paymentDate}</td>
              <td>${r.payerOrStudentName}</td>
              <td class="text-center">${r.studentCode}</td>
              <td class="text-center">${r.taxIdOrCccd}</td>
              <td>${r.revenueContent}</td>
              <td style="font-size: 8.5pt;">${r.taxGroup === 'education_8559' ? 'Dạy nhạc 8559' : r.taxGroup === 'goods_retail' ? 'Bán nhạc cụ/sách' : 'Dịch vụ phụ trợ'}</td>
              <td class="text-right font-bold">${r.totalCollectedAmount.toLocaleString('vi-VN')} đ</td>
              ${isHKD ? '<td class="text-right">' + (r.taxGroup === 'goods_retail' ? Math.round(r.totalCollectedAmount * 0.01) : r.taxGroup === 'services_auxiliary' ? Math.round(r.totalCollectedAmount * 0.05) : 0).toLocaleString('vi-VN') + ' đ</td><td class="text-right">' + r.pitTaxAmount.toLocaleString('vi-VN') + ' đ</td><td class="text-right font-bold">' + r.totalTaxObligation.toLocaleString('vi-VN') + ' đ</td>' : '<td class="text-right">' + r.preTaxAmount.toLocaleString('vi-VN') + ' đ</td><td class="text-right">' + r.taxAmount.toLocaleString('vi-VN') + ' đ</td>'}
              <td class="text-center">${r.paymentMethodDisplay}</td>
              <td class="text-center">${r.statusDisplay}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="font-size: 10pt; font-style: italic; margin-top: 8px;">
        Số tiền bằng chữ: <strong>${vietnameseNumberToWords(isHKD ? summary.totalTaxHousehold : summary.totalRevenue)}</strong>
      </div>

      <div style="text-align: right; font-size: 10pt; font-style: italic; margin-top: 16px;">
        ......, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}
      </div>

      <div class="signatures">
        ${isHKD ? `
          <div>
            <div class="sig-title">NGƯỜI LẬP BIỂU</div>
            <div class="sig-sub">(Ký, ghi rõ họ tên)</div>
            <div class="sig-space"></div>
            <div class="sig-name">Người lập báo cáo</div>
          </div>
          <div>
            <div class="sig-title">CHỦ HỘ KINH DOANH / NGƯỜI NỘP THUẾ</div>
            <div class="sig-sub">(Ký, đóng dấu, ghi rõ họ tên)</div>
            <div class="sig-space"></div>
            <div class="sig-name">${ownerOrRep}</div>
          </div>
        ` : `
          <div>
            <div class="sig-title">NGƯỜI LẬP BIỂU</div>
            <div class="sig-sub">(Ký, ghi rõ họ tên)</div>
            <div class="sig-space"></div>
            <div class="sig-name">Người lập biểu</div>
          </div>
          <div>
            <div class="sig-title">KẾ TOÁN TRƯỞNG</div>
            <div class="sig-sub">(Ký, ghi rõ họ tên)</div>
            <div class="sig-space"></div>
            <div class="sig-name">${accountant}</div>
          </div>
          <div>
            <div class="sig-title">GIÁM ĐỐC / ĐẠI DIỆN PHÁP LUẬT</div>
            <div class="sig-sub">(Ký, đóng dấu, ghi rõ họ tên)</div>
            <div class="sig-space"></div>
            <div class="sig-name">${ownerOrRep}</div>
          </div>
        `}
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
