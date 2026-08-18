import React, { useState, useEffect } from 'react';
import { RewardItem } from '../../types';
import { useData } from '../../context/DataContext';
import {
  Gift,
  Star,
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
  Package,
  Layers,
  FileText,
  Upload,
  AlertCircle
} from 'lucide-react';

interface RewardConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardToEdit?: RewardItem | null;
  onSaved?: () => void;
}

// Preset library of curated musical gifts
const PRESET_GIFTS = [
  {
    name: 'Giáo trình Alfred Basic Piano Level 1A',
    category: 'Giáo trình',
    points: 80,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&auto=format&fit=crop&q=80',
    description: 'Giáo trình Piano tiêu chuẩn quốc tế có đĩa CD audio đi kèm.'
  },
  {
    name: 'Kẹp Capo Hợp Kim Cao Cấp Alice A007',
    category: 'Nhạc cụ & Phụ kiện',
    points: 50,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&auto=format&fit=crop&q=80',
    description: 'Capo đệm mút silicone bảo vệ cần đàn guitar tuyệt đối.'
  },
  {
    name: 'Máy Đếm Nhịp Cơ Khí Metronome Cherub',
    category: 'Nhạc cụ & Phụ kiện',
    points: 160,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    description: 'Metronome cơ học lên dây cót chuẩn xác cho luyện ngón và nhịp phách.'
  },
  {
    name: 'Áo Phông Đồng Phục Minh Music (Cotton 100%)',
    category: 'Quà lưu niệm',
    points: 120,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&auto=format&fit=crop&q=80',
    description: 'Áo thun năng động in logo Minh Music cao cấp, đủ size cho học viên.'
  },
  {
    name: 'Voucher Học Phí 500.000 VNĐ Khóa Tiếp Theo',
    category: 'Voucher',
    points: 300,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1556742049-0a67e557b6aa?w=400&auto=format&fit=crop&q=80',
    description: 'Áp dụng trừ trực tiếp vào học phí gia hạn khóa học bất kỳ.'
  },
  {
    name: 'Bộ Dây Đàn Guitar Acoustic D\'Addario EJ13',
    category: 'Nhạc cụ & Phụ kiện',
    points: 70,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    description: 'Dây đàn Bronze 80/20 âm thanh sáng rõ, êm tay cho người mới tập.'
  },
  {
    name: 'Tai Nghe Kiểm Âm Studio Chuyên Nghiệp',
    category: 'Nhạc cụ & Phụ kiện',
    points: 250,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
    description: 'Tai nghe over-ear âm thanh chân thực, cách âm hoàn hảo cho phòng tập.'
  },
  {
    name: 'Bình Giữ Nhiệt Minh Music Inox 304 Cao Cấp',
    category: 'Quà lưu niệm',
    points: 90,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&auto=format&fit=crop&q=80',
    description: 'Bình giữ nhiệt 500ml giữ nóng/lạnh 12h, in laser logo Minh Music.'
  }
];

export const RewardConfigModal: React.FC<RewardConfigModalProps> = ({
  isOpen,
  onClose,
  rewardToEdit,
  onSaved
}) => {
  const { addReward, updateReward, deleteReward } = useData();

  const [name, setName] = useState('');
  const [pointsRequired, setPointsRequired] = useState<number>(50);
  const [category, setCategory] = useState<string>('Nhạc cụ & Phụ kiện');
  const [stock, setStock] = useState<number>(20);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Load existing data if editing
  useEffect(() => {
    if (rewardToEdit) {
      setName(rewardToEdit.name || '');
      setPointsRequired(rewardToEdit.pointsRequired ?? rewardToEdit.requiredPoints ?? 50);
      setCategory(rewardToEdit.category || 'Nhạc cụ & Phụ kiện');
      setStock(rewardToEdit.stock !== undefined ? rewardToEdit.stock : 20);
      setImageUrl(rewardToEdit.imageUrl || rewardToEdit.image || '');
      setDescription(rewardToEdit.description || '');
    } else {
      setName('');
      setPointsRequired(50);
      setCategory('Nhạc cụ & Phụ kiện');
      setStock(20);
      setImageUrl('https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&auto=format&fit=crop&q=80');
      setDescription('');
    }
    setErrorMsg('');
  }, [rewardToEdit, isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PRESET_GIFTS[0]) => {
    setName(preset.name);
    setCategory(preset.category);
    setPointsRequired(preset.points);
    setStock(preset.stock);
    setImageUrl(preset.image);
    setDescription(preset.description);
  };

  const handleSave = () => {
    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập Tên phần quà!');
      return;
    }
    if (pointsRequired <= 0) {
      setErrorMsg('Số sao đổi quà phải lớn hơn 0!');
      return;
    }
    if (!imageUrl.trim()) {
      setErrorMsg('Vui lòng nhập hoặc chọn Ảnh quà tặng!');
      return;
    }

    const payload = {
      name: name.trim(),
      pointsRequired: Number(pointsRequired),
      requiredPoints: Number(pointsRequired),
      category,
      stock: Number(stock) || 0,
      image: imageUrl.trim(),
      imageUrl: imageUrl.trim(),
      description: description.trim()
    };

    if (rewardToEdit) {
      updateReward(rewardToEdit.id, payload);
    } else {
      addReward(payload);
    }

    if (onSaved) onSaved();
    onClose();
  };

  const handleDelete = () => {
    if (!rewardToEdit) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa phần quà "${rewardToEdit.name}" khỏi kho đổi quà?`)) {
      deleteReward(rewardToEdit.id);
      if (onSaved) onSaved();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 font-heading">
                {rewardToEdit ? 'Chỉnh Sửa & Cấu Hình Quà Tặng' : 'Thêm Quà Tặng Mới Vào Kho'}
              </h3>
              <p className="text-xs text-slate-500">
                Cấu hình số sao cần đổi, hình ảnh, tên quà và số lượng tồn kho cho học viên
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="py-5 space-y-5">
          
          {/* Preset Picker Quick Select */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Gợi ý quà mẫu có sẵn (Nhấn để chọn nhanh):</span>
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {PRESET_GIFTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-slate-700 hover:text-slate-900 text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>🎁</span>
                  <span>{p.name.slice(0, 22)}...</span>
                  <span className="text-amber-600 font-extrabold">{p.points}⭐</span>
                </button>
              ))}
            </div>
          </div>

          {/* Grid fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Tên phần quà */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên Quà Tặng (*):
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Kẹp Capo Hợp Kim Cao Cấp Alice..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-200 text-sm font-semibold text-slate-900 transition-all"
              />
            </div>

            {/* Số điểm thưởng cần đổi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Điểm Thưởng Đổi Quà (*):</span>
                <span className="text-rose-600 font-extrabold">{pointsRequired} điểm 🎁</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="1000"
                  step="5"
                  value={pointsRequired}
                  onChange={(e) => setPointsRequired(Number(e.target.value))}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-200 text-sm font-black text-rose-600 transition-all"
                />
                <Gift className="w-4 h-4 text-rose-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {[30, 50, 80, 100, 150, 200, 300].map(pt => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => setPointsRequired(pt)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold cursor-pointer transition-all ${
                      pointsRequired === pt ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {pt}đ
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                * Trừ vào Điểm đổi quà khi nhận quà, không ảnh hưởng Sao Vinh danh BXH
              </p>
            </div>

            {/* Số lượng tồn kho */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số Lượng Tồn Kho (Phần quà):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400 text-sm font-bold text-slate-900 transition-all"
                />
                <Package className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Danh mục quà */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Danh Mục Quà Tặng:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400 text-sm font-bold text-slate-800 transition-all"
              >
                <option value="Nhạc cụ & Phụ kiện">Nhạc cụ & Phụ kiện</option>
                <option value="Giáo trình">Giáo trình & Sách nhạc</option>
                <option value="Quà lưu niệm">Quà lưu niệm Minh Music</option>
                <option value="Voucher">Voucher học phí</option>
                <option value="Khác">Phần thưởng khác</option>
              </select>
            </div>

            {/* Link ảnh quà tặng */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                URL Hình Ảnh Quà Tặng (*):
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400 text-xs font-medium text-slate-700 transition-all"
                />
                <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Preview Box & Description */}
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="sm:col-span-1">
                <span className="text-[11px] font-bold text-slate-500 block mb-1">Xem trước ảnh quà:</span>
                <div className="h-28 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => setErrorMsg('URL ảnh không hợp lệ hoặc không tải được')}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Chưa có ảnh</span>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mô Tả Quà Tặng:
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả công dụng, tính năng, đối tượng nhận quà hoặc điều kiện áp dụng..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400 text-xs text-slate-800"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            {rewardToEdit && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
              >
                Xóa Quà Này
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white rounded-xl text-xs font-black shadow-md shadow-rose-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{rewardToEdit ? 'Lưu Thay Đổi' : 'Thêm Quà Vào Kho'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
