import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

export interface HeroMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
  title?: string;
  description?: string;
  order: number;
  isActive: boolean;
  autoplay?: boolean;
  muted?: boolean;
  createdAt: any;
  updatedAt: any;
}

// Keep backward compatibility
export type HeroImage = HeroMedia;

export const heroImageService = {
  // Get all hero media (images and videos)
  async getHeroImages(): Promise<HeroMedia[]> {
    try {
      console.log('Fetching hero media from Firebase');
      const mediaRef = collection(db, 'heroImages');
      const snapshot = await getDocs(mediaRef);
      
      const media = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HeroMedia[];
      
      // Sort by order and filter active media
      const activeMedia = media
        .filter(item => item.isActive)
        .sort((a, b) => a.order - b.order);
      
      console.log('Hero media fetched:', activeMedia.length);
      return activeMedia;
    } catch (error) {
      console.error('Error fetching hero media:', error);
      return [];
    }
  },

  // Add a new hero media (image or video)
  async addHeroImage(file: File, title?: string, description?: string, order: number = 0): Promise<string> {
    try {
      console.log('Uploading hero media:', file.name);
      
      // Determine media type based on file extension
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
      const mediaType = videoExtensions.includes(fileExtension || '') ? 'video' : 'image';
      
      // Upload media to Firebase Storage
      const timestamp = Date.now();
      const fileName = `hero_${timestamp}_${file.name}`;
      const storageRef = ref(storage, `hero-media/${fileName}`);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Add media record to Firestore
      const mediaData = {
        url: downloadURL,
        type: mediaType,
        title: title || '',
        description: description || '',
        order,
        isActive: true,
        autoplay: mediaType === 'video' ? true : undefined,
        muted: mediaType === 'video' ? true : undefined,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'heroImages'), mediaData);
      console.log('Hero media added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding hero media:', error);
      throw new Error('Failed to add hero media');
    }
  },

  // Update hero media details
  async updateHeroImage(id: string, updates: Partial<HeroMedia>): Promise<void> {
    try {
      const mediaRef = doc(db, 'heroImages', id);
      await updateDoc(mediaRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log('Hero media updated:', id);
    } catch (error) {
      console.error('Error updating hero media:', error);
      throw new Error('Failed to update hero media');
    }
  },

  // Delete hero media
  async deleteHeroImage(id: string, mediaUrl: string): Promise<void> {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'heroImages', id));
      
      // Delete from Storage
      try {
        const mediaRef = ref(storage, mediaUrl);
        await deleteObject(mediaRef);
      } catch (storageError) {
        console.log('Media may have already been deleted from storage');
      }
      
      console.log('Hero media deleted:', id);
    } catch (error) {
      console.error('Error deleting hero media:', error);
      throw new Error('Failed to delete hero media');
    }
  },

  // Initialize with default media (including videos)
  async initializeDefaultImages(): Promise<void> {
    try {
      const existingMedia = await this.getHeroImages();
      if (existingMedia.length > 0) {
        console.log('Hero media already exists, skipping initialization');
        return;
      }

      const defaultMedia = [
        {
          url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2388&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          type: 'image' as const,
          title: "Cultural Dance",
          description: "Traditional dance performance",
          order: 1,
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          type: 'video' as const,
          title: "Community Event Video",
          description: "Highland community gathering",
          order: 2,
          isActive: true,
          autoplay: true,
          muted: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          url: "https://images.unsplash.com/photo-1551641506-ee5bf4cb45f1?q=80&w=2368&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          type: 'image' as const,
          title: "Music Performance",
          description: "Live music at Highland events",
          order: 3,
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
          type: 'video' as const,
          title: "Cultural Heritage Video",
          description: "Celebrating our traditions",
          order: 4,
          isActive: true,
          autoplay: true,
          muted: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          url: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHRva3lvfGVufDB8fDB8fHww",
          type: 'image' as const,
          title: "Festival Celebration",
          description: "Annual Highland festival",
          order: 5,
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      ];

      for (const mediaData of defaultMedia) {
        await addDoc(collection(db, 'heroImages'), mediaData);
      }
      
      console.log('Default hero media initialized');
    } catch (error) {
      console.error('Error initializing default media:', error);
    }
  }
};
