"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { addEvidenceToCase } from '@/lib/api';
import { NewEvidenceData } from '@/types/case';
import { Timestamp } from 'firebase/firestore';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface AddEvidenceDialogProps {
  caseId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onEvidenceAdded: () => void;
}

const INITIAL_STATE = {
  title: '',
  description: '',
};

export const AddEvidenceDialog = ({ caseId, isOpen, onOpenChange, onEvidenceAdded }: AddEvidenceDialogProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file || !formData.title || !user) {
      toast.error('Please fill in all required fields and select a file.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Uploading evidence file...');

    try {
      console.log('Starting evidence upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        caseId,
        userId: user.uid
      });

      // Create evidence data (without file URL - the service will handle file upload)
      const evidenceData: Omit<NewEvidenceData, 'caseId' | 'fileUrl' | 'fileName'> = {
        title: formData.title,
        description: formData.description,
        evidenceType: 'file',
        evidenceDate: Timestamp.now(), // Use current timestamp
      };

      // Call the API with correct signature: (caseId, evidenceData, file, addedBy)
      await addEvidenceToCase(caseId, evidenceData, file, user.uid);

      toast.success('Evidence added successfully!', { id: toastId });
      onEvidenceAdded(); // Refresh the evidence list
      handleClose();
    } catch (error) {
      console.error('Error adding evidence:', error);
      toast.error('Failed to add evidence. Please try again.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(INITIAL_STATE);
    setFile(null);
    onOpenChange(false);
  };



  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <ErrorBoundary>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Add New Evidence</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Suspicious Transaction Screenshot"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="A brief description of the evidence."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="file">Evidence File</Label>
            <Input id="file" type="file" onChange={handleFileChange} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Evidence
          </Button>
        </DialogFooter>
        </DialogContent>
      </ErrorBoundary>
    </Dialog>
  );
};
