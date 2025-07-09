
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useEventStore } from '@/store/eventStore';
import { useToast } from '@/hooks/use-toast';
import { useEventForm } from '@/hooks/useEventForm';
import { EventForm } from './EventForm';
import { EventCard } from './EventCard';
import { Event } from '@/types/event';
import { Plus } from 'lucide-react';

export const EventManagement = () => {
  const { events, loading, fetchEvents, deleteEvent } = useEventStore();
  const { toast } = useToast();
  const { resetForm, loadEventData } = useEventForm();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleEdit = useCallback((event: Event) => {
    console.log('Editing event:', event);
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
    // Load event data after dialog opens to ensure form is ready
    setTimeout(() => {
      loadEventData(event);
    }, 100);
  }, [loadEventData]);

  const handleDelete = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(eventId);
        toast({
          title: "Event Deleted",
          description: "Event has been deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete event. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    resetForm();
    setSelectedEvent(null);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    resetForm();
    setSelectedEvent(null);
  };

  const handleCancel = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    resetForm();
    setSelectedEvent(null);
  };

  const handleCreateClick = () => {
    resetForm();
    setSelectedEvent(null);
  };

  const handleEditDialogOpenChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      resetForm();
      setSelectedEvent(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Event Management</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateClick}>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <EventForm 
              selectedEvent={null}
              onCancel={handleCancel}
              onSuccess={handleCreateSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <EventCard 
            key={event.id}
            event={event}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <EventForm 
            selectedEvent={selectedEvent}
            onCancel={handleCancel}
            onSuccess={handleEditSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
