"use client";

import { useState, useEffect, useCallback } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { AddContactDialog } from '@/components/dialogs/AddContactDialog';
import { DatabaseService } from '@/lib/services/DatabaseService';
import type { Contact } from '@/types/database';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Mail, Phone, Ban } from 'lucide-react';

export default function ContactsPage() {
  const collectionName = "grievance-contacts";

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedContacts = await DatabaseService.getContacts(collectionName);
      setContacts(fetchedContacts);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      toast.error("Failed to load contacts.");
    } finally {
      setIsLoading(false);
    }
  }, [collectionName]);

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Grievance Officer Contacts</h1>
        <Button onClick={() => setIsDialogOpen(true)}>Add New Contact</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Contact List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Preferred</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No contacts found. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell>{contact.organization}</TableCell>
                    <TableCell>{contact.role}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {contact.isEmailActive ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">{contact.email}</a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {contact.isPhoneActive ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        {contact.phone || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={contact.isEmailActive || contact.isPhoneActive ? 'default' : 'destructive'}>
                        {contact.isEmailActive || contact.isPhoneActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-start">
                        {contact.preferredContactMethod === 'email' && <Mail className="h-5 w-5" />}
                        {contact.preferredContactMethod === 'phone' && <Phone className="h-5 w-5" />}
                        {contact.preferredContactMethod === 'none' && <Ban className="h-5 w-5" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate max-w-[150px] inline-block">
                              {contact.description || "-"}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{contact.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AddContactDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onContactAdded={fetchContacts}
        collectionName={collectionName}
      />
    </>
  );
}
