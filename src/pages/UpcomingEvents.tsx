
import { useState, useEffect } from 'react';
import { useEventStore } from '@/store/eventStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, ArrowLeft, MapPin, Clock } from 'lucide-react';
import { Event } from '@/types/event';
import { useToast } from '@/hooks/use-toast';
import { SimpleEventRegistrationForm } from '@/components/user/SimpleEventRegistrationForm';
import { useNavigate } from 'react-router-dom';

const UpcomingEvents = () => {
  const { events, fetchEvents, loading } = useEventStore();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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

  const handleRegisterClick = (event: Event) => {
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
    fetchEvents();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  if (showRegistrationForm && selectedEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <SimpleEventRegistrationForm
          event={selectedEvent}
          onSuccess={handleRegistrationSuccess}
          onCancel={handleCloseRegistration}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Available Events
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Register for upcoming cultural events
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {displayEvents.map((event) => (
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
      </div>
    </div>
  );
};

export default UpcomingEvents;
