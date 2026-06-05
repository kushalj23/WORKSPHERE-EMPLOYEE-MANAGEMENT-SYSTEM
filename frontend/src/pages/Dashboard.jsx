import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  UserCheck, 
  Landmark, 
  CalendarX, 
  CheckSquare, 
  UserPlus,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar
} from 'recharts';
import { CardSkeleton } from '../components/common/Skeleton';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, chartsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/v1/analytics/stats'),
        axios.get('http://localhost:8080/api/v1/analytics/charts')
      ]);
      setStats(statsRes.data);
      setCharts(chartsRes.data);
      
      // Load recent activities (audit logs) if user is Admin, else mock
      if (user.role === 'ROLE_ADMIN') {
        const logsRes = await axios.get('http://localhost:8080/api/v1/users/logs');
        setActivities(logsRes.data.slice(0, 5));
      } else {
        setActivities([
          { action: 'ATTENDANCE_CLOCK_IN', details: 'Clocked in successfully today.', timestamp: new Date().toISOString() },
          { action: 'LEAVE_APPLY', details: 'Applied for casual leave on June 10.', timestamp: new Date(Date.now() - 86400000).toISOString() },
          { action: 'USER_LOGIN', details: 'Session started from IP 192.168.1.10.', timestamp: new Date(Date.now() - 172800000).toISOString() }
        ]);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      toast.error('Could not retrieve dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Employees', value: stats?.totalEmployees, change: '+4% from last month', icon: Users, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
    { title: 'Active Employees', value: stats?.activeEmployees, change: '100% status coverage', icon: UserCheck, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
    { title: 'Departments', value: stats?.departmentsCount, change: '4 operational divisions', icon: Landmark, color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/20' },
    { title: 'Leave Requests', value: stats?.pendingLeaves, change: 'Pending approval decisions', icon: CalendarX, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' },
    { title: 'Attendance Today', value: `${stats?.attendancePercentage}%`, change: 'Daily present percentage', icon: CheckSquare, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
    { title: 'New Hires', value: stats?.newEmployeesThisMonth, change: 'Joined this calendar month', icon: UserPlus, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' }
  ];

  // Recharts color constants
  const COLORS = ['#0ea5e9', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl font-sans">
            WorkSphere Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time analytics and employee monitoring panel.
          </p>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="p-6 glass-card rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{card.title}</span>
              <h3 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white font-sans">{card.value}</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>{card.change}</span>
              </p>
            </div>
            <div className={`p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Trend Area Chart */}
        <div className="lg:col-span-2 p-6 glass-card rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white font-sans">Employee Headcount Growth</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Hiring headcount development trend over past 6 months.</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.employeeGrowth || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0e8ceb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0e8ceb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="employees" stroke="#0e8ceb" strokeWidth={2.5} fillOpacity={1} fill="url(#growthGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Allocation Pie Chart */}
        <div className="p-6 glass-card rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white font-sans">Department Distribution</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Employee headcount allocation across departments.</p>
          </div>
          <div className="h-80 flex items-center justify-center">
            {charts?.departmentDistribution && charts.departmentDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.departmentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="name"
                  >
                    {charts.departmentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} formatter={(v) => <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-400">No department data.</span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Attendance Trends & Audit Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Bar Chart */}
        <div className="lg:col-span-2 p-6 glass-card rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white font-sans">Attendance Analysis</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Daily headcounts of Present vs Absent employees over last 7 days.</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.attendanceTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">{v}</span>} />
                <Bar dataKey="present" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Present" />
                <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities Timeline */}
        <div className="p-6 glass-card rounded-2xl shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white font-sans">Recent Log Activity</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Timeline of recent platform operations and events.</p>
          </div>

          <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3.5 pl-6 space-y-6">
            {activities.map((act, i) => (
              <div key={i} className="relative">
                {/* Timeline Dot */}
                <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-brand-500 ring-4 ring-white dark:ring-slate-900" />
                
                {/* Activity Log Details */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      {act.action.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
                    {act.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
