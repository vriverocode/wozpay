import { useState, useEffect } from 'react';
import { RefreshCw, ArrowRightLeft, CheckCircle2, AlertCircle, Clock, Plus, X, Trash2 } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const API = `https://${projectId}.supabase.co/functions/v1/make-server-fe20efe1`;
const HEADERS = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` };
const fmt = (n: number) => new Intl.NumberFormat('es-PY').format(n);

interface CurrencyData { usdToGs: number; updatedAt: string; updatedBy: string; }

export function AdminCurrency() {
  const [current, setCurrent] = useState<CurrencyData | null>(null);
  const [inputRate, setInputRate] = useState('');
  const [updatedBy, setUpdatedBy] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Custom examples state
  const [examples, setExamples] = useState<number[]>([]);
  const [isEditingExamples, setIsEditingExamples] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/currency`, { headers: HEADERS });
      const data = await res.json();
      setCurrent(data);
      setInputRate(data.usdToGs?.toString() || '');
    } catch (err) { setError(`${err}`); }
    finally { setLoading(false); }
  }

  useEffect(() => { 
    load(); 
    // Load saved examples or default
    const saved = localStorage.getItem('currency_examples');
    if (saved) {
      try {
        setExamples(JSON.parse(saved));
      } catch (e) {
        setExamples([1, 10, 50, 100, 500, 1000]);
      }
    } else {
      setExamples([1, 10, 50, 100, 500, 1000]);
    }
  }, []);

  async function handleSave() {
    setError(''); setSuccess('');
    const rate = parseFloat(inputRate);
    if (!rate || rate <= 0) { setError('Ingresa una cotización válida mayor a 0.'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/currency`, {
        method: 'POST', headers: HEADERS,
        body: JSON.stringify({ usdToGs: rate, updatedBy: updatedBy || 'admin' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(`Cotización actualizada: 1 USD = Gs ${fmt(rate)}`);
      await load();
    } catch (err) { setError(`Error al guardar: ${err}`); }
    finally { setSaving(false); }
  }

  const handleUpdateExample = (index: number, value: string) => {
    const val = parseFloat(value);
    const newExamples = [...examples];
    if (isNaN(val)) {
      // Allow empty/invalid temporarily while typing, but maybe just don't update if invalid?
      // Better to store as is? No, state is number[].
      // Let's just update if valid number, or 0.
      newExamples[index] = 0;
    } else {
      newExamples[index] = val;
    }
    setExamples(newExamples);
    localStorage.setItem('currency_examples', JSON.stringify(newExamples));
  };

  const handleAddExample = () => {
    const newExamples = [...examples, 100];
    setExamples(newExamples);
    localStorage.setItem('currency_examples', JSON.stringify(newExamples));
  };

  const handleRemoveExample = (index: number) => {
    const newExamples = examples.filter((_, i) => i !== index);
    setExamples(newExamples);
    localStorage.setItem('currency_examples', JSON.stringify(newExamples));
  };

  const rate = parseFloat(inputRate) || 0;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Cotización de Moneda</h2>
        <p className="text-sm text-gray-500 mt-0.5">Establece la cotización del Dólar Estadounidense en Guaraníes</p>
      </div>

      {/* Current rate card */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-6 mb-6 text-white shadow-xl shadow-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><ArrowRightLeft size={18} /></div>
          <div>
            <p className="text-blue-200 text-xs uppercase tracking-widest">Cotización vigente</p>
            <p className="text-sm font-semibold">USD → GS (Guaraníes)</p>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-blue-200"><RefreshCw size={16} className="animate-spin" />Cargando...</div>
        ) : current ? (
          <>
            <p className="text-4xl font-black">1 USD = Gs {fmt(current.usdToGs)}</p>
            <div className="flex items-center gap-2 mt-2 text-blue-300 text-xs">
              <Clock size={12} />
              <span>Actualizado: {new Date(current.updatedAt).toLocaleString('es-PY')} por {current.updatedBy}</span>
            </div>
          </>
        ) : <p className="text-blue-200">Sin cotización cargada</p>}
      </div>

      {/* Update form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">Actualizar cotización</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Nueva cotización (Gs por 1 USD) <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">1 USD =</span>
              <input type="number" value={inputRate} onChange={e => setInputRate(e.target.value)} min="0" step="1"
                className="w-full pl-20 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                placeholder="7400" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">Gs</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Actualizado por</label>
            <input type="text" value={updatedBy} onChange={e => setUpdatedBy(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
              placeholder="Tu nombre o fuente (Ej: BCP, admin)" />
          </div>

          {error && <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl"><AlertCircle size={14} className="text-red-500 mt-0.5" /><p className="text-sm text-red-700">{error}</p></div>}
          {success && <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl"><CheckCircle2 size={14} className="text-green-600 mt-0.5" /><p className="text-sm text-green-700">{success}</p></div>}

          <button onClick={handleSave} disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 disabled:opacity-50 transition-all text-sm">
            {saving ? <><RefreshCw size={14} className="animate-spin" />Guardando...</> : <><CheckCircle2 size={14} />Guardar cotización</>}
          </button>
        </div>
      </div>

      {/* Editable Conversion preview */}
      {rate > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
             <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tabla de Conversión (1 USD = {fmt(rate)} Gs)</h3>
             <button 
               onClick={() => setIsEditingExamples(!isEditingExamples)}
               className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase"
             >
               {isEditingExamples ? 'Terminar edición' : 'Editar tabla'}
             </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {examples.map((usd, idx) => (
              <div key={idx} className="relative group flex flex-col p-2 rounded border border-gray-100 bg-gray-50 hover:border-gray-300 transition-all">
                {isEditingExamples ? (
                  <>
                     <div className="flex items-center gap-1 mb-1">
                        <span className="text-[10px] text-gray-500 font-medium">USD</span>
                        <input 
                          type="number" 
                          value={usd || ''} 
                          onChange={(e) => handleUpdateExample(idx, e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded px-1 py-0.5 text-[10px] focus:outline-none focus:border-blue-500"
                        />
                     </div>
                     <button 
                       onClick={() => handleRemoveExample(idx)}
                       className="absolute -top-1.5 -right-1.5 bg-red-100 text-red-600 rounded-full p-0.5 opacity-100 shadow-sm hover:bg-red-200 transition-colors"
                     >
                       <X size={10} />
                     </button>
                  </>
                ) : (
                  <span className="text-[10px] text-gray-500 font-medium mb-1">USD {fmt(usd)}</span>
                )}
                
                <span className="text-sm font-bold text-gray-900 font-mono tracking-tight">Gs {fmt(Math.round(usd * rate))}</span>
              </div>
            ))}
            
            {isEditingExamples && (
              <button 
                onClick={handleAddExample}
                className="flex flex-col items-center justify-center p-2 rounded border border-dashed border-gray-300 bg-white hover:bg-gray-50 hover:border-blue-300 text-gray-400 hover:text-blue-500 transition-all h-full min-h-[58px]"
              >
                <Plus size={16} />
                <span className="text-[10px] font-medium mt-1">Agregar</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}