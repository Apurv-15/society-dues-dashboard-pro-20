
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEventStore } from '@/store/eventStore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { Event, RegistrationFormData, Participant } from '@/types/event';
import { Plus, Trash2 } from 'lucide-react';
import { SequenceNumberPopup } from './SequenceNumberPopup';
import { SongUploadWidget } from '@/components/ui/SongUploadWidget';

interface SimpleEventRegistrationFormProps {
  event: Event;
  onSuccess: () => void;
  onCancel: () => void;
}

export const SimpleEventRegistrationForm = ({ event, onSuccess, onCancel }: SimpleEventRegistrationFormProps) => {
  const [participants, setParticipants] = useState<Participant[]>([
    { name: '', age: 0, gender: 'male' }
  ]);
  const [choreographer, setChoreographer] = useState('');
  const [songUrl, setSongUrl] = useState('');
  const [songFileName, setSongFileName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [contactPhoneNumber, setContactPhoneNumber] = useState('');
  const [showSequencePopup, setShowSequencePopup] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<{ id: string; sequenceNumber: number } | null>(null);

  const { registerForEvent, loading } = useEventStore();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const addParticipant = () => {
    setParticipants([...participants, { name: '', age: 0, gender: 'male' }]);
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const updateParticipant = (index: number, field: keyof Participant, value: string | number) => {
    const updated = participants.map((p, i) => 
      i === index ? { ...p, [field]: value } : p
    );
    setParticipants(updated);
  };

  const handleContactPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove all non-digit characters
    if (value.length <= 10) { // Limit to 10 digits maximum
      setContactPhoneNumber(value);
    }
  };

  const handleSongUpload = (url: string, filename: string) => {
    setSongUrl(url);
    setSongFileName(filename);
  };

  const handleSongRemove = () => {
    setSongUrl('');
    setSongFileName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register for events",
        variant: "destructive"
      });
      return;
    }

    // Validate participants
    const validParticipants = participants.filter(p => p.name.trim() && p.age > 0);
    if (validParticipants.length === 0) {
      toast({
        title: "Invalid Participants",
        description: "Please add at least one valid participant",
        variant: "destructive"
      });
      return;
    }

    // Validate contact phone number
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
        numberOfParticipants: validParticipants.length,
        participants: validParticipants,
        choreographer: choreographer.trim() || undefined,
        songUrl: songUrl.trim() || undefined,
        songFileName: songFileName.trim() || undefined,
        groupName: groupName.trim() || undefined,
        contactPhoneNumber: contactPhoneNumber.trim()
      };

      console.log('Starting registration for event:', event.name);
      const result = await registerForEvent(registrationData, user.id, user.email || '');
      console.log('Registration successful, result:', result);
      
      setRegistrationResult(result);
      setShowSequencePopup(true);
      
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register for event. Please try again.",
        variant: "destructive"
      });
      
      // Show popup for any error that occurs
      toast({
        title: "Something went wrong",
        description: "Please check your internet connection and try again. If the problem persists, contact support.",
        variant: "destructive"
      });
    }
  };

  const handleSequencePopupClose = () => {
    setShowSequencePopup(false);
    setRegistrationResult(null);
    onSuccess();
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Register for {event.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[70vh] pr-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Contact Information</Label>
                <div>
                  <Label>Contact Phone Number *</Label>
                  <Input
                    type="tel"
                    value={contactPhoneNumber}
                    onChange={handleContactPhoneChange}
                    placeholder="Enter contact number for the group"
                    required
                  />
                </div>
              </div>

              {/* Participants Section */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Participants</Label>
                {participants.map((participant, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Participant {index + 1}</span>
                      {participants.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeParticipant(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Name *</Label>
                        <Input
                          value={participant.name}
                          onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label>Age *</Label>
                        <Input
                          type="number"
                          value={participant.age || ''}
                          onChange={(e) => updateParticipant(index, 'age', parseInt(e.target.value) || 0)}
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <Label>Gender</Label>
                        <select
                          value={participant.gender}
                          onChange={(e) => updateParticipant(index, 'gender', e.target.value as 'male' | 'female')}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button type="button" variant="outline" onClick={addParticipant} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Participant
                </Button>
              </div>

              {/* Performance Details - All Optional */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Performance Details <span className="text-sm text-gray-500">(Optional - can be added later)</span></Label>
                
                <div>
                  <Label>Group Name <span className="text-sm text-gray-500">(Optional)</span></Label>
                  <Input
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter group name (can be added later)"
                  />
                </div>

                <div>
                  <Label>Choreographer <span className="text-sm text-gray-500">(Optional)</span></Label>
                  <Input
                    value={choreographer}
                    onChange={(e) => setChoreographer(e.target.value)}
                    placeholder="Enter choreographer name (can be added later)"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Song Upload <span className="text-sm text-gray-500">(Optional)</span></Label>
                  <SongUploadWidget
                    onUploadSuccess={handleSongUpload}
                    onRemove={handleSongRemove}
                    currentSongUrl={songUrl}
                    currentSongName={songFileName}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500">You can upload your song file later if needed</p>
                </div>
              </div>
            </form>
          </ScrollArea>
          
          <div className="flex gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} onClick={handleSubmit} className="flex-1">
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </div>
        </CardContent>
      </Card>

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
