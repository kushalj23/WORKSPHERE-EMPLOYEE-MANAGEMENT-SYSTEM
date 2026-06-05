import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ShieldCheck, UserCheck, UserX, ToggleLeft, ToggleRight, ListCollapse, Key, Eye } from 'lucide-react';
import { TableSkeleton } from '../components/common/Skeleton';

const AdminPanel = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  const isAdmin = user?.role === 'ROLE_ADMIN';

  // Protect route
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, logsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/v1/users'),
        axios.get('http://localhost:8080/api/v1/users/logs')
      ]);
      setUsers(usersRes.data);
      setLogs(logsRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load admin management data');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`http://localhost:8080/api/v1/users/${userId}/role?role=${newRole}`);
      toast.success('User role updated successfully');
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to update user role');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await axios.put(`http://localhost:8080/api/v1/users/${userId}/toggle`);
      toast.success('User status toggled successfully');
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl font-sans">
          Administrator Control Panel
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage system user accounts, authorize access roles, and audit system activities.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200/55 dark:border-slate-800/50 flex gap-4">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all duration-200 ${
            activeTab === 'users' 
              ? 'border-brand-500 text-brand-500' 
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          User Management
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all duration-200 ${
            activeTab === 'logs' 
              ? 'border-brand-500 text-brand-500' 
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <ListCollapse className="w-4 h-4" />
          Audit Logs
        </button>
      </div>

      {/* Contents */}
      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : activeTab === 'users' ? (
        <div className="glass-panel border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-900/20 text-xs font-bold uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4">User Account</th>
                  <th className="px-6 py-4">Associated Employee</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-sm font-medium">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4.5 text-slate-800 dark:text-slate-200">{u.email}</td>
                    <td className="px-6 py-4.5 text-slate-500 dark:text-slate-450 font-normal">
                      {u.employee ? `${u.employee.firstName} ${u.employee.lastName} (${u.employee.employeeCode})` : 'System Admin'}
                    </td>
                    <td className="px-6 py-4.5">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="py-1 px-2.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-350 focus:outline-none"
                      >
                        <option value="ROLE_EMPLOYEE">Employee</option>
                        <option value="ROLE_HR_MANAGER">HR Manager</option>
                        <option value="ROLE_ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        u.isActive 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30'
                          : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/30'
                      }`}>
                        {u.isActive ? 'Active' : 'Locked'}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          u.isActive 
                            ? 'text-rose-500 border-rose-250/50 hover:bg-rose-50 dark:border-rose-900/30 dark:hover:bg-rose-950/20' 
                            : 'text-emerald-500 border-emerald-250/50 hover:bg-emerald-50 dark:border-emerald-900/30 dark:hover:bg-emerald-950/20'
                        }`}
                        title={u.isActive ? "Deactivate Account" : "Activate Account"}
                      >
                        {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-panel border rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-900/30 text-xs font-bold uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs font-medium">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                    <td className="px-4 py-3 text-slate-400 font-normal">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-350">
                      {log.userEmail || 'System'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/20 px-2 py-0.5 rounded border border-brand-100 dark:border-brand-900/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-650 dark:text-slate-350 font-normal">{log.details}</td>
                    <td className="px-4 py-3 text-slate-500 font-normal">{log.ipAddress || 'unknown'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
