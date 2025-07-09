
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEventStore } from '@/store/eventStore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { Event, Participant, RegistrationFormData } from '@/types/event';
import { SequenceNumberPopup } from './SequenceNumberPopup';

interface CompactEventRegistrationFormProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CompactEventRegistrationForm = ({ event, isOpen, onClose, onSuccess }: CompactEventRegistrationFormProps) => {
  const [numberOfParticipants, setNumberOfParticipants] = useState(1);
  const [participants, setParticipants] = useState<Participant[]>([
    { name: '', age: 0, gender: 'male' as const }
  ]);
  const [contactPhoneNumber, setContactPhoneNumber] = useState('');
  const [showSequencePopup, setShowSequencePopup] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<{ id: string; sequenceNumber: number } | null>(null);

  const { registerForEvent, loading } = useEventStore();
  const { user } = useAuthStore();
  const { toast } = useToast();

  if (!event) return null;

  const handleParticipantCountChange = (count: string) => {
    const num = parseInt(count);
    setNumberOfParticipants(num);
    
    const newParticipants: Participant[] = Array.from({ length: num }, (_, index) => 
      participants[index] || { name: '', age: 0, gender: 'male' as const }
    );
    setParticipants(newParticipants);
  };

  const updateParticipant = (index: number, field: keyof Participant, value: any) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value };
    setParticipants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (participants.some(p => !p.name || p.age <= 0)) {
      toast({
        title: "Invalid participant data",
        description: "Please fill in all participant details",
        variant: "destructive"
      });
      return;
    }

    if (!contactPhoneNumber.trim()) {
      toast({
        title: "Contact Number Required",
        description: "Please provide a contact phone number",
        variant: "destructive"
      });
      return;
    }

    try {
      const registrationData: RegistrationFormData = {
        eventId: event.id,
        numberOfParticipants,
        participants,
        contactPhoneNumber: contactPhoneNumber.trim()
      };

      const result = await registerForEvent(registrationData, user.id, user.email || '');
      setRegistrationResult(result);
      setShowSequencePopup(true);
      
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const handleSequencePopupClose = () => {
    setShowSequencePopup(false);
    setRegistrationResult(null);
    onSuccess();
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register for {event.name}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Contact Information */}
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone Number *</Label>
              <Input
                id="contactPhone"
                value={contactPhoneNumber}
                onChange={(e) => setContactPhoneNumber(e.target.value)}
                placeholder="Contact number for the group"
                required
              />
            </div>

            {/* Number of Participants */}
            <div className="space-y-2">
              <Label htmlFor="participants">Number of Participants *</Label>
              <Select value={numberOfParticipants.toString()} onValueChange={handleParticipantCountChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6,7,8,9,10].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Participant Details - Compulsory fields only */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Participant Details</h3>
              {participants.map((participant, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base">Participant {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor={`name-${index}`}>Name *</Label>
                        <Input
                          id={`name-${index}`}
                          value={participant.name}
                          onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`age-${index}`}>Age *</Label>
                        <Input
                          id={`age-${index}`}
                          type="number"
                          min="1"
                          max="100"
                          value={participant.age || ''}
                          onChange={(e) => updateParticipant(index, 'age', parseInt(e.target.value) || 0)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`gender-${index}`}>Gender *</Label>
                        <Select 
                          value={participant.gender} 
                          onValueChange={(value) => updateParticipant(index, 'gender', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {registrationResult && (
        <SequenceNumberPopup
          isOpen={showSequencePopup}
          onClose={handleSequencePopupClose}
          sequenceNumber={registrationResult.sequenceNumber}
          eventName={event.name}
        />
      )}
    </>
  );
};
