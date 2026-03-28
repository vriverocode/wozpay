import { useState, useEffect } from 'react';
import { 
  RefreshCw, AlertCircle, ArrowRight, User, 
  TrendingUp, Calendar, Clock, Percent, Wallet, 
  MoreHorizontal, ChevronRight 
} from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const API = `https://${projectId}.supabase.co/functions/v1/make-server-fe20efe1`;
const HEADERS = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` };

const fmt = (n: number) => new Intl.NumberFormat('es-PY').format(Math.round(n));
const fmtDate = (d: string) => new Date(d).toLocaleDateString('es-PY', { day: '2-digit', month: 'short', year: 'numeric' });

interface SavingCDA {
  id: string;
  clientId: string;
  clientName: string;
  amountInvested: number;
  termMonths: number;
  rate: number;
  startDate: string;
  endDate: string;
  totalToReceive: number;
  status: 'active' | 'completed';
}

interface SavingsData {
  savings: SavingCDA[];
  stats: { 
    total: number; 
    totalCapital: number; 
    avgRate: number; 
    totalYield: number; 
  };
}

function MetricCard({ label, value, sub, icon: Icon, trend }: { label: string, value: string, sub?: string, icon: any, trend?: 'up' | 'down' | 'neutral' }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-start justify-between mb-2">
        <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
          <Icon size={18} strokeWidth={2} />
        </div>
        {trend && (
          <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md flex items-center gap-1">
            <TrendingUp size={10} /> +12%
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-xl font-bold text-gray-900 tracking-tight">{value}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export function AdminSavings() {
  const [data, setData] = useState<SavingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/admin/savings`, { headers: HEADERS });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) { setError(`${err}`); }
    finally { setLoading(false); }
  }
  
  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="flex justify-center items-center py-24">
      <div className="flex flex-col items-center gap-3">
        <RefreshCw size={24} className="animate-spin text-indigo-600" />
        <span className="text-xs font-medium text-gray-400">Sincronizando cartera...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="mx-auto max-w-lg mt-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
      <AlertCircle size={20} />
      <span className="text-sm font-medium">{error}</span>
    </div>
  );

  if (!data) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Cartera de Inversiones</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de Certificados de Depósito de Ahorro (CDA)</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
            <RefreshCw size={18} />
          </button>
          <button className="bg-gray-900 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-black transition-colors shadow-sm">
            Exportar Reporte
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Capital Card */}
        <div className="bg-white aspect-square rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all relative group flex flex-col justify-between">
          <div className="flex items-start justify-between">
             <div className="p-2 bg-gray-100 rounded-lg text-gray-600 group-hover:bg-gray-900 group-hover:text-white transition-colors">
               <Wallet size={18} strokeWidth={2} />
             </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Capital</span>
            <p className="text-lg font-bold text-gray-900 tracking-tight">Gs {fmt(data.stats.totalCapital)}</p>
            <p className="text-[10px] text-gray-400 mt-1 font-medium">Total gestionado</p>
          </div>
        </div>

        {/* Yield Card */}
        <div className="bg-white aspect-square rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all relative group flex flex-col justify-between">
          <div className="flex items-start justify-between">
             <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
               <TrendingUp size={18} strokeWidth={2} />
             </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-1">Rendimiento</span>
            <p className="text-lg font-bold text-emerald-700 tracking-tight">Gs {fmt(data.stats.totalYield)}</p>
            <p className="text-[10px] text-emerald-600/70 mt-1 font-medium">Intereses generados</p>
          </div>
        </div>

        {/* Rate Card */}
        <div className="bg-white aspect-square rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all relative group flex flex-col justify-between">
          <div className="flex items-start justify-between">
             <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
               <TrendingUp size={18} strokeWidth={2} />
             </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-1">Total</span>
            <div className="flex items-baseline gap-1">
              <p className="text-lg font-bold text-indigo-700 tracking-tight">Gs {fmt(data.stats.totalCapital + data.stats.totalYield)}</p>
            </div>
            <p className="text-[10px] text-indigo-600/70 mt-1 font-medium">Total para distribuir</p>
          </div>
        </div>

        {/* Count Card */}
        <div className="bg-white aspect-square rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all relative group flex flex-col justify-between">
          <div className="flex items-start justify-between">
             <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
               <User size={18} strokeWidth={2} />
             </div>
          </div>
          <div>
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Cartera</span>
            <div className="flex items-baseline gap-1">
              <p className="text-lg font-bold text-gray-900 tracking-tight">{data.stats.total}</p>
              <span className="text-[10px] text-gray-400 font-medium">Inversores</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1 font-medium">Contratos activos</p>
          </div>
        </div>
      </div>

      {/* List Header */}
      <div className="flex items-center justify-between pt-4 pb-2">
        <h3 className="text-sm font-bold text-gray-900">Listado de Inversores</h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Ordenar por:</span>
          <select className="bg-transparent font-medium text-gray-900 focus:outline-none cursor-pointer">
            <option>Vencimiento (Prox)</option>
            <option>Monto (Mayor)</option>
            <option>Nombre (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Fintech Cards List */}
      <div className="space-y-3">
        {data.savings.map((s) => {
          // Calculate progress based on dates
          const start = new Date(s.startDate).getTime();
          const end = new Date(s.endDate).getTime();
          const now = new Date().getTime();
          const totalDuration = end - start;
          const elapsed = now - start;
          const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
          const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

          return (
            <div key={s.id} className="bg-white rounded border border-gray-200 shadow-sm hover:border-gray-300 transition-all group overflow-hidden">
              
              {/* Compact Header - Rectangular & Small */}
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-white border border-gray-200 rounded-sm flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm">
                    {s.clientName.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{s.clientName}</span>
                  <span className="hidden sm:inline-block text-[9px] text-gray-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    ID: {s.id.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-[9px] font-medium text-gray-500 uppercase tracking-wide">Activo</span>
                </div>
              </div>

              {/* Card Body: Financial Grid */}
              <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8">
                
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Capital</span>
                  <p className="text-sm font-bold text-gray-900">Gs {fmt(s.amountInvested)}</p>
                </div>

                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Retorno</span>
                  <p className="text-sm font-bold text-emerald-700">Gs {fmt(s.totalToReceive)}</p>
                </div>

                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Tasa / Plazo</span>
                  <div className="flex items-baseline gap-1">
                    <p className="text-sm font-medium text-gray-900">{s.rate}%</p>
                    <span className="text-[10px] text-gray-500">x {s.termMonths}m</span>
                  </div>
                </div>

                 <div className="flex flex-col">
                  <span className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Vencimiento</span>
                  <p className="text-sm font-medium text-gray-900">{fmtDate(s.endDate)}</p>
                </div>
              </div>

              {/* Slim Progress Footer */}
              <div className="px-4 pb-3">
                <div className="flex items-center justify-between text-[9px] text-gray-400 mb-1 font-mono">
                  <span>{fmtDate(s.startDate)}</span>
                  <span className="text-indigo-600 font-medium">{daysLeft > 0 ? `${daysLeft} días restantes` : 'Finalizado'}</span>
                </div>
                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

            </div>
          );
        })}

        {data.savings.length === 0 && (
          <div className="py-16 text-center bg-white rounded border border-dashed border-gray-200">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <User size={20} className="text-gray-300" />
            </div>
            <h3 className="text-xs font-semibold text-gray-900">Sin inversiones activas</h3>
            <p className="text-[10px] text-gray-400 mt-1">
              Registre un nuevo certificado para comenzar.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
