// Interfaz para las "bolsas de tiempo" - cada ingreso de dinero
export interface BalanceBag {
  id: string;
  amount: number;
  currency: 'GS' | 'USD';
  receivedAt: string; // ISO date string
  source: 'link' | 'qr' | 'transfer' | 'add_balance' | 'dropshipping' | 'marketplace' | 'api';
  description?: string;
}