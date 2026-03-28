import { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const API = `https://${projectId}.supabase.co/functions/v1/make-server-fe20efe1`;
const HEADERS = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` };

function fmt(n: number | undefined | null) { 
  if (n === undefined || n === null) return '0';
  return new Intl.NumberFormat('es-PY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(n); 
}

function Section({ title, children, className = "mb-6" }: { title: string, children: React.ReactNode, className?: string }) {
  return (
    <div className={className}>
      <h3 className="text-xs text-gray-800 uppercase tracking-widest mb-2 pl-1 font-medium">{title}</h3>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, subLabel, isTotal = false }: { label: string, value: number, subLabel?: string, isTotal?: boolean }) {
  return (
    <div className={`flex justify-between items-start py-3 px-4 border-b border-gray-100 last:border-0 ${isTotal ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="flex flex-col">
        <span className={`text-sm ${isTotal ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{label}</span>
        {subLabel && <span className="text-[10px] text-gray-400 mt-0.5">{subLabel}</span>}
      </div>
      <span className={`text-sm ${isTotal ? 'text-gray-900 font-medium' : 'text-gray-800'}`}>
        Gs {fmt(value)}
      </span>
    </div>
  );
}

function FinancialRow({ label, value, isDeduction = false, isBold = false, subLabel }: { label: string, value: number, isDeduction?: boolean, isBold?: boolean, subLabel?: string }) {
  return (
    <div className={`flex justify-between items-center py-2 px-4 border-b border-gray-100 last:border-0 ${isBold ? 'bg-gray-50' : ''}`}>
      <div className="flex flex-col">
        <span className={`text-sm ${isBold ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{label}</span>
        {subLabel && <span className="text-[10px] text-gray-400">{subLabel}</span>}
      </div>
      <span className={`text-sm ${isDeduction ? 'text-red-500' : isBold ? 'text-gray-900 font-medium' : 'text-gray-800'}`}>
        {isDeduction ? '-' : ''} Gs {fmt(value)}
      </span>
    </div>
  );
}

function SubHeader({ title }: { title: string }) {
  return (
    <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{title}</span>
    </div>
  );
}

function ModuleTitle({ title, colorClass = "text-gray-800" }: { title: string, colorClass?: string }) {
  return (
    <div className="px-4 pt-3 pb-1 border-b border-gray-100 bg-white">
      <span className={`text-xs uppercase tracking-widest font-medium ${colorClass}`}>{title}</span>
    </div>
  );
}

export function AdminRevenue() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/admin/revenue`, { headers: HEADERS });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      if (!json || !json.commissions || !json.consolidated) {
        throw new Error("Datos incompletos recibidos del servidor.");
      }
      setData(json);
    } catch (err) {
      console.error(err);
      setError(`Error al cargar datos.`);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
      <RefreshCw size={16} className="animate-spin text-gray-600" />
      <span className="text-xs text-gray-500">Cargando reporte...</span>
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-50 text-red-600 text-xs flex items-center gap-2 rounded-lg m-4">
      <AlertCircle size={14} /> {error}
    </div>
  );

  if (!data) return null;

  const links = data?.commissions?.links || { ventas: {}, freelance: {}, suscripciones: {} };
  const qr = data?.commissions?.qr || { ventas: {}, freelance: {}, suscripciones: {} };
  
  const totalCommissionRevenue = 
    ((links.ventas?.revenue || 0) + (links.freelance?.revenue || 0) + (links.suscripciones?.revenue || 0)) + 
    ((qr.ventas?.revenue || 0) + (qr.freelance?.revenue || 0) + (qr.suscripciones?.revenue || 0));

  const l = data.loans || {};
  const s = data.savings || {};
  const c = data.consolidated || {};
  const deductions = c.deductions || { badDebtProvision: 0, interestPaid: 0, otherCosts: 0 };
  const m = data.memberships || { basico: {}, regular: {}, business: {} };
  const w = data.withdrawals || { instant: {}, sevenDays: {}, fourteenDays: {}, thirtyDays: {} };
  const wa = data.wozApi || {};
  const wm = data.wozMarketplace || {};

  return (
    <div className="max-w-md mx-auto pb-12 px-4 pt-6 animate-in fade-in duration-300">
      
      <div className="flex items-center justify-between mb-6 px-1">
        <h1 className="text-base text-gray-900 font-medium">Reporte Financiero</h1>
        <button onClick={load} className="text-gray-400 hover:text-gray-600">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* DETALLES DE PRODUCTOS (SECTIONS 1-5) */}
      <Section title="1. Membresías">
        <Row label="Plan Básico" subLabel={`${m.basico?.count || 0} usuarios`} value={m.basico?.revenue || 0} />
        <Row label="Plan Regular" subLabel={`${m.regular?.count || 0} usuarios`} value={m.regular?.revenue || 0} />
        <Row label="Plan Business" subLabel={`${m.business?.count || 0} usuarios`} value={m.business?.revenue || 0} />
        <Row label="Total Membresías" value={m.totalRevenue || 0} isTotal />
      </Section>

      <Section title="2. Comisiones Transaccionales">
        <SubHeader title="Links de Pago" />
        <Row label="Ventas" subLabel={`${links.ventas?.count || 0} ops efectivizadas`} value={links.ventas?.revenue || 0} />
        <Row label="Freelance" subLabel={`${links.freelance?.count || 0} ops efectivizadas`} value={links.freelance?.revenue || 0} />
        <Row label="Suscripciones" subLabel={`${links.suscripciones?.count || 0} ops efectivizadas`} value={links.suscripciones?.revenue || 0} />
        
        <SubHeader title="Pagos con QR" />
        <Row label="Ventas" subLabel={`${qr.ventas?.count || 0} ops efectivizadas`} value={qr.ventas?.revenue || 0} />
        <Row label="Freelance" subLabel={`${qr.freelance?.count || 0} ops efectivizadas`} value={qr.freelance?.revenue || 0} />
        <Row label="Suscripciones" subLabel={`${qr.suscripciones?.count || 0} ops efectivizadas`} value={qr.suscripciones?.revenue || 0} />
        
        <Row label="Total Comisiones" value={totalCommissionRevenue} isTotal />
      </Section>

      <Section title="3. Retiros">
        <Row label="Inmediato (15%)" subLabel={`Vol: ${fmt(w.instant?.volume)}`} value={w.instant?.revenue || 0} />
        <Row label="7 Días (10%)" subLabel={`Vol: ${fmt(w.sevenDays?.volume)}`} value={w.sevenDays?.revenue || 0} />
        <Row label="14 Días (8%)" subLabel={`Vol: ${fmt(w.fourteenDays?.volume)}`} value={w.fourteenDays?.revenue || 0} />
        <Row label="30 Días (3.9%)" subLabel={`Vol: ${fmt(w.thirtyDays?.volume)}`} value={w.thirtyDays?.revenue || 0} />
        <Row label="Total Retiros" value={w.totalRevenue || 0} isTotal />
      </Section>

      <Section title="4. Otros Servicios">
        <Row label="Woz API" subLabel={`${wa.count || 0} integraciones`} value={wa.totalRevenue || 0} />
        <Row label="Marketplace" subLabel={`${wm.count || 0} licencias`} value={wm.totalRevenue || 0} />
      </Section>

      <div className="mb-8">
        <h3 className="text-xs text-gray-800 uppercase tracking-widest mb-2 pl-1 font-medium">5. Productos Financieros</h3>
        
        {/* A. PRÉSTAMOS */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-4">
          <ModuleTitle title="A. Préstamos" colorClass="text-emerald-700" />
          
          <SubHeader title="1. Capital Gestionado (Rotación)" />
          <Row label="Capital Total Prestado" value={l.capitalLent || 0} />
          <Row label="Capital Pendiente de Cobro" value={l.capitalPending || 0} />
          <Row label="Capital Recuperado" value={l.capitalRecovered || 0} />

          <SubHeader title="2. Ingresos por Intereses" />
          <Row label="Intereses Cobrados (Real)" subLabel={`Tasa Promedio: ${l.avgRate || 0}%`} value={l.interestCollected || 0} />
          <Row label="Intereses Pendientes" value={l.interestPending || 0} />

          <SubHeader title="3. Riesgo y Morosidad" />
          <Row label="Monto en Mora" subLabel={`Morosidad: ${l.delinquencyRate || 0}%`} value={l.amountOverdue || 0} />
          <FinancialRow label="Provisión Incobrables" value={l.badDebtProvision || 0} isDeduction />

          <div className="bg-emerald-50 border-t border-emerald-100">
             <Row label="Resultado Neto Préstamos" value={c.netLoanResult || 0} isTotal />
          </div>
        </div>

        {/* B. AHORRO PROGRAMADO (CDA) */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <ModuleTitle title="B. Ahorro Programado (CDA)" colorClass="text-blue-700" />

          <Row label="Capital Depositado" subLabel="Invertido por cliente" value={s.totalDeposited || 0} />
          <Row label="Rentabilidad" subLabel="Rentabilidad de capital" value={s.totalYieldGenerated || 0} />
          <FinancialRow label="Intereses Pagados" subLabel="Pagados a clientes" value={s.interestPaid || 0} isDeduction />

          <div className="bg-blue-50 border-t border-blue-100">
             <Row label="Spread Financiero (Ganancia)" value={c.netSavingsSpread || 0} isTotal />
          </div>
        </div>
      </div>

      {/* RESULTADO FINANCIERO CONSOLIDADO (SPLIT BLOCKS) */}
      <h3 className="text-xs text-gray-800 uppercase tracking-widest mb-4 pl-1 font-medium">Resultado Financiero Consolidado</h3>

      {/* BLOQUE 1: INGRESOS OPERATIVOS */}
      <div className="mb-4 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-3 bg-gray-50 border-b border-gray-100">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase">Ingresos Operativos</h4>
        </div>
        <FinancialRow label="Membresías" value={m.totalRevenue || 0} />
        <FinancialRow label="Comisiones" value={totalCommissionRevenue} />
        <FinancialRow label="Retiros" value={w.totalRevenue || 0} />
        <FinancialRow label="API & Marketplace" value={(wa.totalRevenue || 0) + (wm.totalRevenue || 0)} />
        <div className="bg-gray-50 border-t border-gray-100">
          <FinancialRow label="Subtotal Operativo" value={c.subtotalOperational || 0} isBold />
        </div>
      </div>

      {/* BLOQUE 2: INGRESOS FINANCIEROS */}
      <div className="mb-4 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-3 bg-gray-50 border-b border-gray-100">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase">Ingresos Financieros (Bruto)</h4>
        </div>
        <FinancialRow label="Intereses Cobrados" subLabel="Préstamos" value={l.interestCollected || 0} />
        <FinancialRow label="Rentabilidad Generada" subLabel="Ahorros" value={s.totalYieldGenerated || 0} />
        <div className="bg-gray-50 border-t border-gray-100">
          <FinancialRow label="Subtotal Financiero" value={c.grossFinancialIncome || 0} isBold />
        </div>
      </div>

      {/* BLOQUE 3: INGRESO BRUTO CONSOLIDADO */}
      <div className="mb-4 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden p-4 flex justify-between items-center">
        <span className="text-sm font-bold text-gray-900 uppercase">Ingreso Bruto Consolidado</span>
        <span className="text-base font-bold text-gray-900">Gs {fmt(c.grossTotalIncome || 0)}</span>
      </div>

      {/* BLOQUE 4: COSTOS Y PROVISIONES */}
      <div className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-3 bg-gray-50 border-b border-gray-100">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase">(-) Costos y Provisiones</h4>
        </div>
        <FinancialRow label="Provisión Incobrable" subLabel="Préstamos" value={deductions.badDebtProvision || 0} isDeduction />
        <FinancialRow label="Intereses Pagados" subLabel="Ahorros" value={deductions.interestPaid || 0} isDeduction />
        {(deductions.otherCosts > 0) && (
          <FinancialRow label="Otros Costos" value={deductions.otherCosts} isDeduction />
        )}
        <div className="bg-red-50 border-t border-red-100">
          <FinancialRow label="Total Deducciones" value={c.totalDeductions || 0} isDeduction isBold />
        </div>
      </div>

      {/* BLOQUE 5: RESULTADO NETO */}
      <div className="mb-12 bg-gray-900 rounded-lg shadow-lg p-6 text-center text-white">
        <div className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">Resultado Neto Woz</div>
        <div className="text-3xl font-bold tracking-tight">Gs {fmt(c.netIncome || 0)}</div>
      </div>

      {/* DELETED EXPOSURE SECTION */}

    </div>
  );
}
