import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import type {
  Alert,
  NewAlertData,
  AlertUpdateData,
  AlertStatus,
  AlertSeverity
} from '../../types/alert';

export class AlertService {
  private static alertsCollection = collection(db, 'alerts');

  // --- Alert Methods ---
  static async createAlert(alertData: NewAlertData, createdByUserId: string): Promise<string> {
    const newAlert = {
      ...alertData,
      status: 'new' as AlertStatus,
      detectedAt: Timestamp.now(),
      createdBy: doc(db, 'users', createdByUserId),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(this.alertsCollection, newAlert);
    return docRef.id;
  }

  static async getAllAlerts(): Promise<Alert[]> {
    const q = query(this.alertsCollection, orderBy('detectedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Alert));
  }

  static async getRecentAlerts(limitCount: number = 10): Promise<Alert[]> {
    const q = query(
      this.alertsCollection, 
      orderBy('detectedAt', 'desc'), 
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Alert));
  }

  static async getAlertsByStatus(status: AlertStatus): Promise<Alert[]> {
    const q = query(
      this.alertsCollection, 
      where('status', '==', status),
      orderBy('detectedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Alert));
  }

  static async getAlertsBySeverity(severity: AlertSeverity): Promise<Alert[]> {
    const q = query(
      this.alertsCollection, 
      where('severity', '==', severity),
      orderBy('detectedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Alert));
  }

  static async getAlertById(alertId: string): Promise<Alert | null> {
    const alertRef = doc(db, 'alerts', alertId);
    const docSnap = await getDoc(alertRef);
    if (!docSnap.exists()) {
      return null;
    }
    return { id: docSnap.id, ...docSnap.data() } as Alert;
  }

  static async updateAlert(alertId: string, updateData: AlertUpdateData): Promise<void> {
    const alertRef = doc(db, 'alerts', alertId);
    await updateDoc(alertRef, { ...updateData, updatedAt: serverTimestamp() });
  }

  static async deleteAlert(alertId: string): Promise<void> {
    const alertRef = doc(db, 'alerts', alertId);
    await deleteDoc(alertRef);
  }

  // --- Dashboard Statistics ---
  static async getAlertStats(): Promise<{
    total: number;
    new: number;
    investigating: number;
    resolved: number;
    high: number;
    critical: number;
  }> {
    try {
      const [allAlerts, newAlerts, investigatingAlerts, resolvedAlerts, highAlerts, criticalAlerts] = await Promise.all([
        getDocs(this.alertsCollection),
        getDocs(query(this.alertsCollection, where('status', '==', 'new'))),
        getDocs(query(this.alertsCollection, where('status', '==', 'investigating'))),
        getDocs(query(this.alertsCollection, where('status', '==', 'resolved'))),
        getDocs(query(this.alertsCollection, where('severity', '==', 'high'))),
        getDocs(query(this.alertsCollection, where('severity', '==', 'critical')))
      ]);

      return {
        total: allAlerts.size,
        new: newAlerts.size,
        investigating: investigatingAlerts.size,
        resolved: resolvedAlerts.size,
        high: highAlerts.size,
        critical: criticalAlerts.size
      };
    } catch (error) {
      console.error('Error fetching alert stats:', error);
      return {
        total: 0,
        new: 0,
        investigating: 0,
        resolved: 0,
        high: 0,
        critical: 0
      };
    }
  }
}
