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
import { handleAssignCase } from '@/lib/api';
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
      await handleAssignCase(caseId, selectedAssignee);
      onCaseAssigned();
      onOpenChange(false);
    } catch (error) {
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
