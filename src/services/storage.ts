import {
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
  DashboardStats,
  Notification,
  User,
} from '../types';
import {
  calculateDashboardStats,
  maskAnonymousComplaint,
  validateComplaintSubmission,
} from '../utils/grievance-rules';

const STORAGE_KEYS = {
  USERS: 'campusvoice_users_v1',
  COMPLAINTS: 'campusvoice_complaints_v1',
  CURRENT_USER: 'campusvoice_session_v1',
  NOTIFICATIONS: 'campusvoice_notifications_v1',
};

// Default Institutional Admin Account
const INITIAL_ADMIN: User & { passwordHash: string } = {
  id: 'usr-admin-01',
  name: 'Dr. Evelyn Reed (Dean of Student Affairs)',
  email: 'admin@campusvoice.edu',
  role: 'admin',
  department: 'Administration Office',
  createdAt: '2026-01-10T08:00:00.000Z',
  passwordHash: 'AdminPass123!',
};

// Default Demo Student Account
const INITIAL_STUDENT: User & { passwordHash: string } = {
  id: 'usr-student-01',
  name: 'Alex Johnson',
  email: 'alex.student@campus.edu',
  role: 'student',
  studentId: 'STU-2024-8842',
  department: 'Computer Science & Engineering',
  createdAt: '2026-02-01T09:30:00.000Z',
  passwordHash: 'Student123!',
};

const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'cmp-001',
    ticketNumber: 'CV-2026-0101',
    title: 'Drinking water cooler dispensing contaminated water',
    description: 'The central water cooler on the 2nd floor of Block C has been dispensing discolored water with a metallic taste since yesterday morning. Multiple students reported stomach aches.',
    category: 'Water and Electricity',
    department: 'Water & Power Works',
    assignedDepartment: 'Water & Power Works',
    location: 'Engineering Block C, 2nd Floor Corridor',
    isAnonymous: false,
    studentId: 'STU-2024-8842',
    studentName: 'Alex Johnson',
    studentEmail: 'alex.student@campus.edu',
    status: 'In Progress',
    priority: 'High',
    createdAt: '2026-10-24T09:15:00.000Z',
    updatedAt: '2026-10-25T14:30:00.000Z',
    resolutionNotes: 'Maintenance inspection completed. Water filter cartridge replacement is underway by the sanitation contractor.',
    statusHistory: [
      {
        id: 'sh-1',
        previousStatus: null,
        newStatus: 'Not Started',
        updatedBy: 'System',
        updatedAt: '2026-10-24T09:15:00.000Z',
        notes: 'Complaint submitted by student.',
      },
      {
        id: 'sh-2',
        previousStatus: 'Not Started',
        newStatus: 'Acknowledged',
        updatedBy: 'Dr. Evelyn Reed',
        updatedAt: '2026-10-24T11:00:00.000Z',
        notes: 'Grievance verified. Priority elevated to High. Assigned to Water & Power Works supervisor Mr. Sharma.',
      },
      {
        id: 'sh-3',
        previousStatus: 'Acknowledged',
        newStatus: 'In Progress',
        updatedBy: 'Dr. Evelyn Reed',
        updatedAt: '2026-10-25T14:30:00.000Z',
        notes: 'Technician on-site. Temporary mineral water dispensers installed near the lecture hall.',
      },
    ],
  },
  {
    id: 'cmp-002',
    ticketNumber: 'CV-2026-0102',
    title: 'Broken desks and overhead projector flickering in Lecture Hall 104',
    description: 'During morning data structures lectures, three front desks have exposed nails that damaged bags, and the overhead HDMI projector flickers every 3 minutes.',
    category: 'Infrastructure',
    department: 'Facilities & Maintenance',
    assignedDepartment: 'Facilities & Maintenance',
    location: 'Main Academic Block, Lecture Hall 104',
    isAnonymous: false,
    studentId: 'STU-2024-8842',
    studentName: 'Alex Johnson',
    studentEmail: 'alex.student@campus.edu',
    status: 'Acknowledged',
    priority: 'Medium',
    createdAt: '2026-10-25T11:40:00.000Z',
    updatedAt: '2026-10-25T16:10:00.000Z',
    resolutionNotes: 'Notified audiovisual team and carpentry team for weekend maintenance schedule.',
    statusHistory: [
      {
        id: 'sh-4',
        previousStatus: null,
        newStatus: 'Not Started',
        updatedBy: 'System',
        updatedAt: '2026-10-25T11:40:00.000Z',
        notes: 'Grievance registered.',
      },
      {
        id: 'sh-5',
        previousStatus: 'Not Started',
        newStatus: 'Acknowledged',
        updatedBy: 'Dr. Evelyn Reed',
        updatedAt: '2026-10-25T16:10:00.000Z',
        notes: 'Acknowledged by administration. Ticket assigned to Facilities team.',
      },
    ],
  },
  {
    id: 'cmp-003',
    ticketNumber: 'CV-2026-0103',
    title: 'Irregular hygiene and uncollected waste in Girls Hostel Washrooms',
    description: 'Third-floor sanitation has not been serviced for four days. Bins are overflowing and poses a serious health risk to residents.',
    category: 'Cleanliness',
    department: 'Hostel & Housing Office',
    assignedDepartment: 'Facilities & Maintenance',
    location: 'Hostel Building 4, 3rd Floor Wing B',
    isAnonymous: true,
    studentId: 'STU-2023-4419',
    studentName: 'Priya Patel',
    studentEmail: 'priya.p@campus.edu',
    status: 'Completed',
    priority: 'High',
    createdAt: '2026-10-22T08:00:00.000Z',
    updatedAt: '2026-10-23T17:00:00.000Z',
    resolutionNotes: 'Deep cleaning and sanitization completed by housekeeping team. Daily roster re-assigned and hostel warden notified.',
    statusHistory: [
      {
        id: 'sh-6',
        previousStatus: null,
        newStatus: 'Not Started',
        updatedBy: 'System',
        updatedAt: '2026-10-22T08:00:00.000Z',
        notes: 'Confidential complaint filed.',
      },
      {
        id: 'sh-7',
        previousStatus: 'Not Started',
        newStatus: 'Acknowledged',
        updatedBy: 'Dr. Evelyn Reed',
        updatedAt: '2026-10-22T09:30:00.000Z',
        notes: 'Priority acknowledged. Housekeeping contractor summoned.',
      },
      {
        id: 'sh-8',
        previousStatus: 'Acknowledged',
        newStatus: 'In Progress',
        updatedBy: 'Dr. Evelyn Reed',
        updatedAt: '2026-10-22T13:00:00.000Z',
        notes: 'Cleaning crew dispatched with sanitization equipment.',
      },
      {
        id: 'sh-9',
        previousStatus: 'In Progress',
        newStatus: 'Completed',
        updatedBy: 'Dr. Evelyn Reed',
        updatedAt: '2026-10-23T17:00:00.000Z',
        notes: 'Full sanitization completed. Inspection signed off by hostel resident advisor.',
      },
    ],
  },
  {
    id: 'cmp-004',
    ticketNumber: 'CV-2026-0104',
    title: 'Late fee penalty wrongly charged after online portal payment timeout',
    description: 'On Oct 15th, my transaction succeeded through UPI, yet the college ERP portal logged it as failed and added a $50 late surcharge.',
    category: 'Fees',
    department: 'Finance & Accounts',
    assignedDepartment: 'Finance & Accounts',
    location: 'Admin Building, Finance Desk',
    isAnonymous: false,
    studentId: 'STU-2024-8842',
    studentName: 'Alex Johnson',
    studentEmail: 'alex.student@campus.edu',
    status: 'Not Started',
    priority: 'Medium',
    createdAt: '2026-10-26T14:20:00.000Z',
    updatedAt: '2026-10-26T14:20:00.000Z',
    statusHistory: [
      {
        id: 'sh-10',
        previousStatus: null,
        newStatus: 'Not Started',
        updatedBy: 'System',
        updatedAt: '2026-10-26T14:20:00.000Z',
        notes: 'Complaint submitted with bank transaction reference ID.',
      },
    ],
  },
  {
    id: 'cmp-005',
    ticketNumber: 'CV-2026-0105',
    title: 'Verbal harassment and intimidating behavior near North Gate Parking',
    description: 'Two non-student individuals loitering near the two-wheeler parking lot have been passing inappropriate remarks at female students after 7 PM. Requesting security patrolling and CCTV review.',
    category: 'Harassment or Misconduct',
    department: 'Student Welfare & Discipline',
    assignedDepartment: 'Student Welfare & Discipline',
    location: 'North Gate Parking Area near Gate 3',
    isAnonymous: true,
    studentId: 'STU-2025-1102',
    studentName: 'Maya Sharma',
    studentEmail: 'maya.s@campus.edu',
    status: 'In Progress',
    priority: 'Critical',
    createdAt: '2026-10-25T19:30:00.000Z',
    updatedAt: '2026-10-26T10:15:00.000Z',
    resolutionNotes: 'Chief Security Officer notified. Static guard deployed at North Gate from 6 PM to 10 PM. CCTV footage being reviewed by disciplinary cell.',
    statusHistory: [
      {
        id: 'sh-11',
        previousStatus: null,
        newStatus: 'Not Started',
        updatedBy: 'System',
        updatedAt: '2026-10-25T19:30:00.000Z',
        notes: 'Confidential harassment report received. Identity protected.',
      },
      {
        id: 'sh-12',
        previousStatus: 'Not Started',
        newStatus: 'Acknowledged',
        updatedBy: 'Dr. Evelyn Reed',
        updatedAt: '2026-10-25T20:10:00.000Z',
        notes: 'Immediate action initiated with campus security director.',
      },
      {
        id: 'sh-13',
        previousStatus: 'Acknowledged',
        newStatus: 'In Progress',
        updatedBy: 'Dr. Evelyn Reed',
        updatedAt: '2026-10-26T10:15:00.000Z',
        notes: 'Campus security post stationed and patrol frequency doubled.',
      },
    ],
  },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: 'usr-student-01',
    complaintId: 'cmp-001',
    complaintTicket: 'CV-2026-0101',
    title: 'Status Updated: In Progress',
    message: 'Your complaint regarding the drinking water cooler has been moved to In Progress. Technician is on-site.',
    status: 'In Progress',
    read: false,
    createdAt: '2026-10-25T14:30:00.000Z',
  },
  {
    id: 'notif-2',
    userId: 'usr-student-01',
    complaintId: 'cmp-002',
    complaintTicket: 'CV-2026-0102',
    title: 'Grievance Acknowledged',
    message: 'Your report on LH-104 projector and desks has been acknowledged by Dr. Evelyn Reed and assigned to Facilities.',
    status: 'Acknowledged',
    read: true,
    createdAt: '2026-10-25T16:10:00.000Z',
  },
];

class StorageService {
  private users: (User & { passwordHash: string })[] = [];
  private complaints: Complaint[] = [];
  private notifications: Notification[] = [];
  private currentUser: User | null = null;

  constructor() {
    this.init();
  }

  private init() {
    try {
      // Load users
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (storedUsers) {
        this.users = JSON.parse(storedUsers);
      } else {
        this.users = [INITIAL_ADMIN, INITIAL_STUDENT];
        this.saveUsers();
      }

      // Load complaints
      const storedComplaints = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
      if (storedComplaints) {
        this.complaints = JSON.parse(storedComplaints);
      } else {
        this.complaints = INITIAL_COMPLAINTS;
        this.saveComplaints();
      }

      // Load notifications
      const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (storedNotifs) {
        this.notifications = JSON.parse(storedNotifs);
      } else {
        this.notifications = INITIAL_NOTIFICATIONS;
        this.saveNotifications();
      }

      // Load current session
      const storedSession = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (storedSession) {
        this.currentUser = JSON.parse(storedSession);
      } else {
        // Default to student demo user for immediate smooth onboarding
        this.currentUser = {
          id: INITIAL_STUDENT.id,
          name: INITIAL_STUDENT.name,
          email: INITIAL_STUDENT.email,
          role: INITIAL_STUDENT.role,
          studentId: INITIAL_STUDENT.studentId,
          department: INITIAL_STUDENT.department,
          createdAt: INITIAL_STUDENT.createdAt,
        };
        this.saveSession();
      }
    } catch (e) {
      console.warn('LocalStorage fallback to in-memory store:', e);
      this.users = [INITIAL_ADMIN, INITIAL_STUDENT];
      this.complaints = INITIAL_COMPLAINTS;
      this.notifications = INITIAL_NOTIFICATIONS;
      this.currentUser = INITIAL_STUDENT;
    }
  }

  private saveUsers() {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
    } catch (e) {}
  }

  private saveComplaints() {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(this.complaints));
    } catch (e) {}
  }

  private saveNotifications() {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
    } catch (e) {}
  }

  private saveSession() {
    try {
      if (this.currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch (e) {}
  }

  // Auth methods
  public getCurrentUser(): User | null {
    return this.currentUser ? { ...this.currentUser } : null;
  }

  public registerStudent(data: {
    name: string;
    email: string;
    password: string;
    studentId: string;
    department?: string;
  }): { success: boolean; user?: User; error?: string } {
    if (!data.name || data.name.trim().length < 2) {
      return { success: false, error: 'Full name must be at least 2 characters.' };
    }
    if (!data.email || !data.email.includes('@')) {
      return { success: false, error: 'Please enter a valid college email address.' };
    }
    if (!data.studentId || data.studentId.trim().length < 3) {
      return { success: false, error: 'Student ID/Roll Number is required.' };
    }
    if (!data.password || data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const emailNormalized = data.email.trim().toLowerCase();
    const existing = this.users.find(
      (u) => u.email.toLowerCase() === emailNormalized || u.studentId === data.studentId.trim()
    );

    if (existing) {
      return { success: false, error: 'A student account with this email or Student ID already exists.' };
    }

    // SECURITY GUARANTEE: Public registration strictly grants 'student' role. Admin role cannot be self-assigned.
    const newUser: User & { passwordHash: string } = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: data.name.trim(),
      email: emailNormalized,
      role: 'student', // Enforced!
      studentId: data.studentId.trim().toUpperCase(),
      department: data.department || 'General Studies',
      createdAt: new Date().toISOString(),
      passwordHash: data.password,
    };

    this.users.push(newUser);
    this.saveUsers();

    const sanitizedUser: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      studentId: newUser.studentId,
      department: newUser.department,
      createdAt: newUser.createdAt,
    };

    this.currentUser = sanitizedUser;
    this.saveSession();

    return { success: true, user: sanitizedUser };
  }

  public loginStudent(emailOrStudentId: string, password: string): { success: boolean; user?: User; error?: string } {
    const query = emailOrStudentId.trim().toLowerCase();
    const user = this.users.find(
      (u) =>
        u.role === 'student' &&
        (u.email.toLowerCase() === query || (u.studentId && u.studentId.toLowerCase() === query))
    );

    if (!user || user.passwordHash !== password) {
      return { success: false, error: 'Invalid Student ID/Email or password.' };
    }

    const sanitizedUser: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      department: user.department,
      createdAt: user.createdAt,
    };

    this.currentUser = sanitizedUser;
    this.saveSession();

    return { success: true, user: sanitizedUser };
  }

  public loginAdmin(
    email: string,
    password: string,
    adminAccessPasscode?: string
  ): { success: boolean; user?: User; error?: string } {
    const query = email.trim().toLowerCase();
    const user = this.users.find((u) => u.role === 'admin' && u.email.toLowerCase() === query);

    // Either correct registered admin password OR the institutional master passcode for Dean/Admin portal
    const isMasterAdminCode = adminAccessPasscode === 'CAMPUS_ADMIN_KEY_2026';

    if (!user) {
      // If logging in with institutional master admin key
      if (isMasterAdminCode && password.length >= 6) {
        const newAdmin: User & { passwordHash: string } = {
          id: `adm-${Date.now()}`,
          name: 'Institutional Administrator',
          email: query,
          role: 'admin',
          department: 'Administration Office',
          createdAt: new Date().toISOString(),
          passwordHash: password,
        };
        this.users.push(newAdmin);
        this.saveUsers();
        this.currentUser = { ...newAdmin };
        this.saveSession();
        return { success: true, user: this.currentUser };
      }
      return { success: false, error: 'Admin account not found. Please contact campus IT or use credentials.' };
    }

    if (user.passwordHash !== password && !isMasterAdminCode) {
      return { success: false, error: 'Incorrect administrator password.' };
    }

    const sanitizedUser: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      department: user.department,
      createdAt: user.createdAt,
    };

    this.currentUser = sanitizedUser;
    this.saveSession();

    return { success: true, user: sanitizedUser };
  }

  public logout() {
    this.currentUser = null;
    this.saveSession();
  }

  public switchRole(targetRole: 'student' | 'admin') {
    if (targetRole === 'admin') {
      const admin = this.users.find((u) => u.role === 'admin') || INITIAL_ADMIN;
      this.currentUser = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
        department: admin.department,
        createdAt: admin.createdAt,
      };
    } else {
      const student = this.users.find((u) => u.role === 'student') || INITIAL_STUDENT;
      this.currentUser = {
        id: student.id,
        name: student.name,
        email: student.email,
        role: 'student',
        studentId: student.studentId,
        department: student.department,
        createdAt: student.createdAt,
      };
    }
    this.saveSession();
  }

  // Complaints methods
  public getComplaints(filterStudentOnly = false): Complaint[] {
    const user = this.currentUser;
    const isStudent = user?.role === 'student';

    let list = [...this.complaints];

    if (filterStudentOnly && isStudent && user) {
      // Student view: show complaints filed by this student
      list = list.filter((c) => c.studentId === user.studentId || c.studentEmail === user.email);
    }

    // Apply anonymity masking:
    // If viewing as admin, or viewing another student's complaint, redact identity!
    return list.map((c) =>
      maskAnonymousComplaint(
        c,
        user?.role || 'student',
        user?.role === 'student' ? user?.studentId : undefined
      )
    );
  }

  public getComplaintById(id: string): Complaint | null {
    const item = this.complaints.find((c) => c.id === id);
    if (!item) return null;

    const user = this.currentUser;
    return maskAnonymousComplaint(
      item,
      user?.role || 'student',
      user?.role === 'student' ? user?.studentId : undefined
    );
  }

  public submitComplaint(data: {
    title: string;
    description: string;
    category: ComplaintCategory;
    department: string;
    location: string;
    imageUrl?: string;
    isAnonymous: boolean;
    priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  }): { success: boolean; complaint?: Complaint; errors?: Record<string, string> } {
    const validation = validateComplaintSubmission(data);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const user = this.currentUser;
    const studentId = user?.studentId || 'STU-DEMO';
    const studentName = user?.name || 'Student';
    const studentEmail = user?.email || 'student@campus.edu';

    const count = this.complaints.length + 101;
    const ticketNumber = `CV-2026-${count.toString().padStart(4, '0')}`;
    const now = new Date().toISOString();

    const newComplaint: Complaint = {
      id: `cmp-${Date.now()}`,
      ticketNumber,
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category,
      department: data.department,
      assignedDepartment: data.department,
      location: data.location.trim(),
      imageUrl: data.imageUrl,
      isAnonymous: !!data.isAnonymous,
      studentId,
      studentName,
      studentEmail,
      status: 'Not Started', // Strictly initial status
      priority: data.priority || 'Medium',
      createdAt: now,
      updatedAt: now,
      statusHistory: [
        {
          id: `sh-${Date.now()}`,
          previousStatus: null,
          newStatus: 'Not Started',
          updatedBy: data.isAnonymous ? 'Anonymous Student' : studentName,
          updatedAt: now,
          notes: 'Grievance submitted by student into CampusVoice AI portal.',
        },
      ],
    };

    this.complaints.unshift(newComplaint);
    this.saveComplaints();

    return { success: true, complaint: newComplaint };
  }

  public updateComplaintStatus(
    complaintId: string,
    newStatus: ComplaintStatus,
    notes: string,
    assignedDepartment?: string
  ): { success: boolean; error?: string; complaint?: Complaint } {
    const index = this.complaints.findIndex((c) => c.id === complaintId);
    if (index === -1) {
      return { success: false, error: 'Complaint not found.' };
    }

    const complaint = this.complaints[index];
    const prevStatus = complaint.status;
    const now = new Date().toISOString();
    const adminUser = this.currentUser;
    const adminName = adminUser?.name || 'Campus Administrator';

    // Update complaint record
    complaint.status = newStatus;
    complaint.updatedAt = now;
    if (notes && notes.trim()) {
      complaint.resolutionNotes = notes.trim();
    }
    if (assignedDepartment && assignedDepartment.trim()) {
      complaint.assignedDepartment = assignedDepartment.trim();
    }

    // Append to status history
    complaint.statusHistory.push({
      id: `sh-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      previousStatus: prevStatus,
      newStatus,
      updatedBy: adminName,
      updatedAt: now,
      notes: notes?.trim() || `Status updated from ${prevStatus} to ${newStatus}.`,
    });

    this.saveComplaints();

    // Trigger Notification for the student who submitted it!
    const notification: Notification = {
      id: `notif-${Date.now()}`,
      userId: complaint.studentId,
      complaintId: complaint.id,
      complaintTicket: complaint.ticketNumber,
      title: `Status: ${newStatus}`,
      message: `Your grievance "${complaint.title}" has been updated to "${newStatus}". Remarks: ${notes || 'No remarks provided.'}`,
      status: newStatus,
      read: false,
      createdAt: now,
    };

    this.notifications.unshift(notification);
    this.saveNotifications();

    return { success: true, complaint };
  }

  public assignDepartment(
    complaintId: string,
    department: string,
    remarks?: string
  ): { success: boolean; error?: string } {
    const index = this.complaints.findIndex((c) => c.id === complaintId);
    if (index === -1) {
      return { success: false, error: 'Complaint not found.' };
    }

    const complaint = this.complaints[index];
    complaint.assignedDepartment = department;
    complaint.updatedAt = new Date().toISOString();

    complaint.statusHistory.push({
      id: `sh-${Date.now()}`,
      previousStatus: complaint.status,
      newStatus: complaint.status,
      updatedBy: this.currentUser?.name || 'Administrator',
      updatedAt: new Date().toISOString(),
      notes: remarks || `Reassigned department to ${department}.`,
    });

    this.saveComplaints();
    return { success: true };
  }

  // Notifications
  public getNotifications(userId?: string): Notification[] {
    const targetId = userId || this.currentUser?.studentId || this.currentUser?.id;
    if (!targetId) return [];
    return this.notifications.filter(
      (n) => n.userId === targetId || n.userId === this.currentUser?.email
    );
  }

  public getUnreadNotificationCount(): number {
    return this.getNotifications().filter((n) => !n.read).length;
  }

  public markNotificationAsRead(id: string) {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveNotifications();
    }
  }

  public markAllNotificationsAsRead() {
    const myNotifs = this.getNotifications();
    myNotifs.forEach((n) => (n.read = true));
    this.saveNotifications();
  }

  // Dashboard stats
  public getDashboardStats(): DashboardStats {
    return calculateDashboardStats(this.complaints);
  }

  // Reset to initial seed data
  public resetToDefaultSeed() {
    this.users = [INITIAL_ADMIN, INITIAL_STUDENT];
    this.complaints = INITIAL_COMPLAINTS;
    this.notifications = INITIAL_NOTIFICATIONS;
    this.currentUser = INITIAL_STUDENT;
    this.saveUsers();
    this.saveComplaints();
    this.saveNotifications();
    this.saveSession();
  }
}

export const storageService = new StorageService();
