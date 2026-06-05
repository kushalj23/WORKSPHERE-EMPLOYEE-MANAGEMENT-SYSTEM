import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CalendarX, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { TableSkeleton } from '../components/common/Skeleton';

const LeaveRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user.role === 'ROLE_ADMIN';
  const isHR = user.role === 'ROLE_HR_MANAGER';

  // If user is regular Employee, redirect them to their own profile's leave request tab
  if (!isAdmin && !isHR) {
    return <Navigate to={`/employees/${user.employeeId}`} replace />;
  }

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/api/v1/leaves');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id, decision) => {
    const actionName = decision === 'APPROVED' ? 'approval' : 'rejection';
    const comments = window.prompt(`Enter comments for this ${actionName}:`);
    if (comments === null) return;

    const endpoint = decision === 'APPROVED' ? 'approve' : 'reject';
    try {
      await axios.post(`http://localhost:8080/api/v1/leaves/${id}/${endpoint}?comments=${encodeURIComponent(comments)}`);
      toast.success(`Leave request ${decision.toLowerCase()}ed successfully`);
      fetchLeaveRequests();
    } catch (err) {
      toast.error('Failed to process leave request');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl font-sans">
          Leave Applications
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Review, approve, or reject employee leave applications.
        </p>
      </div>

      <div className="glass-panel border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/55 dark:border-slate-800/30 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans uppercase tracking-wider">Leave Applications</h3>
          <span className="text-[10px] font-bold uppercase bg-brand-50 dark:bg-brand-950/40 text-brand-500 px-3 py-1 rounded-full border border-brand-100/50 dark:border-brand-900/10">
            {requests.filter(r => r.status === 'PENDING').length} Pending Requests
          </span>
        </div>

        {loading ? (
          <div className="p-6"><TableSkeleton rows={5} cols={6} /></div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <AlertCircle className="w-8 h-8 text-slate-450 mx-auto mb-2" />
            <p>No leave requests registered in the system.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-900/20 text-xs font-bold uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Leave Type</th>
                  <th className="px-6 py-4">Date Range</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-sm font-medium">
                {requests.map((lr) => (
                  <tr key={lr.id}>
                    <td className="px-6 py-4.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{lr.employeeName}</div>
                      <div className="text-[10px] font-medium text-slate-400">{lr.employeeCode}</div>
                    </td>
                    <td className="px-6 py-4.5 text-slate-700 dark:text-slate-350">{lr.leaveType}</td>
                    <td className="px-6 py-4.5 text-slate-500 dark:text-slate-400 font-normal">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{lr.startDate} to {lr.endDate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 text-slate-550 dark:text-slate-450 font-normal truncate max-w-xs">{lr.reason || 'N/A'}</td>
                    <td className="px-6 py-4.5">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        lr.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' :
                        lr.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30' :
                        'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
                      }`}>
                        {lr.status}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      {lr.status === 'PENDING' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleDecision(lr.id, 'APPROVED')}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleDecision(lr.id, 'REJECTED')}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/10 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-semibold">Processed</span>
                      )}
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

export default LeaveRequests;
