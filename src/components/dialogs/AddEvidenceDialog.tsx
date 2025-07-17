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

interface EvidenceFormData {
  file: File;
  title: string;
  description: string;
}

export const AddEvidenceDialog = ({ caseId, isOpen, onOpenChange, onEvidenceAdded }: AddEvidenceDialogProps) => {
  const { user } = useAuth();
  const [evidenceForms, setEvidenceForms] = useState<EvidenceFormData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const newEvidenceForms = selectedFiles.map(file => ({
        file,
        title: file.name, // Pre-fill title with filename
        description: '',
      }));
      setEvidenceForms(newEvidenceForms);
    }
  };

  const handleInputChange = (index: number, field: 'title' | 'description', value: string) => {
    const updatedForms = [...evidenceForms];
    updatedForms[index][field] = value;
    setEvidenceForms(updatedForms);
  };

  const handleSubmit = async () => {
    if (evidenceForms.length === 0 || !user) {
      toast.error('Please select at least one file.');
      return;
    }

    // Validate all forms
    for (const form of evidenceForms) {
      if (!form.title) {
        toast.error(`Please provide a title for the file: ${form.file.name}`);
        return;
      }
    }

    setIsSubmitting(true);
    const toastId = toast.loading(`Uploading ${evidenceForms.length} evidence file(s)...`);

    try {
      const uploadPromises = evidenceForms.map(form => {
        const evidenceData: Omit<NewEvidenceData, 'caseId' | 'fileUrl' | 'fileName'> = {
          title: form.title,
          description: form.description,
          evidenceType: 'file',
          evidenceDate: Timestamp.now(),
        };
        return addEvidenceToCase(caseId, evidenceData, form.file, user.uid);
      });

      await Promise.all(uploadPromises);

      toast.success(`${evidenceForms.length} evidence file(s) added successfully!`, { id: toastId });
      onEvidenceAdded();
      handleClose();
    } catch (error) {
      console.error('Error adding evidence:', error);
      toast.error('Failed to add one or more evidence files. Please try again.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEvidenceForms([]);
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
            <Label htmlFor="file">Evidence File(s)</Label>
            <Input id="file" type="file" onChange={handleFileChange} multiple />
          </div>

          {evidenceForms.map((form, index) => (
            <div key={index} className="p-4 border rounded-md space-y-4 bg-secondary/50">
              <h4 className="font-semibold text-sm">{form.file.name}</h4>
              <div className="grid gap-2">
                <Label htmlFor={`title-${index}`}>Title</Label>
                <Input
                  id={`title-${index}`}
                  value={form.title}
                  onChange={(e) => handleInputChange(index, 'title', e.target.value)}
                  placeholder="e.g., Suspicious Transaction Screenshot"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`description-${index}`}>Description</Label>
                <Textarea
                  id={`description-${index}`}
                  value={form.description}
                  onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                  placeholder="A brief description of the evidence."
                />
              </div>
            </div>
          ))}
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
