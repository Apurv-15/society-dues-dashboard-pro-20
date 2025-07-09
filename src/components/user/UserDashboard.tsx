import { useState, useEffect } from 'react';
import { useDonationStore } from '@/store/donationStore';
import { useAuthStore } from '@/store/authStore';
import { useEventStore } from '@/store/eventStore';
import { userService } from '@/services/userService';
import { seedService } from '@/services/seedService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Receipt, Calendar, CreditCard, User, LogOut, Settings, CalendarDays, Home } from 'lucide-react';
import { FlatAssignment } from '@/types/user';
import { FlatSetupDialog } from './FlatSetupDialog';
import { SimpleEventRegistrationForm } from './SimpleEventRegistrationForm';
import { UserEventsList } from './UserEventsList';
import { UserRegistrationsList } from './UserRegistrationsList';
import { useToast } from '@/hooks/use-toast';
import { Event } from '@/types/event';
import { firebaseService } from '@/services/firebaseService';

export const UserDashboard = () => {
  const {
    user,
    logout
  } = useAuthStore();
  const {
    donations,
    selectedFinancialYear
  } = useDonationStore();
  const {
    events,
    fetchEvents,
    fetchUserRegistrations,
    registrations,
    loading: eventsLoading
  } = useEventStore();
  const [userFlat, setUserFlat] = useState<FlatAssignment | null>(null);
  const [showFlatSetup, setShowFlatSetup] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [initializingData, setInitializingData] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const {
    toast
  } = useToast();

  useEffect(() => {
    // Initialize master data on component mount
    const initializeApp = async () => {
      console.log('Initializing app data...');
      setInitializingData(true);
      try {
        await seedService.initializeData();
        console.log('App data initialization complete');
        
        // Check Firebase setting for download button visibility - hidden by default
        try {
          const downloadVisibility = await firebaseService.getDocument('settings', 'downloadReceiptVisibility');
          if (downloadVisibility) {
            setShowDownloadButton(downloadVisibility.visible === true);
          }
        } catch (error) {
          console.log('Download receipt visibility setting not found, keeping hidden by default');
          // Don't create default setting, keep button hidden
        }
      } catch (error) {
        console.error('Error during app initialization:', error);
      } finally {
        setInitializingData(false);
      }
    };
    initializeApp();
  }, []);

  useEffect(() => {
    const loadUserFlat = async () => {
      if (user?.email && !initializingData) {
        try {
          const flat = await userService.getFlatByUser(user.email);
          setUserFlat(flat);
          setNeedsSetup(!flat && (!user.buildingNo || !user.flatNo));
        } catch (error) {
          console.error('Error loading user flat:', error);
        }
      }
    };
    loadUserFlat();
  }, [user?.email, user?.buildingNo, user?.flatNo, initializingData]);

  useEffect(() => {
    if (!initializingData) {
      fetchEvents();
      if (user?.id) {
        fetchUserRegistrations(user.id);
      }
    }
  }, [fetchEvents, fetchUserRegistrations, user?.id, initializingData]);

  useEffect(() => {
    const handleOpenRegistration = (event: CustomEvent) => {
      console.log('UserDashboard received openRegistration event:', event.detail);
      const eventId = event.detail.eventId;
      const eventData = events.find(e => e.id === eventId);
      if (eventData) {
        console.log('Opening registration form for event:', eventData.name);
        setSelectedEvent(eventData);
        setShowRegistrationForm(true);
      } else {
        console.log('Event not found with ID:', eventId);
      }
    };

    window.addEventListener('openRegistration', handleOpenRegistration as EventListener);
    return () => window.removeEventListener('openRegistration', handleOpenRegistration as EventListener);
  }, [events]);

  // Find donation based on user's assigned flat
  const donation = userFlat || user?.buildingNo && user?.flatNo ? donations.find(d => {
    const buildingNo = userFlat?.buildingNo || user?.buildingNo;
    const flatNo = userFlat?.flatNo || user?.flatNo;
    const match = !d.isExternal && d.buildingNo === buildingNo && d.flatNo === flatNo && d.financialYear === selectedFinancialYear;
    return match;
  }) : null;

  const handleFlatSetupSuccess = async () => {
    if (user?.email) {
      const flat = await userService.getFlatByUser(user.email);
      setUserFlat(flat);
      setNeedsSetup(false);
    }
  };

  const handleEventRegister = (event: Event) => {
    setSelectedEvent(event);
    setShowRegistrationForm(true);
  };

  const handleRegistrationSuccess = () => {
    setShowRegistrationForm(false);
    setSelectedEvent(null);
    // Refresh registrations and events after successful registration
    if (user?.id) {
      fetchUserRegistrations(user.id);
      fetchEvents(); // Refresh events to update participant counts
    }
    toast({
      title: "Success",
      description: "Event registration completed successfully!"
    });
  };

  const handleRegistrationCancel = () => {
    setShowRegistrationForm(false);
    setSelectedEvent(null);
  };

  const handleGoHome = () => {
    logout();
    window.location.reload();
  };

  const generatePDF = () => {
    if (!donation || !user) return;
    const buildingNo = userFlat?.buildingNo || user?.buildingNo;
    const flatNo = userFlat?.flatNo || user?.flatNo;
    if (!buildingNo || !flatNo) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Donation Receipt - ${flatNo}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px;
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 20px;
            }
            .logo { 
              width: 60px; 
              height: 60px; 
              background: white;
              border-radius: 12px;
              margin: 0 auto 15px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .logo img {
              width: 48px;
              height: 48px;
              object-fit: contain;
            }
            .title { 
              color: #1f2937; 
              margin: 0;
              font-size: 24px;
              font-weight: bold;
            }
            .subtitle { 
              color: #6b7280; 
              margin: 5px 0 0 0;
            }
            .receipt-info { 
              background: #f9fafb; 
              padding: 20px; 
              border-radius: 8px;
              margin: 20px 0;
            }
            .info-row { 
              display: flex; 
              justify-content: space-between; 
              margin: 10px 0;
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .label { 
              font-weight: 600; 
              color: #374151;
            }
            .value { 
              color: #1f2937;
            }
            .amount { 
              font-size: 18px; 
              font-weight: bold; 
              color: #059669;
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
            @media print {
              body { margin: 0; padding: 15px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">
              <img src="/lovable-uploads/6016a9df-9143-489d-be05-0ac72553f761.png" alt="Highland Residency Cultural Association" />
            </div>
            <h1 class="title">Highland Residency Cultural Association</h1>
            <p class="subtitle">Official Donation Receipt</p>
          </div>
          
          <div class="receipt-info">
            <div class="info-row">
              <span class="label">Receipt ID:</span>
              <span class="value">#${donation.id.slice(-8).toUpperCase()}</span>
            </div>
            <div class="info-row">
              <span class="label">Resident Name:</span>
              <span class="value">${user.name}</span>
            </div>
            <div class="info-row">
              <span class="label">Building No:</span>
              <span class="value">${buildingNo}</span>
            </div>
            <div class="info-row">
              <span class="label">Flat No:</span>
              <span class="value">${flatNo}</span>
            </div>
            <div class="info-row">
              <span class="label">Amount:</span>
              <span class="value amount">₹${donation.amount.toLocaleString()}</span>
            </div>
            <div class="info-row">
              <span class="label">Payment Method:</span>
              <span class="value">${donation.paymentMethod}</span>
            </div>
            ${donation.receivedBy ? `
            <div class="info-row">
              <span class="label">Received By:</span>
              <span class="value">${donation.receivedBy}</span>
            </div>
            ` : ''}
            <div class="info-row">
              <span class="label">Date:</span>
              <span class="value">${new Date(donation.date).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
            </div>
            <div class="info-row">
              <span class="label">Generated On:</span>
              <span class="value">${new Date().toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for your contribution to our association!</p>
            <p>This is a computer-generated receipt and does not require a signature.</p>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.print();
  };

  if (initializingData) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing application data...</p>
        </div>
      </div>;
  }

  const activeEvents = events.filter(event => event.isActive);
  const userEventRegistrations = registrations.filter(reg => reg.userId === user?.id);

  return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <img alt="Highland Residency Cultural Association" className="w-8 h-8 object-contain" src="https://greffon.sirv.com/Greffon/pngegg.png" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Highland Residency Cultural Association
                </h1>
                <p className="text-sm text-gray-600">Cultural Events Portal</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleGoHome} className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Go to Home Page</span>
              </Button>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>Welcome, {user?.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="events" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="events" className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Available Events
              </TabsTrigger>
              <TabsTrigger value="registrations" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                My Registrations
              </TabsTrigger>
              <TabsTrigger value="donations" className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Donations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="space-y-6">
              <UserEventsList events={activeEvents} loading={eventsLoading} onRegister={handleEventRegister} userRegistrations={userEventRegistrations} />
            </TabsContent>

            <TabsContent value="registrations" className="space-y-6">
              <UserRegistrationsList registrations={userEventRegistrations} events={events} loading={eventsLoading} />
            </TabsContent>

            <TabsContent value="donations" className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Donation Receipt</h2>
                <p className="text-sm text-gray-500 mt-2">Financial Year: {selectedFinancialYear}</p>
              </div>

              {/* Donation Receipt Section */}
              {needsSetup ? <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Settings className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Setup Required
                    </h3>
                    <p className="text-gray-600 mb-6">
                      To access your donation receipts, please provide your building and flat number.
                    </p>
                    <Button onClick={() => setShowFlatSetup(true)} className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                      <Settings className="w-4 h-4 mr-2" />
                      Setup Building & Flat
                    </Button>
                  </CardContent>
                </Card> : donation && (userFlat || user?.buildingNo && user?.flatNo) ? <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                  <CardHeader className="text-center bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <img src="/lovable-uploads/6016a9df-9143-489d-be05-0ac72553f761.png" alt="Highland Residency Cultural Association" className="w-12 h-12 object-contain" />
                    </div>
                    <CardTitle className="text-green-700 text-xl">
                      Contribution Received
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="text-center py-6 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="text-3xl font-bold text-green-600">
                            ₹{donation.amount.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-600">Total Contribution</p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm text-gray-600">Payment Method</p>
                            <p className="font-semibold text-gray-800">{donation.paymentMethod}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <Calendar className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="text-sm text-gray-600">Date</p>
                            <p className="font-semibold text-gray-800">
                              {new Date(donation.date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {donation.receivedBy && <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <User className="w-5 h-5 text-orange-600" />
                          <div>
                            <p className="text-sm text-gray-600">Received By</p>
                            <p className="font-semibold text-gray-800">{donation.receivedBy}</p>
                          </div>
                        </div>}
                      
                      {/* Download button now hidden by default */}
                      {showDownloadButton && <div className="pt-6 border-t">
                        <Button onClick={generatePDF} className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105" size="lg">
                          <Download className="w-5 h-5 mr-2" />
                          Download Receipt
                        </Button>
                      </div>}
                    </div>
                  </CardContent>
                </Card> : <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Receipt className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      No Donation Record Found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      We couldn't find any donation record for your assigned flat for the financial year {selectedFinancialYear}.
                    </p>
                    {(userFlat || user?.buildingNo && user?.flatNo) && <p className="text-sm text-gray-500 mb-4">
                        Your assigned flat: Building {userFlat?.buildingNo || user?.buildingNo}, Flat {userFlat?.flatNo || user?.flatNo}
                      </p>}
                    <p className="text-sm text-gray-500 mb-4">
                      Please contact the association administrator if you believe this is an error.
                    </p>
                    <Button onClick={() => setShowFlatSetup(true)} variant="outline" className="mt-2">
                      <Settings className="w-4 h-4 mr-2" />
                      Update Building & Flat
                    </Button>
                  </CardContent>
                </Card>}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <FlatSetupDialog open={showFlatSetup} onClose={() => setShowFlatSetup(false)} onSuccess={handleFlatSetupSuccess} />

      {selectedEvent && showRegistrationForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
            <SimpleEventRegistrationForm 
              event={selectedEvent} 
              onSuccess={handleRegistrationSuccess} 
              onCancel={handleRegistrationCancel} 
            />
          </div>
        </div>
      )}
    </div>;
};
