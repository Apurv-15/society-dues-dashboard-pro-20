
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export const EmptyRegistrations = () => {
  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardContent className="p-12 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Calendar className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          No Registrations Found
        </h3>
        <p className="text-gray-600">
          You haven't registered for any events yet. Check out the Available Events tab to register!
        </p>
      </CardContent>
    </Card>
  );
};
