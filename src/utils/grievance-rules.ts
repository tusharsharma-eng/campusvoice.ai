import {
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
  DashboardStats,
  DEPARTMENTS,
} from '../types';

export interface ComplaintValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateComplaintSubmission(data: {
  title?: string;
  description?: string;
  category?: string;
  department?: string;
  location?: string;
}): ComplaintValidationResult {
  const errors: Record<string, string> = {};

  if (!data.title || data.title.trim().length < 5) {
    errors.title = 'Title must be at least 5 characters long';
  } else if (data.title.trim().length > 150) {
    errors.title = 'Title cannot exceed 150 characters';
  }

  if (!data.description || data.description.trim().length < 15) {
    errors.description = 'Please provide a clear description (at least 15 characters)';
  } else if (data.description.trim().length > 3000) {
    errors.description = 'Description cannot exceed 3000 characters';
  }

  if (!data.category || !COMPLAINT_CATEGORIES.includes(data.category as ComplaintCategory)) {
    errors.category = 'Please select a valid grievance category';
  }

  if (!data.department || data.department.trim().length === 0) {
    errors.department = 'Please select or specify a department';
  }

  if (!data.location || data.location.trim().length < 3) {
    errors.location = 'Please specify the exact location (at least 3 characters, e.g., Block B, Room 204)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function isValidStatus(status: string): status is ComplaintStatus {
  return COMPLAINT_STATUSES.includes(status as ComplaintStatus);
}

/**
 * Ensures reporter identity is completely redacted if anonymous
 * when viewed by admins or other users.
 */
export function maskAnonymousComplaint(
  complaint: Complaint,
  viewerRole: 'student' | 'admin',
  viewerStudentId?: string
): Complaint {
  // If not anonymous, or viewer is the student who filed it, return intact
  if (!complaint.isAnonymous) {
    return { ...complaint };
  }

  if (viewerRole === 'student' && viewerStudentId && viewerStudentId === complaint.studentId) {
    return { ...complaint };
  }

  // Scrub student identity for privacy
  return {
    ...complaint,
    studentName: 'Anonymous Student [Protected Identity]',
    studentId: 'REDACTED',
    studentEmail: undefined,
  };
}

/**
 * Computes dashboard counts and metrics
 */
export function calculateDashboardStats(complaints: Complaint[]): DashboardStats {
  const total = complaints.length;
  let notStarted = 0;
  let acknowledged = 0;
  let inProgress = 0;
  let completed = 0;
  let anonymousCount = 0;
  let urgentCount = 0;

  const categoryCounts: Record<ComplaintCategory, number> = {
    Infrastructure: 0,
    Cleanliness: 0,
    'Water and Electricity': 0,
    Fees: 0,
    Academics: 0,
    'Faculty Concerns': 0,
    'Harassment or Misconduct': 0,
    Other: 0,
  };

  for (const c of complaints) {
    if (c.status === 'Not Started') notStarted++;
    else if (c.status === 'Acknowledged') acknowledged++;
    else if (c.status === 'In Progress') inProgress++;
    else if (c.status === 'Completed') completed++;

    if (c.isAnonymous) anonymousCount++;
    if (c.priority === 'High' || c.priority === 'Critical') urgentCount++;

    if (categoryCounts[c.category] !== undefined) {
      categoryCounts[c.category]++;
    } else {
      categoryCounts.Other++;
    }
  }

  const resolutionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    notStarted,
    acknowledged,
    inProgress,
    completed,
    resolutionRate,
    anonymousCount,
    urgentCount,
    categoryCounts,
  };
}

/**
 * Filters and searches complaints based on administrative or student criteria
 */
export interface ComplaintFilterOptions {
  searchQuery?: string;
  status?: string;
  category?: string;
  department?: string;
  isAnonymousOnly?: boolean;
  priority?: string;
}

export function filterComplaints(
  complaints: Complaint[],
  options: ComplaintFilterOptions
): Complaint[] {
  return complaints.filter((c) => {
    if (options.status && options.status !== 'All' && c.status !== options.status) {
      return false;
    }

    if (options.category && options.category !== 'All' && c.category !== options.category) {
      return false;
    }

    if (options.department && options.department !== 'All' && c.assignedDepartment !== options.department && c.department !== options.department) {
      return false;
    }

    if (options.priority && options.priority !== 'All' && c.priority !== options.priority) {
      return false;
    }

    if (options.isAnonymousOnly && !c.isAnonymous) {
      return false;
    }

    if (options.searchQuery && options.searchQuery.trim().length > 0) {
      const q = options.searchQuery.toLowerCase();
      const matchTicket = c.ticketNumber.toLowerCase().includes(q);
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      const matchLocation = c.location.toLowerCase().includes(q);
      const matchDept = c.department.toLowerCase().includes(q);

      if (!matchTicket && !matchTitle && !matchDesc && !matchLocation && !matchDept) {
        return false;
      }
    }

    return true;
  });
}

/**
 * AI Grievance Assistant rule engine for auto-categorization and department suggestion
 */
export function suggestCategoryAndDepartment(text: string): {
  suggestedCategory: ComplaintCategory;
  suggestedDepartment: string;
  suggestedPriority: 'Low' | 'Medium' | 'High' | 'Critical';
  reasoning: string;
} {
  const lower = text.toLowerCase();

  if (
    lower.includes('harass') ||
    lower.includes('ragging') ||
    lower.includes('bully') ||
    lower.includes('threat') ||
    lower.includes('misconduct') ||
    lower.includes('abusive')
  ) {
    return {
      suggestedCategory: 'Harassment or Misconduct',
      suggestedDepartment: 'Student Welfare & Discipline',
      suggestedPriority: 'Critical',
      reasoning: 'High-severity safety concern detected. Escalating to Student Welfare & Discipline.',
    };
  }

  if (
    lower.includes('water') ||
    lower.includes('leak') ||
    lower.includes('power') ||
    lower.includes('electricity') ||
    lower.includes('blackout') ||
    lower.includes('wiring') ||
    lower.includes('fan') ||
    lower.includes('switch') ||
    lower.includes('geyser') ||
    lower.includes('tap')
  ) {
    return {
      suggestedCategory: 'Water and Electricity',
      suggestedDepartment: 'Water & Power Works',
      suggestedPriority: lower.includes('spark') || lower.includes('hazard') || lower.includes('shock') ? 'Critical' : 'High',
      reasoning: 'Utility issue identified regarding electrical or water supply.',
    };
  }

  if (
    lower.includes('clean') ||
    lower.includes('garbage') ||
    lower.includes('dustbin') ||
    lower.includes('washroom') ||
    lower.includes('toilet') ||
    lower.includes('hygiene') ||
    lower.includes('smell') ||
    lower.includes('pest') ||
    lower.includes('sanitation')
  ) {
    return {
      suggestedCategory: 'Cleanliness',
      suggestedDepartment: 'Facilities & Maintenance',
      suggestedPriority: 'Medium',
      reasoning: 'Campus sanitation and hygiene maintenance required.',
    };
  }

  if (
    lower.includes('fee') ||
    lower.includes('receipt') ||
    lower.includes('refund') ||
    lower.includes('scholarship') ||
    lower.includes('fine') ||
    lower.includes('dues') ||
    lower.includes('challan') ||
    lower.includes('tuition')
  ) {
    return {
      suggestedCategory: 'Fees',
      suggestedDepartment: 'Finance & Accounts',
      suggestedPriority: 'Medium',
      reasoning: 'Billing, fee receipt, or financial accounts query identified.',
    };
  }

  if (
    lower.includes('professor') ||
    lower.includes('faculty') ||
    lower.includes('teacher') ||
    lower.includes('lecturer') ||
    lower.includes('attendance penalty') ||
    lower.includes('mentor')
  ) {
    return {
      suggestedCategory: 'Faculty Concerns',
      suggestedDepartment: 'Academic Affairs',
      suggestedPriority: 'Medium',
      reasoning: 'Faculty coordination or classroom grievance identified.',
    };
  }

  if (
    lower.includes('exam') ||
    lower.includes('grade') ||
    lower.includes('syllabus') ||
    lower.includes('lecture') ||
    lower.includes('timetable') ||
    lower.includes('schedule') ||
    lower.includes('course') ||
    lower.includes('credit')
  ) {
    return {
      suggestedCategory: 'Academics',
      suggestedDepartment: 'Academic Affairs',
      suggestedPriority: 'Medium',
      reasoning: 'Academic scheduling or coursework inquiry detected.',
    };
  }

  if (
    lower.includes('desk') ||
    lower.includes('bench') ||
    lower.includes('window') ||
    lower.includes('door') ||
    lower.includes('projector') ||
    lower.includes('board') ||
    lower.includes('ac') ||
    lower.includes('air conditioner') ||
    lower.includes('lift') ||
    lower.includes('elevator') ||
    lower.includes('roof') ||
    lower.includes('building')
  ) {
    return {
      suggestedCategory: 'Infrastructure',
      suggestedDepartment: 'Facilities & Maintenance',
      suggestedPriority: 'Medium',
      reasoning: 'Campus physical infrastructure repair needed.',
    };
  }

  return {
    suggestedCategory: 'Other',
    suggestedDepartment: 'Administration Office',
    suggestedPriority: 'Low',
    reasoning: 'General campus grievance.',
  };
}
