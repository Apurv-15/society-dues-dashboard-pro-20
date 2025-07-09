
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Users, Clock, User } from 'lucide-react';
import { Event, EventRegistration } from '@/types/event';

interface UserEventsListProps {
  events: Event[];
  loading: boolean;
  onRegister: (event: Event) => void;
  userRegistrations: EventRegistration[];
}

export const UserEventsList = ({ 
  events, 
  loading, 
  onRegister, 
  userRegistrations 
}: UserEventsListProps) => {
  const handleRegisterClick = (event: Event) => {
    onRegister(event);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CalendarDays className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Events Available
          </h3>
          <p className="text-gray-600">
            There are currently no active events available for registration.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Available Events</h2>
        <p className="text-sm text-gray-500">Register for upcoming cultural events</p>
      </div>

      <div className="grid gap-6">
        {events.map((event) => {
          const userRegistrationsForEvent = userRegistrations.filter(reg => reg.eventId === event.id && reg.status !== 'cancelled');
          const registrationDeadlinePassed = new Date(event.registrationDeadline) < new Date();
          const isEventPassed = new Date(event.date) < new Date();
          
          return (
            <Card key={event.id} className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl text-gray-800">{event.name}</CardTitle>
                      {event.category && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {event.category}
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">{event.description}</p>
                    
                    {event.ageGroups.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Age Groups:</p>
                        <div className="flex flex-wrap gap-1">
                          {event.ageGroups.map((ageGroup) => (
                            <Badge key={ageGroup} variant="outline" className="text-xs">
                              {ageGroup}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-gray-600">Event Date</p>
                        <p className="font-medium">
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="text-gray-600">Registration Deadline</p>
                        <p className="font-medium">
                          {new Date(event.registrationDeadline).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-gray-600">Participants</p>
                        <p className="font-medium">
                          {event.currentParticipants}
                          {event.maxParticipants && ` / ${event.maxParticipants}`}
                        </p>
                      </div>
                    </div>
                    
                    {event.venue && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-purple-600" />
                        <div>
                          <p className="text-gray-600">Venue</p>
                          <p className="font-medium">{event.venue}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      {userRegistrationsForEvent.length > 0 && (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          ✓ {userRegistrationsForEvent.length} Registration(s)
                        </Badge>
                      )}
                      {registrationDeadlinePassed && (
                        <Badge variant="destructive">
                          Registration Closed
                        </Badge>
                      )}
                      {isEventPassed && (
                        <Badge variant="secondary">
                          Event Completed
                        </Badge>
                      )}
                    </div>
                    
                    <div>
                      {registrationDeadlinePassed || isEventPassed ? (
                        <Button disabled variant="outline">
                          {isEventPassed ? 'Event Completed' : 'Registration Closed'}
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleRegisterClick(event)}
                          className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                        >
                          Register Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
