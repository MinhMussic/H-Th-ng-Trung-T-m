import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { 
  MusicEvent, 
  MusicEventType, 
  EventAudience, 
  CenterHoliday 
} from '../../types';
import { 
  Calendar as CalendarIcon, 
  CalendarDays, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Users, 
  Music, 
  GraduationCap, 
  Sparkles, 
  Palmtree, 
  Trophy, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  Download, 
  Bell, 
  Eye, 
  X, 
  Check, 
  UserPlus, 
  UserMinus, 
  Flame, 
  Tag, 
  RotateCcw,
  CalendarCheck,
  Building,
  Info
} from 'lucide-react';

const EVENT_TYPE_CONFIG: Record<MusicEventType, {
  label: string;
  icon: any;
  badgeBg: string;
  badgeText: string;
  cardBorder: string;
  bgLight: string;
  defaultColor: string;
}> = {
  recital: {
    label: 'Hòa Nhạc & Báo Cáo',
    icon: Music,
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    badgeText: 'text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700',
    cardBorder: 'border-l-amber-500',
    bgLight: 'bg-amber-50/50 dark:bg-amber-950/20',
    defaultColor: '#d97706'
  },
  masterclass: {
    label: 'Masterclass Chuyên Sâu',
    icon: GraduationCap,
    badgeBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    badgeText: 'text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700',
    cardBorder: 'border-l-purple-500',
    bgLight: 'bg-purple-50/50 dark:bg-purple-950/20',
    defaultColor: '#8b5cf6'
  },
  holiday: {
    label: 'Nghỉ Lễ Toàn Hệ Thống',
    icon: Palmtree,
    badgeBg: 'bg-rose-500/10 dark:bg-rose-500/20',
    badgeText: 'text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700',
    cardBorder: 'border-l-rose-500',
    bgLight: 'bg-rose-50/50 dark:bg-rose-950/20',
    defaultColor: '#ef4444'
  },
  workshop: {
    label: 'Workshop & Tọa Đàm',
    icon: Sparkles,
    badgeBg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    badgeText: 'text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700',
    cardBorder: 'border-l-cyan-500',
    bgLight: 'bg-cyan-50/50 dark:bg-cyan-950/20',
    defaultColor: '#06b6d4'
  },
  competition: {
    label: 'Cuộc Thi & Festival',
    icon: Trophy,
    badgeBg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
    badgeText: 'text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
    cardBorder: 'border-l-yellow-500',
    bgLight: 'bg-yellow-50/50 dark:bg-yellow-950/20',
    defaultColor: '#eab308'
  },
  exam: {
    label: 'Kỳ Thi & Khảo Thí',
    icon: FileText,
    badgeBg: 'bg-slate-500/10 dark:bg-slate-500/20',
    badgeText: 'text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    cardBorder: 'border-l-slate-500',
    bgLight: 'bg-slate-50/50 dark:bg-slate-950/20',
    defaultColor: '#64748b'
  },
  other: {
    label: 'Sự Kiện Khác',
    icon: Tag,
    badgeBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    badgeText: 'text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700',
    cardBorder: 'border-l-indigo-500',
    bgLight: 'bg-indigo-50/50 dark:bg-indigo-950/20',
    defaultColor: '#4f46e5'
  }
};

const AUDIENCE_LABELS: Record<EventAudience, string> = {
  ALL: 'Tất cả đối tượng',
  STUDENT: 'Học viên',
  TEACHER: 'Giáo viên',
  PARENT: 'Phụ huynh',
  PUBLIC: 'Cộng đồng / Khách tự do'
};

const STATUS_CONFIG = {
  upcoming: { label: 'Sắp diễn ra', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  ongoing: { label: 'Đang diễn ra', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 animate-pulse' },
  completed: { label: 'Đã hoàn thành', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
  cancelled: { label: 'Đã hủy', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800 line-through' }
};

export const EventsManagement: React.FC = () => {
  const { 
    events, 
    addEvent, 
    updateEvent, 
    deleteEvent, 
    registerStudentForEvent, 
    cancelStudentEventRegistration, 
    resetEventsToDefault, 
    holidays,
    students,
    branches,
    addNotification 
  } = useData();

  // Navigation & View mode
  const [viewMode, setViewMode] = useState<'calendar' | 'week' | 'list' | 'holidays'>('calendar');
  
  // Date State for Calendar Navigation (defaults to August 2026 or current system date)
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(() => {
    // Current simulated date is in 2026
    return new Date(2026, 7, 1); // August 2026
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [audienceFilter, setAudienceFilter] = useState<string>('all');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<MusicEvent | null>(null);
  const [viewingDetailEvent, setViewingDetailEvent] = useState<MusicEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<MusicEvent | null>(null);
  const [studentToEnroll, setStudentToEnroll] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    type: MusicEventType;
    description: string;
    startDate: string;
    endDate: string;
    isMultiDay: boolean;
    startTime: string;
    endTime: string;
    location: string;
    branchId: string;
    instructorOrHost: string;
    targetAudience: EventAudience;
    maxParticipants: number;
    registrationFee: number;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    isFeatured: boolean;
    color: string;
    notes: string;
  }>({
    title: '',
    type: 'recital',
    description: '',
    startDate: '2026-08-25',
    endDate: '2026-08-25',
    isMultiDay: false,
    startTime: '18:30',
    endTime: '21:00',
    location: 'Khán phòng Tầng 3 - Minh Music Center',
    branchId: 'branch-01',
    instructorOrHost: '',
    targetAudience: 'ALL',
    maxParticipants: 100,
    registrationFee: 0,
    status: 'upcoming',
    isFeatured: false,
    color: '#d97706',
    notes: ''
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open Add Modal with optional preset date
  const handleOpenAddModal = (presetDate?: string) => {
    setEditingEvent(null);
    const dateStr = presetDate || new Date().toISOString().split('T')[0];
    setFormData({
      title: '',
      type: 'recital',
      description: '',
      startDate: dateStr,
      endDate: dateStr,
      isMultiDay: false,
      startTime: '18:30',
      endTime: '21:00',
      location: 'Khán phòng Tầng 3 - Minh Music Center',
      branchId: branches[0]?.id || 'branch-01',
      instructorOrHost: '',
      targetAudience: 'ALL',
      maxParticipants: 100,
      registrationFee: 0,
      status: 'upcoming',
      isFeatured: false,
      color: '#d97706',
      notes: ''
    });
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (evt: MusicEvent) => {
    setEditingEvent(evt);
    setFormData({
      title: evt.title,
      type: evt.type,
      description: evt.description || '',
      startDate: evt.startDate,
      endDate: evt.endDate || evt.startDate,
      isMultiDay: !!evt.endDate && evt.endDate !== evt.startDate,
      startTime: evt.startTime || '18:30',
      endTime: evt.endTime || '21:00',
      location: evt.location || '',
      branchId: evt.branchId || 'all',
      instructorOrHost: evt.instructorOrHost || '',
      targetAudience: evt.targetAudience || 'ALL',
      maxParticipants: evt.maxParticipants || 100,
      registrationFee: evt.registrationFee || 0,
      status: evt.status,
      isFeatured: !!evt.isFeatured,
      color: evt.color || EVENT_TYPE_CONFIG[evt.type]?.defaultColor || '#d97706',
      notes: evt.notes || ''
    });
    setIsFormModalOpen(true);
  };

  // Save Event Handler
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Vui lòng nhập tên sự kiện');
      return;
    }
    if (!formData.startDate) {
      showToast('Vui lòng chọn ngày bắt đầu');
      return;
    }

    const selectedBranch = branches.find(b => b.id === formData.branchId);
    const branchName = formData.branchId === 'all' 
      ? 'Tất cả các cơ sở' 
      : (selectedBranch ? `${selectedBranch.name} (${selectedBranch.address})` : '');

    const eventPayload = {
      title: formData.title.trim(),
      type: formData.type,
      description: formData.description.trim(),
      startDate: formData.startDate,
      endDate: formData.isMultiDay ? formData.endDate : formData.startDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location.trim(),
      branchId: formData.branchId,
      branchName,
      instructorOrHost: formData.instructorOrHost.trim(),
      targetAudience: formData.targetAudience,
      maxParticipants: Number(formData.maxParticipants) || 0,
      registrationFee: Number(formData.registrationFee) || 0,
      status: formData.status,
      isFeatured: formData.isFeatured,
      color: formData.color,
      notes: formData.notes.trim()
    };

    if (editingEvent) {
      updateEvent(editingEvent.id, eventPayload);
      showToast(`Đã cập nhật sự kiện "${formData.title}"`);
      // Update viewing detail if open
      if (viewingDetailEvent?.id === editingEvent.id) {
        setViewingDetailEvent({ ...viewingDetailEvent, ...eventPayload });
      }
    } else {
      addEvent(eventPayload);
      showToast(`Đã tạo mới sự kiện "${formData.title}" thành công!`);
    }

    setIsFormModalOpen(false);
  };

  // Delete Event Handler
  const handleConfirmDelete = () => {
    if (!deletingEvent) return;
    deleteEvent(deletingEvent.id);
    showToast(`Đã xóa sự kiện "${deletingEvent.title}"`);
    setDeletingEvent(null);
    if (viewingDetailEvent?.id === deletingEvent.id) {
      setViewingDetailEvent(null);
    }
  };

  // Enroll Student to Event
  const handleEnrollStudent = (eventId: string) => {
    if (!studentToEnroll) {
      showToast('Vui lòng chọn học viên');
      return;
    }
    const res = registerStudentForEvent(eventId, studentToEnroll);
    if (res.success) {
      showToast(res.message || 'Đã ghi danh học viên thành công');
      setStudentToEnroll('');
      // Refresh current viewing detail
      const updated = events.find(e => e.id === eventId);
      if (updated) {
        setViewingDetailEvent({
          ...updated,
          registeredStudentIds: [...(updated.registeredStudentIds || []), studentToEnroll]
        });
      }
    } else {
      showToast(res.message || 'Không thể ghi danh');
    }
  };

  // Unenroll Student from Event
  const handleUnenrollStudent = (eventId: string, studentId: string) => {
    cancelStudentEventRegistration(eventId, studentId);
    showToast('Đã hủy ghi danh học viên');
    if (viewingDetailEvent?.id === eventId) {
      setViewingDetailEvent({
        ...viewingDetailEvent,
        registeredStudentIds: (viewingDetailEvent.registeredStudentIds || []).filter(id => id !== studentId)
      });
    }
  };

  // Broadcast Reminder Notification
  const handleBroadcastReminder = (evt: MusicEvent) => {
    addNotification({
      title: `🔔 Nhắc hẹn sự kiện: ${evt.title}`,
      content: `Sự kiện "${evt.title}" sẽ diễn ra vào ngày ${evt.startDate} (${evt.startTime || 'Cả ngày'})${evt.location ? ` tại ${evt.location}` : ''}. Quý phụ huynh và học viên vui lòng có mặt đúng giờ!`,
      type: 'event',
      targetAudience: evt.targetAudience,
      severity: 'alert'
    });
    showToast(`Đã phát thông báo nhắc hẹn sự kiện "${evt.title}" tới toàn thể đối tượng!`);
  };

  // Export to Google Calendar
  const handleExportGoogleCalendar = (evt: MusicEvent) => {
    const startIso = evt.startDate.replace(/-/g, '') + 'T' + (evt.startTime ? evt.startTime.replace(/:/g, '') + '00' : '090000');
    const endIso = (evt.endDate || evt.startDate).replace(/-/g, '') + 'T' + (evt.endTime ? evt.endTime.replace(/:/g, '') + '00' : '110000');
    const title = encodeURIComponent(evt.title);
    const details = encodeURIComponent(`${evt.description || ''}\n\nChủ trì/Giảng viên: ${evt.instructorOrHost || 'Minh Music'}\nĐịa điểm: ${evt.location || ''}`);
    const location = encodeURIComponent(evt.location || 'Minh Music Center');
    
    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
    window.open(googleCalUrl, '_blank');
  };

  // Download iCal (.ics) File
  const handleDownloadIcs = (evt: MusicEvent) => {
    const startIso = evt.startDate.replace(/-/g, '') + 'T' + (evt.startTime ? evt.startTime.replace(/:/g, '') + '00' : '090000');
    const endIso = (evt.endDate || evt.startDate).replace(/-/g, '') + 'T' + (evt.endTime ? evt.endTime.replace(/:/g, '') + '00' : '110000');
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Minh Music Center//Event Calendar//VN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${evt.id}@minhmusic.vn`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      `SUMMARY:${evt.title}`,
      `DESCRIPTION:${(evt.description || '').replace(/\n/g, '\\n')}`,
      `LOCATION:${evt.location || 'Minh Music Center'}`,
      `STATUS:${evt.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${evt.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã tải xuống file iCalendar (.ics)');
  };

  // Filtered Events List
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = evt.title.toLowerCase().includes(q);
        const matchHost = evt.instructorOrHost?.toLowerCase().includes(q);
        const matchLoc = evt.location?.toLowerCase().includes(q);
        const matchDesc = evt.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchHost && !matchLoc && !matchDesc) return false;
      }
      // Type
      if (typeFilter !== 'all' && evt.type !== typeFilter) return false;
      // Status
      if (statusFilter !== 'all' && evt.status !== statusFilter) return false;
      // Branch
      if (branchFilter !== 'all' && evt.branchId !== 'all' && evt.branchId !== branchFilter) return false;
      // Audience
      if (audienceFilter !== 'all' && evt.targetAudience !== 'ALL' && evt.targetAudience !== audienceFilter) return false;

      return true;
    }).sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [events, searchQuery, typeFilter, statusFilter, branchFilter, audienceFilter]);

  // Combined Events & Holidays for Calendar view
  const calendarItemsByDate = useMemo(() => {
    const map: Record<string, { events: MusicEvent[]; holidays: CenterHoliday[] }> = {};

    // Put Events
    events.forEach(evt => {
      const d = evt.startDate;
      if (!map[d]) map[d] = { events: [], holidays: [] };
      map[d].events.push(evt);
    });

    // Put Holidays
    holidays.filter(h => h.isActive).forEach(hol => {
      // If single or multi-day
      const cur = new Date(hol.startDate);
      const end = new Date(hol.endDate || hol.startDate);
      while (cur <= end) {
        const dStr = cur.toISOString().split('T')[0];
        if (!map[dStr]) map[dStr] = { events: [], holidays: [] };
        if (!map[dStr].holidays.some(h => h.id === hol.id)) {
          map[dStr].holidays.push(hol);
        }
        cur.setDate(cur.getDate() + 1);
      }
    });

    return map;
  }, [events, holidays]);

  // Statistics Summary
  const stats = useMemo(() => {
    const total = events.length;
    const recitals = events.filter(e => e.type === 'recital').length;
    const masterclasses = events.filter(e => e.type === 'masterclass').length;
    const workshopsAndCompetitions = events.filter(e => e.type === 'workshop' || e.type === 'competition').length;
    const upcomingCount = events.filter(e => e.status === 'upcoming' || e.status === 'ongoing').length;
    const totalParticipants = events.reduce((acc, curr) => acc + (curr.registeredStudentIds?.length || curr.currentParticipants || 0), 0);
    return { total, recitals, masterclasses, workshopsAndCompetitions, upcomingCount, totalParticipants };
  }, [events]);

  // Month Grid Calculation for Month View
  const calendarDays = useMemo(() => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Monday as start of week (0: Monday, 6: Sunday)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: Array<{
      date: Date;
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      events: MusicEvent[];
      holidays: CenterHoliday[];
    }> = [];

    // Previous month filler days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      const dStr = d.toISOString().split('T')[0];
      const todayStr = new Date().toISOString().split('T')[0];
      days.push({
        date: d,
        dateStr: dStr,
        dayNumber: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        events: calendarItemsByDate[dStr]?.events || [],
        holidays: calendarItemsByDate[dStr]?.holidays || []
      });
    }

    // Current month days
    const totalDaysInMonth = lastDayOfMonth.getDate();
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const d = new Date(year, month, day);
      const dStr = d.toISOString().split('T')[0];
      const todayStr = new Date().toISOString().split('T')[0];
      days.push({
        date: d,
        dateStr: dStr,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
        events: calendarItemsByDate[dStr]?.events || [],
        holidays: calendarItemsByDate[dStr]?.holidays || []
      });
    }

    // Next month filler days to complete 35 or 42 grid cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let day = 1; day <= remainingCells; day++) {
      const d = new Date(year, month + 1, day);
      const dStr = d.toISOString().split('T')[0];
      const todayStr = new Date().toISOString().split('T')[0];
      days.push({
        date: d,
        dateStr: dStr,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        events: calendarItemsByDate[dStr]?.events || [],
        holidays: calendarItemsByDate[dStr]?.holidays || []
      });
    }

    return days;
  }, [currentCalendarDate, calendarItemsByDate]);

  // Week Grid Calculation for Week View
  const weekDays = useMemo(() => {
    const cur = new Date(currentCalendarDate);
    // Find Monday of the current selected date
    let dayOfWeek = cur.getDay() - 1;
    if (dayOfWeek === -1) dayOfWeek = 6;
    cur.setDate(cur.getDate() - dayOfWeek);

    const days = [];
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < 7; i++) {
      const d = new Date(cur);
      d.setDate(cur.getDate() + i);
      const dStr = d.toISOString().split('T')[0];
      days.push({
        date: d,
        dateStr: dStr,
        dayName: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'][i],
        dayNumber: d.getDate(),
        isToday: dStr === todayStr,
        events: calendarItemsByDate[dStr]?.events || [],
        holidays: calendarItemsByDate[dStr]?.holidays || []
      });
    }
    return days;
  }, [currentCalendarDate, calendarItemsByDate]);

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const handlePrevMonth = () => {
    setCurrentCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentCalendarDate(new Date(2026, 7, 17)); // Go to current simulation day
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header & Quick Action Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 bg-white dark:bg-slate-900 p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="w-full lg:w-auto lg:max-w-md xl:max-w-xl min-w-0">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="p-2.5 sm:p-3 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-300/40 dark:border-amber-700/40 shrink-0">
              <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading tracking-tight break-words leading-snug">
                  Lịch Sự Kiện & Hoạt Động
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/40 dark:border-amber-800/40 shrink-0">
                  {stats.upcomingCount} sắp diễn ra
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed break-words">
                Quản lý các buổi Hòa nhạc Recital, Masterclass nghệ sĩ, Workshop chuyên đề và Ngày nghỉ lễ toàn hệ thống
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:flex lg:flex-wrap lg:items-center lg:justify-end gap-2 w-full lg:w-auto shrink-0 min-w-0">
          <button
            onClick={() => handleOpenAddModal()}
            className="col-span-1 lg:w-auto px-3 sm:px-4 py-2.5 min-h-[40px] bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer text-center"
          >
            <Plus className="w-4 h-4 stroke-[3] shrink-0" />
            <span className="truncate">+ Tạo sự kiện mới</span>
          </button>

          <button
            onClick={() => {
              resetEventsToDefault();
              showToast('Đã khôi phục dữ liệu sự kiện mặc định');
            }}
            className="col-span-1 lg:w-auto px-3 sm:px-4 py-2.5 min-h-[40px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
            title="Đặt lại dữ liệu mẫu sự kiện"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span className="truncate">Khôi phục mẫu</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tổng Sự Kiện</span>
            <CalendarCheck className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</p>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Toàn hệ thống trung tâm</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hòa Nhạc & Recital</span>
            <Music className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.recitals}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Báo cáo & Gala diễn</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Masterclasses</span>
            <GraduationCap className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{stats.masterclasses}</p>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">Nghệ sĩ & Thạc sĩ thỉnh giảng</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Workshop & Thi Đấu</span>
            <Trophy className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-black text-yellow-600 dark:text-yellow-400 mt-1">{stats.workshopsAndCompetitions}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Festival & Chuyên đề</span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lượt Ghi Danh</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.totalParticipants}</p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Học viên & Khách tham dự</span>
        </div>
      </div>

      {/* Filter & View Mode Ribbon */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* View Mode Buttons */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0 self-start">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Lịch Tháng</span>
            </button>

            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Lịch Tuần</span>
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Danh Sách & Lịch Trình ({filteredEvents.length})</span>
            </button>

            <button
              onClick={() => setViewMode('holidays')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'holidays'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Palmtree className="w-3.5 h-3.5" />
              <span>Lịch Nghỉ Lễ ({holidays.length})</span>
            </button>
          </div>

          {/* Month Navigator (for Calendar and Week views) */}
          {(viewMode === 'calendar' || viewMode === 'week') && (
            <div className="flex items-center gap-2 self-start lg:self-auto">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                title="Tháng trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-sm font-black text-slate-900 dark:text-white min-w-[130px] text-center">
                {monthNames[currentCalendarDate.getMonth()]} năm {currentCalendarDate.getFullYear()}
              </span>

              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                title="Tháng sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors cursor-pointer ml-1"
              >
                Hôm nay
              </button>
            </div>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tên sự kiện, nghệ sĩ, địa điểm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
          >
            <option value="all">🎭 Tất cả loại sự kiện</option>
            <option value="recital">🎶 Hòa nhạc & Báo cáo</option>
            <option value="masterclass">🎓 Masterclass chuyên sâu</option>
            <option value="holiday">🌴 Lịch nghỉ lễ</option>
            <option value="workshop">💡 Workshop & Tọa đàm</option>
            <option value="competition">🏆 Cuộc thi & Festival</option>
            <option value="exam">📝 Kỳ thi & Khảo thí</option>
            <option value="other">📌 Sự kiện khác</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
          >
            <option value="all">⚡ Tất cả trạng thái</option>
            <option value="upcoming">Sắp diễn ra</option>
            <option value="ongoing">Đang diễn ra</option>
            <option value="completed">Đã kết thúc</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          {/* Branch Filter */}
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
          >
            <option value="all">📍 Tất cả cơ sở</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {/* Audience Filter */}
          <select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
          >
            <option value="all">👥 Tất cả đối tượng</option>
            <option value="STUDENT">Dành cho Học viên</option>
            <option value="TEACHER">Dành cho Giáo viên</option>
            <option value="PARENT">Dành cho Phụ huynh</option>
            <option value="PUBLIC">Mở rộng Công chúng</option>
          </select>
        </div>
      </div>

      {/* 1. MONTH CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-center py-2.5">
            {['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'].map((dayName, idx) => (
              <div key={idx} className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <span className="hidden sm:inline">{dayName}</span>
                <span className="sm:hidden">{['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][idx]}</span>
              </div>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800/70">
            {calendarDays.map((cell, idx) => {
              const hasEvents = cell.events.length > 0;
              const hasHolidays = cell.holidays.length > 0;

              return (
                <div
                  key={idx}
                  onClick={() => handleOpenAddModal(cell.dateStr)}
                  className={`min-h-[110px] sm:min-h-[135px] p-1.5 sm:p-2 transition-colors cursor-pointer group flex flex-col justify-between ${
                    cell.isCurrentMonth
                      ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      : 'bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-600'
                  } ${cell.isToday ? 'ring-2 ring-amber-500 ring-inset z-10' : ''}`}
                >
                  {/* Date Header */}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-xs font-black rounded-lg w-6 h-6 flex items-center justify-center ${
                      cell.isToday 
                        ? 'bg-amber-500 text-white' 
                        : cell.isCurrentMonth 
                          ? 'text-slate-800 dark:text-slate-200 group-hover:text-amber-500' 
                          : 'text-slate-400 dark:text-slate-600'
                    }`}>
                      {cell.dayNumber}
                    </span>

                    {/* Quick Add Button on Hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAddModal(cell.dateStr);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 hover:bg-amber-200 transition-opacity"
                      title={`Thêm sự kiện ngày ${cell.dateStr}`}
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                    </button>
                  </div>

                  {/* Badges / Events / Holidays List for this day */}
                  <div className="space-y-1 overflow-y-auto max-h-[85px] no-scrollbar flex-1">
                    {/* Holiday Pill */}
                    {hasHolidays && cell.holidays.map(hol => (
                      <div
                        key={hol.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewMode('holidays');
                        }}
                        className="px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px] font-bold truncate flex items-center gap-1"
                        title={`Lịch nghỉ lễ: ${hol.name}`}
                      >
                        <Palmtree className="w-2.5 h-2.5 shrink-0 text-rose-500" />
                        <span className="truncate">{hol.name}</span>
                      </div>
                    ))}

                    {/* Events Pills */}
                    {cell.events.map(evt => {
                      const cfg = EVENT_TYPE_CONFIG[evt.type] || EVENT_TYPE_CONFIG.other;
                      const Icon = cfg.icon;

                      return (
                        <div
                          key={evt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingDetailEvent(evt);
                          }}
                          style={{ borderLeftColor: evt.color || cfg.defaultColor }}
                          className={`px-1.5 py-1 rounded-md text-[10px] font-bold border-l-2 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-amber-100/80 dark:hover:bg-amber-950/50 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 truncate flex items-center justify-between gap-1 shadow-2xs transition-all ${
                            evt.isFeatured ? 'ring-1 ring-amber-400 font-black' : ''
                          }`}
                          title={`${evt.title} (${evt.startTime || 'Cả ngày'}) - Click để xem chi tiết`}
                        >
                          <div className="flex items-center gap-1 truncate min-w-0">
                            <Icon className="w-2.5 h-2.5 shrink-0 text-amber-500" />
                            <span className="truncate">{evt.title}</span>
                          </div>
                          {evt.startTime && (
                            <span className="text-[9px] text-slate-500 dark:text-slate-400 shrink-0 font-normal">
                              {evt.startTime}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. WEEK CALENDAR VIEW */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((col, idx) => (
            <div 
              key={idx}
              className={`bg-white dark:bg-slate-900 rounded-2xl border ${
                col.isToday ? 'border-amber-500 shadow-md ring-1 ring-amber-500/30' : 'border-slate-200 dark:border-slate-800'
              } p-3 flex flex-col`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    {col.dayName}
                  </span>
                  <span className={`text-lg font-black ${col.isToday ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
                    {col.dayNumber} {monthNames[col.date.getMonth()]}
                  </span>
                </div>
                <button
                  onClick={() => handleOpenAddModal(col.dateStr)}
                  className="p-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-600 dark:text-amber-400 cursor-pointer"
                  title="Thêm sự kiện ngày này"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>

              {/* Day Events & Holidays */}
              <div className="space-y-2 flex-1 overflow-y-auto">
                {col.holidays.map(hol => (
                  <div key={hol.id} className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs">
                    <div className="flex items-center gap-1 font-bold">
                      <Palmtree className="w-3.5 h-3.5 text-rose-500" />
                      <span>{hol.name}</span>
                    </div>
                    <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80 block mt-0.5">
                      Miễn điểm danh
                    </span>
                  </div>
                ))}

                {col.events.length === 0 && col.holidays.length === 0 ? (
                  <div className="h-24 flex items-center justify-center text-slate-400 text-xs italic">
                    Không có lịch
                  </div>
                ) : (
                  col.events.map(evt => {
                    const cfg = EVENT_TYPE_CONFIG[evt.type] || EVENT_TYPE_CONFIG.other;
                    return (
                      <div
                        key={evt.id}
                        onClick={() => setViewingDetailEvent(evt)}
                        style={{ borderLeftColor: evt.color || cfg.defaultColor }}
                        className="p-2.5 rounded-xl border-l-4 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer transition-all shadow-2xs group"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${cfg.badgeBg} ${cfg.badgeText}`}>
                            {cfg.label}
                          </span>
                          {evt.isFeatured && (
                            <span className="text-[9px] font-black text-amber-500">★ Hot</span>
                          )}
                        </div>

                        <h4 className="text-xs font-black text-slate-900 dark:text-white mt-1 group-hover:text-amber-500 transition-colors line-clamp-2">
                          {evt.title}
                        </h4>

                        <div className="mt-2 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                          {evt.startTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{evt.startTime} - {evt.endTime || 'Kết thúc'}</span>
                            </div>
                          )}
                          {evt.location && (
                            <div className="flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{evt.location}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px]">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              {evt.registeredStudentIds?.length || evt.currentParticipants || 0} / {evt.maxParticipants || '∞'} chỗ
                            </span>
                            <span className="font-bold">
                              {evt.registrationFee ? `${evt.registrationFee.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. LIST / AGENDA VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
              <CalendarDays className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Không tìm thấy sự kiện nào</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Hãy thử thay đổi bộ lọc tìm kiếm hoặc nhấn "Tạo Sự Kiện Mới" để lên lịch cho trung tâm
              </p>
              <button
                onClick={() => handleOpenAddModal()}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold cursor-pointer hover:bg-amber-600"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo Sự Kiện Mới</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEvents.map(evt => {
                const cfg = EVENT_TYPE_CONFIG[evt.type] || EVENT_TYPE_CONFIG.other;
                const statusCfg = STATUS_CONFIG[evt.status] || STATUS_CONFIG.upcoming;
                const registeredCount = evt.registeredStudentIds?.length || evt.currentParticipants || 0;
                const max = evt.maxParticipants || 100;
                const fillPercent = Math.min(100, Math.round((registeredCount / max) * 100));

                return (
                  <div
                    key={evt.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                  >
                    {/* Color Stripe Top */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-1.5"
                      style={{ backgroundColor: evt.color || cfg.defaultColor }}
                    />

                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${cfg.badgeBg} ${cfg.badgeText}`}>
                            <cfg.icon className="w-3.5 h-3.5" />
                            <span>{cfg.label}</span>
                          </span>

                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${statusCfg.color}`}>
                            {statusCfg.label}
                          </span>

                          {evt.isFeatured && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-500 text-white shadow-2xs">
                              ★ Nổi Bật
                            </span>
                          )}
                        </div>

                        {/* Audience Tag */}
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {AUDIENCE_LABELS[evt.targetAudience]}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 
                        onClick={() => setViewingDetailEvent(evt)}
                        className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors cursor-pointer leading-snug"
                      >
                        {evt.title}
                      </h3>

                      {evt.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                          {evt.description}
                        </p>
                      )}

                      {/* Metadata Details */}
                      <div className="mt-3.5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-amber-500 shrink-0" />
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {evt.startDate}
                            {evt.endDate && evt.endDate !== evt.startDate ? ` ➔ ${evt.endDate}` : ''}
                          </span>
                          {evt.startTime && (
                            <span className="text-slate-500 dark:text-slate-400">
                              ({evt.startTime} - {evt.endTime || '21:00'})
                            </span>
                          )}
                        </div>

                        {evt.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                            <span className="truncate">{evt.location}</span>
                          </div>
                        )}

                        {evt.instructorOrHost && (
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-purple-500 shrink-0" />
                            <span className="truncate">Chủ trì: <strong>{evt.instructorOrHost}</strong></span>
                          </div>
                        )}

                        {/* Participants Progress Bar */}
                        <div className="pt-2">
                          <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                            <span className="text-slate-500 dark:text-slate-400">
                              Đã ghi danh: <strong className="text-slate-900 dark:text-white">{registeredCount}</strong> / {evt.maxParticipants || 'Không giới hạn'}
                            </span>
                            <span className="text-amber-600 dark:text-amber-400">{fillPercent}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 rounded-full transition-all duration-300"
                              style={{ width: `${fillPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="text-xs font-black text-slate-900 dark:text-slate-100">
                        {evt.registrationFee && evt.registrationFee > 0 ? (
                          <span className="text-amber-600 dark:text-amber-400">
                            {evt.registrationFee.toLocaleString('vi-VN')} đ / vé
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400">Miễn Phí</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleBroadcastReminder(evt)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
                          title="Gửi thông báo nhắc hẹn sự kiện"
                        >
                          <Bell className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleExportGoogleCalendar(evt)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                          title="Thêm vào Google Calendar"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setViewingDetailEvent(evt)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi tiết</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(evt)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                          title="Chỉnh sửa sự kiện"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeletingEvent(evt)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title="Xóa sự kiện"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. HOLIDAYS VIEW */}
      {viewMode === 'holidays' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Palmtree className="w-5 h-5 text-rose-500" />
                <span>Lịch Nghỉ Lễ & Nghỉ Định Kỳ Toàn Hệ Thống</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Các ngày nghỉ này sẽ tự động hiển thị trên thời khóa biểu và miễn trừ trừ sao / bảo lưu buổi học cho học viên
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {holidays.map(hol => (
              <div 
                key={hol.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                      {hol.type === 'national' ? 'Quốc Lễ' : 'Nghỉ Trung Tâm'}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      Năm {hol.year}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {hol.name}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {hol.description || 'Nghỉ lễ toàn hệ thống'}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>{hol.startDate} ➔ {hol.endDate}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Tự động miễn trừ
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODAL 1: CREATE / EDIT EVENT ================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {editingEvent ? 'Chỉnh Sửa Sự Kiện' : 'Tạo Mới Sự Kiện / Lịch Hoạt Động'}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Điền đầy đủ thông tin để công bố lịch đến Học viên & Phụ huynh
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveEvent} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Tên Sự Kiện <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="vd: Minh Music Summer Gala Recital 2026..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Type & Color row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Phân Loại Sự Kiện
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      const t = e.target.value as MusicEventType;
                      setFormData({ 
                        ...formData, 
                        type: t,
                        color: EVENT_TYPE_CONFIG[t]?.defaultColor || formData.color 
                      });
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="recital">🎶 Hòa Nhạc & Báo Cáo Định Kỳ</option>
                    <option value="masterclass">🎓 Masterclass Chuyên Sâu Nghệ Sĩ</option>
                    <option value="holiday">🌴 Lịch Nghỉ Lễ Hệ Thống</option>
                    <option value="workshop">💡 Workshop & Tọa Đàm Âm Nhạc</option>
                    <option value="competition">🏆 Cuộc Thi & Festival Âm Nhạc</option>
                    <option value="exam">📝 Kỳ Thi & Đánh Giá Xếp Lớp</option>
                    <option value="other">📌 Sự Kiện Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Màu Sắc Nhãn & Thẻ
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-10 h-9 p-0.5 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-400 uppercase">
                      {formData.color}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dates Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ngày Bắt Đầu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value, endDate: formData.isMultiDay ? formData.endDate : e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Ngày Kết Thúc
                    </label>
                    <label className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isMultiDay}
                        onChange={(e) => setFormData({ ...formData, isMultiDay: e.target.checked })}
                        className="rounded-sm text-amber-500"
                      />
                      <span>Kéo dài nhiều ngày</span>
                    </label>
                  </div>
                  <input
                    type="date"
                    disabled={!formData.isMultiDay}
                    value={formData.isMultiDay ? formData.endDate : formData.startDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium disabled:opacity-50"
                  />
                </div>

                {/* Time row */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Giờ Bắt Đầu
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Giờ Kết Thúc
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* Location & Branch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Địa Điểm / Khán Phòng
                  </label>
                  <input
                    type="text"
                    placeholder="vd: Phòng Hòa nhạc Tầng 3 Minh Music..."
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Cơ Sở Áp Dụng
                  </label>
                  <select
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    <option value="all">🌐 Tất cả các cơ sở</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Host & Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Chủ Trì / Giảng Viên / Nghệ Sĩ Khách Mời
                  </label>
                  <input
                    type="text"
                    placeholder="vd: NSƯT Trần Hoàng, ThS. Ca sĩ Mỹ Linh..."
                    value={formData.instructorOrHost}
                    onChange={(e) => setFormData({ ...formData, instructorOrHost: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Đối Tượng Tham Gia
                  </label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as EventAudience })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    <option value="ALL">Toàn thể Học viên, Phụ huynh & Giảng viên</option>
                    <option value="STUDENT">Chỉ dành cho Học viên</option>
                    <option value="TEACHER">Chỉ dành cho Giảng viên & Nhân sự</option>
                    <option value="PARENT">Dành cho Phụ huynh</option>
                    <option value="PUBLIC">Mở rộng cho Khán giả tự do</option>
                  </select>
                </div>
              </div>

              {/* Capacity, Fee & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Số Chỗ Tối Đa
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Lệ Phí Tham Dự (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    placeholder="0 = Miễn phí"
                    value={formData.registrationFee}
                    onChange={(e) => setFormData({ ...formData, registrationFee: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Trạng Thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    <option value="upcoming">Sắp diễn ra</option>
                    <option value="ongoing">Đang diễn ra</option>
                    <option value="completed">Đã kết thúc</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>

              {/* Featured toggle */}
              <div className="flex items-center gap-2 p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-900/50">
                <input
                  type="checkbox"
                  id="featured-toggle"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-amber-500 rounded-sm focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="featured-toggle" className="text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer">
                  Đánh dấu là Sự Kiện Nổi Bật (Ghim ưu tiên trên trang chủ & thông báo đẩy)
                </label>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Mô Tả Chi Tiết
                </label>
                <textarea
                  rows={3}
                  placeholder="Mô tả nội dung chương trình, tác phẩm biểu diễn, yêu cầu trang phục..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Ghi Chú Nội Bộ / Ban Tổ Chức
                </label>
                <input
                  type="text"
                  placeholder="vd: Chuẩn bị hoa tặng nghệ sĩ, âm thanh ánh sáng trước 1 tiếng..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{editingEvent ? 'Lưu Thay Đổi' : 'Tạo Sự Kiện'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: EVENT DETAILS & ENROLLMENT ================= */}
      {viewingDetailEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div 
              className="p-5 text-white relative overflow-hidden"
              style={{ backgroundColor: viewingDetailEvent.color || '#d97706' }}
            >
              <div className="flex items-center justify-between gap-2 relative z-10">
                <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-black/25 backdrop-blur-md uppercase tracking-wider">
                  {EVENT_TYPE_CONFIG[viewingDetailEvent.type]?.label || 'Sự Kiện'}
                </span>
                <button
                  onClick={() => setViewingDetailEvent(null)}
                  className="p-1 rounded-lg bg-black/20 hover:bg-black/40 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 className="text-xl sm:text-2xl font-black mt-3 relative z-10 leading-tight">
                {viewingDetailEvent.title}
              </h2>

              <div className="flex items-center gap-4 mt-2 text-xs font-medium text-white/90 relative z-10 flex-wrap">
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {viewingDetailEvent.startDate}
                </span>
                {viewingDetailEvent.startTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {viewingDetailEvent.startTime} - {viewingDetailEvent.endTime || '21:00'}
                  </span>
                )}
                {viewingDetailEvent.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {viewingDetailEvent.location}
                  </span>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Description */}
              {viewingDetailEvent.description && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mô Tả Chương Trình</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
                    {viewingDetailEvent.description}
                  </p>
                </div>
              )}

              {/* Host / Instructor & Fee Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Chủ Trì / Nghệ Sĩ</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {viewingDetailEvent.instructorOrHost || 'Ban Chuyên Môn Minh Music'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Lệ Phí Tham Dự</span>
                  <p className="text-sm font-black text-amber-600 dark:text-amber-400 mt-0.5">
                    {viewingDetailEvent.registrationFee && viewingDetailEvent.registrationFee > 0 
                      ? `${viewingDetailEvent.registrationFee.toLocaleString('vi-VN')} đ / vé` 
                      : 'Miễn Phí Tham Dự'}
                  </p>
                </div>
              </div>

              {/* Registered Students Section */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-500" />
                      <span>Danh Sách Học Viên Ghi Danh ({viewingDetailEvent.registeredStudentIds?.length || 0} / {viewingDetailEvent.maxParticipants || '∞'})</span>
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Ghi danh học viên tham gia biểu diễn hoặc tham dự sự kiện
                    </span>
                  </div>
                </div>

                {/* Quick Add Student Input */}
                <div className="flex items-center gap-2">
                  <select
                    value={studentToEnroll}
                    onChange={(e) => setStudentToEnroll(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    <option value="">-- Chọn học viên ghi danh --</option>
                    {students.filter(s => !(viewingDetailEvent.registeredStudentIds || []).includes(s.id)).map(s => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.fullName} ({s.enrolledSubjects?.join(', ') || 'Chưa phân môn'})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleEnrollStudent(viewingDetailEvent.id)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Ghi Danh</span>
                  </button>
                </div>

                {/* Enrolled Students Chips */}
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {(viewingDetailEvent.registeredStudentIds || []).length === 0 ? (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center text-xs text-slate-400 italic">
                      Chưa có học viên nào ghi danh sự kiện này
                    </div>
                  ) : (
                    (viewingDetailEvent.registeredStudentIds || []).map((stuId, i) => {
                      const st = students.find(s => s.id === stuId);
                      return (
                        <div 
                          key={i}
                          className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black flex items-center justify-center">
                              {i + 1}
                            </span>
                            <div>
                              <strong className="text-slate-900 dark:text-white">{st?.fullName || 'Học viên'}</strong>
                              <span className="text-slate-400 ml-1.5 text-[11px]">({st?.code || stuId})</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleUnenrollStudent(viewingDetailEvent.id, stuId)}
                            className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors"
                            title="Hủy ghi danh"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Notes */}
              {viewingDetailEvent.notes && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300">
                  <span className="font-bold block mb-0.5">📌 Ghi chú ban tổ chức:</span>
                  <span>{viewingDetailEvent.notes}</span>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportGoogleCalendar(viewingDetailEvent)}
                    className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Thêm vào Google Calendar</span>
                  </button>

                  <button
                    onClick={() => handleDownloadIcs(viewingDetailEvent)}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải file iCal (.ics)</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const evt = viewingDetailEvent;
                      setViewingDetailEvent(null);
                      handleOpenEditModal(evt);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Chỉnh sửa</span>
                  </button>

                  <button
                    onClick={() => {
                      const evt = viewingDetailEvent;
                      setViewingDetailEvent(null);
                      setDeletingEvent(evt);
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: DELETE CONFIRMATION ================= */}
      {deletingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-slate-900 dark:text-white text-center">
              Xác Nhận Xóa Sự Kiện?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1.5 leading-relaxed">
              Bạn có chắc chắn muốn xóa sự kiện <strong className="text-slate-900 dark:text-white">"{deletingEvent.title}"</strong> ({deletingEvent.startDate}) khỏi hệ thống? Thao tác này không thể hoàn tác.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setDeletingEvent(null)}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>

              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
