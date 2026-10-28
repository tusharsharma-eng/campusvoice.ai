import React, { useState } from 'react';
import {
  X,
  Lock,
  GraduationCap,
  ShieldAlert,
  UserCheck,
  Building,
  KeyRound,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { storageService } from '../services/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register' | 'admin';
  onAuthSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
  onAuthSuccess,
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'admin'>(initialTab);

  // Student Login fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Student Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regDept, setRegDept] = useState('Computer Science & Engineering');
  const [regPassword, setRegPassword] = useState('');

  // Admin Login fields
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = storageService.loginStudent(loginIdentifier, loginPassword);
    if (!res.success) {
      setErrorMessage(res.error || 'Login failed.');
    } else {
      setSuccessMessage('Student login successful!');
      setTimeout(() => {
        onAuthSuccess();
        onClose();
      }, 500);
    }
  };

  const handleStudentRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = storageService.registerStudent({
      name: regName,
      email: regEmail,
      studentId: regStudentId,
      department: regDept,
      password: regPassword,
    });
    if (!res.success) {
      setErrorMessage(res.error || 'Registration failed.');
    } else {
      setSuccessMessage('Student account created successfully! Logged in.');
      setTimeout(() => {
        onAuthSuccess();
        onClose();
      }, 700);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = storageService.loginAdmin(adminEmail, adminPassword, adminPasscode);
    if (!res.success) {
      setErrorMessage(res.error || 'Admin authentication failed.');
    } else {
      setSuccessMessage('Admin verified successfully! Loading administrative console...');
      setTimeout(() => {
        onAuthSuccess();
        onClose();
      }, 600);
    }
  };

  const fillStudentDemo = () => {
    setTab('login');
    setLoginIdentifier('alex.student@campus.edu');
    setLoginPassword('Student123!');
    setErrorMessage('');
  };

  const fillAdminDemo = () => {
    setTab('admin');
    setAdminEmail('admin@campusvoice.edu');
    setAdminPassword('AdminPass123!');
    setAdminPasscode('CAMPUS_ADMIN_KEY_2026');
    setErrorMessage('');
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
              {tab === 'admin' ? (
                <ShieldAlert className="w-6 h-6 text-amber-300" />
              ) : (
                <GraduationCap className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-xl font-bold tracking-tight">
                {tab === 'admin' ? 'Institutional Admin Portal' : 'Campus Grievance Access'}
              </h2>
              <p className="text-xs text-blue-100 mt-0.5">
                {tab === 'admin'
                  ? 'Authorized faculty & university administrators only'
                  : 'Submit and track personal or campus problems'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMessage('');
            }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              tab === 'login'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Student Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMessage('');
            }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              tab === 'register'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Student Register
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('admin');
              setErrorMessage('');
            }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              tab === 'admin'
                ? 'border-amber-600 text-amber-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-3 h-3" />
            Admin Login
          </button>
        </div>

        {/* Body content */}
        <div className="p-6">
          {/* Quick Demo Pre-fills */}
          <div className="mb-4 p-3 bg-blue-50/80 rounded-xl border border-blue-100 flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-blue-900">1-Click Demo Fill:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={fillStudentDemo}
                className="text-[11px] px-2.5 py-1 bg-white border border-blue-200 hover:border-blue-400 rounded-md text-blue-700 font-medium transition-colors shadow-2xs"
              >
                Student Demo
              </button>
              <button
                type="button"
                onClick={fillAdminDemo}
                className="text-[11px] px-2.5 py-1 bg-amber-50 border border-amber-300 hover:border-amber-500 rounded-md text-amber-900 font-medium transition-colors shadow-2xs"
              >
                Admin Demo
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Student Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="login-id">
                  Student Email or Roll Number
                </label>
                <input
                  id="login-id"
                  type="text"
                  required
                  placeholder="e.g. alex.student@campus.edu or STU-2024-8842"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="login-pass">
                  Password
                </label>
                <input
                  id="login-pass"
                  type="password"
                  required
                  placeholder="Enter your student password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                Sign In as Student
              </button>
            </form>
          )}

          {/* Student Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleStudentRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="reg-name">
                  Full Student Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="e.g. Maya Sharma"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3.5 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="reg-email">
                    College Email
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    placeholder="student@campus.edu"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="reg-id">
                    Student ID / Roll No
                  </label>
                  <input
                    id="reg-id"
                    type="text"
                    required
                    placeholder="e.g. STU-2025-019"
                    value={regStudentId}
                    onChange={(e) => setRegStudentId(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="reg-dept">
                  Academic Department
                </label>
                <select
                  id="reg-dept"
                  value={regDept}
                  onChange={(e) => setRegDept(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Electrical & Electronics">Electrical & Electronics</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Business Administration">Business Administration</option>
                  <option value="Humanities & Social Sciences">Humanities & Social Sciences</option>
                  <option value="Life Sciences & Biotechnology">Life Sciences & Biotechnology</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="reg-pass">
                  Create Password (min 6 chars)
                </label>
                <input
                  id="reg-pass"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Choose a secure password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3.5 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <p className="text-[11px] text-slate-500">
                🔒 Public registration strictly assigns verified student privileges. Administrative access requires institutional key.
              </p>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                Register Student Account
              </button>
            </form>
          )}

          {/* Admin Login Form */}
          {tab === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                <p className="font-semibold flex items-center gap-1.5 mb-1">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  Protected Staff & Administrator Access
                </p>
                <p className="text-[11px] text-amber-800">
                  Admins can triage grievances, assign departments, add resolution remarks, and update statuses to Acknowledged, In Progress, or Completed.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="admin-email">
                  Administrator Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  placeholder="admin@campusvoice.edu"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="admin-pass">
                  Administrator Password
                </label>
                <input
                  id="admin-pass"
                  type="password"
                  required
                  placeholder="Enter administrator password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="admin-key">
                  Dean / Institutional Authorization Key
                </label>
                <input
                  id="admin-key"
                  type="text"
                  placeholder="e.g. CAMPUS_ADMIN_KEY_2026"
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-500">
                  Required for institutional verification (pre-filled via Admin Demo button).
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Authenticate Administrator
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
