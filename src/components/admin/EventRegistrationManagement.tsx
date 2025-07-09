
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEventStore } from '@/store/eventStore';
import { useToast } from '@/hooks/use-toast';
import { Users, UserCheck } from 'lucide-react';
import { RegistrationFilters } from './registration/RegistrationFilters';
import { RegistrationStats } from './registration/RegistrationStats';
import { RegistrationTable } from './registration/RegistrationTable';

export const EventRegistrationManagement = () => {
  const [selectedEvent, setSelectedEvent] = useState<string>('all-events');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const { 
    events, 
    registrations, 
    loading, 
    fetchEvents, 
    fetchAllRegistrations, 
    exportRegistrations,
    updateRegistration,
    deleteRegistration
  } = useEventStore();
  
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
    fetchAllRegistrations();
  }, [fetchEvents, fetchAllRegistrations]);

  const handleSearchChange = (value: string) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setSearchTerm(value);
    }, 300);
    
    setSearchTimeout(timeout);
  };

  const handleExport = async () => {
    try {
      await exportRegistrations({
        eventId: selectedEvent === 'all-events' ? undefined : selectedEvent
      });
      toast({
        title: "Export Successful",
        description: "Registration data has been exported to Excel with participant details and sequence numbers",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export registration data",
        variant: "destructive"
      });
    }
  };

  const handleStatusUpdate = async (registrationId: string, newStatus: 'confirmed' | 'cancelled') => {
    try {
      await updateRegistration(registrationId, { status: newStatus });
      toast({
        title: "Status Updated",
        description: `Registration ${newStatus} successfully`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update registration status",
        variant: "destructive"
      });
    }
  };

  const handleDeleteParticipant = async (registrationId: string, participantIndex: number) => {
    try {
      const registration = registrations.find(r => r.id === registrationId);
      if (!registration) return;

      const updatedParticipants = registration.participants.filter((_, index) => index !== participantIndex);
      
      // If no participants left, delete the entire registration
      if (updatedParticipants.length === 0) {
        await deleteRegistration(registrationId);
        toast({
          title: "Registration Deleted",
          description: "Registration deleted as no participants remained",
        });
      } else {
        // Update registration with remaining participants
        await updateRegistration(registrationId, { 
          participants: updatedParticipants
        });
        toast({
          title: "Participant Removed",
          description: "Participant has been removed from the registration",
        });
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to remove participant",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRegistration = async (registrationId: string) => {
    try {
      await deleteRegistration(registrationId);
      toast({
        title: "Registration Deleted",
        description: "Registration has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete registration",
        variant: "destructive"
      });
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesEvent = selectedEvent === 'all-events' || reg.eventId === selectedEvent;
    const matchesSearch = !searchTerm || 
      (reg.userEmail && reg.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      reg.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesEvent && matchesSearch;
  }).sort((a, b) => {
    // Sort by sequence number in ascending order when a specific event is selected
    if (selectedEvent !== 'all-events') {
      return (a.sequenceNumber || 0) - (b.sequenceNumber || 0);
    }
    // Default sort by registration date for all events
    return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Event Registration Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RegistrationFilters
            selectedEvent={selectedEvent}
            events={events}
            onEventChange={setSelectedEvent}
            onSearchChange={handleSearchChange}
            onExport={handleExport}
          />

          <RegistrationStats registrations={filteredRegistrations} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Detailed Participant Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RegistrationTable
            registrations={filteredRegistrations}
            onStatusUpdate={handleStatusUpdate}
            onDeleteParticipant={handleDeleteParticipant}
            onDeleteRegistration={handleDeleteRegistration}
          />
        </CardContent>
      </Card>
    </div>
  );
};
