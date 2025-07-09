
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDonationStore } from '@/store/donationStore';
import { Clock, User, Edit, Plus, Trash2 } from 'lucide-react';

interface EditHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  donationId: string;
  flatNo: string;
}

export const EditHistoryDialog = ({ isOpen, onClose, donationId, flatNo }: EditHistoryDialogProps) => {
  const { getEditHistory } = useDonationStore();
  const history = getEditHistory(donationId);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'updated':
        return <Edit className="w-4 h-4 text-blue-600" />;
      case 'deleted':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-green-100 text-green-800';
      case 'updated':
        return 'bg-blue-100 text-blue-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Edit History for Flat {flatNo}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-96">
          <div className="space-y-4">
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No edit history available</p>
            ) : (
              history.map((edit) => (
                <div key={edit.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getActionIcon(edit.action)}
                      <Badge className={getActionColor(edit.action)}>
                        {edit.action.charAt(0).toUpperCase() + edit.action.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(edit.editedAt).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">{edit.editedBy}</span>
                  </div>
                  
                  {Object.keys(edit.changes).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Changes:</h4>
                      {Object.entries(edit.changes).map(([field, change]) => (
                        <div key={field} className="text-sm bg-white p-2 rounded border">
                          <span className="font-medium capitalize">{field}:</span>
                          {change.old !== null && (
                            <span className="text-red-600 ml-2">
                              {typeof change.old === 'object' ? 'Deleted' : String(change.old)}
                            </span>
                          )}
                          {change.old !== null && change.new !== null && (
                            <span className="mx-2">→</span>
                          )}
                          {change.new !== null && (
                            <span className="text-green-600">
                              {typeof change.new === 'object' ? 'Created' : String(change.new)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
