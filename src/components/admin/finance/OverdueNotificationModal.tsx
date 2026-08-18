import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Sliders,
  Settings,
  Edit3,
  Copy,
  Check,
  RefreshCw,
  Eye,
  Calendar,
  DollarSign,
  Users,
  CreditCard,
  QrCode,
  ArrowRight,
  RotateCcw,
  Save,
  FileText,
  History,
  ShieldAlert
} from 'lucide-react';
import { TuitionPayment, Student, BankAccountConfig, TenantBranding } from '../../../types';
import {
  OverdueTemplate,
  OverdueAutomationSettings,
  OverdueNoticeLevel,
  OverdueDispatchLog
} from '../../../types/overdueNotifications';
import {
  DEFAULT_OVERDUE_TEMPLATES,
  DEFAULT_AUTOMATION_SETTINGS,
  TEMPLATE_VARIABLES,
  scanOverduePayments,
  renderTemplateText,
  loadSavedTemplates,
  saveTemplates,
  loadSavedAutomationSettings,
  saveAutomationSettings,
  loadDispatchLogs,
  appendDispatchLog,
  ScannedOverdueItem
} from '../../../utils/overdueNotificationEngine';

interface OverdueNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tuitionPayments: TuitionPayment[];
  students: Student[];
  bankConfig?: BankAccountConfig;
  branding?: TenantBranding;
  onSendNotifications: (notifications: Array<{
    title: string;
    content: string;
    targetRoles: any[];
    targetUserIds?: string[];
    studentId?: string;
    studentName?: string;
    type: string;
    severity?: 'info' | 'warning' | 'alert';
  }>) => void;
  onSuccessToast?: (msg: string) => void;
}

export const OverdueNotificationModal: React.FC<OverdueNotificationModalProps> = ({
  isOpen,
  onClose,
  tuitionPayments,
  students,
  bankConfig,
  branding,
  onSendNotifications,
  onSuccessToast
}) => {
  if (!isOpen) return null;

  // Active top navigation in modal
  const [activeTab, setActiveTab] = useState<'scanner' | 'templates' | 'automation' | 'history'>('scanner');

  // Templates state
  const [templates, setTemplates] = useState<OverdueTemplate[]>(() => loadSavedTemplates());
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl_overdue_1');
  const [editingTemplate, setEditingTemplate] = useState<OverdueTemplate>(() => {
    const found = templates.find(t => t.id === 'tpl_overdue_1');
    return found || templates[0] || DEFAULT_OVERDUE_TEMPLATES[0];
  });
  const [templateChannel, setTemplateChannel] = useState<'email' | 'push' | 'sms'>('email');

  // Automation Settings state
  const [automationSettings, setAutomationSettings] = useState<OverdueAutomationSettings>(() => loadSavedAutomationSettings());

  // Dispatch history
  const [dispatchLogs, setDispatchLogs] = useState<OverdueDispatchLog[]>(() => loadDispatchLogs());

  // Scanned Overdue Items
  const scannedItems = useMemo(() => {
    return scanOverduePayments(tuitionPayments, students, bankConfig, branding);
  }, [tuitionPayments, students, bankConfig, branding]);

  // Selected targets for batch dispatch
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [levelFilter, setLevelFilter] = useState<'ALL' | OverdueNoticeLevel>('ALL');
  const [previewItemId, setPreviewItemId] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<'email' | 'push'>('email');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Initialize selected item IDs on load
  useEffect(() => {
    if (scannedItems.length > 0 && selectedItemIds.length === 0) {
      setSelectedItemIds(scannedItems.map(item => item.payment.id));
      setPreviewItemId(scannedItems[0]?.payment.id || '');
    }
  }, [scannedItems]);

  // Sync editing template when selectedTemplateId changes
  const handleSelectTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const found = templates.find(t => t.id === tplId);
    if (found) {
      setEditingTemplate({ ...found });
    }
  };

  // Save template updates
  const handleSaveTemplate = () => {
    const updated = templates.map(t => t.id === editingTemplate.id ? editingTemplate : t);
    setTemplates(updated);
    saveTemplates(updated);
    if (onSuccessToast) onSuccessToast('Đã lưu mẫu thông báo nhắc học phí thành công!');
  };

  // Reset template to default
  const handleResetTemplate = () => {
    const def = DEFAULT_OVERDUE_TEMPLATES.find(t => t.id === editingTemplate.id);
    if (def) {
      setEditingTemplate({ ...def });
      const updated = templates.map(t => t.id === def.id ? def : t);
      setTemplates(updated);
      saveTemplates(updated);
      if (onSuccessToast) onSuccessToast('Đã khôi phục mẫu mặc định!');
    }
  };

  // Insert token into active field
  const handleInsertToken = (token: string) => {
    if (templateChannel === 'email') {
      setEditingTemplate(prev => ({
        ...prev,
        emailBody: prev.emailBody + ' ' + token
      }));
    } else if (templateChannel === 'push') {
      setEditingTemplate(prev => ({
        ...prev,
        pushBody: prev.pushBody + ' ' + token
      }));
    } else {
      setEditingTemplate(prev => ({
        ...prev,
        smsBody: prev.smsBody + ' ' + token
      }));
    }
  };

  // Save automation settings
  const handleSaveAutomation = () => {
    saveAutomationSettings(automationSettings);
    if (onSuccessToast) onSuccessToast('Đã cập nhật cấu hình tự động hóa nhắc phí!');
  };

  // Filtered scanned items
  const filteredScannedItems = useMemo(() => {
    if (levelFilter === 'ALL') return scannedItems;
    return scannedItems.filter(item => item.level === levelFilter);
  }, [scannedItems, levelFilter]);

  // Selected item for preview
  const currentPreviewItem = useMemo(() => {
    return scannedItems.find(i => i.payment.id === previewItemId) || scannedItems[0];
  }, [scannedItems, previewItemId]);

  // Get matching template for an item
  const getItemTemplate = (item?: ScannedOverdueItem) => {
    if (!item) return editingTemplate;
    const found = templates.find(t => t.id === item.recommendedTemplateId) ||
                  templates.find(t => t.level === item.level);
    return found || editingTemplate;
  };

  // Toggle selection
  const handleToggleSelect = (paymentId: string) => {
    setSelectedItemIds(prev => 
      prev.includes(paymentId) ? prev.filter(id => id !== paymentId) : [...prev, paymentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItemIds.length === filteredScannedItems.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(filteredScannedItems.map(i => i.payment.id));
    }
  };

  // Trigger batch send
  const handleExecuteBatchSend = async () => {
    const targetItems = scannedItems.filter(i => selectedItemIds.includes(i.payment.id));
    if (targetItems.length === 0) return;

    setIsSending(true);

    const generatedNotifications = targetItems.map(item => {
      const tpl = getItemTemplate(item);
      const renderedTitle = renderTemplateText(tpl.pushTitle, item.variables);
      const renderedContent = renderTemplateText(tpl.pushBody, item.variables);

      // Log dispatch
      const newLog: OverdueDispatchLog = {
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        studentId: item.student?.id || item.payment.studentId,
        studentName: item.variables['{Hoc_Vien}'] || 'Học viên',
        studentCode: item.variables['{Ma_HV}'] || 'HV000',
        guardianName: item.variables['{Phu_Huynh}'],
        paymentId: item.payment.id,
        amount: item.payment.amount,
        dueDate: item.payment.dueDate,
        daysOverdue: Math.max(0, item.daysDifference),
        level: item.level,
        channels: ['push', 'email'],
        sentAt: new Date().toLocaleString('vi-VN'),
        status: 'success'
      };
      appendDispatchLog(newLog);

      return {
        title: renderedTitle,
        content: renderedContent,
        studentId: item.student?.id || item.payment.studentId,
        studentName: item.variables['{Hoc_Vien}'],
        type: 'tuition',
        severity: tpl.severity,
        targetRoles: ['PARENT', 'STUDENT', 'ADMIN']
      };
    });

    // Dispatch to context
    onSendNotifications(generatedNotifications);
    setDispatchLogs(loadDispatchLogs());

    // Update automation stats
    const updatedAuto = {
      ...automationSettings,
      totalAutomatedSent: (automationSettings.totalAutomatedSent || 0) + targetItems.length,
      lastRunTimestamp: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN')
    };
    setAutomationSettings(updatedAuto);
    saveAutomationSettings(updatedAuto);

    setTimeout(() => {
      setIsSending(false);
      if (onSuccessToast) {
        onSuccessToast(`Đã gửi thành công ${targetItems.length} thông báo nhắc học phí đến Phụ huynh & Học viên!`);
      }
    }, 600);
  };

  // Copy quick SMS/Zalo message
  const handleCopyMessage = (item: ScannedOverdueItem) => {
    const tpl = getItemTemplate(item);
    const text = renderTemplateText(tpl.smsBody, item.variables);
    navigator.clipboard.writeText(text);
    setCopiedId(item.payment.id);
    setTimeout(() => setCopiedId(null), 2000);
    if (onSuccessToast) onSuccessToast(`Đã sao chép nội dung Zalo/SMS của ${item.variables['{Hoc_Vien}']}!`);
  };

  // Total debt calculations
  const totalOverdueAmount = scannedItems
    .filter(i => i.daysDifference > 0)
    .reduce((sum, i) => sum + i.payment.amount, 0);

  const totalPendingAmount = scannedItems.reduce((sum, i) => sum + i.payment.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-400/30 text-amber-300 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Bell className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono">
                  HỆ THỐNG TỰ ĐỘNG HÓA
                </span>
                <span className="text-xs text-slate-300 hidden sm:inline">
                  Minh Music Automation Engine
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white font-heading mt-0.5">
                Thông Báo & Nhắc Học Phí Quá Hạn Tự Động
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 py-2">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'scanner'
                  ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Send className="w-4 h-4 text-indigo-600" />
              <span>Quét & Gửi Nhắc Phí ({scannedItems.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'templates'
                  ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Edit3 className="w-4 h-4 text-amber-600" />
              <span>Tùy Biến Mẫu Email / Push ({templates.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('automation')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'automation'
                  ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Lịch Quét Tự Động</span>
              {automationSettings.isEnabled && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <History className="w-4 h-4 text-purple-600" />
              <span>Lịch Sử Gửi ({dispatchLogs.length})</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-semibold">
            <span>Tổng nợ quá hạn:</span>
            <span className="font-extrabold font-mono text-rose-600">
              {totalOverdueAmount.toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          
          {/* TAB 1: SCANNER & BATCH SENDER */}
          {activeTab === 'scanner' && (
            <div className="space-y-6">
              
              {/* Summary KPIs banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100">
                  <span className="text-[11px] text-sky-700 font-bold block">Tổng Phiếu Chưa Thu</span>
                  <span className="text-lg font-black text-slate-900 font-heading">
                    {scannedItems.length} phiếu
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {totalPendingAmount.toLocaleString('vi-VN')} đ
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100">
                  <span className="text-[11px] text-amber-700 font-bold block">Sắp Đến Hạn (3 ngày)</span>
                  <span className="text-lg font-black text-amber-700 font-heading">
                    {scannedItems.filter(i => i.level === 'due_soon').length} học viên
                  </span>
                  <span className="text-[10px] text-amber-600 block">Cần nhắc êm ái</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-100">
                  <span className="text-[11px] text-purple-700 font-bold block">Đến Hạn Hôm Nay</span>
                  <span className="text-lg font-black text-purple-700 font-heading">
                    {scannedItems.filter(i => i.level === 'due_today').length} học viên
                  </span>
                  <span className="text-[10px] text-purple-600 block">Nhắc đúng hạn</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100">
                  <span className="text-[11px] text-rose-700 font-bold block">Quá Hạn Cần Thu Khẩn</span>
                  <span className="text-lg font-black text-rose-700 font-heading">
                    {scannedItems.filter(i => i.daysDifference > 0).length} học viên
                  </span>
                  <span className="text-[10px] text-rose-600 font-mono font-bold block">
                    {totalOverdueAmount.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all"
                  >
                    {selectedItemIds.length === filteredScannedItems.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>

                  {/* Level Filters */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
                    <button
                      onClick={() => setLevelFilter('ALL')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        levelFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'hover:text-slate-900'
                      }`}
                    >
                      Tất cả ({scannedItems.length})
                    </button>
                    <button
                      onClick={() => setLevelFilter('overdue_level_2')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        levelFilter === 'overdue_level_2' ? 'bg-rose-600 text-white' : 'hover:text-slate-900'
                      }`}
                    >
                      Quá hạn &gt; 7 ngày
                    </button>
                    <button
                      onClick={() => setLevelFilter('overdue_level_1')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        levelFilter === 'overdue_level_1' ? 'bg-orange-600 text-white' : 'hover:text-slate-900'
                      }`}
                    >
                      Quá hạn 1-7 ngày
                    </button>
                    <button
                      onClick={() => setLevelFilter('due_today')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        levelFilter === 'due_today' ? 'bg-purple-600 text-white' : 'hover:text-slate-900'
                      }`}
                    >
                      Đến hạn hôm nay
                    </button>
                  </div>
                </div>

                {/* Batch Send Button */}
                <button
                  onClick={handleExecuteBatchSend}
                  disabled={selectedItemIds.length === 0 || isSending}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSending
                      ? 'Đang gửi thông báo...'
                      : `GỬI THÔNG BÁO CHO ${selectedItemIds.length} HỌC VIÊN ĐÃ CHỌN`}
                  </span>
                </button>
              </div>

              {/* Two columns: List of Overdue Items + Live Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Overdue Targets Table (7 cols) */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 flex items-center justify-between">
                      <span>Danh sách học viên cần nhắc học phí ({filteredScannedItems.length})</span>
                      <span className="text-[11px] text-slate-400">Chọn dòng để xem trước mẫu</span>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
                      {filteredScannedItems.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                          Không có khoản học phí nào thuộc bộ lọc này!
                        </div>
                      ) : (
                        filteredScannedItems.map((item) => {
                          const isSelected = selectedItemIds.includes(item.payment.id);
                          const isPreviewing = previewItemId === item.payment.id;

                          return (
                            <div
                              key={item.payment.id}
                              className={`p-3.5 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                                isPreviewing ? 'bg-indigo-50/70 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50'
                              }`}
                              onClick={() => setPreviewItemId(item.payment.id)}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleToggleSelect(item.payment.id);
                                  }}
                                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />

                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-xs text-slate-900">
                                      {item.variables['{Hoc_Vien}']}
                                    </span>
                                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                                      {item.variables['{Ma_HV}']}
                                    </span>
                                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                                      {item.statusLabel}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    {item.variables['{Mon_Hoc}']} • Kỳ: <strong>{item.variables['{Ky_Hoc_Phi}']}</strong> • Hạn nộp: {item.variables['{Han_Nop}']}
                                  </p>
                                </div>
                              </div>

                              <div className="text-right flex-shrink-0 flex items-center gap-2">
                                <div>
                                  <span className="font-black font-mono text-xs text-slate-900 block">
                                    {item.variables['{So_Tien}']} đ
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    PH: {item.variables['{Phu_Huynh}']}
                                  </span>
                                </div>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyMessage(item);
                                  }}
                                  title="Sao chép tin nhắn Zalo/SMS nhanh"
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs transition-colors"
                                >
                                  {copiedId === item.payment.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Live Preview Panel (5 cols) */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-lg flex flex-col justify-between">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-extrabold text-white font-heading">
                          Xem Trước Thực Tế (Live Preview)
                        </span>
                      </div>

                      <div className="bg-slate-800 p-0.5 rounded-lg flex items-center text-[11px] font-bold">
                        <button
                          onClick={() => setPreviewMode('email')}
                          className={`px-2.5 py-1 rounded-md transition-all ${
                            previewMode === 'email' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Mail className="w-3 h-3 inline mr-1" /> Email
                        </button>
                        <button
                          onClick={() => setPreviewMode('push')}
                          className={`px-2.5 py-1 rounded-md transition-all ${
                            previewMode === 'push' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Smartphone className="w-3 h-3 inline mr-1" /> Push App
                        </button>
                      </div>
                    </div>

                    {/* Preview Content */}
                    {currentPreviewItem ? (
                      <div>
                        {previewMode === 'email' ? (
                          /* Email Mockup */
                          <div className="bg-white text-slate-900 rounded-xl p-4 text-xs space-y-3 shadow-inner max-h-[340px] overflow-y-auto">
                            <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                              <span className="font-bold text-slate-500 text-[10px]">Tiêu đề:</span>
                              <span className="font-extrabold text-slate-900 text-[11px] text-right truncate max-w-[240px]">
                                {renderTemplateText(getItemTemplate(currentPreviewItem).emailSubject, currentPreviewItem.variables)}
                              </span>
                            </div>

                            <div className="whitespace-pre-line text-slate-700 leading-relaxed font-sans text-[11px]">
                              {renderTemplateText(getItemTemplate(currentPreviewItem).emailBody, currentPreviewItem.variables)}
                            </div>

                            {/* Bank QR mini preview */}
                            <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-100 flex items-center justify-between">
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-bold text-indigo-900 uppercase">Tài khoản thanh toán</span>
                                <p className="text-[11px] font-black text-slate-900">
                                  {currentPreviewItem.variables['{Ngan_Hang}']} • {currentPreviewItem.variables['{So_Tai_Khoan}']}
                                </p>
                                <p className="text-[10px] text-slate-500 font-mono">
                                  Cú pháp: {currentPreviewItem.variables['{Cu_Phap_Chuyen_Khoan}']}
                                </p>
                              </div>
                              <QrCode className="w-8 h-8 text-indigo-700" />
                            </div>
                          </div>
                        ) : (
                          /* Mobile Push Mockup */
                          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-white space-y-3">
                            <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 shadow-md space-y-1.5 animate-in fade-in">
                              <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-[9px]">
                                    M
                                  </div>
                                  <span className="font-bold text-slate-300">Minh Music Parent Portal</span>
                                </div>
                                <span>Vừa xong</span>
                              </div>
                              <h4 className="font-extrabold text-xs text-amber-300">
                                {renderTemplateText(getItemTemplate(currentPreviewItem).pushTitle, currentPreviewItem.variables)}
                              </h4>
                              <p className="text-[11px] text-slate-300 leading-relaxed">
                                {renderTemplateText(getItemTemplate(currentPreviewItem).pushBody, currentPreviewItem.variables)}
                              </p>
                            </div>

                            <div className="text-[10px] text-slate-400 text-center italic">
                              📱 Hiển thị trên thanh thông báo điện thoại của Phụ huynh & Học viên
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        Chọn một học viên để xem trước thông báo
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: TEMPLATES EDITOR & VARIABLES */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              
              {/* Template selector pills */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {templates.map((tpl) => {
                  const isSelected = selectedTemplateId === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => handleSelectTemplate(tpl.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-500 shadow-xs ring-2 ring-indigo-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            tpl.level === 'overdue_level_2' ? 'bg-rose-100 text-rose-800' :
                            tpl.level === 'overdue_level_1' ? 'bg-orange-100 text-orange-800' :
                            tpl.level === 'due_today' ? 'bg-purple-100 text-purple-800' : 'bg-sky-100 text-sky-800'
                          }`}>
                            {tpl.level === 'overdue_level_2' ? 'Quá hạn > 7 ngày' :
                             tpl.level === 'overdue_level_1' ? 'Quá hạn 1-7 ngày' :
                             tpl.level === 'due_today' ? 'Đúng ngày hạn' : 'Trước hạn 3 ngày'}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-900 font-heading">{tpl.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{tpl.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Template Editor Box */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 font-heading">
                      Chỉnh Sửa: {editingTemplate.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Tùy chỉnh nội dung thông báo gửi qua Email, App Push Notification hoặc Tin nhắn Zalo
                    </p>
                  </div>

                  {/* Channel Switch */}
                  <div className="bg-slate-100 p-0.5 rounded-xl flex items-center text-xs font-bold text-slate-600">
                    <button
                      onClick={() => setTemplateChannel('email')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                        templateChannel === 'email' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" /> Email
                    </button>
                    <button
                      onClick={() => setTemplateChannel('push')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                        templateChannel === 'push' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" /> Push Notification
                    </button>
                    <button
                      onClick={() => setTemplateChannel('sms')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                        templateChannel === 'sms' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> SMS / Zalo
                    </button>
                  </div>
                </div>

                {/* Variable Tokens Chips Bar */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1.5">
                    💡 Nhấp để chèn biến tự động (Placeholder Variables):
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-200/80">
                    {TEMPLATE_VARIABLES.map((v) => (
                      <button
                        key={v.token}
                        type="button"
                        onClick={() => handleInsertToken(v.token)}
                        className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 hover:text-indigo-900 border border-slate-200 hover:border-indigo-300 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title={`${v.desc} (Ví dụ: ${v.example})`}
                      >
                        <span>{v.token}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Channel Fields */}
                {templateChannel === 'email' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Tiêu đề Email (Email Subject)
                      </label>
                      <input
                        type="text"
                        value={editingTemplate.emailSubject}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, emailSubject: e.target.value })}
                        className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Nội dung Email (Email Body Template)
                      </label>
                      <textarea
                        rows={10}
                        value={editingTemplate.emailBody}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, emailBody: e.target.value })}
                        className="w-full text-xs font-mono px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {templateChannel === 'push' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Tiêu đề Push Notification
                      </label>
                      <input
                        type="text"
                        value={editingTemplate.pushTitle}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, pushTitle: e.target.value })}
                        className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Nội dung Push Notification (Ngắn gọn, hiển thị trên thanh thông báo)
                      </label>
                      <textarea
                        rows={4}
                        value={editingTemplate.pushBody}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, pushBody: e.target.value })}
                        className="w-full text-xs font-sans px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {templateChannel === 'sms' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Mẫu tin nhắn SMS / Zalo chuẩn
                      </label>
                      <textarea
                        rows={4}
                        value={editingTemplate.smsBody}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, smsBody: e.target.value })}
                        className="w-full text-xs font-mono px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Độ dài: {editingTemplate.smsBody.length} ký tự (Khuyến nghị &lt; 160 ký tự cho SMS tiêu chuẩn)
                      </p>
                    </div>
                  </div>
                )}

                {/* Footer buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleResetTemplate}
                    className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Khôi phục mẫu gốc</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveTemplate}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu Mẫu Này</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUTOMATION SCHEDULER */}
          {activeTab === 'automation' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
                
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 font-heading">
                      Cấu Hình Quét & Tự Động Gửi Nhắc Phí
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Hệ thống tự động phát hiện các khoản nợ học phí và tự động gửi thông báo theo lịch trình đã đặt
                    </p>
                  </div>

                  {/* Enable toggle */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={automationSettings.isEnabled}
                      onChange={(e) => setAutomationSettings({ ...automationSettings, isEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* Automation Rules */}
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Khung giờ quét tự động hàng ngày
                      </label>
                      <input
                        type="time"
                        value={automationSettings.scheduledTime}
                        onChange={(e) => setAutomationSettings({ ...automationSettings, scheduledTime: e.target.value })}
                        className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Khuyến nghị: 08:00 - 09:30 sáng
                      </span>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Nhắc nhở trước hạn (ngày)
                      </label>
                      <select
                        value={automationSettings.notifyBeforeDays}
                        onChange={(e) => setAutomationSettings({ ...automationSettings, notifyBeforeDays: Number(e.target.value) })}
                        className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                      >
                        <option value={1}>Trước 1 ngày</option>
                        <option value={2}>Trước 2 ngày</option>
                        <option value={3}>Trước 3 ngày (Khuyến nghị)</option>
                        <option value={5}>Trước 5 ngày</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <label className="font-bold text-slate-800 block">Kênh phát thông báo tự động:</label>
                    
                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={automationSettings.enablePushInApp}
                        onChange={(e) => setAutomationSettings({ ...automationSettings, enablePushInApp: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <div>
                        <span className="font-extrabold text-slate-900 block">Push Notification & Trung Tâm Thông Báo App</span>
                        <span className="text-[11px] text-slate-500">Gửi trực tiếp vào Cổng Phụ Huynh / Học Viên trên điện thoại</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={automationSettings.enableEmail}
                        onChange={(e) => setAutomationSettings({ ...automationSettings, enableEmail: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <div>
                        <span className="font-extrabold text-slate-900 block">Email Tự Động Kèm Hóa Đơn & Mã VietQR</span>
                        <span className="text-[11px] text-slate-500">Gửi thông báo học phí chi tiết tới hòm thư của phụ huynh</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={automationSettings.attachVietQr}
                        onChange={(e) => setAutomationSettings({ ...automationSettings, attachVietQr: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <div>
                        <span className="font-extrabold text-slate-900 block">Tự động sinh mã VietQR và cú pháp chuyển khoản</span>
                        <span className="text-[11px] text-slate-500">Giúp phụ huynh chỉ cần quét mã là thanh toán chính xác 100%</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Status overview */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="font-extrabold text-emerald-900 block">
                        Trạng thái: {automationSettings.isEnabled ? 'Đang kích hoạt tự động' : 'Đang tạm dừng'}
                      </span>
                      <span className="text-[11px] text-emerald-700">
                        Lần chạy gần nhất: {automationSettings.lastRunTimestamp || 'Hôm nay lúc 08:30'}
                      </span>
                    </div>
                  </div>

                  <span className="font-black font-mono text-emerald-800">
                    Đã gửi tự động: {automationSettings.totalAutomatedSent || 0} lượt
                  </span>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleSaveAutomation}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    Lưu Cấu Hình Tự Động Hóa
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DISPATCH HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-3.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Nhật ký phát thông báo nhắc phí gần nhất ({dispatchLogs.length})</span>
                  <span className="text-[11px] text-slate-400">Tự động lưu trữ 100 bản ghi</span>
                </div>

                <div className="divide-y divide-slate-100 max-h-[440px] overflow-y-auto">
                  {dispatchLogs.map((log) => (
                    <div key={log.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900">{log.studentName}</span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                            {log.studentCode}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            log.level === 'overdue_level_2' ? 'bg-rose-100 text-rose-800' :
                            log.level === 'overdue_level_1' ? 'bg-orange-100 text-orange-800' :
                            log.level === 'due_today' ? 'bg-purple-100 text-purple-800' : 'bg-sky-100 text-sky-800'
                          }`}>
                            {log.level === 'overdue_level_2' ? 'Quá hạn nặng' :
                             log.level === 'overdue_level_1' ? 'Quá hạn 1-7 ngày' :
                             log.level === 'due_today' ? 'Đến hạn' : 'Sắp đến hạn'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Số tiền: <strong>{log.amount.toLocaleString('vi-VN')} đ</strong> • Kênh: {log.channels.join(', ').toUpperCase()} • Gửi lúc: {log.sentAt}
                        </p>
                      </div>

                      <span className="text-[11px] font-extrabold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đã gửi thành công
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            <span className="font-bold text-slate-700">Minh Music CRM:</span> Thông báo được đồng bộ thời gian thực tới Cổng phụ huynh & Cổng học viên.
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
