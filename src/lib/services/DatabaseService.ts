import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from "@/lib/firebase";
import { Contact, NewContactData } from "@/types/database";

export class DatabaseService {

  // Method to get all contacts from a specific collection
  static async getContacts(collectionName: string): Promise<Contact[]> {
    const contactsCol = collection(db, collectionName);
    const q = query(contactsCol, orderBy("organization"), orderBy("name"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Contact[];
  }

  // Method to add a new contact to a specific collection
  static async addContact(collectionName: string, contactData: NewContactData): Promise<string> {
    const contactsCol = collection(db, collectionName);
    const docRef = await addDoc(contactsCol, {
      ...contactData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }
}
