
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, ArrowRight, MapPin, Clock } from 'lucide-react';
import { useEventStore } from '@/store/eventStore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { Event } from '@/types/event';
import { SimpleEventRegistrationForm } from '@/components/user/SimpleEventRegistrationForm';
import { useNavigate } from 'react-router-dom';

export const EventsSection = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const { events, fetchEvents, loading } = useEventStore();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    const handleOpenRegistration = (event: CustomEvent) => {
      const eventId = event.detail.eventId;
      const eventData = displayEvents.find(e => e.id === eventId);
      if (eventData) {
        setSelectedEvent(eventData);
        setShowRegistrationForm(true);
      }
    };

    window.addEventListener('openRegistration', handleOpenRegistration as EventListener);
    return () => window.removeEventListener('openRegistration', handleOpenRegistration as EventListener);
  }, [events]);

  const defaultEvents = [
    {
      id: 'default-1',
      name: 'Dance',
      description: 'Welcoming all age group to this fantastic event',
      date: '2025-07-29',
      registrationDeadline: '2025-07-22',
      currentParticipants: 12,
      maxParticipants: 15,
      ageGroups: ['all'],
      categories: ['dance'],
      venue: 'Center rock stage',
      isActive: true
    },
    {
      id: 'default-2',
      name: 'Fancy Dress',
      description: 'Welcoming all young kids for this event',
      date: '2025-07-26',
      registrationDeadline: '2025-07-21',
      currentParticipants: 1,
      maxParticipants: 8,
      ageGroups: ['children', 'teens'],
      categories: ['drama', 'entertainment'],
      venue: 'At center rock stage',
      isActive: true
    },
    {
      id: 'default-3',
      name: 'Singing',
      description: 'Musical performances and singing competitions',
      date: '2025-07-28',
      registrationDeadline: '2025-07-23',
      currentParticipants: 5,
      maxParticipants: 20,
      ageGroups: ['all'],
      categories: ['music'],
      venue: 'Main auditorium',
      isActive: true
    }
  ];

  const displayEvents = events.length > 0 ? events : defaultEvents;
  const hasMoreEvents = displayEvents.length > 3;

  const handleRegisterClick = (event: Event) => {
    console.log('Register clicked for event:', event.name);
    
    if (!isAuthenticated) {
      console.log('User not authenticated, dispatching redirect event');
      window.dispatchEvent(new CustomEvent('registrationRedirect', { 
        detail: { eventId: event.id } 
      }));
      return;
    }
    
    console.log('User authenticated, opening registration form');
    setSelectedEvent(event);
    setShowRegistrationForm(true);
  };

  const handleRegistrationSuccess = () => {
    console.log('Registration successful, refreshing events');
    fetchEvents();
    setShowRegistrationForm(false);
    setSelectedEvent(null);
    toast({
      title: "Registration Successful",
      description: "You have successfully registered for the event!",
    });
  };

  const handleCloseRegistration = () => {
    console.log('Closing registration form');
    setShowRegistrationForm(false);
    setSelectedEvent(null);
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Show simple registration form
  if (showRegistrationForm && selectedEvent) {
    return (
      <div className="py-20 bg-white flex items-center justify-center">
        <SimpleEventRegistrationForm
          event={selectedEvent}
          onSuccess={handleRegistrationSuccess}
          onCancel={handleCloseRegistration}
        />
      </div>
    );
  }

  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Upcoming Events
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our exciting lineup of cultural events, sports activities, and community gatherings.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6 mb-8">
          {displayEvents.slice(0, 3).map((event) => (
            <Card key={event.id} className="w-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    {event.name}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      ✓ 3 Registration(s)
                    </Badge>
                  </div>
                </div>
                <p className="text-gray-600 mt-2">{event.description}</p>
              </CardHeader>
              
              <CardContent className="pt-0">
                {event.ageGroups && event.ageGroups.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Age Groups:</p>
                    <div className="flex flex-wrap gap-2">
                      {event.ageGroups.map((ageGroup) => (
                        <Badge key={ageGroup} variant="outline" className="text-sm">
                          {ageGroup}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Event Date</p>
                      <p className="font-semibold text-gray-800">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Registration Deadline</p>
                      <p className="font-semibold text-gray-800">
                        {new Date(event.registrationDeadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Participants</p>
                      <p className="font-semibold text-gray-800">
                        {event.currentParticipants}
                        {event.maxParticipants && ` / ${event.maxParticipants}`}
                      </p>
                    </div>
                  </div>

                  {event.venue && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Venue</p>
                        <p className="font-semibold text-gray-800">{event.venue}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleRegisterClick(event)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                  >
                    Register Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {hasMoreEvents && (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              {displayEvents.length - 3} more events available
            </p>
            <Button 
              onClick={() => navigate('/upcoming-events')}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              size="lg"
            >
              View All Events
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
