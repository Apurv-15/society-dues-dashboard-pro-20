import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, increment, query, where, limit, orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firebaseConfig } from '../firebaseConfig';
import { Event, EventRegistration, RegistrationFormData } from '@/types/event';
import * as XLSX from 'xlsx';

initializeApp(firebaseConfig);

const db = getFirestore();
const storage = getStorage();

interface WhatsAppConfig {
  number: string;
}

class SimpleEventService {
  private db = getFirestore();
  private storage = getStorage();
  private eventsCollection = 'events';
  private registrationsCollection = 'registrations';
  private whatsappConfigDocument = 'whatsapp_config';

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

  async generateSequenceNumber(eventId: string): Promise<number> {
    const q = query(
      collection(this.db, this.registrationsCollection),
      where('eventId', '==', eventId),
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
      // Generate a unique sequence number for this specific event
      const sequenceNumber = await this.generateSequenceNumber(registrationData.eventId);
      
      // Create base registration document
      const registrationDoc: any = {
        eventId: registrationData.eventId,
        eventName: '', // Will be populated below
        userId: registrationData.userId || '',
        userEmail: registrationData.userEmail || '',
        sequenceNumber,
        participants: registrationData.participants,
        contactPhoneNumber: registrationData.contactPhoneNumber,
        registrationDate: new Date().toISOString(),
        status: 'confirmed' as const, // Auto-confirm all registrations
        performanceOrder: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Only add optional fields if they have values (not undefined)
      if (registrationData.choreographer) {
        registrationDoc.choreographer = registrationData.choreographer;
      }
      
      if (registrationData.songUrl) {
        registrationDoc.songUrl = registrationData.songUrl;
      }
      
      if (registrationData.songFileName) {
        registrationDoc.songFileName = registrationData.songFileName;
      }
      
      if (registrationData.groupName) {
        registrationDoc.groupName = registrationData.groupName;
      }

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
      const registrations = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventRegistration));
      
      // Sort by sequence number in ascending order
      return registrations.sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0));
    } catch (error) {
      console.error('Error fetching all registrations:', error);
      throw error;
    }
  }

  async updateRegistration(id: string, updates: Partial<EventRegistration>): Promise<void> {
    try {
      const registrationRef = doc(this.db, this.registrationsCollection, id);
      
      // Create update object, filtering out undefined values
      const updateData: any = {};
      
      Object.keys(updates).forEach(key => {
        const value = updates[key as keyof EventRegistration];
        if (value !== undefined) {
          updateData[key] = value;
        }
      });
      
      // Add updatedAt timestamp
      updateData.updatedAt = new Date();
      
      await updateDoc(registrationRef, updateData);
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

  async uploadSongFile(file: File, userId: string): Promise<string> {
    try {
      const storageRef = ref(this.storage, `songs/${userId}/${file.name}`);
      await uploadBytes(storageRef, file);
      return getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error uploading song file:", error);
      throw error;
    }
  }

  async exportRegistrations(filters?: { eventId?: string }): Promise<void> {
    try {
      console.log('Starting Excel export with filters:', filters);
      
      // Fetch all registrations
      let registrations = await this.getAllRegistrations();
      
      // Apply event filter if specified
      if (filters?.eventId) {
        registrations = registrations.filter(reg => reg.eventId === filters.eventId);
      }
      
      // Sort by sequence number in ascending order for the specific event
      registrations.sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0));
      
      // Fetch all events for name mapping
      const events = await this.getEvents();
      const eventMap = events.reduce((map, event) => {
        map[event.id] = event.name;
        return map;
      }, {} as Record<string, string>);
      
      // Prepare data for Excel export
      const exportData: any[] = [];
      
      registrations.forEach(registration => {
        registration.participants.forEach((participant, index) => {
          exportData.push({
            'Sequence Number': registration.sequenceNumber || 'N/A',
            'Event Name': registration.eventName || eventMap[registration.eventId] || 'Unknown Event',
            'Registration Date': new Date(registration.registrationDate).toLocaleDateString(),
            'Status': registration.status,
            'Group Name': registration.groupName || 'N/A',
            'Choreographer': registration.choreographer || 'N/A',
            'Song File': registration.songFileName || 'N/A',
            'Contact Phone': registration.contactPhoneNumber || 'N/A',
            'User Email': registration.userEmail || 'N/A',
            'Participant Name': participant.name,
            'Participant Age': participant.age
          });
        });
      });
      
      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');
      
      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 10);
      const eventName = filters?.eventId ? 
        (eventMap[filters.eventId] || 'Event').replace(/[^a-zA-Z0-9]/g, '_') : 
        'All_Events';
      const filename = `${eventName}_Registrations_${timestamp}.xlsx`;
      
      // Download the file
      XLSX.writeFile(workbook, filename);
      
      console.log('Excel export completed successfully');
    } catch (error) {
      console.error('Error exporting registrations:', error);
      throw error;
    }
  }

  async getWhatsAppConfig(): Promise<WhatsAppConfig> {
    try {
      const docRef = doc(this.db, 'config', this.whatsappConfigDocument);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { number: docSnap.data().number || '+15551234567' } as WhatsAppConfig;
      } else {
        console.log('WhatsApp config not found, using default.');
        return { number: '+15551234567' }; // Default number
      }
    } catch (error) {
      console.error('Error fetching WhatsApp config:', error);
      return { number: '+15551234567' }; // Default number in case of error
    }
  }

  async updateWhatsAppConfig(number: string): Promise<void> {
    try {
      const docRef = doc(this.db, 'config', this.whatsappConfigDocument);
      await updateDoc(docRef, { number: number });
    } catch (error) {
      console.error('Error updating WhatsApp config:', error);
      throw error;
    }
  }
}

export const simpleEventService = new SimpleEventService();
