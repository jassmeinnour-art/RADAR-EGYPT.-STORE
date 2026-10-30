
import { db } from '../firebase';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { auth } from '../firebase';

export interface Opportunity {
  id: string;
  type: 'stock' | 'abandoned_cart' | 'price_drop' | 'new_order';
  title: string;
  description: string;
  productId?: string;
  productName?: string;
  customerId?: string;
  customerName?: string;
  action: {
    label: string;
    type: 'whatsapp' | 'email' | 'reprice' | 'none';
    payload: any;
  };
  createdAt: Date;
  status: 'pending' | 'resolved' | 'ignored';
}

class OpportunityRadarService {
  private static instance: OpportunityRadarService;
  
  private constructor() {}

  static getInstance(): OpportunityRadarService {
    if (!OpportunityRadarService.instance) {
      OpportunityRadarService.instance = new OpportunityRadarService();
    }
    return OpportunityRadarService.instance;
  }

  // Monitor events
  monitorOpportunities(onUpdate: (opportunities: Opportunity[]) => void) {
    if (!auth.currentUser) return () => {};
    
    const userId = auth.currentUser.uid;
    const q = query(
      collection(db, `users/${userId}/opportunities`),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const opportunities = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Opportunity[];
      onUpdate(opportunities);
    });

    return unsubscribe;
  }

  // Generate an opportunity
  async updateOpportunityStatus(opportunityId: string, status: 'resolved' | 'ignored') {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const opportunityRef = doc(db, `users/${userId}/opportunities`, opportunityId);
    await updateDoc(opportunityRef, { status });
  }

  // Generate an opportunity (mock for now, should be done server-side)
  async generateOpportunity(opportunity: Omit<Opportunity, 'id' | 'createdAt' | 'status'>): Promise<void> {
    // This should be done on the server, but for now we implement a simple push
    console.log('Generating opportunity:', opportunity);
  }
}

export const opportunityRadarService = OpportunityRadarService.getInstance();
