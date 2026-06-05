import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Menu, 
  Sun, 
  Moon, 
  Bell, 
  LogOut, 
  User, 
  Cake, 
  CalendarDays,
  ChevronDown
} from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const bdaysRes = await axios.get('http://localhost:8080/api/v1/employees/birthdays');
      const annivsRes = await axios.get('http://localhost:8080/api/v1/employees/anniversaries');
      
      const list = [];
      bdaysRes.data.forEach(emp => {
        list.push({
          type: 'BIRTHDAY',
          message: `It's ${emp.firstName} ${emp.lastName}'s birthday today!`,
          icon: Cake,
          color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/20'
        });
      });

      annivsRes.data.forEach(emp => {
        list.push({
          type: 'ANNIVERSARY',
          message: `${emp.firstName} ${emp.lastName} celebrates their work anniversary today!`,
          icon: CalendarDays,
          color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'
        });
      });

      setNotifications(list);
    } catch (error) {
      console.error('Failed to load birthday/anniversary notifications', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 glass-panel border-b border-slate-200/55 dark:border-slate-800/55">
      {/* Mobile Toggle & Logo */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 rounded-lg lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden lg:block">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Welcome back,</span>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 leading-tight">{user.name}</h2>
        </div>
      </div>

      {/* Action Buttons (Right) */}
      <div className="flex items-center gap-4">
        {/* Dark Mode Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-500 dark:text-slate-400 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border border-white dark:border-slate-900 rounded-full" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 glass-panel border rounded-2xl shadow-xl py-2 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 font-semibold border-b border-slate-200/55 dark:border-slate-800/55 text-sm flex items-center justify-between">
                <span>Notifications</span>
                {notifications.length > 0 && (
                  <span className="bg-brand-500 text-white text-[10px] px-2 py-0.5 rounded-full">{notifications.length} Today</span>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                    No notifications today.
                  </div>
                ) : (
                  notifications.map((n, i) => (
                    <div key={i} className="flex gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b last:border-b-0 border-slate-100 dark:border-slate-800/40">
                      <div className={`p-2 rounded-xl flex-shrink-0 ${n.color}`}>
                        <n.icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-normal">{n.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-100 text-brand-600 font-bold dark:bg-brand-950/40 dark:text-brand-400">
              {user.name.charAt(0)}
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 glass-panel border rounded-2xl shadow-xl py-1.5 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-850">
                <p className="text-xs text-slate-400">Signed in as</p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{user.email}</p>
              </div>
              
              {user.employeeId && (
                <button
                  onClick={() => { setDropdownOpen(false); navigate(`/employees/${user.employeeId}`); }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-brand-500 font-medium transition-colors"
                >
                  <User className="w-4 h-4" />
                  My Profile
                </button>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-medium transition-colors border-t border-slate-100 dark:border-slate-800/50"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
