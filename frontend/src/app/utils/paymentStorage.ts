// Utilidades para almacenar y recuperar información de pagos generados

export interface PaymentLink {
  id: string;
  type: 'link' | 'qr';
  chargeType: 'sale' | 'freelance' | 'subscription';
  productName: string;
  amount: number;
  currency: 'GS' | 'USD';
  createdAt: string;
  status: 'active' | 'paid' | 'expired';
  merchantName: string;
  merchantId: string;
  subscriptionFrequency?: 'weekly' | 'monthly' | 'yearly';
  subscriptionStartDate?: string;
}

const STORAGE_KEY = 'woz_payment_links';

// Guardar un link de pago
export function savePaymentLink(link: PaymentLink): void {
  try {
    const existing = getAllPaymentLinks();
    existing[link.id] = link;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (error) {
    console.error('Error saving payment link:', error);
  }
}

// Obtener todos los links de pago
export function getAllPaymentLinks(): Record<string, PaymentLink> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error getting payment links:', error);
    return {};
  }
}

// Obtener un link de pago específico
export function getPaymentLink(id: string): PaymentLink | null {
  try {
    const links = getAllPaymentLinks();
    return links[id] || null;
  } catch (error) {
    console.error('Error getting payment link:', error);
    return null;
  }
}

// Actualizar el estado de un link de pago
export function updatePaymentLinkStatus(id: string, status: 'active' | 'paid' | 'expired'): void {
  try {
    const links = getAllPaymentLinks();
    if (links[id]) {
      links[id].status = status;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    }
  } catch (error) {
    console.error('Error updating payment link status:', error);
  }
}

// Limpiar links expirados (más de 30 días)
export function cleanExpiredLinks(): void {
  try {
    const links = getAllPaymentLinks();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    Object.keys(links).forEach(id => {
      const link = links[id];
      const createdDate = new Date(link.createdAt);
      if (createdDate < thirtyDaysAgo) {
        delete links[id];
      }
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  } catch (error) {
    console.error('Error cleaning expired links:', error);
  }
}
