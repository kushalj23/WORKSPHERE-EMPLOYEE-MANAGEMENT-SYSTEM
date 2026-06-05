import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2, X, Landmark, User, ShieldAlert, Award } from 'lucide-react';
import { TableSkeleton } from '../components/common/Skeleton';

const Departments = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Department Modal State
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({ name: '', description: '', managerId: '' });

  // Designation Modal State
  const [isDesigModalOpen, setIsDesigModalOpen] = useState(false);
  const [selectedDeptForDesig, setSelectedDeptForDesig] = useState(null);
  const [desigForm, setDesigForm] = useState({ title: '' });

  const isAdmin = user.role === 'ROLE_ADMIN';
  const isHR = user.role === 'ROLE_HR_MANAGER';
  const canModify = isAdmin || isHR;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, empRes, desigRes] = await Promise.all([
        axios.get('http://localhost:8080/api/v1/departments'),
        axios.get('http://localhost:8080/api/v1/employees?size=1000'), // load all for manager dropdown
        axios.get('http://localhost:8080/api/v1/designations')
      ]);
      setDepartments(deptRes.data);
      setEmployees(empRes.data.content || []);
      setDesignations(desigRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load department data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDept = (dept) => {
    setEditingDept(dept);
    setDeptForm({
      name: dept.name,
      description: dept.description || '',
      managerId: dept.managerId || ''
    });
    setIsDeptModalOpen(true);
  };

  const handleAddDept = () => {
    setEditingDept(null);
    setDeptForm({ name: '', description: '', managerId: '' });
    setIsDeptModalOpen(true);
  };

  const handleSaveDept = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...deptForm };
      if (!payload.managerId) delete payload.managerId;

      if (editingDept) {
        await axios.put(`http://localhost:8080/api/v1/departments/${editingDept.id}`, payload);
        toast.success('Department updated successfully!');
      } else {
        await axios.post('http://localhost:8080/api/v1/departments', payload);
        toast.success('Department created successfully!');
      }
      setIsDeptModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving department');
    }
  };

  const handleDeleteDept = async (id) => {
    if (!window.confirm('Delete this department? This will delete all designation constraints.')) return;
    try {
      await axios.delete(`http://localhost:8080/api/v1/departments/${id}`);
      toast.success('Department deleted successfully');
      fetchData();
    } catch (err) {
      toast.error('Error deleting department');
    }
  };

  const handleAddDesigClick = (dept) => {
    setSelectedDeptForDesig(dept);
    setDesigForm({ title: '' });
    setIsDesigModalOpen(true);
  };

  const handleSaveDesig = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/v1/designations', {
        title: desigForm.title,
        departmentId: selectedDeptForDesig.id
      });
      toast.success('Designation created successfully!');
      setIsDesigModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating designation');
    }
  };

  const handleDeleteDesig = async (desigId) => {
    if (!window.confirm('Delete this designation?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/v1/designations/${desigId}`);
      toast.success('Designation deleted successfully');
      fetchData();
    } catch (err) {
      toast.error('Error deleting designation');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl font-sans">
            Departments & Roles
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Configure divisions and designate job roles.
          </p>
        </div>

        {canModify && (
          <button
            onClick={handleAddDept}
            className="flex items-center gap-2 px-4.5 py-2.5 text-xs font-bold rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Create Department</span>
          </button>
        )}
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {departments.map((dept) => (
            <div key={dept.id} className="p-6 glass-card border rounded-2xl shadow-sm space-y-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-brand-50 dark:bg-brand-950/20 text-brand-500 rounded-2xl">
                      <Landmark className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-800 dark:text-white font-sans">{dept.name}</h3>
                      <span className="text-[10px] font-bold text-slate-400">{dept.employeeCount || 0} Employees</span>
                    </div>
                  </div>
                  {canModify && (
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleEditDept(dept)}
                        className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteDept(dept.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                  {dept.description || 'No department description provided.'}
                </p>

                {/* Manager */}
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-650 dark:text-slate-450">
                  <User className="w-4 h-4 text-slate-450" />
                  <span>Manager:</span>
                  <span className="text-slate-800 dark:text-slate-350">{dept.managerName || 'None assigned'}</span>
                </div>

                {/* Designations list under this dept */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/40">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>Active Designations</span>
                    {canModify && (
                      <button 
                        onClick={() => handleAddDesigClick(dept)}
                        className="text-[10px] font-extrabold text-brand-500 hover:underline flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {designations
                      .filter(des => des.departmentId === dept.id)
                      .map(des => (
                        <span 
                          key={des.id} 
                          className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-350"
                        >
                          <Award className="w-3 h-3 text-slate-400" />
                          <span>{des.title}</span>
                          {canModify && (
                            <button 
                              onClick={() => handleDeleteDesig(des.id)}
                              className="text-slate-400 hover:text-rose-500 ml-1 font-bold"
                            >
                              &times;
                            </button>
                          )}
                        </span>
                      ))}
                    {designations.filter(des => des.departmentId === dept.id).length === 0 && (
                      <span className="text-[10px] text-slate-400 font-medium italic">No designations defined.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Department Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-150 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                {editingDept ? 'Edit Department' : 'Create Department'}
              </h2>
              <button 
                onClick={() => setIsDeptModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDept} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-455 mb-1.5">Department Name</label>
                <input
                  type="text"
                  required
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="e.g. Sales & Marketing"
                  className="w-full py-2 px-3 bg-slate-50/50 dark:bg-slate-800/40 border dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-455 mb-1.5">Description</label>
                <textarea
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  rows={3}
                  placeholder="Write a brief overview of division objectives..."
                  className="w-full py-2 px-3 bg-slate-50/50 dark:bg-slate-800/40 border dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-455 mb-1.5">Assign Head / Manager</label>
                <select
                  value={deptForm.managerId}
                  onChange={(e) => setDeptForm({ ...deptForm, managerId: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-50/50 dark:bg-slate-800/40 border dark:border-slate-800 rounded-lg text-xs text-slate-750 dark:text-slate-250"
                >
                  <option value="">No Manager Assigned</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeCode})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-150 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-500 text-white hover:bg-brand-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Designation Modal */}
      {isDesigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-150 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                Add Designation to {selectedDeptForDesig?.name}
              </h2>
              <button 
                onClick={() => setIsDesigModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDesig} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-455 mb-1.5">Designation Title</label>
                <input
                  type="text"
                  required
                  value={desigForm.title}
                  onChange={(e) => setDesigForm({ ...desigForm, title: e.target.value })}
                  placeholder="e.g. Lead Analyst"
                  className="w-full py-2 px-3 bg-slate-50/50 dark:bg-slate-800/40 border dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-150 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDesigModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-500 text-white hover:bg-brand-600"
                >
                  Save Title
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
