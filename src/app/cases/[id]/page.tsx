"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { auth } from '@/lib/firebase';
import {
  getCaseById,
  getTimelineForCase,
  getNotesForCase,
  addTimelineEventToCase,
  addNoteToCase,
  getEvidenceForCase,
  deleteEvidence
} from '@/lib/api';
import type { Case, TimelineEvent, Note, NewTimelineEventData, NewNoteData, Evidence } from '@/types/case';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { EvidenceCard } from '@/components/cases/EvidenceCard';
import { AddEvidenceDialog } from '@/components/dialogs/AddEvidenceDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Timestamp } from 'firebase/firestore';

const CaseDetailPage = () => {
  const params = useParams();
  const caseId = params.id as string;
  const [caseDetails, setCaseDetails] = useState<Case | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTimelineDialogOpen, setIsTimelineDialogOpen] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isAddEvidenceDialogOpen, setIsAddEvidenceDialogOpen] = useState(false);

  const INITIAL_TIMELINE_EVENT: NewTimelineEventData = {
    title: '',
    description: '',
    eventType: 'investigation',
    eventDate: Timestamp.now(),
    isPublic: false,
  };

  // Helper function to get datetime-local value from eventDate
  const getDateTimeLocalValue = (eventDate: Timestamp | string | Date): string => {
    if (eventDate instanceof Timestamp) {
      return eventDate.toDate().toISOString().slice(0, 16);
    } else if (eventDate instanceof Date) {
      return eventDate.toISOString().slice(0, 16);
    } else if (typeof eventDate === 'string') {
      return eventDate;
    }
    return new Date().toISOString().slice(0, 16);
  };

  // Helper function to convert eventDate to Timestamp for submission
  const convertToTimestamp = (eventDate: Timestamp | string | Date): Timestamp => {
    if (eventDate instanceof Timestamp) {
      return eventDate;
    } else if (eventDate instanceof Date) {
      return Timestamp.fromDate(eventDate);
    } else if (typeof eventDate === 'string') {
      return Timestamp.fromDate(new Date(eventDate));
    }
    return Timestamp.now();
  };

  const INITIAL_NOTE: NewNoteData = {
    content: '',
    noteType: 'investigation',
    isPrivate: true,
  };

  const [newTimelineEventForm, setNewTimelineEventForm] = useState<NewTimelineEventData>(INITIAL_TIMELINE_EVENT);
  const [newNoteForm, setNewNoteForm] = useState<NewNoteData>(INITIAL_NOTE);

  useEffect(() => {
    if (!caseId) return;

    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [details, timeline, notesData, evidenceData] = await Promise.all([
          getCaseById(caseId),
          getTimelineForCase(caseId),
          getNotesForCase(caseId),
          getEvidenceForCase(caseId),
        ]);
        setCaseDetails(details);
        setTimelineEvents(timeline);
        setNotes(notesData);
        setEvidence(evidenceData);
      } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred.';
        toast.error(`Failed to load case data: ${errorMessage}`);
        console.error('Error fetching case data:', error);
      }
      setIsLoading(false);
    };

    fetchAllData();
  }, [caseId]);

  const handleTimelineFormChange = (field: keyof NewTimelineEventData, value: any) => {
    setNewTimelineEventForm(prev => ({ ...prev, [field]: value }));
  };

  const handleNoteFormChange = (field: keyof NewNoteData, value: any) => {
    setNewNoteForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTimelineEventSubmit = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error('You must be logged in to add a timeline event.');
      return;
    }
    try {
      await addTimelineEventToCase(caseId, { ...newTimelineEventForm, eventDate: convertToTimestamp(newTimelineEventForm.eventDate) }, currentUser.uid);
      toast.success('Timeline event added successfully!');
      setNewTimelineEventForm(INITIAL_TIMELINE_EVENT);
      setIsTimelineDialogOpen(false);
      const timeline = await getTimelineForCase(caseId);
      setTimelineEvents(timeline);
    } catch (error) {
      toast.error('Failed to add timeline event.');
      console.error(error);
    }
  };

  const handleAddNoteSubmit = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error('You must be logged in to add a note.');
      return;
    }
    try {
      await addNoteToCase(caseId, newNoteForm, currentUser.uid);
      toast.success('Note added successfully!');
      setNewNoteForm(INITIAL_NOTE);
      setIsNoteDialogOpen(false);
      const notesData = await getNotesForCase(caseId);
      setNotes(notesData);
    } catch (error) {
      toast.error('Failed to add note.');
      console.error(error);
    }
  };

  const fetchEvidence = async () => {
    try {
      const evidenceData = await getEvidenceForCase(caseId);
      setEvidence(evidenceData);
    } catch (error) {
      toast.error('Failed to refresh evidence.');
    }
  };

  const handleDeleteEvidence = async (evidenceId: string) => {
    try {
      await deleteEvidence(caseId, evidenceId);
      toast.success('Evidence deleted successfully');
      fetchEvidence();
    } catch (error) {
      const errorMessage = (error as Error).message || 'An unknown error occurred.';
      toast.error(`Failed to delete evidence: ${errorMessage}`);
      console.error('Error deleting evidence:', error);
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const renderDetailRow = (label: string, value: React.ReactNode) => (
    <TableRow>
      <TableCell className="font-semibold">{label}</TableCell>
      <TableCell>{value}</TableCell>
    </TableRow>
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Skeleton className="h-10 w-1/2 mb-4" />
          <Skeleton className="h-4 w-1/4 mb-6" />
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
              <CardContent><Skeleton className="h-40 w-full" /></CardContent>
            </Card>
            <Card>
              <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
              <CardContent><Skeleton className="h-40 w-full" /></CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!caseDetails) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">
          <p>Case not found or failed to load.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ErrorBoundary>
        <div className="p-6 space-y-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Case #{caseDetails.caseNumber}</h1>
          <p className="text-muted-foreground">{caseDetails.title}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>Case Details</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    {renderDetailRow("Status", <Badge variant={caseDetails.status === 'closed' ? 'secondary' : 'default'}>{caseDetails.status}</Badge>)}
                    {renderDetailRow("Priority", <Badge variant={getPriorityBadgeVariant(caseDetails.priority)}>{caseDetails.priority}</Badge>)}
                    {renderDetailRow("Date Opened", caseDetails.dateOpened.toDate().toLocaleDateString())}
                    {caseDetails.dateClosed && renderDetailRow("Date Closed", caseDetails.dateClosed.toDate().toLocaleDateString())}
                    {renderDetailRow("Assigned To", caseDetails.assignedTo?.path ?? 'Unassigned')}
                    {renderDetailRow("Created By", caseDetails.createdBy.path)}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Description</CardTitle></CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{caseDetails.description}</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Client Information</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    {renderDetailRow("Name", caseDetails.victim?.name ?? 'N/A')}
                    {renderDetailRow("Contact", caseDetails.victim?.email ?? 'N/A')}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {caseDetails.tags?.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Case Timeline</CardTitle>
            <Dialog open={isTimelineDialogOpen} onOpenChange={setIsTimelineDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Timeline Event</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Timeline Event</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input placeholder="Event Title" value={newTimelineEventForm.title} onChange={e => handleTimelineFormChange('title', e.target.value)} />
                  <Textarea placeholder="Event Description" value={newTimelineEventForm.description} onChange={e => handleTimelineFormChange('description', e.target.value)} />
                  <Input type="datetime-local" defaultValue={getDateTimeLocalValue(newTimelineEventForm.eventDate)} onChange={e => handleTimelineFormChange('eventDate', e.target.value)} />
                  <Select onValueChange={value => handleTimelineFormChange('eventType', value)} defaultValue={newTimelineEventForm.eventType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investigation">Investigation</SelectItem>
                      <SelectItem value="communication">Communication</SelectItem>
                      <SelectItem value="evidence">Evidence</SelectItem>
                      <SelectItem value="milestone">Milestone</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="isPublic" checked={newTimelineEventForm.isPublic} onCheckedChange={checked => handleTimelineFormChange('isPublic', checked as boolean)} />
                    <Label htmlFor="isPublic">Publicly Visible</Label>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                  <Button onClick={handleAddTimelineEventSubmit}>Add Event</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {timelineEvents.map(event => (
              <div key={event.id} className="mb-4 pb-4 border-b last:border-b-0">
                <p className="font-semibold">{event.title}</p>
                <p className="text-sm text-muted-foreground">{event.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{event.eventDate.toDate().toLocaleString()} - {event.eventType} - by {event.addedBy.path}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Investigator Notes</CardTitle>
            <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Note</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Note</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <Textarea placeholder="Note content..." value={newNoteForm.content} onChange={e => handleNoteFormChange('content', e.target.value)} />
                  <Select onValueChange={value => handleNoteFormChange('noteType', value)} defaultValue={newNoteForm.noteType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investigation">Investigation</SelectItem>
                      <SelectItem value="communication">Communication</SelectItem>
                      <SelectItem value="internal">Internal</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="isPrivate" checked={newNoteForm.isPrivate} onCheckedChange={checked => handleNoteFormChange('isPrivate', checked as boolean)} />
                    <Label htmlFor="isPrivate">Private Note</Label>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                  <Button onClick={handleAddNoteSubmit}>Add Note</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {notes.map(note => (
              <div key={note.id} className="mb-4 p-3 bg-muted/50 rounded-lg">
                <p>{note.content}</p>
                <p className="text-xs text-muted-foreground mt-2">{note.createdAt.toDate().toLocaleString()} - by {note.addedBy.path} - {note.noteType} {note.isPrivate ? '(Private)' : ''}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Case Evidence</CardTitle>
            <Button onClick={() => setIsAddEvidenceDialogOpen(true)}>Add Evidence</Button>
          </CardHeader>
          <CardContent>
            {evidence.length > 0 ? (
              <div className="grid gap-4">
                {evidence.map(item => (
                  <EvidenceCard key={item.id} evidence={item} onDelete={handleDeleteEvidence} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No evidence has been added yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

        <AddEvidenceDialog
          caseId={caseId}
          isOpen={isAddEvidenceDialogOpen}
          onOpenChange={setIsAddEvidenceDialogOpen}
          onEvidenceAdded={fetchEvidence}
        />
      </ErrorBoundary>
    </DashboardLayout>
  );
};

export default CaseDetailPage;
