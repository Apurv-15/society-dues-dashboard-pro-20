
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, User } from 'lucide-react';
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
import { Participant } from '@/types/event';

interface ParticipantCardProps {
  participant: Participant;
  index: number;
  totalParticipants: number;
  onDelete: () => void;
}

export const ParticipantCard = ({ participant, index, totalParticipants, onDelete }: ParticipantCardProps) => {
  return (
    <Card className="p-3 bg-gray-50">
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <div>
              <div className="font-medium text-sm">{participant.name}</div>
              <div className="text-xs text-gray-500">
                {participant.age} years, {participant.gender}
              </div>
              {participant.performanceName && (
                <div className="text-xs text-blue-600 mt-1">
                  Performance: {participant.performanceName}
                </div>
              )}
            </div>
          </div>
          
          {totalParticipants > 1 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove Participant</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove {participant.name} from this registration?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
