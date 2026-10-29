import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';

export interface PriceHistoryEntry {
  id?: string;
  productId: string;
  price: number;
  timestamp: any;
}

export async function logPriceChange(userId: string, productId: string, price: number) {
  const path = `users/${userId}/products/${productId}/priceHistory`;
  try {
    const historyCol = collection(db, path);
    await addDoc(historyCol, {
      productId,
      price,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getPriceHistory(userId: string, productId: string): Promise<PriceHistoryEntry[]> {
  const path = `users/${userId}/products/${productId}/priceHistory`;
  try {
    const historyCol = collection(db, path);
    const q = query(historyCol, orderBy('timestamp', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PriceHistoryEntry[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}
