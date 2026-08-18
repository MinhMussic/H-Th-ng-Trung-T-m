import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Guardian, GuardianRelation } from '../../types';
import {
  HeartHandshake,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Edit2,
  Trash2,
  ShieldCheck,
  UserCheck,
  CreditCard,
  Bell,
  Sparkles
} from 'lucide-react';

export const GuardiansManagement: React.FC = () => {
  const { 
    guardians, 
    students, 
    addGuardian, 
    updateGuardian, 
    deleteGuardian 
  } = useData();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [relationFilter, setRelationFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingGuardian, setEditingGuardian] = useState<Guardian | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [relation, setRelation] = useState<GuardianRelation>('Mẹ');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isPrimaryContact, setIsPrimaryContact] = useState<boolean>(true);
  const [isNotificationReceiver, setIsNotificationReceiver] = useState<boolean>(true);
  const [isTuitionResponsible, setIsTuitionResponsible] = useState<boolean>(true);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [notes, setNotes] = useState<string>('');

  const relationsList: GuardianRelation[] = [
    'Cha', 'Mẹ', 'Ông', 'Bà', 'Anh', 'Chị', 'Cô', 'Dì', 'Chú', 'Bác', 'Người giám hộ', 'Khác'
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredGuardians = guardians.filter(g => {
    if (relationFilter !== 'ALL' && g.relation !== relationFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = g.fullName.toLowerCase().includes(q);
      const matchCode = g.code.toLowerCase().includes(q);
      const matchPhone = g.phone.includes(q);
      const matchEmail = g.email.toLowerCase().includes(q);
      return matchName || matchCode || matchPhone || matchEmail;
    }
    return true;
  });

  const handleOpenAddModal = () => {
    setEditingGuardian(null);
    setCode(`PH${String(guardians.length + 1).padStart(3, '0')}`);
    setFullName('');
    setRelation('Mẹ');
    setPhone('');
    setEmail('');
    setAddress('');
    setSelectedStudentIds([]);
    setIsPrimaryContact(true);
    setIsNotificationReceiver(true);
    setIsTuitionResponsible(true);
    setStatus('active');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (g: Guardian) => {
    setEditingGuardian(g);
    setCode(g.code);
    setFullName(g.fullName);
    setRelation(g.relation);
    setPhone(g.phone);
    setEmail(g.email);
    setAddress(g.address || '');
    setSelectedStudentIds(g.linkedStudentIds || []);
    setIsPrimaryContact(g.isPrimaryContact);
    setIsNotificationReceiver(g.isNotificationReceiver);
    setIsTuitionResponsible(g.isTuitionResponsible);
    setStatus(g.status);
    setNotes(g.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveGuardian = () => {
    if (!fullName.trim() || !phone.trim()) {
      alert('Vui lòng nhập Họ tên và Số điện thoại');
      return;
    }

    if (editingGuardian) {
      updateGuardian(editingGuardian.id, {
        code,
        fullName,
        relation,
        phone,
        email,
        address,
        linkedStudentIds: selectedStudentIds,
        isPrimaryContact,
        isNotificationReceiver,
        isTuitionResponsible,
        status,
        notes
      });
      showToast(`Đã cập nhật hồ sơ ${fullName}`);
    } else {
      addGuardian({
        code,
        fullName,
        relation,
        phone,
        email,
        address,
        linkedStudentIds: selectedStudentIds,
        isPrimaryContact,
        isNotificationReceiver,
        isTuitionResponsible,
        hasUserAccount: false,
        status,
        notes
      });
      showToast(`Đã thêm mới hồ sơ phụ huynh ${fullName}`);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-amber-500/30 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
              Phụ Huynh & Người Giám Hộ
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản lý thông tin gia đình, liên kết học viên, người liên hệ chính và người chịu trách nhiệm học phí.
          </p>
        </div>

        <button
          id="btn-add-guardian"
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>THÊM PHỤ HUYNH / GIÁM HỘ</span>
        </button>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Search box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Tìm theo họ tên, mã PH, số điện thoại, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Relation Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={relationFilter}
              onChange={(e) => setRelationFilter(e.target.value)}
              className="text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="ALL">Tất cả mối quan hệ</option>
              {relationsList.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Guardians Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider bg-slate-50/70">
                <th className="py-3 px-3">Mã & Họ Tên</th>
                <th className="py-3 px-3">Quan Hệ</th>
                <th className="py-3 px-3">Học Viên Liên Kết</th>
                <th className="py-3 px-3">Liên Hệ (SĐT / Email)</th>
                <th className="py-3 px-3">Vai Trò Trách Nhiệm</th>
                <th className="py-3 px-3">Tài Khoản App</th>
                <th className="py-3 px-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGuardians.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    Không tìm thấy hồ sơ phụ huynh / người giám hộ nào
                  </td>
                </tr>
              ) : (
                filteredGuardians.map((g) => {
                  const linkedStudentObjects = students.filter(s => g.linkedStudentIds?.includes(s.id));
                  return (
                    <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Code & Full Name */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded text-[10px] border border-amber-200">
                            {g.code}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900">{g.fullName}</p>
                            {g.address && (
                              <p className="text-[10px] text-slate-400 flex items-center gap-0.5 truncate max-w-[180px]">
                                <MapPin className="w-2.5 h-2.5" />
                                {g.address}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Relation */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {g.relation}
                        </span>
                      </td>

                      {/* Linked Students */}
                      <td className="py-3 px-3">
                        {linkedStudentObjects.length === 0 ? (
                          <span className="text-slate-400 italic">Chưa gán</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {linkedStudentObjects.map(st => (
                              <span
                                key={st.id}
                                className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold flex items-center gap-1"
                              >
                                <GraduationCap className="w-3 h-3" />
                                {st.fullName} ({st.code})
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Phone & Email */}
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <a href={`tel:${g.phone}`} className="font-bold text-slate-800 hover:text-amber-600 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {g.phone}
                          </a>
                          {g.email && (
                            <p className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {g.email}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Responsibilities Badges */}
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {g.isPrimaryContact && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200" title="Người liên hệ chính">
                              Liên hệ chính
                            </span>
                          )}
                          {g.isTuitionResponsible && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200" title="Chịu trách nhiệm học phí">
                              Nộp học phí
                            </span>
                          )}
                          {g.isNotificationReceiver && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200" title="Nhận thông báo">
                              Nhận tin
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Account status */}
                      <td className="py-3 px-3">
                        {g.hasUserAccount || g.userId ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" /> Đã có App
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-500 w-fit">
                            Chưa có
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(g)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Sửa hồ sơ"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa hồ sơ ${g.fullName}?`)) {
                                deleteGuardian(g.id);
                                showToast(`Đã xóa hồ sơ ${g.fullName}`);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Xóa hồ sơ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: THÊM / SỬA HỒ SƠ PHỤ HUYNH & GIÁM HỘ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  {editingGuardian ? 'Cập Nhật Hồ Sơ Phụ Huynh / Giám Hộ' : 'Thêm Mới Phụ Huynh / Người Giám Hộ'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              
              {/* Row 1: Code, Name, Relation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã hồ sơ:</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono font-bold text-amber-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ và tên (*):</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn Hùng"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-amber-500 focus:outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quan hệ với học viên:</label>
                  <select
                    value={relation}
                    onChange={(e) => setRelation(e.target.value as GuardianRelation)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-medium"
                  >
                    {relationsList.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Phone, Email, Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại (*):</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0903889977"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="phuhuynh@gmail.com"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Địa chỉ thường trú:</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Quận 1, TP.HCM"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 3: Linked Students Multi-Select */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Học viên liên kết (Có thể chọn nhiều con/học viên):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {students.map(st => {
                    const isChecked = selectedStudentIds.includes(st.id);
                    return (
                      <label
                        key={st.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                          isChecked 
                            ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900' 
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudentIds([...selectedStudentIds, st.id]);
                            } else {
                              setSelectedStudentIds(selectedStudentIds.filter(id => id !== st.id));
                            }
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="truncate">{st.fullName} ({st.code})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Row 4: Checkboxes for Responsibilities */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPrimaryContact}
                    onChange={(e) => setIsPrimaryContact(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-semibold text-slate-800">Người liên hệ chính</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNotificationReceiver}
                    onChange={(e) => setIsNotificationReceiver(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-semibold text-slate-800">Nhận thông báo</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTuitionResponsible}
                    onChange={(e) => setIsTuitionResponsible(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-semibold text-slate-800">Nộp học phí</span>
                </label>
              </div>

              {/* Row 5: Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú thêm:</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi chú về phụ huynh hoặc thói quen đưa đón..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
                id="btn-save-guardian"
                onClick={handleSaveGuardian}
                className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm"
              >
                Lưu Hồ Sơ
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
