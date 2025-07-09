
import { collection, getDocs, addDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const seedService = {
  async seedBuildingMaster(): Promise<void> {
    try {
      console.log('Checking if building master data exists...');
      
      // Check if data already exists
      const existingBuildings = await getDocs(collection(db, "buildingMaster"));
      if (!existingBuildings.empty) {
        console.log('Building master data already exists, skipping seed');
        return;
      }

      console.log('Seeding building master data...');
      
      const buildings = [];
      for (let i = 1; i <= 19; i++) {
        buildings.push({
          buildingNo: i,
          name: `Building ${i}`,
          totalFlats: 28,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Add all buildings to Firebase with batch to prevent duplicates
      const batch = [];
      for (const building of buildings) {
        // Double-check if building already exists before adding
        const existingQuery = query(
          collection(db, "buildingMaster"),
          where("buildingNo", "==", building.buildingNo)
        );
        const existing = await getDocs(existingQuery);
        
        if (existing.empty) {
          await addDoc(collection(db, "buildingMaster"), building);
          console.log(`Building ${building.buildingNo} added successfully`);
        } else {
          console.log(`Building ${building.buildingNo} already exists, skipping`);
        }
      }
      
      console.log('Building master data seeded successfully');
    } catch (error) {
      console.error('Error seeding building master:', error);
    }
  },

  async seedFlatMaster(): Promise<void> {
    try {
      console.log('Checking if flat master data exists...');
      
      // Check if data already exists
      const existingFlats = await getDocs(collection(db, "flatMaster"));
      if (!existingFlats.empty) {
        console.log('Flat master data already exists, skipping seed');
        return;
      }

      console.log('Seeding flat master data...');
      
      // Generate flats for each building (1-19)
      for (let buildingNo = 1; buildingNo <= 19; buildingNo++) {
        console.log(`Seeding flats for building ${buildingNo}...`);
        
        const flats = [];
        
        // Ground floor flats: 001, 002, 003, 004
        for (let flatNum = 1; flatNum <= 4; flatNum++) {
          const flatNo = flatNum.toString().padStart(3, '0');
          flats.push({
            buildingNo,
            flatNo,
            flatType: 'Ground Floor',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        
        // Floor flats: 101-104, 201-204, ..., 701-704
        for (let floor = 1; floor <= 7; floor++) {
          for (let flatNum = 1; flatNum <= 4; flatNum++) {
            const flatNo = `${floor}${flatNum.toString().padStart(2, '0')}`;
            flats.push({
              buildingNo,
              flatNo,
              flatType: `Floor ${floor}`,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        }

        // Add flats for this building with duplicate prevention
        for (const flat of flats) {
          // Check if flat already exists
          const existingFlatQuery = query(
            collection(db, "flatMaster"),
            where("buildingNo", "==", flat.buildingNo),
            where("flatNo", "==", flat.flatNo)
          );
          const existingFlat = await getDocs(existingFlatQuery);
          
          if (existingFlat.empty) {
            await addDoc(collection(db, "flatMaster"), flat);
          }
        }
        
        console.log(`Building ${buildingNo} flats seeded: ${flats.length} flats`);
      }
      
      console.log('Flat master data seeded successfully');
    } catch (error) {
      console.error('Error seeding flat master:', error);
    }
  },

  async initializeData(): Promise<void> {
    try {
      console.log('Initializing master data...');
      await this.seedBuildingMaster();
      await this.seedFlatMaster();
      console.log('Master data initialization complete');
    } catch (error) {
      console.error('Error initializing master data:', error);
    }
  },

  async clearAndReseedData(): Promise<void> {
    try {
      console.log('Force clearing and reseeding data...');
      
      // Clear existing data
      const buildingSnapshot = await getDocs(collection(db, "buildingMaster"));
      const flatSnapshot = await getDocs(collection(db, "flatMaster"));
      
      // Note: In a production app, you'd use batch operations to delete
      // For now, we'll just seed if empty or log if data exists
      
      if (buildingSnapshot.empty) {
        await this.seedBuildingMaster();
      } else {
        console.log('Building data exists, skipping reseed');
      }
      
      if (flatSnapshot.empty) {
        await this.seedFlatMaster();
      } else {
        console.log('Flat data exists, skipping reseed');
      }
      
    } catch (error) {
      console.error('Error in force reseed:', error);
    }
  }
};
