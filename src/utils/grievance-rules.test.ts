import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateComplaintSubmission,
  isValidStatus,
  maskAnonymousComplaint,
  calculateDashboardStats,
  filterComplaints,
  suggestCategoryAndDepartment,
} from './grievance-rules';
import { Complaint, ComplaintStatus } from '../types';

test('validateComplaintSubmission catches missing or short fields', () => {
  const invalid = validateComplaintSubmission({
    title: 'Bad',
    description: 'Too short',
    category: 'InvalidCat',
    department: '',
    location: '',
  });

  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.title);
  assert.ok(invalid.errors.description);
  assert.ok(invalid.errors.category);
  assert.ok(invalid.errors.department);
  assert.ok(invalid.errors.location);

  const valid = validateComplaintSubmission({
    title: 'Ceiling Fan Not Working in Room 302',
    description: 'The overhead fan has been making strange noises and completely stopped spinning today.',
    category: 'Water and Electricity',
    department: 'Water & Power Works',
    location: 'Science Block, Room 302',
  });

  assert.equal(valid.isValid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});

test('isValidStatus strictly validates the four specified statuses', () => {
  assert.equal(isValidStatus('Not Started'), true);
  assert.equal(isValidStatus('Acknowledged'), true);
  assert.equal(isValidStatus('In Progress'), true);
  assert.equal(isValidStatus('Completed'), true);

  // Invalid or extra statuses must fail
  assert.equal(isValidStatus('Pending'), false);
  assert.equal(isValidStatus('Resolved'), false);
  assert.equal(isValidStatus('Closed'), false);
  assert.equal(isValidStatus(''), false);
});

test('maskAnonymousComplaint redacts identity for admins but retains it for author', () => {
  const mockComplaint: Complaint = {
    id: 'c-1',
    ticketNumber: 'CV-2026-0001',
    title: 'Harassment complaint',
    description: 'Confidential report regarding misconduct.',
    category: 'Harassment or Misconduct',
    department: 'Student Welfare & Discipline',
    location: 'Main Auditorium',
    isAnonymous: true,
    studentId: 'STU-98765',
    studentName: 'Jane Doe',
    studentEmail: 'jane.doe@campus.edu',
    status: 'Not Started',
    assignedDepartment: 'Student Welfare & Discipline',
    priority: 'Critical',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    statusHistory: [],
  };

  // Masked for admin
  const maskedForAdmin = maskAnonymousComplaint(mockComplaint, 'admin');
  assert.equal(maskedForAdmin.studentName, 'Anonymous Student [Protected Identity]');
  assert.equal(maskedForAdmin.studentId, 'REDACTED');
  assert.equal(maskedForAdmin.studentEmail, undefined);

  // Masked for another student
  const maskedForOther = maskAnonymousComplaint(mockComplaint, 'student', 'STU-11111');
  assert.equal(maskedForOther.studentName, 'Anonymous Student [Protected Identity]');

  // Visible to author
  const authorView = maskAnonymousComplaint(mockComplaint, 'student', 'STU-98765');
  assert.equal(authorView.studentName, 'Jane Doe');
  assert.equal(authorView.studentId, 'STU-98765');
});

test('calculateDashboardStats computes accurate breakdown and rate', () => {
  const mockComplaints: Complaint[] = [
    {
      id: '1',
      ticketNumber: 'CV-01',
      title: 'Issue 1',
      description: 'Desc 1',
      category: 'Infrastructure',
      department: 'Facilities',
      location: 'Block A',
      isAnonymous: false,
      studentId: 'S1',
      studentName: 'Alex',
      status: 'Not Started',
      assignedDepartment: 'Facilities',
      priority: 'Medium',
      createdAt: '',
      updatedAt: '',
      statusHistory: [],
    },
    {
      id: '2',
      ticketNumber: 'CV-02',
      title: 'Issue 2',
      description: 'Desc 2',
      category: 'Cleanliness',
      department: 'Facilities',
      location: 'Block B',
      isAnonymous: true,
      studentId: 'S2',
      studentName: 'Bob',
      status: 'Acknowledged',
      assignedDepartment: 'Facilities',
      priority: 'High',
      createdAt: '',
      updatedAt: '',
      statusHistory: [],
    },
    {
      id: '3',
      ticketNumber: 'CV-03',
      title: 'Issue 3',
      description: 'Desc 3',
      category: 'Water and Electricity',
      department: 'Power',
      location: 'Hostel 3',
      isAnonymous: true,
      studentId: 'S3',
      studentName: 'Charlie',
      status: 'Completed',
      assignedDepartment: 'Power',
      priority: 'Low',
      createdAt: '',
      updatedAt: '',
      statusHistory: [],
    },
  ];

  const stats = calculateDashboardStats(mockComplaints);
  assert.equal(stats.total, 3);
  assert.equal(stats.notStarted, 1);
  assert.equal(stats.acknowledged, 1);
  assert.equal(stats.inProgress, 0);
  assert.equal(stats.completed, 1);
  assert.equal(stats.anonymousCount, 2);
  assert.equal(stats.urgentCount, 1);
  assert.equal(stats.resolutionRate, 33); // 1 / 3 = 33%
  assert.equal(stats.categoryCounts.Infrastructure, 1);
  assert.equal(stats.categoryCounts.Cleanliness, 1);
  assert.equal(stats.categoryCounts['Water and Electricity'], 1);
});

test('suggestCategoryAndDepartment detects issues intelligently', () => {
  const waterRes = suggestCategoryAndDepartment('There is heavy water leakage from the pipe in the first floor washroom');
  assert.equal(waterRes.suggestedCategory, 'Water and Electricity');

  const harassRes = suggestCategoryAndDepartment('Senior students are constantly threatening and bullying freshmen outside the hostel');
  assert.equal(harassRes.suggestedCategory, 'Harassment or Misconduct');
  assert.equal(harassRes.suggestedPriority, 'Critical');
});
