// src/lib/services/EvidenceService.ts
import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  getDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';
import type { NewEvidenceData, Evidence } from '../../types/case';

export class EvidenceService {

  static async addEvidenceToCase(
    caseId: string,
    evidenceData: Omit<NewEvidenceData, 'caseId' | 'fileUrl'>,
    file?: File,
    addedBy?: string
  ): Promise<string> {
    try {
      console.log('EvidenceService: addEvidenceToCase called with:', {
        caseId,
        evidenceType: evidenceData.evidenceType,
        hasFile: !!file,
        addedBy
      });

      let fileUrl = '';
      let fileType = '';

    if (file && evidenceData.evidenceType === 'file') {
      try {
        console.log('EvidenceService: Starting file upload', {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          caseId,
          addedBy
        });

        // Use a more specific storage path with timestamp to avoid conflicts
        const timestamp = Date.now();
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `evidence/${caseId}/${timestamp}-${sanitizedFileName}`;
        
        console.log('EvidenceService: Storage path:', storagePath);
        
        const storageRef = ref(storage, storagePath);
        console.log('EvidenceService: Storage reference created');
        
        const uploadResult = await uploadBytes(storageRef, file);
        console.log('EvidenceService: File uploaded successfully', uploadResult);
        
        fileUrl = await getDownloadURL(uploadResult.ref);
        console.log('EvidenceService: Download URL obtained:', fileUrl);
        
        fileType = file.type;
      } catch (error) {
        console.error('EvidenceService: File upload failed:', error);
        throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else if (evidenceData.evidenceType === 'url') {
      // In a real-world scenario, you might want to validate the URL
      // For now, we assume the URL provided in `evidenceData.fileName` is the one to be stored.
      fileUrl = evidenceData.fileName || '';
    }

    const evidenceCollection = collection(db, 'cases', caseId, 'evidence');
    const newEvidence = {
      ...evidenceData,
      case: doc(db, 'cases', caseId),
      addedBy: addedBy ? doc(db, 'users', addedBy) : null,
      fileUrl,
      fileType,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

      const docRef = await addDoc(evidenceCollection, newEvidence);
      console.log('EvidenceService: Evidence document created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('EvidenceService: Failed to add evidence:', error);
      throw new Error(`Failed to add evidence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getEvidenceForCase(caseId: string): Promise<Evidence[]> {
    const evidenceCollection = collection(db, 'cases', caseId, 'evidence');
    const q = query(evidenceCollection, orderBy('evidenceDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Evidence));
  }

  static async deleteEvidence(caseId: string, evidenceId: string): Promise<void> {
    const evidenceDocRef = doc(db, 'cases', caseId, 'evidence', evidenceId);
    const evidenceDoc = await getDoc(evidenceDocRef);

    if (!evidenceDoc.exists()) {
      throw new Error('Evidence not found');
    }

    const evidenceData = evidenceDoc.data() as Evidence;

    if (evidenceData.evidenceType === 'file' && evidenceData.fileName) {
      const storageRef = ref(storage, `cases/${caseId}/evidence/${evidenceData.fileName}`);
      try {
        await deleteObject(storageRef);
      } catch (error: any) {
        // It's okay if the file doesn't exist in storage, we can still delete the firestore entry
        if (error.code !== 'storage/object-not-found') {
          console.error('Error deleting file from storage:', error);
          throw error;
        }
      }
    }

    await deleteDoc(evidenceDocRef);
  }
}
