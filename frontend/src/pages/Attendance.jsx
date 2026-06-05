import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Clock, Calendar, CheckCircle2, AlertTriangle, AlertCircle, XCircle } from 'lucide-react';
import { TableSkeleton } from '../components/common/Skeleton';

const Attendance = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user.role === 'ROLE_ADMIN';
  const isHR = user.role === 'ROLE_HR_MANAGER';

  // If user is regular Employee, redirect them to their own profile attendance tab
  if (!isAdmin && !isHR) {
    return <Navigate to={`/employees/${user.employeeId}`} replace />;
  }

  useEffect(() => {
    fetchDailyAttendance();
  }, [selectedDate]);

  const fetchDailyAttendance = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/v1/attendance/daily?date=${selectedDate}`);
      setAttendance(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load daily attendance roster');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl font-sans">
            Attendance Monitoring
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track clock-in times and status logs for all company employees.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-900/50 p-2 border dark:border-slate-800 rounded-xl">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Roster Panel */}
      <div className="glass-panel border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/55 dark:border-slate-800/30 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans uppercase tracking-wider">Attendance Roster</h3>
          <span className="text-[10px] font-bold uppercase bg-brand-50 dark:bg-brand-950/40 text-brand-500 px-3 py-1 rounded-full border border-brand-100/50 dark:border-brand-900/10">
            {attendance.length} Records Logged
          </span>
        </div>

        {loading ? (
          <div className="p-6"><TableSkeleton rows={5} cols={5} /></div>
        ) : attendance.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <AlertCircle className="w-8 h-8 text-slate-450 mx-auto mb-2" />
            <p>No attendance records logged for {selectedDate}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-900/20 text-xs font-bold uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Employee Name</th>
                  <th className="px-6 py-4">Clock In</th>
                  <th className="px-6 py-4">Clock Out</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-sm font-medium">
                {attendance.map((att) => (
                  <tr key={att.id}>
                    <td className="px-6 py-4.5 text-slate-800 dark:text-slate-350">{att.employeeCode}</td>
                    <td className="px-6 py-4.5 text-slate-700 dark:text-slate-200">{att.employeeName}</td>
                    <td className="px-6 py-4.5 text-slate-500 dark:text-slate-400 font-normal">
                      {att.clockIn ? new Date(att.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4.5 text-slate-500 dark:text-slate-400 font-normal">
                      {att.clockOut ? new Date(att.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        att.status === 'PRESENT' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                          : att.status === 'LATE'
                          ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
                          : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
                      }`}>
                        {att.status === 'PRESENT' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {att.status === 'LATE' && <AlertTriangle className="w-3.5 h-3.5" />}
                        {att.status === 'ABSENT' && <XCircle className="w-3.5 h-3.5" />}
                        <span>{att.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
