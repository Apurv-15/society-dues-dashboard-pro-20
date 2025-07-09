
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Event } from '@/types/event';

interface RegistrationFiltersProps {
  selectedEvent: string;
  events: Event[];
  onEventChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onExport: () => void;
}

export const RegistrationFilters = ({
  selectedEvent,
  events,
  onEventChange,
  onSearchChange,
  onExport
}: RegistrationFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label>Filter by Event</Label>
        <Select value={selectedEvent} onValueChange={onEventChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-events">All Events</SelectItem>
            {events.map(event => (
              <SelectItem key={event.id} value={event.id}>
                {event.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Search Participants</Label>
        <Input
          placeholder="Search by name or email"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex items-end">
        <Button onClick={onExport} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
      </div>
    </div>
  );
};
