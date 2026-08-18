import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Teacher } from '../../types';
import {
  Users,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  Cake,
  Music,
  Edit2,
  Trash2,
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export const TeachersManagement: React.FC = () => {
  const { teachers, addTeacher, updateTeacher, deleteTeacher } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('1992-06-15');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(['Piano']);
  const [hourlyRate, setHourlyRate] = useState<number>(250000);
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState<'active' | 'on_leave' | 'inactive'>('active');

  const specialtiesList = ['Piano', 'Guitar', 'Thanh nhạc', 'Violin', 'Trống / Drum', 'Organ', 'Cảm thụ âm nhạc'];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredTeachers = teachers.filter(t => {
    if (specialtyFilter !== 'ALL' && !t.specialties.includes(specialtyFilter)) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return t.fullName.toLowerCase().includes(q) || t.code.toLowerCase().includes(q) || t.phone.includes(q) || t.email.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setCode(`GV${String(teachers.length + 1).padStart(3, '0')}`);
    setFullName('');
    setBirthDate('1992-06-15');
    setPhone('');
    setEmail('');
    setSelectedSpecialties(['Piano']);
    setHourlyRate(250000);
    setBio('');
    setStatus('active');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setCode(t.code);
    setFullName(t.fullName);
    setBirthDate(t.birthDate);
    setPhone(t.phone);
    setEmail(t.email);
    setSelectedSpecialties(t.specialties);
    setHourlyRate(t.hourlyRate || 250000);
    setBio(t.bio || '');
    setStatus(t.status);
    setIsModalOpen(true);
  };

  const handleSaveTeacher = () => {
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      alert('Vui lòng nhập đầy đủ Họ tên, Số điện thoại và Email');
      return;
    }

    if (editingTeacher) {
      updateTeacher(editingTeacher.id, {
        code,
        fullName,
        birthDate,
        phone,
        email,
        specialties: selectedSpecialties,
        hourlyRate,
        bio,
        status
      });
      showToast(`Đã cập nhật hồ sơ giáo viên ${fullName}`);
    } else {
      addTeacher({
        code,
        fullName,
        birthDate,
        phone,
        email,
        specialties: selectedSpecialties,
        hourlyRate,
        bio,
        hireDate: new Date().toISOString().split('T')[0],
        status
      });
      showToast(`Đã thêm mới giáo viên ${fullName}`);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-amber-500/30 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 bg-white dark:bg-slate-900 p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="w-full lg:w-auto lg:max-w-md xl:max-w-xl min-w-0">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="p-2.5 sm:p-3 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-300/40 dark:border-blue-700/40 shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading tracking-tight break-words leading-snug">
                Đội Ngũ Giáo Viên Minh Music
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed break-words">
                Quản lý hồ sơ giảng viên, chuyên môn nhạc cụ, tỷ lệ thù lao giờ dạy và lịch phụ trách lớp.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center lg:justify-end gap-2 w-full lg:w-auto shrink-0 min-w-0">
          <button
            id="btn-add-teacher"
            onClick={handleOpenAdd}
            className="w-full sm:w-auto px-4 py-2.5 min-h-[40px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer text-center"
          >
            <Plus className="w-4 h-4 stroke-[3] shrink-0" />
            <span className="truncate">+ Thêm giáo viên mới</span>
          </button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 overflow-hidden min-w-0 w-full">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
          <div className="relative flex-1 min-w-0 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 shrink-0" />
            <input
              type="text"
              placeholder="Tìm theo mã GV, tên, chuyên môn, số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="w-full sm:w-auto text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả chuyên môn</option>
              {specialtiesList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.map((t) => {
            const birth = new Date(t.birthDate);
            const age = isNaN(birth.getTime()) ? '—' : new Date().getFullYear() - birth.getFullYear();

            return (
              <div key={t.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded text-[10px] border border-blue-200">
                      {t.code}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Đang giảng dạy
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    {t.avatar ? (
                      <img src={t.avatar} alt={t.fullName} className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/20" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-base">
                        {t.fullName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 font-heading">{t.fullName}</h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Cake className="w-3 h-3 text-rose-500" />
                        {t.birthDate} ({age} tuổi)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.phone}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{t.email}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {t.specialties.map(spec => (
                      <span key={spec} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                        {spec}
                      </span>
                    ))}
                  </div>

                  {t.bio && (
                    <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100 line-clamp-2">
                      {t.bio}
                    </p>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">
                    {t.hourlyRate ? `${t.hourlyRate.toLocaleString('vi-VN')} đ/h` : '—'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(t)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Sửa giáo viên"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xóa hồ sơ giáo viên ${t.fullName}?`)) {
                          deleteTeacher(t.id);
                          showToast(`Đã xóa giáo viên ${t.fullName}`);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Xóa giáo viên"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: THÊM / SỬA GIÁO VIÊN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                {editingTeacher ? 'Sửa Hồ Sơ Giáo Viên' : 'Thêm Giáo Viên Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã giáo viên:</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono font-bold text-blue-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ và tên (*):</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Thầy Hoàng Minh"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày sinh (*):</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thù lao giờ dạy (VNĐ):</label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại (*):</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912345678"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email (*):</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="giaovien@minhmusic.vn"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chuyên môn giảng dạy:</label>
                <div className="flex flex-wrap gap-2">
                  {specialtiesList.map(spec => {
                    const isSelected = selectedSpecialties.includes(spec);
                    return (
                      <button
                        type="button"
                        key={spec}
                        onClick={() => {
                          if (isSelected) setSelectedSpecialties(selectedSpecialties.filter(s => s !== spec));
                          else setSelectedSpecialties([...selectedSpecialties, spec]);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {spec}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiểu sử & Trình độ học vấn:</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tốt nghiệp Nhạc viện TP.HCM, 5 năm kinh nghiệm..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveTeacher}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
              >
                Lưu Giáo Viên
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
