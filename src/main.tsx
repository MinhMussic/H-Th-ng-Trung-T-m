import React, { Component, StrictMode, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { injectSpeedInsights } from '@vercel/speed-insights';
import App from './App.tsx';
import './index.css';
import { testFirestoreConnection } from './firebase/config';

// Test Firebase Firestore connection on boot
testFirestoreConnection();

// Initialize Vercel Speed Insights
injectSpeedInsights();

// Global error handler to catch uncaught script and promise errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.warn('Global error caught:', event.message || event.error);
  });
  window.addEventListener('unhandledrejection', (event) => {
    console.warn('Unhandled promise rejection caught:', event.reason);
  });
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleClearDataAndReload = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('Could not clear localStorage:', e);
    }
    window.location.reload();
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-800/90 rounded-2xl border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-2xl font-bold">
              !
            </div>
            <h2 className="text-xl font-bold text-white">Đã xảy ra sự cố hiển thị</h2>
            <p className="text-sm text-slate-300">
              {this.state.error?.message || 'Hệ thống đã tự động ghi nhận lỗi và phục hồi giao diện.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 font-bold text-slate-900 text-sm transition-colors cursor-pointer"
              >
                Tải lại ứng dụng
              </button>
              <button
                onClick={this.handleClearDataAndReload}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 font-semibold text-slate-200 text-sm transition-colors cursor-pointer"
              >
                Đặt lại dữ liệu mẫu
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);


