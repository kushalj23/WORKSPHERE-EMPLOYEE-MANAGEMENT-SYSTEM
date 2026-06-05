import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  HeartHandshake, 
  ShieldAlert, 
  Clock, 
  CalendarDays,
  FileText,
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Skeleton } from '../components/common/Skeleton';

const EmployeeDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Attendance History
  const [attendance, setAttendance] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  
  // Leave Requests & Balance
  const [leaves, setLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  
  // Leave Form State
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'CASUAL',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [submittingLeave, setSubmittingLeave] = useState(false);

  const empId = id === 'profile' ? user.employeeId : id;
  const isOwnProfile = user.employeeId && user.employeeId.toString() === empId?.toString();
  const canModify = user.role === 'ROLE_ADMIN' || user.role === 'ROLE_HR_MANAGER';

  useEffect(() => {
    if (empId) {
      fetchEmployeeDetails();
    }
  }, [empId]);

  useEffect(() => {
    if (empId && activeTab === 'attendance') {
      fetchAttendanceHistory();
    } else if (empId && activeTab === 'leaves') {
      fetchLeaveHistory();
    }
  }, [empId, activeTab]);

  const fetchEmployeeDetails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/v1/employees/${empId}`);
      setEmployee(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load employee details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceHistory = async () => {
    setLoadingAttendance(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/v1/attendance/history/${empId}`);
      setAttendance(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const fetchLeaveHistory = async () => {
    setLoadingLeaves(true);
    try {
      const [historyRes, balanceRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/v1/leaves/employee/${empId}`),
        axios.get(`http://localhost:8080/api/v1/leaves/balance/${empId}`)
      ]);
      setLeaves(historyRes.data);
      setLeaveBalance(balanceRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLeaves(false);
    }
  };

  const handleClockIn = async () => {
    try {
      await axios.post('http://localhost:8080/api/v1/attendance/clock-in');
      toast.success('Clocked in successfully!');
      if (activeTab === 'attendance') fetchAttendanceHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to clock in');
    }
  };

  const handleClockOut = async () => {
    try {
      await axios.post('http://localhost:8080/api/v1/attendance/clock-out');
      toast.success('Clocked out successfully!');
      if (activeTab === 'attendance') fetchAttendanceHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to clock out');
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setSubmittingLeave(true);
    try {
      const payload = {
        ...leaveForm,
        employeeId: empId
      };
      await axios.post('http://localhost:8080/api/v1/leaves/apply', payload);
      toast.success('Leave request submitted successfully!');
      setIsLeaveModalOpen(false);
      setLeaveForm({ leaveType: 'CASUAL', startDate: '', endDate: '', reason: '' });
      fetchLeaveHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setSubmittingLeave(false);
    }
  };

  const handleLeaveDecision = async (leaveId, decision) => {
    const actionName = decision === 'APPROVED' ? 'approval' : 'rejection';
    const comments = window.prompt(`Enter comments for this ${actionName}:`);
    if (comments === null) return; // cancelled

    const endpoint = decision === 'APPROVED' ? 'approve' : 'reject';
    try {
      await axios.post(`http://localhost:8080/api/v1/leaves/${leaveId}/${endpoint}?comments=${encodeURIComponent(comments)}`);
      toast.success(`Leave request ${decision.toLowerCase()}ed successfully`);
      fetchLeaveHistory();
    } catch (err) {
      toast.error('Failed to process leave decision');
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-60 w-full rounded-2xl" />
      </div>
    );
  }

  if (!employee) return null;

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Employee ID Header Widget */}
      <div className="p-6 glass-panel rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <img 
            src={employee.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.firstName + ' ' + employee.lastName)}&background=0e8ceb&color=fff&size=150`} 
            alt={`${employee.firstName} ${employee.lastName}`}
            className="w-24 h-24 rounded-2xl object-cover shadow-md border-2 border-brand-500/20"
          />
          <div className="text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight font-sans">
                {employee.firstName} {employee.lastName}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {employee.employeeCode}
              </span>
            </div>
            <p className="text-sm font-semibold text-brand-500 dark:text-brand-400">
              {employee.designationTitle || 'Designation Unassigned'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {employee.departmentName || 'Department Unassigned'}
            </p>
          </div>
        </div>

        {/* Self Service Clock-in Widget */}
        {isOwnProfile && (
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50/50 dark:bg-slate-800/20 p-4.5 rounded-2xl border border-slate-100 dark:border-slate-800/40">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block mb-1">Self Service</span>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-350">Clock in your hours for today.</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleClockIn}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10 transition-colors"
              >
                <Clock className="w-4 h-4" />
                Clock In
              </button>
              <button 
                onClick={handleClockOut}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/10 transition-colors"
              >
                <Clock className="w-4 h-4" />
                Clock Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200/50 dark:border-slate-800/50 flex gap-4">
        {[
          { id: 'profile', name: 'Profile Details', icon: User },
          { id: 'attendance', name: 'Attendance Logs', icon: Clock },
          { id: 'leaves', name: 'Leave Requests', icon: CalendarDays }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all duration-200 ${
              activeTab === tab.id 
                ? 'border-brand-500 text-brand-500' 
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Info Card */}
            <div className="p-6 glass-card rounded-2xl border space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Contact & Personal Details</h3>
              <div className="space-y-3.5">
                <div className="flex items-center gap-3 text-xs">
                  <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-400 font-medium">Email:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">{employee.email}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-400 font-medium">Phone:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">{employee.phoneNumber || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-400 font-medium">Gender:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">{employee.gender || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-400 font-medium">Date of Birth:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">{employee.dateOfBirth || 'N/A'}</span>
                </div>
                <div className="flex items-start gap-3 text-xs">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-400 font-medium">Address:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">{employee.address || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Employment Info Card */}
            <div className="p-6 glass-card rounded-2xl border space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Employment Details</h3>
              <div className="space-y-3.5">
                <div className="flex items-center gap-3 text-xs">
                  <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-400 font-medium">Joining Date:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">{employee.joiningDate}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <DollarSign className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-400 font-medium">Salary (Monthly):</span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">
                    {employee.salary ? `$${Number(employee.salary).toLocaleString()}` : 'Confidential'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-400 font-medium">Employment Type:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">{employee.employmentType.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <HeartHandshake className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-400 font-medium">Emergency Contact:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">{employee.emergencyContact || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <ShieldAlert className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-400 font-medium">Status:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">{employee.employmentStatus}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="glass-panel border rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-white font-sans">Attendance History</h3>
            {loadingAttendance ? (
              <Skeleton className="h-40 w-full" />
            ) : attendance.length === 0 ? (
              <p className="text-center text-slate-400 text-xs py-8">No attendance records logged.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/70 dark:bg-slate-900/30 text-xs font-bold uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Clock In</th>
                      <th className="px-4 py-3">Clock Out</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs">
                    {attendance.map(att => (
                      <tr key={att.id}>
                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-300">{att.date}</td>
                        <td className="px-4 py-3 font-medium text-slate-650 dark:text-slate-400">
                          {att.clockIn ? new Date(att.clockIn).toLocaleTimeString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-650 dark:text-slate-400">
                          {att.clockOut ? new Date(att.clockOut).toLocaleTimeString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            att.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' :
                            att.status === 'LATE' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400' :
                            'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                          }`}>
                            {att.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaves' && (
          <div className="space-y-6">
            {/* Leave Balances Grid */}
            {leaveBalance && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { title: 'Annual Leave', remaining: leaveBalance.annualRemaining, limit: leaveBalance.annualLimit, color: 'border-blue-500/10' },
                  { title: 'Casual Leave', remaining: leaveBalance.casualRemaining, limit: leaveBalance.casualLimit, color: 'border-violet-500/10' },
                  { title: 'Sick Leave', remaining: leaveBalance.sickRemaining, limit: leaveBalance.sickLimit, color: 'border-pink-500/10' },
                  { title: 'Maternity', remaining: leaveBalance.maternityRemaining, limit: leaveBalance.maternityLimit, color: 'border-amber-500/10' }
                ].map((b, i) => (
                  <div key={i} className={`p-4 glass-card border rounded-2xl text-center space-y-1 ${b.color}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{b.title}</span>
                    <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white font-sans">{b.remaining}</h4>
                    <p className="text-[9px] font-medium text-slate-400">Remaining / {b.limit} days</p>
                  </div>
                ))}
              </div>
            )}

            {/* Leave Requests Listing */}
            <div className="glass-panel border rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800 dark:text-white font-sans">Leave Requests</h3>
                {isOwnProfile && (
                  <button 
                    onClick={() => setIsLeaveModalOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/10 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Apply Leave
                  </button>
                )}
              </div>

              {loadingLeaves ? (
                <Skeleton className="h-40 w-full" />
              ) : leaves.length === 0 ? (
                <p className="text-center text-slate-400 text-xs py-8">No leave requests filed.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/70 dark:bg-slate-900/30 text-xs font-bold uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Dates</th>
                        <th className="px-4 py-3">Reason</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Approver Notes</th>
                        {canModify && <th className="px-4 py-3 text-right">Action</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs font-medium">
                      {leaves.map(lr => (
                        <tr key={lr.id}>
                          <td className="px-4 py-3 text-slate-800 dark:text-slate-350">{lr.leaveType}</td>
                          <td className="px-4 py-3 text-slate-650 dark:text-slate-450">{lr.startDate} to {lr.endDate}</td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-500 font-normal">{lr.reason || 'N/A'}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              lr.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' :
                              lr.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' :
                              'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                            }`}>
                              {lr.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-500 font-normal">
                            {lr.approvedByName ? `${lr.approvedByName}: ` : ''} {lr.comments || 'N/A'}
                          </td>
                          {canModify && (
                            <td className="px-4 py-3 text-right">
                              {lr.status === 'PENDING' ? (
                                <div className="flex justify-end gap-1.5">
                                  <button 
                                    onClick={() => handleLeaveDecision(lr.id, 'APPROVED')}
                                    className="p-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white"
                                    title="Approve"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleLeaveDecision(lr.id, 'REJECTED')}
                                    className="p-1 rounded bg-rose-500 hover:bg-rose-600 text-white"
                                    title="Reject"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400">Processed</span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Leave Application Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border dark:border-slate-800 animate-in fade-in zoom-in-95 duration-205">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Apply for Leave</h2>
              <button 
                onClick={() => setIsLeaveModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-1.5">Leave Type</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-50/50 dark:bg-slate-800/40 border dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-200"
                >
                  <option value="CASUAL">Casual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="ANNUAL">Annual Leave</option>
                  <option value="MATERNITY">Maternity Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50/50 dark:bg-slate-800/40 border dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-1.5">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50/50 dark:bg-slate-800/40 border dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-1.5">Reason</label>
                <textarea
                  required
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  rows={3}
                  className="w-full py-2 px-3 bg-slate-50/50 dark:bg-slate-800/40 border dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400"
                  placeholder="State the reason for your leave request..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLeave}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submittingLeave && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Apply</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetails;
