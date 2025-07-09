import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, increment, query, where, limit, orderBy } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
import { firebaseConfig } from '../firebaseConfig';
import { Event, EventRegistration, RegistrationFormData } from '@/types/event';

initializeApp(firebaseConfig);

const db = getFirestore();
const storage = getStorage();

class EventService {
  private db = getFirestore();
  private storage = getStorage();
  private eventsCollection = 'events';
  private registrationsCollection = 'registrations';

  constructor() {
    initializeApp(firebaseConfig);
  }

  async getEvents(): Promise<Event[]> {
    try {
      const querySnapshot = await getDocs(collection(this.db, this.eventsCollection));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  }

  async getEvent(id: string): Promise<Event | null> {
    try {
      const eventDoc = await getDoc(doc(this.db, this.eventsCollection, id));
      if (eventDoc.exists()) {
        return { id: eventDoc.id, ...eventDoc.data() } as Event;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching event:", error);
      throw error;
    }
  }

  async createEvent(eventData: Omit<Event, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(this.db, this.eventsCollection), eventData);
      return docRef.id;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<void> {
    try {
      const eventRef = doc(this.db, this.eventsCollection, id);
      await updateDoc(eventRef, updates);
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      const eventRef = doc(this.db, this.eventsCollection, id);
      await deleteDoc(eventRef);
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  }

  async generateSequenceNumber(): Promise<number> {
    const q = query(
      collection(this.db, this.registrationsCollection),
      orderBy('sequenceNumber', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const lastRegistration = querySnapshot.docs[0].data() as EventRegistration;
      return (lastRegistration.sequenceNumber || 0) + 1;
    } else {
      return 1;
    }
  }

  async registerForEvent(registrationData: RegistrationFormData & { userId?: string; userEmail?: string }): Promise<{ id: string; sequenceNumber: number }> {
    try {
      // Check if user already registered for this event
      if (registrationData.userId) {
        const existingQuery = query(
          collection(this.db, this.registrationsCollection),
          where('eventId', '==', registrationData.eventId),
          where('userId', '==', registrationData.userId)
        );
        const existingRegistrations = await getDocs(existingQuery);
        
        if (!existingRegistrations.empty) {
          throw new Error('You have already registered for this event');
        }
      }

      // Generate a unique sequence number
      const sequenceNumber = await this.generateSequenceNumber();
      
      const registrationDoc: Omit<EventRegistration, 'id'> = {
        eventId: registrationData.eventId,
        eventName: '', // Will be populated below
        userId: registrationData.userId || '',
        userEmail: registrationData.userEmail || '',
        sequenceNumber,
        participants: registrationData.participants,
        choreographer: registrationData.choreographer,
        songUrl: registrationData.songUrl,
        songFileName: registrationData.songFileName,
        groupName: registrationData.groupName,
        contactPhoneNumber: registrationData.contactPhoneNumber,
        registrationDate: new Date().toISOString(),
        status: 'confirmed' as const, // Auto-confirm all registrations
        performanceOrder: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Get event name
      const eventDoc = await getDoc(doc(this.db, 'events', registrationData.eventId));
      if (eventDoc.exists()) {
        registrationDoc.eventName = eventDoc.data().name;
      }

      // Add registration to Firestore
      const registrationRef = await addDoc(collection(this.db, 'registrations'), registrationDoc);
      
      // Update event participant count
      const eventRef = doc(this.db, 'events', registrationData.eventId);
      await updateDoc(eventRef, {
        currentParticipants: increment(registrationData.participants.length)
      });

      console.log('Registration successful:', { id: registrationRef.id, sequenceNumber });
      
      return {
        id: registrationRef.id,
        sequenceNumber: sequenceNumber
      };
    } catch (error) {
      console.error('Error registering for event:', error);
      throw error;
    }
  }

  async getUserRegistrations(userId: string): Promise<EventRegistration[]> {
    try {
      const q = query(
        collection(this.db, this.registrationsCollection),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventRegistration));
    } catch (error) {
      console.error('Error fetching user registrations:', error);
      throw error;
    }
  }

  async getAllRegistrations(): Promise<EventRegistration[]> {
    try {
      const querySnapshot = await getDocs(collection(this.db, this.registrationsCollection));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventRegistration));
    } catch (error) {
      console.error('Error fetching all registrations:', error);
      throw error;
    }
  }

  async updateRegistration(id: string, updates: Partial<EventRegistration>): Promise<void> {
    try {
      const registrationRef = doc(this.db, this.registrationsCollection, id);
      await updateDoc(registrationRef, updates);
    } catch (error) {
      console.error('Error updating registration:', error);
      throw error;
    }
  }

  async deleteRegistration(id: string): Promise<void> {
    try {
      const registrationRef = doc(this.db, this.registrationsCollection, id);
      await deleteDoc(registrationRef);
    } catch (error) {
      console.error('Error deleting registration:', error);
      throw error;
    }
  }

  async exportRegistrations(filters?: { eventId?: string; ageGroup?: string; gender?: string }): Promise<void> {
    // This is a placeholder. Implement the actual export logic.
    console.log('Exporting registrations with filters:', filters);
  }
}

export const eventService = new EventService();
