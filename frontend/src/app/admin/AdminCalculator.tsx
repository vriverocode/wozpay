import { useState, useEffect } from 'react';
import { Calculator, RefreshCw, CheckCircle2, AlertCircle, Settings, TrendingUp, AlertTriangle, Edit2, Save, X } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const API = `https://${projectId}.supabase.co/functions/v1/make-server-fe20efe1`;
const HEADERS = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` };
const fmt = (n: number) => new Intl.NumberFormat('es-PY').format(Math.round(n));

interface Rates { loanMonthlyRate: number; moraMonthlyRate: number; updatedAt: string; note?: string; }

// Withdrawal fees from system config (these are fixed)
const DEFAULT_WITHDRAWAL_FEES = [
  { label: 'Retiro inmediato (0 días)', rate: 15 },
  { label: 'Retiro en 7 días', rate: 10 },
  { label: 'Retiro en 14 días', rate: 8 },
  { label: 'Retiro en 30 días', rate: 3.9 },
];
// Transaction commission rates from system config (fixed)
const DEFAULT_TRANSACTION_RATES = [
  { tier: 'Gratuito', transRate: 15, wozRate: 15 },
  { tier: 'Básico', transRate: 12, wozRate: 12 },
  { tier: 'Emprendedor Regular', transRate: 6.5, wozRate: 8 },
  { tier: 'Emprendedor Business', transRate: 3.9, wozRate: 5 },
];

export function AdminCalculator() {
  const [rates, setRates] = useState<Rates | null>(null);
  const [loanRate, setLoanRate] = useState('');
  const [moraRate, setMoraRate] = useState('');
  const [saving, setSaving] = useState(false);
  const [rateSuccess, setRateSuccess] = useState('');
  const [rateError, setRateError] = useState('');

  // Loan calculator inputs
  const [calcAmount, setCalcAmount] = useState('');
  const [calcMonths, setCalcMonths] = useState('12');
  const [useCustomRate, setUseCustomRate] = useState(false);
  const [customRate, setCustomRate] = useState('');

  // Mora calculator
  const [moraCapital, setMoraCapital] = useState('');
  const [moraDays, setMoraDays] = useState('30');

  // System Rates State
  const [withdrawalFees, setWithdrawalFees] = useState(DEFAULT_WITHDRAWAL_FEES);
  const [transactionRates, setTransactionRates] = useState(DEFAULT_TRANSACTION_RATES);
  const [isEditingSystem, setIsEditingSystem] = useState(false);
  const [fixedFee, setFixedFee] = useState(6900);
  const [fixedFeeUsd, setFixedFeeUsd] = useState(1.50);

  async function loadRates() {
    try {
      const res = await fetch(`${API}/admin/rates`, { headers: HEADERS });
      const data = await res.json();
      setRates(data);
      if (data.loanMonthlyRate) setLoanRate(data.loanMonthlyRate.toString());
      if (data.moraMonthlyRate) setMoraRate(data.moraMonthlyRate.toString());
    } catch (err) { console.error(err); }
  }

  useEffect(() => { 
    loadRates(); 
    
    // Load system rates from local storage
    const savedWithdrawal = localStorage.getItem('admin_withdrawal_fees');
    if (savedWithdrawal) setWithdrawalFees(JSON.parse(savedWithdrawal));

    const savedTransaction = localStorage.getItem('admin_transaction_rates');
    if (savedTransaction) setTransactionRates(JSON.parse(savedTransaction));

    const savedFixed = localStorage.getItem('admin_fixed_fees');
    if (savedFixed) {
       const parsed = JSON.parse(savedFixed);
       setFixedFee(parsed.gs || 6900);
       setFixedFeeUsd(parsed.usd || 1.50);
    }
  }, []);

  async function saveRates() {
    setRateError(''); setRateSuccess('');
    const lr = parseFloat(loanRate);
    const mr = parseFloat(moraRate);
    if (!lr || lr <= 0) { setRateError('Tasa de préstamo inválida.'); return; }
    if (!mr || mr <= 0) { setRateError('Tasa de mora inválida.'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/rates`, {
        method: 'POST', headers: HEADERS,
        body: JSON.stringify({ loanMonthlyRate: lr, moraMonthlyRate: mr }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRateSuccess('Tasas guardadas correctamente.');
      await loadRates();
    } catch (err) { setRateError(`${err}`); }
    finally { setSaving(false); }
  }

  function handleSaveSystemRates() {
    localStorage.setItem('admin_withdrawal_fees', JSON.stringify(withdrawalFees));
    localStorage.setItem('admin_transaction_rates', JSON.stringify(transactionRates));
    localStorage.setItem('admin_fixed_fees', JSON.stringify({ gs: fixedFee, usd: fixedFeeUsd }));
    setIsEditingSystem(false);
  }

  // Helper to update withdrawal fees
  const updateWithdrawalFee = (index: number, val: string) => {
    const newFees = [...withdrawalFees];
    newFees[index].rate = parseFloat(val) || 0;
    setWithdrawalFees(newFees);
  };

  // Helper to update transaction rates
  const updateTransactionRate = (index: number, field: 'transRate' | 'wozRate', val: string) => {
    const newRates = [...transactionRates];
    newRates[index][field] = parseFloat(val) || 0;
    setTransactionRates(newRates);
  };

  // Loan calculation
  const activeRate = useCustomRate ? parseFloat(customRate) || 0 : (rates?.loanMonthlyRate || 0);
  const amount = parseFloat(calcAmount.replace(/\./g, '').replace(',', '.')) || 0;
  const months = parseInt(calcMonths) || 0;

  let monthlyPayment = 0;
  let totalToReturn = 0;
  let totalInterest = 0;

  if (amount > 0 && months > 0 && activeRate > 0) {
    const r = activeRate / 100;
    monthlyPayment = (amount * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    totalToReturn = monthlyPayment * months;
    totalInterest = totalToReturn - amount;
  }

  // Mora calculation
  const moraCapitalNum = parseFloat(moraCapital.replace(/\./g, '').replace(',', '.')) || 0;
  const moraDaysNum = parseInt(moraDays) || 0;
  const activeMoraRate = rates?.moraMonthlyRate || 0;
  const moraDailyRate = activeMoraRate / 30 / 100;
  const moraAmount = moraCapitalNum * moraDailyRate * moraDaysNum;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Calculadora de Tasas</h2>
        <p className="text-sm text-gray-500 mt-0.5">Configura tasas de interés y calcula cuotas de préstamos e intereses por mora</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rate configuration */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center"><Settings size={14} className="text-blue-600" /></div>
            <h3 className="font-bold text-gray-800">Configurar tasas</h3>
          </div>

          {rates && !rates.loanMonthlyRate && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
              <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">Las tasas no están configuradas. Define las tasas para activar el módulo de préstamos.</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Tasa de interés préstamos (% mensual) <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type="number" value={loanRate} onChange={e => setLoanRate(e.target.value)} min="0" step="0.1"
                  className="w-full pr-10 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                  placeholder="Ej: 2.5" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">%</span>
              </div>
              {loanRate && <p className="text-xs text-gray-400 mt-1">Anual equivalente: {(parseFloat(loanRate) * 12).toFixed(1)}%</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Tasa de interés por mora (% mensual) <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type="number" value={moraRate} onChange={e => setMoraRate(e.target.value)} min="0" step="0.1"
                  className="w-full pr-10 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                  placeholder="Ej: 3" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">%</span>
              </div>
              {moraRate && <p className="text-xs text-gray-400 mt-1">Diaria equivalente: {(parseFloat(moraRate) / 30).toFixed(3)}%</p>}
            </div>

            {rateError && <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl"><AlertCircle size={13} className="text-red-500 mt-0.5" /><p className="text-xs text-red-700">{rateError}</p></div>}
            {rateSuccess && <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl"><CheckCircle2 size={13} className="text-green-600 mt-0.5" /><p className="text-xs text-green-700">{rateSuccess}</p></div>}

            <button onClick={saveRates} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 disabled:opacity-50 transition-all text-sm">
              {saving ? <><RefreshCw size={14} className="animate-spin" />Guardando...</> : <><CheckCircle2 size={14} />Guardar tasas</>}
            </button>
          </div>
        </div>

        {/* Loan calculator */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-teal-100 rounded-xl flex items-center justify-center"><Calculator size={14} className="text-teal-600" /></div>
            <h3 className="font-bold text-gray-800">Calculadora de préstamo</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Capital (Gs)</label>
              <input type="text" value={calcAmount} onChange={e => setCalcAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                placeholder="Ej: 50000000" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Plazo (meses)</label>
              <div className="grid grid-cols-4 gap-2">
                {[6, 12, 18, 24, 36, 48].map(m => (
                  <button key={m} onClick={() => setCalcMonths(m.toString())}
                    className={`py-2 rounded-lg text-sm font-semibold transition-colors ${calcMonths === m.toString() ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {m}m
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1.5 cursor-pointer">
                <input type="checkbox" checked={useCustomRate} onChange={e => setUseCustomRate(e.target.checked)} className="rounded" />
                Usar tasa personalizada
              </label>
              {useCustomRate ? (
                <div className="relative">
                  <input type="number" value={customRate} onChange={e => setCustomRate(e.target.value)} step="0.1" min="0"
                    className="w-full pr-10 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                    placeholder="Tasa mensual personalizada" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">%</span>
                </div>
              ) : (
                <p className="text-xs text-gray-400 py-1">Usando tasa configurada: {rates?.loanMonthlyRate ? `${rates.loanMonthlyRate}% mensual` : 'No configurada'}</p>
              )}
            </div>

            {amount > 0 && months > 0 && activeRate > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-600">Capital</span><span className="font-bold">Gs {fmt(amount)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Tasa mensual</span><span className="font-bold">{activeRate}%</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Plazo</span><span className="font-bold">{months} meses</span></div>
                <div className="border-t border-blue-200 my-2" />
                <div className="flex justify-between text-sm"><span className="text-gray-600">Cuota mensual</span><span className="font-extrabold text-blue-900">Gs {fmt(monthlyPayment)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Total a devolver</span><span className="font-extrabold text-gray-900">Gs {fmt(totalToReturn)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Total intereses</span><span className="font-bold text-amber-700">Gs {fmt(totalInterest)}</span></div>
              </div>
            )}
            {activeRate === 0 && <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">Configura la tasa de interés para calcular.</div>}
          </div>
        </div>

        {/* Mora calculator */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center"><AlertTriangle size={14} className="text-red-600" /></div>
            <h3 className="font-bold text-gray-800">Calculadora de interés por mora</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Capital en mora (Gs)</label>
              <input type="text" value={moraCapital} onChange={e => setMoraCapital(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                placeholder="Ej: 10000000" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Días de atraso</label>
              <input type="number" value={moraDays} onChange={e => setMoraDays(e.target.value)} min="1"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                placeholder="Ej: 30" />
            </div>

            {moraCapitalNum > 0 && moraDaysNum > 0 && activeMoraRate > 0 && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-600">Capital en mora</span><span className="font-bold">Gs {fmt(moraCapitalNum)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Tasa mora mensual</span><span className="font-bold">{activeMoraRate}%</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Tasa mora diaria</span><span className="font-bold">{moraDailyRate.toFixed(4)}%</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Días de atraso</span><span className="font-bold">{moraDaysNum}</span></div>
                <div className="border-t border-red-200 my-2" />
                <div className="flex justify-between text-sm"><span className="text-gray-600 font-semibold">Interés por mora</span><span className="font-extrabold text-red-700">Gs {fmt(moraAmount)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Total a pagar</span><span className="font-extrabold text-gray-900">Gs {fmt(moraCapitalNum + moraAmount)}</span></div>
              </div>
            )}
            {activeMoraRate === 0 && <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">Configura la tasa de mora para calcular.</div>}
          </div>
        </div>

        {/* System rates reference (Editable) */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center"><TrendingUp size={14} className="text-green-600" /></div>
              <h3 className="font-bold text-gray-800">Tasas del sistema</h3>
            </div>
            <button 
              onClick={() => isEditingSystem ? handleSaveSystemRates() : setIsEditingSystem(true)}
              className={`p-2 rounded-lg transition-colors ${isEditingSystem ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              title={isEditingSystem ? "Guardar cambios" : "Editar tasas"}
            >
              {isEditingSystem ? <Save size={16} /> : <Edit2 size={16} />}
            </button>
          </div>
          
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Comisiones de retiro</p>
            <div className="space-y-2">
              {withdrawalFees.map((f, i) => (
                <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-sm text-gray-600">{f.label}</span>
                  {isEditingSystem ? (
                    <div className="flex items-center gap-1 w-20">
                      <input 
                        type="number" 
                        value={f.rate} 
                        onChange={(e) => updateWithdrawalFee(i, e.target.value)}
                        className="w-full text-right bg-gray-50 border border-gray-200 rounded px-1 py-0.5 text-sm font-bold focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-xs text-gray-400">%</span>
                    </div>
                  ) : (
                    <span className="font-bold text-gray-900">{f.rate}%</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Comisiones por membresía</p>
            <div className="space-y-2">
              {transactionRates.map((r, i) => (
                <div key={i} className="flex flex-col py-2 border-b border-gray-50">
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600 font-medium">{r.tier}</span>
                   </div>
                   <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Transacción:</span>
                        {isEditingSystem ? (
                          <div className="flex items-center gap-0.5 w-16">
                            <input 
                              type="number" 
                              value={r.transRate} 
                              onChange={(e) => updateTransactionRate(i, 'transRate', e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded px-1 py-0.5 text-xs font-bold focus:outline-none focus:border-blue-500"
                            />
                            <span className="text-[10px] text-gray-400">%</span>
                          </div>
                        ) : (
                          <span className="font-bold text-gray-900">{r.transRate}%</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">WozPay:</span>
                        {isEditingSystem ? (
                          <div className="flex items-center gap-0.5 w-16">
                            <input 
                              type="number" 
                              value={r.wozRate} 
                              onChange={(e) => updateTransactionRate(i, 'wozRate', e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded px-1 py-0.5 text-xs font-bold focus:outline-none focus:border-blue-500"
                            />
                            <span className="text-[10px] text-gray-400">%</span>
                          </div>
                        ) : (
                          <span className="font-bold text-gray-900">{r.wozRate}%</span>
                        )}
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-2">
             <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Fees fijos</p>
             <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                   <span className="text-xs text-gray-400">Gs:</span>
                   {isEditingSystem ? (
                      <input 
                        type="number" 
                        value={fixedFee} 
                        onChange={(e) => setFixedFee(parseFloat(e.target.value) || 0)}
                        className="w-20 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs font-bold focus:outline-none focus:border-blue-500"
                      />
                   ) : (
                      <span className="text-sm font-bold text-gray-900">{fmt(fixedFee)}</span>
                   )}
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-xs text-gray-400">USD:</span>
                   {isEditingSystem ? (
                      <input 
                        type="number" 
                        value={fixedFeeUsd} 
                        onChange={(e) => setFixedFeeUsd(parseFloat(e.target.value) || 0)}
                        step="0.01"
                        className="w-16 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs font-bold focus:outline-none focus:border-blue-500"
                      />
                   ) : (
                      <span className="text-sm font-bold text-gray-900">{fixedFeeUsd.toFixed(2).replace('.', ',')}</span>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}