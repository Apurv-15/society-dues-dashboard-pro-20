
import { useState, useCallback } from 'react';
import { Event } from '@/types/event';
import { useEventStore } from '@/store/eventStore';
import { useToast } from '@/hooks/use-toast';

export const useEventForm = () => {
  const { createEvent, updateEvent, loading } = useEventStore();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    registrationDeadline: '',
    maxParticipants: '',
    venue: '',
    category: '',
    ageGroups: [] as string[],
    categories: [] as string[]
  });

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      date: '',
      registrationDeadline: '',
      maxParticipants: '',
      venue: '',
      category: '',
      ageGroups: [],
      categories: []
    });
  }, []);

  const loadEventData = useCallback((event: Event) => {
    setFormData({
      name: event.name,
      description: event.description,
      date: event.date,
      registrationDeadline: event.registrationDeadline,
      maxParticipants: event.maxParticipants?.toString() || '',
      venue: event.venue || '',
      category: event.category || '',
      ageGroups: event.ageGroups || [],
      categories: event.categories || []
    });
  }, []);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleAgeGroupToggle = useCallback((ageGroup: string) => {
    setFormData(prev => ({
      ...prev,
      ageGroups: prev.ageGroups.includes(ageGroup)
        ? prev.ageGroups.filter(ag => ag !== ageGroup)
        : [...prev.ageGroups, ageGroup]
    }));
  }, []);

  const handleCategoryToggle = useCallback((category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  }, []);

  const handleSubmit = async (selectedEvent: Event | null, onSuccess: () => void) => {
    if (!formData.name || !formData.date || !formData.registrationDeadline) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const eventData: Omit<Event, 'id'> = {
        name: formData.name,
        description: formData.description,
        date: formData.date,
        registrationDeadline: formData.registrationDeadline,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        currentParticipants: 0,
        venue: formData.venue,
        category: formData.category,
        ageGroups: formData.ageGroups.length > 0 ? formData.ageGroups : ['all'],
        categories: formData.categories.length > 0 ? formData.categories : ['general'],
        isActive: true
      };

      if (selectedEvent) {
        await updateEvent(selectedEvent.id, eventData);
        toast({
          title: "Event Updated",
          description: "Event has been updated successfully",
        });
      } else {
        await createEvent(eventData);
        toast({
          title: "Event Created",
          description: "Event has been created successfully",
        });
      }
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save event. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    formData,
    loading,
    resetForm,
    loadEventData,
    handleInputChange,
    handleAgeGroupToggle,
    handleCategoryToggle,
    handleSubmit
  };
};
