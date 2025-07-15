import { Timestamp, DocumentReference } from 'firebase/firestore';

// --- Alert Enums ---
export type AlertType = 'phishing' | 'malware' | 'data-breach' | 'suspicious-activity' | 'fraud' | 'other';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'new' | 'investigating' | 'resolved' | 'dismissed';

// --- Alert Interface ---
export interface Alert {
  id: string;
  title: string;
  description: string;
  alertType: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  source?: string; // Where the alert came from
  affectedSystems?: string[];
  relatedCaseId?: string; // Link to a case if created
  assignedTo?: DocumentReference; // Ref to User
  createdBy: DocumentReference; // Ref to User
  detectedAt: Timestamp;
  resolvedAt?: Timestamp;
  metadata?: Record<string, any>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// --- Data Transfer Objects ---
export interface NewAlertData {
  title: string;
  description: string;
  alertType: AlertType;
  severity: AlertSeverity;
  source?: string;
  affectedSystems?: string[];
  metadata?: Record<string, any>;
}

export interface AlertUpdateData {
  title?: string;
  description?: string;
  status?: AlertStatus;
  severity?: AlertSeverity;
  assignedTo?: DocumentReference;
  resolvedAt?: Timestamp;
  metadata?: Record<string, any>;
}
