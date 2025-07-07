export type CaseStatus = "unverified" | "active" | "closed" | "archived";

// The structure for a new case to be sent to the backend
export interface NewCaseData {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  caseType: string;
  source?: 'dashboard' | 'bot' | 'website';
  victim: {
    name: string;
    email: string;
    phone?: string; // Optional
  };
  amountInvolved?: number;
  currency?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

// The structure of a case object returned from the backend
export interface NewTimelineEvent {
  title: string;
  description: string;
  eventType: 'incident' | 'investigation' | 'communication' | 'resolution';
  eventDate: string;
  isPublic: boolean;
  attachments?: string[];
}

export interface TimelineEvent extends NewTimelineEvent {
  id: string;
  createdAt: string;
  addedBy: {
    id: string;
    username: string;
  };
}

export interface NewNote {
  content: string;
  noteType: 'investigation' | 'communication' | 'internal' | 'public';
  isPrivate: boolean;
  attachments?: string[];
}

export interface Note extends NewNote {
  id: string;
  createdAt: string;
  addedBy: {
    id: string;
    username: string;
  };
}

// The structure for new evidence to be sent to the backend
export interface NewEvidenceData {
  caseId: string;
  title: string;
  description: string;
  evidenceType: 'file' | 'url' | 'text';
  fileName: string;
  fileUrl: string;
  fileType: string;
  evidenceDate: string; // ISO string
}

export interface CaseEvidence {
  id: string;
  title: string;
  description: string;
  evidenceType: 'file' | 'url' | 'text';
  fileName?: string;
  fileUrl?: string;
  fileType?: string;
  evidenceDate: string; // ISO string
  createdAt: string; // ISO string
  addedBy: {
    id: string;
    username: string;
  };
}

export interface Case {
  id: string; // Firestore document ID
  caseNumber: string;
  title: string;
  description: string;
  status: CaseStatus;
  priority: "high" | "medium" | "low";
  caseType: string;
  amountInvolved?: number;
  currency?: string;
  dateOpened: string; // ISO date string
  dateClosed?: string; // ISO date string
  assignedTo: { id: string, username: string } | null;
  createdBy: { id: string, username: string };
  victim: { id: string, name: string, email: string, phone?: string };
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  evidence?: CaseEvidence[];
}
