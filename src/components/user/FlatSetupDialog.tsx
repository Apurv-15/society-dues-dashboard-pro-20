
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/store/authStore';
import { BuildingFlatDropdown } from '@/components/common/BuildingFlatDropdown';

interface FlatSetupDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const FlatSetupDialog = ({ open, onClose, onSuccess }: FlatSetupDialogProps) => {
  const [buildingNo, setBuildingNo] = useState<number | undefined>();
  const [flatNo, setFlatNo] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !buildingNo || !flatNo) return;

    setLoading(true);
    try {
      await userService.updateUserFlat(user.id, buildingNo, flatNo);
      toast({
        title: "Success",
        description: "Building and flat information updated successfully",
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update flat information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Setup Your Flat Details</DialogTitle>
          <DialogDescription>
            To access your donation receipts, please provide your building and flat number.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <BuildingFlatDropdown
            buildingNo={buildingNo}
            flatNo={flatNo}
            onBuildingChange={setBuildingNo}
            onFlatChange={setFlatNo}
          />
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !buildingNo || !flatNo} 
              className="flex-1"
            >
              {loading ? 'Saving...' : 'Save Details'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
