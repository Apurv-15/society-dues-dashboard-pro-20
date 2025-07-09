
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { userService } from '@/services/userService';
import { BuildingMaster } from '@/types/user';

interface BuildingDropdownProps {
  value?: number;
  onChange: (buildingNo: number) => void;
  disabled?: boolean;
  showLabel?: boolean;
  className?: string;
}

export const BuildingDropdown = ({
  value,
  onChange,
  disabled = false,
  showLabel = true,
  className = ""
}: BuildingDropdownProps) => {
  const [buildings, setBuildings] = useState<BuildingMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [internalValue, setInternalValue] = useState<string>('');

  // Sync internal value with external value
  useEffect(() => {
    const newValue = value && value > 0 ? value.toString() : '';
    console.log('BuildingDropdown - Value prop changed:', { value, newValue, internalValue });
    setInternalValue(newValue);
  }, [value]);

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    console.log('BuildingDropdown - Loading buildings...');
    setLoading(true);
    try {
      const buildingData = await userService.getBuildingMaster();
      const uniqueBuildingsMap = new Map<number, BuildingMaster>();
      
      buildingData.forEach(building => {
        if (building.buildingNo && building.buildingNo > 0) {
          if (!uniqueBuildingsMap.has(building.buildingNo) || 
              (uniqueBuildingsMap.get(building.buildingNo)?.name || '').length < (building.name || '').length) {
            uniqueBuildingsMap.set(building.buildingNo, building);
          }
        }
      });
      
      const uniqueBuildings = Array.from(uniqueBuildingsMap.values())
        .sort((a, b) => a.buildingNo - b.buildingNo);
      
      console.log('BuildingDropdown - Loaded buildings:', uniqueBuildings.map(b => ({ buildingNo: b.buildingNo, name: b.name })));
      setBuildings(uniqueBuildings);
    } catch (error) {
      console.error('BuildingDropdown - Error loading buildings:', error);
      setBuildings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (selectedValue: string) => {
    console.log('BuildingDropdown - Selection changed:', { selectedValue, currentInternalValue: internalValue });
    
    if (selectedValue && selectedValue !== '' && selectedValue !== 'undefined' && selectedValue !== 'null') {
      const selectedBuildingNo = parseInt(selectedValue);
      console.log('BuildingDropdown - Parsed building number:', selectedBuildingNo);
      
      if (!isNaN(selectedBuildingNo) && selectedBuildingNo > 0) {
        setInternalValue(selectedValue);
        console.log('BuildingDropdown - Calling onChange with:', selectedBuildingNo);
        onChange(selectedBuildingNo);
      } else {
        console.log('BuildingDropdown - Invalid building number, not calling onChange');
      }
    } else {
      console.log('BuildingDropdown - Empty selection, clearing value');
      setInternalValue('');
    }
  };

  console.log('BuildingDropdown - Render state:', { 
    value, 
    internalValue, 
    loading, 
    buildingsCount: buildings.length,
    disabled 
  });

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && <Label htmlFor="building">Building</Label>}
      <Select
        value={internalValue}
        onValueChange={handleChange}
        disabled={disabled || loading}
      >
        <SelectTrigger className="bg-white border-gray-300 focus:bg-white hover:bg-gray-50 transition-colors">
          <SelectValue placeholder={loading ? "Loading buildings..." : "Select building"} />
        </SelectTrigger>
        <SelectContent className="bg-white border-gray-200 shadow-xl z-50 max-h-60 overflow-y-auto">
          {loading ? (
            <SelectItem value="loading-placeholder" disabled>Loading buildings...</SelectItem>
          ) : buildings.length === 0 ? (
            <SelectItem value="no-buildings-placeholder" disabled>No buildings available</SelectItem>
          ) : (
            buildings
              .filter(building => building.buildingNo && building.buildingNo > 0)
              .map((building) => {
                const itemValue = building.buildingNo.toString();
                console.log('BuildingDropdown - Rendering item:', { buildingNo: building.buildingNo, itemValue, isSelected: itemValue === internalValue });
                return (
                  <SelectItem 
                    key={`building-${building.buildingNo}`} 
                    value={itemValue}
                  >
                    Building {building.buildingNo}
                  </SelectItem>
                );
              })
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
