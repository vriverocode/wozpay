export type MembershipTier = 'gratuito' | 'basico' | 'regular' | 'emprendedor-business';

export interface MembershipProfile {
  id: MembershipTier;
  name: string;
  annualCost: number;
  currency: 'GS' | 'USD';
  color: string;
  iconType: 'crown' | 'zap';
  badge?: string;
  
  // Límites y restricciones
  limits: {
    linksAndQrs: number; // -1 = ilimitado
    maxAmountPerLink: number; // en GS
    maxAmountPerLinkUsd: number; // en USD
    monthlyTransactionLimit: number; // -1 = ilimitado
    dailyTransactionLimit: number;
  };
  
  // Comisiones
  commissions: {
    transactionRate: number; // porcentaje (ej: 15 = 15%)
    wozPayRate: number; // porcentaje sobre transacciones
    fixedFeeUsd: number; // tarifa fija en USD por transacción
    fixedFeeGs: number; // tarifa fija en GS por transacción
    
    // Comisiones de retiro por tiempo (en porcentaje)
    withdrawal: {
      instant: number; // 0 días
      sevenDays: number; // 7 días
      fourteenDays: number; // 14 días
      thirtyDays: number; // 30 días
    };
  };
  
  // Características
  features: {
    accounts: string[];
    multiCurrency: boolean;
    loansLimit: number; // 0 = sin préstamos
    creditCard: boolean;
    creditCardLimit: number;
    apiAccess: boolean;
    shopifyIntegration: boolean;
    woocommerceIntegration: boolean;
    fastAccreditation: boolean; // 24hs vs 7 días
    prioritySupport: boolean;
  };
}

export const membershipProfiles: Record<MembershipTier, MembershipProfile> = {
  'gratuito': {
    id: 'gratuito',
    name: 'Gratuito',
    annualCost: 0,
    currency: 'GS',
    color: 'from-slate-500 to-slate-600',
    iconType: 'zap',
    
    limits: {
      linksAndQrs: 5,
      maxAmountPerLink: 700000, // 700.000 Gs
      maxAmountPerLinkUsd: 100, // ~100 USD aprox
      monthlyTransactionLimit: 2000000, // GS
      dailyTransactionLimit: 500000,
    },
    
    commissions: {
      transactionRate: 15, // 15% sobre el monto
      wozPayRate: 15,
      fixedFeeUsd: 1.5, // 1,5 USD fijo por transacción
      fixedFeeGs: 6900, // 6.900 Gs fijo por transacción
      withdrawal: {
        instant: 15, // Fijos para todas las membresías
        sevenDays: 10,
        fourteenDays: 8,
        thirtyDays: 3.9,
      },
    },
    
    features: {
      accounts: ['Cuenta básica en GS'],
      multiCurrency: false,
      loansLimit: 0,
      creditCard: false,
      creditCardLimit: 0,
      apiAccess: false,
      shopifyIntegration: false,
      woocommerceIntegration: false,
      fastAccreditation: false,
      prioritySupport: false,
    },
  },
  
  'basico': {
    id: 'basico',
    name: 'Básico',
    annualCost: 250000,
    currency: 'GS',
    color: 'from-gray-600 to-gray-700',
    iconType: 'crown',
    
    limits: {
      linksAndQrs: 20,
      maxAmountPerLink: 1000000, // 1.000.000 Gs
      maxAmountPerLinkUsd: 150, // ~150 USD aprox
      monthlyTransactionLimit: 10000000, // GS
      dailyTransactionLimit: 2000000,
    },
    
    commissions: {
      transactionRate: 12, // 12% sobre el monto
      wozPayRate: 12,
      fixedFeeUsd: 1.5, // 1,5 USD fijo por transacción
      fixedFeeGs: 6900, // 6.900 Gs fijo por transacción
      withdrawal: {
        instant: 15, // Fijos para todas las membresías
        sevenDays: 10,
        fourteenDays: 8,
        thirtyDays: 3.9,
      },
    },
    
    features: {
      accounts: ['Cuenta básica en GS y USD'],
      multiCurrency: true,
      loansLimit: 50000000, // 50 millones
      creditCard: false,
      creditCardLimit: 0,
      apiAccess: false,
      shopifyIntegration: false,
      woocommerceIntegration: false,
      fastAccreditation: false,
      prioritySupport: false,
    },
  },
  
  'regular': {
    id: 'regular',
    name: 'Emprendedor Regular',
    annualCost: 600000,
    currency: 'GS',
    color: 'from-blue-600 to-blue-700',
    iconType: 'zap',
    badge: 'POPULAR',
    
    limits: {
      linksAndQrs: 30,
      maxAmountPerLink: 6000000, // 6.000.000 Gs o 1.000 USD
      maxAmountPerLinkUsd: 1000, // 1.000 USD
      monthlyTransactionLimit: 225000000, // ~30,000 USD
      dailyTransactionLimit: 15000000,
    },
    
    commissions: {
      transactionRate: 6.5, // 6,5% sobre el monto
      wozPayRate: 8,
      fixedFeeUsd: 1.5, // 1,5 USD fijo por transacción
      fixedFeeGs: 6900, // 6.900 Gs fijo por transacción
      withdrawal: {
        instant: 15, // Fijos para todas las membresías
        sevenDays: 10,
        fourteenDays: 8,
        thirtyDays: 3.9,
      },
    },
    
    features: {
      accounts: ['Cuenta corriente en USD'],
      multiCurrency: true,
      loansLimit: 200000000, // 200 millones
      creditCard: false,
      creditCardLimit: 0,
      apiAccess: true,
      shopifyIntegration: false,
      woocommerceIntegration: false,
      fastAccreditation: true,
      prioritySupport: false,
    },
  },
  
  'emprendedor-business': {
    id: 'emprendedor-business',
    name: 'Emprendedor Business',
    annualCost: 1500000,
    currency: 'GS',
    color: 'from-amber-600 to-amber-700',
    iconType: 'crown',
    badge: 'PREMIUM',
    
    limits: {
      linksAndQrs: -1, // ilimitado
      maxAmountPerLink: 130000000, // 130.000.000 Gs o 20.000 USD
      maxAmountPerLinkUsd: 20000, // 20.000 USD
      monthlyTransactionLimit: -1, // ilimitado (hasta 1M USD en práctica)
      dailyTransactionLimit: 75000000,
    },
    
    commissions: {
      transactionRate: 3.9, // 3,9% sobre el monto
      wozPayRate: 5,
      fixedFeeUsd: 1.5, // 1,5 USD fijo por transacción
      fixedFeeGs: 6900, // 6.900 Gs fijo por transacción
      withdrawal: {
        instant: 15, // Fijos para todas las membresías
        sevenDays: 10,
        fourteenDays: 8,
        thirtyDays: 3.9,
      },
    },
    
    features: {
      accounts: ['Cuenta corriente en USD', 'Tarjeta de crédito de 2.000 USD oro'],
      multiCurrency: true,
      loansLimit: 600000000, // 600 millones
      creditCard: true,
      creditCardLimit: 15000000, // ~2000 USD
      apiAccess: true,
      shopifyIntegration: true,
      woocommerceIntegration: true,
      fastAccreditation: true,
      prioritySupport: true,
    },
  },
};

export function getMembershipProfile(tier: MembershipTier): MembershipProfile {
  return membershipProfiles[tier];
}