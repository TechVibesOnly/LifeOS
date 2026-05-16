import { User } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  Timestamp, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from './db';

export interface WearableData {
  userId: string;
  heartRate: number;
  sleepScore: number;
  steps: number;
  stressLevel: number; // 0-100
  lastSync: any;
}

export const wearableService = {
  async getLatestData(userId: string): Promise<WearableData | null> {
    try {
      const q = query(
        collection(db, 'wearableData'),
        where('userId', '==', userId),
        orderBy('lastSync', 'desc'),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as any;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'wearableData');
      return null;
    }
  },

  async syncData(userId: string): Promise<WearableData> {
    // Simulating a real sync process with external wearable API
    const newData: Partial<WearableData> = {
      userId,
      heartRate: Math.floor(Math.random() * (90 - 60) + 60),
      sleepScore: Math.floor(Math.random() * (100 - 60) + 60),
      steps: Math.floor(Math.random() * 10000),
      stressLevel: Math.floor(Math.random() * 100),
      lastSync: Timestamp.now()
    };

    try {
      const docRef = await addDoc(collection(db, 'wearableData'), newData);
      return { id: docRef.id, ...newData } as any;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'wearableData');
      throw err;
    }
  }
};
