import { create } from 'zustand';
import { Event, EventRegistration, RegistrationFormData } from '@/types/event';
import { simpleEventService } from '@/services/simpleEventService';

interface EventState {
  events: Event[];
  registrations: EventRegistration[];
  loading: boolean;
  error: string | null;
  
  // Event methods
  fetchEvents: () => Promise<void>;
  createEvent: (event: Omit<Event, 'id'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  
  // Registration methods
  registerForEvent: (registrationData: RegistrationFormData, userId?: string, userEmail?: string) => Promise<{ id: string; sequenceNumber: number }>;
  fetchUserRegistrations: (userId: string) => Promise<void>;
  updateRegistration: (id: string, updates: Partial<EventRegistration>) => Promise<void>;
  cancelRegistration: (id: string) => Promise<void>;
  
  // Admin methods
  fetchAllRegistrations: () => Promise<void>;
  exportRegistrations: (filters?: { eventId?: string }) => Promise<void>;
  deleteRegistration: (id: string) => Promise<void>;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  registrations: [],
  loading: false,
  error: null,

  fetchEvents: async () => {
    set({ loading: true, error: null });
    try {
      const events = await simpleEventService.getEvents();
      set({ events, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch events', loading: false });
      console.error('Error fetching events:', error);
    }
  },

  createEvent: async (eventData) => {
    set({ loading: true, error: null });
    try {
      await simpleEventService.createEvent(eventData);
      await get().fetchEvents();
    } catch (error) {
      set({ error: 'Failed to create event', loading: false });
      console.error('Error creating event:', error);
      throw error;
    }
  },

  updateEvent: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      await simpleEventService.updateEvent(id, updates);
      await get().fetchEvents();
    } catch (error) {
      set({ error: 'Failed to update event', loading: false });
      console.error('Error updating event:', error);
      throw error;
    }
  },

  deleteEvent: async (id) => {
    set({ loading: true, error: null });
    try {
      await simpleEventService.deleteEvent(id);
      await get().fetchEvents();
    } catch (error) {
      set({ error: 'Failed to delete event', loading: false });
      console.error('Error deleting event:', error);
      throw error;
    }
  },

  registerForEvent: async (registrationData, userId, userEmail) => {
    set({ loading: true, error: null });
    try {
      console.log('Allowing multiple registrations for the same event');
      
      const result = await simpleEventService.registerForEvent({
        ...registrationData,
        userId,
        userEmail
      });
      
      // Refresh both events and user registrations after successful registration
      await get().fetchEvents();
      if (userId) {
        await get().fetchUserRegistrations(userId);
      }
      
      set({ loading: false });
      return result;
    } catch (error) {
      set({ error: 'Failed to register for event', loading: false });
      console.error('Error registering for event:', error);
      throw error;
    }
  },

  fetchUserRegistrations: async (userId) => {
    set({ loading: true, error: null });
    try {
      const registrations = await simpleEventService.getUserRegistrations(userId);
      set({ registrations, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch registrations', loading: false });
      console.error('Error fetching user registrations:', error);
    }
  },

  updateRegistration: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      await simpleEventService.updateRegistration(id, updates);
      
      // Update both admin and user registrations in the store
      const state = get();
      const updatedRegistrations = state.registrations.map(reg => 
        reg.id === id ? { ...reg, ...updates } : reg
      );
      set({ registrations: updatedRegistrations, loading: false });
      
      // Also refresh all registrations to ensure consistency
      await get().fetchAllRegistrations();
    } catch (error) {
      set({ error: 'Failed to update registration', loading: false });
      console.error('Error updating registration:', error);
      throw error;
    }
  },

  cancelRegistration: async (id) => {
    set({ loading: true, error: null });
    try {
      await simpleEventService.updateRegistration(id, { status: 'cancelled' });
      const state = get();
      const updatedRegistrations = state.registrations.map(reg => 
        reg.id === id ? { ...reg, status: 'cancelled' as const } : reg
      );
      set({ registrations: updatedRegistrations, loading: false });
    } catch (error) {
      set({ error: 'Failed to cancel registration', loading: false });
      console.error('Error cancelling registration:', error);
      throw error;
    }
  },

  fetchAllRegistrations: async () => {
    set({ loading: true, error: null });
    try {
      const registrations = await simpleEventService.getAllRegistrations();
      set({ registrations, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch all registrations', loading: false });
      console.error('Error fetching all registrations:', error);
    }
  },

  exportRegistrations: async (filters) => {
    set({ loading: true, error: null });
    try {
      await simpleEventService.exportRegistrations(filters);
      set({ loading: false });
    } catch (error) {
      set({ error: 'Failed to export registrations', loading: false });
      console.error('Error exporting registrations:', error);
      throw error;
    }
  },

  deleteRegistration: async (id) => {
    set({ loading: true, error: null });
    try {
      await simpleEventService.deleteRegistration(id);
      const state = get();
      const updatedRegistrations = state.registrations.filter(reg => reg.id !== id);
      set({ registrations: updatedRegistrations, loading: false });
    } catch (error) {
      set({ error: 'Failed to delete registration', loading: false });
      console.error('Error deleting registration:', error);
      throw error;
    }
  },
}));
