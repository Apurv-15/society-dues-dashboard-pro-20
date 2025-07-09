
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Hash, UserCheck, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { EventRegistration } from '@/types/event';
import { ParticipantCard } from './ParticipantCard';

interface RegistrationTableProps {
  registrations: EventRegistration[];
  onStatusUpdate: (registrationId: string, newStatus: 'confirmed' | 'cancelled') => void;
  onDeleteParticipant: (registrationId: string, participantIndex: number) => void;
  onDeleteRegistration: (registrationId: string) => void;
}

export const RegistrationTable = ({
  registrations,
  onStatusUpdate,
  onDeleteParticipant,
  onDeleteRegistration
}: RegistrationTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <div className="flex items-center gap-1">
                <Hash className="w-4 h-4" />
                Seq #
              </div>
            </TableHead>
            <TableHead>Event</TableHead>
            <TableHead>User Email</TableHead>
            <TableHead>Contact Number</TableHead>
            <TableHead>Participant Details</TableHead>
            <TableHead>Performance Info</TableHead>
            <TableHead>Group Details</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((registration) => (
            <TableRow key={registration.id}>
              <TableCell className="font-bold">
                <Badge variant="outline">
                  #{registration.sequenceNumber || 'N/A'}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">
                {registration.eventName}
              </TableCell>
              <TableCell>{registration.userEmail || 'N/A'}</TableCell>
              <TableCell>{registration.contactPhoneNumber || 'N/A'}</TableCell>
              <TableCell>
                <div className="space-y-2">
                  {registration.participants.map((participant, index) => (
                    <ParticipantCard
                      key={index}
                      participant={participant}
                      index={index}
                      totalParticipants={registration.participants.length}
                      onDelete={() => onDeleteParticipant(registration.id, index)}
                    />
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1 text-sm">
                  {registration.choreographer && (
                    <div>
                      <span className="font-medium">Choreographer:</span> {registration.choreographer}
                    </div>
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
              </TableCell>
              <TableCell>
                <div className="space-y-1 text-sm">
                  {registration.groupName && (
                    <div>
                      <span className="font-medium">Group:</span> {registration.groupName}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Total Members:</span> {registration.participants.length}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={
                  registration.status === 'confirmed' ? 'default' :
                  registration.status === 'pending' ? 'secondary' : 'destructive'
                }>
                  {registration.status}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(registration.registrationDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {registration.status !== 'cancelled' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onStatusUpdate(registration.id, 'cancelled')}
                    >
                      Cancel
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Registration</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this entire registration? This action cannot be undone and will remove all {registration.participants.length} participant(s) from the event.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeleteRegistration(registration.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Registration
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
