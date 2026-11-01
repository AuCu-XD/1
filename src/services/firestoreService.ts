import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  limit
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  SchoolClass,
  Student,
  Teacher,
  Subject,
  GradeItem,
  AttendanceRecord,
  Assignment,
  Announcement,
  UserProfile
} from '../types';

export const FirestoreService = {
  // Generic collection fetcher
  fetchCollection: async <T>(collectionName: string): Promise<T[]> => {
    try {
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      const items: T[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as unknown as T);
      });
      return items;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, collectionName);
      return [];
    }
  },

  // Save single document to collection
  saveDocument: async <T extends { id: string }>(
    collectionName: string,
    item: T
  ): Promise<void> => {
    try {
      const docRef = doc(db, collectionName, item.id);
      await setDoc(docRef, item, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${item.id}`);
    }
  },

  // Delete document
  deleteDocument: async (collectionName: string, id: string): Promise<void> => {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
    }
  },

  // Save batch or seed collection if empty
  seedCollectionIfEmpty: async <T extends { id: string }>(
    collectionName: string,
    initialData: T[]
  ): Promise<T[]> => {
    try {
      const colRef = collection(db, collectionName);
      const q = query(colRef, limit(1));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log(`Seeding initial data for ${collectionName} into Cloud Firestore...`);
        // If auth user exists or rule permits, write initial items
        for (const item of initialData) {
          try {
            await setDoc(doc(db, collectionName, item.id), item);
          } catch (writeErr) {
            console.warn(`Could not seed item ${item.id} to ${collectionName}:`, writeErr);
            break;
          }
        }
        return initialData;
      } else {
        // Read actual items from Firestore
        const allSnap = await getDocs(colRef);
        const remoteItems: T[] = [];
        allSnap.forEach((d) => {
          remoteItems.push({ id: d.id, ...d.data() } as unknown as T);
        });
        return remoteItems;
      }
    } catch (error) {
      console.warn(`Error reading/seeding ${collectionName} from Firestore, using fallback:`, error);
      return initialData;
    }
  },

  // User Profile
  saveUserProfile: async (user: UserProfile): Promise<void> => {
    try {
      const docRef = doc(db, 'users', user.id);
      await setDoc(docRef, user, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
    }
  },

  // Check if admin doc exists or register bootstrap admin
  ensureAdminStatus: async (uid: string, email: string): Promise<boolean> => {
    if (email === 'kimtrong16490@gmail.com') {
      try {
        const adminDocRef = doc(db, 'admins', uid);
        await setDoc(adminDocRef, { email, role: 'admin', updatedAt: new Date().toISOString() }, { merge: true });
        return true;
      } catch (e) {
        console.warn('Could not register admin doc:', e);
        return true; // Still treated as admin in app logic
      }
    }
    return false;
  }
};
