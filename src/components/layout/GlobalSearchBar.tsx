import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Student, Teacher, ClassItem } from '../../types';
import {
  Search,
  X,
  GraduationCap,
  BookOpen,
  Users,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Tag,
  CheckCircle2,
  AlertCircle,
  Eye
} from 'lucide-react';

interface GlobalSearchBarProps {
  onNavigate?: (tab: string) => void;
  className?: string;
}

type SearchCategory = 'ALL' | 'STUDENTS' | 'TEACHERS' | 'CLASSES';

// Utility to remove Vietnamese diacritics for smart fuzzy matching
function removeVietnameseTones(str: string): string {
  if (!str) return '';
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  // Combine accents
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '');
  str = str.replace(/\u02C6|\u0306|\u031B/g, '');
  return str.trim();
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({ onNavigate, className = '' }) => {
  const { students, teachers, classes, subjects } = useData();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('ALL');
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<{
    type: 'student' | 'teacher' | 'class';
    data: Student | Teacher | ClassItem;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard Shortcut: Cmd+K / Ctrl+K / '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (window.innerWidth < 768) {
          setIsMobileModalOpen(true);
          setTimeout(() => mobileInputRef.current?.focus(), 100);
        } else {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setIsMobileModalOpen(false);
        setPreviewItem(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search logic with Vietnamese tone tolerance
  const searchResults = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return {
        students: [],
        teachers: [],
        classes: [],
        total: 0
      };
    }

    const normQuery = removeVietnameseTones(trimmed);
    const rawQuery = trimmed.toLowerCase();

    // 1. Filter Students
    const matchedStudents = (students || []).filter(st => {
      const nameMatch = removeVietnameseTones(st.fullName || '').includes(normQuery);
      const codeMatch = (st.code || '').toLowerCase().includes(rawQuery);
      const idMatch = (st.id || '').toLowerCase().includes(rawQuery);
      const phoneMatch = (st.phone || '').includes(rawQuery);
      const guardianMatch = removeVietnameseTones(st.guardianName || '').includes(normQuery);
      const subjectMatch = (st.enrolledSubjects || []).some(s => removeVietnameseTones(s).includes(normQuery));
      return nameMatch || codeMatch || idMatch || phoneMatch || guardianMatch || subjectMatch;
    });

    // 2. Filter Teachers
    const matchedTeachers = (teachers || []).filter(tc => {
      const nameMatch = removeVietnameseTones(tc.fullName || '').includes(normQuery);
      const codeMatch = (tc.code || '').toLowerCase().includes(rawQuery);
      const idMatch = (tc.id || '').toLowerCase().includes(rawQuery);
      const phoneMatch = (tc.phone || '').includes(rawQuery);
      const emailMatch = (tc.email || '').toLowerCase().includes(rawQuery);
      const specialtyMatch = (tc.specialties || []).some(s => removeVietnameseTones(s).includes(normQuery));
      return nameMatch || codeMatch || idMatch || phoneMatch || emailMatch || specialtyMatch;
    });

    // 3. Filter Classes
    const matchedClasses = (classes || []).filter(cl => {
      const nameMatch = removeVietnameseTones(cl.name || '').includes(normQuery);
      const codeMatch = (cl.code || '').toLowerCase().includes(rawQuery);
      const idMatch = (cl.id || '').toLowerCase().includes(rawQuery);
      const subjectMatch = removeVietnameseTones(cl.subject || cl.subjectName || '').includes(normQuery);
      const teacherMatch = removeVietnameseTones(cl.teacherName || '').includes(normQuery);
      const roomMatch = removeVietnameseTones(cl.room || '').includes(normQuery);
      return nameMatch || codeMatch || idMatch || subjectMatch || teacherMatch || roomMatch;
    });

    return {
      students: matchedStudents,
      teachers: matchedTeachers,
      classes: matchedClasses,
      total: matchedStudents.length + matchedTeachers.length + matchedClasses.length
    };
  }, [query, students, teachers, classes]);

  const handleSelectStudent = (st: Student) => {
    setIsOpen(false);
    setIsMobileModalOpen(false);
    if (onNavigate) {
      onNavigate('students');
    }
  };

  const handleSelectTeacher = (tc: Teacher) => {
    setIsOpen(false);
    setIsMobileModalOpen(false);
    if (onNavigate) {
      onNavigate('teachers');
    }
  };

  const handleSelectClass = (cl: ClassItem) => {
    setIsOpen(false);
    setIsMobileModalOpen(false);
    if (onNavigate) {
      onNavigate('classes');
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">Đang học/Dạy</span>;
      case 'trial':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">Học thử</span>;
      case 'reserved':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">Bảo lưu</span>;
      case 'on_leave':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">Nghỉ phép</span>;
      case 'upcoming':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">Sắp mở</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{status}</span>;
    }
  };

  return (
    <>
      {/* Desktop Search Input Box */}
      <div ref={containerRef} className={`relative flex-1 max-w-md hidden md:block ${className}`}>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 pointer-events-none transition-colors" />
          <input
            ref={inputRef}
            type="text"
            id="admin-global-search-input"
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            placeholder="Tìm kiếm học viên, giáo viên, lớp học (Tên hoặc Mã)..."
            className="w-full pl-9.5 pr-20 py-2 text-xs bg-slate-100/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl border border-slate-200/80 dark:border-slate-700/80 focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-amber-400/20 focus:outline-none transition-all"
          />

          {query ? (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors cursor-pointer"
              title="Xóa tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="absolute right-2.5 flex items-center gap-1 pointer-events-none">
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-xs">
                ⌘K
              </kbd>
            </div>
          )}
        </div>

        {/* Dropdown Results Popover */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-[80vh] flex flex-col">
            
            {/* Category Filter Tabs */}
            <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 flex items-center gap-1.5 overflow-x-auto text-xs">
              <button
                onClick={() => setActiveCategory('ALL')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === 'ALL'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                Tất cả {searchResults.total > 0 && `(${searchResults.total})`}
              </button>

              <button
                onClick={() => setActiveCategory('STUDENTS')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === 'STUDENTS'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Học viên</span>
                {searchResults.students.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 font-bold">
                    {searchResults.students.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveCategory('TEACHERS')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === 'TEACHERS'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Giáo viên</span>
                {searchResults.teachers.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 font-bold">
                    {searchResults.teachers.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveCategory('CLASSES')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === 'CLASSES'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Lớp học</span>
                {searchResults.classes.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 font-bold">
                    {searchResults.classes.length}
                  </span>
                )}
              </button>
            </div>

            {/* Results Content */}
            <div className="overflow-y-auto p-2 space-y-3 divide-y divide-slate-100 dark:divide-slate-800 flex-1">
              
              {/* Empty / Initial State */}
              {!query.trim() && (
                <div className="py-8 px-4 text-center">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Tìm kiếm nhanh toàn hệ thống</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Gõ tên học viên, giáo viên, tên lớp hoặc mã định danh (Ví dụ: <span className="font-mono font-bold text-amber-600 dark:text-amber-400">HV001</span>, <span className="font-mono font-bold text-blue-600 dark:text-blue-400">GV001</span>, <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">LH-01</span>).
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setQuery('Piano');
                        inputRef.current?.focus();
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                    >
                      # Piano
                    </button>
                    <button
                      onClick={() => {
                        setQuery('Guitar');
                        inputRef.current?.focus();
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                    >
                      # Guitar
                    </button>
                    <button
                      onClick={() => {
                        setQuery('HV');
                        inputRef.current?.focus();
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                    >
                      # Mã Học Viên
                    </button>
                    <button
                      onClick={() => {
                        setQuery('GV');
                        inputRef.current?.focus();
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                    >
                      # Mã Giáo Viên
                    </button>
                  </div>
                </div>
              )}

              {/* No results found */}
              {query.trim() && searchResults.total === 0 && (
                <div className="py-10 px-4 text-center">
                  <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Không tìm thấy kết quả</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Không có học viên, giáo viên hay lớp học nào khớp với từ khóa "{query}".
                  </p>
                </div>
              )}

              {/* 1. Students Section */}
              {(activeCategory === 'ALL' || activeCategory === 'STUDENTS') && searchResults.students.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between px-2 pb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Học viên ({searchResults.students.length})</span>
                    </span>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onNavigate?.('students');
                      }}
                      className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Xem tất cả</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    {searchResults.students.slice(0, activeCategory === 'STUDENTS' ? 20 : 4).map((st) => (
                      <div
                        key={st.id}
                        onClick={() => handleSelectStudent(st)}
                        className="p-2.5 rounded-xl hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/60 transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {st.avatar ? (
                            <img
                              src={st.avatar}
                              alt={st.fullName}
                              className="w-9 h-9 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-extrabold flex items-center justify-center text-xs shrink-0">
                              {st.fullName.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors truncate">
                                {st.fullName}
                              </span>
                              <span className="font-mono text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                                {st.code}
                              </span>
                              {renderStatusBadge(st.status)}
                            </div>

                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              <span>Môn: {st.enrolledSubjects?.join(', ') || 'Chưa đăng ký'}</span>
                              {st.phone && <span>• SĐT: {st.phone}</span>}
                              {st.guardianName && <span>• PH: {st.guardianName}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewItem({ type: 'student', data: st });
                            }}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Xem nhanh chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Teachers Section */}
              {(activeCategory === 'ALL' || activeCategory === 'TEACHERS') && searchResults.teachers.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between px-2 pb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Giáo viên ({searchResults.teachers.length})</span>
                    </span>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onNavigate?.('teachers');
                      }}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Xem tất cả</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    {searchResults.teachers.slice(0, activeCategory === 'TEACHERS' ? 20 : 4).map((tc) => (
                      <div
                        key={tc.id}
                        onClick={() => handleSelectTeacher(tc)}
                        className="p-2.5 rounded-xl hover:bg-blue-50/60 dark:hover:bg-blue-950/30 border border-transparent hover:border-blue-200 dark:hover:border-blue-800/60 transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {tc.avatar ? (
                            <img
                              src={tc.avatar}
                              alt={tc.fullName}
                              className="w-9 h-9 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-extrabold flex items-center justify-center text-xs shrink-0">
                              {tc.fullName.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors truncate">
                                {tc.fullName}
                              </span>
                              <span className="font-mono text-[10px] font-extrabold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded border border-blue-200 dark:border-blue-800">
                                {tc.code}
                              </span>
                              {renderStatusBadge(tc.status)}
                            </div>

                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              <span>Chuyên môn: {tc.specialties?.join(', ') || 'Chưa phân công'}</span>
                              {tc.phone && <span>• SĐT: {tc.phone}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewItem({ type: 'teacher', data: tc });
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Xem nhanh chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Classes Section */}
              {(activeCategory === 'ALL' || activeCategory === 'CLASSES') && searchResults.classes.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between px-2 pb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>Lớp học ({searchResults.classes.length})</span>
                    </span>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onNavigate?.('classes');
                      }}
                      className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Xem tất cả</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    {searchResults.classes.slice(0, activeCategory === 'CLASSES' ? 20 : 4).map((cl) => (
                      <div
                        key={cl.id}
                        onClick={() => handleSelectClass(cl)}
                        className="p-2.5 rounded-xl hover:bg-amber-50/60 dark:hover:bg-amber-950/30 border border-transparent hover:border-amber-200 dark:hover:border-amber-800/60 transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-extrabold flex items-center justify-center text-xs shrink-0">
                            <Users className="w-4 h-4" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors truncate">
                                {cl.name}
                              </span>
                              <span className="font-mono text-[10px] font-extrabold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800">
                                {cl.code}
                              </span>
                              {renderStatusBadge(cl.status)}
                            </div>

                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              <span>Môn: {cl.subject || cl.subjectName}</span>
                              <span>• GV: {cl.teacherName || 'Chưa xếp'}</span>
                              <span>• {cl.room || 'Phòng học'}</span>
                              {cl.scheduleText && <span>• {cl.scheduleText}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewItem({ type: 'class', data: cl });
                            }}
                            className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Xem nhanh chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Popover Footer */}
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Nhấn <strong>Enter</strong> hoặc bấm vào mục để chuyển trang quản lý</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">ESC để đóng</span>
            </div>

          </div>
        )}
      </div>

      {/* Mobile / Tablet Compact Search Trigger Button */}
      <button
        type="button"
        id="btn-nav-mobile-search"
        onClick={() => {
          setIsMobileModalOpen(true);
          setTimeout(() => mobileInputRef.current?.focus(), 100);
        }}
        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition-colors cursor-pointer"
        title="Tìm kiếm nhanh (Học viên, Giáo viên, Lớp học)"
        aria-label="Tìm kiếm nhanh"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Mobile Search Modal Full-screen / Overlay */}
      {isMobileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col p-3 md:hidden animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-full overflow-hidden">
            
            {/* Header & Input */}
            <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <div className="relative flex-1 flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  ref={mobileInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm học viên, giáo viên, lớp..."
                  className="w-full pl-9 pr-8 py-2.5 text-base bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-transparent focus:border-amber-500 focus:outline-none"
                />
                {query && (
                  <button
                    onClick={() => {
                      setQuery('');
                      mobileInputRef.current?.focus();
                    }}
                    className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsMobileModalOpen(false)}
                className="px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Đóng
              </button>
            </div>

            {/* Categories */}
            <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center gap-1.5 overflow-x-auto text-xs">
              <button
                onClick={() => setActiveCategory('ALL')}
                className={`px-3 py-1 rounded-lg font-bold text-xs whitespace-nowrap ${
                  activeCategory === 'ALL'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800'
                }`}
              >
                Tất cả {searchResults.total > 0 && `(${searchResults.total})`}
              </button>
              <button
                onClick={() => setActiveCategory('STUDENTS')}
                className={`px-3 py-1 rounded-lg font-bold text-xs whitespace-nowrap ${
                  activeCategory === 'STUDENTS'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800'
                }`}
              >
                Học viên ({searchResults.students.length})
              </button>
              <button
                onClick={() => setActiveCategory('TEACHERS')}
                className={`px-3 py-1 rounded-lg font-bold text-xs whitespace-nowrap ${
                  activeCategory === 'TEACHERS'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800'
                }`}
              >
                Giáo viên ({searchResults.teachers.length})
              </button>
              <button
                onClick={() => setActiveCategory('CLASSES')}
                className={`px-3 py-1 rounded-lg font-bold text-xs whitespace-nowrap ${
                  activeCategory === 'CLASSES'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800'
                }`}
              >
                Lớp học ({searchResults.classes.length})
              </button>
            </div>

            {/* Results Body */}
            <div className="overflow-y-auto p-3 space-y-3 divide-y divide-slate-100 dark:divide-slate-800 flex-1">
              {!query.trim() && (
                <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                  Gõ tên hoặc mã (HV001, GV001, LH01) để tìm kiếm nhanh
                </div>
              )}

              {query.trim() && searchResults.total === 0 && (
                <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                  Không tìm thấy kết quả nào khớp với "{query}"
                </div>
              )}

              {/* Mobile Students */}
              {(activeCategory === 'ALL' || activeCategory === 'STUDENTS') && searchResults.students.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2">Học viên ({searchResults.students.length})</p>
                  <div className="space-y-1.5">
                    {searchResults.students.map(st => (
                      <div
                        key={st.id}
                        onClick={() => handleSelectStudent(st)}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{st.fullName}</span>
                            <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
                              {st.code}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {st.enrolledSubjects?.join(', ') || 'Chưa đăng ký môn'} {st.phone ? `• ${st.phone}` : ''}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Teachers */}
              {(activeCategory === 'ALL' || activeCategory === 'TEACHERS') && searchResults.teachers.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-2">Giáo viên ({searchResults.teachers.length})</p>
                  <div className="space-y-1.5">
                    {searchResults.teachers.map(tc => (
                      <div
                        key={tc.id}
                        onClick={() => handleSelectTeacher(tc)}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{tc.fullName}</span>
                            <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded">
                              {tc.code}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {tc.specialties?.join(', ') || 'Giáo viên'} {tc.phone ? `• ${tc.phone}` : ''}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Classes */}
              {(activeCategory === 'ALL' || activeCategory === 'CLASSES') && searchResults.classes.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">Lớp học ({searchResults.classes.length})</p>
                  <div className="space-y-1.5">
                    {searchResults.classes.map(cl => (
                      <div
                        key={cl.id}
                        onClick={() => handleSelectClass(cl)}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{cl.name}</span>
                            <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded">
                              {cl.code}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {cl.subject || cl.subjectName} • GV: {cl.teacherName || 'Chưa phân công'} • {cl.room}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Quick Preview Detail Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                  {previewItem.type === 'student' && <GraduationCap className="w-5 h-5" />}
                  {previewItem.type === 'teacher' && <BookOpen className="w-5 h-5" />}
                  {previewItem.type === 'class' && <Users className="w-5 h-5" />}
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    {previewItem.type === 'student' && 'Chi tiết Học viên'}
                    {previewItem.type === 'teacher' && 'Chi tiết Giáo viên'}
                    {previewItem.type === 'class' && 'Chi tiết Lớp học'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Xem nhanh thông tin và chuyển tới trang quản lý</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Preview Content */}
            {previewItem.type === 'student' && (() => {
              const st = previewItem.data as Student;
              return (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{st.fullName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded">
                          Mã: {st.code}
                        </span>
                        {renderStatusBadge(st.status)}
                      </div>
                    </div>
                    {st.avatar && (
                      <img src={st.avatar} alt={st.fullName} className="w-12 h-12 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Giới tính / Ngày sinh:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{st.gender} • {st.birthDate || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Số điện thoại:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{st.phone || 'Chưa có'}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl col-span-2">
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Môn học đăng ký:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {st.enrolledSubjects && st.enrolledSubjects.length > 0 ? (
                          st.enrolledSubjects.map(sub => (
                            <span key={sub} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold rounded text-[11px]">
                              {sub}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">Chưa đăng ký môn</span>
                        )}
                      </div>
                    </div>
                    {st.guardianName && (
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl col-span-2">
                        <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Phụ huynh / Người giám hộ:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {st.guardianName} ({st.guardianRelation || 'Phụ huynh'}) - SĐT: {st.guardianPhone || 'Chưa có'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Teacher Preview Content */}
            {previewItem.type === 'teacher' && (() => {
              const tc = previewItem.data as Teacher;
              return (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{tc.fullName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs font-bold text-blue-800 bg-blue-100 dark:bg-blue-950/80 px-2 py-0.5 rounded">
                          Mã: {tc.code}
                        </span>
                        {renderStatusBadge(tc.status)}
                      </div>
                    </div>
                    {tc.avatar && (
                      <img src={tc.avatar} alt={tc.fullName} className="w-12 h-12 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Số điện thoại:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{tc.phone || 'Chưa có'}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Email:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{tc.email || 'Chưa có'}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl col-span-2">
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Bộ môn chuyên môn:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tc.specialties && tc.specialties.length > 0 ? (
                          tc.specialties.map(spec => (
                            <span key={spec} className="px-2 py-0.5 bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 font-bold rounded text-[11px]">
                              {spec}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">Chưa chỉ định</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Class Preview Content */}
            {previewItem.type === 'class' && (() => {
              const cl = previewItem.data as ClassItem;
              return (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{cl.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded">
                          Mã: {cl.code}
                        </span>
                        {renderStatusBadge(cl.status)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Môn học / Khóa:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{cl.subject || cl.subjectName}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Giáo viên phụ trách:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{cl.teacherName || 'Chưa phân công'}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl col-span-2">
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Phòng học & Lịch học:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {cl.room} • {cl.scheduleText || cl.schedule || 'Lịch theo thỏa thuận'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  if (previewItem.type === 'student') handleSelectStudent(previewItem.data as Student);
                  if (previewItem.type === 'teacher') handleSelectTeacher(previewItem.data as Teacher);
                  if (previewItem.type === 'class') handleSelectClass(previewItem.data as ClassItem);
                  setPreviewItem(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>Mở trang Quản lý</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
