"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { handleCreateCase, fetchAllCases, handleGetAssignableUsers, handleUpdateCaseStatus, searchCases } from '@/lib/api';
import { Case, NewCaseData, CaseStatus } from '@/types/case';
import { AssignableUser } from '@/types/user';
import { AssignCaseDialog } from '@/components/dialogs/AssignCaseDialog';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const INITIAL_NEW_CASE_STATE: NewCaseData = {
  title: "",
  description: "",
  priority: "medium",
  caseType: "",
  source: "dashboard",
  victim: {
    name: '',
    email: '',
    phone: '',
  },
  amountInvolved: 0,
  currency: 'USD',
  tags: [],
};

export default function CasesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<CaseStatus>("unverified");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>([]);
  const [allCases, setAllCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Partial<Case>[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newCaseForm, setNewCaseForm] = useState<NewCaseData>(INITIAL_NEW_CASE_STATE);

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const fetchedCases = await fetchAllCases();
      setAllCases(fetchedCases);
    } catch (error) {
      toast.error("Failed to fetch cases.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCases();
    }
  }, [user]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery) {
        setIsSearching(true);
        searchCases(searchQuery).then(results => {
          setSearchResults(results);
          setIsSearching(false);
        }).catch(err => {
            toast.error("Search failed.");
            console.error(err);
            setIsSearching(false);
        });
      } else {
        setSearchResults([]);
      }
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const filteredCases = useMemo(() => {
    return allCases.filter((c) => c.status === activeTab);
  }, [allCases, activeTab]);

  const casesToDisplay = searchQuery ? searchResults : filteredCases;

  const handleFormChange = (field: keyof NewCaseData, value: any) => {
    let processedValue = value;
    if (field === 'tags' && typeof value === 'string') {
      processedValue = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    } else if (field === 'amountInvolved') {
      processedValue = Number(value) || 0;
    }
    setNewCaseForm((prev) => ({ ...prev, [field]: processedValue }));
  };

  const handleVictimInfoChange = (field: keyof NewCaseData['victim'], value: string) => {
    setNewCaseForm((prev) => ({
      ...prev,
      victim: {
        ...prev.victim,
        [field]: value,
      },
    }));
  };

  const handleSubmitNewCase = async () => {
    if (!user) {
      toast.error("You must be logged in to create a case.");
      return;
    }
    if (!newCaseForm.title || !newCaseForm.caseType || !newCaseForm.victim.name) {
      toast.error("Please fill in all required fields: Title, Case Type, and Victim Name.");
      return;
    }

    try {
      const result = await handleCreateCase(newCaseForm);
      toast.success(`Case created successfully! Case Number: ${result.caseNumber}`);
      
      await fetchCases();
      
      setIsCreateDialogOpen(false);
      setNewCaseForm(INITIAL_NEW_CASE_STATE);
    } catch (error: any) {
      toast.error(`Error creating case: ${error.message}`);
    }
  };

  const handleOpenAssignDialog = async (caseToAssign: Case) => {
    if (!user) return;
    if (!['Super Admin', 'Senior Investigator'].includes(user.role)) {
      toast.error("You are not authorized to assign cases.");
      return;
    }
    try {
      const users = await handleGetAssignableUsers();
      setAssignableUsers(users);
      setSelectedCase(caseToAssign);
      setIsAssignDialogOpen(true);
    } catch (error) {
      toast.error('Failed to fetch users for assignment.');
    }
  };

  const handleUpdateStatus = async (caseId: string, status: 'closed' | 'archived') => {
    if (!user) return;
    if (!['Super Admin', 'Senior Investigator'].includes(user.role)) {
      toast.error(`You are not authorized to ${status} cases.`);
      return;
    }
    try {
      await handleUpdateCaseStatus(caseId, status);
      toast.success(`Case successfully ${status}.`);
      fetchCases();
    } catch (error) {
      toast.error(`Failed to ${status} the case.`);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Case Management</h1>
        <Input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by case number"
          className="w-64"
        />
        {user && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create New Case</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Case</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new case.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">Title</Label>
                  <Input id="title" value={newCaseForm.title} onChange={(e) => handleFormChange('title', e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">Description</Label>
                  <Textarea id="description" value={newCaseForm.description} onChange={(e) => handleFormChange('description', e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="caseType" className="text-right">Case Type</Label>
                  <Input id="caseType" value={newCaseForm.caseType} onChange={(e) => handleFormChange('caseType', e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="priority" className="text-right">Priority</Label>
                  <Select onValueChange={(value) => handleFormChange('priority', value as "low" | "medium" | "high")} defaultValue={newCaseForm.priority}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="source" className="text-right">Source</Label>
                  <Select onValueChange={(value) => handleFormChange('source', value)} defaultValue={newCaseForm.source}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                      <SelectItem value="bot">Bot</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amountInvolved" className="text-right">Amount Involved</Label>
                  <Input id="amountInvolved" type="number" value={newCaseForm.amountInvolved} onChange={(e) => handleFormChange('amountInvolved', e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="currency" className="text-right">Currency</Label>
                  <Select onValueChange={(value) => handleFormChange('currency', value)} defaultValue={newCaseForm.currency}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="INR">INR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tags" className="text-right">Tags</Label>
                  <Input id="tags" value={(newCaseForm.tags || []).join(', ')} onChange={(e) => handleFormChange('tags', e.target.value)} className="col-span-3" placeholder="e.g. phishing, scam, social-engineering" />
                </div>
                <h4 className="font-semibold mt-4 col-span-4">Victim Information</h4>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="victimName" className="text-right">Name</Label>
                  <Input id="victimName" value={newCaseForm.victim.name} onChange={(e) => handleVictimInfoChange('name', e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="victimEmail" className="text-right">Email</Label>
                  <Input id="victimEmail" type="email" value={newCaseForm.victim.email} onChange={(e) => handleVictimInfoChange('email', e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="victimPhone" className="text-right">Phone</Label>
                  <Input id="victimPhone" value={newCaseForm.victim.phone} onChange={(e) => handleVictimInfoChange('phone', e.target.value)} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleSubmitNewCase}>Create Case</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Case List</CardTitle>
            <Tabs defaultValue="unverified" value={activeTab} onValueChange={(value) => setActiveTab(value as CaseStatus)}>
              <TabsList>
                <TabsTrigger value="unverified">Pending</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="closed">Closed</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Case Number</TableHead>
                <TableHead>Case Type</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Opened</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : isSearching ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Searching...</TableCell>
                </TableRow>
              ) : casesToDisplay.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? `No results found for "${searchQuery}"` : `No ${activeTab} cases found`}
                  </TableCell>
                </TableRow>
              ) : (
                casesToDisplay.map((c) => {
                  if (!c.id) return null; // Don't render if case has no ID

                  const isSearchResult = searchQuery.length > 0;
                  const date = c.dateOpened || c.createdAt;

                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Link href={`/cases/${c.id}`} className="text-blue-600 hover:underline">
                          {c.id.substring(0, 6)}...
                        </Link>
                      </TableCell>
                      <TableCell>{c.title ?? 'N/A'}</TableCell>
                      <TableCell>{c.caseNumber ?? 'N/A'}</TableCell>
                      <TableCell>{c.caseType ?? 'N/A'}</TableCell>
                      <TableCell>{c.assignedTo?.username ?? 'Unassigned'}</TableCell>
                      <TableCell>{date ? new Date(date).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell className="space-x-2">
                        {!isSearchResult && user && ['Super Admin', 'Senior Investigator'].includes(user.role) && (
                          <>
                            {(c as Case).status === 'unverified' && (
                              <Button variant="outline" size="sm" onClick={() => handleOpenAssignDialog(c as Case)}>Assign</Button>
                            )}
                            {(c as Case).status === 'active' && (
                              <>
                                <Button variant="destructive" size="sm" onClick={() => handleUpdateStatus(c.id!, 'closed')}>Close</Button>
                                <Button variant="secondary" size="sm" onClick={() => handleUpdateStatus(c.id!, 'archived')}>Archive</Button>
                              </>
                            )}
                          </>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/cases/${c.id}`}>View Details</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedCase && (
        <AssignCaseDialog
          isOpen={isAssignDialogOpen}
          onOpenChange={setIsAssignDialogOpen}
          caseId={selectedCase.id}
          assignableUsers={assignableUsers}
          onCaseAssigned={() => {
            toast.success('Case assigned successfully!');
            fetchCases();
            setIsAssignDialogOpen(false); // Close dialog on success
          }}
        />
      )}
    </DashboardLayout>
  );
}