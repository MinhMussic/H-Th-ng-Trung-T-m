import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { TenantBranch } from '../../types';
import {
  MapPin,
  Building,
  Phone,
  Mail,
  ExternalLink,
  Navigation,
  Copy,
  Check,
  Plus,
  Edit2,
  Trash2,
  Clock,
  User,
  Sparkles,
  Search,
  Sliders,
  Maximize2,
  Compass,
  Layers,
  Share2,
  QrCode,
  X,
  Info,
  Key,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Music
} from 'lucide-react';

export const BranchesAndMapManagement: React.FC = () => {
  const {
    branches,
    activeBranchId,
    setActiveBranchId,
    addBranch,
    updateBranch,
    deleteBranch,
    students,
    classes,
    teachers
  } = useData();

  const [selectedBranchId, setSelectedBranchId] = useState<string>(activeBranchId || branches[0]?.id || 'branch-01');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mapViewMode, setMapViewMode] = useState<'roadmap' | 'satellite'>('roadmap');

  // Edit / Add Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<TenantBranch | null>(null);
  const [qrModalBranch, setQrModalBranch] = useState<TenantBranch | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<TenantBranch, 'id'>>({
    code: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    isMainBranch: false,
    googleMapsUrl: '',
    mapEmbedUrl: '',
    latitude: 10.7769,
    longitude: 106.7009,
    openingHours: '08:00 - 21:30 (Thứ 2 - Chủ Nhật)',
    managerName: '',
    managerPhone: '',
    facilities: ['Phòng Grand Piano', 'Phòng Thanh Nhạc', 'Bãi giữ xe ô tô & xe máy', 'Máy lạnh 24/7'],
    imageUrl: 'https://images.unsplash.com/photo-1520523839898-50712825e3a7?w=800&auto=format&fit=crop&q=80',
    googleMapsApiKey: '',
    notes: ''
  });

  const [newFacilityInput, setNewFacilityInput] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    showToast(`Đã sao chép ${label} vào bộ nhớ tạm!`);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const currentSelectedBranch = branches.find(b => b.id === selectedBranchId) || branches[0] || {
    id: 'branch-01',
    code: 'MM-Q1',
    name: 'Trụ Sở Chính - Minh Music Center',
    address: '123 Đường Âm Nhạc, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    phone: '0901.888.999',
    email: 'contact@minhmusic.vn',
    isMainBranch: true,
    googleMapsUrl: 'https://maps.app.goo.gl/cCs2t8VuaE9JBNMD9?g_st=ac',
    latitude: 10.7769,
    longitude: 106.7009
  };

  const filteredBranches = branches.filter(b => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.address.toLowerCase().includes(q) ||
      b.code.toLowerCase().includes(q) ||
      (b.managerName || '').toLowerCase().includes(q)
    );
  });

  // Calculate Map Embed URL
  const getEmbedMapUrl = (branch: TenantBranch) => {
    if (branch.mapEmbedUrl && branch.mapEmbedUrl.includes('embed')) {
      return branch.mapEmbedUrl;
    }
    
    // If API key exists
    if (branch.googleMapsApiKey) {
      return `https://www.google.com/maps/embed/v1/place?key=${branch.googleMapsApiKey}&q=${encodeURIComponent(branch.address || branch.name)}`;
    }

    // Default high-compatibility standard embed iframe using query address / coordinates
    const query = branch.latitude && branch.longitude
      ? `${branch.latitude},${branch.longitude}`
      : encodeURIComponent(branch.address || branch.name);

    const mapTypeParam = mapViewMode === 'satellite' ? '&t=k' : '';
    return `https://maps.google.com/maps?q=${query}&z=16${mapTypeParam}&ie=UTF8&iwloc=&output=embed`;
  };

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setFormData({
      code: `MM-CS${branches.length + 1}`,
      name: `Cơ Sở ${branches.length + 1} - Minh Music Academy`,
      address: '',
      phone: '0901.888.999',
      email: `cso${branches.length + 1}@minhmusic.vn`,
      isMainBranch: false,
      googleMapsUrl: 'https://maps.app.goo.gl/cCs2t8VuaE9JBNMD9?g_st=ac',
      mapEmbedUrl: '',
      latitude: 10.7769,
      longitude: 106.7009,
      openingHours: '08:00 - 21:30 (Thứ 2 - Chủ Nhật)',
      managerName: '',
      managerPhone: '',
      facilities: ['Phòng Piano Upright', 'Phòng Thanh Nhạc', 'Bãi đỗ xe', 'Máy lạnh 24/7'],
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      googleMapsApiKey: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (branch: TenantBranch) => {
    setEditingBranch(branch);
    setFormData({
      code: branch.code,
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
      isMainBranch: branch.isMainBranch,
      googleMapsUrl: branch.googleMapsUrl || 'https://maps.app.goo.gl/cCs2t8VuaE9JBNMD9?g_st=ac',
      mapEmbedUrl: branch.mapEmbedUrl || '',
      latitude: branch.latitude || 10.7769,
      longitude: branch.longitude || 106.7009,
      openingHours: branch.openingHours || '08:00 - 21:30 (Thứ 2 - Chủ Nhật)',
      managerName: branch.managerName || '',
      managerPhone: branch.managerPhone || '',
      facilities: branch.facilities || ['Phòng Piano cơ', 'Máy lạnh 24/7'],
      imageUrl: branch.imageUrl || 'https://images.unsplash.com/photo-1520523839898-50712825e3a7?w=800&auto=format&fit=crop&q=80',
      googleMapsApiKey: branch.googleMapsApiKey || '',
      notes: branch.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim()) {
      showToast('Vui lòng nhập Tên cơ sở và Địa chỉ cụ thể!');
      return;
    }

    if (editingBranch) {
      updateBranch(editingBranch.id, formData);
      showToast(`Đã cập nhật thông tin và bản đồ cho ${formData.name}!`);
    } else {
      addBranch(formData);
      showToast(`Đã thêm cơ sở mới "${formData.name}" vào hệ thống!`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteBranch = (id: string, name: string) => {
    const b = branches.find(item => item.id === id);
    if (b?.isMainBranch) {
      alert('Không thể xóa Trụ sở chính của hệ thống.');
      return;
    }
    if (confirm(`Bạn có chắc chắn muốn xóa cơ sở "${name}" khỏi danh sách?`)) {
      deleteBranch(id);
      showToast(`Đã xóa cơ sở ${name}.`);
      if (selectedBranchId === id) {
        setSelectedBranchId(branches[0]?.id || 'branch-01');
      }
    }
  };

  const handleAddFacility = () => {
    if (!newFacilityInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      facilities: [...(prev.facilities || []), newFacilityInput.trim()]
    }));
    setNewFacilityInput('');
  };

  const handleRemoveFacility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      facilities: (prev.facilities || []).filter((_, idx) => idx !== index)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-amber-500/30 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-rose-500 to-red-600 text-white rounded-2xl shadow-md shadow-rose-500/20">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 font-heading">
                Bản Đồ Cơ Sở & Định Vị Mạng Lưới Chi Nhánh
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-200">
                {branches.length} Cơ sở
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Tích hợp Google Maps trực quan, quản lý địa chỉ, chia sẻ vị trí qua link/QR cho học viên và phụ huynh.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Active Branch Badge */}
          <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-xs">
            <Building className="w-4 h-4 text-indigo-600" />
            <span className="text-slate-500 font-medium">Đang làm việc tại:</span>
            <span className="font-extrabold text-slate-900">
              {branches.find(b => b.id === activeBranchId)?.name || 'Trụ sở chính'}
            </span>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ THÊM CƠ SỞ MỚI</span>
          </button>
        </div>
      </div>

      {/* Main Layout: 2 Columns (Interactive Map on Left / Top, Branch Details & List on Right / Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: INTERACTIVE MAP VIEWER & ACTIONS (7 cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Map Header Toolbar */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 font-heading">
                    {currentSelectedBranch.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                    <span className="truncate">{currentSelectedBranch.address}</span>
                  </p>
                </div>
              </div>

              {/* Map Layer Switcher & Full Map Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="bg-white border border-slate-200 rounded-xl p-0.5 flex items-center text-xs">
                  <button
                    onClick={() => setMapViewMode('roadmap')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      mapViewMode === 'roadmap' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    <span>Đường phố</span>
                  </button>
                  <button
                    onClick={() => setMapViewMode('satellite')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      mapViewMode === 'satellite' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Compass className="w-3 h-3" />
                    <span>Vệ tinh</span>
                  </button>
                </div>

                <a
                  href={currentSelectedBranch.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(currentSelectedBranch.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold transition-all flex items-center gap-1"
                  title="Mở toàn màn hình trong Google Maps"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                </a>
              </div>
            </div>

            {/* Embedded Live Google Maps Iframe */}
            <div className="relative w-full h-[400px] sm:h-[460px] bg-slate-100">
              <iframe
                title={`Map of ${currentSelectedBranch.name}`}
                src={getEmbedMapUrl(currentSelectedBranch)}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />

              {/* Floating Quick Action Overlay on Map */}
              <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200/80 shadow-lg flex flex-wrap items-center gap-2 text-xs">
                <a
                  href={currentSelectedBranch.googleMapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(currentSelectedBranch.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Chỉ Đường (Google Maps)</span>
                </a>

                <button
                  onClick={() => handleCopy(currentSelectedBranch.googleMapsUrl || currentSelectedBranch.address, 'Link Google Maps')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedLink === 'Link Google Maps' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>Sao chép vị trí</span>
                </button>

                <button
                  onClick={() => setQrModalBranch(currentSelectedBranch)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Tạo mã QR quét vị trí trên điện thoại"
                >
                  <QrCode className="w-3.5 h-3.5 text-purple-600" />
                  <span>Mã QR Vị Trí</span>
                </button>
              </div>
            </div>

            {/* Quick Summary Info Under Map */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Giờ mở cửa</span>
                  <span className="font-extrabold text-slate-800">{currentSelectedBranch.openingHours || '08:00 - 21:30'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Hotline cơ sở</span>
                  <span className="font-extrabold text-slate-800">{currentSelectedBranch.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 text-purple-800 rounded-xl">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Phụ trách cơ sở</span>
                  <span className="font-extrabold text-slate-800">{currentSelectedBranch.managerName || 'Ban Giám Đốc'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Link / API Key Configuration Guidance Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-slate-50 to-purple-50 border border-indigo-200/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                  Liên Kết Google Maps Đã Cấu Hình:
                </h4>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold">
                Tự động đồng bộ
              </span>
            </div>

            <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-indigo-100">
              <input
                type="text"
                readOnly
                value={currentSelectedBranch.googleMapsUrl || 'https://maps.app.goo.gl/cCs2t8VuaE9JBNMD9?g_st=ac'}
                className="w-full bg-transparent text-xs font-mono text-slate-700 outline-none select-all"
              />
              <button
                onClick={() => handleCopy(currentSelectedBranch.googleMapsUrl || 'https://maps.app.goo.gl/cCs2t8VuaE9JBNMD9?g_st=ac', 'Link Google Maps')}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>Sao chép</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              💡 Bạn có thể dán trực tiếp bất kỳ link Google Maps rút gọn (ví dụ: <code className="text-indigo-600 font-mono font-bold">https://maps.app.goo.gl/...</code>), link địa điểm đầy đủ hoặc Google Maps API Key vào mục <strong>Sửa Cơ Sở</strong> để tùy chỉnh vị trí cho từng chi nhánh.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: BRANCHES LIST & SELECTOR (5 cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Search & Filter bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 font-heading">
                Danh Sách Cơ Sở & Chi Nhánh ({branches.length})
              </h3>
              <button
                onClick={handleOpenAdd}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm cơ sở</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Tìm theo tên cơ sở, quận, mã..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all font-medium"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Branches Cards */}
          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {filteredBranches.map((branch) => {
              const isSelected = branch.id === selectedBranchId;
              const isWorkingBranch = branch.id === activeBranchId;

              return (
                <div
                  key={branch.id}
                  onClick={() => setSelectedBranchId(branch.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'border-rose-500 bg-rose-50/30 ring-2 ring-rose-400/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        branch.isMainBranch 
                          ? 'bg-amber-100 text-amber-800' 
                          : isSelected 
                            ? 'bg-rose-100 text-rose-700' 
                            : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-extrabold text-slate-900 font-heading">
                            {branch.name}
                          </h4>
                          {branch.isMainBranch && (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                              TRỤ SỞ CHÍNH
                            </span>
                          )}
                          {isWorkingBranch && (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                              ĐANG CHỌN LÀM VIỆC
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 block mt-0.5">
                          Mã: {branch.code}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenEdit(branch)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                        title="Chỉnh sửa thông tin & bản đồ cơ sở"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {!branch.isMainBranch && (
                        <button
                          onClick={() => handleDeleteBranch(branch.id, branch.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Xóa cơ sở này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Address & Hotline */}
                  <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <p className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{branch.address}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-semibold">{branch.phone}</span>
                    </p>
                  </div>

                  {/* Facilities Tags */}
                  {branch.facilities && branch.facilities.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {branch.facilities.slice(0, 3).map((f, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded-md text-[10px] font-medium">
                          {f}
                        </span>
                      ))}
                      {branch.facilities.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-bold">
                          +{branch.facilities.length - 3} tiện ích
                        </span>
                      )}
                    </div>
                  )}

                  {/* Card Bottom Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setActiveBranchId(branch.id);
                        showToast(`Đã chuyển cơ sở làm việc sang: ${branch.name}`);
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] ${
                        isWorkingBranch
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isWorkingBranch ? '✓ Cơ sở hiện hành' : 'Chọn làm việc'}
                    </button>

                    <div className="flex items-center gap-2">
                      <a
                        href={branch.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(branch.address)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-rose-600 hover:text-rose-700 font-extrabold text-[11px] flex items-center gap-1"
                      >
                        <span>Mở Maps</span>
                        <ChevronRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: THÊM / CHỈNH SỬA CƠ SỞ & BẢN ĐỒ */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 font-heading">
                    {editingBranch ? 'Chỉnh Sửa Thông Tin & Bản Đồ Cơ Sở' : 'Thêm Chi Nhánh / Cơ Sở Mới'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cấu hình tên cơ sở, địa chỉ định vị Google Maps, hotline và tiện ích phòng học.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Tên cơ sở (*):</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Cơ Sở 2 - Minh Music Studio Thảo Điền"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-200 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã cơ sở (*):</label>
                  <input
                    type="text"
                    required
                    placeholder="MM-TD"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Địa chỉ đầy đủ (*):</label>
                <input
                  type="text"
                  required
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-200 font-medium"
                />
              </div>

              {/* GOOGLE MAPS LINK & EMBED CONFIGURATION */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-600" />
                    Định vị Google Maps (Link chia sẻ / Key):
                  </span>
                  <span className="text-[10px] text-amber-700 font-bold">Hỗ trợ link maps.app.goo.gl</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Link Google Maps (URL):
                  </label>
                  <input
                    type="text"
                    placeholder="https://maps.app.goo.gl/cCs2t8VuaE9JBNMD9?g_st=ac hoặc link maps bất kỳ"
                    value={formData.googleMapsUrl || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, googleMapsUrl: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-amber-300 bg-white font-mono text-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    * Bạn có thể mở Google Maps trên điện thoại hoặc máy tính, chọn <strong>Chia sẻ (Share)</strong> và dán liên kết vào đây.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Vĩ độ (Latitude) [Tùy chọn]:</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="10.7769"
                      value={formData.latitude || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, latitude: Number(e.target.value) }))}
                      className="w-full p-2 rounded-xl border border-slate-200 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kinh độ (Longitude) [Tùy chọn]:</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="106.7009"
                      value={formData.longitude || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, longitude: Number(e.target.value) }))}
                      className="w-full p-2 rounded-xl border border-slate-200 bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Google Maps API Key (Nếu có):</label>
                  <input
                    type="text"
                    placeholder="AIzaSy..."
                    value={formData.googleMapsApiKey || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, googleMapsApiKey: e.target.value }))}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>
              </div>

              {/* CONTACT & OPERATIONAL DETAILS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại / Hotline:</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email cơ sở:</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Người phụ trách / Trưởng cơ sở:</label>
                  <input
                    type="text"
                    placeholder="Thầy Lê Quang Minh"
                    value={formData.managerName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, managerName: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giờ mở cửa đón tiếp:</label>
                  <input
                    type="text"
                    placeholder="08:00 - 21:30 (Thứ 2 - Chủ Nhật)"
                    value={formData.openingHours || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, openingHours: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* FACILITIES MANAGEMENT */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cơ sở vật chất & Tiện ích:</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Nhập tiện ích (vd: Phòng Grand Piano Kawai, Bãi xe ô tô)..."
                    value={newFacilityInput}
                    onChange={(e) => setNewFacilityInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFacility(); } }}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddFacility}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shrink-0"
                  >
                    + Thêm
                  </button>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {(formData.facilities || []).map((f, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-lg font-bold text-[11px] flex items-center gap-1">
                      <span>{f}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFacility(idx)}
                        className="text-indigo-400 hover:text-indigo-700 cursor-pointer ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* MAIN BRANCH CHECKBOX */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Đặt làm Trụ sở chính (Main Headquarters)</span>
                  <span className="text-[11px] text-slate-500">Cơ sở đại diện hiển thị ưu tiên trên toàn bộ ứng dụng</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isMainBranch}
                  onChange={(e) => setFormData(prev => ({ ...prev, isMainBranch: e.target.checked }))}
                  className="w-5 h-5 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
              </div>

              {/* MODAL ACTIONS */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black shadow-md shadow-rose-600/20 cursor-pointer"
                >
                  {editingBranch ? 'LƯU THAY ĐỔI CƠ SỞ' : 'TẠO CƠ SỞ MỚI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: QR CODE CHIA SẺ VỊ TRÍ */}
      {/* ========================================================================= */}
      {qrModalBranch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 font-heading">
                Mã QR Quét Vị Trí Google Maps
              </h3>
              <button
                onClick={() => setQrModalBranch(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-gradient-to-b from-rose-50 to-orange-50/30 rounded-2xl border border-rose-200">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrModalBranch.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(qrModalBranch.address)}`)}`}
                alt="QR Code Map"
                className="w-48 h-48 mx-auto rounded-xl shadow-xs bg-white p-2"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="text-xs space-y-1">
              <p className="font-bold text-slate-900">{qrModalBranch.name}</p>
              <p className="text-[11px] text-slate-500 line-clamp-2">{qrModalBranch.address}</p>
            </div>

            <p className="text-[11px] text-slate-500">
              Phụ huynh & học viên có thể dùng camera điện thoại hoặc Zalo để quét và mở chỉ đường trực tiếp.
            </p>

            <button
              onClick={() => {
                handleCopy(qrModalBranch.googleMapsUrl || qrModalBranch.address, 'Link Google Maps');
                setQrModalBranch(null);
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
            >
              Sao Chép Link Vị Trí
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
