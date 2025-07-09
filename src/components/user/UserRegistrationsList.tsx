
import { Event, EventRegistration } from '@/types/event';
import { RegistrationCard } from './RegistrationCard';
import { EmptyRegistrations } from './EmptyRegistrations';

interface UserRegistrationsListProps {
  registrations: EventRegistration[];
  events: Event[];
  loading: boolean;
}

export const UserRegistrationsList = ({ 
  registrations, 
  events, 
  loading 
}: UserRegistrationsListProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (registrations.length === 0) {
    return <EmptyRegistrations />;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">My Event Registrations</h2>
        <p className="text-sm text-gray-500">Manage your event registrations</p>
      </div>

      <div className="grid gap-6">
        {registrations.map((registration) => {
          const event = events.find(e => e.id === registration.eventId);
          return (
            <RegistrationCard 
              key={registration.id}
              registration={registration}
              event={event}
            />
          );
        })}
      </div>
    </div>
  );
};
