
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Hash, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SequenceNumberPopupProps {
  isOpen: boolean;
  onClose: () => void;
  sequenceNumber: number;
  eventName: string;
}

export const SequenceNumberPopup = ({ 
  isOpen, 
  onClose, 
  sequenceNumber, 
  eventName
}: SequenceNumberPopupProps) => {
  const { toast } = useToast();

  useEffect(() => {
    console.log('SequenceNumberPopup - isOpen:', isOpen, 'sequenceNumber:', sequenceNumber);
    if (isOpen) {
      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        console.log('Auto-closing sequence number popup');
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, sequenceNumber]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold">
            Registration Successful!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Hash className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">Your Sequence Number</span>
              </div>
              <div className="text-3xl font-bold text-green-800">
                #{String(sequenceNumber).padStart(3, '0')}
              </div>
              <p className="text-sm text-green-600 mt-1">
                For {eventName}
              </p>
            </CardContent>
          </Card>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Check className="h-5 w-5 text-blue-600" />
              <span className="text-blue-800 font-semibold">You're all set!</span>
            </div>
            <p className="text-sm text-blue-700">
              Your registration has been confirmed. This dialog will close automatically.
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={onClose}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
