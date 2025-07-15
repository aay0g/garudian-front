import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from './firebase';
import { CaseService, UserService, EvidenceService } from './services';
import type {
  Case,
  NewCaseData,
  CaseUpdateData,
  TimelineEvent,
  NewTimelineEventData,
  Note,
  NewNoteData,
  Evidence,
  NewEvidenceData,
} from '../types/case';
import type { UserProfile, UserRole, NewUserData, AssignableUser, ProfileUpdateData } from '../types/user';

// Re-export types for external use
export type { ProfileUpdateData } from '../types/user';

// --- Authentication ---
export const signIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signOut = () => {
  return firebaseSignOut(auth);
};

// Email Link Authentication
export const sendEmailSignInLink = async (email: string) => {
  const actionCodeSettings = {
    url: `${window.location.origin}/login/verify`,
    handleCodeInApp: true,
  };
  
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  // Save email to localStorage for verification
  window.localStorage.setItem('emailForSignIn', email);
};

export const verifyEmailSignInLink = async (email: string, emailLink: string) => {
  return signInWithEmailLink(auth, email, emailLink);
};

export const checkIsSignInWithEmailLink = (url: string) => {
  return isSignInWithEmailLink(auth, url);
};

// Password Reset
export const sendPasswordReset = async (email: string) => {
  const actionCodeSettings = {
    url: `${window.location.origin}/login`,
    handleCodeInApp: false,
  };
  
  return sendPasswordResetEmail(auth, email, actionCodeSettings);
};

// --- User Management ---
export const getUserProfile = (uid: string): Promise<UserProfile | null> => {
  return UserService.getUserProfile(uid);
};

export const getUsersByRole = (roles: UserRole[]): Promise<UserProfile[]> => {
  return UserService.getUsersByRole(roles);
};

export const handleUpdateProfile = (uid: string, profileData: Partial<ProfileUpdateData>): Promise<void> => {
  return UserService.updateUserProfile(uid, profileData);
};

export const handleRecordLogin = (uid: string): Promise<void> => {
  return UserService.recordLogin(uid);
};

export const reauthenticateAndChangePassword = (currentPassword: string, newPassword: string): Promise<void> => {
  return UserService.reauthenticateAndChangePassword(currentPassword, newPassword);
};

// --- User Management (Admin) ---
export const getAllUsers = (): Promise<UserProfile[]> => {
  return UserService.getAllUsers();
};

export const createNewUser = (userData: NewUserData): Promise<string> => {
  return UserService.createNewUser(userData);
};

export const handleGetAssignableUsers = (): Promise<AssignableUser[]> => {
  return UserService.getAssignableUsers();
};

// --- Case Management ---
export const handleCreateCase = (caseDetails: NewCaseData, createdBy: string): Promise<{ caseId: string; caseNumber: string }> => {
  return CaseService.createCase(caseDetails, createdBy);
};

export const fetchAllCases = (): Promise<Case[]> => {
  return CaseService.getAllCases();
};

export const getCaseById = (caseId: string): Promise<Case | null> => {
  return CaseService.getCaseById(caseId);
};

export const updateCase = (caseId: string, updateData: CaseUpdateData): Promise<void> => {
  return CaseService.updateCase(caseId, updateData);
};

export const deleteCase = (caseId: string): Promise<void> => {
  return CaseService.deleteCase(caseId);
};

// --- Note Methods ---
export const getNotesForCase = (caseId: string): Promise<Note[]> => {
  return CaseService.getNotesForCase(caseId);
};

export const addNoteToCase = (caseId: string, noteData: NewNoteData, addedByUserId: string): Promise<string> => {
  return CaseService.addNoteToCase(caseId, noteData, addedByUserId);
};

// --- Timeline Methods ---
export const getTimelineForCase = (caseId: string): Promise<TimelineEvent[]> => {
  return CaseService.getTimelineForCase(caseId);
};

export const addTimelineEventToCase = (caseId: string, eventData: NewTimelineEventData, addedByUserId: string): Promise<string> => {
  return CaseService.addTimelineEventToCase(caseId, eventData, addedByUserId);
};

// --- Evidence Methods ---
export const getEvidenceForCase = (caseId: string): Promise<Evidence[]> => {
  return EvidenceService.getEvidenceForCase(caseId);
};

export const addEvidenceToCase = (
  caseId: string,
  evidenceData: Omit<NewEvidenceData, 'caseId' | 'fileUrl' | 'fileName'>,
  file: File,
  addedBy: string
): Promise<string> => {
  return EvidenceService.addEvidenceToCase(caseId, evidenceData, file, addedBy);
};

export const deleteEvidence = (caseId: string, evidenceId: string): Promise<void> => {
  return EvidenceService.deleteEvidence(caseId, evidenceId);
};