"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import Image from 'next/image';

function VerifyEmailPageContent() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [needsEmail, setNeedsEmail] = useState(false);
  
  const { verifyEmailLink, isEmailLinkSignIn, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      router.push('/');
      return;
    }

    const currentUrl = window.location.href;
    
    if (isEmailLinkSignIn(currentUrl)) {
      // Try to get email from localStorage first
      const savedEmail = window.localStorage.getItem('emailForSignIn');
      
      if (savedEmail) {
        handleEmailLinkVerification(savedEmail, currentUrl);
      } else {
        // Need to ask user for email
        setNeedsEmail(true);
        setIsVerifying(false);
      }
    } else {
      // Not a valid email link
      toast.error('Invalid verification link');
      router.push('/login');
    }
  }, [isAuthenticated, router, isEmailLinkSignIn]);

  const handleEmailLinkVerification = async (userEmail: string, emailLink: string) => {
    setIsLoading(true);
    try {
      await verifyEmailLink(userEmail, emailLink);
      
      // Clear the email from localStorage
      window.localStorage.removeItem('emailForSignIn');
      
      toast.success('Successfully signed in with email link!');
      router.push('/');
    } catch (error: any) {
      console.error('Email link verification error:', error);
      
      if (error.code === 'auth/invalid-action-code') {
        toast.error('This verification link has expired or is invalid.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address.');
      } else {
        toast.error('Failed to verify email link. Please try again.');
      }
      
      // Redirect back to login after error
      setTimeout(() => router.push('/login'), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    const currentUrl = window.location.href;
    await handleEmailLinkVerification(email, currentUrl);
  };

  if (isVerifying && !needsEmail) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">Verifying Email</CardTitle>
            <CardDescription className="text-center">
              Please wait while we verify your email link...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Image 
              src="/Logo_Cybermitra.svg" 
              alt="CyberMitra Logo" 
              width={64} 
              height={64}
            />
          </div>
          <CardTitle className="text-2xl text-center">
            {needsEmail ? 'Complete Sign In' : 'Email Verified'}
          </CardTitle>
          <CardDescription className="text-center">
            {needsEmail 
              ? 'Please enter your email address to complete the sign-in process'
              : 'Your email has been successfully verified'
            }
          </CardDescription>
        </CardHeader>
        
        {needsEmail && (
          <CardContent>
            <form onSubmit={handleManualEmailSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// Loading component for Suspense fallback
function VerifyEmailLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Loading...</CardTitle>
          <CardDescription className="text-center">
            Preparing email verification...
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

// Main export wrapped in Suspense
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}
