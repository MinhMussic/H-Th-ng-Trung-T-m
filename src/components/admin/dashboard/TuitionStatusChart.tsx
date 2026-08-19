import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { TuitionPayment } from '../../../types';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  PieChart as PieIcon,
  BarChart3,
  QrCode,
  Sparkles,
  Plus
} from 'lucide-react';

interface TuitionStatusChartProps {
  tuitionPayments: TuitionPayment[];
  onNavigateToTuition?: () => void;
}

export const TuitionStatusChart: React.FC<TuitionStatusChartProps> = ({
  tuitionPayments = [],
  onNavigateToTuition
}) => {
  const [viewMode, setViewMode] = useState<'status_pie' | 'monthly_bar'>('status_pie');

  // Compute status breakdown strictly from real tuition payments
  const statusStats = useMemo(() => {
    let completedAmount = 0;
    let completedCount = 0;
    let pendingAmount = 0;
    let pendingCount = 0;
    let overdueAmount = 0;
    let overdueCount = 0;
    let refundedAmount = 0;
    let refundedCount = 0;

    tuitionPayments.forEach(p => {
      const amt = Number(p.amount) || 0;
      if (p.status === 'completed' || p.status === 'paid') {
        completedAmount += amt;
        completedCount++;
      } else if (p.status === 'pending') {
        pendingAmount += amt;
        pendingCount++;
      } else if (p.status === 'overdue') {
        overdueAmount += amt;
        overdueCount++;
      } else if (p.status === 'refunded') {
        refundedAmount += (p.refundAmount || amt);
        refundedCount++;
      }
    });

    const totalAmount = completedAmount + pendingAmount + overdueAmount;
    const collectionRate = totalAmount > 0 ? Math.round((completedAmount / totalAmount) * 100) : 0;

    const pieData = [
      {
        name: 'Đã thanh toán',
        value: completedAmount,
        count: completedCount,
        color: '#10b981', // emerald-500
        percent: totalAmount > 0 ? Math.round((completedAmount / totalAmount) * 100) : 0
      },
      {
        name: 'Chờ thanh toán',
        value: pendingAmount,
        count: pendingCount,
        color: '#f59e0b', // amber-500
        percent: totalAmount > 0 ? Math.round((pendingAmount / totalAmount) * 100) : 0
      },
      {
        name: 'Quá hạn',
        value: overdueAmount,
        count: overdueCount,
        color: '#ef4444', // red-500
        percent: totalAmount > 0 ? Math.round((overdueAmount / totalAmount) * 100) : 0
      }
    ].filter(item => item.value > 0);

    return {
      completedAmount,
      completedCount,
      pendingAmount,
      pendingCount,
      overdueAmount,
      overdueCount,
      totalAmount,
      collectionRate,
      pieData
    };
  }, [tuitionPayments]);

  // Compute real 6-month revenue flow
  const monthlyFlowData = useMemo(() => {
    const now = new Date();
    const months: Array<{
      monthKey: string;
      label: string;
      collected: number;
      pending: number;
      overdue: number;
    }> = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      months.push({
        monthKey: `${year}-${String(month).padStart(2, '0')}`,
        label: `T${month}/${String(year).slice(2)}`,
        collected: 0,
        pending: 0,
        overdue: 0
      });
    }

    tuitionPayments.forEach((p) => {
      const dateStr = p.paymentDate || p.dueDate || (p as any).createdAt || '';
      const mKey = dateStr && typeof dateStr === 'string' && dateStr.length >= 7 ? dateStr.slice(0, 7) : '';
      const slot = months.find(m => m.monthKey === mKey);

      if (slot) {
        const amt = Number(p.amount) || 0;
        if (p.status === 'completed' || p.status === 'paid') {
          slot.collected += amt;
        } else if (p.status === 'pending') {
          slot.pending += amt;
        } else if (p.status === 'overdue') {
          slot.overdue += amt;
        }
      }
    });

    return months;
  }, [tuitionPayments]);

  const hasAnyPayments = tuitionPayments.length > 0 && statusStats.totalAmount > 0;

  // Custom Currency Tooltip
  const CustomCurrencyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl border border-slate-800 backdrop-blur-md text-xs min-w-[210px] animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="font-extrabold text-amber-400 font-heading">
              {label || payload[0]?.name}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold">
              VietQR / Thu phí
            </span>
          </div>

          <div className="space-y-2">
            {payload.map((entry: any, index: number) => {
              const val = Number(entry.value) || 0;
              return (
                <div key={`item-${index}`} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: entry.color || entry.fill }}
                    />
                    <span className="text-slate-300 text-[11px]">{entry.name}:</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black font-mono text-white text-[11px] block">
                      {val.toLocaleString('vi-VN')} đ
                    </span>
                    {entry.payload?.count !== undefined && (
                      <span className="text-[10px] text-slate-400">
                        ({entry.payload.count} phiếu • {entry.payload.percent}%)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
      {/* Header & View Switch */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20 flex-shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Tình Trạng & Dòng Tiền Học Phí
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  statusStats.collectionRate > 0 ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {statusStats.collectionRate}% thu đạt
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Thống kê doanh thu thực thu, công nợ và tỷ lệ thanh toán
              </p>
            </div>
          </div>

          {/* Switch mode */}
          <div className="bg-slate-100 p-0.5 rounded-xl flex items-center text-[11px] font-bold text-slate-600 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('status_pie')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'status_pie'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Cơ Cấu</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('monthly_bar')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'monthly_bar'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Theo Tháng</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-3 gap-2 pt-3 text-center">
          <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-[10px] text-emerald-700 font-bold block">Đã Thu Thực Tế</span>
            <span className="text-xs sm:text-sm font-black text-emerald-700">
              {statusStats.completedAmount > 0 
                ? (statusStats.completedAmount >= 1000000 
                    ? `${(statusStats.completedAmount / 1000000).toFixed(1)} tr đ` 
                    : `${statusStats.completedAmount.toLocaleString('vi-VN')} đ`)
                : '0 đ'}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-100">
            <span className="text-[10px] text-amber-700 font-bold block">Chờ Thu / Công Nợ</span>
            <span className="text-xs sm:text-sm font-black text-amber-700">
              {statusStats.pendingAmount > 0 
                ? (statusStats.pendingAmount >= 1000000 
                    ? `${(statusStats.pendingAmount / 1000000).toFixed(1)} tr đ` 
                    : `${statusStats.pendingAmount.toLocaleString('vi-VN')} đ`)
                : '0 đ'}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-rose-50/70 border border-rose-100">
            <span className="text-[10px] text-rose-700 font-bold block">Quá Hạn Cần Nhắc</span>
            <span className="text-xs sm:text-sm font-black text-rose-700">
              {statusStats.overdueAmount > 0 
                ? (statusStats.overdueAmount >= 1000000 
                    ? `${(statusStats.overdueAmount / 1000000).toFixed(1)} tr đ` 
                    : `${statusStats.overdueAmount.toLocaleString('vi-VN')} đ`)
                : '0 đ'}
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Canvas with Empty State Overlay if 0 tuition payments */}
      <div className="h-64 w-full pt-2 relative">
        {!hasAnyPayments && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-[2px] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2 shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Chưa phát sinh giao dịch thu học phí
            </p>
            <p className="text-[11px] text-slate-500 max-w-xs mt-0.5 mb-3">
              Biểu đồ cơ cấu và dòng tiền sẽ tự động cập nhật chính xác theo các phiếu thu và hóa đơn học phí thực tế.
            </p>
            {onNavigateToTuition && (
              <button
                type="button"
                onClick={onNavigateToTuition}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tạo Phiếu Thu Mới</span>
              </button>
            )}
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'status_pie' ? (
            <PieChart>
              <Tooltip content={<CustomCurrencyTooltip />} />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                formatter={(value, entry: any) => (
                  <span className="text-slate-700 font-medium">
                    {value}: <strong>{entry.payload.percent}%</strong>
                  </span>
                )}
              />
              <Pie
                data={statusStats.pieData.length > 0 ? statusStats.pieData : [{ name: 'Trống', value: 1, color: '#e2e8f0', percent: 0, count: 0 }]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={statusStats.pieData.length > 1 ? 4 : 0}
              >
                {(statusStats.pieData.length > 0 ? statusStats.pieData : [{ color: '#e2e8f0' }]).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                ))}
              </Pie>
            </PieChart>
          ) : (
            <BarChart data={monthlyFlowData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(0)}tr` : `${val}`}
                domain={[0, (dataMax: number) => Math.max(10000000, dataMax + 2000000)]}
              />
              <Tooltip content={<CustomCurrencyTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: 11, paddingBottom: 6 }}
              />
              <Bar
                dataKey="collected"
                name="Đã thu thực tế"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="pending"
                name="Chờ thanh toán"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Footer link */}
      {onNavigateToTuition && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400">Tự động đối soát VietQR</span>
          <button
            type="button"
            onClick={onNavigateToTuition}
            className="text-purple-700 hover:text-purple-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Chi tiết học phí & hóa đơn</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
