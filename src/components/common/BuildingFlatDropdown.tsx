
import { useEffect } from 'react';
import { BuildingDropdown } from './BuildingDropdown';
import { FlatDropdown } from './FlatDropdown';

interface BuildingFlatDropdownProps {
  buildingNo?: number;
  flatNo?: string;
  onBuildingChange: (buildingNo: number) => void;
  onFlatChange: (flatNo: string) => void;
  disabled?: boolean;
  showLabels?: boolean;
  className?: string;
  excludeFlats?: Set<string>; // Flats that already have donations - format: "buildingNo-flatNo"
}

export const BuildingFlatDropdown = ({
  buildingNo,
  flatNo,
  onBuildingChange,
  onFlatChange,
  disabled = false,
  showLabels = true,
  className = "",
  excludeFlats = new Set()
}: BuildingFlatDropdownProps) => {
  
  // Debug props received
  useEffect(() => {
    console.log('BuildingFlatDropdown - Props received:', { 
      buildingNo, 
      flatNo, 
      disabled, 
      showLabels,
      excludedFlatsCount: excludeFlats.size,
      excludedFlats: Array.from(excludeFlats),
      onBuildingChange: typeof onBuildingChange,
      onFlatChange: typeof onFlatChange
    });
  }, [buildingNo, flatNo, disabled, showLabels, excludeFlats, onBuildingChange, onFlatChange]);

  const handleBuildingChange = (selectedBuildingNo: number) => {
    console.log('BuildingFlatDropdown - Building change handler called:', { 
      selectedBuildingNo, 
      currentBuildingNo: buildingNo,
      currentFlatNo: flatNo 
    });
    
    onBuildingChange(selectedBuildingNo);
    
    // Reset flat selection when building changes
    if (flatNo) {
      console.log('BuildingFlatDropdown - Resetting flat selection due to building change');
      onFlatChange('');
    }
  };

  const handleFlatChange = (selectedFlatNo: string) => {
    console.log('BuildingFlatDropdown - Flat change handler called:', { 
      selectedFlatNo, 
      currentFlatNo: flatNo,
      currentBuildingNo: buildingNo,
      combinedKey: `${buildingNo}-${selectedFlatNo}`,
      isExcluded: excludeFlats.has(`${buildingNo}-${selectedFlatNo}`)
    });
    onFlatChange(selectedFlatNo);
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
      <BuildingDropdown
        value={buildingNo}
        onChange={handleBuildingChange}
        disabled={disabled}
        showLabel={showLabels}
      />
      
      <FlatDropdown
        buildingNo={buildingNo}
        value={flatNo}
        onChange={handleFlatChange}
        disabled={disabled}
        showLabel={showLabels}
        excludeFlats={excludeFlats}
      />
    </div>
  );
};
