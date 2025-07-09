
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEventStore } from '@/store/eventStore';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Users, AlertCircle, Trash, Music, Upload } from 'lucide-react';
import { Event, EventRegistration } from '@/types/event';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RegistrationDetails } from './RegistrationDetails';
import { RegistrationActions } from './RegistrationActions';
import { SongUploadWidget } from '@/components/ui/SongUploadWidget';

interface RegistrationCardProps {
  registration: EventRegistration;
  event: Event | undefined;
}

export const RegistrationCard = ({
  registration,
  event
}: RegistrationCardProps) => {
  const {
    cancelRegistration,
    deleteRegistration,
    updateRegistration
  } = useEventStore();
  const {
    toast
  } = useToast();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showSongUpload, setShowSongUpload] = useState(false);

  const handleCancelRegistration = async (registrationId: string) => {
    setCancellingId(registrationId);
    try {
      await cancelRegistration(registrationId);
      toast({
        title: "Registration Cancelled",
        description: "Your registration has been successfully cancelled."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCancellingId(null);
    }
  };

  const handleDeleteRegistration = async (registrationId: string) => {
    setDeletingId(registrationId);
    try {
      await deleteRegistration(registrationId);
      toast({
        title: "Registration Deleted",
        description: "Your registration has been permanently deleted."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSongUpload = async (url: string, filename: string) => {
    try {
      await updateRegistration(registration.id, {
        songUrl: url,
        songFileName: filename
      });
      setShowSongUpload(false);
      toast({
        title: "Song Uploaded",
        description: "Your song has been successfully uploaded and linked to your registration."
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to update registration with song. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSongRemove = async () => {
    try {
      await updateRegistration(registration.id, {
        songUrl: undefined,
        songFileName: undefined
      });
      toast({
        title: "Song Removed",
        description: "Song has been removed from your registration."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove song. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: EventRegistration['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const canCancel = registration.status !== 'cancelled' && event && new Date(event.registrationDeadline) > new Date();
  const canDelete = registration.status === 'cancelled';

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-xl text-gray-800">
                {registration.eventName}
              </CardTitle>
              {getStatusBadge(registration.status)}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {registration.sequenceNumber && (
                <div className="flex items-center gap-2">
                  <div>
                    <p className="text-gray-600">Sequence No.</p>
                    <p className="font-medium">{registration.sequenceNumber.toString().padStart(3, '0')}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-gray-600">Registered On</p>
                  <p className="font-medium">
                    {new Date(registration.registrationDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-gray-600">Participants</p>
                  <p className="font-medium">{registration.participants.length}</p>
                </div>
              </div>
              
              {event && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-gray-600">Event Date</p>
                    <p className="font-medium">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <RegistrationDetails registration={registration} />
          
          {/* Song Upload Section */}
          {!registration.songUrl && !showSongUpload && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Music className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">No song uploaded</p>
                    <p className="text-sm text-blue-600">Upload your performance song</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowSongUpload(true)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Song
                </Button>
              </div>
            </div>
          )}

          {showSongUpload && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Upload Song</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSongUpload(false)}
                >
                  Cancel
                </Button>
              </div>
              <SongUploadWidget
                onUploadSuccess={handleSongUpload}
                onRemove={handleSongRemove}
                currentSongUrl={registration.songUrl}
                currentSongName={registration.songFileName}
              />
            </div>
          )}

          <RegistrationActions 
            registration={registration} 
            canCancel={canCancel} 
            canDelete={canDelete} 
            cancellingId={cancellingId} 
            deletingId={deletingId} 
            onCancel={handleCancelRegistration} 
            onDelete={handleDeleteRegistration} 
          />
        </div>
      </CardContent>
    </Card>
  );
};
