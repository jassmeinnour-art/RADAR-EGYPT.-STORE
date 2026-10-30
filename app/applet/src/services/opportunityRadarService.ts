
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
  monitorEvents() {
    // In a real app, this would subscribe to Firestore or a real-time event bus
    console.log('Monitoring events...');
  }

  // Generate an opportunity
  async generateOpportunity(opportunity: Omit<Opportunity, 'id' | 'createdAt' | 'status'>): Promise<Opportunity> {
    const newOpportunity: Opportunity = {
      ...opportunity,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date(),
      status: 'pending'
    };
    
    // In a real app, save to Firestore
    console.log('Opportunity generated:', newOpportunity);
    return newOpportunity;
  }
}

export const opportunityRadarService = OpportunityRadarService.getInstance();
