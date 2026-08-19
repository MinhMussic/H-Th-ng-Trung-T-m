import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { MusicLevel } from '../../types';
import {
  Sliders,
  Plus,
  Search,
  Edit2,
  Trash2,
  Sparkles,
  Layers,
  Award,
  CheckCircle2,
  X,
  AlertTriangle,
  BookOpen
} from 'lucide-react';

export const LevelManagement: React.FC = () => {
  const { levels, addLevel, updateLevel, deleteLevel, classes, courses } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<MusicLevel | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [order, setOrder] = useState<number>(1);
  const [color, setColor] = useState('amber');
  const [description, setDescription] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingLevel(null);
    setName('');
    setCode(`LV-0${levels.length + 1}`);
    setOrder(levels.length + 1);
    setColor('amber');
    setDescription('');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lvl: MusicLevel) => {
    setEditingLevel(lvl);
    setName(lvl.name);
    setCode(lvl.code || `LV-${lvl.id.slice(-2)}`);
    setOrder(lvl.order || 1);
    setColor(lvl.color || 'amber');
    setDescription(lvl.description || '');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Vui lòng nhập tên trình độ!');
      return;
    }

    if (editingLevel) {
      updateLevel(editingLevel.id, {
        name: name.trim(),
        code: code.trim(),
        order: Number(order) || 1,
        color,
        description: description.trim()
      });
      showToast(`Đã cập nhật trình độ "${name}"!`);
    } else {
      addLevel({
        name: name.trim(),
        code: code.trim() || `LV-${Date.now().toString().slice(-3)}`,
        order: Number(order) || 1,
        color,
        description: description.trim()
      });
      showToast(`Đã thêm trình độ mới "${name}"!`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (lvl: MusicLevel) => {
    deleteLevel(lvl.id);
    showToast(`Đã xóa trình độ "${lvl.name}"!`);
  };

  const colorOptions = [
    { label: 'Vàng Hổ Phách', value: 'amber', bg: 'bg-amber-500' },
    { label: 'Xanh Lam', value: 'blue', bg: 'bg-blue-500' },
    { label: 'Xanh Lá', value: 'emerald', bg: 'bg-emerald-500' },
    { label: 'Tím Hoàng Gia', value: 'purple', bg: 'bg-purple-500' },
    { label: 'Hồng / Đỏ', value: 'rose', bg: 'bg-rose-500' },
    { label: 'Xám Slate', value: 'slate', bg: 'bg-slate-500' }
  ];

  const filteredLevels = [...levels]
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .filter(l => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return l.name.toLowerCase().includes(q) || (l.description || '').toLowerCase().includes(q) || (l.code || '').toLowerCase().includes(q);
    });

  return (
    <div className="space-y-5">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-amber-500/30 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-heading flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-600" />
            <span>Cấu Hình Trình Độ Đào Tạo</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Thiết lập các bậc trình độ (Cơ bản, Trung cấp, Nâng cao, Chuyên sâu) áp dụng cho môn học, lớp học và khóa đào tạo.
          </p>
        </div>

        <button
          id="btn-add-level-top"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Thêm trình độ mới</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Tìm kiếm bậc trình độ, mã, mô tả năng lực..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
        />
      </div>

      {/* Levels List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLevels.map((lvl) => {
          const matchingClassesCount = classes.filter(
            c => c.levelId === lvl.id || c.level === lvl.name
          ).length;
          const matchingCoursesCount = courses.filter(
            c => c.levelId === lvl.id || c.level === lvl.name
          ).length;

          return (
            <div
              key={lvl.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      #{lvl.order || 1}
                    </span>
                    <span className="font-mono font-bold text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded text-[11px] border border-amber-200 dark:border-amber-800">
                      {lvl.code || 'LV'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    Bậc {lvl.order || 1}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading mb-1.5 group-hover:text-amber-600 transition-colors">
                  {lvl.name}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                  {lvl.description || 'Chưa có mô tả chi tiết cho trình độ này.'}
                </p>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Lớp đang mở:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{matchingClassesCount} lớp</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Gói khóa học:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{matchingCoursesCount} gói</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-3">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  Định chuẩn Minh Music
                </span>
                <div className="flex items-center gap-1">
                  <button
                    id={`btn-edit-level-${lvl.id}`}
                    onClick={() => handleOpenEdit(lvl)}
                    className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg transition-colors cursor-pointer"
                    title="Sửa trình độ"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    id={`btn-delete-level-${lvl.id}`}
                    onClick={() => handleDelete(lvl)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                    title="Xóa trình độ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Level */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-xl">
                  <Sliders className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                  {editingLevel ? 'Chỉnh Sửa Trình Độ' : 'Thêm Trình Độ Mới'}
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
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mã trình độ (*):</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="VD: LV-CB, LV-TC"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-amber-800 dark:text-amber-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Thứ tự hiển thị:</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value, 10) || 1)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tên trình độ (*):</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Cơ bản (Beginner), Trung cấp (Intermediate), Nâng cao (Advanced)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mô tả mục tiêu / Năng lực đạt được:</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả kỹ năng cần thiết hoặc giáo trình tương ứng..."
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
                  className="px-5 py-2 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md shadow-amber-600/20 cursor-pointer"
                >
                  {editingLevel ? 'Lưu cập nhật' : 'Thêm trình độ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
