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
  const evidenceTypeIcon = {
    file: <File className="h-4 w-4" />,
    url: <LinkIcon className="h-4 w-4" />,
    text: <File className="h-4 w-4" />
  }[evidence.evidenceType] || <File className="h-4 w-4" />;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              {evidenceTypeIcon} {evidence.title}
            </CardTitle>
            <CardDescription>
              {evidence.description}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm text-muted-foreground">
              Added by {evidence.addedBy.id}
            </span>
            <span className="text-xs text-muted-foreground">
              {evidence.evidenceDate.toDate().toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {evidence.fileUrl && (
          <div className="mb-4">
            <a href={evidence.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              View File
            </a>
          </div>
        )}
        {evidence.textContent && (
          <div className="whitespace-pre-wrap">
            {evidence.textContent}
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the evidence.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(evidence.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
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
