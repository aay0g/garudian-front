"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NewContactData, PreferredContactMethod } from "@/types/database";
import { DatabaseService } from "@/lib/services/DatabaseService";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AddContactDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onContactAdded: () => void;
  collectionName: string;
}

export function AddContactDialog({ isOpen, onOpenChange, onContactAdded, collectionName }: AddContactDialogProps) {
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [isEmailActive, setIsEmailActive] = useState(true);
  const [phone, setPhone] = useState("");
  const [isPhoneActive, setIsPhoneActive] = useState(true);
  const [preferredContactMethod, setPreferredContactMethod] = useState<PreferredContactMethod>('email');
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !organization || !email) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setIsLoading(true);
    try {
      const newContactData: NewContactData = {
        name,
        organization,
        role,
        email,
        isEmailActive,
        phone,
        isPhoneActive,
        preferredContactMethod,
        description,
        notes,
      };
      const newContactId = await DatabaseService.addContact(collectionName, newContactData);
      toast.success('Contact added successfully!');
      onContactAdded();
      onOpenChange(false);
      setName("");
      setOrganization("");
      setRole("");
      setEmail("");
      setIsEmailActive(true);
      setPhone("");
      setIsPhoneActive(true);
      setPreferredContactMethod('email');
      setDescription("");
      setNotes("");
    } catch (error) {
      toast.error('Failed to add contact.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Enter the details of the new contact below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="organization" className="text-right">Organization</Label>
            <Input id="organization" value={organization} onChange={(e) => setOrganization(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">Role</Label>
            <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <div className="col-span-3 flex items-center gap-4">
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-grow" />
              <div className="flex items-center gap-2 whitespace-nowrap">
                <Checkbox id="isEmailActive" checked={isEmailActive} onCheckedChange={(checked) => setIsEmailActive(Boolean(checked))} />
                <Label htmlFor="isEmailActive">Active</Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">Phone</Label>
            <div className="col-span-3 flex items-center gap-4">
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="flex-grow" />
              <div className="flex items-center gap-2 whitespace-nowrap">
                <Checkbox id="isPhoneActive" checked={isPhoneActive} onCheckedChange={(checked) => setIsPhoneActive(Boolean(checked))} />
                <Label htmlFor="isPhoneActive">Active</Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Preferred</Label>
            <RadioGroup value={preferredContactMethod} onValueChange={(value) => setPreferredContactMethod(value as 'email' | 'phone' | 'none')} className="col-span-3 flex gap-4 items-center">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email-pref" />
                <Label htmlFor="email-pref">Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phone" id="phone-pref" />
                <Label htmlFor="phone-pref">Phone</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="none-pref" />
                <Label htmlFor="none-pref">None</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Contact'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
