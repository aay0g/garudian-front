"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { handleUpdateProfile, reauthenticateAndChangePassword, ProfileUpdateData } from "@/lib/api";
import { User, Lock, Mail, Phone, Building, Calendar } from "lucide-react";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        department: user.department || "",
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const profileData: ProfileUpdateData = {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phoneNumber: profileForm.phone,
        department: profileForm.department,
      };
      await handleUpdateProfile(user.id, profileData);
      await refreshUser();
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords don't match!");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }

    setIsLoading(true);

    try {
      await reauthenticateAndChangePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      toast.success("Password changed successfully!");
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        toast.error("The current password you entered is incorrect.");
      } else {
        toast.error("An error occurred while changing your password.");
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileFormChange = (field: string, value: string) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordFormChange = (field: string, value: string) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading user information...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        {/* User Profile Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="w-fit">
                  {user.role || "No Role"}
                </Badge>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Login</p>
                  <p className="font-medium">
                    {user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : "Never"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Edit Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileForm.firstName}
                    onChange={(e) => handleProfileFormChange("firstName", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileForm.lastName}
                    onChange={(e) => handleProfileFormChange("lastName", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => handleProfileFormChange("phone", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={profileForm.department}
                    onChange={(e) => handleProfileFormChange("department", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => handlePasswordFormChange("currentPassword", e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordFormChange("newPassword", e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={6}
                />
                <p className="text-sm text-muted-foreground">
                  Password must be at least 6 characters long
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordFormChange("confirmPassword", e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Changing..." : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Username</p>
                <p className="font-medium">{user.username}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium">{user.role}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Account Created</p>
                <p className="font-medium">
                  {user.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {user.updatedAt?.toDate().toLocaleDateString() || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 