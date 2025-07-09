
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/types/event';
import { Edit, Trash2 } from 'lucide-react';

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
}

export const EventCard = ({ event, onEdit, onDelete }: EventCardProps) => {
  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <span>{event.name}</span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(event)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(event.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
        <div className="space-y-1 text-sm">
          <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
          <p><strong>Registration Deadline:</strong> {new Date(event.registrationDeadline).toLocaleDateString()}</p>
          {event.venue && <p><strong>Venue:</strong> {event.venue}</p>}
          <p><strong>Participants:</strong> {event.currentParticipants}{event.maxParticipants && `/${event.maxParticipants}`}</p>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {event.ageGroups?.map(ageGroup => (
            <Badge key={ageGroup} variant="secondary" className="text-xs">
              {ageGroup}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
