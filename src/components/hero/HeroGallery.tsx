
import { useState, useEffect } from 'react';
import { BentoCell, BentoGrid, ContainerScale, ContainerScroll } from "@/components/blocks/hero-gallery-scroll-animation"
import { EventsSection } from "@/components/events/EventsSection"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { ScrollDownIndicator } from "@/components/ui/ScrollDownIndicator"
import { heroImageService, HeroMedia } from "@/services/heroImageService"

interface HeroGalleryProps {
  onSignInClick?: () => void;
}

export const HeroGallery = ({ onSignInClick }: HeroGalleryProps) => {
  const [heroMedia, setHeroMedia] = useState<HeroMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHeroMedia = async () => {
      try {
        // Initialize default media if none exist
        await heroImageService.initializeDefaultImages();
        
        // Fetch hero media
        const media = await heroImageService.getHeroImages();
        setHeroMedia(media);
      } catch (error) {
        console.error('Error loading hero media:', error);
        // Fallback to default media if Firebase fails
        setHeroMedia([
          {
            id: '1',
            url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2388&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            type: 'image',
            title: "Cultural Dance",
            order: 1,
            isActive: true,
            createdAt: null,
            updatedAt: null
          },
          {
            id: '2',
            url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            type: 'video',
            title: "Community Video",
            order: 2,
            isActive: true,
            autoplay: true,
            muted: true,
            createdAt: null,
            updatedAt: null
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadHeroMedia();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar onSignInClick={onSignInClick} />
      
      <div id="home">
        <ContainerScroll className="h-[350vh]">
          <BentoGrid className="sticky left-0 top-0 z-0 h-screen w-full p-4">
            {heroMedia.map((media) => (
              <BentoCell
                key={media.id}
                className="overflow-hidden rounded-xl shadow-xl"
              >
                {media.type === 'video' ? (
                  <video
                    className="size-full object-cover object-center"
                    src={media.url}
                    title={media.description}
                    autoPlay={media.autoplay}
                    muted={media.muted}
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    className="size-full object-cover object-center"
                    src={media.url}
                    alt={media.title || "Highland Cultural Event"}
                    title={media.description}
                  />
                )}
              </BentoCell>
            ))}
          </BentoGrid>

          <ContainerScale className="relative z-10 text-center">
            <h1 className="max-w-xl text-5xl font-bold tracking-tighter text-slate-800">
              Highland Residency Cultural Association
            </h1>
            <p className="my-6 max-w-xl text-sm text-slate-700 md:text-base">
              Join our vibrant community for cultural events, donations, and building connections. 
              Experience the essence of Highland Residency living.
            </p>
          </ContainerScale>
          
          <ScrollDownIndicator />
        </ContainerScroll>
      </div>
      
      {/* Events Section with Direct Event Cards */}
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
  )
}
