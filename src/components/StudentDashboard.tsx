import React, { useState } from 'react';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Shield,
  Search,
  Filter,
  GraduationCap,
  Sparkles,
  Inbox,
  ArrowRight,
  EyeOff,
  Bell,
} from 'lucide-react';
import {
  Complaint,
  ComplaintCategory,
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
  User,
} from '../types';
import { ComplaintCard } from './ComplaintCard';
import { filterComplaints } from '../utils/grievance-rules';

interface StudentDashboardProps {
  complaints: Complaint[];
  currentUser: User | null;
  onOpenSubmit: () => void;
  onSelectComplaint: (id: string) => void;
  onOpenAuth: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  complaints,
  currentUser,
  onOpenSubmit,
  onSelectComplaint,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'my' | 'public'>('my');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Filter complaints based on tab:
  // "my" tab shows complaints filed by this student
  // "public" tab shows all campus issues
  const myComplaints = complaints.filter(
    (c) =>
      currentUser &&
      (c.studentId === currentUser.studentId || c.studentEmail === currentUser.email)
  );

  const displayedComplaints = activeTab === 'my' ? myComplaints : complaints;

  const filteredComplaints = filterComplaints(displayedComplaints, {
    searchQuery,
    category: selectedCategory,
    status: selectedStatus,
  });

  // Calculate student's status counts
  const studentTotal = myComplaints.length;
  const studentNotStarted = myComplaints.filter((c) => c.status === 'Not Started').length;
  const studentAcknowledged = myComplaints.filter((c) => c.status === 'Acknowledged').length;
  const studentInProgress = myComplaints.filter((c) => c.status === 'In Progress').length;
  const studentCompleted = myComplaints.filter((c) => c.status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Student Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md">
                Official Student Redressal System
              </span>
              {currentUser && (
                <span className="text-xs text-blue-200">
                  Welcome, <strong>{currentUser.name}</strong> ({currentUser.studentId})
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Report Campus Issues. Track Resolution.
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 mt-2 leading-relaxed">
              Have a problem with campus infrastructure, sanitation, faculty, fee receipts, or utilities? Submit your grievance transparently with optional anonymous identity protection.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenSubmit}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-800 hover:bg-blue-50 font-bold text-sm shadow-md transition-all hover:scale-102"
            >
              <PlusCircle className="w-5 h-5 text-blue-700" />
              <span>Submit New Grievance</span>
            </button>
          </div>
        </div>

        {/* Anonymity Protection Ribbon */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-blue-200">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>
              <strong>100% Confidential Anonymous Option:</strong> Your identity is completely hidden from administrators and departments when toggled.
            </span>
          </div>
          <span className="text-[11px] bg-white/10 px-2.5 py-0.5 rounded-full font-medium">
            4-Stage Transparent Tracking
          </span>
        </div>
      </div>

      {/* Student Status Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">Not Started</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-slate-800">{studentNotStarted}</span>
            <span className="text-[10px] text-slate-400">Awaiting review</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-amber-800 font-medium block">Acknowledged</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-amber-900">{studentAcknowledged}</span>
            <span className="text-[10px] text-amber-600">Assigned to Dept</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-blue-800 font-medium block">In Progress</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-blue-900">{studentInProgress}</span>
            <span className="text-[10px] text-blue-600">Action ongoing</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-emerald-800 font-medium block">Completed</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-emerald-900">{studentCompleted}</span>
            <span className="text-[10px] text-emerald-600">Resolved</span>
          </div>
        </div>
      </div>

      {/* Tab Switcher & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('my')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${
                activeTab === 'my'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Grievance History ({myComplaints.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('public')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${
                activeTab === 'public'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Campus Grievances ({complaints.length})
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search grievances..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filter selects */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Filter by:</span>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700"
          >
            <option value="All">All Statuses</option>
            {COMPLAINT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700"
          >
            <option value="All">All Categories</option>
            {COMPLAINT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {(searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedStatus('All');
              }}
              className="text-xs text-blue-600 hover:underline font-medium ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Complaints Grid */}
      {filteredComplaints.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            {activeTab === 'my'
              ? 'No grievances submitted yet'
              : 'No matching grievances found'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {activeTab === 'my'
              ? 'Have an issue on campus? Submit your first grievance and follow its progress transparently.'
              : 'Try clearing your search query or status filter to see other campus records.'}
          </p>
          {activeTab === 'my' && (
            <button
              type="button"
              onClick={onOpenSubmit}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit a Grievance</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredComplaints.map((c) => (
            <ComplaintCard
              key={c.id}
              complaint={c}
              onClick={() => onSelectComplaint(c.id)}
              isAdmin={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};
