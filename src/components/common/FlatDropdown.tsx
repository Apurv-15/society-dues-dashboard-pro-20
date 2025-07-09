
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface FlatDropdownProps {
  buildingNo?: number;
  value?: string;
  onChange: (flatNo: string) => void;
  disabled?: boolean;
  showLabel?: boolean;
  excludeFlats?: Set<string>; // New prop to exclude flats that already have donations
}

export const FlatDropdown = ({
  buildingNo,
  value,
  onChange,
  disabled = false,
  showLabel = true,
  excludeFlats = new Set()
}: FlatDropdownProps) => {
  const [flats, setFlats] = useState<string[]>([]);

  useEffect(() => {
    console.log('FlatDropdown - Building number changed:', buildingNo);
    console.log('FlatDropdown - Excluded flats:', Array.from(excludeFlats));
    
    if (!buildingNo) {
      setFlats([]);
      return;
    }

    // Generate flats in format: G/001-G/004, 101-104, 201-204, ..., 701-704
    let flatList: string[] = [];
    
    // Generate from floor G (ground) to floor 7 (8 floors total), 4 flats per floor
    for (let floor = 0; floor <= 7; floor++) {
      for (let flat = 1; flat <= 4; flat++) {
        let flatNo: string;
        if (floor === 0) {
          // Ground floor: G/001, G/002, G/003, G/004
          flatNo = `G/${flat.toString().padStart(3, '0')}`;
        } else {
          // Upper floors: 101, 102, 103, 104, 201, 202, etc.
          flatNo = `${floor}${flat.toString().padStart(2, '0')}`;
        }
        flatList.push(flatNo);
      }
    }

    // Filter out flats that already have donations
    const availableFlats = flatList.filter(flat => !excludeFlats.has(flat));
    
    console.log('FlatDropdown - Generated flats before filtering:', flatList.length);
    console.log('FlatDropdown - Available flats after filtering:', availableFlats.length);
    console.log('FlatDropdown - Sample flats:', flatList.slice(0, 5), '...', flatList.slice(-5));
    
    setFlats(availableFlats);
  }, [buildingNo, excludeFlats]);

  const handleValueChange = (selectedValue: string) => {
    console.log('FlatDropdown - Value selected:', selectedValue);
    onChange(selectedValue);
  };

  return (
    <div className="space-y-2">
      {showLabel && (
        <Label htmlFor="flat-select" className="text-gray-700 font-medium">
          Flat No.
        </Label>
      )}
      <Select
        value={value || ''}
        onValueChange={handleValueChange}
        disabled={disabled || !buildingNo || flats.length === 0}
      >
        <SelectTrigger 
          id="flat-select"
          className="bg-white/50 backdrop-blur-sm border-white/30 focus:bg-white/70"
        >
          <SelectValue 
            placeholder={
              !buildingNo 
                ? "Select building first" 
                : flats.length === 0 
                ? "No available flats" 
                : "Select flat number"
            } 
          />
        </SelectTrigger>
        <SelectContent className="bg-white/95 backdrop-blur-xl border-white/30 max-h-[300px] overflow-y-auto z-50">
          {flats.map((flat) => (
            <SelectItem key={flat} value={flat} className="text-sm">
              {flat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
