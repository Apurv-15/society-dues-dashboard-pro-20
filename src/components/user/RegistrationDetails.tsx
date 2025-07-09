
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EventRegistration } from '@/types/event';
import { Users, Phone, Music, User as UserIcon } from 'lucide-react';

interface RegistrationDetailsProps {
  registration: EventRegistration;
}

export const RegistrationDetails = ({ registration }: RegistrationDetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{registration.eventName}</span>
          <Badge variant={
            registration.status === 'confirmed' ? 'default' :
            registration.status === 'pending' ? 'secondary' : 'destructive'
          }>
            {registration.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Participants */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-medium">
            <Users className="h-4 w-4" />
            Participants ({registration.participants.length})
          </div>
          <div className="grid gap-2">
            {registration.participants.map((participant, index) => (
              <div key={index} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                <UserIcon className="h-3 w-3" />
                <span>{participant.name}</span>
                <span className="text-gray-500">({participant.age} years, {participant.gender})</span>
                {participant.performanceName && (
                  <span className="text-blue-600">- {participant.performanceName}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        {registration.contactPhoneNumber && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span className="font-medium">Contact:</span>
            <span>{registration.contactPhoneNumber}</span>
          </div>
        )}

        {/* Performance Details */}
        {(registration.choreographer || registration.songUrl || registration.groupName) && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-medium">
              <Music className="h-4 w-4" />
              Performance Details
            </div>
            <div className="text-sm space-y-1">
              {registration.groupName && (
                <div><span className="font-medium">Group:</span> {registration.groupName}</div>
              )}
              {registration.choreographer && (
                <div><span className="font-medium">Choreographer:</span> {registration.choreographer}</div>
              )}
              {registration.songUrl && registration.songFileName && (
                <div>
                  <span className="font-medium">Song:</span> 
                  <a 
                    href={registration.songUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-1"
                  >
                    {registration.songFileName}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Registration Info */}
        <div className="text-sm text-gray-500 border-t pt-2">
          <div>Registered: {new Date(registration.registrationDate).toLocaleDateString()}</div>
          {registration.sequenceNumber && (
            <div>Sequence Number: #{registration.sequenceNumber}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
