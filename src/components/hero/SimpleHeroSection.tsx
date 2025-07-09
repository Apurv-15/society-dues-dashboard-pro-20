
import { useState } from 'react';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EventsSection } from "@/components/events/EventsSection";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

interface SimpleHeroSectionProps {
  onSignInClick?: () => void;
}

export const SimpleHeroSection = ({ onSignInClick }: SimpleHeroSectionProps) => {
  const [imageError, setImageError] = useState(false);

  const scrollToEvents = () => {
    const eventsSection = document.getElementById('events');
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div>
      <Navbar onSignInClick={onSignInClick} />
      
      <div id="home" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 pt-20 pb-16">
          <div className="flex flex-col lg:flex-row items-center justify-between min-h-[80vh]">
            {/* Left Side - Text Content */}
            <div className="flex-1 space-y-8 text-center lg:text-left mb-12 lg:mb-0">
              <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <img 
                    src="https://greffon.sirv.com/Greffon/pngegg.png" 
                    alt="Highland Residency Cultural Association" 
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">Cultural Community</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Highland Residency{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    Cultural Association
                  </span>
                </h1>
                
                <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Join our vibrant community for cultural events, donations, and building connections. 
                  Experience the essence of Highland Residency living with rich traditions and modern convenience.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  onClick={scrollToEvents}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  Explore Events
                  <ArrowDown className="w-4 h-4 ml-2" />
                </Button>
                
                {onSignInClick && (
                  <Button 
                    onClick={onSignInClick}
                    variant="outline"
                    className="border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-all duration-300"
                    size="lg"
                  >
                    Sign In
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8 max-w-lg mx-auto lg:mx-0">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">50+</div>
                  <div className="text-sm text-gray-600">Events Hosted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">200+</div>
                  <div className="text-sm text-gray-600">Active Members</div>
                </div>
                <div className="text-center col-span-2 sm:col-span-1">
                  <div className="text-2xl font-bold text-purple-600">5</div>
                  <div className="text-sm text-gray-600">Years Strong</div>
                </div>
              </div>
            </div>
            
            {/* Right Side - Floating Image */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="relative">
                {/* Decorative background elements */}
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-blue-200 rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-green-200 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 -left-8 w-12 h-12 bg-purple-200 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '2s' }}></div>
                
                {/* Main floating image */}
                <div className="relative bg-white rounded-2xl shadow-2xl p-6 hover:shadow-3xl transition-shadow duration-500">
                  <div className="w-80 h-80 md:w-96 md:h-96 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-green-100">
                    {!imageError ? (
                      <img
                        src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2388&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Highland Cultural Event"
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto">
                            <img 
                              src="https://greffon.sirv.com/Greffon/pngegg.png" 
                              alt="Highland Residency Cultural Association" 
                              className="w-12 h-12 object-contain"
                            />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-gray-800">Cultural Events</h3>
                            <p className="text-sm text-gray-600">Join our vibrant community celebrations</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Events Section */}
      <section id="events">
        <EventsSection />
      </section>

      {/* Coming Soon Section */}
      <section id="coming-soon" className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">
              Coming Soon
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              We're working on exciting new features and content for our community. 
              Stay tuned for updates on community insights, member profiles, and much more!
            </p>
            <div className="flex justify-center items-center space-x-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
