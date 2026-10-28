import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Building2,
  UserCheck,
  EyeOff,
  Flame,
  LayoutGrid,
  List,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';
import {
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
  DEPARTMENTS,
  User,
} from '../types';
import { filterComplaints, calculateDashboardStats } from '../utils/grievance-rules';
import { ComplaintCard, getStatusBadgeStyle, getPriorityBadge } from './ComplaintCard';

interface AdminDashboardProps {
  complaints: Complaint[];
  currentUser: User;
  onSelectComplaint: (id: string) => void;
  onRefresh: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  complaints,
  currentUser,
  onSelectComplaint,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [isAnonymousOnly, setIsAnonymousOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const stats = calculateDashboardStats(complaints);

  const filteredComplaints = filterComplaints(complaints, {
    searchQuery,
    status: selectedStatus,
    category: selectedCategory,
    department: selectedDepartment,
    priority: selectedPriority,
    isAnonymousOnly,
  });

  return (
    <div className="space-y-6">
      {/* Admin Greeting & Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Institutional Administration Panel
              </span>
              <span className="text-xs text-blue-200">
                Logged in as <strong className="text-white">{currentUser.name}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Grievance Oversight & Triage Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Monitor, assign, and resolve student grievances across all academic and residential departments. Identity redaction is enforced for anonymous filings.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center min-w-[100px]">
              <span className="text-[10px] text-slate-300 font-medium block">Resolution Rate</span>
              <span className="text-2xl font-black text-emerald-400">{stats.resolutionRate}%</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center min-w-[100px]">
              <span className="text-[10px] text-slate-300 font-medium block">Anonymous Filings</span>
              <span className="text-2xl font-black text-purple-300">{stats.anonymousCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Exactly 4 Status Metric Cards + Total */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total */}
        <div
          onClick={() => setSelectedStatus('All')}
          role="button"
          tabIndex={0}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatus === 'All'
              ? 'bg-blue-50 border-blue-500 shadow-xs ring-2 ring-blue-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Grievances</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
          <span className="text-[11px] text-slate-400">All registered issues</span>
        </div>

        {/* 1. Not Started */}
        <div
          onClick={() => setSelectedStatus('Not Started')}
          role="button"
          tabIndex={0}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatus === 'Not Started'
              ? 'bg-slate-100 border-slate-500 shadow-xs ring-2 ring-slate-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Not Started</span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-1">{stats.notStarted}</p>
          <span className="text-[11px] text-slate-400">Pending review</span>
        </div>

        {/* 2. Acknowledged */}
        <div
          onClick={() => setSelectedStatus('Acknowledged')}
          role="button"
          tabIndex={0}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatus === 'Acknowledged'
              ? 'bg-amber-50 border-amber-500 shadow-xs ring-2 ring-amber-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">Acknowledged</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </div>
          <p className="text-2xl font-bold text-amber-900 mt-1">{stats.acknowledged}</p>
          <span className="text-[11px] text-amber-700/70">Verified & queued</span>
        </div>

        {/* 3. In Progress */}
        <div
          onClick={() => setSelectedStatus('In Progress')}
          role="button"
          tabIndex={0}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatus === 'In Progress'
              ? 'bg-blue-50 border-blue-600 shadow-xs ring-2 ring-blue-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-800">In Progress</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.inProgress}</p>
          <span className="text-[11px] text-blue-700/70">Field action active</span>
        </div>

        {/* 4. Completed */}
        <div
          onClick={() => setSelectedStatus('Completed')}
          role="button"
          tabIndex={0}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatus === 'Completed'
              ? 'bg-emerald-50 border-emerald-600 shadow-xs ring-2 ring-emerald-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-900 mt-1">{stats.completed}</p>
          <span className="text-[11px] text-emerald-700/70">Resolved & verified</span>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ticket, title, keyword, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {/* Status select */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700"
            >
              <option value="All">All Statuses ({stats.total})</option>
              {COMPLAINT_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {/* Category select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700"
            >
              <option value="All">All Categories</option>
              {COMPLAINT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Department select */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Anonymity toggle */}
            <button
              type="button"
              onClick={() => setIsAnonymousOnly(!isAnonymousOnly)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                isAnonymousOnly
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Anonymous Only</span>
            </button>

            {/* View mode toggle */}
            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 transition-colors ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'
                }`}
                title="Table View"
                aria-label="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'
                }`}
                title="Grid View"
                aria-label="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Distribution Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Categories:</span>
          {COMPLAINT_CATEGORIES.map((cat) => {
            const count = stats.categoryCounts[cat] || 0;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? 'All' : cat)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Complaints List / Table */}
      {filteredComplaints.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No grievances match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, status, or department filters to see other campus records.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedStatus('All');
              setSelectedCategory('All');
              setSelectedDepartment('All');
              setIsAnonymousOnly(false);
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Grievance & Category</th>
                  <th className="py-3 px-4">Department & Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Reporter</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredComplaints.map((c) => {
                  const statusStyle = getStatusBadgeStyle(c.status);
                  return (
                    <tr
                      key={c.id}
                      onClick={() => onSelectComplaint(c.id)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                        {c.ticketNumber}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 line-clamp-1">{c.title}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                            {c.category}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${getPriorityBadge(
                              c.priority
                            )}`}
                          >
                            {c.priority}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-semibold text-slate-800 line-clamp-1">
                          {c.assignedDepartment}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{c.location}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyle.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {c.isAnonymous ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            <EyeOff className="w-3 h-3" />
                            Anonymous
                          </span>
                        ) : (
                          <span className="font-medium text-slate-800">{c.studentName}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectComplaint(c.id);
                          }}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs transition-colors border border-blue-200"
                        >
                          Manage / Update
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredComplaints.map((c) => (
            <ComplaintCard
              key={c.id}
              complaint={c}
              onClick={() => onSelectComplaint(c.id)}
              isAdmin={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};
