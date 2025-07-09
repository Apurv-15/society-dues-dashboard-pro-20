
import { Button } from '@/components/ui/button';
import { AlertCircle, Trash } from 'lucide-react';
import { EventRegistration } from '@/types/event';
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

interface RegistrationActionsProps {
  registration: EventRegistration;
  canCancel: boolean;
  canDelete: boolean;
  cancellingId: string | null;
  deletingId: string | null;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
}

export const RegistrationActions = ({
  registration,
  canCancel,
  canDelete,
  cancellingId,
  deletingId,
  onCancel,
  onDelete
}: RegistrationActionsProps) => {
  if (!canCancel && !canDelete) {
    return null;
  }

  return (
    <div className="flex justify-end gap-2 pt-4 border-t">
      {canCancel && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              disabled={cancellingId === registration.id}
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              {cancellingId === registration.id ? 'Cancelling...' : 'Cancel Registration'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Registration</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel your registration for "{registration.eventName}"? 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Registration</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onCancel(registration.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Yes, Cancel Registration
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      
      {canDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={deletingId === registration.id}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash className="w-4 h-4 mr-2" />
              {deletingId === registration.id ? 'Deleting...' : 'Delete'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Registration</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete your registration for "{registration.eventName}"? 
                This action cannot be undone and you will lose all registration data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Registration</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(registration.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Yes, Delete Permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};
