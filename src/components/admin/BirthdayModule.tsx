import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { BirthdayItem, BirthdayTemplate, UserRole } from '../../types';
import { 
  Cake, 
  Calendar as CalendarIcon, 
  Send, 
  Sparkles, 
  Search, 
  Filter, 
  Phone, 
  Music, 
  UserCheck, 
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  Heart,
  MessageSquare,
  Gift
} from 'lucide-react';

export const BirthdayModule: React.FC = () => {
  const { 
    getAllBirthdays, 
    getTodayBirthdays, 
    getTomorrowBirthdays, 
    get7DaysBirthdays, 
    getMonthBirthdays,
    birthdayTemplates,
    addBirthdayTemplate,
    updateBirthdayTemplate,
    deleteBirthdayTemplate,
    sendBirthdayWish
  } = useData();

  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow' | '7days' | 'this_month' | 'calendar' | 'templates'>('today');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STUDENT' | 'TEACHER'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Wish modal state
  const [selectedItemForWish, setSelectedItemForWish] = useState<BirthdayItem | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [customWishContent, setCustomWishContent] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Template edit modal state
  const [editingTemplate, setEditingTemplate] = useState<BirthdayTemplate | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [tplTitle, setTplTitle] = useState<string>('');
  const [tplContent, setTplContent] = useState<string>('');
  const [tplAudience, setTplAudience] = useState<'ALL' | 'STUDENT' | 'TEACHER'>('ALL');

  const todayList = getTodayBirthdays();
  const tomorrowList = getTomorrowBirthdays();
  const next7DaysList = get7DaysBirthdays();
  const thisMonthList = getMonthBirthdays();
  const allList = getAllBirthdays();

  // Determine active list
  let currentList: BirthdayItem[] = [];
  if (activeTab === 'today') currentList = todayList;
  else if (activeTab === 'tomorrow') currentList = tomorrowList;
  else if (activeTab === '7days') currentList = next7DaysList;
  else if (activeTab === 'this_month') currentList = thisMonthList;
  else if (activeTab === 'calendar') currentList = allList;

  // Filter list
  const filteredList = currentList.filter(item => {
    if (roleFilter !== 'ALL' && item.role !== roleFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || (item.phone && item.phone.includes(q)) || (item.classNameOrSubject && item.classNameOrSubject.toLowerCase().includes(q));
    }
    return true;
  });

  const handleOpenWishModal = (item: BirthdayItem) => {
    setSelectedItemForWish(item);
    // Find suitable template
    const suitable = birthdayTemplates.find(t => t.targetAudience === item.role || t.targetAudience === 'ALL') || birthdayTemplates[0];
    if (suitable) {
      setSelectedTemplateId(suitable.id);
      const replaced = suitable.content
        .replace('{name}', item.name)
        .replace('{age}', String(item.age));
      setCustomWishContent(replaced);
    } else {
      setCustomWishContent(`🎉 Chúc mừng sinh nhật ${item.name}! Chúc bạn tuổi mới luôn rực rỡ và thành công! 🎂🎹✨`);
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tpl = birthdayTemplates.find(t => t.id === templateId);
    if (tpl && selectedItemForWish) {
      const replaced = tpl.content
        .replace('{name}', selectedItemForWish.name)
        .replace('{age}', String(selectedItemForWish.age));
      setCustomWishContent(replaced);
    }
  };

  const handleConfirmSendWish = async () => {
    if (!selectedItemForWish) return;
    setIsSending(true);
    const res = await sendBirthdayWish(selectedItemForWish, customWishContent);
    setIsSending(false);
    setSelectedItemForWish(null);
    setToastMessage(res.message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveTemplate = () => {
    if (!tplTitle.trim() || !tplContent.trim()) return;
    if (editingTemplate) {
      updateBirthdayTemplate(editingTemplate.id, {
        title: tplTitle,
        content: tplContent,
        targetAudience: tplAudience
      });
    } else {
      addBirthdayTemplate({
        title: tplTitle,
        content: tplContent,
        targetAudience: tplAudience
      });
    }
    setIsTemplateModalOpen(false);
    setEditingTemplate(null);
    setTplTitle('');
    setTplContent('');
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-amber-500/30 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header with KPI Summary */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-15 pointer-events-none transform translate-x-8 -translate-y-4">
          <Cake className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-extrabold uppercase tracking-wider text-amber-100 flex items-center gap-1.5">
                <Cake className="w-3.5 h-3.5" />
                MINH MUSIC BIRTHDAY CENTER
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 font-heading tracking-tight">
              Quản Lý Sinh Nhật Học Viên & Giáo Viên
            </h1>
            <p className="text-rose-100 text-xs sm:text-sm mt-1 max-w-xl">
              Tự động phát hiện sinh nhật theo thời gian thực, quản lý mẫu thiệp chúc mừng, tạo dấu ấn gắn kết cùng Minh Music Center.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 text-center border border-white/20">
              <p className="text-[11px] text-rose-100 font-medium">Hôm nay</p>
              <p className="text-2xl font-black mt-0.5">{todayList.length}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 text-center border border-white/20">
              <p className="text-[11px] text-rose-100 font-medium">Ngày mai</p>
              <p className="text-2xl font-black mt-0.5">{tomorrowList.length}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 text-center border border-white/20">
              <p className="text-[11px] text-rose-100 font-medium">7 ngày tới</p>
              <p className="text-2xl font-black mt-0.5">{next7DaysList.length}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 text-center border border-white/20">
              <p className="text-[11px] text-rose-100 font-medium">Tháng này</p>
              <p className="text-2xl font-black mt-0.5">{thisMonthList.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs and Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl">
            <button
              id="tab-bday-today"
              onClick={() => setActiveTab('today')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'today'
                  ? 'bg-white text-rose-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🎂 Hôm nay</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'today' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'}`}>
                {todayList.length}
              </span>
            </button>

            <button
              id="tab-bday-tomorrow"
              onClick={() => setActiveTab('tomorrow')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'tomorrow'
                  ? 'bg-white text-amber-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Ngày mai</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
                {tomorrowList.length}
              </span>
            </button>

            <button
              id="tab-bday-7days"
              onClick={() => setActiveTab('7days')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === '7days'
                  ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>7 ngày tới</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
                {next7DaysList.length}
              </span>
            </button>

            <button
              id="tab-bday-month"
              onClick={() => setActiveTab('this_month')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'this_month'
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Tháng này</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
                {thisMonthList.length}
              </span>
            </button>

            <button
              id="tab-bday-calendar"
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'calendar'
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Lịch sinh nhật</span>
            </button>

            <button
              id="tab-bday-templates"
              onClick={() => setActiveTab('templates')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'templates'
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Mẫu Lời Chúc ({birthdayTemplates.length})</span>
            </button>
          </div>

          {/* Role Filter & Search (When not on templates) */}
          {activeTab !== 'templates' && (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Role filter buttons */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setRoleFilter('ALL')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${roleFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'}`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setRoleFilter('STUDENT')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${roleFilter === 'STUDENT' ? 'bg-emerald-50 text-emerald-700 shadow-xs font-bold' : 'text-slate-600'}`}
                >
                  Học viên
                </button>
                <button
                  onClick={() => setRoleFilter('TEACHER')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${roleFilter === 'TEACHER' ? 'bg-blue-50 text-blue-700 shadow-xs font-bold' : 'text-slate-600'}`}
                >
                  Giáo viên
                </button>
              </div>

              {/* Search box */}
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm tên, sđt, lớp..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 w-full sm:w-48"
                />
              </div>
            </div>
          )}
        </div>

        {/* TAB CONTENT: CARDS VIEW */}
        {activeTab !== 'calendar' && activeTab !== 'templates' && (
          <div>
            {filteredList.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Cake className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">Không có sinh nhật nào trong danh mục này</p>
                <p className="text-xs text-slate-400 mt-1">Hãy kiểm tra các mốc thời gian khác trên thanh điều hướng</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredList.map((item) => {
                  const isToday = item.daysUntilBirthday === 0;
                  const isTomorrow = item.daysUntilBirthday === 1;

                  return (
                    <div
                      key={`${item.role}-${item.id}`}
                      className={`relative rounded-xl p-5 border transition-all hover:shadow-md flex flex-col justify-between ${
                        isToday
                          ? 'bg-gradient-to-br from-rose-50/80 via-amber-50/40 to-white border-rose-200 shadow-xs ring-2 ring-rose-400/30'
                          : isTomorrow
                          ? 'bg-amber-50/30 border-amber-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                            item.role === 'STUDENT'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {item.role === 'STUDENT' ? 'Học viên' : 'Giáo viên'}
                        </span>

                        <div className="flex items-center gap-1">
                          {isToday ? (
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-extrabold flex items-center gap-1 animate-bounce">
                              <Sparkles className="w-3 h-3" />
                              Hôm nay 🎉
                            </span>
                          ) : isTomorrow ? (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold">
                              Ngày mai
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                              Còn {item.daysUntilBirthday} ngày
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Main Profile Info */}
                      <div className="flex items-center gap-3.5 mb-4">
                        {item.avatar ? (
                          <img
                            src={item.avatar}
                            alt={item.name}
                            className="w-14 h-14 rounded-xl object-cover ring-2 ring-amber-500/20"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-amber-600 to-rose-600 text-white flex items-center justify-center font-bold text-lg">
                            {item.name.charAt(0)}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-extrabold text-slate-900 truncate font-heading">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold mt-0.5">
                            <Cake className="w-3.5 h-3.5 text-rose-500" />
                            <span>Tròn {item.age} tuổi</span>
                            <span className="text-slate-400 font-normal">({item.birthDate})</span>
                          </div>
                          {item.classNameOrSubject && (
                            <p className="text-[11px] text-slate-600 mt-1 truncate flex items-center gap-1">
                              <Music className="w-3 h-3 text-slate-400" />
                              {item.classNameOrSubject}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Footer & Action */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        {item.phone ? (
                          <a
                            href={`tel:${item.phone}`}
                            className="text-xs text-slate-600 hover:text-amber-700 flex items-center gap-1 font-medium truncate"
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.phone}</span>
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Chưa có SĐT</span>
                        )}

                        <button
                          id={`btn-send-wish-${item.id}`}
                          onClick={() => handleOpenWishModal(item)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                            isToday
                              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                          }`}
                        >
                          <Gift className="w-3.5 h-3.5" />
                          <span>Gửi Lời Chúc</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: CALENDAR VIEW */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Lịch Sinh Nhật Toàn Bộ Trung Tâm Minh Music</h3>
                <p className="text-xs text-slate-500">Xem trước sinh nhật các tháng trong năm để chuẩn bị quà và thiệp chúc mừng.</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-200">
                Tổng cộng {allList.length} sinh nhật
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                const monthBirthdays = getMonthBirthdays(month);
                const isCurrentMonth = new Date().getMonth() + 1 === month;

                return (
                  <div
                    key={month}
                    className={`rounded-xl p-4 border transition-all ${
                      isCurrentMonth
                        ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-400/20'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-slate-900 font-heading">
                          Tháng {month}
                        </span>
                        {isCurrentMonth && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold">
                            Tháng này
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-500">
                        {monthBirthdays.length} người
                      </span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {monthBirthdays.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-2">Không có sinh nhật nào</p>
                      ) : (
                        monthBirthdays.map((b) => (
                          <div
                            key={b.id}
                            className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 hover:bg-amber-50/50 transition-colors"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="font-bold text-slate-800 truncate">{b.name}</p>
                              <p className="text-[11px] text-slate-500">
                                {b.birthDate} • Tròn {b.age} tuổi
                              </p>
                            </div>
                            <button
                              onClick={() => handleOpenWishModal(b)}
                              className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-md transition-colors"
                              title="Gửi thiệp chúc"
                            >
                              <Gift className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB CONTENT: BIRTHDAY TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Quản Lý Mẫu Lời Chúc Sinh Nhật</h3>
                <p className="text-xs text-slate-500">
                  Tùy chỉnh các lời chúc có sẵn theo từng đối tượng: Học viên nhí, Guitar, Thanh nhạc, Giáo viên...
                </p>
              </div>
              <button
                id="btn-add-birthday-template"
                onClick={() => {
                  setEditingTemplate(null);
                  setTplTitle('');
                  setTplContent('');
                  setTplAudience('ALL');
                  setIsTemplateModalOpen(true);
                }}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Mẫu Mới</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {birthdayTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-xs font-bold text-slate-900">{tpl.title}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                        {tpl.targetAudience === 'STUDENT' ? 'Học viên' : tpl.targetAudience === 'TEACHER' ? 'Giáo viên' : 'Tất cả'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed font-sans">
                      {tpl.content}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingTemplate(tpl);
                        setTplTitle(tpl.title);
                        setTplContent(tpl.content);
                        setTplAudience(tpl.targetAudience);
                        setIsTemplateModalOpen(true);
                      }}
                      className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-slate-100 rounded-md text-xs font-medium flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </button>
                    <button
                      onClick={() => deleteBirthdayTemplate(tpl.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md text-xs font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: GỬI LỜI CHÚC MỪNG SINH NHẬT */}
      {selectedItemForWish && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Cake className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-heading">
                    Gửi Lời Chúc Mừng Sinh Nhật
                  </h3>
                  <p className="text-xs text-slate-500">Tới: {selectedItemForWish.name} (Tròn {selectedItemForWish.age} tuổi)</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItemForWish(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4">
              {/* Select template */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Chọn mẫu lời chúc có sẵn:
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleSelectTemplate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium text-slate-800"
                >
                  {birthdayTemplates.map(tpl => (
                    <option key={tpl.id} value={tpl.id}>{tpl.title}</option>
                  ))}
                </select>
              </div>

              {/* Message Content */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nội dung lời chúc (có thể chỉnh sửa trực tiếp):
                </label>
                <textarea
                  rows={4}
                  value={customWishContent}
                  onChange={(e) => setCustomWishContent(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
                  placeholder="Nhập lời chúc mừng sinh nhật..."
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  💡 Hệ thống sẽ bắn pháo hoa confetti và lưu thông báo chúc mừng tới tài khoản của người nhận.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedItemForWish(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy bỏ
              </button>
              <button
                id="btn-confirm-send-wish"
                onClick={handleConfirmSendWish}
                disabled={isSending}
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 rounded-lg shadow-md flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSending ? 'Đang gửi...' : 'Gửi Lời Chúc 🎉'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: THÊM / SỬA MẪU LỜI CHÚC */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                {editingTemplate ? 'Sửa Mẫu Lời Chúc' : 'Thêm Mẫu Lời Chúc Mới'}
              </h3>
              <button onClick={() => setIsTemplateModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề mẫu:</label>
                <input
                  type="text"
                  value={tplTitle}
                  onChange={(e) => setTplTitle(e.target.value)}
                  placeholder="Ví dụ: Chúc mừng học viên Piano..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Đối tượng áp dụng:</label>
                <select
                  value={tplAudience}
                  onChange={(e) => setTplAudience(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="ALL">Tất cả</option>
                  <option value="STUDENT">Học viên</option>
                  <option value="TEACHER">Giáo viên</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nội dung lời chúc (hỗ trợ biến {'{name}'} và {'{age}'}):
                </label>
                <textarea
                  rows={4}
                  value={tplContent}
                  onChange={(e) => setTplContent(e.target.value)}
                  placeholder="Nhập nội dung lời chúc mẫu..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveTemplate}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm"
              >
                Lưu Mẫu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
