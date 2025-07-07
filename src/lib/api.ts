import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { auth, db, functions } from "./firebase";
import { 
  Case, 
  NewCaseData, 
  CaseStatus, 
  NewTimelineEvent, 
  TimelineEvent, 
  NewNote, 
  Note,
  CaseEvidence
} from '@/types/case';
import { UserProfile, UserRole, NewUserData, AssignableUser } from "../types/user";

// --- Helper Types for Callable Functions ---



interface NewNoteData extends NewNote {
  caseId: string;
}

export interface NewEvidenceData {
  caseId: string;
  title: string;
  description: string;
  evidenceType: 'file' | 'url' | 'text';
  fileName?: string;
  fileUrl?: string;
  fileType?: string;
  evidenceDate: string; // ISO string
}

// --- Callable Function Definitions ---

const recordLoginCallable = httpsCallable(functions, 'recordLogin');
const updateUserProfileCallable = httpsCallable(functions, 'updateUserProfile');
const createCaseCallable = httpsCallable<NewCaseData, { caseId: string, caseNumber: string }>(functions, 'createCase');
const getAllCasesCallable = httpsCallable<undefined, Case[]>(functions, 'getAllCases');
const getCaseByIdCallable = httpsCallable<{ caseId: string }, Case>(functions, 'getCaseById');
const assignCaseCallable = httpsCallable<{ caseId: string, assigneeId: string }, void>(functions, 'assignCase');
const getAssignableUsersCallable = httpsCallable<undefined, AssignableUser[]>(functions, 'getAssignableUsers');
const updateCaseStatusCallable = httpsCallable<{ caseId: string, status: 'closed' | 'archived' }, void>(functions, 'updateCaseStatus');
const addTimelineEventCallable = httpsCallable(functions, 'addTimelineEvent');
const getCaseTimelineCallable = httpsCallable<{ caseId: string }, TimelineEvent[]>(functions, 'getCaseTimeline');
const getCaseNotesCallable = httpsCallable<{ caseId: string }, Note[]>(functions, 'getCaseNotes');
const addNoteToCaseCallable = httpsCallable<NewNoteData, { noteId: string }>(functions, 'addNoteToCase');
const searchCasesCallable = httpsCallable<{ caseNumber: string }, Partial<Case>[]>(functions, 'searchCases');
const createNewUserCallable = httpsCallable<NewUserData, any>(functions, 'createNewUser');
const getAllUsersCallable = httpsCallable<undefined, any[]>(functions, 'getAllUsers');

// Evidence Functions
const getEvidenceForCaseCallable = httpsCallable<{ caseId: string }, CaseEvidence[]>(functions, 'getEvidenceForCase');
const addEvidenceToCaseCallable = httpsCallable<NewEvidenceData, { evidenceId: string }>(functions, 'addEvidenceToCase');
const deleteCaseEvidenceCallable = httpsCallable<{ caseId: string, evidenceId: string }, void>(functions, 'deleteCaseEvidence');


// --- Authentication ---

export const signIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const handleRecordLogin = async () => {
  try {
    await recordLoginCallable();
  } catch (error) {
    console.error("Could not record login time:", error);
  }
};

export const signOut = () => {
  return firebaseSignOut(auth);
};

// --- User Management ---

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  department?: string;
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } as UserProfile : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const getUserRole = async (uid: string): Promise<UserRole | null> => {
  const userDocRef = doc(db, "users", uid);
  const userDoc = await getDoc(userDocRef);
  return userDoc.exists() ? userDoc.data().role as UserRole : null;
};

export const getUsersByRole = async (roles: UserRole[]): Promise<UserProfile[]> => {
  const q = query(collection(db, "users"), where("role", "in", roles));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as UserProfile));
};

export const handleUpdateProfile = async (profileData: ProfileUpdateData) => {
  try {
    const result = await updateUserProfileCallable(profileData);
    return result.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

// --- Case Management ---

export async function handleCreateCase(caseDetails: NewCaseData): Promise<{ caseId: string, caseNumber: string }> {
  const result = await createCaseCallable(caseDetails);
  return result.data;
}

export const fetchAllCases = async (): Promise<Case[]> => {
  const result = await getAllCasesCallable();
  return result.data || [];
};

export const handleGetAssignableUsers = async (): Promise<AssignableUser[]> => {
  const result = await getAssignableUsersCallable();
  return result.data;
};

export const handleAssignCase = async (caseId: string, assigneeId: string) => {
  await assignCaseCallable({ caseId, assigneeId });
};

export const handleUpdateCaseStatus = async (caseId: string, status: 'closed' | 'archived') => {
  await updateCaseStatusCallable({ caseId, status });
};

export const getCaseById = async (caseId: string): Promise<Case> => {
  const result = await getCaseByIdCallable({ caseId });
  if (!result.data) throw new Error("Case not found");
  return result.data;
};

export const handleAddTimelineEvent = async (caseId: string, eventData: NewTimelineEvent) => {
  const result = await addTimelineEventCallable({ caseId, ...eventData });
  return result.data;
};

export const getCaseTimeline = async (caseId: string): Promise<TimelineEvent[]> => {
  const result = await getCaseTimelineCallable({ caseId });
  return result.data || [];
};

export const getCaseNotes = async (caseId: string): Promise<Note[]> => {
  try {
    const result = await getCaseNotesCallable({ caseId });
    return result.data || [];
  } catch (error) {
    console.error(`Error fetching notes for case ${caseId}:`, error);
    throw error; // Re-throw the error to be caught by the UI
  }
};

export async function addNoteToCase(caseId: string, noteData: NewNote): Promise<string> {
  const result = await addNoteToCaseCallable({ caseId, ...noteData });
  return result.data.noteId;
}

export const searchCases = async (caseNumber: string): Promise<Partial<Case>[]> => {
  if (!caseNumber.trim()) return [];
  const result = await searchCasesCallable({ caseNumber });
  return result.data || [];
};

// --- Evidence API ---

export async function getEvidenceForCase(caseId: string): Promise<CaseEvidence[]> {
  try {
    const result = await getEvidenceForCaseCallable({ caseId });
    return result.data || [];
  } catch (error) {
    console.error(`Error fetching evidence for case ${caseId}:`, error);
    throw error; // Re-throw the error to be caught by the UI
  }
}

export async function addEvidenceToCase(evidenceData: NewEvidenceData): Promise<string> {
  const result = await addEvidenceToCaseCallable(evidenceData);
  return result.data.evidenceId;
}

export async function deleteCaseEvidence(caseId: string, evidenceId: string): Promise<void> {
  await deleteCaseEvidenceCallable({ caseId, evidenceId });
}

// --- User Management (Super Admin) ---

export const createNewUser = async (userData: NewUserData): Promise<any> => {
  const result = await createNewUserCallable(userData);
  return result.data;
};

export const getAllUsers = async (): Promise<any[]> => {
  const result = await getAllUsersCallable();
  return result.data || [];
};

// --- Password Management ---

export const reauthenticateAndChangePassword = async (currentPassword: string, newPassword: string) => {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error("User not authenticated.");

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
};

// --- Misc Callable Functions ---

export const assignCase = httpsCallable(functions, "assignCase");
export const generateCaseReport = httpsCallable(functions, "generateCaseReport");