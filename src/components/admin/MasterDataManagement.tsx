
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { userService } from '@/services/userService';
import { BuildingMaster, FlatMaster } from '@/types/user';
import { Building, Home, Plus, Edit } from 'lucide-react';

export const MasterDataManagement = () => {
  const [buildings, setBuildings] = useState<BuildingMaster[]>([]);
  const [flats, setFlats] = useState<FlatMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuildingDialog, setShowBuildingDialog] = useState(false);
  const [showFlatDialog, setShowFlatDialog] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<BuildingMaster | null>(null);
  const [editingFlat, setEditingFlat] = useState<FlatMaster | null>(null);
  const { toast } = useToast();

  // Building form state
  const [buildingForm, setBuildingForm] = useState({
    buildingNo: '',
    name: '',
    totalFlats: ''
  });

  // Flat form state
  const [flatForm, setFlatForm] = useState({
    buildingNo: '',
    flatNo: '',
    flatType: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [buildingData, flatData] = await Promise.all([
        userService.getBuildingMaster(),
        userService.getFlatMaster()
      ]);
      setBuildings(buildingData);
      setFlats(flatData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load master data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.createBuildingMaster({
        buildingNo: parseInt(buildingForm.buildingNo),
        name: buildingForm.name || undefined,
        totalFlats: parseInt(buildingForm.totalFlats),
        isActive: true
      });
      
      toast({
        title: "Success",
        description: "Building created successfully",
      });
      
      setBuildingForm({ buildingNo: '', name: '', totalFlats: '' });
      setShowBuildingDialog(false);
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create building",
        variant: "destructive",
      });
    }
  };

  const handleCreateFlat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.createFlatMaster({
        buildingNo: parseInt(flatForm.buildingNo),
        flatNo: flatForm.flatNo,
        flatType: flatForm.flatType || undefined,
        isActive: true
      });
      
      toast({
        title: "Success",
        description: "Flat created successfully",
      });
      
      setFlatForm({ buildingNo: '', flatNo: '', flatType: '' });
      setShowFlatDialog(false);
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create flat",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading master data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-6 h-6" />
            Master Data Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="buildings" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buildings">Buildings</TabsTrigger>
              <TabsTrigger value="flats">Flats</TabsTrigger>
            </TabsList>
            
            <TabsContent value="buildings" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Buildings</h3>
                <Button onClick={() => setShowBuildingDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Building
                </Button>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Building No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Total Flats</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {buildings.map((building) => (
                      <TableRow key={building.id}>
                        <TableCell className="font-medium">{building.buildingNo}</TableCell>
                        <TableCell>{building.name || '-'}</TableCell>
                        <TableCell>{building.totalFlats}</TableCell>
                        <TableCell>
                          <Badge variant={building.isActive ? 'default' : 'destructive'}>
                            {building.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="flats" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Flats</h3>
                <Button onClick={() => setShowFlatDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Flat
                </Button>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Building No</TableHead>
                      <TableHead>Flat No</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flats.map((flat) => (
                      <TableRow key={flat.id}>
                        <TableCell className="font-medium">{flat.buildingNo}</TableCell>
                        <TableCell>{flat.flatNo}</TableCell>
                        <TableCell>{flat.flatType || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={flat.isActive ? 'default' : 'destructive'}>
                            {flat.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Building Dialog */}
      <Dialog open={showBuildingDialog} onOpenChange={setShowBuildingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Building</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateBuilding} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buildingNo">Building Number</Label>
              <Input
                id="buildingNo"
                type="number"
                placeholder="Enter building number"
                value={buildingForm.buildingNo}
                onChange={(e) => setBuildingForm(prev => ({ ...prev, buildingNo: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="buildingName">Building Name (Optional)</Label>
              <Input
                id="buildingName"
                placeholder="Enter building name"
                value={buildingForm.name}
                onChange={(e) => setBuildingForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="totalFlats">Total Flats</Label>
              <Input
                id="totalFlats"
                type="number"
                placeholder="Enter total number of flats"
                value={buildingForm.totalFlats}
                onChange={(e) => setBuildingForm(prev => ({ ...prev, totalFlats: e.target.value }))}
                required
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowBuildingDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Building
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Flat Dialog */}
      <Dialog open={showFlatDialog} onOpenChange={setShowFlatDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Flat</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateFlat} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="flatBuildingNo">Building Number</Label>
              <Input
                id="flatBuildingNo"
                type="number"
                placeholder="Enter building number"
                value={flatForm.buildingNo}
                onChange={(e) => setFlatForm(prev => ({ ...prev, buildingNo: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="flatNo">Flat Number</Label>
              <Input
                id="flatNo"
                placeholder="Enter flat number (e.g., 101, A-201)"
                value={flatForm.flatNo}
                onChange={(e) => setFlatForm(prev => ({ ...prev, flatNo: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="flatType">Flat Type (Optional)</Label>
              <Input
                id="flatType"
                placeholder="Enter flat type (e.g., 2BHK, 3BHK)"
                value={flatForm.flatType}
                onChange={(e) => setFlatForm(prev => ({ ...prev, flatType: e.target.value }))}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowFlatDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Flat
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
