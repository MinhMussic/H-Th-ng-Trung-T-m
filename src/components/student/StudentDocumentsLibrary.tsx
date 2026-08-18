import React, { useState } from 'react';
import { 
  Video, 
  FileText, 
  Music, 
  Download, 
  Play, 
  Pause, 
  ExternalLink, 
  Sparkles, 
  BookOpen, 
  Volume2, 
  Layers,
  Search,
  Filter,
  Eye
} from 'lucide-react';

interface DocumentItem {
  id: string;
  title: string;
  category: 'sheet' | 'video' | 'audio' | 'theory';
  subject: string;
  level: string;
  author: string;
  fileSize?: string;
  duration?: string;
  fileUrl: string;
  thumbnailUrl?: string;
  description: string;
}

const SAMPLE_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-01',
    title: 'Sheet Nhạc: Canon in D (Johann Pachelbel) - Bản Đơn Giản',
    category: 'sheet',
    subject: 'Piano',
    level: 'Cơ bản',
    author: 'Thầy Hoàng Minh biên soạn',
    fileSize: '1.8 MB PDF',
    fileUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800',
    description: 'Bản ký âm 2 bè tay phải và tay trái có đánh số ngón tay chi tiết dành cho học viên mới học'
  },
  {
    id: 'doc-02',
    title: 'Sheet & Hợp Âm: Fur Elise (L.V. Beethoven) - Phần 1',
    category: 'sheet',
    subject: 'Piano',
    level: 'Trung cấp',
    author: 'Cô Thu Hương',
    fileSize: '2.4 MB PDF',
    fileUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    description: 'Tác phẩm cổ điển bất hủ với hướng dẫn nhịp 3/8 và kỹ thuật vuốt phím legato mượt mà'
  },
  {
    id: 'doc-03',
    title: 'Video Bài Giảng: Kỹ Thuật Đặt Ngón & Thả Lỏng Cổ Tay Chuẩn',
    category: 'video',
    subject: 'Piano',
    level: 'Tất cả cấp độ',
    author: 'Thầy Đức Thịnh (Giám Đốc Đào Tạo)',
    duration: '14:20 phút',
    fileUrl: 'https://www.youtube.com',
    thumbnailUrl: 'https://images.unsplash.com/photo-1520523839898-507127053e14?w=800',
    description: 'Hướng dẫn chi tiết tư thế ngồi, khoảng cách ghế và bài tập thả lỏng cổ tay chống mỏi ngón'
  },
  {
    id: 'doc-04',
    title: 'Backing Track Nhịp Trống & Metronome Luyện Tốc Độ 60 - 120 BPM',
    category: 'audio',
    subject: 'Trống & Bộ Gõ',
    level: 'Cơ bản - Nâng cao',
    author: 'Ban Chuyên Môn Minh Music',
    duration: '05:30 phút',
    fileUrl: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800',
    description: 'Track âm thanh chất lượng cao 320kbps với tiếng click metronome và nhịp đệm drum loop'
  },
  {
    id: 'doc-05',
    title: 'Giáo Trình Nhạc Lý Căn Bản: Nốt Nhạc, Khóa Sol, Khóa Fa & Giá Trị Trường Độ',
    category: 'theory',
    subject: 'Nhạc lý & Xướng âm',
    level: 'Khởi đầu',
    author: 'Minh Music Academy',
    fileSize: '4.2 MB PDF',
    fileUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    description: 'Sách bài tập nhạc lý trực quan có hình minh họa dễ hiểu cho cả học viên nhí và người lớn'
  },
  {
    id: 'doc-06',
    title: 'Sheet Guitar: Romance de Amor (Spanish Romance)',
    category: 'sheet',
    subject: 'Guitar',
    level: 'Trung cấp',
    author: 'Thầy Quốc Huy',
    fileSize: '1.5 MB PDF',
    fileUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800',
    description: 'Bản Tab & nốt chuẩn kỹ thuật rải ngón Arpeggio P-I-M-A kinh điển trên đàn Guitar cổ điển'
  }
];

export const StudentDocumentsLibrary: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const filteredDocs = SAMPLE_DOCUMENTS.filter(doc => {
    const matchesCat = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = !searchKeyword.trim() || 
      doc.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      doc.subject.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      doc.author.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Kho Học Liệu Số Minh Music Academy</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight">
            Thư Viện Sheet Nhạc, Video & Audio Luyện Đàn
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
            Học viên được quyền truy cập miễn phí toàn bộ kho tài liệu chuyên sâu, bản ký âm độc quyền và video hướng dẫn của các giảng viên tại trung tâm.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x">
          {[
            { id: 'all', label: 'Tất cả', icon: Layers },
            { id: 'sheet', label: 'Sheet Nhạc', icon: FileText },
            { id: 'video', label: 'Video Bài Giảng', icon: Video },
            { id: 'audio', label: 'Backing Track / Beat', icon: Volume2 },
            { id: 'theory', label: 'Sách Nhạc Lý', icon: BookOpen }
          ].map(cat => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative shrink-0 sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm tên sheet, tác phẩm..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
          />
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="font-bold text-xs">Không tìm thấy tài liệu phù hợp với tìm kiếm của bạn.</p>
          </div>
        ) : (
          filteredDocs.map(doc => {
            const isAudio = doc.category === 'audio';
            const isPlaying = playingAudioId === doc.id;

            return (
              <div 
                key={doc.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      doc.category === 'sheet' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                      doc.category === 'video' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                      doc.category === 'audio' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {doc.category === 'sheet' ? 'Sheet Nhạc' :
                       doc.category === 'video' ? 'Video Bài Giảng' :
                       doc.category === 'audio' ? 'Backing Track' : 'Nhạc Lý'}
                    </span>

                    <span className="text-[11px] font-extrabold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {doc.subject} • {doc.level}
                    </span>
                  </div>

                  <h3 className="font-black text-sm text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                    {doc.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {doc.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400 truncate">
                    {doc.author}
                  </span>

                  {isAudio ? (
                    <button
                      onClick={() => setPlayingAudioId(isPlaying ? null : doc.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isPlaying 
                          ? 'bg-rose-600 text-white' 
                          : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isPlaying ? 'Dừng phát' : 'Nghe Beat'}</span>
                    </button>
                  ) : (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{doc.fileSize || 'Xem ngay'}</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
