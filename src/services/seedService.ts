import { User } from 'firebase/auth';
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export const seedService = {
  async seedInitialData(user: User) {
    const q = query(collection(db, 'tasks'), where('ownerId', '==', user.uid));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('Seeding initial data for new user:', user.uid);
      
      // Seed Tasks
      const initialTasks = [
        { title: 'Define life meta-strategy', energyReq: 'high', pocket: 'Main', status: 'pending', urgency: 5, ownerId: user.uid, createdAt: Timestamp.now() },
        { title: 'Update bio-sync nodes', energyReq: 'medium', pocket: 'Main', status: 'pending', urgency: 3, ownerId: user.uid, createdAt: Timestamp.now() },
        { title: 'Review cognitive energy map', energyReq: 'low', pocket: 'Main', status: 'pending', urgency: 2, ownerId: user.uid, createdAt: Timestamp.now() }
      ];

      for (const t of initialTasks) {
        await addDoc(collection(db, 'tasks'), t);
      }

      // Seed Contacts
      const initialContacts = [
        { name: 'Sarah (Mentor)', type: 'mentor', status: 'active', userId: user.uid, createdAt: Timestamp.now() },
        { name: 'Marcus (Colleague)', type: 'collaborator', status: 'active', userId: user.uid, createdAt: Timestamp.now() }
      ];
      for (const c of initialContacts) {
        await addDoc(collection(db, 'contacts'), c);
      }

      // Seed Pods
      const initialPods = [
        { name: 'Architecture Alpha', members: [user.uid], status: 'active', createdAt: Timestamp.now() }
      ];
      for (const p of initialPods) {
        await addDoc(collection(db, 'pods'), p);
      }
    }
  }
};
