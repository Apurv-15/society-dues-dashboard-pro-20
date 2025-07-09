
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/types/event';
import { useEventForm } from '@/hooks/useEventForm';

interface EventFormProps {
  selectedEvent: Event | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export const EventForm = ({ selectedEvent, onCancel, onSuccess }: EventFormProps) => {
  const {
    formData,
    loading,
    handleInputChange,
    handleAgeGroupToggle,
    handleCategoryToggle,
    handleSubmit,
    loadEventData,
    resetForm
  } = useEventForm();

  // Load event data when selectedEvent changes
  useEffect(() => {
    console.log('EventForm: selectedEvent changed:', selectedEvent);
    if (selectedEvent) {
      loadEventData(selectedEvent);
    } else {
      resetForm();
    }
  }, [selectedEvent, loadEventData, resetForm]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(selectedEvent, onSuccess);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Event Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            autoComplete="off"
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            placeholder="e.g., Cultural, Sports, Community"
            autoComplete="off"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Event Date *</Label>
          <Input
            id="date"
            type="datetime-local"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="registrationDeadline">Registration Deadline *</Label>
          <Input
            id="registrationDeadline"
            type="datetime-local"
            value={formData.registrationDeadline}
            onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="venue">Venue</Label>
          <Input
            id="venue"
            value={formData.venue}
            onChange={(e) => handleInputChange('venue', e.target.value)}
            placeholder="Event location"
            autoComplete="off"
          />
        </div>
        <div>
          <Label htmlFor="maxParticipants">Max Participants</Label>
          <Input
            id="maxParticipants"
            type="number"
            value={formData.maxParticipants}
            onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
            placeholder="Leave empty for unlimited"
          />
        </div>
      </div>

      <div>
        <Label>Age Groups</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {['children', 'teens', 'adults', 'all'].map(ageGroup => (
            <Badge
              key={ageGroup}
              variant={formData.ageGroups.includes(ageGroup) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleAgeGroupToggle(ageGroup)}
            >
              {ageGroup}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label>Event Categories</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {['dance', 'music', 'drama', 'sports', 'cultural', 'community', 'general'].map(category => (
            <Badge
              key={category}
              variant={formData.categories.includes(category) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleCategoryToggle(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (selectedEvent ? 'Update Event' : 'Create Event')}
        </Button>
      </div>
    </form>
  );
};
