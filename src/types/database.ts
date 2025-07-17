import { Timestamp } from 'firebase/firestore';

export type PreferredContactMethod = 'email' | 'phone' | 'none';

export interface DatabaseType {
  id: string;
  name: string; // e.g., 'Grievance Officer Contacts'
  description: string;
  collectionName: string; // e.g., 'contacts'
}

export interface Contact {
  id: string;
  name: string;
  organization: string;
  role: string;
  email: string;
  isEmailActive: boolean;
  phone?: string;
  isPhoneActive: boolean;
  preferredContactMethod: PreferredContactMethod;
  description?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type NewContactData = Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>;
