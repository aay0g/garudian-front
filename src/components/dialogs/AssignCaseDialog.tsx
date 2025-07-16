"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateCase } from '@/lib/api';
import { doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AssignableUser } from '@/types/user';
import { toast } from 'sonner';

interface AssignCaseDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  caseId: string;
  assignableUsers: AssignableUser[];
  onCaseAssigned: () => void;
}

export function AssignCaseDialog({ isOpen, onOpenChange, caseId, assignableUsers, onCaseAssigned }: AssignCaseDialogProps) {
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedAssignee) {
      toast.error('Please select an investigator to assign.');
      return;
    }
    setIsLoading(true);
    try {
      console.log('Assigning case:', caseId, 'to user:', selectedAssignee);
      // When assigning a case, update both assignedTo and status
      const updateData = { 
        assignedTo: doc(db, 'users', selectedAssignee),
        status: 'active' as const // Change status from unverified to active
      };
      console.log('Update data:', updateData);
      
      await updateCase(caseId, updateData);
      console.log('Case assignment successful');
      
      toast.success('Case assigned successfully!');
      onCaseAssigned();
      onOpenChange(false);
      setSelectedAssignee(null); // Reset selection
    } catch (error) {
      console.error('Failed to assign case:', error);
      toast.error('Failed to assign case. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Case</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Select onValueChange={setSelectedAssignee}>
            <SelectTrigger>
              <SelectValue placeholder="Select an investigator..." />
            </SelectTrigger>
            <SelectContent>
              {assignableUsers.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.username} ({user.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading || !selectedAssignee}>
            {isLoading ? 'Assigning...' : 'Confirm Assignment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
