import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  query,
  Timestamp,
  getDoc,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import type {
  Case,
  NewCaseData,
  CaseUpdateData,
  Note,
  NewNoteData,
  TimelineEvent,
  NewTimelineEventData
} from '../../types/case';

const generateCaseNumber = () => {
  const prefix = 'CAS-';
  const randomNumber = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${prefix}${randomNumber}`;
};

export class CaseService {
  private static casesCollection = collection(db, 'cases');

  // --- Case Methods ---
  static async createCase(caseDetails: NewCaseData, createdByUserId: string): Promise<{ caseId: string; caseNumber: string }> {
    const caseNumber = generateCaseNumber();
    const newCaseData = {
      ...caseDetails,
      caseNumber,
      status: 'unverified' as const,
      dateOpened: Timestamp.now(),
      createdBy: doc(db, 'users', createdByUserId),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(this.casesCollection, newCaseData);
    return { caseId: docRef.id, caseNumber };
  }

  static async getAllCases(): Promise<Case[]> {
    const snapshot = await getDocs(this.casesCollection);
    // Note: This is a shallow query. It does not fetch subcollections.
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Case));
  }

  static async getCaseById(caseId: string): Promise<Case | null> {
    const caseRef = doc(db, 'cases', caseId);
    const docSnap = await getDoc(caseRef);
    if (!docSnap.exists()) {
      return null;
    }
    return { id: docSnap.id, ...docSnap.data() } as Case;
  }

  static async updateCase(caseId: string, updateData: CaseUpdateData): Promise<void> {
    const caseRef = doc(db, 'cases', caseId);
    await updateDoc(caseRef, { ...updateData, updatedAt: serverTimestamp() });
  }

  static async deleteCase(caseId: string): Promise<void> {
    const caseRef = doc(db, 'cases', caseId);
    // Note: Deleting a case does not automatically delete its subcollections (notes, timeline, evidence).
    // This would require a Cloud Function or client-side recursive deletion.
    await deleteDoc(caseRef);
  }

  // --- Note Methods ---
  static async getNotesForCase(caseId: string): Promise<Note[]> {
    const notesCollection = collection(db, `cases/${caseId}/notes`);
    const q = query(notesCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
  }

  static async addNoteToCase(caseId: string, noteData: NewNoteData, addedByUserId: string): Promise<string> {
    const notesCollection = collection(db, `cases/${caseId}/notes`);
    const newNote = {
      ...noteData,
      case: doc(db, 'cases', caseId),
      addedBy: doc(db, 'users', addedByUserId),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(notesCollection, newNote);
    return docRef.id;
  }

  // --- Timeline Methods ---
  static async getTimelineForCase(caseId: string): Promise<TimelineEvent[]> {
    const timelineCollection = collection(db, `cases/${caseId}/timeline`);
    const q = query(timelineCollection, orderBy('eventDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimelineEvent));
  }

  static async addTimelineEventToCase(caseId: string, eventData: NewTimelineEventData, addedByUserId: string): Promise<string> {
    const timelineCollection = collection(db, `cases/${caseId}/timeline`);
    const newEvent = {
      ...eventData,
      case: doc(db, 'cases', caseId),
      addedBy: doc(db, 'users', addedByUserId),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(timelineCollection, newEvent);
    return docRef.id;
  }
}
