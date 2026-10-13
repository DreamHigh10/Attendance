import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc,
  deleteDoc,
  writeBatch,
  query, 
  where,
  onSnapshot,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Student, ClassSession, AttendanceRecord, ImportedFileLog, Cohort, BookAssignment, BookAttendanceRecord, LoungeMessage } from '../types';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = (firebaseConfig as any).firestoreDatabaseId 
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const firebaseAuth = {
  async signInWithGoogle(): Promise<FirebaseUser> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error: any) {
      console.error('Firebase Google sign-in error:', error);
      throw error;
    }
  },

  async signOut(): Promise<void> {
    try {
      await fbSignOut(auth);
    } catch (error: any) {
      console.error('Firebase sign-out error:', error);
      throw error;
    }
  },

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  },
};

// Helper to prevent hanging indefinitely
function withTimeout<T>(promise: Promise<T>, timeoutMs = 2500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Firebase operation timed out')), timeoutMs)
    )
  ]);
}

// Global Cloud Firestore Database Service for Multi-Device Real-Time Sync
export const firebaseDb = {
  // --- STUDENTS ---
  async syncStudentsToFirestore(cohortId: string, students: Student[]): Promise<boolean> {
    try {
      // Write in batches of up to 400
      const batchSize = 300;
      for (let i = 0; i < students.length; i += batchSize) {
        const batch = writeBatch(db);
        const slice = students.slice(i, i + batchSize);
        for (const s of slice) {
          const docRef = doc(db, 'students', s.id);
          batch.set(docRef, {
            ...s,
            cohortId: s.cohortId || cohortId,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        }
        await withTimeout(batch.commit(), 8000);
      }
      return true;
    } catch (err) {
      console.warn('Firebase batch student sync warning:', err);
      return false;
    }
  },

  async getStudentsFromFirestore(cohortId?: string): Promise<Student[]> {
    try {
      const coll = collection(db, 'students');
      const q = cohortId ? query(coll, where('cohortId', '==', cohortId)) : coll;
      const snapshot = await withTimeout(getDocs(q), 5000);
      const list: Student[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Student);
      });
      return list;
    } catch (err) {
      console.warn('Firebase fetch students warning:', err);
      return [];
    }
  },

  async lookupStudentInFirestore(email: string, cohortId?: string): Promise<Student | null> {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const coll = collection(db, 'students');
      const q = query(coll, where('email', '==', cleanEmail));
      const snapshot = await withTimeout(getDocs(q), 4000);
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as Student;
      }
      return null;
    } catch (err) {
      console.warn('Firebase lookup student warning:', err);
      return null;
    }
  },

  async deleteStudentFromFirestore(id: string): Promise<boolean> {
    try {
      await withTimeout(deleteDoc(doc(db, 'students', id)), 4000);
      return true;
    } catch (err) {
      console.warn('Firebase delete student warning:', err);
      return false;
    }
  },

  async bulkDeleteStudentsFromFirestore(ids: string[]): Promise<boolean> {
    try {
      const batch = writeBatch(db);
      for (const id of ids) {
        batch.delete(doc(db, 'students', id));
      }
      await withTimeout(batch.commit(), 5000);
      return true;
    } catch (err) {
      console.warn('Firebase bulk delete students warning:', err);
      return false;
    }
  },

  // --- UPLOADED FILES ---
  async saveUploadedFileToFirestore(file: ImportedFileLog): Promise<boolean> {
    try {
      await withTimeout(setDoc(doc(db, 'uploaded_files', file.id), file, { merge: true }), 4000);
      return true;
    } catch (err) {
      console.warn('Firebase save file warning:', err);
      return false;
    }
  },

  async getUploadedFilesFromFirestore(cohortId?: string): Promise<ImportedFileLog[]> {
    try {
      const coll = collection(db, 'uploaded_files');
      const q = cohortId ? query(coll, where('cohortId', '==', cohortId)) : coll;
      const snapshot = await withTimeout(getDocs(q), 4000);
      const list: ImportedFileLog[] = [];
      snapshot.forEach(d => {
        list.push({ id: d.id, ...d.data() } as ImportedFileLog);
      });
      return list.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    } catch (err) {
      console.warn('Firebase fetch files warning:', err);
      return [];
    }
  },

  async deleteUploadedFileFromFirestore(id: string, studentIds?: string[]): Promise<boolean> {
    try {
      await withTimeout(deleteDoc(doc(db, 'uploaded_files', id)), 4000);
      if (studentIds && studentIds.length > 0) {
        const batch = writeBatch(db);
        for (const sid of studentIds) {
          batch.delete(doc(db, 'students', sid));
        }
        await withTimeout(batch.commit(), 5000);
      }
      return true;
    } catch (err) {
      console.warn('Firebase delete file warning:', err);
      return false;
    }
  },

  // --- CLASSES ---
  async saveClassToFirestore(classSession: ClassSession): Promise<boolean> {
    try {
      await withTimeout(setDoc(doc(db, 'classes', classSession.id), classSession, { merge: true }), 4000);
      return true;
    } catch (err) {
      console.warn('Firebase save class warning:', err);
      return false;
    }
  },

  async getClassesFromFirestore(cohortId?: string): Promise<ClassSession[]> {
    try {
      const coll = collection(db, 'classes');
      const q = cohortId ? query(coll, where('cohortId', '==', cohortId)) : coll;
      const snapshot = await withTimeout(getDocs(q), 4000);
      const list: ClassSession[] = [];
      snapshot.forEach(d => {
        list.push({ id: d.id, ...d.data() } as ClassSession);
      });
      return list.sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
    } catch (err) {
      console.warn('Firebase fetch classes warning:', err);
      return [];
    }
  },

  async deleteClassFromFirestore(id: string): Promise<boolean> {
    try {
      await withTimeout(deleteDoc(doc(db, 'classes', id)), 4000);
      return true;
    } catch (err) {
      console.warn('Firebase delete class warning:', err);
      return false;
    }
  },

  // --- ATTENDANCE ---
  async saveAttendanceToFirestore(record: AttendanceRecord): Promise<boolean> {
    try {
      await withTimeout(setDoc(doc(db, 'attendance', record.id), record, { merge: true }), 4000);
      return true;
    } catch (err) {
      console.warn('Firebase save attendance warning:', err);
      return false;
    }
  },

  async getAttendanceFromFirestore(classId?: string): Promise<AttendanceRecord[]> {
    try {
      const coll = collection(db, 'attendance');
      const q = classId ? query(coll, where('classId', '==', classId)) : coll;
      const snapshot = await withTimeout(getDocs(q), 4000);
      const list: AttendanceRecord[] = [];
      snapshot.forEach(d => {
        list.push({ id: d.id, ...d.data() } as AttendanceRecord);
      });
      return list;
    } catch (err) {
      console.warn('Firebase fetch attendance warning:', err);
      return [];
    }
  },

  async deleteAttendanceFromFirestore(classId: string, studentEmail: string): Promise<boolean> {
    try {
      const cleanEmail = studentEmail.trim().toLowerCase();
      const coll = collection(db, 'attendance');
      const q = query(coll, where('classId', '==', classId), where('studentEmail', '==', cleanEmail));
      const snapshot = await withTimeout(getDocs(q), 4000);
      if (snapshot.empty) return true;
      const batch = writeBatch(db);
      snapshot.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });
      await withTimeout(batch.commit(), 4000);
      return true;
    } catch (err) {
      console.warn('Firebase delete attendance warning:', err);
      return false;
    }
  },

  async deleteAttendanceRecordById(recordId: string): Promise<boolean> {
    try {
      await withTimeout(deleteDoc(doc(db, 'attendance', recordId)), 4000);
      return true;
    } catch (err) {
      console.warn('Firebase delete attendance record warning:', err);
      return false;
    }
  },

  // --- COHORTS ---
  async getCohortsFromFirestore(): Promise<Cohort[]> {
    try {
      const snapshot = await withTimeout(getDocs(collection(db, 'cohorts')), 4000);
      const list: Cohort[] = [];
      snapshot.forEach(d => {
        list.push({ id: d.id, ...d.data() } as Cohort);
      });
      return list;
    } catch (err) {
      return [];
    }
  },

  async saveCohortToFirestore(cohort: Cohort): Promise<boolean> {
    try {
      await withTimeout(setDoc(doc(db, 'cohorts', cohort.id), cohort, { merge: true }), 4000);
      return true;
    } catch (err) {
      return false;
    }
  },

  // --- BOOKS & READING CHALLENGE ---
  async saveBookToFirestore(book: BookAssignment): Promise<boolean> {
    try {
      await withTimeout(setDoc(doc(db, 'books', book.id), book, { merge: true }), 4000);
      return true;
    } catch (err) {
      console.warn('Firebase save book warning:', err);
      return false;
    }
  },

  async getBooksFromFirestore(cohortId?: string): Promise<BookAssignment[]> {
    try {
      const coll = collection(db, 'books');
      const q = cohortId ? query(coll, where('cohortId', '==', cohortId)) : coll;
      const snapshot = await withTimeout(getDocs(q), 4000);
      const list: BookAssignment[] = [];
      snapshot.forEach(d => {
        list.push({ id: d.id, ...(d.data() as any) } as BookAssignment);
      });
      return list.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    } catch (err) {
      console.warn('Firebase fetch books warning:', err);
      return [];
    }
  },

  async deleteBookFromFirestore(bookId: string): Promise<boolean> {
    try {
      await withTimeout(deleteDoc(doc(db, 'books', bookId)), 4000);
      return true;
    } catch (err) {
      console.warn('Firebase delete book warning:', err);
      return false;
    }
  },

  async saveBookAttendanceToFirestore(record: BookAttendanceRecord): Promise<boolean> {
    try {
      await withTimeout(setDoc(doc(db, 'book_attendance', record.id), record, { merge: true }), 4000);
      return true;
    } catch (err) {
      console.warn('Firebase save book attendance warning:', err);
      return false;
    }
  },

  async getBookAttendanceFromFirestore(bookId?: string, cohortId?: string): Promise<BookAttendanceRecord[]> {
    try {
      const coll = collection(db, 'book_attendance');
      let q: any = coll;
      if (bookId) {
        q = query(coll, where('bookId', '==', bookId));
      } else if (cohortId) {
        q = query(coll, where('cohortId', '==', cohortId));
      }
      const snapshot = await withTimeout(getDocs(q), 4000);
      const list: BookAttendanceRecord[] = [];
      snapshot.forEach(d => {
        list.push({ id: d.id, ...(d.data() as any) } as BookAttendanceRecord);
      });
      return list.sort((a, b) => new Date(b.markedAt).getTime() - new Date(a.markedAt).getTime());
    } catch (err) {
      console.warn('Firebase fetch book attendance warning:', err);
      return [];
    }
  },

  // --- Dreamers Lounge Real-Time Chat ---
  async getLoungeMessagesFromFirestore(cohortId?: string): Promise<LoungeMessage[]> {
    try {
      const coll = collection(db, 'lounge_messages');
      let q = query(coll, orderBy('createdAt', 'asc'));
      if (cohortId) {
        q = query(coll, where('cohortId', '==', cohortId), orderBy('createdAt', 'asc'));
      }
      const snapshot = await withTimeout(getDocs(q), 4000);
      const messages: LoungeMessage[] = [];
      snapshot.forEach(d => {
        messages.push({ id: d.id, ...(d.data() as any) } as LoungeMessage);
      });
      return messages;
    } catch (err) {
      console.warn('Firebase fetch lounge messages warning:', err);
      return [];
    }
  },

  subscribeToLoungeMessages(
    cohortId: string | undefined, 
    callback: (messages: LoungeMessage[]) => void
  ): () => void {
    try {
      const coll = collection(db, 'lounge_messages');
      let q = query(coll, orderBy('createdAt', 'asc'));
      if (cohortId) {
        q = query(coll, where('cohortId', '==', cohortId), orderBy('createdAt', 'asc'));
      }
      return onSnapshot(
        q,
        (snapshot) => {
          const list: LoungeMessage[] = [];
          snapshot.forEach(d => {
            list.push({ id: d.id, ...(d.data() as any) } as LoungeMessage);
          });
          callback(list);
        },
        (error) => {
          console.warn('Firestore lounge realtime snapshot warning:', error);
        }
      );
    } catch (err) {
      console.warn('Firebase lounge listener initialization warning:', err);
      return () => {};
    }
  },

  async saveLoungeMessageToFirestore(message: LoungeMessage): Promise<void> {
    try {
      const docRef = doc(db, 'lounge_messages', message.id);
      // Ensure email is stored internally if needed, but not exposed publicly
      await withTimeout(setDoc(docRef, message, { merge: true }), 4000);
    } catch (err) {
      console.warn('Firebase save lounge message warning:', err);
    }
  },

  async updateLoungeMessageReactionsInFirestore(
    messageId: string, 
    reactions: Record<string, number>,
    userReactions: Record<string, string[]>
  ): Promise<void> {
    try {
      const docRef = doc(db, 'lounge_messages', messageId);
      await withTimeout(setDoc(docRef, { reactions, userReactions }, { merge: true }), 4000);
    } catch (err) {
      console.warn('Firebase update lounge reactions warning:', err);
    }
  }
};

// Legacy compatibility wrapper
export const firebaseStorage = {
  async uploadRosterFileLog(payload: {
    fileName: string;
    fileSize: number;
    recordsCount: number;
    uploadedBy: string;
    students: any[];
  }) {
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const record: ImportedFileLog = {
      id: fileId,
      fileName: payload.fileName,
      fileSize: payload.fileSize,
      recordsCount: payload.recordsCount,
      cohortId: 'dtp-cohort-2',
      uploadedAt: new Date().toISOString(),
      uploadedBy: payload.uploadedBy || 'Admin',
      studentIds: payload.students.map(s => s.id || `stu-${Math.random()}`),
    };
    await firebaseDb.saveUploadedFileToFirestore(record);
    return fileId;
  },

  async getUploadedFileLogs() {
    return firebaseDb.getUploadedFilesFromFirestore();
  }
};
