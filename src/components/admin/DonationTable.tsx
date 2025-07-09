import { useState } from 'react';
import { useDonationStore } from '@/store/donationStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, Search, Filter, History, Eye, Download } from 'lucide-react';
import { EditHistoryDialog } from './EditHistoryDialog';
import * as XLSX from 'xlsx';

export const DonationTable = () => {
  const { donations, updateDonation, deleteDonation, selectedFinancialYear, exportToExcel } = useDonationStore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [contributionTypeFilter, setContributionTypeFilter] = useState('all');
  const [editingDonation, setEditingDonation] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDonationId, setSelectedDonationId] = useState<string>('');
  const [selectedFlatNo, setSelectedFlatNo] = useState<string>('');
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  // Filter donations by selected financial year
  const yearFilteredDonations = donations.filter(d => d.financialYear === selectedFinancialYear);

  const filteredDonations = yearFilteredDonations.filter(donation => {
    const matchesSearch = donation.isExternal 
      ? donation.contributorName?.toLowerCase().includes(searchTerm.toLowerCase())
      : (donation.flatNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         donation.buildingNo?.toString().includes(searchTerm));
    
    const matchesBuilding = buildingFilter === 'all' || 
      (donation.buildingNo && donation.buildingNo.toString() === buildingFilter);
    
    const matchesPayment = paymentFilter === 'all' || donation.paymentMethod === paymentFilter;
    
    const matchesType = contributionTypeFilter === 'all' || 
      (contributionTypeFilter === 'internal' && !donation.isExternal) ||
      (contributionTypeFilter === 'external' && donation.isExternal);
    
    return matchesSearch && matchesBuilding && matchesPayment && matchesType;
  });

  // Calculate totals
  const totalAmount = filteredDonations.reduce((sum, d) => sum + d.amount, 0);
  const cashTotal = filteredDonations.filter(d => d.paymentMethod === 'Cash').reduce((sum, d) => sum + d.amount, 0);
  const upiTotal = filteredDonations.filter(d => d.paymentMethod === 'UPI').reduce((sum, d) => sum + d.amount, 0);
  const cashCount = filteredDonations.filter(d => d.paymentMethod === 'Cash').length;
  const upiCount = filteredDonations.filter(d => d.paymentMethod === 'UPI').length;
  const internalCount = filteredDonations.filter(d => !d.isExternal).length;
  const externalCount = filteredDonations.filter(d => d.isExternal).length;

  const handleEdit = (donation: any) => {
    setEditingDonation({ ...donation });
    setIsEditDialogOpen(true);
  };

  const handleViewHistory = (donationId: string, identifier: string) => {
    setSelectedDonationId(donationId);
    setSelectedFlatNo(identifier);
    setIsHistoryDialogOpen(true);
  };

  const handleUpdateDonation = async () => {
    if (!editingDonation) return;
    
    const success = await updateDonation(editingDonation.id, editingDonation);
    if (success) {
      toast({
        title: "Success",
        description: "Donation updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingDonation(null);
    } else {
      toast({
        title: "Error",
        description: "This flat already has a contribution record",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteDonation(id);
    toast({
      title: "Success",
      description: "Donation deleted successfully",
    });
  };

  const handleExportFiltered = () => {
    try {
      // Apply current filters to export
      const exportData = filteredDonations.map(donation => ({
        'Building No': donation.isExternal ? 'External' : donation.buildingNo,
        'Flat No': donation.isExternal ? 'N/A' : donation.flatNo,
        'Contributor Name': donation.isExternal ? donation.contributorName : 'Internal Resident',
        'Amount': donation.amount,
        'Payment Method': donation.paymentMethod,
        'Date': new Date(donation.date).toLocaleDateString(),
        'Received By': donation.receivedBy || 'N/A',
        'Financial Year': donation.financialYear,
        'Type': donation.isExternal ? 'External' : 'Internal'
      }));

      // Create workbook and worksheet using the already imported XLSX
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Auto-size columns
      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Filtered Donations');

      // Generate filename with timestamp and filters
      const timestamp = new Date().toISOString().split('T')[0];
      const filterDesc = [
        contributionTypeFilter !== 'all' ? contributionTypeFilter : null,
        buildingFilter !== 'all' ? `B${buildingFilter}` : null,
        paymentFilter !== 'all' ? paymentFilter : null
      ].filter(Boolean).join('_');
      
      const filename = `Donations_${selectedFinancialYear}_${filterDesc ? filterDesc + '_' : ''}${timestamp}.xlsx`;

      // Write file
      XLSX.writeFile(wb, filename);
      
      toast({
        title: "Success",
        description: `Filtered data exported: ${filename}`,
      });
      setIsExportDialogOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Error",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportAll = () => {
    exportToExcel();
    toast({
      title: "Success",
      description: "All donation data exported successfully",
    });
    setIsExportDialogOpen(false);
  };

  return (
    <>
      <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Filter className="w-5 h-5" />
              Manage Donations
            </CardTitle>
            <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export Options</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>Current filters applied:</p>
                    <ul className="mt-2 ml-4 list-disc">
                      <li>Financial Year: {selectedFinancialYear}</li>
                      <li>Type: {contributionTypeFilter === 'all' ? 'All' : contributionTypeFilter}</li>
                      <li>Building: {buildingFilter === 'all' ? 'All' : buildingFilter}</li>
                      <li>Payment: {paymentFilter === 'all' ? 'All' : paymentFilter}</li>
                      <li>Records found: {filteredDonations.length}</li>
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleExportFiltered}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Export Filtered Data ({filteredDonations.length} records)
                    </Button>
                    <Button 
                      onClick={handleExportAll}
                      variant="outline"
                    >
                      Export All Data
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Mobile-responsive filters */}
          <div className="flex flex-col gap-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by building, flat, or contributor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/50"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select value={contributionTypeFilter} onValueChange={setContributionTypeFilter}>
                <SelectTrigger className="bg-white/50">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="external">External</SelectItem>
                </SelectContent>
              </Select>

              <Select value={buildingFilter} onValueChange={setBuildingFilter}>
                <SelectTrigger className="bg-white/50">
                  <SelectValue placeholder="Building" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Buildings</SelectItem>
                  {Array.from({length: 19}, (_, i) => i + 1).map(num => (
                    <SelectItem key={num} value={num.toString()}>Building {num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="bg-white/50">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Analytics */}
          <div className="bg-white/40 backdrop-blur-sm p-4 rounded-lg mt-4">
            <h3 className="font-semibold text-gray-700 mb-2">Quick Analytics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Cash: </span>
                <span className="font-semibold text-green-600">₹{cashTotal.toLocaleString()} ({cashCount})</span>
              </div>
              <div>
                <span className="text-gray-600">UPI: </span>
                <span className="font-semibold text-blue-600">₹{upiTotal.toLocaleString()} ({upiCount})</span>
              </div>
              <div>
                <span className="text-gray-600">Internal: </span>
                <span className="font-semibold text-orange-600">{internalCount} contributions</span>
              </div>
              <div>
                <span className="text-gray-600">Total: </span>
                <span className="font-semibold text-purple-600">₹{totalAmount.toLocaleString()} ({filteredDonations.length})</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Mobile responsive table */}
          <div className="rounded-lg border overflow-hidden bg-white/30 backdrop-blur-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/50">
                    <TableHead className="min-w-[100px]">Type</TableHead>
                    <TableHead className="min-w-[120px]">Building/Contributor</TableHead>
                    <TableHead className="min-w-[100px]">Flat/Name</TableHead>
                    <TableHead className="min-w-[100px]">Amount</TableHead>
                    <TableHead className="min-w-[100px]">Payment</TableHead>
                    <TableHead className="min-w-[100px]">Date</TableHead>
                    <TableHead className="min-w-[120px]">Received By</TableHead>
                    <TableHead className="min-w-[120px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDonations.map((donation) => (
                    <TableRow key={donation.id} className="hover:bg-white/30">
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          donation.isExternal 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {donation.isExternal ? 'External' : 'Internal'}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {donation.isExternal ? 'External' : `Building ${donation.buildingNo}`}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleViewHistory(
                            donation.id, 
                            donation.isExternal ? donation.contributorName! : donation.flatNo!
                          )}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          {donation.isExternal ? donation.contributorName : donation.flatNo}
                        </button>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">₹{donation.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          donation.paymentMethod === 'UPI' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {donation.paymentMethod}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(donation.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm">{donation.receivedBy || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewHistory(
                              donation.id,
                              donation.isExternal ? donation.contributorName! : donation.flatNo!
                            )}
                            className="h-8 w-8 p-0 bg-white/50"
                            title="View History"
                          >
                            <History className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(donation)}
                            className="h-8 w-8 p-0 bg-white/50"
                            title="Edit"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(donation.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 bg-white/50"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Total Row */}
                  {filteredDonations.length > 0 && (
                    <TableRow className="bg-white/60 font-semibold border-t-2 border-gray-300">
                      <TableCell colSpan={3} className="text-right">Total:</TableCell>
                      <TableCell className="font-bold text-green-700">₹{totalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div>Cash: {cashCount}</div>
                          <div>UPI: {upiCount}</div>
                        </div>
                      </TableCell>
                      <TableCell colSpan={3} className="text-gray-600">
                        {filteredDonations.length} entries ({internalCount} internal, {externalCount} external)
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {filteredDonations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No donations found matching your criteria
              </div>
            )}
          </div>
        </CardContent>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-white/90 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>Edit Donation</DialogTitle>
            </DialogHeader>
            
            {editingDonation && (
              <div className="space-y-4">
                {/* External Contribution Toggle */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="external-edit"
                    checked={editingDonation.isExternal}
                    onCheckedChange={(checked) => setEditingDonation({
                      ...editingDonation,
                      isExternal: checked,
                      buildingNo: checked ? undefined : editingDonation.buildingNo,
                      flatNo: checked ? undefined : editingDonation.flatNo,
                      contributorName: checked ? editingDonation.contributorName : undefined
                    })}
                  />
                  <Label htmlFor="external-edit">External Contribution</Label>
                </div>

                {editingDonation.isExternal ? (
                  <div>
                    <Label htmlFor="contributorName">Contributor Name</Label>
                    <Input
                      id="contributorName"
                      value={editingDonation.contributorName || ''}
                      onChange={(e) => setEditingDonation({
                        ...editingDonation,
                        contributorName: e.target.value
                      })}
                      className="bg-white/50"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="buildingNo">Building No.</Label>
                      <Select
                        value={editingDonation.buildingNo?.toString() || ''}
                        onValueChange={(value) => setEditingDonation({
                          ...editingDonation,
                          buildingNo: parseInt(value)
                        })}
                      >
                        <SelectTrigger className="bg-white/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 19}, (_, i) => i + 1).map(num => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="flatNo">Flat No.</Label>
                      <Input
                        id="flatNo"
                        value={editingDonation.flatNo || ''}
                        onChange={(e) => setEditingDonation({
                          ...editingDonation,
                          flatNo: e.target.value
                        })}
                        className="bg-white/50"
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={editingDonation.amount}
                    onChange={(e) => setEditingDonation({
                      ...editingDonation,
                      amount: parseFloat(e.target.value) || 0
                    })}
                    className="bg-white/50"
                  />
                </div>
                
                <div>
                  <Label>Payment Method</Label>
                  <Select
                    value={editingDonation.paymentMethod}
                    onValueChange={(value: 'UPI' | 'Cash') => setEditingDonation({
                      ...editingDonation,
                      paymentMethod: value,
                      receivedBy: value === 'UPI' ? '' : editingDonation.receivedBy
                    })}
                  >
                    <SelectTrigger className="bg-white/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {editingDonation.paymentMethod === 'Cash' && (
                  <div>
                    <Label htmlFor="receivedBy">Received By</Label>
                    <Input
                      id="receivedBy"
                      value={editingDonation.receivedBy || ''}
                      onChange={(e) => setEditingDonation({
                        ...editingDonation,
                        receivedBy: e.target.value
                      })}
                      className="bg-white/50"
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={editingDonation.date}
                    onChange={(e) => setEditingDonation({
                      ...editingDonation,
                      date: e.target.value
                    })}
                    className="bg-white/50"
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateDonation}>
                    Update Donation
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </Card>

      {/* Edit History Dialog */}
      <EditHistoryDialog
        isOpen={isHistoryDialogOpen}
        onClose={() => setIsHistoryDialogOpen(false)}
        donationId={selectedDonationId}
        flatNo={selectedFlatNo}
      />
    </>
  );
};
