import { BalanceBag } from '../types/balance';
import { MembershipTier, membershipProfiles } from '../types/membership';

// Interfaz para el desglose de una bolsa individual
export interface BagBreakdown {
  bagId: string;
  bagReceivedAt: string;
  bagSource: string;
  daysOld: number;
  amountUsed: number;
  commissionRate: number;
  commission: number;
  iva: number;
  netFromBag: number;
}

// Interfaz para el resultado completo del cálculo
export interface WithdrawalCalculation {
  totalRequestedAmount: number;
  bagsUsed: BagBreakdown[];
  totalCommission: number;
  totalIva: number;
  wozPayCommission: number; // Nueva: Comisión Woz Pay
  fixedFee: number; // Nueva: Tarifa fija
  netAmount: number; // Lo que realmente recibe
  totalDebited: number; // Lo que se debita de la wallet
}

/**
 * Calcula la comisión según los días transcurridos desde que se recibió el dinero
 * Las comisiones de retiro son FIJAS para todas las membresías
 * @param daysOld - Días desde que se recibió el dinero
 * @returns Porcentaje de comisión (0.15 = 15%, 0.10 = 10%, etc.)
 */
export function getCommissionRate(daysOld: number, membershipTier: MembershipTier = 'gratuito'): number {
  // Comisiones FIJAS para todas las membresías:
  // 15% instantáneo, 10% a 7 días, 8% a 14 días, 3.9% a 30 días
  if (daysOld >= 30) return 0.039; // 3.9%
  if (daysOld >= 14) return 0.08;  // 8%
  if (daysOld >= 7) return 0.10;   // 10%
  return 0.15;                      // 15%
}

/**
 * Obtiene las bolsas elegibles para una comisión específica
 * @param bags - Array de todas las bolsas disponibles
 * @param selectedCommission - Comisión seleccionada (0.15, 0.10, 0.08, 0.039)
 * @returns Array de bolsas que califican para esa comisión
 */
export function getEligibleBags(bags: BalanceBag[], selectedCommission: number): BalanceBag[] {
  const now = new Date();
  
  return bags.filter(bag => {
    const daysOld = calculateDaysOld(bag.receivedAt);
    const bagCommission = getCommissionRate(daysOld);
    
    // Para 15% (instantáneo): todas las bolsas califican
    if (selectedCommission === 0.15) return true;
    
    // Para otras comisiones: solo las que tengan esa comisión o menor
    // (más antiguas = menor comisión)
    return bagCommission <= selectedCommission;
  });
}

/**
 * Calcula el total disponible para una comisión específica
 * @param bags - Array de todas las bolsas disponibles
 * @param selectedCommission - Comisión seleccionada
 * @returns Monto total disponible
 */
export function getAvailableForCommission(bags: BalanceBag[], selectedCommission: number): number {
  const eligibleBags = getEligibleBags(bags, selectedCommission);
  return eligibleBags.reduce((sum, bag) => sum + bag.amount, 0);
}

/**
 * Calcula cuántos días faltan para alcanzar una comisión específica
 * @param bags - Array de todas las bolsas disponibles
 * @param targetCommission - Comisión objetivo (0.10, 0.08, 0.039)
 * @returns Número de días que faltan, o 0 si ya tiene dinero disponible
 */
export function getDaysUntilCommission(bags: BalanceBag[], targetCommission: number): number {
  if (bags.length === 0) return 0;
  
  // Ordenar bolsas por fecha (más reciente primero para ver cuál es la más nueva)
  const sortedBags = [...bags].sort((a, b) => 
    new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
  );
  
  // Encontrar la bolsa más reciente que todavía no califica
  const newestBag = sortedBags[0];
  const daysOld = calculateDaysOld(newestBag.receivedAt);
  
  let requiredDays = 0;
  if (targetCommission === 0.10) requiredDays = 7;
  if (targetCommission === 0.08) requiredDays = 14;
  if (targetCommission === 0.039) requiredDays = 30;
  
  const daysRemaining = requiredDays - daysOld;
  return Math.max(0, daysRemaining);
}

/**
 * Calcula la antigüedad en días de una bolsa
 * @param receivedAt - ISO string de cuándo se recibió
 * @returns Número de días transcurridos
 */
export function calculateDaysOld(receivedAt: string): number {
  const received = new Date(receivedAt);
  const now = new Date();
  const diffTime = now.getTime() - received.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Calcula el retiro usando la lógica de bolsas de tiempo (FIFO)
 * @param requestedAmount - Monto que el usuario quiere retirar
 * @param bags - Array de bolsas disponibles (ordenadas por fecha, ms antiguas primero)
 * @param membershipTier - Nivel de membresía del usuario
 * @returns Objeto con el desglose completo del retiro
 */
export function calculateWithdrawalByBags(
  requestedAmount: number,
  bags: BalanceBag[],
  membershipTier: MembershipTier = 'gratuito'
): WithdrawalCalculation {
  // Validar entrada
  if (!bags || bags.length === 0 || requestedAmount <= 0) {
    return {
      totalRequestedAmount: requestedAmount,
      bagsUsed: [],
      totalCommission: 0,
      totalIva: 0,
      wozPayCommission: 0,
      fixedFee: 0,
      netAmount: 0,
      totalDebited: 0
    };
  }

  const profile = membershipProfiles[membershipTier];

  // Ordenar bolsas por fecha (FIFO - First In, First Out)
  const sortedBags = [...bags].sort((a, b) => 
    new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime()
  );

  const bagsUsed: BagBreakdown[] = [];
  let remainingToWithdraw = requestedAmount;
  let totalCommission = 0;
  let totalIva = 0;
  let totalNet = 0;

  // Iterar por las bolsas en orden (más antiguas primero)
  for (const bag of sortedBags) {
    if (remainingToWithdraw <= 0) break;

    // Calcular cuánto usamos de esta bolsa
    const amountUsed = Math.min(remainingToWithdraw, bag.amount);
    
    // Calcular antigüedad de la bolsa
    const daysOld = calculateDaysOld(bag.receivedAt);
    
    // Obtener la tasa de comisión según los días y el perfil
    const commissionRate = getCommissionRate(daysOld, membershipTier);
    
    // Calcular comisión e IVA para esta bolsa
    const commission = amountUsed * commissionRate;
    const iva = commission * 0.10; // 10% IVA sobre la comisión
    const netFromBag = amountUsed - commission - iva;

    // Agregar al desglose
    bagsUsed.push({
      bagId: bag.id,
      bagReceivedAt: bag.receivedAt,
      bagSource: bag.source,
      daysOld,
      amountUsed,
      commissionRate,
      commission,
      iva,
      netFromBag
    });

    // Acumular totales
    totalCommission += commission;
    totalIva += iva;
    totalNet += netFromBag;

    // Reducir lo que falta por retirar
    remainingToWithdraw -= amountUsed;
  }

  // Calcular comisión Woz Pay según el perfil
  const wozPayCommission = totalNet * (profile.commissions.wozPayRate / 100);
  const fixedFee = 0; // Gratis durante 12 meses

  return {
    totalRequestedAmount: requestedAmount,
    bagsUsed,
    totalCommission,
    totalIva,
    wozPayCommission,
    fixedFee,
    netAmount: totalNet - wozPayCommission - fixedFee,
    totalDebited: requestedAmount
  };
}

/**
 * Consume las bolsas después de confirmar un retiro
 * @param bags - Array actual de bolsas
 * @param calculation - Resultado del cálculo de retiro
 * @returns Nuevo array de bolsas con los montos actualizados
 */
export function consumeBagsAfterWithdrawal(
  bags: BalanceBag[],
  calculation: WithdrawalCalculation
): BalanceBag[] {
  const newBags = [...bags];
  
  for (const bagUsed of calculation.bagsUsed) {
    const bagIndex = newBags.findIndex(b => b.id === bagUsed.bagId);
    if (bagIndex !== -1) {
      const remainingAmount = newBags[bagIndex].amount - bagUsed.amountUsed;
      
      if (remainingAmount <= 0.01) {
        // Si la bolsa se agotó, removerla
        newBags.splice(bagIndex, 1);
      } else {
        // Si todavía tiene saldo, actualizar el monto
        newBags[bagIndex] = {
          ...newBags[bagIndex],
          amount: remainingAmount
        };
      }
    }
  }
  
  return newBags;
}

/**
 * Formatea el nombre de la fuente para mostrar
 */
export function formatSource(source: string): string {
  const sourceNames: Record<string, string> = {
    'link': 'Link de cobro',
    'qr': 'Código QR',
    'transfer': 'Transferencia',
    'add_balance': 'Carga de saldo',
    'dropshipping': 'Woz Dropshipping',
    'marketplace': 'Woz Marketplace',
    'api': 'Woz API'
  };
  return sourceNames[source] || source;
}

/**
 * Formatea el texto de los días de antigüedad
 */
export function formatDaysOld(days: number): string {
  if (days === 0) return 'Hoy';
  if (days === 1) return '1 día';
  return `${days} días`;
}