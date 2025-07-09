
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEventStore } from '@/store/eventStore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { Event, Participant, RegistrationFormData } from '@/types/event';

interface EventRegistrationFormProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

export const EventRegistrationForm = ({ event, isOpen, onClose }: EventRegistrationFormProps) => {
  const [numberOfParticipants, setNumberOfParticipants] = useState(1);
  const [participants, setParticipants] = useState<Participant[]>([
    { name: '', age: 0, gender: 'male' as const }
  ]);
  const [choreographer, setChoreographer] = useState('');
  const [songUrl, setSongUrl] = useState('');
  const [songFileName, setSongFileName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [contactPhoneNumber, setContactPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const { registerForEvent } = useEventStore();
  const { user } = useAuthStore();
  const { toast } = useToast();

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

    setLoading(true);
    try {
      const registrationData: RegistrationFormData = {
        eventId: event.id,
        numberOfParticipants,
        participants,
        choreographer: choreographer || undefined,
        songUrl: songUrl || undefined,
        songFileName: songFileName || undefined,
        groupName: groupName || undefined,
        contactPhoneNumber: contactPhoneNumber.trim()
      };

      await registerForEvent(registrationData, user.id, user.email || '');
      
      toast({
        title: "Registration Successful",
        description: `You have successfully registered for ${event.name}`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Register for {event.name}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[75vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Information */}
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone Number</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={contactPhoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ''); // Remove all non-digit characters
                  if (value.length <= 10) { // Limit to 10 digits maximum
                    setContactPhoneNumber(value);
                  }
                }}
                placeholder="Contact number for the group (max 10 digits)"
                required
                maxLength={10}
              />
            </div>

            {/* Number of Participants */}
            <div className="space-y-2">
              <Label htmlFor="participants">Number of Participants</Label>
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

            {/* Participant Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Participant Details</h3>
              {participants.map((participant, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base">Participant {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`name-${index}`}>Name</Label>
                        <Input
                          id={`name-${index}`}
                          value={participant.name}
                          onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`age-${index}`}>Age</Label>
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
                        <Label htmlFor={`gender-${index}`}>Gender</Label>
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
                    <div>
                      <Label htmlFor={`performance-${index}`}>Performance Name (Optional)</Label>
                      <Input
                        id={`performance-${index}`}
                        value={participant.performanceName || ''}
                        onChange={(e) => updateParticipant(index, 'performanceName', e.target.value)}
                        placeholder="Name of the performance/dance"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="choreographer">Choreographer (Optional)</Label>
                <Input
                  id="choreographer"
                  value={choreographer}
                  onChange={(e) => setChoreographer(e.target.value)}
                  placeholder="Choreographer name"
                />
              </div>
              <div>
                <Label htmlFor="groupName">Group Name (Optional)</Label>
                <Input
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Group or team name"
                />
              </div>
            </div>

            {/* Song Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Song Details (Optional)</h3>
              <div>
                <Label htmlFor="songUrl">Song URL</Label>
                <Input
                  id="songUrl"
                  value={songUrl}
                  onChange={(e) => setSongUrl(e.target.value)}
                  placeholder="URL of the song for performance"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> After registration, you'll receive a sequence number. 
                  Please submit your song file via WhatsApp along with your sequence number.
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
