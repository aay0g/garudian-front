import { Timestamp, DocumentReference } from 'firebase/firestore';

// --- Enums from Schema ---
export type CaseStatus = 'unverified' | 'active' | 'closed' | 'archived';
export type CasePriority = 'low' | 'medium' | 'high';
export type CaseType = 'phishing' | 'romance-scam' | 'investment-fraud' | 'identity-theft' | 'other';
export type NoteType = 'investigation' | 'communication' | 'internal' | 'public';
export type TimelineEventType = 'incident' | 'investigation' | 'communication' | 'resolution';
export type EvidenceType = 'file' | 'url' | 'text';


// --- Victim Interface ---
export interface Victim {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

// --- Main Case Interface ---
export interface Case {
  id: string;
  caseNumber: string; // e.g., CAS-001
  title: string;
  description: string;
  status: CaseStatus;
  priority: CasePriority;
  caseType: CaseType;
  amountInvolved?: number;
  currency?: string;
  dateOpened: Timestamp;
  dateClosed?: Timestamp;
  assignedTo?: DocumentReference; // Ref to User
  createdBy: DocumentReference; // Ref to User
  victim?: Victim;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// --- Subcollection Interfaces ---

export interface Note {
  id: string;
  content: string;
  noteType: NoteType;
  addedBy: DocumentReference; // Ref to User
  isPrivate: boolean;
  attachments?: string[]; // Array of URLs
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TimelineEvent {
  id:string;
  title: string;
  description: string;
  eventType: TimelineEventType;
  eventDate: Timestamp;
  addedBy: DocumentReference; // Ref to User
  isPublic: boolean;
  attachments?: string[]; // Array of URLs
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Evidence {
    id: string;
    title: string;
    description: string;
    evidenceType: EvidenceType;
    fileName?: string;
    fileUrl?: string; // URL to file in Firebase Storage
    textContent?: string;
    addedBy: DocumentReference; // Ref to User
    evidenceDate: Timestamp;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}


// --- Data Transfer Objects (for creating new entities) ---

export interface NewCaseData {
  title: string;
  description:string;
  priority: CasePriority;
  caseType: CaseType;
  amountInvolved?: number;
  currency?: string;
  victim?: Victim;
  tags?: string[];
}

export interface NewNoteData {
  content: string;
  noteType: NoteType;
  isPrivate: boolean;
  attachments?: string[];
}

export interface NewTimelineEventData {
  title: string;
  description: string;
  eventType: TimelineEventType;
  eventDate: Timestamp;
  isPublic: boolean;
  attachments?: string[];
}

export interface NewEvidenceData {
    title: string;
    description: string;
    evidenceType: EvidenceType;
    fileName?: string;
    fileUrl?: string;
    textContent?: string;
    evidenceDate: Timestamp;
}


export interface CaseUpdateData {
  title?: string;
  description?: string;
  status?: CaseStatus;
  priority?: CasePriority;
  caseType?: CaseType;
  assignedTo?: DocumentReference | null;
}
