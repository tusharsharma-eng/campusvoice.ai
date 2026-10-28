import React, { useState } from 'react';
import {
  ShieldAlert,
  GraduationCap,
  Bell,
  LogOut,
  UserCheck,
  PlusCircle,
  RefreshCw,
  LayoutDashboard,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { User } from '../types';
import { storageService } from '../services/storage';

interface NavbarProps {
  currentUser: User | null;
  onOpenAuth: (initialTab?: 'login' | 'register' | 'admin') => void;
  onOpenSubmit: () => void;
  onToggleRole: () => void;
  onSelectComplaint: (id: string) => void;
  activeView: 'student' | 'admin';
  setActiveView: (view: 'student' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onOpenSubmit,
  onToggleRole,
  onSelectComplaint,
  activeView,
  setActiveView,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notifications = storageService.getNotifications();
  const unreadCount = storageService.getUnreadNotificationCount();

  const handleLogout = () => {
    storageService.logout();
    window.location.reload();
  };

  const handleResetData = () => {
    if (window.confirm('Reset all sample grievances and demo accounts to default?')) {
      storageService.resetToDefaultSeed();
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-sm ring-2 ring-blue-100">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  CampusVoice <span className="text-blue-600 font-extrabold">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  Grievance Portal
                </span>
              </div>
              <p className="hidden md:block text-xs text-slate-500 font-normal">
                Transparent & Confidential College Grievance Resolution
              </p>
            </div>
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Switcher (Admin / Student) for authorized or quick preview */}
            {currentUser?.role === 'admin' ? (
              <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveView('admin')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                    activeView === 'admin'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Admin Console</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('student')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                    activeView === 'student'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student View</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenSubmit}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs transition-colors"
                aria-label="Submit Grievance"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Submit Grievance</span>
                <span className="sm:hidden">Report</span>
              </button>
            )}

            {/* Notifications Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="View status update notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-sm text-slate-800">
                        Status Updates & Alerts
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => storageService.markAllNotificationsAsRead()}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-sm">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            storageService.markNotificationAsRead(n.id);
                            onSelectComplaint(n.complaintId);
                            setShowNotifications(false);
                          }}
                          className={`p-3 text-left hover:bg-slate-50 cursor-pointer transition-colors ${
                            !n.read ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-xs text-blue-900">
                              {n.complaintTicket} - {n.title}
                            </span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Demo Quick Role Switcher */}
            <button
              type="button"
              onClick={onToggleRole}
              title={`Switch active role from ${currentUser?.role || 'Guest'} to ${
                currentUser?.role === 'admin' ? 'Student' : 'Admin'
              }`}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>
                Switch to {currentUser?.role === 'admin' ? 'Student' : 'Admin'}
              </span>
            </button>

            {/* User Profile / Auth State */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="flex flex-col text-right hidden sm:block">
                  <span className="text-xs font-semibold text-slate-800 line-clamp-1 max-w-[130px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700">
                    {currentUser.role} {currentUser.studentId ? `(${currentUser.studentId})` : ''}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
