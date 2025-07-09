"use client";
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
import { Button } from "@/components/ui/button";
import { useEventStore } from "@/store/eventStore";
import { useAuthStore } from "@/store/authStore";
import { EventRegistrationModal } from "@/components/user/EventRegistrationModal";
import { SimpleEventRegistrationForm } from "@/components/user/SimpleEventRegistrationForm";
import { useToast } from "@/hooks/use-toast";
import { Event } from "@/types/event";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function CanvasRevealEffectDemo() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showSimpleForm, setShowSimpleForm] = useState(false);
  const { events, fetchEvents, loading } = useEventStore();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    const handleOpenRegistration = (event: CustomEvent) => {
      const eventId = event.detail.eventId;
      const event_data = displayEvents.find(e => e.id === eventId);
      if (event_data) {
        setSelectedEvent(event_data);
        setShowSimpleForm(true);
      }
    };

    window.addEventListener('openRegistration', handleOpenRegistration as EventListener);
    return () => window.removeEventListener('openRegistration', handleOpenRegistration as EventListener);
  }, [events]);

  const defaultEvents = [
    {
      id: 'default-1',
      name: 'Cultural Night',
      description: 'Traditional cultural performances and activities',
      date: '2024-03-15',
      registrationDeadline: '2024-03-10',
      currentParticipants: 0,
      ageGroups: ['children', 'teens', 'adults'],
      categories: ['dance', 'music', 'drama'],
      isActive: true
    },
    {
      id: 'default-2',
      name: 'Sports Festival',
      description: 'Various sports competitions and fun activities',
      date: '2024-03-16',
      registrationDeadline: '2024-03-11',
      currentParticipants: 0,
      ageGroups: ['children', 'teens', 'adults'],
      categories: ['sports', 'games'],
      isActive: true
    },
    {
      id: 'default-3',
      name: 'Community Feast',
      description: 'Community gathering with food and entertainment',
      date: '2024-03-17',
      registrationDeadline: '2024-03-12',
      currentParticipants: 0,
      ageGroups: ['all'],
      categories: ['food', 'community'],
      isActive: true
    }
  ];

  const displayEvents = events.length > 0 ? events : defaultEvents;
  const hasMoreEvents = displayEvents.length > 3;

  const handleRegisterClick = (event: Event) => {
    console.log('Register clicked for event:', event.name);
    
    if (!isAuthenticated) {
      console.log('User not authenticated, dispatching redirect event');
      window.dispatchEvent(new CustomEvent('registrationRedirect', { 
        detail: { eventId: event.id } 
      }));
      return;
    }
    
    console.log('User authenticated, opening registration form');
    setSelectedEvent(event);
    setShowSimpleForm(true);
  };

  const handleRegistrationSuccess = () => {
    console.log('Registration successful, refreshing events');
    fetchEvents();
    setShowSimpleForm(false);
    setSelectedEvent(null);
    toast({
      title: "Registration Successful",
      description: "You have successfully registered for the event!",
    });
  };

  const handleCloseRegistration = () => {
    console.log('Closing registration form');
    setShowRegistrationForm(false);
    setShowSimpleForm(false);
    setSelectedEvent(null);
  };

  const getEventColors = (index: number) => {
    const colorSets = [
      { container: "bg-emerald-900", colors: [[0, 255, 255]] },
      { container: "bg-black", colors: [[236, 72, 153], [232, 121, 249]] },
      { container: "bg-sky-600", colors: [[125, 211, 252]] }
    ];
    return colorSets[index % colorSets.length];
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Show simple registration form
  if (showSimpleForm && selectedEvent) {
    return (
      <SimpleEventRegistrationForm
        event={selectedEvent}
        onSuccess={handleRegistrationSuccess}
        onCancel={handleCloseRegistration}
      />
    );
  }

  return (
    <>
      <div className="py-20 flex flex-col items-center justify-center bg-white dark:bg-black w-full gap-4 mx-auto px-8">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4">
          {displayEvents.slice(0, 3).map((event, index) => {
            const colors = getEventColors(index);
            return (
              <Card 
                key={event.id} 
                title={event.name} 
                icon={<EventIcon />} 
                eventDate={new Date(event.date).toLocaleDateString()}
                onRegister={() => handleRegisterClick(event)}
              >
                <CanvasRevealEffect
                  animationSpeed={index === 0 ? 5.1 : 3}
                  containerClassName={colors.container}
                  colors={colors.colors}
                  dotSize={index === 1 ? 2 : 3}
                />
                {index === 1 && (
                  <div className="absolute inset-0 [mask-image:radial-gradient(400px_at_center,white,transparent)] bg-black/50 dark:bg-black/90" />
                )}
              </Card>
            );
          })}
        </div>
        
        {hasMoreEvents && (
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              {displayEvents.length - 3} more events available
            </p>
            <Button 
              onClick={() => navigate('/upcoming-events')}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              size="lg"
            >
              View All Events
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>

      <EventRegistrationModal
        event={selectedEvent}
        isOpen={showRegistrationForm}
        onClose={handleCloseRegistration}
        onSuccess={handleRegistrationSuccess}
      />
    </>
  );
}

const Card = ({
  title,
  icon,
  children,
  eventDate,
  onRegister,
}: {
  title: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
  eventDate: string;
  onRegister: () => void;
}) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="border border-black/[0.2] group/canvas-card flex items-center justify-center dark:border-white/[0.2] max-w-sm w-full mx-auto p-4 relative h-[30rem] rounded-lg"
    >
      <Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black" />

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full w-full absolute inset-0"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-20 text-center">
        <div className="group-hover/canvas-card:-translate-y-4 group-hover/canvas-card:opacity-0 transition duration-200 w-full mx-auto flex items-center justify-center">
          {icon}
        </div>
        <h2 className="dark:text-white text-xl opacity-0 group-hover/canvas-card:opacity-100 relative z-10 text-black mt-4 font-bold group-hover/canvas-card:text-white group-hover/canvas-card:-translate-y-2 transition duration-200">
          {title}
        </h2>
        <p className="dark:text-white/70 text-sm opacity-0 group-hover/canvas-card:opacity-100 relative z-10 text-gray-600 mt-2 group-hover/canvas-card:text-white/70 group-hover/canvas-card:-translate-y-2 transition duration-200">
          {eventDate}
        </p>
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            console.log('Button clicked for:', title);
            onRegister();
          }}
          className="mt-4 opacity-0 group-hover/canvas-card:opacity-100 group-hover/canvas-card:-translate-y-2 transition duration-200 bg-white text-black hover:bg-gray-100"
          size="sm"
        >
          Register Now
        </Button>
      </div>
    </div>
  );
};

const EventIcon = () => {
  return (
    <svg
      width="66"
      height="65"
      viewBox="0 0 66 65"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-10 w-10 text-black dark:text-white group-hover/canvas-card:text-white"
    >
      <path
        d="M8 8.05571C8 8.05571 54.9009 18.1782 57.8687 30.062C60.8365 41.9458 9.05432 57.4696 9.05432 57.4696"
        stroke="currentColor"
        strokeWidth="15"
        strokeMiterlimit="3.86874"
        strokeLinecap="round"
        style={{ mixBlendMode: "darken" }}
      />
    </svg>
  );
};

export const Icon = ({ className, ...rest }: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
      {...rest}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  );
};
