"use client";

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';

interface CloseCaseDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCaseClose: (recoveryDetails: { fullyRecovered: boolean; amountRecovered?: number }) => void;
}

export function CloseCaseDialog({ isOpen, onOpenChange, onCaseClose }: CloseCaseDialogProps) {
  const [fullyRecovered, setFullyRecovered] = useState<string | null>(null);
  const [amountRecovered, setAmountRecovered] = useState<number>(0);

  const handleClose = () => {
    setFullyRecovered(null);
    setAmountRecovered(0);
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (fullyRecovered === null) {
      toast.error('Please select a recovery status.');
      return;
    }

    const isFullyRecovered = fullyRecovered === 'yes';

    if (!isFullyRecovered && amountRecovered <= 0) {
      toast.error('Please enter a valid recovered amount.');
      return;
    }

    onCaseClose({
      fullyRecovered: isFullyRecovered,
      amountRecovered: isFullyRecovered ? undefined : amountRecovered,
    });
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close Case</DialogTitle>
          <DialogDescription>Please provide the recovery details for this case.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Was the case fully recovered?</Label>
            <RadioGroup onValueChange={(value) => setFullyRecovered(value)} value={fullyRecovered ?? ''}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no">No</Label>
              </div>
            </RadioGroup>
          </div>

          {fullyRecovered === 'no' && (
            <div className="space-y-2">
              <Label htmlFor="amountRecovered">Amount Recovered</Label>
              <Input
                id="amountRecovered"
                type="number"
                value={amountRecovered}
                onChange={(e) => setAmountRecovered(Number(e.target.value))}
                placeholder="Enter the amount recovered"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
