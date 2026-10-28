export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  department?: string;
  createdAt: string;
}

export type ComplaintStatus = 'Not Started' | 'Acknowledged' | 'In Progress' | 'Completed';

export const COMPLAINT_STATUSES: ComplaintStatus[] = [
  'Not Started',
  'Acknowledged',
  'In Progress',
  'Completed',
];

export type ComplaintCategory =
  | 'Infrastructure'
  | 'Cleanliness'
  | 'Water and Electricity'
  | 'Fees'
  | 'Academics'
  | 'Faculty Concerns'
  | 'Harassment or Misconduct'
  | 'Other';

export const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  'Infrastructure',
  'Cleanliness',
  'Water and Electricity',
  'Fees',
  'Academics',
  'Faculty Concerns',
  'Harassment or Misconduct',
  'Other',
];

export const DEPARTMENTS = [
  'Facilities & Maintenance',
  'Water & Power Works',
  'Finance & Accounts',
  'Academic Affairs',
  'Student Welfare & Discipline',
  'Hostel & Housing Office',
  'Library & Information Services',
  'IT & Campus Network',
  'Administration Office',
] as const;

export type Department = typeof DEPARTMENTS[number] | string;

export interface StatusHistoryItem {
  id: string;
  previousStatus: ComplaintStatus | null;
  newStatus: ComplaintStatus;
  updatedBy: string;
  updatedAt: string;
  notes: string;
}

export interface Complaint {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  department: string;
  location: string;
  imageUrl?: string;
  isAnonymous: boolean;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  status: ComplaintStatus;
  assignedDepartment: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  createdAt: string;
  updatedAt: string;
  resolutionNotes?: string;
  statusHistory: StatusHistoryItem[];
}

export interface Notification {
  id: string;
  userId: string;
  complaintId: string;
  complaintTicket: string;
  title: string;
  message: string;
  status: ComplaintStatus;
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  total: number;
  notStarted: number;
  acknowledged: number;
  inProgress: number;
  completed: number;
  resolutionRate: number;
  anonymousCount: number;
  urgentCount: number;
  categoryCounts: Record<ComplaintCategory, number>;
}
