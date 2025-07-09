
import { ChevronDown } from 'lucide-react';

export const ScrollDownIndicator = () => {
  const scrollToEvents = () => {
    const eventsSection = document.querySelector('#events');
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
      <button
        onClick={scrollToEvents}
        className="flex flex-col items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
      >
        <span className="text-sm font-medium">Scroll to explore</span>
        <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center group-hover:scale-110 transition-transform">
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </button>
    </div>
  );
};
