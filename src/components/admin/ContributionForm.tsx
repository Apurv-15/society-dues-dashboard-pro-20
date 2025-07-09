import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useDonationStore } from '@/store/donationStore';
import { Plus, CreditCard, Banknote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BuildingFlatDropdown } from '@/components/common/BuildingFlatDropdown';

export const ContributionForm = () => {
  const { addDonation, donations, selectedFinancialYear } = useDonationStore();
  const { toast } = useToast();
  
  const [isExternal, setIsExternal] = useState(false);
  const [formData, setFormData] = useState({
    buildingNo: undefined as number | undefined,
    flatNo: '',
    contributorName: '',
    amount: '',
    paymentMethod: 'UPI' as 'UPI' | 'Cash',
    receivedBy: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Get paid flats for current building and financial year to filter them out
  const paidFlatsForCurrentBuilding = new Set(
    donations
      .filter(d => 
        !d.isExternal && 
        d.financialYear === selectedFinancialYear &&
        d.buildingNo === formData.buildingNo
      )
      .map(d => d.flatNo)
  );

  console.log('ContributionForm - Paid flats for current building:', formData.buildingNo, Array.from(paidFlatsForCurrentBuilding));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Form data:', formData);
    console.log('Is external:', isExternal);
    
    if (!isExternal && (!formData.buildingNo || !formData.flatNo)) {
      toast({
        title: "Error",
        description: "Please select building and flat number",
        variant: "destructive",
      });
      return;
    }

    if (isExternal && !formData.contributorName.trim()) {
      toast({
        title: "Error",
        description: "Please enter contributor name",
        variant: "destructive",
      });
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    // Validate receivedBy field for cash payments
    if (formData.paymentMethod === 'Cash' && !formData.receivedBy.trim()) {
      toast({
        title: "Error",
        description: "Please enter who received the cash payment",
        variant: "destructive",
      });
      return;
    }

    // Check if flat already has a contribution for this financial year and building
    if (!isExternal && paidFlatsForCurrentBuilding.has(formData.flatNo)) {
      toast({
        title: "Error",
        description: "This flat already has a contribution record for this financial year",
        variant: "destructive",
      });
      return;
    }

    try {
      const donationData: any = {
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        date: formData.date,
      };

      // Add conditional fields only if they have values
      if (isExternal) {
        donationData.contributorName = formData.contributorName.trim();
        donationData.isExternal = true;
      } else {
        donationData.buildingNo = formData.buildingNo;
        donationData.flatNo = formData.flatNo;
        donationData.isExternal = false;
      }

      // Only add receivedBy if payment method is Cash and field is not empty
      if (formData.paymentMethod === 'Cash' && formData.receivedBy.trim()) {
        donationData.receivedBy = formData.receivedBy.trim();
      }

      console.log('Donation data to be added (cleaned):', donationData);

      const success = await addDonation(donationData);
      
      console.log('Add donation result:', success);
      
      if (success) {
        toast({
          title: "Success",
          description: `${isExternal ? 'Other contribution' : 'Contribution'} added successfully`,
        });
        
        // Reset form
        setFormData({
          buildingNo: undefined,
          flatNo: '',
          contributorName: '',
          amount: '',
          paymentMethod: 'UPI',
          receivedBy: '',
          date: new Date().toISOString().split('T')[0],
        });
      } else {
        toast({
          title: "Error",
          description: "This flat already has a contribution record",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      toast({
        title: "Error",
        description: "Failed to add contribution. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-0 shadow-2xl bg-white/20 backdrop-blur-xl border border-white/30">
      <CardHeader className="bg-gradient-to-r from-blue-50/50 to-green-50/50 backdrop-blur-sm rounded-t-lg border-b border-white/20">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          Add New Contribution
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Other Contribution Toggle */}
          <div className="flex items-center space-x-3 p-4 bg-white/30 backdrop-blur-sm rounded-lg border border-white/20">
            <Switch
              id="external-mode"
              checked={isExternal}
              onCheckedChange={setIsExternal}
            />
            <Label htmlFor="external-mode" className="font-medium text-gray-700">
              Other Contribution
            </Label>
          </div>

          {isExternal ? (
            /* External Contributor Fields */
            <div className="space-y-2">
              <Label htmlFor="contributorName" className="text-gray-700 font-medium">
                Contributor Name
              </Label>
              <Input
                id="contributorName"
                value={formData.contributorName}
                onChange={(e) => setFormData({
                  ...formData,
                  contributorName: e.target.value
                })}
                placeholder="Enter contributor name"
                className="bg-white/50 backdrop-blur-sm border-white/30 focus:bg-white/70"
              />
            </div>
          ) : (
            /* Internal Flat Selection using BuildingFlatDropdown with filtered flats */
            <BuildingFlatDropdown
              buildingNo={formData.buildingNo}
              flatNo={formData.flatNo}
              onBuildingChange={(buildingNo) => setFormData({
                ...formData,
                buildingNo,
                flatNo: '' // Reset flat selection when building changes
              })}
              onFlatChange={(flatNo) => setFormData({
                ...formData,
                flatNo
              })}
              showLabels={true}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
              excludeFlats={paidFlatsForCurrentBuilding}
            />
          )}

          {/* Amount Field - Updated to remove dollar symbol */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-gray-700 font-medium">
              Amount (₹)
            </Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({
                ...formData,
                amount: e.target.value
              })}
              placeholder="Enter amount"
              min="1"
              step="1"
              className="bg-white/50 backdrop-blur-sm border-white/30 focus:bg-white/70"
            />
          </div>

          {/* Payment Method Toggle Buttons */}
          <div className="space-y-3">
            <Label className="text-gray-700 font-medium">Payment Method</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={formData.paymentMethod === 'UPI' ? 'default' : 'outline'}
                onClick={() => setFormData({
                  ...formData,
                  paymentMethod: 'UPI',
                  receivedBy: ''
                })}
                className={cn(
                  "flex-1 flex items-center gap-2 h-12 transition-all duration-200",
                  formData.paymentMethod === 'UPI' 
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl" 
                    : "bg-white/30 backdrop-blur-sm border-white/30 text-gray-700 hover:bg-white/50"
                )}
              >
                <CreditCard className="w-5 h-5" />
                UPI
              </Button>
              <Button
                type="button"
                variant={formData.paymentMethod === 'Cash' ? 'default' : 'outline'}
                onClick={() => setFormData({
                  ...formData,
                  paymentMethod: 'Cash'
                })}
                className={cn(
                  "flex-1 flex items-center gap-2 h-12 transition-all duration-200",
                  formData.paymentMethod === 'Cash' 
                    ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg hover:shadow-xl" 
                    : "bg-white/30 backdrop-blur-sm border-white/30 text-gray-700 hover:bg-white/50"
                )}
              >
                <Banknote className="w-5 h-5" />
                Cash
              </Button>
            </div>
          </div>

          {formData.paymentMethod === 'Cash' && (
            <div className="space-y-2">
              <Label htmlFor="receivedBy" className="text-gray-700 font-medium">
                Received By <span className="text-red-500">*</span>
              </Label>
              <Input
                id="receivedBy"
                value={formData.receivedBy}
                onChange={(e) => setFormData({
                  ...formData,
                  receivedBy: e.target.value
                })}
                placeholder="Person who received the cash"
                className="bg-white/50 backdrop-blur-sm border-white/30 focus:bg-white/70"
                required={formData.paymentMethod === 'Cash'}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="date" className="text-gray-700 font-medium">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({
                ...formData,
                date: e.target.value
              })}
              className="bg-white/50 backdrop-blur-sm border-white/30 focus:bg-white/70"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Contribution
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
