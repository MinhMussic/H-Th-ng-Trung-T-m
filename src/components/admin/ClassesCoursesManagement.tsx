import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { MusicClass, Subject, Course, Room, MusicLevel } from '../../types';
import {
  School,
  BookOpen,
  Music,
  CalendarDays,
  Plus,
  Search,
  Filter,
  Users,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  Layers,
  GraduationCap,
  DollarSign,
  Tag,
  Info,
  Calendar,
  ChevronRight,
  DoorClosed,
  DoorOpen,
  Sliders,
  X,
  Printer,
  UserCheck
} from 'lucide-react';
import { ClassSchedulePrintModal } from './ClassSchedulePrintModal';
import { RoomManagement } from './RoomManagement';
import { LevelManagement } from './LevelManagement';
import { DirectCourseRegistrationModal } from './DirectCourseRegistrationModal';

interface ClassesCoursesManagementProps {
  initialSubTab?: 'classes' | 'subjects' | 'courses' | 'rooms' | 'levels' | 'schedules';
}

export const ClassesCoursesManagement: React.FC<ClassesCoursesManagementProps> = ({ initialSubTab = 'classes' }) => {
  const {
    classes,
    subjects,
    courses,
    teachers,
    students,
    rooms,
    levels,
    branding,
    addClass,
    updateClass,
    deleteClass,
    addSubject,
    updateSubject,
    deleteSubject,
    addCourse,
    updateCourse,
    deleteCourse
  } = useData();

  const [activeSubTab, setActiveSubTab] = useState<'classes' | 'subjects' | 'courses' | 'rooms' | 'levels' | 'schedules'>(initialSubTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync and reset state when initialSubTab changes
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
      setSearchQuery('');
      setSubjectFilter('ALL');
      setIsPrintScheduleModalOpen(false);
      setIsClassModalOpen(false);
      setIsSubjectModalOpen(false);
      setIsCourseModalOpen(false);
      setIsDirectRegModalOpen(false);
      setEditingClass(null);
      setEditingSubject(null);
      setEditingCourse(null);
    }
  }, [initialSubTab]);

  // --- Modal States ---
  // Direct Registration Modal
  const [isDirectRegModalOpen, setIsDirectRegModalOpen] = useState(false);
  const [selectedCourseForReg, setSelectedCourseForReg] = useState<Course | null>(null);

  // Class Schedule 1-Page Print Modal
  const [isPrintScheduleModalOpen, setIsPrintScheduleModalOpen] = useState(false);

  // Class Modal
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<MusicClass | null>(null);
  const [classCode, setClassCode] = useState('');
  const [className, setClassName] = useState('');
  const [classSubject, setClassSubject] = useState('');
  const [classCourseId, setClassCourseId] = useState('');
  const [classTeacherId, setClassTeacherId] = useState('');
  const [classAdditionalTeacherIds, setClassAdditionalTeacherIds] = useState<string[]>([]);
  const [classRoomId, setClassRoomId] = useState('');
  const [classRoom, setClassRoom] = useState('Phòng Piano 01');
  const [classLevel, setClassLevel] = useState('Cơ bản');
  const [classMaxStudents, setClassMaxStudents] = useState<number>(4);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Thứ 2', 'Thứ 4']);
  const [startTime, setStartTime] = useState('17:30');
  const [endTime, setEndTime] = useState('19:00');

  // Subject Modal
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectIcon, setSubjectIcon] = useState('🎹');
  const [subjectColor, setSubjectColor] = useState('amber');
  const [subjectDesc, setSubjectDesc] = useState('');

  // Course Modal
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseSubjectId, setCourseSubjectId] = useState('');
  const [courseLevel, setCourseLevel] = useState('Cơ bản');
  const [courseLessons, setCourseLessons] = useState<number>(24);
  const [courseMonths, setCourseMonths] = useState<number>(3);
  const [courseFee, setCourseFee] = useState<number>(4800000);
  const [courseDesc, setCourseDesc] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- Handlers for Subject ---
  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setSubjectCode(`MH-${String(Date.now()).slice(-4)}`);
    setSubjectName('');
    setSubjectIcon('');
    setSubjectColor('amber');
    setSubjectDesc('');
    setIsSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (sub: Subject) => {
    setEditingSubject(sub);
    setSubjectCode(sub.code);
    setSubjectName(sub.name);
    setSubjectIcon('');
    setSubjectColor(sub.color || 'amber');
    setSubjectDesc(sub.description || '');
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) {
      showToast('Vui lòng nhập tên môn học!');
      return;
    }
    if (editingSubject) {
      updateSubject(editingSubject.id, {
        code: subjectCode,
        name: subjectName,
        icon: '',
        color: subjectColor,
        description: subjectDesc
      });
      showToast(`Đã cập nhật môn học ${subjectName}`);
    } else {
      addSubject({
        code: subjectCode || `MH-${Date.now()}`,
        name: subjectName,
        icon: '',
        color: subjectColor,
        description: subjectDesc
      });
      showToast(`Đã tạo môn học mới ${subjectName}`);
    }
    setIsSubjectModalOpen(false);
  };

  // --- Handlers for Course ---
  const handleOpenAddCourse = () => {
    setEditingCourse(null);
    setCourseCode(`KH-${String(Date.now()).slice(-4)}`);
    setCourseName('');
    setCourseSubjectId(subjects[0]?.id || '');
    setCourseLevel('Cơ bản');
    setCourseLessons(24);
    setCourseMonths(3);
    setCourseFee(4800000);
    setCourseDesc('');
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (crs: Course) => {
    setEditingCourse(crs);
    setCourseCode(crs.code);
    setCourseName(crs.name);
    setCourseSubjectId(crs.subjectId || subjects.find(s => s.name === crs.subject)?.id || subjects[0]?.id || '');
    setCourseLevel(crs.level || 'Cơ bản');
    setCourseLessons(crs.totalLessons || 24);
    setCourseMonths(crs.durationMonths || 3);
    setCourseFee(typeof crs.fee === 'number' ? crs.fee : parseInt(String(crs.fee).replace(/\D/g, ''), 10) || 4800000);
    setCourseDesc(crs.description || '');
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) {
      showToast('Vui lòng nhập tên khóa học!');
      return;
    }
    const selSub = subjects.find(s => s.id === courseSubjectId) || subjects[0];
    const subName = selSub?.name || 'Âm nhạc';

    if (editingCourse) {
      updateCourse(editingCourse.id, {
        code: courseCode,
        name: courseName,
        subjectId: selSub?.id,
        subject: subName,
        subjectName: subName,
        level: courseLevel,
        totalLessons: courseLessons,
        durationMonths: courseMonths,
        fee: courseFee,
        description: courseDesc
      });
      showToast(`Đã cập nhật khóa học ${courseName}`);
    } else {
      addCourse({
        code: courseCode || `KH-${Date.now()}`,
        name: courseName,
        subjectId: selSub?.id,
        subject: subName,
        subjectName: subName,
        level: courseLevel,
        totalLessons: courseLessons,
        durationMonths: courseMonths,
        fee: courseFee,
        description: courseDesc
      });
      showToast(`Đã tạo khóa học mới ${courseName}`);
    }
    setIsCourseModalOpen(false);
  };

  // --- Handlers for Class ---
  const handleOpenAddClass = () => {
    setEditingClass(null);
    setClassCode(`LH${String(classes.length + 1).padStart(3, '0')}`);
    setClassName('Lớp Âm Nhạc Mới');
    setClassSubject(subjects[0]?.name || 'Piano & Keyboard');
    setClassCourseId(courses[0]?.id || '');
    setClassTeacherId(teachers[0]?.id || 'teacher-minh');
    setClassAdditionalTeacherIds([]);
    setSelectedDays(['Thứ 2', 'Thứ 4']);
    setStartTime('17:30');
    setEndTime('19:00');
    
    // Default room from state
    if (rooms.length > 0) {
      setClassRoomId(rooms[0].id);
      setClassRoom(rooms[0].name);
    } else {
      setClassRoomId('room-piano-01');
      setClassRoom('Phòng Piano 01');
    }

    // Default level
    if (levels.length > 0) {
      setClassLevel(levels[0].name);
    } else {
      setClassLevel('Cơ bản');
    }

    setClassMaxStudents(4);
    setIsClassModalOpen(true);
  };

  const handleOpenEditClass = (cls: MusicClass) => {
    setEditingClass(cls);
    setClassCode(cls.code);
    setClassName(cls.name);
    setClassSubject(cls.subject || subjects[0]?.name || 'Piano');
    setClassCourseId(cls.courseId || '');
    setClassTeacherId(cls.teacherId || 'teacher-minh');
    setClassAdditionalTeacherIds(cls.teacherIds?.filter(id => id !== cls.teacherId) || []);
    setClassRoomId(cls.roomId || '');
    setClassRoom(cls.room || cls.roomName || 'Phòng Piano 01');
    setClassLevel(cls.level || 'Cơ bản');
    setClassMaxStudents(cls.maxStudents);

    // Try parse schedule text
    if (cls.scheduleText) {
      // e.g. "Thứ 2, Thứ 4 (17:30 - 19:00)"
      const parts = cls.scheduleText.split('(');
      if (parts[0]) {
        const days = parts[0].split(/[,&]/).map(d => d.trim()).filter(Boolean);
        if (days.length > 0) setSelectedDays(days);
      }
      if (parts[1]) {
        const timePart = parts[1].replace(')', '').trim();
        const [start, end] = timePart.split('-').map(t => t.trim());
        if (start) setStartTime(start);
        if (end) setEndTime(end);
      }
    }
    setIsClassModalOpen(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) {
      showToast('Vui lòng nhập tên lớp học!');
      return;
    }

    // Lead teacher name
    let teacherName = 'Chưa phân công';
    if (classTeacherId === 'teacher-minh' || classTeacherId === 'ADMIN_MINH') {
      teacherName = 'Thầy Minh (Quản lý / GV)';
    } else {
      const foundTeacher = teachers.find(t => t.id === classTeacherId);
      if (foundTeacher) teacherName = foundTeacher.fullName;
    }

    // Selected Room
    const foundRoom = rooms.find(r => r.id === classRoomId || r.name === classRoom);
    const finalRoomName = foundRoom ? foundRoom.name : classRoom;
    const finalRoomId = foundRoom ? foundRoom.id : (classRoomId || 'room-default');

    // Selected Level
    const foundLevel = levels.find(l => l.name === classLevel);
    const finalLevelId = foundLevel?.id;

    // All teachers list
    const allTeacherIds = Array.from(new Set([classTeacherId, ...classAdditionalTeacherIds].filter(Boolean)));
    const additionalTeachersData = classAdditionalTeacherIds.map(tId => {
      const t = teachers.find(item => item.id === tId);
      return {
        teacherId: tId,
        role: 'Giáo viên phụ / Trợ giảng',
        teacherName: t ? t.fullName : 'Giáo viên'
      };
    });

    const selectedCourse = courses.find(c => c.id === classCourseId);
    const daysStr = selectedDays.join(' & ') || 'Lịch linh hoạt';
    const scheduleFormatted = `${daysStr} (${startTime} - ${endTime})`;

    if (editingClass) {
      updateClass(editingClass.id, {
        code: classCode,
        name: className,
        subject: classSubject,
        subjectName: classSubject,
        courseId: classCourseId,
        courseName: selectedCourse?.name,
        teacherId: classTeacherId,
        teacherName,
        teacherIds: allTeacherIds,
        additionalTeachers: additionalTeachersData,
        roomId: finalRoomId,
        room: finalRoomName,
        roomName: finalRoomName,
        level: classLevel,
        levelId: finalLevelId,
        schedule: scheduleFormatted,
        scheduleText: scheduleFormatted,
        maxStudents: classMaxStudents
      });
      showToast(`Đã cập nhật lớp học ${className}`);
    } else {
      addClass({
        code: classCode || `LH${Date.now()}`,
        name: className,
        subject: classSubject,
        subjectName: classSubject,
        courseId: classCourseId,
        courseName: selectedCourse?.name,
        teacherId: classTeacherId,
        teacherName,
        teacherIds: allTeacherIds,
        additionalTeachers: additionalTeachersData,
        roomId: finalRoomId,
        room: finalRoomName,
        roomName: finalRoomName,
        level: classLevel,
        levelId: finalLevelId,
        schedule: scheduleFormatted,
        scheduleText: scheduleFormatted,
        maxStudents: classMaxStudents,
        currentStudents: 0,
        studentIds: [],
        status: 'active'
      });
      showToast(`Đã tạo mới lớp học ${className}`);
    }
    setIsClassModalOpen(false);
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  // Filtered classes
  const filteredClasses = classes.filter(c => {
    if (subjectFilter !== 'ALL' && c.subject !== subjectFilter && c.subjectName !== subjectFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.teacherName || '').toLowerCase().includes(q) ||
        (c.room || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered courses
  const filteredCourses = courses.filter(crs => {
    if (subjectFilter !== 'ALL') {
      const crsSubName = crs.subject || crs.subjectName || subjects.find(s => s.id === crs.subjectId)?.name;
      if (crsSubName !== subjectFilter) return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return crs.name.toLowerCase().includes(q) || crs.code.toLowerCase().includes(q);
    }
    return true;
  });

  // Filtered subjects
  const filteredSubjects = subjects.filter(sub => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return sub.name.toLowerCase().includes(q) || sub.code.toLowerCase().includes(q) || (sub.description || '').toLowerCase().includes(q);
    }
    return true;
  });

  const weekDays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
  const roomsList = [
    'Phòng Grand Piano A1',
    'Phòng Piano Studio A2',
    'Phòng Acoustic Guitar B1',
    'Phòng Vocal Studio C1',
    'Phòng Drum & Percussion D1',
    'Phòng Violin E1',
    'Phòng Masterclass Hội Trường'
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-amber-500/30 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 bg-white dark:bg-slate-900 p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="w-full lg:w-auto lg:max-w-md xl:max-w-xl min-w-0">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="p-2.5 sm:p-3 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-300/40 dark:border-amber-700/40 shrink-0">
              <School className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading tracking-tight break-words leading-snug">
                Quản Lý Đào Tạo & Lịch Học
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed break-words">
                Thiết lập Môn học, Khóa học, Mở lớp học và Phân bổ Thời khóa biểu phòng tập tại Minh Music Center.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Button based on active sub tab */}
        <div className="grid grid-cols-2 lg:flex lg:flex-wrap lg:items-center lg:justify-end gap-2 w-full lg:w-auto shrink-0 min-w-0">
          {activeSubTab === 'classes' && (
            <button
              id="btn-add-class"
              onClick={handleOpenAddClass}
              className="col-span-2 lg:w-auto px-3 sm:px-4 py-2.5 min-h-[40px] bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20 transition-all cursor-pointer text-center"
            >
              <Plus className="w-4 h-4 stroke-[3] shrink-0" />
              <span className="truncate">+ Mở lớp học mới</span>
            </button>
          )}

          {activeSubTab === 'courses' && (
            <button
              id="btn-add-course"
              onClick={handleOpenAddCourse}
              className="col-span-2 lg:w-auto px-3 sm:px-4 py-2.5 min-h-[40px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer text-center"
            >
              <Plus className="w-4 h-4 stroke-[3] shrink-0" />
              <span className="truncate">+ Thêm khóa học mới</span>
            </button>
          )}

          {activeSubTab === 'subjects' && (
            <button
              id="btn-add-subject"
              onClick={handleOpenAddSubject}
              className="col-span-2 lg:w-auto px-3 sm:px-4 py-2.5 min-h-[40px] bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20 transition-all cursor-pointer text-center"
            >
              <Plus className="w-4 h-4 stroke-[3] shrink-0" />
              <span className="truncate">+ Thêm môn học mới</span>
            </button>
          )}

          {activeSubTab === 'schedules' && (
            <button
              id="btn-schedule-class"
              onClick={handleOpenAddClass}
              className="col-span-2 lg:w-auto px-3 sm:px-4 py-2.5 min-h-[40px] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer text-center"
            >
              <Plus className="w-4 h-4 stroke-[3] shrink-0" />
              <span className="truncate">+ Xếp lịch lớp mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Tabs Navigation - Natural scrolling toolbar with horizontal swipe */}
      <div className="relative py-1 sm:py-2 flex items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800/60 overflow-hidden w-full">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-200/70 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-x-auto scrollbar-none no-scrollbar flex-nowrap max-w-full touch-pan-x">
          <button
            id="tab-classes"
            onClick={() => setActiveSubTab('classes')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[38px] ${
              activeSubTab === 'classes' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <School className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Lớp Học ({classes.length})</span>
          </button>

          <button
            id="tab-rooms"
            onClick={() => setActiveSubTab('rooms')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[38px] ${
              activeSubTab === 'rooms' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <DoorOpen className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Phòng Học ({rooms.length})</span>
          </button>

          <button
            id="tab-levels"
            onClick={() => setActiveSubTab('levels')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[38px] ${
              activeSubTab === 'levels' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Trình Độ ({levels.length})</span>
          </button>

          <button
            id="tab-courses"
            onClick={() => setActiveSubTab('courses')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[38px] ${
              activeSubTab === 'courses' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Khóa Học ({courses.length})</span>
          </button>

          <button
            id="tab-subjects"
            onClick={() => setActiveSubTab('subjects')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[38px] ${
              activeSubTab === 'subjects' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Music className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Môn Học ({subjects.length})</span>
          </button>

          <button
            id="tab-schedules"
            onClick={() => setActiveSubTab('schedules')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[38px] ${
              activeSubTab === 'schedules' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CalendarDays className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Thời Khóa Biểu Tuần</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SUBTAB 1: DANH SÁCH LỚP HỌC */}
      {/* ============================================================ */}
      {activeSubTab === 'classes' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Tìm lớp học, giáo viên, phòng, mã lớp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="ALL">Tất cả môn học</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClasses.map((cls) => {
              const enrolledStudentsCount = cls.studentIds?.length || cls.currentStudents || 0;
              const isFull = enrolledStudentsCount >= cls.maxStudents;
              return (
                <div
                  key={cls.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                        {cls.code}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        isFull ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {enrolledStudentsCount}/{cls.maxStudents} Học viên {isFull ? '(Đầy)' : ''}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 font-heading mb-2 group-hover:text-amber-700 transition-colors">
                      {cls.name}
                    </h3>

                    {cls.courseName && (
                      <p className="text-[11px] text-blue-600 font-bold mb-2 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        <span>Khóa: {cls.courseName}</span>
                      </p>
                    )}

                    <div className="space-y-1.5 text-xs text-slate-600 mb-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>GV chính: <strong className="text-slate-900 dark:text-white">{cls.teacherName || 'Chưa phân công'}</strong></span>
                      </p>
                      {cls.additionalTeachers && cls.additionalTeachers.length > 0 && (
                        <p className="flex items-center gap-2 text-[11px] text-slate-500">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>GV phụ / Trợ giảng: <strong className="text-indigo-600 dark:text-indigo-400">{cls.additionalTeachers.map(t => t.teacherName).join(', ')}</strong></span>
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="font-medium text-slate-800 dark:text-slate-200">{cls.scheduleText || cls.schedule}</span>
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <p className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                          <DoorClosed className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="font-semibold text-indigo-700 dark:text-indigo-300">{cls.room || cls.roomName || 'Phòng học Minh Music'}</span>
                        </p>
                        {cls.level && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100/70 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            {cls.level}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                      {cls.subject || cls.subjectName || 'Âm nhạc'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditClass(cls)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg transition-colors cursor-pointer"
                        title="Sửa lớp học"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xóa lớp học "${cls.name}" (${cls.code})?`)) {
                            deleteClass(cls.id);
                            showToast(`Đã xóa lớp học ${cls.name}`);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa lớp học"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredClasses.length === 0 && (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <School className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Không tìm thấy lớp học nào phù hợp</p>
              <button
                onClick={handleOpenAddClass}
                className="mt-3 px-4 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 rounded-xl cursor-pointer"
              >
                + Mở lớp học ngay
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* SUBTAB: QUẢN LÝ PHÒNG HỌC */}
      {/* ============================================================ */}
      {activeSubTab === 'rooms' && (
        <RoomManagement />
      )}

      {/* ============================================================ */}
      {/* SUBTAB: CẤU HÌNH TRÌNH ĐỘ */}
      {/* ============================================================ */}
      {activeSubTab === 'levels' && (
        <LevelManagement />
      )}

      {/* ============================================================ */}
      {/* SUBTAB 2: THỜI KHÓA BIỂU & PHÒNG HỌC */}
      {/* ============================================================ */}
      {activeSubTab === 'schedules' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                Thời Khóa Biểu & Bố Trí Phòng Học Trong Tuần
              </h3>
              <p className="text-xs text-slate-500">
                Toàn bộ lịch giảng dạy phân theo thứ trong tuần và các phòng chức năng.
              </p>
            </div>
            <button
              onClick={handleOpenAddClass}
              className="px-3.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer w-fit"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Xếp lớp vào lịch</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
                  <th className="p-3 text-left w-48">Phòng Học</th>
                  <th className="p-3 text-left">Thứ 2 & Thứ 4</th>
                  <th className="p-3 text-left">Thứ 3 & Thứ 5</th>
                  <th className="p-3 text-left">Thứ 6 & Thứ 7</th>
                  <th className="p-3 text-left">Chủ Nhật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roomsList.map((roomName) => {
                  const roomClasses = classes.filter(c => c.room && c.room.toLowerCase().includes(roomName.toLowerCase().slice(0, 8)));
                  return (
                    <tr key={roomName} className="hover:bg-slate-50/60">
                      <td className="p-3 font-bold text-slate-900 bg-slate-50/40 border-r border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <DoorClosed className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>{roomName}</span>
                        </div>
                      </td>

                      {/* Thứ 2 - 4 */}
                      <td className="p-2.5">
                        {roomClasses.filter(c => (c.scheduleText || c.schedule || '').includes('Thứ 2') || (c.scheduleText || c.schedule || '').includes('Thứ 4')).length > 0 ? (
                          roomClasses.filter(c => (c.scheduleText || c.schedule || '').includes('Thứ 2') || (c.scheduleText || c.schedule || '').includes('Thứ 4')).map(cls => (
                            <div key={cls.id} className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-[11px] mb-1 hover:shadow-xs transition-shadow">
                              <p className="font-extrabold text-amber-950">{cls.name}</p>
                              <p className="text-amber-700 font-medium">{cls.scheduleText || cls.schedule}</p>
                              <p className="text-slate-500 text-[10px]">GV: {cls.teacherName}</p>
                            </div>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-300 italic">Trống phòng</span>
                        )}
                      </td>

                      {/* Thứ 3 - 5 */}
                      <td className="p-2.5">
                        {roomClasses.filter(c => (c.scheduleText || c.schedule || '').includes('Thứ 3') || (c.scheduleText || c.schedule || '').includes('Thứ 5')).length > 0 ? (
                          roomClasses.filter(c => (c.scheduleText || c.schedule || '').includes('Thứ 3') || (c.scheduleText || c.schedule || '').includes('Thứ 5')).map(cls => (
                            <div key={cls.id} className="p-2 bg-blue-50 rounded-xl border border-blue-200 text-[11px] mb-1 hover:shadow-xs transition-shadow">
                              <p className="font-extrabold text-blue-950">{cls.name}</p>
                              <p className="text-blue-700 font-medium">{cls.scheduleText || cls.schedule}</p>
                              <p className="text-slate-500 text-[10px]">GV: {cls.teacherName}</p>
                            </div>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-300 italic">Trống phòng</span>
                        )}
                      </td>

                      {/* Thứ 6 - 7 */}
                      <td className="p-2.5">
                        {roomClasses.filter(c => (c.scheduleText || c.schedule || '').includes('Thứ 6') || (c.scheduleText || c.schedule || '').includes('Thứ 7')).length > 0 ? (
                          roomClasses.filter(c => (c.scheduleText || c.schedule || '').includes('Thứ 6') || (c.scheduleText || c.schedule || '').includes('Thứ 7')).map(cls => (
                            <div key={cls.id} className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] mb-1 hover:shadow-xs transition-shadow">
                              <p className="font-extrabold text-emerald-950">{cls.name}</p>
                              <p className="text-emerald-700 font-medium">{cls.scheduleText || cls.schedule}</p>
                              <p className="text-slate-500 text-[10px]">GV: {cls.teacherName}</p>
                            </div>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-300 italic">Trống phòng</span>
                        )}
                      </td>

                      {/* Chủ Nhật */}
                      <td className="p-2.5">
                        {roomClasses.filter(c => (c.scheduleText || c.schedule || '').includes('Chủ Nhật') || (c.scheduleText || c.schedule || '').includes('CN')).length > 0 ? (
                          roomClasses.filter(c => (c.scheduleText || c.schedule || '').includes('Chủ Nhật') || (c.scheduleText || c.schedule || '').includes('CN')).map(cls => (
                            <div key={cls.id} className="p-2 bg-purple-50 rounded-xl border border-purple-200 text-[11px] mb-1 hover:shadow-xs transition-shadow">
                              <p className="font-extrabold text-purple-950">{cls.name}</p>
                              <p className="text-purple-700 font-medium">{cls.scheduleText || cls.schedule}</p>
                              <p className="text-slate-500 text-[10px]">GV: {cls.teacherName}</p>
                            </div>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-300 italic">Trống phòng</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUBTAB 3: KHÓA HỌC */}
      {/* ============================================================ */}
      {activeSubTab === 'courses' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Tìm tên khóa học, mã khóa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleOpenAddCourse}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Khóa Học</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCourses.map((crs) => {
              const feeFormatted = typeof crs.fee === 'number'
                ? crs.fee.toLocaleString('vi-VN') + ' đ'
                : String(crs.fee);
              const subjectLinked = crs.subject || crs.subjectName || subjects.find(s => s.id === crs.subjectId)?.name || 'Âm nhạc';

              return (
                <div
                  key={crs.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all space-y-3 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded text-[11px] border border-blue-200">
                          {crs.code}
                        </span>
                        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {subjectLinked}
                        </span>
                      </div>
                      <span className="text-base font-black text-amber-600 font-heading">
                        {feeFormatted}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 font-heading mt-2 group-hover:text-blue-700 transition-colors">
                      {crs.name}
                    </h3>

                    {crs.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{crs.description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        <span>Quy mô: <strong>{crs.totalLessons || 24} buổi ({crs.durationMonths || 3} tháng)</strong></span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Trình độ: <strong>{crs.level || 'Cơ bản'}</strong></span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedCourseForReg(crs);
                        setIsDirectRegModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Ghi danh học viên</span>
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditCourse(crs)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                        title="Sửa khóa học"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xóa khóa học "${crs.name}"?`)) {
                            deleteCourse(crs.id);
                            showToast(`Đã xóa khóa học ${crs.name}`);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa khóa học"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600">Chưa có khóa học nào</p>
              <button
                onClick={handleOpenAddCourse}
                className="mt-3 px-4 py-2 text-xs font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-xl cursor-pointer"
              >
                + Thêm khóa học đầu tiên
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* SUBTAB 4: MÔN HỌC */}
      {/* ============================================================ */}
      {activeSubTab === 'subjects' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên môn học, chú thích, mã môn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400 focus:outline-none"
              />
            </div>

            <button
              onClick={handleOpenAddSubject}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Môn Học</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubjects.map((sub) => {
              const subClasses = classes.filter(c => c.subject === sub.name || c.subjectName === sub.name || c.subjectId === sub.id);
              const classCodes = subClasses.map(c => c.code).filter(Boolean);
              const subCoursesCount = courses.filter(c => c.subject === sub.name || c.subjectName === sub.name || c.subjectId === sub.id).length;

              return (
                <div
                  key={sub.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header: Tên môn học & Mã môn */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md text-xs border border-slate-200">
                          {sub.code}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900 mt-2">
                          {sub.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditSubject(sub)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Sửa môn học"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn xóa môn học "${sub.name}"?`)) {
                              deleteSubject(sub.id);
                              showToast(`Đã xóa môn học ${sub.name}`);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa môn học"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Chú thích */}
                    <div>
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-100 min-h-[50px]">
                        <span className="font-bold text-slate-700">Chú thích: </span>
                        {sub.description || 'Chương trình đào tạo âm nhạc tiêu chuẩn.'}
                      </p>
                    </div>

                    {/* Mã lớp học liên kết */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-600">Mã lớp đang mở ({classCodes.length}):</span>
                        <span className="text-slate-500">{subCoursesCount} khóa học</span>
                      </div>
                      {classCodes.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                          {classCodes.map((code) => (
                            <span
                              key={code}
                              className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded text-[11px] font-mono font-bold"
                            >
                              {code}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">Chưa có mã lớp liên kết</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSubjects.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-sm font-bold text-slate-600">Không tìm thấy môn học nào</p>
              <button
                onClick={handleOpenAddSubject}
                className="mt-3 px-4 py-2 text-xs font-bold text-slate-800 bg-slate-200 hover:bg-slate-300 rounded-xl cursor-pointer"
              >
                + Thêm môn học mới
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: MỞ / SỬA LỚP HỌC */}
      {/* ============================================================ */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <School className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  {editingClass ? 'Cập Nhật Lớp Học' : 'Mở Lớp Học Mới'}
                </h3>
              </div>
              <button onClick={() => setIsClassModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="py-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã lớp (*):</label>
                  <input
                    type="text"
                    required
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-amber-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Môn học (*):</label>
                  <select
                    value={classSubject}
                    onChange={(e) => setClassSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên lớp học (*):</label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="Ví dụ: Piano Thiếu Nhi K05, Guitar Fingerstyle 02"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Trình độ (*):</label>
                  <select
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {levels.length > 0 ? (
                      levels.map(l => (
                        <option key={l.id} value={l.name}>{l.name} ({l.code})</option>
                      ))
                    ) : (
                      <>
                        <option value="Cơ bản">Cơ bản</option>
                        <option value="Trung cấp">Trung cấp</option>
                        <option value="Nâng cao">Nâng cao</option>
                        <option value="Chuyên sâu">Chuyên sâu</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Giảng viên chính (*):</label>
                  <select
                    value={classTeacherId}
                    onChange={(e) => setClassTeacherId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-amber-900 dark:text-amber-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="teacher-minh">Thầy Minh (Quản lý chuyên môn / GV Trưởng)</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.fullName} ({t.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Giảng viên phụ / Trợ giảng (Multi-teacher assignment) */}
              <div className="bg-slate-50 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Giáo viên cùng dạy / Trợ giảng / GV thay thế (1 lớp có thể có nhiều GV):
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {teachers
                    .filter(t => t.id !== classTeacherId)
                    .map(t => {
                      const isSelected = classAdditionalTeacherIds.includes(t.id);
                      return (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => {
                            if (isSelected) {
                              setClassAdditionalTeacherIds(classAdditionalTeacherIds.filter(id => id !== t.id));
                            } else {
                              setClassAdditionalTeacherIds([...classAdditionalTeacherIds, t.id]);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>{t.fullName}</span>
                        </button>
                      );
                    })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Chọn ngày học trong tuần:</label>
                <div className="flex flex-wrap gap-1.5">
                  {weekDays.map(day => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giờ bắt đầu:</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giờ kết thúc:</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phòng học (*):</label>
                  <select
                    value={classRoom}
                    onChange={(e) => {
                      setClassRoom(e.target.value);
                      const r = rooms.find(item => item.name === e.target.value);
                      if (r) setClassRoomId(r.id);
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-indigo-700 dark:text-indigo-400"
                  >
                    {rooms.length > 0 ? (
                      rooms.map(r => (
                        <option key={r.id} value={r.name}>
                          {r.name} ({r.code}) - Tối đa {r.capacity} HV
                        </option>
                      ))
                    ) : (
                      roomsList.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sĩ số tối đa:</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={classMaxStudents}
                    onChange={(e) => setClassMaxStudents(parseInt(e.target.value, 10) || 4)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 rounded-xl shadow-md shadow-amber-600/20 cursor-pointer"
                >
                  {editingClass ? 'Lưu Thay Đổi' : 'Tạo Lớp Học Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: TẠO / SỬA MÔN HỌC */}
      {/* ============================================================ */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-100 text-slate-800 rounded-xl">
                  <Music className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingSubject ? 'Sửa Môn Học' : 'Thêm Môn Học Mới'}
                </h3>
              </div>
              <button onClick={() => setIsSubjectModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="py-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã môn học (*):</label>
                <input
                  type="text"
                  required
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  placeholder="Ví dụ: MH-PIANO, MH-GUITAR..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-800 focus:ring-2 focus:ring-slate-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên môn học (*):</label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="Ví dụ: Piano & Keyboard, Guitar & Ukulele, Thanh Nhạc..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:ring-2 focus:ring-slate-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chú thích / Mô tả môn học:</label>
                <textarea
                  rows={3}
                  value={subjectDesc}
                  onChange={(e) => setSubjectDesc(e.target.value)}
                  placeholder="Nhập chú thích lộ trình đào tạo, định hướng kỹ thuật cho học viên..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-normal focus:ring-2 focus:ring-slate-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {editingSubject ? 'Lưu Thay Đổi' : 'Tạo Môn Học Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: TẠO / SỬA KHÓA HỌC */}
      {/* ============================================================ */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  {editingCourse ? 'Sửa Khóa Học' : 'Thêm Khóa Học Mới'}
                </h3>
              </div>
              <button onClick={() => setIsCourseModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="py-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã khóa học (*):</label>
                  <input
                    type="text"
                    required
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-blue-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Môn học liên kết (*):</label>
                  <select
                    value={courseSubjectId}
                    onChange={(e) => setCourseSubjectId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên khóa học (*):</label>
                <input
                  type="text"
                  required
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="Ví dụ: Piano Cơ Bản Toàn Diện, Guitar Solo Đệm Hát K12..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trình độ:</label>
                  <select
                    value={courseLevel}
                    onChange={(e) => setCourseLevel(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  >
                    <option value="Cơ bản">Cơ bản</option>
                    <option value="Nâng cao">Nâng cao</option>
                    <option value="Đệm hát">Đệm hát</option>
                    <option value="Luyện thi chứng chỉ">Luyện thi</option>
                    <option value="Thiếu nhi">Thiếu nhi</option>
                    <option value="Chuyên sâu">Chuyên sâu</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tổng số buổi:</label>
                  <input
                    type="number"
                    min={1}
                    value={courseLessons}
                    onChange={(e) => setCourseLessons(parseInt(e.target.value, 10) || 24)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời lượng (tháng):</label>
                  <input
                    type="number"
                    min={1}
                    value={courseMonths}
                    onChange={(e) => setCourseMonths(parseInt(e.target.value, 10) || 3)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Học phí niêm yết (VNĐ):</label>
                <div className="relative">
                  <input
                    type="number"
                    step={100000}
                    value={courseFee}
                    onChange={(e) => setCourseFee(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-amber-800 text-sm"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">VNĐ</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả khóa học:</label>
                <textarea
                  rows={2}
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  placeholder="Mô tả nội dung giáo trình, đối tượng học viên..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-normal focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  {editingCourse ? 'Lưu Thay Đổi' : 'Tạo Khóa Học Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Direct Registration Modal */}
      {isDirectRegModalOpen && (
        <DirectCourseRegistrationModal
          isOpen={isDirectRegModalOpen}
          onClose={() => {
            setIsDirectRegModalOpen(false);
            setSelectedCourseForReg(null);
          }}
          initialCourse={selectedCourseForReg}
          onSuccess={() => {
            showToast('Đã ghi danh và xếp lớp học viên thành công!');
          }}
        />
      )}
    </div>
  );
};
