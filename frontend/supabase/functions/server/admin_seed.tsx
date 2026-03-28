// Admin seed data for Woz Payments - FINTECH STRUCTURE V11
// Updated to match the "Resultado Financiero Consolidado" & "Productos Financieros" requirements.

export const ADMIN_CLIENTS = [
  { id: 'c001', firstName: 'Juan', lastName: 'Pérez', email: 'juan@email.com', membership: 'emprendedor-business', status: 'approved', balanceGs: 45000000, joinedAt: '2023-08-15' },
  { id: 'c002', firstName: 'María', lastName: 'García', email: 'maria@email.com', membership: 'regular', status: 'approved', balanceGs: 23000000, joinedAt: '2023-09-22' },
  { id: 'c003', firstName: 'Carlos', lastName: 'López', email: 'carlos@email.com', membership: 'basico', status: 'approved', balanceGs: 8000000, joinedAt: '2023-11-10' },
];

export const ADMIN_REVENUE = {
  // 1. MEMBRESÍAS
  memberships: {
    basico: { count: 85, price: 250000, revenue: 21250000 },
    regular: { count: 42, price: 600000, revenue: 25200000 },
    business: { count: 18, price: 1500000, revenue: 27000000 },
    totalRevenue: 73450000
  },

  // 2. COMISIONES POR TRANSACCIONES
  commissions: {
    links: {
      ventas: { count: 450, volume: 400000000, revenue: 32000000 },
      freelance: { count: 120, volume: 150000000, revenue: 12000000 },
      suscripciones: { count: 380, volume: 100000000, revenue: 8000000 },
    },
    qr: {
      ventas: { count: 800, volume: 600000000, revenue: 40000000 },
      freelance: { count: 200, volume: 200000000, revenue: 14000000 },
      suscripciones: { count: 150, volume: 105000000, revenue: 10100000 },
    },
    totalVolume: 1555000000,
    totalRevenue: 116100000
  },

  // 3. RETIROS
  withdrawals: {
    instant: { volume: 180000000, rate: 15, revenue: 27000000 },
    sevenDays: { volume: 95000000, rate: 10, revenue: 9500000 },
    fourteenDays: { volume: 40000000, rate: 8, revenue: 3200000 },
    thirtyDays: { volume: 25000000, rate: 3.9, revenue: 975000 },
    totalVolume: 340000000,
    totalRevenue: 40675000
  },

  // 4. WOZ API
  wozApi: {
    count: 12,
    price: 1500000,
    totalRevenue: 18000000
  },

  // 5. WOZ MARKETPLACE
  wozMarketplace: {
    count: 24,
    price: 500000,
    totalRevenue: 12000000
  },

  // 6. PRODUCTOS FINANCIEROS (DETALLADO)
  
  // A. PRÉSTAMOS
  loans: {
    // 1. Capital Gestionado
    capitalLent: 850000000,     // Total prestado histórico
    capitalPending: 530000000,  // Capital vivo en la calle
    capitalRecovered: 320000000,
    
    // 2. Ingresos por Intereses
    interestCollected: 48500000, // Cobrado real
    interestPending: 15000000,   // Devengado no cobrado
    avgRate: 5.5,               // % Mensual promedio
    
    // 3. Riesgo
    amountOverdue: 45000000,     // Capital en mora > 90 días
    badDebtProvision: 12500000,  // Previsión (Pérdida estimada)
    delinquencyRate: 5.2,        // % Morosidad
  },

  // B. AHORRO PROGRAMADO (CDA)
  savings: {
    // 1. Pasivo Administrado
    totalDeposited: 2100000000,   // Pasivo principal
    interestCommitted: 168000000, // Pasivo intereses (legacy field, kept for consistency if needed)
    avgTerm: 12,                  // Meses
    
    // 2. Rendimiento
    totalYieldGenerated: 252000000, // Bruto ganado invirtiendo el dinero
    avgYieldRate: 12,               // % Anual
    
    // 3. Costo
    interestPaid: 168000000,      // Pagado a clientes
  },

  // 7. COSTOS ESTRUCTURALES (Exonerados/Excluidos según requerimiento)
  costs: {
    operational: 0,        
    financial: 0,           
    additionalProvisions: 0 
  },

  // 8. EXPOSICIÓN TOTAL (Informativo de escala)
  exposure: {
    totalLiabilities: 3250000000,      // Pasivos totales
    totalRotatingCapital: 850000000,   // Dinero prestado
    totalCustody: 2100000000           // Dinero en CDA/Ahorros
  }
};

export const DEFAULT_CURRENCY = {
  usdToGs: 7450,
  updatedAt: new Date().toISOString(),
  updatedBy: 'Sistema',
};

// Required exports
export const ADMIN_LOANS = []; 

// NEW: Filled CDA Data
export const ADMIN_SAVINGS = [
  {
    id: 's001',
    clientId: 'c001',
    clientName: 'Juan Pérez',
    amountInvested: 150000000,
    termMonths: 12,
    rate: 11.5, // Anual
    startDate: '2023-11-01',
    endDate: '2024-11-01',
    totalToReceive: 167250000, // 150M + 11.5%
    status: 'active'
  },
  {
    id: 's002',
    clientId: 'c002',
    clientName: 'María García',
    amountInvested: 50000000,
    termMonths: 6,
    rate: 9.0, // Anual
    startDate: '2024-01-15',
    endDate: '2024-07-15',
    totalToReceive: 52250000, // 50M + 4.5% (6 meses)
    status: 'active'
  },
  {
    id: 's003',
    clientId: 'c005',
    clientName: 'Roberto Gómez',
    amountInvested: 500000000,
    termMonths: 24,
    rate: 13.0, // Anual
    startDate: '2023-06-01',
    endDate: '2025-06-01',
    totalToReceive: 630000000, // 500M + 26% (2 años)
    status: 'active'
  },
  {
    id: 's004',
    clientId: 'c008',
    clientName: 'Ana Benítez',
    amountInvested: 25000000,
    termMonths: 12,
    rate: 10.5,
    startDate: '2024-02-01',
    endDate: '2025-02-01',
    totalToReceive: 27625000,
    status: 'active'
  }
];

export const ADMIN_REQUESTS = [];
export const DEFAULT_RATES = {};
