import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  Timestamp,
  getDoc,
  orderBy 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User, Building, FlatAssignment, BuildingMaster, FlatMaster } from "@/types/user";

export const userService = {
  // User Management
  async registerUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('Registering user:', userData);
      
      // Check if email already exists
      const existingUserQuery = query(
        collection(db, "users"), 
        where("email", "==", userData.email)
      );
      const existingUsers = await getDocs(existingUserQuery);
      
      if (!existingUsers.empty) {
        throw new Error("Email already registered");
      }

      // Only check flat assignment if building and flat numbers are provided
      if (userData.buildingNo && userData.flatNo) {
        const flatQuery = query(
          collection(db, "flatAssignments"),
          where("buildingNo", "==", userData.buildingNo),
          where("flatNo", "==", userData.flatNo)
        );
        const existingFlats = await getDocs(flatQuery);
        
        if (!existingFlats.empty) {
          throw new Error("This flat is already assigned to another user");
        }
      }

      const cleanedUserData = {
        ...userData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isActive: true
      };

      const docRef = await addDoc(collection(db, "users"), cleanedUserData);
      
      // Create flat assignment only if building and flat numbers are provided
      if (userData.buildingNo && userData.flatNo) {
        await addDoc(collection(db, "flatAssignments"), {
          buildingNo: userData.buildingNo,
          flatNo: userData.flatNo,
          assignedEmail: userData.email,
          assignedAt: Timestamp.now(),
          assignedBy: docRef.id
        });
      }

      console.log('User registered successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },

  async updateUserFlat(userId: string, buildingNo: number, flatNo: string): Promise<void> {
    try {
      console.log('Updating user flat:', userId, buildingNo, flatNo);
      
      // Get user first
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Check if flat is already assigned to another user
      const flatQuery = query(
        collection(db, "flatAssignments"),
        where("buildingNo", "==", buildingNo),
        where("flatNo", "==", flatNo)
      );
      const existingFlats = await getDocs(flatQuery);
      
      if (!existingFlats.empty) {
        const existingAssignment = existingFlats.docs[0].data();
        if (existingAssignment.assignedEmail !== user.email) {
          throw new Error("This flat is already assigned to another user. Please contact admin to get it changed.");
        }
      }

      // Update user document
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        buildingNo,
        flatNo,
        updatedAt: Timestamp.now()
      });

      // Create or update flat assignment
      if (existingFlats.empty) {
        await addDoc(collection(db, "flatAssignments"), {
          buildingNo,
          flatNo,
          assignedEmail: user.email,
          assignedAt: Timestamp.now(),
          assignedBy: userId
        });
      }

      console.log('User flat updated successfully');
    } catch (error) {
      console.error('Error updating user flat:', error);
      throw error;
    }
  },

  async getUserById(id: string): Promise<User | null> {
    try {
      const docRef = doc(db, "users", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  },

  async loginUser(email: string, password: string): Promise<User | null> {
    try {
      console.log('Attempting login for:', email);
      
      // For demo purposes, we'll use simple password checking
      // In production, use proper Firebase Auth
      const userQuery = query(
        collection(db, "users"), 
        where("email", "==", email),
        where("isActive", "==", true)
      );
      const querySnapshot = await getDocs(userQuery);
      
      if (querySnapshot.empty) {
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data() as Omit<User, 'id'>;
      
      // Simple password validation (in production, use proper hashing)
      if (password === 'admin123' && userData.role === 'admin') {
        return { id: userDoc.id, ...userData };
      } else if (password === 'user123' && userData.role === 'user') {
        return { id: userDoc.id, ...userData };
      }
      
      return null;
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  },

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    try {
      console.log('Updating user:', id, updates);
      const docRef = doc(db, "users", id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      console.log('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async getUsers(): Promise<User[]> {
    try {
      console.log('Getting all users');
      const querySnapshot = await getDocs(collection(db, "users"));
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      console.log('Users retrieved successfully:', users.length);
      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  },

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const userQuery = query(
        collection(db, "users"), 
        where("email", "==", email)
      );
      const querySnapshot = await getDocs(userQuery);
      
      if (querySnapshot.empty) {
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() } as User;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  },

  // Building Management
  async createBuilding(buildingData: Omit<Building, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "buildings"), {
        ...buildingData,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating building:', error);
      throw error;
    }
  },

  async getBuildings(): Promise<Building[]> {
    try {
      const querySnapshot = await getDocs(collection(db, "buildings"));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Building[];
    } catch (error) {
      console.error('Error getting buildings:', error);
      throw error;
    }
  },

  // Building Master Management
  async createBuildingMaster(buildingData: Omit<BuildingMaster, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('Creating building master:', buildingData);
      
      // Check if building number already exists
      const existingBuildingQuery = query(
        collection(db, "buildingMaster"), 
        where("buildingNo", "==", buildingData.buildingNo),
        where("isActive", "==", true)
      );
      const existingBuildings = await getDocs(existingBuildingQuery);
      
      if (!existingBuildings.empty) {
        throw new Error("Building number already exists");
      }

      const docRef = await addDoc(collection(db, "buildingMaster"), {
        ...buildingData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isActive: true
      });
      
      console.log('Building master created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating building master:', error);
      throw error;
    }
  },

  async getBuildingMaster(): Promise<BuildingMaster[]> {
    try {
      console.log('Getting building master data');
      const querySnapshot = await getDocs(
        query(
          collection(db, "buildingMaster"), 
          where("isActive", "==", true),
          orderBy("buildingNo", "asc")
        )
      );
      const buildings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BuildingMaster[];
      console.log('Building master retrieved successfully:', buildings.length, 'buildings');
      return buildings;
    } catch (error) {
      console.error('Error getting building master:', error);
      throw error;
    }
  },

  async updateBuildingMaster(id: string, updates: Partial<BuildingMaster>): Promise<void> {
    try {
      console.log('Updating building master:', id, updates);
      const docRef = doc(db, "buildingMaster", id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      console.log('Building master updated successfully');
    } catch (error) {
      console.error('Error updating building master:', error);
      throw error;
    }
  },

  // Flat Master Management
  async createFlatMaster(flatData: Omit<FlatMaster, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('Creating flat master:', flatData);
      
      // Check if flat already exists for the building
      const existingFlatQuery = query(
        collection(db, "flatMaster"), 
        where("buildingNo", "==", flatData.buildingNo),
        where("flatNo", "==", flatData.flatNo),
        where("isActive", "==", true)
      );
      const existingFlats = await getDocs(existingFlatQuery);
      
      if (!existingFlats.empty) {
        throw new Error("Flat number already exists for this building");
      }

      const docRef = await addDoc(collection(db, "flatMaster"), {
        ...flatData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isActive: true
      });
      
      console.log('Flat master created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating flat master:', error);
      throw error;
    }
  },

  async getFlatMaster(buildingNo?: number): Promise<FlatMaster[]> {
    try {
      console.log('Getting flat master data for building:', buildingNo);
      
      let flatQuery;
      
      if (buildingNo) {
        // Use only buildingNo and isActive to avoid composite index requirement
        flatQuery = query(
          collection(db, "flatMaster"), 
          where("buildingNo", "==", buildingNo),
          where("isActive", "==", true)
        );
      } else {
        flatQuery = query(
          collection(db, "flatMaster"), 
          where("isActive", "==", true)
        );
      }
      
      const querySnapshot = await getDocs(flatQuery);
      const flats = querySnapshot.docs.map(doc => {
        const data = doc.data() as Omit<FlatMaster, 'id'>;
        return {
          id: doc.id,
          ...data
        };
      }) as FlatMaster[];
      
      // Sort in JavaScript instead of using orderBy to avoid index requirement
      const sortedFlats = flats.sort((a, b) => {
        const aNum = parseInt(a.flatNo);
        const bNum = parseInt(b.flatNo);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }
        return a.flatNo.localeCompare(b.flatNo);
      });
      
      console.log('Flat master retrieved successfully:', sortedFlats.length, 'flats');
      return sortedFlats;
    } catch (error) {
      console.error('Error getting flat master:', error);
      throw error;
    }
  },

  async updateFlatMaster(id: string, updates: Partial<FlatMaster>): Promise<void> {
    try {
      console.log('Updating flat master:', id, updates);
      const docRef = doc(db, "flatMaster", id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      console.log('Flat master updated successfully');
    } catch (error) {
      console.error('Error updating flat master:', error);
      throw error;
    }
  },

  // Flat Assignment Management
  async getFlatAssignments(): Promise<FlatAssignment[]> {
    try {
      const querySnapshot = await getDocs(collection(db, "flatAssignments"));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FlatAssignment[];
    } catch (error) {
      console.error('Error getting flat assignments:', error);
      throw error;
    }
  },

  async getFlatByUser(email: string): Promise<FlatAssignment | null> {
    try {
      const flatQuery = query(
        collection(db, "flatAssignments"),
        where("assignedEmail", "==", email)
      );
      const querySnapshot = await getDocs(flatQuery);
      
      if (querySnapshot.empty) {
        return null;
      }

      const flatDoc = querySnapshot.docs[0];
      return { id: flatDoc.id, ...flatDoc.data() } as FlatAssignment;
    } catch (error) {
      console.error('Error getting flat by user:', error);
      throw error;
    }
  }
};
