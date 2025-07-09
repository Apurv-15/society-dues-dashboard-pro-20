
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useEventStore } from '@/store/eventStore';
import { UserDashboard } from '@/components/user/UserDashboard';
import { UserEventsList } from '@/components/user/UserEventsList';
import { UserRegistrationsList } from '@/components/user/UserRegistrationsList';
import { CompactEventRegistrationForm } from '@/components/user/CompactEventRegistrationForm';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Event } from '@/types/event';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuthStore();
  const { 
    events, 
    registrations, 
    loading: eventsLoading, 
    fetchEvents, 
    fetchUserRegistrations 
  } = useEventStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [activeTab, setActiveTab] = useState('events');

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchEvents();
      fetchUserRegistrations(user.id);
    }
  }, [isAuthenticated, user, fetchEvents, fetchUserRegistrations]);

  // Handle automatic registration form opening from pending session storage
  useEffect(() => {
    if (isAuthenticated && events.length > 0) {
      const pendingEventId = sessionStorage.getItem('pendingRegistrationEventId');
      if (pendingEventId) {
        const event = events.find(e => e.id === pendingEventId);
        if (event) {
          console.log('Opening registration form for pending event:', event.name);
          setSelectedEvent(event);
          setShowRegistrationForm(true);
          setActiveTab('events'); // Switch to events tab
          // Clear the pending registration
          sessionStorage.removeItem('pendingRegistrationEventId');
        }
      }
    }
  }, [isAuthenticated, events]);

  const handleRegister = (event: Event) => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('registrationRedirect', { 
        detail: { eventId: event.id } 
      }));
      return;
    }
    
    setSelectedEvent(event);
    setShowRegistrationForm(true);
  };

  const handleRegistrationSuccess = () => {
    if (user) {
      fetchEvents();
      fetchUserRegistrations(user.id);
    }
    setShowRegistrationForm(false);
    setSelectedEvent(null);
    toast({
      title: "Registration Successful",
      description: "You have successfully registered for the event!",
    });
  };

  const handleCloseRegistration = () => {
    setShowRegistrationForm(false);
    setSelectedEvent(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        <UserDashboard />
        
        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="events">Available Events</TabsTrigger>
              <TabsTrigger value="registrations">My Registrations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="events" className="mt-6">
              <UserEventsList
                events={events}
                loading={eventsLoading}
                onRegister={handleRegister}
                userRegistrations={registrations}
              />
            </TabsContent>
            
            <TabsContent value="registrations" className="mt-6">
              <UserRegistrationsList
                registrations={registrations}
                events={events}
                loading={eventsLoading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CompactEventRegistrationForm
        event={selectedEvent}
        isOpen={showRegistrationForm}
        onClose={handleCloseRegistration}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  );
};

export default Dashboard;
