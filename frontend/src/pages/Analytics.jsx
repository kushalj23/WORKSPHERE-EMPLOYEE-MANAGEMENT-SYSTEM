import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { TableSkeleton } from '../components/common/Skeleton';
import { BarChart3, TrendingUp, Users, PieChart as PieIcon, Award } from 'lucide-react';

const Analytics = () => {
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCharts();
  }, []);

  const fetchCharts = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/v1/analytics/charts');
      setCharts(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load analytics details');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0ea5e9', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        <TableSkeleton rows={5} cols={5} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl font-sans">
          Advanced HR Analytics
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Visual metrics representing headcount growth, department allocations, and leave stats.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Growth Card */}
        <div className="p-6 glass-panel border rounded-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-50 dark:bg-sky-950/20 text-sky-500 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans">Headcount Growth Chart</h3>
              <span className="text-[10px] text-slate-400">6-Month historical hiring trends</span>
            </div>
          </div>
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.employeeGrowth || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthGradColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                <Area type="monotone" dataKey="employees" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#growthGradColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dept Allocation Card */}
        <div className="p-6 glass-panel border rounded-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-xl">
              <PieIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans">Department Division Allocation</h3>
              <span className="text-[10px] text-slate-400">Headcount shares per operational unit</span>
            </div>
          </div>
          <div className="h-72 flex items-center justify-center pt-2">
            {charts?.departmentDistribution && charts.departmentDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.departmentDistribution}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="name"
                  >
                    {charts.departmentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} formatter={(v) => <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-400">No division data.</span>
            )}
          </div>
        </div>

        {/* Attendance Trends */}
        <div className="p-6 glass-panel border rounded-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans">Daily Attendance Analysis</h3>
              <span className="text-[10px] text-slate-400">Rosters of Present vs Absent employees over last 7 days</span>
            </div>
          </div>
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.attendanceTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-[10px] font-semibold text-slate-550 dark:text-slate-400">{v}</span>} />
                <Bar dataKey="present" fill="#6366f1" radius={[4, 4, 0, 0]} name="Present" />
                <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leave Type Allocation */}
        <div className="p-6 glass-panel border rounded-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pink-50 dark:bg-pink-950/20 text-pink-500 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans">Approved Leaves by Type</h3>
              <span className="text-[10px] text-slate-400">Breakdown of leaf types taken by active employees</span>
            </div>
          </div>
          <div className="h-72 flex items-center justify-center pt-2">
            {charts?.leaveDistribution && charts.leaveDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.leaveDistribution}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="type"
                  >
                    {charts.leaveDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} formatter={(v) => <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-400">No leave history.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
