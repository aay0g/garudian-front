export type UserRole = "Super Admin" | "Admin" | "Senior Investigator" | "Investigator" | "Guest";

// The data required to create a new user.
export interface NewUserData {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: any; // Consider using a more specific type like firebase.firestore.Timestamp
  updatedAt: any; // Consider using a more specific type like firebase.firestore.Timestamp
}

// The structure for a user that can be assigned to a case
export interface AssignableUser {
  id: string;
  username: string;
  role: UserRole;
}
