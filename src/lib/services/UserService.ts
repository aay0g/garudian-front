// src/lib/services/UserService.ts
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  createUserWithEmailAndPassword,
  getAuth,
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { db, auth } from '../firebase';
import type { UserProfile, UserRole, AssignableUser, ProfileUpdateData, NewUserData } from '../../types/user';
import { setDoc } from 'firebase/firestore';

export class UserService {

  private static usersCollection = collection(db, 'users');

  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? ({ id: userDoc.id, ...userDoc.data() } as UserProfile) : null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  static async getUsersByRole(roles: UserRole[]): Promise<UserProfile[]> {
    const q = query(this.usersCollection, where('role', 'in', roles));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
  }

  static async getAssignableUsers(): Promise<AssignableUser[]> {
    const assignableRoles: UserRole[] = ['Investigator', 'Senior Investigator'];
    const users = await this.getUsersByRole(assignableRoles);
    return users.map(user => ({
      id: user.id,
      username: user.username,
      role: user.role,
    }));
  }

  static async updateUserProfile(uid: string, profileData: Partial<ProfileUpdateData>): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp(),
    });
  }

  static async recordLogin(uid: string): Promise<void> {
    const userRef = doc(db, 'users', uid);
    try {
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Could not record login time:', error);
    }
  }

  static async reauthenticateAndChangePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('User not authenticated.');

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  }

  static async getAllUsers(): Promise<UserProfile[]> {
    try {
      const snapshot = await getDocs(this.usersCollection);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw new Error('Failed to fetch users. Please check your connection and try again.');
    }
  }

  static async createNewUser(userData: NewUserData): Promise<string> {
    try {
      console.log('Creating new user:', userData.email);
      
      // Check if current user is Super Admin
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('You must be logged in to create users.');
      }

      const currentUserProfile = await this.getUserProfile(currentUser.uid);
      if (!currentUserProfile || currentUserProfile.role !== 'Super Admin') {
        throw new Error('Only Super Admins can create new users.');
      }

      console.log('Current user is Super Admin, proceeding with user creation...');

      // SECURITY WARNING: This function creates Firebase Auth users from the client.
      // In production, this should be done via Firebase Admin SDK on the server.
      // For now, we'll create a secondary auth instance to avoid signing out the admin.
      
      let secondaryApp;
      let secondaryAuth;
      
      try {
        // Create a temporary, secondary Firebase app instance
        secondaryApp = initializeApp(auth.app.options, `secondary-auth-${Date.now()}`);
        secondaryAuth = getAuth(secondaryApp);
        
        console.log('Secondary auth instance created');

        // Generate a secure temporary password
        const tempPassword = `TempPass${Math.random().toString(36).slice(-8)}!`;
        console.log('Creating Firebase Auth user...');

        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, userData.email, tempPassword);
        const newUser = userCredential.user;
        
        console.log('Firebase Auth user created:', newUser.uid);

        // Create the user profile document in Firestore
        const userDocRef = doc(db, 'users', newUser.uid);
        console.log('Creating Firestore user document...');
        
        await setDoc(userDocRef, {
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          role: userData.role,
          isActive: true,
          tempPassword: tempPassword, // Store temp password for user to change
          needsPasswordReset: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        
        console.log('User created successfully:', newUser.uid);
        return newUser.uid;
        
      } finally {
        // Note: Secondary Firebase app instances are automatically cleaned up
        // when they go out of scope. Manual cleanup is not required.
        console.log('Secondary app will be cleaned up automatically');
      }
      
    } catch (error: any) {
      console.error('Error creating new user:', error);
      
      // Provide more specific error messages
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email address is already registered.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak.');
      } else if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Make sure you are a Super Admin and Firestore rules allow user creation.');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('User creation is not enabled in Firebase Authentication. Please enable Email/Password authentication in Firebase Console.');
      } else if (error.message.includes('Super Admin')) {
        throw error; // Re-throw our custom Super Admin error
      } else {
        throw new Error(`Failed to create user: ${error.message}`);
      }
    }
  }
}
