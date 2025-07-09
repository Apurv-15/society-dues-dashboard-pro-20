
import { DonationTable } from '@/components/admin/DonationTable';

const ManageEntries = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-white/60 to-green-50/80 backdrop-blur-xl">
      <div className="p-4 sm:p-6">
        <DonationTable />
      </div>
    </div>
  );
};

export default ManageEntries;
