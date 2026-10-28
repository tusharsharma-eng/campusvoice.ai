import React from 'react';
import {
  Clock,
  MapPin,
  Building2,
  ShieldCheck,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../types';

interface ComplaintCardProps {
  complaint: Complaint;
  onClick: () => void;
  isAdmin?: boolean;
}

export const getStatusBadgeStyle = (status: ComplaintStatus) => {
  switch (status) {
    case 'Not Started':
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-300',
        dot: 'bg-slate-400',
        label: 'Not Started',
      };
    case 'Acknowledged':
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-300',
        dot: 'bg-amber-500',
        label: 'Acknowledged',
      };
    case 'In Progress':
      return {
        bg: 'bg-blue-50 text-blue-800 border-blue-300',
        dot: 'bg-blue-600',
        label: 'In Progress',
      };
    case 'Completed':
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        dot: 'bg-emerald-600',
        label: 'Completed',
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-300',
        dot: 'bg-slate-400',
        label: status,
      };
  }
};

export const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'Critical':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'High':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'Medium':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  onClick,
  isAdmin = false,
}) => {
  const statusStyle = getStatusBadgeStyle(complaint.status);
  const timeFormatted = new Date(complaint.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all p-4 sm:p-5 cursor-pointer text-left flex flex-col justify-between group focus:outline-hidden focus:ring-2 focus:ring-blue-500"
    >
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {complaint.ticketNumber}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyle.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
              {statusStyle.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {complaint.isAnonymous && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                <EyeOff className="w-3 h-3" />
                <span>Anonymous</span>
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getPriorityBadge(
                complaint.priority
              )}`}
            >
              {complaint.priority}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1 mb-1.5">
          {complaint.title}
        </h3>

        {/* Description snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
          {complaint.description}
        </p>

        {/* Location & Department */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 mb-3">
          <div className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="line-clamp-1">{complaint.assignedDepartment}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="line-clamp-1">{complaint.location}</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Reported {timeFormatted}</span>
        </div>

        <div className="flex items-center gap-1 text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
