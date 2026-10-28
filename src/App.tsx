/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ComplaintSubmitModal } from './components/ComplaintSubmitModal';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';
import { AuthModal } from './components/AuthModal';
import { storageService } from './services/storage';
import { Complaint, User } from './types';
import {
  ShieldCheck,
  GraduationCap,
  Sparkles,
  HelpCircle,
  PhoneCall,
  Mail,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<'student' | 'admin'>('student');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

  // Modals
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register' | 'admin'>('login');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = () => {
    const user = storageService.getCurrentUser();
    setCurrentUser(user);
    if (user?.role === 'admin') {
      setActiveView('admin');
    }

    const list = storageService.getComplaints();
    setComplaints(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAuth = (initialTab: 'login' | 'register' | 'admin' = 'login') => {
    setAuthInitialTab(initialTab);
    setIsAuthOpen(true);
  };

  const handleToggleRole = () => {
    if (currentUser?.role === 'admin') {
      storageService.switchRole('student');
      setActiveView('student');
      showToast('Switched to Student profile (Alex Johnson)');
    } else {
      storageService.switchRole('admin');
      setActiveView('admin');
      showToast('Switched to Admin profile (Dr. Evelyn Reed)');
    }
    loadData();
  };

  const handleComplaintSubmitted = (complaintId: string) => {
    loadData();
    setSelectedComplaintId(complaintId);
    showToast('Grievance filed successfully! Official ticket generated.');
  };

  const handleComplaintUpdated = () => {
    loadData();
    showToast('Status history updated and student notified!');
  };

  const selectedComplaint = selectedComplaintId
    ? storageService.getComplaintById(selectedComplaintId)
    : null;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Collegiate Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onOpenSubmit={() => setIsSubmitOpen(true)}
        onToggleRole={handleToggleRole}
        onSelectComplaint={(id) => setSelectedComplaintId(id)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeView === 'admin' && currentUser?.role === 'admin' ? (
          <AdminDashboard
            complaints={complaints}
            currentUser={currentUser}
            onSelectComplaint={(id) => setSelectedComplaintId(id)}
            onRefresh={loadData}
          />
        ) : (
          <StudentDashboard
            complaints={complaints}
            currentUser={currentUser}
            onOpenSubmit={() => setIsSubmitOpen(true)}
            onSelectComplaint={(id) => setSelectedComplaintId(id)}
            onOpenAuth={() => handleOpenAuth('login')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2 font-bold text-slate-900 text-sm">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>CampusVoice AI</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Institutional grievance management portal designed for fair, confidential, and transparent resolution of college academic and campus infrastructure concerns.
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-900 block mb-2">Student Privacy & Protection</span>
              <p className="text-slate-500 leading-relaxed">
                Anonymous grievance filings strictly scrub student identity, email, and roll number from administrative and departmental interfaces.
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-900 block mb-2">Campus Helpline & Escalation</span>
              <div className="space-y-1.5 text-slate-600">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                  <span>Discipline & Emergency: +1 (800) 555-CAMPUS</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>grievances@campusvoice.edu</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <p>© {new Date().getFullYear()} CampusVoice AI - Official College Grievance Redressal System</p>
            <div className="flex items-center gap-4">
              <span>Status Workflow: Not Started → Acknowledged → In Progress → Completed</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Submission Modal */}
      <ComplaintSubmitModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        onSubmitSuccess={handleComplaintSubmitted}
      />

      {/* Detail / Management Modal */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        currentUser={currentUser}
        isOpen={!!selectedComplaintId}
        onClose={() => setSelectedComplaintId(null)}
        onUpdate={handleComplaintUpdated}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialTab={authInitialTab}
        onAuthSuccess={loadData}
      />
    </div>
  );
}
