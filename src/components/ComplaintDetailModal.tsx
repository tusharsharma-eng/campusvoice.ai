import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  ShieldCheck,
  EyeOff,
  User,
  AlertTriangle,
  Send,
  Sparkles,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  History,
  FileCheck,
} from 'lucide-react';
import {
  Complaint,
  ComplaintStatus,
  COMPLAINT_STATUSES,
  DEPARTMENTS,
  User as UserType,
} from '../types';
import { storageService } from '../services/storage';
import { getStatusBadgeStyle, getPriorityBadge } from './ComplaintCard';

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  currentUser: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  currentUser,
  isOpen,
  onClose,
  onUpdate,
}) => {
  if (!isOpen || !complaint) return null;

  const isAdmin = currentUser?.role === 'admin';

  // Admin management state
  const [newStatus, setNewStatus] = useState<ComplaintStatus>(complaint.status);
  const [assignedDept, setAssignedDept] = useState<string>(complaint.assignedDepartment || complaint.department);
  const [notes, setNotes] = useState<string>(complaint.resolutionNotes || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const statusIndexMap: Record<ComplaintStatus, number> = {
    'Not Started': 0,
    Acknowledged: 1,
    'In Progress': 2,
    Completed: 3,
  };

  const currentStep = statusIndexMap[complaint.status];

  const handleAdminUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateError('');
    setUpdateSuccess(false);

    const res = storageService.updateComplaintStatus(
      complaint.id,
      newStatus,
      notes,
      assignedDept
    );

    setIsUpdating(false);
    if (!res.success) {
      setUpdateError(res.error || 'Failed to update status.');
    } else {
      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
        onUpdate();
      }, 700);
    }
  };

  const applyAiTemplate = (type: 'ack' | 'progress' | 'complete') => {
    if (type === 'ack') {
      setNewStatus('Acknowledged');
      setNotes(
        `Grievance received and verified by administration. Assigned to ${assignedDept} for prioritized assessment and site inspection.`
      );
    } else if (type === 'progress') {
      setNewStatus('In Progress');
      setNotes(
        `Department field team has been dispatched to ${complaint.location}. Rectification and repair work currently underway.`
      );
    } else if (type === 'complete') {
      setNewStatus('Completed');
      setNotes(
        `Issue has been resolved successfully by ${assignedDept}. Verified on-site and confirmed compliant with campus standards.`
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
    >
      <div className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-900 p-5 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-white/20 px-2 py-0.5 rounded text-white backdrop-blur-xs">
                {complaint.ticketNumber}
              </span>
              <span className="text-xs text-blue-200">
                Filed on {new Date(complaint.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h2 id="detail-modal-title" className="text-lg sm:text-xl font-bold tracking-tight mt-1 text-white">
              {complaint.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto text-slate-800">
          {/* 4-Step Visual Progress Stepper */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Resolution Progress
            </h4>
            <div className="relative flex items-center justify-between">
              {COMPLAINT_STATUSES.map((status, index) => {
                const isPassed = index < currentStep;
                const isCurrent = index === currentStep;
                return (
                  <div key={status} className="flex-1 flex flex-col items-center relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                        isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-xs'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                    </div>
                    <span
                      className={`text-[11px] font-semibold mt-1.5 text-center px-1 ${
                        isCurrent
                          ? 'text-blue-700'
                          : isPassed
                          ? 'text-emerald-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                );
              })}
              {/* Connector line behind steps */}
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${(currentStep / (COMPLAINT_STATUSES.length - 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Grievance Core Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  Category
                </span>
                <span className="inline-block mt-0.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                  {complaint.category}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  Assigned Department
                </span>
                <div className="flex items-center gap-1.5 mt-0.5 text-sm font-semibold text-slate-800">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>{complaint.assignedDepartment}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  Campus Location
                </span>
                <div className="flex items-center gap-1.5 mt-0.5 text-sm text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span>{complaint.location}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  Urgency / Priority
                </span>
                <span
                  className={`inline-block mt-0.5 px-2.5 py-0.5 rounded text-xs font-semibold border ${getPriorityBadge(
                    complaint.priority
                  )}`}
                >
                  {complaint.priority} Priority
                </span>
              </div>

              {/* Student Reporter Privacy Block */}
              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  Reporter Identification
                </span>
                {complaint.isAnonymous ? (
                  <div className="mt-1 p-2.5 rounded-lg bg-purple-50 border border-purple-200 flex items-center gap-2 text-xs text-purple-900">
                    <EyeOff className="w-4 h-4 text-purple-700 shrink-0" />
                    <div>
                      <span className="font-bold">Confidential / Anonymous Report</span>
                      <p className="text-[11px] text-purple-700">
                        Student identity is securely protected. Redacted from staff view.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center gap-2 text-sm text-slate-800">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="font-medium">{complaint.studentName}</span>
                    <span className="text-xs text-slate-500">
                      ({complaint.studentId})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Full Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Description of the Issue
            </h4>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {complaint.description}
            </div>
          </div>

          {/* Attached Image Evidence */}
          {complaint.imageUrl && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Attached Photo Evidence
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden max-w-md shadow-xs">
                <img
                  src={complaint.imageUrl}
                  alt="Complaint attachment"
                  className="w-full h-auto object-cover max-h-72"
                />
              </div>
            </div>
          )}

          {/* Timeline / Status History */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-600" />
              <span>Status History & Audit Trail</span>
            </h4>
            <div className="space-y-2.5 border-l-2 border-blue-200 ml-2 pl-4">
              {complaint.statusHistory.map((item) => (
                <div key={item.id} className="relative text-xs">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white"></div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.newStatus}</span>
                    <span className="text-slate-400 text-[10px]">
                      by {item.updatedBy} • {new Date(item.updatedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {item.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Administrative Resolution Controls (Only visible to Admin) */}
          {isAdmin ? (
            <div className="mt-6 pt-5 border-t border-slate-200 bg-amber-50/40 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-5 sm:p-6 border-amber-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-amber-700" />
                  <h4 className="text-sm font-bold text-amber-950">
                    Administrator Actions & Resolution Dispatch
                  </h4>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                  Admin Privileged
                </span>
              </div>

              {updateError && (
                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-xs text-red-700 rounded-lg">
                  {updateError}
                </div>
              )}

              {updateSuccess && (
                <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complaint status updated and student notified!</span>
                </div>
              )}

              {/* Quick AI Template Buttons */}
              <div className="mb-3 flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] font-medium text-amber-900">AI Quick Drafts:</span>
                <button
                  type="button"
                  onClick={() => applyAiTemplate('ack')}
                  className="inline-flex items-center gap-1 text-[11px] bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-md transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Acknowledge & Inspect
                </button>
                <button
                  type="button"
                  onClick={() => applyAiTemplate('progress')}
                  className="inline-flex items-center gap-1 text-[11px] bg-white hover:bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-1 rounded-md transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  Dispatch Repair Crew
                </button>
                <button
                  type="button"
                  onClick={() => applyAiTemplate('complete')}
                  className="inline-flex items-center gap-1 text-[11px] bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-md transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Mark Completed
                </button>
              </div>

              <form onSubmit={handleAdminUpdate} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="admin-status-select" className="block text-xs font-semibold text-slate-700 mb-1">
                      Update Status (Exactly 4 Allowed)
                    </label>
                    <select
                      id="admin-status-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                      className="w-full px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    >
                      {COMPLAINT_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="admin-dept-select" className="block text-xs font-semibold text-slate-700 mb-1">
                      Assign / Transfer Department
                    </label>
                    <select
                      id="admin-dept-select"
                      value={assignedDept}
                      onChange={(e) => setAssignedDept(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="admin-notes" className="block text-xs font-semibold text-slate-700 mb-1">
                    Resolution Notes & Student Notification Remarks
                  </label>
                  <textarea
                    id="admin-notes"
                    rows={3}
                    placeholder="Provide actionable update for the student and record in official grievance audit trail..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Commit Status & Notify Student</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Close Ticket
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
