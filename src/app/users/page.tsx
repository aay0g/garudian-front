"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAllUsers } from '@/lib/api';
import { UserProfile } from '@/types/user';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AddUserDialog } from '@/components/dialogs/AddUserDialog';
import DashboardLayout from '@/components/layout/DashboardLayout';

// This is a presentational component for displaying the list of users
function UsersList({
  users,
  isLoading,
  error,
  onAddUser,
}: {
  users: UserProfile[];
  isLoading: boolean;
  error: string | null;
  onAddUser: () => void;
}) {
  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>User Management</CardTitle>
          <Button onClick={onAddUser}>Add New User</Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading users...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{`${u.firstName} ${u.lastName}`}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell>{u.isActive ? 'Active' : 'Inactive'}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// This is the main container component
function UserManagementContainer() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);

  const fetchUsers = async () => {
    if (user?.role !== 'Super Admin') return;

    try {
      setIsLoading(true);
      const result = await getAllUsers();
      setUsers(result || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  if (user?.role !== 'Super Admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Access Denied. You are not authorized to view this page.</p>
      </div>
    );
  }

  return (
    <>
      <UsersList
        users={users}
        isLoading={isLoading}
        error={error}
        onAddUser={() => setIsAddUserDialogOpen(true)}
      />
      <AddUserDialog
        isOpen={isAddUserDialogOpen}
        onOpenChange={setIsAddUserDialogOpen}
        onUserAdded={() => {
          fetchUsers();
        }}
      />
    </>
  );
}


export default function UsersPage() {
  return (
    <DashboardLayout>
      <UserManagementContainer />
    </DashboardLayout>
  );
}
