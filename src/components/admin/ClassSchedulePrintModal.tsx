import React, { useState } from 'react';
import {
  X,
  Printer,
  DoorClosed,
  Calendar,
  Layers,
  Sparkles,
  Sliders,
  CheckCircle2,
  Clock,
  Users,
  Building,
  Info,
  ChevronDown,
  Music,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';
import { MusicClass, Teacher, Subject, TenantBranding } from '../../types';

interface ClassSchedulePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: MusicClass[];
  teachers: Teacher[];
  subjects: Subject[];
  branding?: TenantBranding;
}

export const ClassSchedulePrintModal: React.FC<ClassSchedulePrintModalProps> = ({
  isOpen,
  onClose,
  classes,
  teachers,
  subjects,
  branding
}) => {
  const [viewMode, setViewMode] = useState<'single_room' | 'master_matrix'>('single_room');
  const [selectedRoom, setSelectedRoom] = useState<string>('Phòng Grand Piano A1');
  const [academicTerm, setAcademicTerm] = useState<string>('NIÊM YẾT LỊCH ĐÀO TẠO & PHÒNG TẬP NĂM HỌC 2026');
  const [roomEquipment, setRoomEquipment] = useState<string>('Yamaha Grand C3X, Kawai K-300, Điều hòa 2 chiều, Tiêu âm chuyên nghiệp');
  const [leadTeacherName, setLeadTeacherName] = useState<string>('ThS. Nguyễn Hoàng Nam');
  const [customHotline, setCustomHotline] = useState<string>(branding?.hotline || '0901 888 999');
  const [showRules, setShowRules] = useState<boolean>(true);

  if (!isOpen) return null;

  const centerName = branding?.centerName || branding?.householdName || branding?.companyName || 'TRUNG TÂM ÂM NHẠC MINH MUSIC';
  const centerAddress = branding?.householdBusinessAddress || branding?.companyAddress || branding?.address || 'Quận 1, TP. Hồ Chí Minh';
  const hotline = customHotline || branding?.hotline || '0901 888 999';

  const roomsList = [
    'Phòng Grand Piano A1',
    'Phòng Piano Studio A2',
    'Phòng Acoustic Guitar B1',
    'Phòng Vocal Studio C1',
    'Phòng Drum & Percussion D1',
    'Phòng Violin E1',
    'Phòng Masterclass Hội Trường'
  ];

  const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

  const timeSlots = [
    { label: 'CA SÁNG\n(08:00 - 11:30)', key: 'morning', startH: 8, endH: 12 },
    { label: 'CA CHIỀU\n(14:00 - 17:00)', key: 'afternoon', startH: 14, endH: 17 },
    { label: 'CA TỐI\n(17:30 - 21:00)', key: 'evening', startH: 17.5, endH: 21 }
  ];

  // Filter classes for selected room
  const roomClasses = classes.filter(c => {
    if (!c.room) return false;
    const roomKeyword = selectedRoom.toLowerCase().split(' ')[1] || selectedRoom.toLowerCase();
    return c.room.toLowerCase().includes(roomKeyword) || c.room.toLowerCase() === selectedRoom.toLowerCase();
  });

  const getAccentClass = (subjectName: string = '') => {
    const s = subjectName.toLowerCase();
    if (s.includes('piano')) return 'piano-accent';
    if (s.includes('thanh nhạc') || s.includes('vocal')) return 'vocal-accent';
    if (s.includes('guitar')) return 'guitar-accent';
    if (s.includes('trống') || s.includes('drum')) return 'drum-accent';
    if (s.includes('violin')) return 'violin-accent';
    return 'piano-accent';
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-100 rounded-3xl w-full max-w-6xl max-h-[96vh] flex flex-col shadow-2xl border border-slate-700 overflow-hidden">
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="no-print p-4 sm:p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  PRINT ENGINE
                </span>
                <span className="text-xs text-amber-200 font-bold">1-Page Auto-Fit Sheet</span>
              </div>
              <h2 className="text-lg font-black text-white font-heading mt-0.5">
                In Lịch Niêm Yết Lớp Học & Phòng Tập (A4 Chuẩn)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleTriggerPrint}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 active:scale-98 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>IN NGAY (1 TRANG A4)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configuration Bar (Hidden when printing) */}
        <div className="no-print p-4 bg-white border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Định dạng in niêm yết:
            </label>
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('single_room')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-extrabold text-[11px] transition-all cursor-pointer ${
                  viewMode === 'single_room'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dán Cửa Phòng (Dọc)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('master_matrix')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-extrabold text-[11px] transition-all cursor-pointer ${
                  viewMode === 'master_matrix'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Toàn Trung Tâm (Ngang)
              </button>
            </div>
          </div>

          {viewMode === 'single_room' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Chọn phòng học niêm yết:
              </label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
              >
                {roomsList.map((rm) => (
                  <option key={rm} value={rm}>
                    {rm}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Tiêu đề niên khóa / Kỳ áp dụng:
            </label>
            <input
              type="text"
              value={academicTerm}
              onChange={(e) => setAcademicTerm(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Hotline & Phụ trách phòng:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={leadTeacherName}
                onChange={(e) => setLeadTeacherName(e.target.value)}
                placeholder="GV phụ trách..."
                className="w-1/2 p-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 text-xs"
              />
              <input
                type="text"
                value={customHotline}
                onChange={(e) => setCustomHotline(e.target.value)}
                placeholder="Hotline..."
                className="w-1/2 p-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Live A4 Print Sheet Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex items-center justify-center bg-slate-300/60">
          <div
            className={`classroom-schedule-sheet bg-white shadow-2xl rounded-xl border border-slate-300 ${
              viewMode === 'single_room'
                ? 'print-schedule-portrait w-full max-w-[210mm] min-h-[290mm] p-6'
                : 'print-schedule-landscape w-full max-w-[297mm] min-h-[205mm] p-6'
            }`}
          >
            {/* Header Banner */}
            <div className="schedule-print-header flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                    {centerName}
                  </span>
                  <span className="text-[10px] text-slate-400">|</span>
                  <span className="text-[11px] text-slate-600 font-bold">
                    Hotline: {hotline}
                  </span>
                </div>
                <h1 className="schedule-print-title text-xl font-black text-slate-950 uppercase tracking-tight mt-0.5">
                  {viewMode === 'single_room'
                    ? 'THỜI KHÓA BIỂU & LỊCH GIẢNG DẠY NIÊM YẾT'
                    : 'THỜI KHÓA BIỂU TỔNG THỂ CÁC PHÒNG HỌC'}
                </h1>
                <p className="schedule-print-subtitle text-xs text-slate-600 mt-0.5">
                  {academicTerm} • Địa điểm: {centerAddress}
                </p>
              </div>

              <div className="text-right flex flex-col items-end">
                <div className="schedule-print-room-badge bg-slate-950 text-white font-extrabold text-xs px-3.5 py-1 rounded-lg uppercase tracking-wider shadow-xs">
                  {viewMode === 'single_room' ? selectedRoom : 'TOÀN BỘ PHÒNG ĐÀO TẠO'}
                </div>
                {viewMode === 'single_room' && (
                  <span className="text-[10px] text-slate-500 mt-1">
                    GV Phụ trách: <strong>{leadTeacherName}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Timetable Grid View */}
            <div className="schedule-print-body flex-1 flex flex-col justify-stretch my-1">
              {viewMode === 'single_room' ? (
                /* ================= SINGLE ROOM 7-DAY MATRIX (PORTRAIT) ================= */
                <table className="schedule-print-table w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="time-col-header p-2 text-center w-24 border border-slate-900">
                        KHUNG GIỜ
                      </th>
                      {daysOfWeek.map((day) => (
                        <th
                          key={day}
                          className="p-2 text-center border border-slate-900 font-extrabold"
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((slot) => (
                      <tr key={slot.key} className="h-32">
                        {/* Time Slot Label */}
                        <td className="time-slot-label bg-slate-50 font-black text-[11px] text-center p-2 border border-slate-300 align-middle whitespace-pre-line">
                          <Clock className="w-4 h-4 mx-auto mb-1 text-slate-700" />
                          {slot.label}
                        </td>

                        {/* 7 Days Columns */}
                        {daysOfWeek.map((day) => {
                          // Find matching classes for this day and slot
                          const matchedClasses = roomClasses.filter((c) => {
                            const sched = (c.scheduleText || c.schedule || '').toLowerCase();
                            const matchDay =
                              sched.includes(day.toLowerCase()) ||
                              (day === 'Chủ Nhật' && sched.includes('cn'));
                            if (!matchDay) return false;

                            // Estimate time slot
                            if (slot.key === 'morning') {
                              return (
                                sched.includes('08:') ||
                                sched.includes('09:') ||
                                sched.includes('10:') ||
                                sched.includes('11:') ||
                                sched.includes('sáng')
                              );
                            }
                            if (slot.key === 'afternoon') {
                              return (
                                sched.includes('14:') ||
                                sched.includes('15:') ||
                                sched.includes('16:') ||
                                sched.includes('chiều')
                              );
                            }
                            if (slot.key === 'evening') {
                              return (
                                sched.includes('17:') ||
                                sched.includes('18:') ||
                                sched.includes('19:') ||
                                sched.includes('20:') ||
                                sched.includes('tối')
                              );
                            }
                            return true;
                          });

                          return (
                            <td
                              key={day}
                              className="border border-slate-300 p-1.5 align-top bg-white"
                            >
                              {matchedClasses.length > 0 ? (
                                matchedClasses.map((cls) => {
                                  const enrolled = cls.studentIds?.length || cls.currentStudents || 0;
                                  const accent = getAccentClass(cls.subject || cls.subjectName);
                                  return (
                                    <div
                                      key={cls.id}
                                      className={`schedule-class-block ${accent} p-2 rounded-lg border border-slate-300 mb-1.5 bg-slate-50 shadow-2xs`}
                                    >
                                      <p className="schedule-class-name font-black text-slate-900 text-xs leading-tight">
                                        {cls.name}
                                      </p>
                                      <p className="schedule-class-time text-[10px] font-bold text-amber-800 font-mono mt-0.5">
                                        {cls.scheduleText || cls.schedule}
                                      </p>
                                      <div className="schedule-class-meta text-[10px] text-slate-600 flex items-center justify-between mt-1 pt-1 border-t border-slate-200">
                                        <span className="schedule-class-teacher font-bold text-blue-800 truncate">
                                          GV: {cls.teacherName || 'Chưa phân công'}
                                        </span>
                                        <span className="schedule-class-capacity font-mono font-bold text-slate-500 shrink-0">
                                          {enrolled}/{cls.maxStudents} HV
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="schedule-empty-cell h-full flex items-center justify-center text-slate-300 text-[10px] italic">
                                  Trống lịch
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                /* ================= ALL ROOMS MATRIX (LANDSCAPE) ================= */
                <table className="schedule-print-table w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="p-2 text-left w-48 border border-slate-900 font-extrabold">
                        PHÒNG HỌC & THIẾT BỊ
                      </th>
                      <th className="p-2 text-center border border-slate-900 font-extrabold">
                        THỨ 2 & THỨ 4
                      </th>
                      <th className="p-2 text-center border border-slate-900 font-extrabold">
                        THỨ 3 & THỨ 5
                      </th>
                      <th className="p-2 text-center border border-slate-900 font-extrabold">
                        THỨ 6 & THỨ 7
                      </th>
                      <th className="p-2 text-center border border-slate-900 font-extrabold">
                        CHỦ NHẬT
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomsList.map((roomName) => {
                      const currentRoomClasses = classes.filter(
                        (c) =>
                          c.room &&
                          c.room.toLowerCase().includes(roomName.toLowerCase().slice(0, 8))
                      );

                      return (
                        <tr key={roomName} className="schedule-room-row h-20">
                          <td className="schedule-room-name-cell p-2 font-black text-slate-900 bg-slate-50 border border-slate-300">
                            <div className="flex items-center gap-1.5">
                              <DoorClosed className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span className="text-xs font-black">{roomName}</span>
                            </div>
                          </td>

                          {/* Thứ 2 & 4 */}
                          <td className="border border-slate-300 p-1.5 align-top">
                            {currentRoomClasses.filter(
                              (c) =>
                                (c.scheduleText || c.schedule || '').includes('Thứ 2') ||
                                (c.scheduleText || c.schedule || '').includes('Thứ 4')
                            ).length > 0 ? (
                              currentRoomClasses
                                .filter(
                                  (c) =>
                                    (c.scheduleText || c.schedule || '').includes('Thứ 2') ||
                                    (c.scheduleText || c.schedule || '').includes('Thứ 4')
                                )
                                .map((cls) => (
                                  <div
                                    key={cls.id}
                                    className={`schedule-class-block ${getAccentClass(
                                      cls.subject
                                    )} p-1.5 rounded-lg border border-slate-300 mb-1`}
                                  >
                                    <p className="schedule-class-name font-bold text-slate-900 text-[11px]">
                                      {cls.name}
                                    </p>
                                    <p className="schedule-class-time text-[10px] text-amber-800 font-mono">
                                      {cls.scheduleText || cls.schedule} (GV: {cls.teacherName})
                                    </p>
                                  </div>
                                ))
                            ) : (
                              <span className="text-[10px] text-slate-300 italic block text-center pt-2">
                                Trống phòng
                              </span>
                            )}
                          </td>

                          {/* Thứ 3 & 5 */}
                          <td className="border border-slate-300 p-1.5 align-top">
                            {currentRoomClasses.filter(
                              (c) =>
                                (c.scheduleText || c.schedule || '').includes('Thứ 3') ||
                                (c.scheduleText || c.schedule || '').includes('Thứ 5')
                            ).length > 0 ? (
                              currentRoomClasses
                                .filter(
                                  (c) =>
                                    (c.scheduleText || c.schedule || '').includes('Thứ 3') ||
                                    (c.scheduleText || c.schedule || '').includes('Thứ 5')
                                )
                                .map((cls) => (
                                  <div
                                    key={cls.id}
                                    className={`schedule-class-block ${getAccentClass(
                                      cls.subject
                                    )} p-1.5 rounded-lg border border-slate-300 mb-1`}
                                  >
                                    <p className="schedule-class-name font-bold text-slate-900 text-[11px]">
                                      {cls.name}
                                    </p>
                                    <p className="schedule-class-time text-[10px] text-amber-800 font-mono">
                                      {cls.scheduleText || cls.schedule} (GV: {cls.teacherName})
                                    </p>
                                  </div>
                                ))
                            ) : (
                              <span className="text-[10px] text-slate-300 italic block text-center pt-2">
                                Trống phòng
                              </span>
                            )}
                          </td>

                          {/* Thứ 6 & 7 */}
                          <td className="border border-slate-300 p-1.5 align-top">
                            {currentRoomClasses.filter(
                              (c) =>
                                (c.scheduleText || c.schedule || '').includes('Thứ 6') ||
                                (c.scheduleText || c.schedule || '').includes('Thứ 7')
                            ).length > 0 ? (
                              currentRoomClasses
                                .filter(
                                  (c) =>
                                    (c.scheduleText || c.schedule || '').includes('Thứ 6') ||
                                    (c.scheduleText || c.schedule || '').includes('Thứ 7')
                                )
                                .map((cls) => (
                                  <div
                                    key={cls.id}
                                    className={`schedule-class-block ${getAccentClass(
                                      cls.subject
                                    )} p-1.5 rounded-lg border border-slate-300 mb-1`}
                                  >
                                    <p className="schedule-class-name font-bold text-slate-900 text-[11px]">
                                      {cls.name}
                                    </p>
                                    <p className="schedule-class-time text-[10px] text-amber-800 font-mono">
                                      {cls.scheduleText || cls.schedule} (GV: {cls.teacherName})
                                    </p>
                                  </div>
                                ))
                            ) : (
                              <span className="text-[10px] text-slate-300 italic block text-center pt-2">
                                Trống phòng
                              </span>
                            )}
                          </td>

                          {/* Chủ Nhật */}
                          <td className="border border-slate-300 p-1.5 align-top">
                            {currentRoomClasses.filter(
                              (c) =>
                                (c.scheduleText || c.schedule || '').includes('Chủ Nhật') ||
                                (c.scheduleText || c.schedule || '').includes('CN')
                            ).length > 0 ? (
                              currentRoomClasses
                                .filter(
                                  (c) =>
                                    (c.scheduleText || c.schedule || '').includes('Chủ Nhật') ||
                                    (c.scheduleText || c.schedule || '').includes('CN')
                                )
                                .map((cls) => (
                                  <div
                                    key={cls.id}
                                    className={`schedule-class-block ${getAccentClass(
                                      cls.subject
                                    )} p-1.5 rounded-lg border border-slate-300 mb-1`}
                                  >
                                    <p className="schedule-class-name font-bold text-slate-900 text-[11px]">
                                      {cls.name}
                                    </p>
                                    <p className="schedule-class-time text-[10px] text-amber-800 font-mono">
                                      {cls.scheduleText || cls.schedule} (GV: {cls.teacherName})
                                    </p>
                                  </div>
                                ))
                            ) : (
                              <span className="text-[10px] text-slate-300 italic block text-center pt-2">
                                Trống phòng
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Classroom Rules & Footer Information */}
            <div className="schedule-print-footer border-t-2 border-slate-900 pt-2 mt-2">
              <div className="grid grid-cols-3 gap-3 text-[10px]">
                {/* Box 1: Nội quy phòng học */}
                <div className="schedule-footer-box bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <div className="schedule-footer-title font-black text-slate-950 uppercase flex items-center gap-1 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>NỘI QUY PHÒNG HỌC NIÊM YẾT</span>
                  </div>
                  <ul className="schedule-footer-list list-disc pl-3 text-slate-700 space-y-0.5 text-[9.5px]">
                    <li>Không mang đồ ăn, thức uống ngọt vào gần nhạc cụ.</li>
                    <li>Tắt hệ thống âm thanh, ampli & đậy nắp đàn sau giờ học.</li>
                    <li>Học viên có mặt đúng giờ và giữ gìn trật tự hành lang.</li>
                  </ul>
                </div>

                {/* Box 2: Trang thiết bị & Hỗ trợ kỹ thuật */}
                <div className="schedule-footer-box bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <div className="schedule-footer-title font-black text-slate-950 uppercase flex items-center gap-1 mb-1">
                    <Music className="w-3.5 h-3.5 text-blue-600" />
                    <span>TRANG THIẾT BỊ & BẢO TRÌ</span>
                  </div>
                  <p className="text-slate-700 text-[9.5px] leading-relaxed">
                    Trang bị: <strong>{roomEquipment}</strong>. Báo sự cố kỹ thuật hoặc đăng ký giờ tự luyện tập qua hotline lễ tân.
                  </p>
                </div>

                {/* Box 3: Ban Giám Hiệu & Xác nhận */}
                <div className="schedule-footer-box bg-slate-50 p-2 rounded-lg border border-slate-200 flex flex-col justify-between text-right">
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono">
                      TP. Hồ Chí Minh, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                    </span>
                    <p className="font-black text-slate-950 text-[10.5px] uppercase mt-0.5">
                      BAN ĐÀO TẠO & QUẢN TRỊ PHÒNG
                    </p>
                  </div>
                  <span className="text-[9px] text-slate-400 italic">
                    (Đã duyệt và niêm yết chính thức)
                  </span>
                </div>
              </div>

              {/* Bottom Copyright and Verification Note */}
              <div className="schedule-footer-bottom flex items-center justify-between text-[9px] text-slate-400 pt-1.5 mt-1.5 border-t border-dashed border-slate-300">
                <span>{centerName} • Hệ thống Quản lý Đào tạo & Bố trí Phòng Học Thông Minh</span>
                <span>Bản in niêm yết chuẩn A4 • Tự động co giãn 1 trang</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
