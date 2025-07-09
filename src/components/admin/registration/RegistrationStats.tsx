
import { Card, CardContent } from '@/components/ui/card';
import { EventRegistration } from '@/types/event';

interface RegistrationStatsProps {
  registrations: EventRegistration[];
}

export const RegistrationStats = ({ registrations }: RegistrationStatsProps) => {
  const totalParticipants = registrations.reduce((sum, reg) => sum + reg.participants.length, 0);
  const confirmedRegistrations = registrations.filter(r => r.status === 'confirmed').length;
  const latestSequenceNumber = Math.max(...registrations.map(r => r.sequenceNumber || 0));

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{registrations.length}</div>
          <div className="text-sm text-gray-500">Total Registrations</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{totalParticipants}</div>
          <div className="text-sm text-gray-500">Total Participants</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{confirmedRegistrations}</div>
          <div className="text-sm text-gray-500">Confirmed</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{latestSequenceNumber}</div>
          <div className="text-sm text-gray-500">Latest Sequence No.</div>
        </CardContent>
      </Card>
    </div>
  );
};
