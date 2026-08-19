import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Student } from '../../../types';
import {
  TrendingUp,
  GraduationCap,
  Users,
  Calendar,
  Filter,
  Sparkles,
  ArrowUpRight,
  Music,
  UserPlus
} from 'lucide-react';

interface EnrollmentTrendsChartProps {
  students: Student[];
  onNavigateToStudents?: () => void;
}

export const EnrollmentTrendsChart: React.FC<EnrollmentTrendsChartProps> = ({
  students = [],
  onNavigateToStudents
}) => {
  const [timeRange, setTimeRange] = useState<'6M' | '12M'>('6M');
  const [chartView, setChartView] = useState<'area' | 'bar' | 'subject'>('area');

  // Compute monthly enrollment data strictly from real student records
  const chartData = useMemo(() => {
    const monthsCount = timeRange === '6M' ? 6 : 12;
    const now = new Date();
    const result: Array<{
      monthKey: string;
      label: string;
      newStudents: number;
      activeTotal: number;
      piano: number;
      guitar: number;
      vocal: number;
      other: number;
    }> = [];

    // Generate month slots from past to present based on real clock
    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const monthKey = `${year}-${String(month).padStart(2, '0')}`;
      const label = `T${month}/${String(year).slice(2)}`;

      result.push({
        monthKey,
        label,
        newStudents: 0,
        activeTotal: 0,
        piano: 0,
        guitar: 0,
        vocal: 0,
        other: 0
      });
    }

    // Distribute students by real joinDate / createdAt
    students.forEach((student) => {
      const joinDateStr = student.joinDate || student.joinedDate || (student as any).createdAt || '';
      let studentMonthKey = '';
      if (joinDateStr && typeof joinDateStr === 'string' && joinDateStr.length >= 7) {
        studentMonthKey = joinDateStr.slice(0, 7);
      }

      const subjects = (student.enrolledSubjects || []).map(s => (s || '').toLowerCase());
      const hasPiano = subjects.some(s => s.includes('piano') || s.includes('keyboard') || s.includes('organ'));
      const hasGuitar = subjects.some(s => s.includes('guitar') || s.includes('ukulele'));
      const hasVocal = subjects.some(s => s.includes('thanh nhạc') || s.includes('vocal') || s.includes('hát'));

      const slot = result.find(r => r.monthKey === studentMonthKey);
      if (slot) {
        slot.newStudents += 1;
        if (hasPiano) slot.piano += 1;
        else if (hasGuitar) slot.guitar += 1;
        else if (hasVocal) slot.vocal += 1;
        else slot.other += 1;
      }
    });

    // Real cumulative active students calculation
    let runningActive = 0;
    result.forEach((item) => {
      runningActive += item.newStudents;
      item.activeTotal = runningActive;
    });

    return result;
  }, [students, timeRange]);

  // Overall calculations based 100% on real data
  const totalNewInPeriod = chartData.reduce((sum, item) => sum + item.newStudents, 0);
  const latestMonth = chartData[chartData.length - 1] || { label: 'T8/26', newStudents: 0 };
  const prevMonth = chartData[chartData.length - 2] || latestMonth;
  
  const growthRate = useMemo(() => {
    const prev = prevMonth.newStudents;
    const curr = latestMonth.newStudents;
    if (prev === 0 && curr === 0) return 0;
    if (prev === 0 && curr > 0) return 100;
    return Math.round(((curr - prev) / prev) * 100);
  }, [prevMonth, latestMonth]);

  const hasAnyData = students.length > 0 && totalNewInPeriod > 0;

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl border border-slate-800 backdrop-blur-md text-xs min-w-[190px] animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="font-extrabold text-amber-400 font-heading">
              Tháng {label}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
              Minh Music
            </span>
          </div>

          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: entry.color || entry.stroke || entry.fill }}
                  />
                  <span className="text-slate-300 text-[11px]">{entry.name}:</span>
                </div>
                <span className="font-extrabold font-mono text-white text-[11px]">
                  {entry.value} học viên
                </span>
              </div>
            ))}
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Tăng trưởng tháng:</span>
            <span className={growthRate >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {growthRate >= 0 ? `+${growthRate}%` : `${growthRate}%`}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
      {/* Header & Controls */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 flex-shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Xu Hướng Tuyển Sinh & Đăng Ký
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  totalNewInPeriod > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  +{totalNewInPeriod} HV mới
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Thống kê học viên nhập học và tăng trưởng sĩ số trung tâm
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {/* View Switch */}
            <div className="bg-slate-100 p-0.5 rounded-xl flex items-center text-[11px] font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setChartView('area')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  chartView === 'area'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                Miền (Area)
              </button>
              <button
                type="button"
                onClick={() => setChartView('bar')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  chartView === 'bar'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                Cột (Bar)
              </button>
              <button
                type="button"
                onClick={() => setChartView('subject')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  chartView === 'subject'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                Bộ Môn
              </button>
            </div>

            {/* Time range */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="text-xs font-bold py-1 px-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="6M">6 Tháng</option>
              <option value="12M">12 Tháng</option>
            </select>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-3 gap-2 pt-3 text-center">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-500 font-bold block">Tổng HV Đăng Ký</span>
            <span className="text-sm font-black text-slate-900">{totalNewInPeriod} HV</span>
          </div>
          <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-[10px] text-emerald-700 font-bold block">Tháng Này ({latestMonth.label})</span>
            <span className="text-sm font-black text-emerald-700">+{latestMonth.newStudents} HV</span>
          </div>
          <div className="p-2 rounded-xl bg-purple-50/70 border border-purple-100">
            <span className="text-[10px] text-purple-700 font-bold block">Tỷ Lệ Tăng Trưởng</span>
            <span className="text-sm font-black text-purple-700">
              {growthRate >= 0 ? `+${growthRate}%` : `${growthRate}%`} ↗
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Recharts Canvas with Empty State Overlay if 0 students */}
      <div className="h-64 w-full pt-2 relative">
        {!hasAnyData && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-[2px] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Chưa có dữ liệu học viên trong kỳ thống kê
            </p>
            <p className="text-[11px] text-slate-500 max-w-xs mt-0.5 mb-3">
              Biểu đồ sẽ tự động thể hiện xu hướng tăng trưởng khi bạn thêm học viên mới vào hệ thống.
            </p>
            {onNavigateToStudents && (
              <button
                type="button"
                onClick={onNavigateToStudents}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Thêm Học Viên Mới</span>
              </button>
            )}
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          {chartView === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="enrollmentEmerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="enrollmentPurple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
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
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                allowDecimals={false}
                domain={[0, (dataMax: number) => Math.max(5, dataMax + 1)]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="newStudents"
                name="Học viên mới"
                stroke="#059669"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#enrollmentEmerald)"
                activeDot={{ r: 6, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          ) : chartView === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                allowDecimals={false}
                domain={[0, (dataMax: number) => Math.max(5, dataMax + 1)]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="newStudents"
                name="Học viên mới"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          ) : (
            /* Subject Stacked Bar Chart */
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                allowDecimals={false}
                domain={[0, (dataMax: number) => Math.max(5, dataMax + 1)]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: 11, paddingBottom: 6 }}
              />
              <Bar dataKey="piano" name="Piano" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="guitar" name="Guitar" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
              <Bar dataKey="vocal" name="Thanh nhạc" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="other" name="Khác" stackId="a" fill="#64748b" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Footer link */}
      {onNavigateToStudents && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400">Dữ liệu cập nhật thời gian thực</span>
          <button
            type="button"
            onClick={onNavigateToStudents}
            className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Quản lý học viên</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
