import { useState, useEffect } from 'react';
import { Landmark, RefreshCw, AlertCircle, CheckCircle2, Clock, AlertTriangle, TrendingUp, Calendar, User, ArrowRight } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const API = `https://${projectId}.supabase.co/functions/v1/make-server-fe20efe1`;
const HEADERS = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` };
const fmt = (n: number) => new Intl.NumberFormat('es-PY').format(Math.round(n));
const fmtDate = (d: string) => new Date(d).toLocaleDateString('es-PY', { day: '2-digit', month: 'short', year: 'numeric' });

interface Loan {
  id: string; clientId: string; clientName: string; membership: string;
  amountGranted: number; amountToReturn: number; termMonths: number;
  startDate: string; nextPaymentDate: string; paidInstallments: number;
  daysOverdue: number; status: 'active' | 'late' | 'delinquent' | 'paid';
}

interface LoansData {
  loans: Loan[];
  stats: { total: number; active: number; late: number; delinquent: number; totalGranted: number; totalToReturn: number };
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  active: { label: 'Al día', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100', icon: CheckCircle2 },
  late: { label: 'Atrasado', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100', icon: Clock },
  delinquent: { label: 'Moroso', color: 'text-red-700', bg: 'bg-red-50 border-red-100', icon: AlertTriangle },
  paid: { label: 'Pagado', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-100', icon: CheckCircle2 },
};

const memberLabel: Record<string, string> = {
  gratuito: 'Gratuito', basico: 'Básico',
  regular: 'Regular', 'emprendedor-business': 'Business',
};

function StatCard({ label, value, sub, icon: Icon, alert }: { label: string; value: string; sub?: string; icon: any; alert?: boolean }) {
  return (
    <div className={`bg-white rounded-lg border p-4 flex items-start justify-between ${alert ? 'border-red-200 bg-red-50/10' : 'border-gray-200'}`}>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-xl font-bold tracking-tight ${alert ? 'text-red-700' : 'text-gray-900'}`}>{value}</p>
        {sub && <p className="text-[10px] text-gray-500 mt-0.5">{sub}</p>}
      </div>
      <Icon size={16} className={alert ? 'text-red-400' : 'text-gray-300'} />
    </div>
  );
}

export function AdminLoans() {
  const [data, setData] = useState<LoansData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'late' | 'delinquent'>('all');

  async function load() {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/admin/loans`, { headers: HEADERS });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setData(await res.json());
    } catch (err) { setError(`${err}`); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const filtered = data?.loans.filter(l => filter === 'all' || l.status === filter) || [];

  if (loading) return <div className="py-12 text-center text-xs text-gray-400 animate-pulse">Cargando cartera de créditos...</div>;
  if (error) return <div className="p-4 border border-red-100 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2"><AlertCircle size={14} />{error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Gestión de Préstamos</h2>
          <p className="text-xs text-gray-500">Cartera activa y estado de cobros</p>
        </div>
        <button onClick={load} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard 
          label="Capital Otorgado" 
          value={`Gs ${fmt(data.stats.totalGranted)}`} 
          sub={`${data.stats.total} préstamos activos`}
          icon={Landmark} 
        />
        <StatCard 
          label="Retorno Esperado" 
          value={`Gs ${fmt(data.stats.totalToReturn)}`} 
          sub="Capital + Intereses"
          icon={TrendingUp} 
        />
        <StatCard 
          label="Cartera al Día" 
          value={`${data.stats.active}`} 
          sub="Sin atrasos registrados"
          icon={CheckCircle2} 
        />
        <StatCard 
          label="Cartera en Riesgo" 
          value={`${data.stats.late + data.stats.delinquent}`} 
          sub={`${data.stats.late} atrasados · ${data.stats.delinquent} mora`}
          icon={AlertTriangle} 
          alert={data.stats.late + data.stats.delinquent > 0}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar border-b border-gray-100">
        {[
          { key: 'all', label: 'Todos' },
          { key: 'active', label: 'Al día', count: data.stats.active },
          { key: 'late', label: 'Atrasados', count: data.stats.late },
          { key: 'delinquent', label: 'Morosos', count: data.stats.delinquent }
        ].map((tab) => (
          <button 
            key={tab.key} 
            onClick={() => setFilter(tab.key as any)}
            className={`
              flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap
              ${filter === tab.key 
                ? 'border-gray-900 text-gray-900' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            {tab.label}
            {tab.key !== 'all' && (
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${filter === tab.key ? 'bg-gray-100' : 'bg-gray-50'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loans Grid */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
            <p className="text-xs text-gray-400">No hay préstamos en esta categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map(loan => {
              const sc = statusConfig[loan.status];
              const StatusIcon = sc.icon;
              return (
                <div key={loan.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-all flex flex-col justify-between h-full group">
                  <div>
                    {/* Header: Name & Status */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-gray-900">{loan.clientName}</h4>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <User size={10} /> {memberLabel[loan.membership] || loan.membership}
                          </span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${sc.bg} ${sc.color}`}>
                        <StatusIcon size={10} /> {sc.label}
                      </span>
                    </div>

                    {/* Financials */}
                    <div className="grid grid-cols-2 gap-4 py-3 border-t border-dashed border-gray-100 mb-3">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Otorgado</p>
                        <p className="text-xs font-semibold text-gray-900">Gs {fmt(loan.amountGranted)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Devolución</p>
                        <p className="text-xs font-bold text-gray-900">Gs {fmt(loan.amountToReturn)}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                       <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                         <span>Progreso de pago</span>
                         <span className="font-mono">{loan.paidInstallments}/{loan.termMonths} cuotas</span>
                       </div>
                       <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-gray-900 rounded-full" 
                           style={{ width: `${Math.min(100, (loan.paidInstallments / loan.termMonths) * 100)}%` }} 
                         />
                       </div>
                    </div>
                  </div>

                  {/* Footer: Dates */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={10} /> Inicio: {fmtDate(loan.startDate)}
                    </span>
                    <div className="flex items-center gap-1 text-gray-600 font-medium">
                      {loan.daysOverdue > 0 ? (
                        <span className="text-red-600 font-bold">{loan.daysOverdue} días mora</span>
                      ) : (
                        <span>Vence: {fmtDate(loan.nextPaymentDate)}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}