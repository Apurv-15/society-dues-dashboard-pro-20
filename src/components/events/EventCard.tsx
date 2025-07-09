
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users } from 'lucide-react';
import { Event } from '@/types/event';

interface EventCardProps {
  event: Event;
  onRegister: (event: Event) => void;
}

export const EventCard = ({ event, onRegister }: EventCardProps) => {
  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <span className="text-xl text-gray-800">{event.name}</span>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            {event.categories?.[0] || 'Event'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-600 mb-4">{event.description}</p>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Event Date</p>
              <p className="font-medium">
                {new Date(event.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Participants</p>
              <p className="font-medium">
                {event.currentParticipants}
                {event.maxParticipants && ` / ${event.maxParticipants}`}
              </p>
            </div>
          </div>
        </div>

        {event.ageGroups && event.ageGroups.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Age Groups:</p>
            <div className="flex flex-wrap gap-1">
              {event.ageGroups.map((ageGroup) => (
                <Badge key={ageGroup} variant="outline" className="text-xs">
                  {ageGroup}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Button 
          onClick={() => onRegister(event)}
          className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
        >
          Register Now
        </Button>
      </CardContent>
    </Card>
  );
};
