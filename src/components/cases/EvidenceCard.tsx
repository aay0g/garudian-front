"use client";

import { Evidence } from '@/types/case';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { File, Trash2, Link as LinkIcon } from 'lucide-react';

interface EvidenceCardProps {
  evidence: Evidence;
  onDelete: (evidenceId: string) => void;
}

export const EvidenceCard = ({ evidence, onDelete }: EvidenceCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <File className="h-5 w-5" />
              {evidence.title}
            </CardTitle>
            <CardDescription className="pt-1">
              Added by {evidence.addedBy.path} on {evidence.createdAt.toDate().toLocaleDateString()}
            </CardDescription>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the evidence record.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(evidence.id)} className="bg-destructive hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{evidence.description}</p>
        {evidence.fileUrl && (
          <a
            href={evidence.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <LinkIcon className="h-4 w-4" />
            View {evidence.fileName || 'Attachment'}
          </a>
        )}
      </CardContent>
    </Card>
  );
};
