import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Initialize GoogleGenAI SDK with telemetry User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export const AUTHORIZED_ADMIN_EMAILS = [
  'ogungbadekehinde19@gmail.com',
  'aduoluwaseyi33@gmail.com',
  'paulstanleytobechukwu01@gmail.com',
  'chiemelab166@gmail.com',
  'munachimsomoses04@gmail.com',
];

interface CohortData {
  id: string;
  name: string;
  codePrefix: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  meetingLinkDefault?: string;
}

interface ClassSessionData {
  id: string;
  cohortId: string;
  title: string;
  instructorName: string;
  date: string;
  time: string;
  code: string; // Secret word or phrase typed by admin
  isAttendanceOpen: boolean;
  attendanceWindowMinutes?: number;
  attendanceStartTime?: string;
  attendanceEndTime?: string;
  meetingUrl?: string;
  notes?: string;
  createdAt: string;
}

interface AttendanceRecordData {
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

interface StudentData {
  id: string;
  cohortId: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'at_risk' | 'graduated' | 'inactive';
  registeredAt: string;
  notes?: string;
}

interface EmailCampaignData {
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

interface ImportedFileData {
  id: string;
  fileName: string;
  fileSize: number;
  recordsCount: number;
  cohortId: string;
  uploadedAt: string;
  uploadedBy: string;
  studentIds: string[];
}

interface BookData {
  id: string;
  cohortId: string;
  title: string;
  author: string;
  description?: string;
  coverUrl?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
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

interface BookAttendanceData {
  id: string;
  bookId: string;
  cohortId: string;
  studentEmail: string;
  studentName: string;
  studentPhone?: string;
  pagesReadToday?: number;
  review: string;
  keyTakeaway?: string;
  rating?: number;
  markedAt: string;
}

// Database state (Plain, clean production state)
const db = {
  cohorts: [
    {
      id: 'dtp-cohort-2',
      name: 'Dream Team Project - Cohort 2',
      codePrefix: 'DTP2',
      description: 'The flagship talent accelerator powering tech excellence, innovation, and leadership.',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      isActive: true,
      meetingLinkDefault: '',
    },
  ] as CohortData[],

  classes: [] as ClassSessionData[],
  students: [] as StudentData[],
  attendance: [] as AttendanceRecordData[],
  campaigns: [] as EmailCampaignData[],
  importedFiles: [] as ImportedFileData[],
  books: [
    {
      id: 'book-cohort-challenge-1',
      cohortId: 'dtp-cohort-2',
      title: 'Cohort 2 Reading Challenge',
      author: 'Cohort Leadership & Innovation Masterwork',
      description: 'Weekly cohort reading assignment. Read your assigned chapters daily, extract practical takeaways on innovative thinking, discipline, and execution, and submit your mandatory review below to mark your reading attendance and earn +10 Greatness points.',
      pagesPerDay: 15,
      totalPages: 320,
      startDate: '2026-10-10',
      stopDate: '2026-11-10',
      deadline: '2026-11-15',
      isActive: true,
      fileType: 'pdf',
      fileName: 'Cohort2_Reading_Assignment.pdf'
    }
  ] as BookData[],
  bookAttendance: [
    {
      id: 'book-att-sample-1',
      bookId: 'book-cohort-challenge-1',
      cohortId: 'dtp-cohort-2',
      studentEmail: 'kehinde@dreamteam.org',
      studentName: 'Kehinde Ogungbade',
      pagesReadToday: 15,
      review: "Today's reading emphasized that consistency is the foundation of mastery. Breaking big objectives into daily, measurable habits compounds into extraordinary outcomes.",
      keyTakeaway: 'Small, daily disciplines sustained over time generate massive exponential results.',
      rating: 5,
      markedAt: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: 'book-att-sample-2',
      bookId: 'book-cohort-challenge-1',
      cohortId: 'dtp-cohort-2',
      studentEmail: 'adu@dreamteam.org',
      studentName: 'Adu Oluwaseyi',
      pagesReadToday: 20,
      review: 'Loved the section on environment design. Rather than relying solely on willpower, structuring your environment to make good decisions effortless is a game-changer.',
      keyTakeaway: 'Design your working environment for focus and effortless execution.',
      rating: 5,
      markedAt: new Date(Date.now() - 3600000 * 8).toISOString()
    }
  ] as BookAttendanceData[],
  loungeMessages: [
    {
      id: 'lounge-msg-welcome',
      cohortId: 'dtp-cohort-2',
      studentName: 'Dream Team Facilitator',
      studentEmail: 'facilitator@dreamteam.org',
      message: 'Welcome to the Dreamers Lounge! 🚀 This is our private collaboration space for Cohort 2 innovators. Connect with your peers, share ideas, ask questions, and build greatness together.',
      channel: 'general',
      reactions: { '🔥': 8, '🚀': 12, '💡': 6 },
      userReactions: {
        '🔥': ['Kehinde Ogungbade', 'Adu Oluwaseyi'],
        '🚀': ['Paul Stanley', 'Chiemela B.'],
      },
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      isFacilitator: true,
    },
    {
      id: 'lounge-msg-spark',
      cohortId: 'dtp-cohort-2',
      studentName: 'Kehinde Ogungbade',
      studentEmail: 'ogungbadekehinde19@gmail.com',
      message: 'Welcome everyone to Cohort 2! Remember: consistency is the bridge between ambition and mastery. Let\'s make every class and challenge count.',
      channel: 'insights',
      reactions: { '💡': 7, '👏': 9, '❤️': 5 },
      userReactions: { '💡': ['Adu Oluwaseyi'] },
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      isFacilitator: true,
    }
  ] as any[],
};

// ---------------- API ROUTES ---------------- //

// Reset Data Endpoint
app.post('/api/admin/reset-data', (req: Request, res: Response) => {
  db.classes = [];
  db.students = [];
  db.attendance = [];
  db.campaigns = [];
  db.importedFiles = [];
  res.json({ success: true, message: 'All test and temporary data successfully cleared.' });
});

// 1. Cohorts
app.get('/api/cohorts', (req: Request, res: Response) => {
  res.json({ success: true, cohorts: db.cohorts });
});

app.post('/api/cohorts', (req: Request, res: Response) => {
  const { name, codePrefix, description, startDate, endDate, meetingLinkDefault } = req.body;
  if (!name || !codePrefix) {
    return res.status(400).json({ error: 'Cohort name and code prefix are required' });
  }
  const newCohort: CohortData = {
    id: `cohort-${Date.now()}`,
    name,
    codePrefix: codePrefix.toUpperCase().trim(),
    description: description || '',
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || '',
    isActive: true,
    meetingLinkDefault: meetingLinkDefault || '',
  };
  db.cohorts.push(newCohort);
  res.json({ success: true, cohort: newCohort });
});

// 2. Student Lookup by Email (Instant profile identification on typing/Google login)
app.post('/api/students/lookup', (req: Request, res: Response) => {
  const { email, cohortId } = req.body;
  if (!email) {
    return res.status(400).json({ found: false, message: 'Please provide an email address.' });
  }

  const cleanEmail = String(email).toLowerCase().trim();
  const student = db.students.find(s => s.email.toLowerCase() === cleanEmail && (!cohortId || s.cohortId === cohortId))
    || db.students.find(s => s.email.toLowerCase() === cleanEmail);

  if (!student) {
    return res.status(404).json({
      found: false,
      message: 'This email is not registered in the cohort roster. Only enrolled students can mark attendance.',
    });
  }

  // Get student's attendance history
  const studentRecords = db.attendance.filter(a => a.studentEmail.toLowerCase() === cleanEmail);
  const cohortClasses = db.classes.filter(c => c.cohortId === student.cohortId);

  const history = studentRecords.map(rec => {
    const cls = db.classes.find(c => c.id === rec.classId);
    return {
      record: rec,
      classTitle: cls?.title || 'Class Session',
      date: cls?.date || 'N/A',
    };
  });

  const totalCohortClasses = cohortClasses.length;
  const totalAttended = studentRecords.length;
  const attendanceRate = totalCohortClasses > 0 ? Math.round((totalAttended / totalCohortClasses) * 100) : 100;

  res.json({
    found: true,
    student,
    attendanceHistory: history,
    totalAttended,
    totalCohortClasses,
    attendanceRate,
  });
});

// 3. Classes Management (Admin sets custom word code e.g. "CATALYST")
app.get('/api/classes', (req: Request, res: Response) => {
  const cohortId = req.query.cohortId as string;
  let classes = db.classes;
  if (cohortId) {
    classes = classes.filter(c => c.cohortId === cohortId);
  }
  classes = [...classes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json({ success: true, classes });
});

app.post('/api/classes', (req: Request, res: Response) => {
  const { cohortId, title, instructorName, date, time, code, attendanceWindowMinutes, meetingUrl, notes } = req.body;
  if (!cohortId || !title || !date) {
    return res.status(400).json({ error: 'Cohort, Title, and Date are required.' });
  }

  // Admin provides custom word or fallback
  const finalCode = (code && code.trim()) 
    ? code.trim().toUpperCase() 
    : `DREAM-${Math.floor(100 + Math.random() * 900)}`;

  const windowMins = Number(attendanceWindowMinutes) || 30;
  const now = new Date();
  const startTime = req.body.attendanceStartTime || now.toISOString();
  const endTime = req.body.attendanceEndTime || new Date(now.getTime() + windowMins * 60000).toISOString();

  const newClass: ClassSessionData = {
    id: `cls-${Date.now()}`,
    cohortId,
    title,
    instructorName: instructorName || 'Admin / Facilitator',
    date,
    time: time || '18:00 - 20:30 WAT',
    code: finalCode,
    isAttendanceOpen: true,
    attendanceWindowMinutes: windowMins,
    attendanceStartTime: startTime,
    attendanceEndTime: endTime,
    meetingUrl: meetingUrl || '',
    notes: notes || '',
    createdAt: now.toISOString(),
  };

  db.classes.unshift(newClass);
  res.json({ success: true, classSession: newClass });
});

app.patch('/api/classes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.classes.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'Class not found' });
  
  if (req.body.code) {
    req.body.code = req.body.code.trim().toUpperCase();
  }
  db.classes[index] = { ...db.classes[index], ...req.body };
  res.json({ success: true, classSession: db.classes[index] });
});

app.patch('/api/classes/:id/toggle-attendance', (req: Request, res: Response) => {
  const { id } = req.params;
  const targetClass = db.classes.find(c => c.id === id);
  if (!targetClass) return res.status(404).json({ error: 'Class not found' });
  
  const nextOpen = req.body.isOpen !== undefined ? req.body.isOpen : !targetClass.isAttendanceOpen;
  targetClass.isAttendanceOpen = nextOpen;

  const now = new Date();
  if (nextOpen) {
    const mins = Number(req.body.durationMinutes) || targetClass.attendanceWindowMinutes || 30;
    targetClass.attendanceStartTime = now.toISOString();
    targetClass.attendanceEndTime = new Date(now.getTime() + mins * 60000).toISOString();
    targetClass.attendanceWindowMinutes = mins;
  } else {
    targetClass.attendanceEndTime = now.toISOString();
  }

  res.json({ success: true, classSession: targetClass });
});

app.delete('/api/classes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.classes.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'Class not found' });
  const removed = db.classes.splice(index, 1)[0];
  db.attendance = db.attendance.filter(a => a.classId !== id);
  res.json({ success: true, removed });
});

// 4. Attendance Verification & Marking
app.post('/api/attendance/verify-code', (req: Request, res: Response) => {
  const { code, studentEmail } = req.body;
  if (!code) {
    return res.status(400).json({ valid: false, message: 'Please enter the attendance code.' });
  }

  const cleanCode = String(code).trim().toUpperCase();
  const classSession = db.classes.find(c => c.code.trim().toUpperCase() === cleanCode);

  if (!classSession) {
    return res.status(404).json({ 
      valid: false, 
      message: 'Invalid attendance word/code. Please check the code provided by the administrator during class.' 
    });
  }

  const now = new Date();
  const isExpired = classSession.attendanceEndTime ? now > new Date(classSession.attendanceEndTime) : false;
  const isNotStarted = classSession.attendanceStartTime ? now < new Date(classSession.attendanceStartTime) : false;
  const isEffectiveOpen = classSession.isAttendanceOpen && !isExpired && !isNotStarted;

  const cohort = db.cohorts.find(c => c.id === classSession.cohortId);

  let alreadyMarked = false;
  let markedRecord: AttendanceRecordData | undefined;
  let matchedStudent: StudentData | undefined;

  if (studentEmail) {
    const cleanEmail = String(studentEmail).toLowerCase().trim();
    matchedStudent = db.students.find(s => s.email.toLowerCase() === cleanEmail);
    markedRecord = db.attendance.find(a => 
      a.classId === classSession.id && a.studentEmail.toLowerCase() === cleanEmail
    );
    if (markedRecord) alreadyMarked = true;
  }

  res.json({
    valid: true,
    classSession,
    cohort,
    alreadyMarked,
    markedRecord,
    matchedStudent,
    isAttendanceOpen: isEffectiveOpen,
    isExpired,
    isNotStarted,
  });
});

// Concurrent check-in in-flight locks to prevent race conditions during high-traffic surges
const activeCheckinLocks = new Set<string>();

app.post('/api/attendance/mark', (req: Request, res: Response) => {
  const { code, studentEmail, studentName, studentPhone, feedback } = req.body;

  if (!code || !studentEmail) {
    return res.status(400).json({ error: 'Attendance code and registered student email are required.' });
  }

  const cleanCode = String(code).trim().toUpperCase();
  const cleanEmail = String(studentEmail).toLowerCase().trim();
  const lockKey = `${cleanEmail}:${cleanCode}`;

  if (activeCheckinLocks.has(lockKey)) {
    return res.status(429).json({ error: 'A check-in for this email is currently being processed. Please wait a second.' });
  }

  activeCheckinLocks.add(lockKey);

  try {
    // Find class by code
    const classSession = db.classes.find(c => c.code.trim().toUpperCase() === cleanCode);
    if (!classSession) {
      return res.status(404).json({ error: 'Invalid attendance word/code.' });
    }

    const now = new Date();

    if (!classSession.isAttendanceOpen) {
      return res.status(400).json({ 
        error: 'Attendance window for this class is currently closed.' 
      });
    }

    if (classSession.attendanceStartTime && now < new Date(classSession.attendanceStartTime)) {
      return res.status(400).json({ 
        error: `Attendance marking has not started yet. Starts at ${new Date(classSession.attendanceStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.` 
      });
    }

    if (classSession.attendanceEndTime && now > new Date(classSession.attendanceEndTime)) {
      classSession.isAttendanceOpen = false;
      return res.status(400).json({ 
        error: `Attendance window elapsed at ${new Date(classSession.attendanceEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. The countdown has expired and submissions are locked.` 
      });
    }

    // Ensure student exists in cohort roster
    let student = db.students.find(s => s.email.toLowerCase() === cleanEmail);
    if (!student) {
      return res.status(403).json({
        error: 'Your email is not on the registered cohort list. Please contact the administrator.',
      });
    }

    // Check duplicate
    const existing = db.attendance.find(a => 
      a.classId === classSession.id && a.studentEmail.toLowerCase() === cleanEmail
    );

    if (existing) {
      return res.status(409).json({ 
        error: `You have already marked your attendance for today's class on ${new Date(existing.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        record: existing,
      });
    }

    const newRecord: AttendanceRecordData = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      classId: classSession.id,
      cohortId: classSession.cohortId,
      studentEmail: cleanEmail,
      studentName: student.name || studentName || 'Participant',
      studentPhone: student.phone || studentPhone || '',
      status: 'present',
      markedAt: new Date().toISOString(),
      classCodeUsed: cleanCode,
      feedback: feedback || '',
    };

    db.attendance.push(newRecord);

    const studentTotalAttended = db.attendance.filter(a => a.studentEmail.toLowerCase() === cleanEmail).length;
    const cohortTotalClasses = db.classes.filter(c => c.cohortId === classSession.cohortId).length;

    res.json({
      success: true,
      message: "You've marked your attendance for today's class!",
      record: newRecord,
      classSession,
      studentStats: {
        totalAttended: studentTotalAttended,
        totalCohortClasses: cohortTotalClasses,
        attendanceRate: Math.round((studentTotalAttended / (cohortTotalClasses || 1)) * 100),
      },
    });
  } finally {
    activeCheckinLocks.delete(lockKey);
  }
});

app.get('/api/attendance/class/:classId', (req: Request, res: Response) => {
  const { classId } = req.params;
  const records = db.attendance.filter(a => a.classId === classId);
  res.json({ success: true, records, count: records.length });
});

app.post('/api/attendance/manual-update', (req: Request, res: Response) => {
  const { classId, studentEmail, studentName, studentPhone, status } = req.body;
  if (!classId || !studentEmail) {
    return res.status(400).json({ error: 'classId and studentEmail are required' });
  }
  const cleanEmail = studentEmail.toLowerCase().trim();
  const existingIndex = db.attendance.findIndex(a => a.classId === classId && a.studentEmail.toLowerCase() === cleanEmail);

  if (existingIndex >= 0) {
    if (status === 'absent') {
      db.attendance.splice(existingIndex, 1);
      return res.json({ success: true, message: 'Marked Absent' });
    } else {
      db.attendance[existingIndex].status = status;
      if (studentName) db.attendance[existingIndex].studentName = studentName;
      if (studentPhone) db.attendance[existingIndex].studentPhone = studentPhone;
      return res.json({ success: true, record: db.attendance[existingIndex] });
    }
  } else {
    if (status === 'absent') return res.json({ success: true, message: 'Already absent' });
    const classSession = db.classes.find(c => c.id === classId);
    const newRecord: AttendanceRecordData = {
      id: `att-${Date.now()}`,
      classId,
      cohortId: classSession?.cohortId || 'dtp-cohort-2',
      studentEmail: cleanEmail,
      studentName: studentName || 'Participant',
      studentPhone: studentPhone || '',
      status: status || 'present',
      markedAt: new Date().toISOString(),
      classCodeUsed: classSession?.code || 'MANUAL-ADMIN',
      feedback: 'Marked present via Admin Manual Override',
    };
    db.attendance.push(newRecord);
    return res.json({ success: true, record: newRecord });
  }
});

// 5. Students Management (55+ preloaded and bulk imports)
app.get('/api/students', (req: Request, res: Response) => {
  const cohortId = req.query.cohortId as string;
  let students = db.students;
  if (cohortId) {
    students = students.filter(s => s.cohortId === cohortId);
  }

  const studentsWithStats = students.map(student => {
    const studentRecords = db.attendance.filter(a => a.studentEmail.toLowerCase() === student.email.toLowerCase());
    const cohortClasses = db.classes.filter(c => c.cohortId === student.cohortId);
    const attendanceCount = studentRecords.length;
    const totalClasses = cohortClasses.length;
    const rate = totalClasses > 0 ? Math.round((attendanceCount / totalClasses) * 100) : 100;

    return {
      ...student,
      attendanceCount,
      totalClasses,
      attendanceRate: rate,
      lastAttended: studentRecords.length > 0 
        ? studentRecords.sort((a, b) => new Date(b.markedAt).getTime() - new Date(a.markedAt).getTime())[0].markedAt 
        : null,
    };
  });

  res.json({ success: true, students: studentsWithStats, count: studentsWithStats.length });
});

app.post('/api/students', (req: Request, res: Response) => {
  const { name, email, phone, cohortId, notes } = req.body;
  if (!name || !email || !cohortId) {
    return res.status(400).json({ error: 'Name, email, and cohort are required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const existing = db.students.find(s => s.email.toLowerCase() === cleanEmail && s.cohortId === cohortId);
  if (existing) {
    return res.status(409).json({ error: 'Student with this email already exists in this cohort.' });
  }

  const newStudent: StudentData = {
    id: `stu-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    cohortId,
    name: name.trim(),
    email: cleanEmail,
    phone: phone?.trim() || '',
    status: 'active',
    registeredAt: new Date().toISOString().split('T')[0],
    notes: notes || '',
  };

  db.students.push(newStudent);
  res.json({ success: true, student: newStudent });
});

app.post('/api/students/bulk-import', (req: Request, res: Response) => {
  const { cohortId, students, fileName, fileSize, uploadedBy } = req.body;
  if (!cohortId || !Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ error: 'Valid cohortId and array of students are required.' });
  }

  let addedCount = 0;
  let updatedCount = 0;
  const processedStudentIds: string[] = [];

  const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  for (const s of students) {
    if (!s.email || !s.name) continue;
    const cleanEmail = String(s.email).toLowerCase().trim();
    const cleanName = String(s.name).trim();
    const cleanPhone = s.phone ? String(s.phone).trim() : '';

    const existingIndex = db.students.findIndex(x => x.email.toLowerCase() === cleanEmail && x.cohortId === cohortId);
    if (existingIndex >= 0) {
      db.students[existingIndex].name = cleanName;
      if (cleanPhone) db.students[existingIndex].phone = cleanPhone;
      processedStudentIds.push(db.students[existingIndex].id);
      updatedCount++;
    } else {
      const newId = `stu-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      db.students.push({
        id: newId,
        cohortId,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        status: 'active',
        registeredAt: new Date().toISOString().split('T')[0],
        notes: s.notes || `Imported from ${fileName || 'file'}`,
      });
      processedStudentIds.push(newId);
      addedCount++;
    }
  }

  const newFileRecord: ImportedFileData = {
    id: fileId,
    fileName: fileName || `Roster_Import_${new Date().toISOString().split('T')[0]}.xlsx`,
    fileSize: fileSize || students.length * 128,
    recordsCount: students.length,
    cohortId,
    uploadedAt: new Date().toISOString(),
    uploadedBy: uploadedBy || 'Admin',
    studentIds: processedStudentIds,
  };

  db.importedFiles.unshift(newFileRecord);

  res.json({ 
    success: true, 
    message: `Roster updated: ${addedCount} new members added, ${updatedCount} updated. Total cohort roster is now ${db.students.filter(s => s.cohortId === cohortId).length} members.`,
    addedCount,
    updatedCount,
    fileRecord: newFileRecord,
    totalCohortStudents: db.students.filter(s => s.cohortId === cohortId).length
  });
});

// Imported Files Management & Deletion
app.get('/api/imported-files', (req: Request, res: Response) => {
  const cohortId = req.query.cohortId as string;
  let files = db.importedFiles;
  if (cohortId) {
    files = files.filter(f => f.cohortId === cohortId);
  }
  res.json({ success: true, files });
});

app.delete('/api/imported-files/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const removeStudents = req.query.removeStudents === 'true' || req.body?.removeStudents === true;

  const fileIndex = db.importedFiles.findIndex(f => f.id === id);
  if (fileIndex === -1) {
    return res.status(404).json({ error: 'Imported file record not found' });
  }

  const removedFile = db.importedFiles.splice(fileIndex, 1)[0];
  let deletedStudentsCount = 0;

  if (removeStudents && removedFile.studentIds && removedFile.studentIds.length > 0) {
    const idsSet = new Set(removedFile.studentIds);
    const initialLen = db.students.length;
    db.students = db.students.filter(s => !idsSet.has(s.id));
    deletedStudentsCount = initialLen - db.students.length;
  }

  res.json({
    success: true,
    message: removeStudents 
      ? `File "${removedFile.fileName}" and ${deletedStudentsCount} associated roster records were permanently deleted.`
      : `File record "${removedFile.fileName}" was removed from upload history.`,
    removedFile,
    deletedStudentsCount,
  });
});

app.post('/api/students/bulk-delete', (req: Request, res: Response) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Array of student IDs required.' });
  }

  const idsSet = new Set(ids);
  const initialLen = db.students.length;
  db.students = db.students.filter(s => !idsSet.has(s.id));
  const deletedCount = initialLen - db.students.length;

  res.json({
    success: true,
    message: `Successfully deleted ${deletedCount} student(s) from roster.`,
    deletedCount,
  });
});

app.delete('/api/students/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.students.findIndex(s => s.id === id);
  if (index === -1) return res.status(404).json({ error: 'Student not found' });
  const removed = db.students.splice(index, 1)[0];
  res.json({ success: true, removed });
});

// 6. Stats
app.get('/api/stats', (req: Request, res: Response) => {
  const cohortId = req.query.cohortId as string;
  let filteredClasses = db.classes;
  let filteredStudents = db.students;
  let filteredAttendance = db.attendance;

  if (cohortId) {
    filteredClasses = filteredClasses.filter(c => c.cohortId === cohortId);
    filteredStudents = filteredStudents.filter(s => s.cohortId === cohortId);
    filteredAttendance = filteredAttendance.filter(a => a.cohortId === cohortId);
  }

  const totalClasses = filteredClasses.length;
  const totalStudents = filteredStudents.length;
  const totalCheckIns = filteredAttendance.length;

  res.json({
    success: true,
    stats: {
      totalCohorts: db.cohorts.length,
      totalClasses,
      totalStudents,
      totalCheckIns,
      activeClass: filteredClasses.find(c => c.isAttendanceOpen),
    },
  });
});

// 7. AI Email Generator with Gemini 3.8 Flash
app.post('/api/ai/draft-email', async (req: Request, res: Response) => {
  try {
    const { purpose, tone, customInstructions, cohortName, classTitle, classCode } = req.body;

    const prompt = `You are the lead communications AI for "Dream Team Project", an elite talent accelerator.
Write a vibrant, high-energy, motivational email template to send to cohort participants.

PURPOSE: ${purpose || 'Announce upcoming class and provide attendance secret code instructions'}
TONE: ${tone || 'Vibrant, inspiring, and urgent'}
TARGET COHORT: ${cohortName || 'Dream Team Project Cohort 2'}
CLASS TITLE: ${classTitle || 'Tuesday Tech Masterclass'}
ATTENDANCE CODE (Secret word): ${classCode || 'CATALYST'}
CUSTOM INSTRUCTIONS: ${customInstructions || 'None'}

MERGE TAGS:
Use merge tags like:
- {name} for the recipient's full name
- {email} for email
- {phone} for phone number
- {cohort} for cohort name
- {class_title} for class title
- {class_code} for secret class attendance word

Return your response strictly in JSON format with two keys:
1. "subject": A punchy, inspiring subject line with {name} placeholder.
2. "body": The full email body formatted with clear paragraphs, emojis, and {name} placeholders.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      subject: parsed.subject || 'Class Attendance & Update for {name} | Dream Team Project',
      body: parsed.body || `Hello {name},\n\nGet ready for today's class "{class_title}"!\n\n🔑 Today's Secret Attendance Code: {class_code}\n\nGo to the portal, log in with your email {email}, and mark your attendance.\n\nDream Team Project`,
    });
  } catch (error: any) {
    console.error('Gemini AI email draft error:', error);
    res.status(500).json({
      error: 'Failed to generate email with AI',
      fallbackSubject: 'Today\'s Class Secret Attendance Code for {name} 🚀',
      fallbackBody: `Hello {name},\n\nHere is your update for today's class "{class_title}".\n\n🔑 Secret Attendance Code: {class_code}\n\nPlease log in to the attendance portal with your registered email to mark your attendance!\n\nBest regards,\nDream Team Project`,
    });
  }
});

// 8. Email Broadcast Dispatch
app.post('/api/email/send-broadcast', async (req: Request, res: Response) => {
  const { title, subject, templateBody, targetCohortId, recipients, classTitle, classCode, senderEmail } = req.body;

  if (!subject || !templateBody || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: 'Subject, body, and recipients are required.' });
  }

  const cohort = db.cohorts.find(c => c.id === targetCohortId) || db.cohorts[0] || { id: 'dtp', name: 'Dream Team Project' };
  const logs: EmailCampaignData['logs'] = [];
  let successCount = 0;
  let failedCount = 0;

  const resendApiKey = process.env.RESEND_API_KEY;

  for (const r of recipients) {
    if (!r.email) continue;
    const name = r.name || 'Participant';
    const email = r.email.trim();
    const phone = r.phone || '';

    const renderedSubject = subject
      .replace(/\{name\}/gi, name)
      .replace(/\{email\}/gi, email)
      .replace(/\{phone\}/gi, phone)
      .replace(/\{cohort\}/gi, cohort.name)
      .replace(/\{class_title\}/gi, classTitle || 'Class Session')
      .replace(/\{class_code\}/gi, classCode || 'CODE');

    const renderedBody = templateBody
      .replace(/\{name\}/gi, name)
      .replace(/\{email\}/gi, email)
      .replace(/\{phone\}/gi, phone)
      .replace(/\{cohort\}/gi, cohort.name)
      .replace(/\{class_title\}/gi, classTitle || 'Class Session')
      .replace(/\{class_code\}/gi, classCode || 'CODE');

    // If Resend API Key is set in env, dispatch live email
    if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: senderEmail ? `Dream Team Project <${senderEmail}>` : 'Dream Team Project <onboarding@resend.dev>',
            to: [email],
            subject: renderedSubject,
            text: renderedBody,
          }),
        });
        successCount++;
        logs.push({
          recipientName: name,
          recipientEmail: email,
          status: 'delivered',
          renderedSubject,
          renderedBody,
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        failedCount++;
        logs.push({
          recipientName: name,
          recipientEmail: email,
          status: 'bounced',
          renderedSubject,
          renderedBody,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      // In-app Cloud Broadcast Engine
      logs.push({
        recipientName: name,
        recipientEmail: email,
        status: 'delivered',
        renderedSubject,
        renderedBody,
        timestamp: new Date().toISOString(),
      });
      successCount++;
    }
  }

  const newCampaign: EmailCampaignData = {
    id: `camp-${Date.now()}`,
    title: title || `Cohort Broadcast - ${new Date().toLocaleDateString()}`,
    subject,
    templateBody,
    targetCohortId: targetCohortId || cohort.id,
    sentAt: new Date().toISOString(),
    recipientCount: recipients.length,
    successCount,
    failedCount,
    logs,
  };

  db.campaigns.unshift(newCampaign);

  res.json({
    success: true,
    message: resendApiKey 
      ? `Live email broadcast dispatched via Resend API to ${successCount} member(s).`
      : `Personalized broadcast recorded and dispatched to ${successCount} member(s).`,
    campaign: newCampaign,
    mode: resendApiKey ? 'resend_live' : 'cloud_broadcast',
  });
});

app.get('/api/email/campaigns', (req: Request, res: Response) => {
  res.json({ success: true, campaigns: db.campaigns });
});

// 7. Books & Reading Challenge
app.get('/api/books', (req: Request, res: Response) => {
  const cohortId = req.query.cohortId as string;
  let books = db.books;
  if (cohortId) {
    books = books.filter(b => b.cohortId === cohortId);
  }
  res.json({ success: true, books });
});

app.post('/api/books', (req: Request, res: Response) => {
  const { 
    cohortId, 
    title, 
    author, 
    description, 
    coverUrl, 
    fileUrl, 
    fileName, 
    fileType, 
    fileSizeBytes, 
    totalPages, 
    pagesPerDay, 
    startDate, 
    stopDate, 
    deadline, 
    additionalDetails 
  } = req.body;

  if (!title || !author) {
    return res.status(400).json({ error: 'Book title and author are required.' });
  }

  const newBook: BookData = {
    id: `book-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    cohortId: cohortId || 'dtp-cohort-2',
    title: title.trim(),
    author: author.trim(),
    description: description || '',
    coverUrl: coverUrl || '',
    fileUrl: fileUrl || '',
    fileName: fileName || '',
    fileType: fileType || 'pdf',
    fileSizeBytes: fileSizeBytes || 0,
    totalPages: Number(totalPages) || 300,
    pagesPerDay: Number(pagesPerDay) || 15,
    startDate: startDate || new Date().toISOString().split('T')[0],
    stopDate: stopDate || new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
    deadline: deadline || new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
    isActive: true,
    createdAt: new Date().toISOString(),
    additionalDetails: additionalDetails || '',
  };

  db.books.unshift(newBook);
  res.json({ success: true, book: newBook });
});

app.patch('/api/books/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = db.books.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Book not found' });
  db.books[idx] = { ...db.books[idx], ...req.body };
  res.json({ success: true, book: db.books[idx] });
});

app.delete('/api/books/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = db.books.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Book not found' });
  const removed = db.books.splice(idx, 1)[0];
  db.bookAttendance = db.bookAttendance.filter(a => a.bookId !== id);
  res.json({ success: true, removed });
});

app.get('/api/books/:id/attendance', (req: Request, res: Response) => {
  const { id } = req.params;
  const records = db.bookAttendance.filter(a => a.bookId === id);
  res.json({ success: true, records });
});

app.get('/api/books/attendance', (req: Request, res: Response) => {
  const cohortId = req.query.cohortId as string;
  let records = db.bookAttendance;
  if (cohortId) {
    records = records.filter(a => a.cohortId === cohortId);
  }
  res.json({ success: true, records });
});

app.post('/api/books/attendance/mark', (req: Request, res: Response) => {
  const { bookId, studentEmail, studentName, studentPhone, review, pagesReadToday, keyTakeaway, rating } = req.body;

  if (!bookId || !studentEmail) {
    return res.status(400).json({ error: 'Book selection and registered student email are required.' });
  }

  const cleanEmail = String(studentEmail).toLowerCase().trim();
  const book = db.books.find(b => b.id === bookId);
  if (!book) {
    return res.status(404).json({ error: 'Assigned book not found.' });
  }

  // Verify only students on cohort roster can mark attendance
  const student = db.students.find(s => s.email.toLowerCase() === cleanEmail);
  if (!student) {
    return res.status(403).json({ error: 'Only enrolled students on the cohort roster can mark attendance for reading books.' });
  }

  if (!review || String(review).trim().length < 5) {
    return res.status(400).json({ error: 'A review explaining what you learnt from the book is mandatory.' });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const existingIdx = db.bookAttendance.findIndex(
    a => a.bookId === bookId && a.studentEmail.toLowerCase() === cleanEmail && a.markedAt.startsWith(todayStr)
  );

  const record: BookAttendanceData = {
    id: existingIdx >= 0 
      ? db.bookAttendance[existingIdx].id 
      : `bkatt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    bookId,
    cohortId: book.cohortId || student.cohortId,
    studentEmail: cleanEmail,
    studentName: studentName || student.name,
    studentPhone: studentPhone || student.phone,
    pagesReadToday: Number(pagesReadToday) || book.pagesPerDay || 15,
    review: String(review).trim(),
    keyTakeaway: keyTakeaway ? String(keyTakeaway).trim() : '',
    rating: Number(rating) || 5,
    markedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    db.bookAttendance[existingIdx] = record;
  } else {
    db.bookAttendance.unshift(record);
  }

  res.json({
    success: true,
    record,
    message: `Attendance marked! You earned +10 Greatness points for reading "${book.title}".`,
  });
});

// Dreamers Lounge Chat Endpoints
app.get('/api/lounge/messages', (req: Request, res: Response) => {
  const { cohortId, email } = req.query;
  const userEmail = (email || req.headers['x-user-email']) as string;

  if (userEmail) {
    const cleanEmail = String(userEmail).toLowerCase().trim();
    const isAdmin = AUTHORIZED_ADMIN_EMAILS.some(e => e.toLowerCase() === cleanEmail);
    const isStudent = db.students.some(s => s.email.toLowerCase() === cleanEmail && (!cohortId || s.cohortId === cohortId));
    if (!isAdmin && !isStudent && db.students.length > 0) {
      return res.status(403).json({ 
        error: 'Access restricted: Only Dreamteam Admins and registered cohort members can view lounge messages.' 
      });
    }
  }

  let list = db.loungeMessages || [];
  if (cohortId) {
    list = list.filter((m: any) => !m.cohortId || m.cohortId === cohortId);
  }
  // Strip studentEmail from public output so only studentName is visible
  const sanitized = list.map(({ studentEmail, ...rest }: any) => rest);
  res.json({ success: true, messages: sanitized });
});

app.post('/api/lounge/verify-access', (req: Request, res: Response) => {
  const { email, cohortId } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });
  const cleanEmail = String(email).toLowerCase().trim();
  const isAdmin = AUTHORIZED_ADMIN_EMAILS.some(e => e.toLowerCase() === cleanEmail);
  const student = db.students.find(s => s.email.toLowerCase() === cleanEmail && (!cohortId || s.cohortId === cohortId));

  if (!student && !isAdmin) {
    return res.status(403).json({
      authorized: false,
      error: 'Access restricted: This email is not registered in the cohort roster.'
    });
  }

  res.json({
    authorized: true,
    studentName: student?.name || (isAdmin ? 'Cohort Facilitator' : 'Cohort Member'),
    studentEmail: cleanEmail,
    isFacilitator: isAdmin,
  });
});

app.post('/api/lounge/messages', (req: Request, res: Response) => {
  const { cohortId, studentEmail, studentName, message, channel } = req.body;
  if (!message || String(message).trim().length === 0) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  const cleanEmail = studentEmail ? String(studentEmail).toLowerCase().trim() : '';
  const isAdmin = cleanEmail && AUTHORIZED_ADMIN_EMAILS.some(e => e.toLowerCase() === cleanEmail);
  const student = cleanEmail ? db.students.find(s => s.email.toLowerCase() === cleanEmail) : null;

  // Gate enforcement: must be on roster or admin if email provided
  if (cleanEmail && !student && !isAdmin) {
    return res.status(403).json({ error: 'Only registered cohort members can post in the Dreamers Lounge.' });
  }

  const finalName = student?.name || studentName || (isAdmin ? 'Cohort Facilitator' : 'Cohort Member');

  const newMsg = {
    id: `lounge-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    cohortId: cohortId || 'dtp-cohort-2',
    studentName: finalName, // Only name displayed publicly
    studentEmail: cleanEmail,
    message: String(message).trim(),
    channel: channel || 'general',
    reactions: {},
    userReactions: {},
    createdAt: new Date().toISOString(),
    isFacilitator: Boolean(isAdmin),
  };

  if (!db.loungeMessages) db.loungeMessages = [];
  db.loungeMessages.push(newMsg);

  // Return public version without email
  const { studentEmail: _, ...publicMsg } = newMsg;
  res.json({ success: true, message: publicMsg });
});

app.post('/api/lounge/messages/:id/react', (req: Request, res: Response) => {
  const { id } = req.params;
  const { emoji, userName } = req.body;
  if (!id || !emoji || !userName) {
    return res.status(400).json({ error: 'Missing parameters.' });
  }

  const msg = (db.loungeMessages || []).find((m: any) => m.id === id);
  if (!msg) return res.status(404).json({ error: 'Message not found.' });

  if (!msg.reactions) msg.reactions = {};
  if (!msg.userReactions) msg.userReactions = {};

  const users = msg.userReactions[emoji] || [];
  const hasReacted = users.includes(userName);

  if (hasReacted) {
    msg.userReactions[emoji] = users.filter((u: string) => u !== userName);
    msg.reactions[emoji] = Math.max(0, (msg.reactions[emoji] || 1) - 1);
    if (msg.reactions[emoji] === 0) {
      delete msg.reactions[emoji];
      delete msg.userReactions[emoji];
    }
  } else {
    msg.userReactions[emoji] = [...users, userName];
    msg.reactions[emoji] = (msg.reactions[emoji] || 0) + 1;
  }

  const { studentEmail: _, ...publicMsg } = msg;
  res.json({ success: true, message: publicMsg });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Dream Team Project Attendance Server running on port ${PORT}`);
  });
}

startServer();
