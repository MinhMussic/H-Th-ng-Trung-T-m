import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { UserProfileView } from './UserProfileView';
import { X } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'info' | 'avatar' | 'related' | 'security' | 'audio' | 'theme';
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, initialTab }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl bg-slate-50 dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[90vh] flex flex-col z-[100000]">
        {/* Modal Top Close Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-heading">
              Hồ sơ cá nhân & Cài đặt tài khoản
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with proper scrolling and bottom padding */}
        <div className="p-4 sm:p-6 pb-8 overflow-y-auto flex-1 overscroll-contain">
          <UserProfileView onClose={onClose} initialTab={initialTab} />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
