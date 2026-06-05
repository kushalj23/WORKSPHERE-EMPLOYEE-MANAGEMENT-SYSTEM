import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Landmark, 
  CalendarDays, 
  FileSpreadsheet, 
  BarChart3, 
  User, 
  Settings, 
  ShieldCheck,
  Briefcase
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();
  
  if (!user) return null;

  const isAdmin = user.role === 'ROLE_ADMIN';
  const isHR = user.role === 'ROLE_HR_MANAGER';

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['ROLE_ADMIN', 'ROLE_HR_MANAGER', 'ROLE_EMPLOYEE'] },
    { name: 'Employees', path: '/employees', icon: Users, roles: ['ROLE_ADMIN', 'ROLE_HR_MANAGER', 'ROLE_EMPLOYEE'] },
    { name: 'Departments', path: '/departments', icon: Landmark, roles: ['ROLE_ADMIN', 'ROLE_HR_MANAGER', 'ROLE_EMPLOYEE'] },
    { name: 'Attendance', path: '/attendance', icon: CalendarDays, roles: ['ROLE_ADMIN', 'ROLE_HR_MANAGER', 'ROLE_EMPLOYEE'] },
    { name: 'Leave Requests', path: '/leaves', icon: FileSpreadsheet, roles: ['ROLE_ADMIN', 'ROLE_HR_MANAGER', 'ROLE_EMPLOYEE'] },
    { name: 'Analytics', path: '/analytics', icon: BarChart3, roles: ['ROLE_ADMIN', 'ROLE_HR_MANAGER', 'ROLE_EMPLOYEE'] },
    { name: 'My Profile', path: `/employees/${user.employeeId || 'profile'}`, icon: User, roles: ['ROLE_ADMIN', 'ROLE_HR_MANAGER', 'ROLE_EMPLOYEE'], hideIfNoEmployee: true },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['ROLE_ADMIN', 'ROLE_HR_MANAGER', 'ROLE_EMPLOYEE'] },
    { name: 'Admin Panel', path: '/admin', icon: ShieldCheck, roles: ['ROLE_ADMIN'] },
  ];

  const filteredItems = menuItems.filter(item => {
    if (item.hideIfNoEmployee && !user.employeeId) return false;
    return item.roles.includes(user.role);
  });

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 glass-panel border-r transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200/55 dark:border-slate-800/55">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-lg shadow-brand-500/20">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight font-sans text-brand-600 dark:text-brand-400 bg-gradient-to-r from-brand-500 to-brand-300 bg-clip-text text-transparent">WorkSphere</h1>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Enterprise HRMS</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {filteredItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 dark:shadow-brand-500/10' 
                    : 'text-slate-600 hover:text-brand-500 hover:bg-brand-50/50 dark:text-slate-400 dark:hover:text-brand-400 dark:hover:bg-slate-800/40'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-500 dark:group-hover:text-brand-400'
                  }`} />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200/55 dark:border-slate-800/55 text-center">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Logged in as:</span>
          <div className="mt-1 font-semibold text-slate-700 dark:text-slate-300 truncate max-w-xs">{user.name}</div>
          <span className="text-[10px] font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded-full border border-brand-100/50 dark:border-brand-900/20">
            {user.role.replace('ROLE_', '').replace('_', ' ')}
          </span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
