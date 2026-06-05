import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Upload, 
  ChevronLeft, 
  ChevronRight, 
  Edit2, 
  Trash2, 
  Eye, 
  X,
  FileSpreadsheet,
  FileDown
} from 'lucide-react';
import { TableSkeleton } from '../components/common/Skeleton';

const Employees = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  
  // Filters and Query State
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [size] = useState(10);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: 'Male',
    dateOfBirth: '',
    address: '',
    departmentId: '',
    designationId: '',
    salary: '',
    joiningDate: '',
    employmentType: 'FULL_TIME',
    employmentStatus: 'ACTIVE',
    emergencyContact: '',
    profileImage: ''
  });

  const isAdmin = user.role === 'ROLE_ADMIN';
  const isHR = user.role === 'ROLE_HR_MANAGER';
  const canModify = isAdmin || isHR;

  useEffect(() => {
    fetchEmployees();
  }, [search, selectedDept, selectedType, selectedStatus, sortBy, sortDir, page]);

  useEffect(() => {
    fetchAuxiliaryData();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        sortBy,
        sortDir
      };
      if (search) params.search = search;
      if (selectedDept) params.departmentId = selectedDept;
      if (selectedType) params.employmentType = selectedType;
      if (selectedStatus) params.employmentStatus = selectedStatus;

      const res = await axios.get('http://localhost:8080/api/v1/employees', { params });
      setEmployees(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxiliaryData = async () => {
    try {
      const [deptsRes, desigsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/v1/departments'),
        axios.get('http://localhost:8080/api/v1/designations')
      ]);
      setDepartments(deptsRes.data);
      setDesignations(desigsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle department change in form to load designation options dynamically
  const handleFormDeptChange = async (deptId) => {
    setFormData(prev => ({ ...prev, departmentId: deptId, designationId: '' }));
    if (!deptId) return;
    try {
      const res = await axios.get(`http://localhost:8080/api/v1/designations/department/${deptId}`);
      // Filter list of designations if loaded locally or API response
      // For simplicity, we keep designations loaded globally, but we can filter:
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      employeeCode: emp.employeeCode || '',
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      email: emp.email || '',
      phoneNumber: emp.phoneNumber || '',
      gender: emp.gender || 'Male',
      dateOfBirth: emp.dateOfBirth || '',
      address: emp.address || '',
      departmentId: emp.departmentId || '',
      designationId: emp.designationId || '',
      salary: emp.salary || '',
      joiningDate: emp.joiningDate || '',
      employmentType: emp.employmentType || 'FULL_TIME',
      employmentStatus: emp.employmentStatus || 'ACTIVE',
      emergencyContact: emp.emergencyContact || '',
      profileImage: emp.profileImage || ''
    });
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingEmployee(null);
    setFormData({
      employeeCode: `EMP-00${Math.floor(Math.random() * 900) + 100}`,
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      gender: 'Male',
      dateOfBirth: '',
      address: '',
      departmentId: '',
      designationId: '',
      salary: '',
      joiningDate: new Date().toISOString().split('T')[0],
      employmentType: 'FULL_TIME',
      employmentStatus: 'ACTIVE',
      emergencyContact: '',
      profileImage: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.departmentId) delete payload.departmentId;
      if (!payload.designationId) delete payload.designationId;

      if (editingEmployee) {
        await axios.put(`http://localhost:8080/api/v1/employees/${editingEmployee.id}`, payload);
        toast.success('Employee updated successfully');
      } else {
        await axios.post('http://localhost:8080/api/v1/employees', payload);
        toast.success('Employee added successfully');
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving employee details');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/v1/employees/${id}`);
      toast.success('Employee deleted successfully');
      fetchEmployees();
    } catch (err) {
      toast.error('Error deleting employee');
    }
  };

  const handleExport = async (format) => {
    toast.info(`Generating employee list in ${format.toUpperCase()} format...`);
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/employees/export/${format}`, {
        responseType: 'blob'
      });
      
      const fileType = format === 'excel' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        : 'application/pdf';
      const fileExtension = format === 'excel' ? 'xlsx' : 'pdf';
      
      const blob = new Blob([response.data], { type: fileType });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `employees.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${format.toUpperCase()} downloaded successfully!`);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to export employee list in ${format.toUpperCase()} format.`);
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    try {
      const res = await axios.post('http://localhost:8080/api/v1/employees/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(res.data);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data || 'Failed to process CSV file');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl font-sans">
            Employee Directory
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            View, search, and manage corporate employee profiles.
          </p>
        </div>

        {/* Directory Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {canModify && (
            <>
              <button
                onClick={() => handleExport('excel')}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl glass-card text-slate-700 dark:text-slate-350 hover:bg-brand-500 hover:text-white hover:border-brand-500 border border-slate-200 dark:border-slate-800 transition-all duration-200"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Excel</span>
              </button>
              
              <button
                onClick={() => handleExport('pdf')}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl glass-card text-slate-700 dark:text-slate-350 hover:bg-rose-500 hover:text-white hover:border-rose-500 border border-slate-200 dark:border-slate-800 transition-all duration-200"
              >
                <FileDown className="w-4 h-4" />
                <span>PDF</span>
              </button>

              <button
                onClick={() => fileInputRef.current.click()}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl glass-card text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 transition-all duration-200"
              >
                <Upload className="w-4 h-4" />
                <span>Bulk Upload</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleBulkUpload} 
                accept=".csv" 
                className="hidden" 
              />
              
              <button
                onClick={handleAddClick}
                className="flex items-center gap-2 px-4.5 py-2.5 text-xs font-bold rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Add Employee</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="p-4.5 glass-card rounded-2xl flex flex-wrap items-center gap-4 shadow-sm border border-slate-200/50 dark:border-slate-800/20">
        <div className="relative flex-1 min-w-[240px]">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search by name, email, or employee code..."
            className="w-full py-2.5 pl-9 pr-4 bg-white/60 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all duration-200"
          />
        </div>

        {/* Dropdowns */}
        <select
          value={selectedDept}
          onChange={(e) => { setSelectedDept(e.target.value); setPage(0); }}
          className="py-2.5 px-3 bg-white/60 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>

        <select
          value={selectedType}
          onChange={(e) => { setSelectedType(e.target.value); setPage(0); }}
          className="py-2.5 px-3 bg-white/60 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All Employment Types</option>
          <option value="FULL_TIME">Full Time</option>
          <option value="PART_TIME">Part Time</option>
          <option value="CONTRACT">Contract</option>
          <option value="INTERN">Intern</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => { setSelectedStatus(e.target.value); setPage(0); }}
          className="py-2.5 px-3 bg-white/60 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="TERMINATED">Terminated</option>
        </select>
      </div>

      {/* Main Table Panel */}
      <div className="glass-panel border rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={6} cols={7} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-900/20 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200/55 dark:border-slate-800/35">
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Designation</th>
                  <th className="px-6 py-4">Employment</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-sm font-medium">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all duration-150">
                    <td className="px-6 py-4.5 font-bold text-slate-800 dark:text-slate-300">{emp.employeeCode}</td>
                    <td className="px-6 py-4.5">
                      <Link to={`/employees/${emp.id}`} className="hover:text-brand-500 hover:underline">
                        {emp.firstName} {emp.lastName}
                      </Link>
                    </td>
                    <td className="px-6 py-4.5 text-slate-500 dark:text-slate-400 font-normal">{emp.email}</td>
                    <td className="px-6 py-4.5 text-slate-600 dark:text-slate-400">{emp.departmentName || 'N/A'}</td>
                    <td className="px-6 py-4.5 text-slate-650 dark:text-slate-400">{emp.designationTitle || 'N/A'}</td>
                    <td className="px-6 py-4.5">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300">
                        {emp.employmentType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        emp.employmentStatus === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                          : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
                      }`}>
                        {emp.employmentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <Link 
                          to={`/employees/${emp.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </Link>
                        {canModify && (
                          <>
                            <button
                              onClick={() => handleEditClick(emp)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Edit2 className="w-4.5 h-4.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(emp.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-200/55 dark:border-slate-800/30 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Showing <strong className="font-semibold text-slate-700 dark:text-slate-350">{employees.length}</strong> of{' '}
            <strong className="font-semibold text-slate-700 dark:text-slate-350">{totalElements}</strong> employees
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(prev => Math.max(0, prev - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg border text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-3 text-slate-600 dark:text-slate-300">
              Page {page + 1} of {totalPages || 1}
            </span>
            <button
              onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg border text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6.5 max-h-[90vh] overflow-y-auto border dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-150 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingEmployee ? 'Edit Employee Details' : 'Add New Employee'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Employee ID Code</label>
                  <input
                    type="text"
                    required
                    value={formData.employeeCode}
                    onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50/50 dark:bg-slate-800/40 border dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50/50 dark:bg-slate-800/40 border dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50/50 dark:bg-slate-800/40 border dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50/50 dark:bg-slate-800/40 border dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50/50 dark:bg-slate-800/40 border dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50/50 dark:bg-slate-800/40 border dark:border-slate-800 rounded-lg text-sm text-slate-750 dark:text-slate-250"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => handleFormDeptChange(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50/50 dark:bg-slate-800/40 border dark:border-slate-800 rounded-lg text-sm text-slate-750 dark:text-slate-250"
                  >
                    <option value="">Unassigned</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Designation</label>
                  <select
                    value={formData.designationId}
                    onChange={(e) => setFormData({ ...formData, designationId: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50/50 dark:bg-slate-800/40 border dark:border-slate-800 rounded-lg text-sm text-slate-750 dark:text-slate-250"
                  >
                    <option value="">Unassigned</option>
                    {designations
                      .filter(des => !formData.departmentId || des.departmentId == formData.departmentId)
                      .map(d => <option key={d.id} value={d.id}>{d.title}</option>)
                    }
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Salary (USD)</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50/50 dark:bg-slate-800/40 border dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Joining Date</label>
                  <input
                    type="date"
                    required
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50/50 dark:bg-slate-800/40 border dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Employment Type</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50/50 dark:bg-slate-800/40 border dark:border-slate-800 rounded-lg text-sm text-slate-750 dark:text-slate-250"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERN">Intern</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Status</label>
                  <select
                    value={formData.employmentStatus}
                    onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50/50 dark:bg-slate-800/40 border dark:border-slate-800 rounded-lg text-sm text-slate-750 dark:text-slate-250"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="TERMINATED">Terminated</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Birth Date</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-50/50 dark:bg-slate-800/40 border dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  className="w-full py-2 px-3 bg-slate-50/50 dark:bg-slate-800/40 border dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Emergency Contact Details</label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder="Name (Relationship) Phone"
                    className="w-full py-2 px-3 bg-slate-50/50 dark:bg-slate-800/40 border dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Profile Image URL</label>
                  <input
                    type="text"
                    value={formData.profileImage}
                    onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full py-2 px-3 bg-slate-50/50 dark:bg-slate-800/40 border dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-150 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
    </div>
  );
};

export default Employees;
