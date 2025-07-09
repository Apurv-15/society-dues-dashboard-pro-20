
export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  registrationDeadline: string;
  maxParticipants?: number;
  currentParticipants: number;
  ageGroups: string[];
  categories: string[];
  category?: string;
  venue?: string;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Participant {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  performanceName?: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventName: string;
  userId: string;
  userEmail: string;
  sequenceNumber: number;
  participants: Participant[];
  choreographer?: string;
  songUrl?: string;
  songFileName?: string;
  groupName?: string;
  contactPhoneNumber: string;
  registrationDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  performanceOrder?: number | null;
  createdAt?: any;
  updatedAt?: any;
}

export interface RegistrationFormData {
  eventId: string;
  numberOfParticipants: number;
  participants: Participant[];
  choreographer?: string;
  songUrl?: string;
  songFileName?: string;
  groupName?: string;
  contactPhoneNumber: string;
}
