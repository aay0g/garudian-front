"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile, signIn, signOut, sendEmailSignInLink, verifyEmailSignInLink, checkIsSignInWithEmailLink, sendPasswordReset } from '@/lib/api';
import { UserProfile } from '@/types/user';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: (User & UserProfile) | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  sendEmailLink: (email: string) => Promise<void>;
  verifyEmailLink: (email: string, emailLink: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isEmailLinkSignIn: (url: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<(User & UserProfile) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchAndSetUser = async (firebaseUser: User) => {
    const userProfile = await getUserProfile(firebaseUser.uid);
    if (userProfile) {
      setUser({ ...firebaseUser, ...userProfile });
    } else {
      // Handle case where user profile doesn't exist but auth user does
      // You might want to log them out or show an error
      setUser(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchAndSetUser(firebaseUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signIn(email, password);
      
      // Wait for the user profile to be loaded
      await fetchAndSetUser(userCredential.user);
      
      // Record login time in the background
      try {
        const { handleRecordLogin } = await import('@/lib/api');
        handleRecordLogin(userCredential.user.uid).catch(console.error);
      } catch (recordError) {
        console.warn('Could not record login time:', recordError);
      }
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      await fetchAndSetUser(firebaseUser);
    }
  };

  const logout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const sendEmailLink = async (email: string) => {
    try {
      await sendEmailSignInLink(email);
    } catch (error) {
      console.error('Send email link error:', error);
      throw error;
    }
  };

  const verifyEmailLink = async (email: string, emailLink: string) => {
    try {
      const userCredential = await verifyEmailSignInLink(email, emailLink);
      await fetchAndSetUser(userCredential.user);
      
      // Record login time in the background
      try {
        const { handleRecordLogin } = await import('@/lib/api');
        handleRecordLogin(userCredential.user.uid).catch(console.error);
      } catch (recordError) {
        console.warn('Could not record login time:', recordError);
      }
    } catch (error) {
      console.error('Verify email link error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordReset(email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const isEmailLinkSignIn = (url: string) => {
    return checkIsSignInWithEmailLink(url);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      logout, 
      isLoading, 
      refreshUser,
      sendEmailLink,
      verifyEmailLink,
      resetPassword,
      isEmailLinkSignIn
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>; 
  }

  return <>{children}</>;
};