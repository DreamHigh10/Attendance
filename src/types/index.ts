export interface Cohort {
  id: string;
  name: string;
  codePrefix: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  meetingLinkDefault?: string;
}

export interface ClassSession {
  id: string;
  cohortId: string;
  title: string;
  instructorName: string;
  date: string;
  time: string;
  code: string; // Secret word or custom code typed by admin
  isAttendanceOpen: boolean;
  attendanceWindowMinutes?: number;
  attendanceStartTime?: string;
  attendanceEndTime?: string;
  meetingUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  cohortId: string;
  studentEmail: string;
  studentName: string;
  studentPhone?: string;
  status: 'present' | 'late' | 'excused' | 'absent';
  markedAt: string;
  classCodeUsed: string;
  feedback?: string;
}

export interface Student {
  id: string;
  cohortId: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'at_risk' | 'graduated' | 'inactive';
  registeredAt: string;
  notes?: string;
  importedFileId?: string;
}

export interface ImportedFileLog {
  id: string;
  fileName: string;
  fileSize: number;
  recordsCount: number;
  cohortId: string;
  uploadedAt: string;
  uploadedBy: string;
  studentIds: string[];
}

export interface EmailRecipient {
  name: string;
  email: string;
  phone?: string;
  cohort?: string;
  customFields?: Record<string, string>;
}

export interface EmailCampaign {
  id: string;
  title: string;
  subject: string;
  templateBody: string;
  targetCohortId: string;
  sentAt: string;
  recipientCount: number;
  successCount: number;
  failedCount: number;
  logs: {
    recipientName: string;
    recipientEmail: string;
    status: 'delivered' | 'sent' | 'bounced';
    renderedSubject: string;
    renderedBody: string;
    timestamp: string;
  }[];
}

export interface StudentLookupResponse {
  found: boolean;
  message?: string;
  student?: Student;
  attendanceHistory?: {
    record: AttendanceRecord;
    classTitle: string;
    date: string;
  }[];
  totalAttended?: number;
  totalCohortClasses?: number;
  attendanceRate?: number;
}

export interface ClassVerificationResponse {
  valid: boolean;
  message?: string;
  classSession?: ClassSession;
  cohort?: Cohort;
  alreadyMarked?: boolean;
  markedRecord?: AttendanceRecord;
  matchedStudent?: Student;
  isAttendanceOpen?: boolean;
}

export interface BookAssignment {
  id: string;
  cohortId: string;
  title: string;
  author: string;
  description?: string;
  coverUrl?: string;
  fileUrl?: string; // Data URL or storage link for PDF/DOC/EPUB
  fileName?: string;
  fileType?: 'pdf' | 'doc' | 'docx' | 'epub' | string;
  fileSizeBytes?: number;
  totalPages?: number;
  pagesPerDay: number;
  startDate: string;
  stopDate: string;
  deadline: string;
  isActive: boolean;
  createdAt: string;
  additionalDetails?: string;
}

export interface BookAttendanceRecord {
  id: string;
  bookId: string;
  cohortId: string;
  studentEmail: string;
  studentName: string;
  studentPhone?: string;
  pagesReadToday?: number;
  review: string; // Mandatory review on what they learnt
  keyTakeaway?: string;
  rating?: number; // 1 to 5
  markedAt: string;
}
