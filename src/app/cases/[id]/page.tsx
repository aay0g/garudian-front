"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { getCaseById, getCaseTimeline, getCaseNotes, handleAddTimelineEvent, addNoteToCase, getEvidenceForCase, deleteCaseEvidence } from '@/lib/api';
import { Case, TimelineEvent, Note, NewTimelineEvent, NewNote, CaseEvidence } from '@/types/case';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { EvidenceCard } from '@/components/cases/EvidenceCard';
import { AddEvidenceDialog } from '@/components/dialogs/AddEvidenceDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

const CaseDetailPage = () => {
  const params = useParams();
  const caseId = params.id as string;
  const [caseDetails, setCaseDetails] = useState<Case | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [evidence, setEvidence] = useState<CaseEvidence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTimelineDialogOpen, setIsTimelineDialogOpen] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isAddEvidenceDialogOpen, setIsAddEvidenceDialogOpen] = useState(false);

  const INITIAL_TIMELINE_EVENT: NewTimelineEvent = {
    title: '',
    description: '',
    eventType: 'investigation',
    eventDate: new Date().toISOString().slice(0, 16),
    isPublic: false,
  };

  const INITIAL_NOTE: NewNote = {
    content: '',
    noteType: 'investigation',
    isPrivate: true,
  };

  const [newTimelineEventForm, setNewTimelineEventForm] = useState<NewTimelineEvent>(INITIAL_TIMELINE_EVENT);
  const [newNoteForm, setNewNoteForm] = useState<NewNote>(INITIAL_NOTE);

  useEffect(() => {
    if (!caseId) return;

    const fetchAllData = async () => {
      setIsLoading(true);

      const fetchCaseDetails = async () => {
        try {
          const details = await getCaseById(caseId);
          setCaseDetails(details);
        } catch (error) {
          const errorMessage = (error as Error).message || 'An unknown error occurred.';
          toast.error(`Failed to fetch case details: ${errorMessage}`);
          console.error('Error fetching case details:', error);
          setCaseDetails(null); // Ensure case details are cleared on error
        }
      };

      const fetchTimeline = async () => {
        try {
          const timeline = await getCaseTimeline(caseId);
          setTimelineEvents(timeline);
        } catch (error) {
          const errorMessage = (error as Error).message || 'An unknown error occurred.';
          toast.error(`Failed to fetch timeline: ${errorMessage}`);
          console.error('Error fetching timeline:', error);
        }
      };

      const fetchNotes = async () => {
        try {
          const notesData = await getCaseNotes(caseId);
          setNotes(notesData);
        } catch (error) {
          const errorMessage = (error as Error).message || 'An unknown error occurred.';
          toast.error(`Failed to fetch notes: ${errorMessage}`);
          console.error('Error fetching notes:', error);
        }
      };

      const fetchEvidenceData = async () => {
        try {
          const evidenceData = await getEvidenceForCase(caseId);
          setEvidence(evidenceData);
        } catch (error) {
          const errorMessage = (error as Error).message || 'An unknown error occurred.';
          toast.error(`Failed to fetch evidence: ${errorMessage}`);
          console.error('Error fetching evidence:', error);
        }
      };

      await Promise.all([
        fetchCaseDetails(),
        fetchTimeline(),
        fetchNotes(),
        fetchEvidenceData(),
      ]);

      setIsLoading(false);
    };

    fetchAllData();
  }, [caseId]);

  const handleTimelineFormChange = (field: keyof NewTimelineEvent, value: any) => {
    setNewTimelineEventForm(prev => ({ ...prev, [field]: value }));
  };

  const handleNoteFormChange = (field: keyof NewNote, value: any) => {
    setNewNoteForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTimelineEventSubmit = async () => {
    if (!caseId) return;
    try {
      await handleAddTimelineEvent(caseId, {
        ...newTimelineEventForm,
        eventDate: new Date(newTimelineEventForm.eventDate).toISOString(),
      });
      toast.success('Timeline event added successfully.');
      setIsTimelineDialogOpen(false);
      setNewTimelineEventForm(INITIAL_TIMELINE_EVENT);
      const timeline = await getCaseTimeline(caseId);
      setTimelineEvents(timeline);
    } catch (error) {
      toast.error('Failed to add timeline event.');
    }
  };

  const handleAddNoteSubmit = async () => {
    if (!caseId) return;
    try {
      await addNoteToCase(caseId, newNoteForm);
      toast.success('Note added successfully.');
      setIsNoteDialogOpen(false);
      setNewNoteForm(INITIAL_NOTE);
      const notesData = await getCaseNotes(caseId);
      setNotes(notesData);
    } catch (error) {
      toast.error('Failed to add note.');
    }
  };

  const fetchEvidence = async () => {
    if (!caseId) return;
    try {
      const evidenceData = await getEvidenceForCase(caseId);
      setEvidence(evidenceData);
    } catch (error) {
      toast.error('Failed to refresh evidence.');
    }
  };

  const handleDeleteEvidence = async (evidenceId: string) => {
    if (!caseId) return;
    const toastId = toast.loading('Deleting evidence...');
    try {
      await deleteCaseEvidence(caseId, evidenceId);
      toast.success('Evidence deleted successfully.', { id: toastId });
      fetchEvidence(); // Refresh list
    } catch (error) {
      toast.error('Failed to delete evidence.', { id: toastId });
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
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (!caseDetails) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Case Not Found</h2>
          <p className="text-muted-foreground">The requested case could not be found.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-1">{caseDetails.title}</CardTitle>
              <CardDescription>Case #{caseDetails.caseNumber}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getPriorityBadgeVariant(caseDetails.priority)}>{caseDetails.priority}</Badge>
              <Badge variant="default">{caseDetails.status}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{caseDetails.description}</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader><CardTitle>Case Information</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {renderDetailRow('Case Type', caseDetails.caseType)}
                {renderDetailRow('Amount Involved', `${caseDetails.amountInvolved?.toLocaleString() ?? 'N/A'} ${caseDetails.currency}`)}
                {renderDetailRow('Tags', caseDetails.tags?.join(', ') || 'None')}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>People Involved</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {renderDetailRow('Victim Name', caseDetails.victim.name)}
                {renderDetailRow('Victim Email', caseDetails.victim.email)}
                {renderDetailRow('Victim Phone', caseDetails.victim.phone || 'N/A')}
                {renderDetailRow('Created By', caseDetails.createdBy.username)}
                {renderDetailRow('Assigned To', caseDetails.assignedTo ? caseDetails.assignedTo.username : 'Unassigned')}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Case Timeline</CardTitle>
            <Dialog open={isTimelineDialogOpen} onOpenChange={setIsTimelineDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Event</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Timeline Event</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input placeholder="Title" value={newTimelineEventForm.title} onChange={e => handleTimelineFormChange('title', e.target.value)} />
                  <Textarea placeholder="Description" value={newTimelineEventForm.description} onChange={e => handleTimelineFormChange('description', e.target.value)} />
                  <Input type="datetime-local" value={newTimelineEventForm.eventDate} onChange={e => handleTimelineFormChange('eventDate', e.target.value)} />
                  <Select onValueChange={value => handleTimelineFormChange('eventType', value)} defaultValue={newTimelineEventForm.eventType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="incident">Incident</SelectItem>
                      <SelectItem value="investigation">Investigation</SelectItem>
                      <SelectItem value="communication">Communication</SelectItem>
                      <SelectItem value="resolution">Resolution</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="isPublic" checked={newTimelineEventForm.isPublic} onCheckedChange={checked => handleTimelineFormChange('isPublic', checked)} />
                    <Label htmlFor="isPublic">Visible to victim</Label>
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
                <p className="text-xs text-muted-foreground mt-1">{new Date(event.eventDate).toLocaleString()} - {event.eventType} - by {event.addedBy.username}</p>
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
                    <Checkbox id="isPrivate" checked={newNoteForm.isPrivate} onCheckedChange={checked => handleNoteFormChange('isPrivate', checked)} />
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
                <p className="text-xs text-muted-foreground mt-2">{new Date(note.createdAt).toLocaleString()} - by {note.addedBy.username} - {note.noteType} {note.isPrivate ? '(Private)' : ''}</p>
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
    </DashboardLayout>
  );
};

export default CaseDetailPage;
