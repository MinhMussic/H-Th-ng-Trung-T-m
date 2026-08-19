import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Room } from '../../types';
import {
  DoorOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Music,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  Info,
  X,
  MapPin,
  Check
} from 'lucide-react';

export const RoomManagement: React.FC = () => {
  const { rooms, classes, addRoom, updateRoom, deleteRoom, branches } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [capacity, setCapacity] = useState<number>(6);
  const [location, setLocation] = useState('Tầng 1 - Phòng A');
  const [branchId, setBranchId] = useState(branches[0]?.id || 'branch-01');
  const [instruments, setInstruments] = useState('');
  const [equipmentList, setEquipmentList] = useState<string[]>(['Máy lạnh', 'Cách âm']);
  const [status, setStatus] = useState<'available' | 'in_use' | 'maintenance'>('available');
  const [notes, setNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setName('');
    setCode(`P-${String(rooms.length + 1).padStart(2, '0')}`);
    setCapacity(6);
    setLocation('Tầng 1');
    setBranchId(branches[0]?.id || 'branch-01');
    setInstruments('2 Đàn Piano điện Yamaha, Ghế đệm, Giá để sách');
    setEquipmentList(['Máy lạnh', 'Cách âm tiêu chuẩn']);
    setStatus('available');
    setNotes('');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setName(room.name);
    setCode(room.code || `P-${room.id.slice(-2)}`);
    setCapacity(room.capacity || 6);
    setLocation(room.location || 'Tầng 1');
    setBranchId(room.branchId || branches[0]?.id || 'branch-01');
    setInstruments(Array.isArray(room.instruments) ? room.instruments.join(', ') : (room.instruments || ''));
    setEquipmentList(room.equipment || ['Máy lạnh']);
    setStatus(
      room.status === 'in_use' ? 'in_use' : room.status === 'maintenance' ? 'maintenance' : 'available'
    );
    setNotes(room.notes || '');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Vui lòng nhập tên phòng học!');
      return;
    }

    if (editingRoom) {
      updateRoom(editingRoom.id, {
        name: name.trim(),
        code: code.trim(),
        capacity: Number(capacity) || 6,
        location: location.trim(),
        branchId,
        instruments: instruments.trim(),
        equipment: equipmentList,
        status,
        notes: notes.trim()
      });
      showToast(`Đã cập nhật phòng "${name}" thành công!`);
    } else {
      addRoom({
        name: name.trim(),
        code: code.trim() || `P-${Date.now().toString().slice(-4)}`,
        capacity: Number(capacity) || 6,
        location: location.trim(),
        branchId,
        instruments: instruments.trim(),
        equipment: equipmentList,
        status,
        notes: notes.trim()
      });
      showToast(`Đã thêm phòng học mới "${name}" thành công!`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (room: Room) => {
    const res = deleteRoom(room.id);
    if (!res.success) {
      alert(res.error || 'Không thể xóa phòng học này!');
    } else {
      showToast(`Đã xóa phòng học "${room.name}"!`);
    }
  };

  const toggleEquipment = (eq: string) => {
    if (equipmentList.includes(eq)) {
      setEquipmentList(equipmentList.filter(item => item !== eq));
    } else {
      setEquipmentList([...equipmentList, eq]);
    }
  };

  const commonEquipments = [
    'Máy lạnh',
    'Cách âm tiêu chuẩn',
    'Bảng viết & Bút dạ',
    'Gương vũ đạo',
    'Hệ thống âm thanh & Mic',
    'Máy chiếu / Màn hình',
    'Camera giám sát',
    'Wifi tốc độ cao'
  ];

  const filteredRooms = rooms.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const instText = Array.isArray(r.instruments) ? r.instruments.join(' ') : (r.instruments || '');
    return (
      r.name.toLowerCase().includes(q) ||
      (r.code || '').toLowerCase().includes(q) ||
      instText.toLowerCase().includes(q) ||
      (r.location || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-500/30 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-heading flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-indigo-600" />
            <span>Quản Lý Phòng Học & Phòng Tập</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cấu hình danh sách phòng học, sức chứa, nhạc cụ và phân bổ lớp học tại Minh Music Center.
          </p>
        </div>

        <button
          id="btn-add-room-top"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Tạo phòng học mới</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Tìm tên phòng, mã phòng, nhạc cụ trang bị, tầng lầu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Room Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map((room) => {
          // Count active classes using this room
          const assignedClasses = classes.filter(
            c => c.roomId === room.id || c.room === room.id || c.room === room.name
          );

          return (
            <div
              key={room.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="font-mono font-bold text-indigo-900 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/60 px-2 py-0.5 rounded text-[11px] border border-indigo-200 dark:border-indigo-800">
                    {room.code || 'PHÒNG'}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    room.status === 'in_use'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                      : room.status === 'maintenance'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                  }`}>
                    {room.status === 'in_use' ? 'Đang có lớp' : room.status === 'maintenance' ? 'Bảo trì' : 'Sẵn sàng'}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading mb-1.5 group-hover:text-indigo-600 transition-colors">
                  {room.name}
                </h3>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      Sức chứa:
                    </span>
                    <strong className="text-slate-800 dark:text-slate-100">{room.capacity || 6} học viên</strong>
                  </div>

                  {room.location && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        Vị trí:
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{room.location}</span>
                    </div>
                  )}

                  {room.instruments && (
                    <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Music className="w-3 h-3 text-amber-500" />
                        Trang bị nhạc cụ:
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {room.instruments}
                      </p>
                    </div>
                  )}

                  {room.equipment && room.equipment.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {room.equipment.map((eq, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded text-[10px] font-semibold"
                        >
                          {eq}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Assigned Classes List */}
                <div className="mb-2">
                  <p className="text-[11px] font-bold text-slate-500 mb-1 flex items-center justify-between">
                    <span>Lớp học tại phòng ({assignedClasses.length}):</span>
                  </p>
                  {assignedClasses.length > 0 ? (
                    <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                      {assignedClasses.map((c) => (
                        <span
                          key={c.id}
                          className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded text-[10px] font-bold"
                        >
                          {c.code} - {c.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic">Chưa xếp lớp nào</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {room.createdAt ? new Date(room.createdAt).toLocaleDateString('vi-VN') : 'Cơ sở chính'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    id={`btn-edit-room-${room.id}`}
                    onClick={() => handleOpenEdit(room)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer"
                    title="Chỉnh sửa tên & thông tin phòng học"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    id={`btn-delete-room-${room.id}`}
                    onClick={() => handleDelete(room)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                    title="Xóa phòng học"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <DoorOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Không tìm thấy phòng học nào phù hợp</p>
          <button
            onClick={handleOpenAdd}
            className="mt-3 px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 hover:bg-indigo-200 rounded-xl cursor-pointer"
          >
            + Tạo phòng học ngay
          </button>
        </div>
      )}

      {/* Modal Add / Edit Room */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-xl">
                  <DoorOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                  {editingRoom ? 'Chỉnh Sửa Phòng Học' : 'Tạo Phòng Học Mới'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="my-3 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="py-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mã phòng (*):</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="VD: P-PIANO-01"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-indigo-800 dark:text-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sức chứa (học viên):</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value, 10) || 1)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tên phòng học (*):</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Phòng Piano 01, Phòng Grand Piano A1, Phòng Drum D1"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vị trí / Tầng:</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="VD: Tầng 1 - Khu A"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Trạng thái:</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                  >
                    <option value="available">Sẵn sàng sử dụng</option>
                    <option value="in_use">Đang có lớp học</option>
                    <option value="maintenance">Đang bảo trì</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nhạc cụ & Thiết bị chuyên dụng:</label>
                <input
                  type="text"
                  value={instruments}
                  onChange={(e) => setInstruments(e.target.value)}
                  placeholder="VD: 2 Đàn Piano Roland HP-704, 1 Piano cơ Yamaha U3"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Tiện nghi phòng học:</label>
                <div className="grid grid-cols-2 gap-2">
                  {commonEquipments.map((eq) => {
                    const isSelected = equipmentList.includes(eq);
                    return (
                      <button
                        key={eq}
                        type="button"
                        onClick={() => toggleEquipment(eq)}
                        className={`flex items-center gap-1.5 p-2 rounded-xl text-[11px] font-semibold text-left transition-all border ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-300'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                          isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </span>
                        <span className="truncate">{eq}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ghi chú bổ sung:</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi chú về bảo trì hoặc hướng dẫn phòng..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  {editingRoom ? 'Lưu cập nhật' : 'Tạo phòng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
