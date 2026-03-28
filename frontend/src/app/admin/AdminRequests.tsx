import { useState, useEffect } from 'react';
import { FileText, RefreshCw, AlertCircle, Clock, CheckCircle2, XCircle, Calendar, ArrowRight, User, TrendingUp, AlertTriangle, DollarSign, CreditCard, Layers, BarChart2 } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const API = `https://${projectId}.supabase.co/functions/v1/make-server-fe20efe1`;
const HEADERS = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` };
const fmt = (n: number) => new Intl.NumberFormat('es-PY').format(n);
const fmtDate = (d: string) => new Date(d).toLocaleDateString('es-PY', { day: '2-digit', month: 'short', year: 'numeric' });

interface LoanRequest {
  id: string; clientId: string; clientName: string; membership: string; email: string;
  requestedAmount: number; approvedAmount?: number; termMonths: number; requestDate: string;
  status: 'pending' | 'approved' | 'rejected'; notes: string;
  paidInstallments?: number; overdueInstallments?: number; interestRate?: number;
}

interface RequestsData {
  requests: LoanRequest[];
  stats: { total: number; pending: number; approved: number; rejected: number };
}

const memberLabel: Record<string, string> = {
  gratuito: 'Gratuito', basico: 'Básico',
  regular: 'Regular', 'emprendedor-business': 'Business',
};

function StatCard({ label, value, icon: Icon, alert }: { label: string; value: number; icon: any; alert?: boolean }) {
  return (
    <div className={`bg-white rounded-lg border p-4 flex items-center justify-between ${alert ? 'border-amber-200 bg-amber-50/10' : 'border-gray-200'}`}>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-xl font-bold tracking-tight ${alert ? 'text-amber-700' : 'text-gray-900'}`}>{value}</p>
      </div>
      <Icon size={18} className={alert ? 'text-amber-400' : 'text-gray-300'} />
    </div>
  );
}

export function AdminRequests() {
  const [data, setData] = useState<RequestsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  async function load() {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/admin/requests`, { headers: HEADERS });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setData(await res.json());
    } catch (err) { setError(`${err}`); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: 'approved' | 'rejected', notes?: string) {
    setUpdating(id);
    try {
      const res = await fetch(`${API}/admin/requests/${id}`, {
        method: 'PUT', headers: HEADERS,
        body: JSON.stringify({ status, notes }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      await load();
    } catch (err) { setError(`Error al actualizar: ${err}`); }
    finally { setUpdating(null); }
  }

  const filtered = data?.requests.filter(r => filter === 'all' || r.status === filter) || [];

  if (loading) return <div className="py-12 text-center text-xs text-gray-400 animate-pulse">Cargando solicitudes...</div>;
  if (error) return <div className="p-4 border border-red-100 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2"><AlertCircle size={14} />{error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Solicitudes de Préstamo</h2>
          <p className="text-xs text-gray-500">Aprobación y gestión de créditos</p>
        </div>
        <button onClick={load} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Pendientes" value={data.stats.pending} icon={Clock} alert={data.stats.pending > 0} />
        <StatCard label="Aprobadas" value={data.stats.approved} icon={CheckCircle2} />
        <StatCard label="Rechazadas" value={data.stats.rejected} icon={XCircle} />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar border-b border-gray-100">
        {[
          { key: 'all', label: 'Todas' },
          { key: 'pending', label: 'Pendientes', count: data.stats.pending },
          { key: 'approved', label: 'Aprobadas', count: data.stats.approved },
          { key: 'rejected', label: 'Rechazadas', count: data.stats.rejected }
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

      {/* Requests Grid */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
            <p className="text-xs text-gray-400">No hay solicitudes en esta categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map(req => {
              const isPending = req.status === 'pending';
              const isUpdating = updating === req.id;
              
              return (
                <div key={req.id} className={`bg-white rounded-xl border transition-all flex flex-col gap-0 overflow-hidden ${isPending ? 'border-amber-200 shadow-md shadow-amber-50' : 'border-gray-200 shadow-sm'}`}>
                  
                  {/* Color accent top bar */}
                  <div className={`h-1 w-full ${isPending ? 'bg-amber-400' : req.status === 'approved' ? 'bg-emerald-400' : 'bg-red-400'}`} />

                  <div className="p-4 flex flex-col gap-3">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 leading-tight">{req.clientName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <User size={9} /> {memberLabel[req.membership] || req.membership}
                          </span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Calendar size={9} /> {fmtDate(req.requestDate)}
                          </span>
                        </div>
                      </div>
                      {isPending ? (
                        <span className="text-[9px] font-bold bg-amber-50 text-amber-700 px-2 py-1 rounded-full border border-amber-200 uppercase tracking-wide flex items-center gap-1">
                          <Clock size={9} /> Pendiente
                        </span>
                      ) : (
                        <span className={`text-[9px] font-bold px-2 py-1 rounded-full border uppercase tracking-wide flex items-center gap-1 ${
                          req.status === 'approved' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {req.status === 'approved' ? <><CheckCircle2 size={9} /> Aprobada</> : <><XCircle size={9} /> Rechazada</>}
                        </span>
                      )}
                    </div>

                    {/* Main Amounts */}
                    {(() => {
                      const RATE = req.interestRate ?? 0.03;
                      const P = req.approvedAmount ?? req.requestedAmount;
                      const n = req.termMonths;
                      const monthlyPayment = P * RATE / (1 - Math.pow(1 + RATE, -n));
                      const totalReturn = monthlyPayment * n;
                      const totalInterest = totalReturn - P;
                      const paid = req.paidInstallments ?? 0;
                      const overdue = req.overdueInstallments ?? 0;
                      const paidAmount = monthlyPayment * paid;
                      const progressPct = n > 0 ? Math.round((paid / n) * 100) : 0;

                      return (
                        <>
                          {/* Amount Comparison */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
                              <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                                <FileText size={8} /> Solicitado
                              </p>
                              <p className="text-sm font-bold text-gray-700">Gs {fmt(req.requestedAmount)}</p>
                            </div>
                            <div className={`rounded-lg p-2.5 border ${req.status === 'approved' ? 'bg-emerald-50 border-emerald-100' : isPending ? 'bg-amber-50 border-amber-100' : 'bg-gray-50 border-gray-100'}`}>
                              <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                                <CheckCircle2 size={8} /> Aprobado
                              </p>
                              <p className={`text-sm font-bold ${req.status === 'approved' ? 'text-emerald-700' : 'text-gray-500'}`}>
                                {req.status === 'approved' ? `Gs ${fmt(P)}` : '—'}
                              </p>
                            </div>
                          </div>

                          {/* Payment Details Grid */}
                          <div className="grid grid-cols-3 gap-1.5 bg-gray-50 border border-gray-100 rounded-lg p-2.5">
                            <div className="text-center">
                              <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-0.5">Cuota</p>
                              <p className="text-xs font-bold text-gray-900">Gs {fmt(Math.round(monthlyPayment))}</p>
                            </div>
                            <div className="text-center border-x border-gray-200">
                              <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-0.5">Plazo</p>
                              <p className="text-xs font-bold text-gray-900">{n} meses</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-0.5">A devolver</p>
                              <p className="text-xs font-bold text-gray-900">Gs {fmt(Math.round(totalReturn))}</p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[9px] text-gray-400 uppercase tracking-wider">Progreso de pago</span>
                              <span className="text-[9px] font-bold text-gray-600">{paid}/{n} cuotas ({progressPct}%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${overdue > 0 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>

                          {/* Installment Stats */}
                          <div className="grid grid-cols-3 gap-1.5">
                            <div className="flex flex-col items-center bg-emerald-50 border border-emerald-100 rounded-lg p-2">
                              <p className="text-[9px] text-emerald-500 uppercase tracking-wide mb-0.5">Pagadas</p>
                              <p className="text-sm font-bold text-emerald-700">{paid}</p>
                              <p className="text-[9px] text-emerald-500">cuotas</p>
                            </div>
                            <div className={`flex flex-col items-center rounded-lg border p-2 ${overdue > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                              <p className={`text-[9px] uppercase tracking-wide mb-0.5 flex items-center gap-0.5 ${overdue > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                {overdue > 0 && <AlertTriangle size={8} />} En mora
                              </p>
                              <p className={`text-sm font-bold ${overdue > 0 ? 'text-red-700' : 'text-gray-400'}`}>{overdue}</p>
                              <p className={`text-[9px] ${overdue > 0 ? 'text-red-500' : 'text-gray-400'}`}>cuotas</p>
                            </div>
                            <div className="flex flex-col items-center bg-blue-50 border border-blue-100 rounded-lg p-2">
                              <p className="text-[9px] text-blue-500 uppercase tracking-wide mb-0.5 flex items-center gap-0.5">
                                <TrendingUp size={8} /> Interés
                              </p>
                              <p className="text-xs font-bold text-blue-700">Gs {fmt(Math.round(totalInterest))}</p>
                              <p className="text-[9px] text-blue-400">{Math.round(RATE * 100)}%/mes</p>
                            </div>
                          </div>

                          {/* Paid amount summary */}
                          {paid > 0 && (
                            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                              <span className="text-[10px] text-emerald-600 font-medium">Ya pagó</span>
                              <span className="text-xs font-bold text-emerald-700">Gs {fmt(Math.round(paidAmount))}</span>
                              <span className="text-[10px] text-emerald-500">de Gs {fmt(Math.round(totalReturn))}</span>
                            </div>
                          )}
                        </>
                      );
                    })()}

                    {/* Notes */}
                    {req.notes && (
                      <div className="text-[10px] text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100 italic leading-relaxed">
                        "{req.notes}"
                      </div>
                    )}

                    {/* Actions (Only for Pending) */}
                    {isPending && (
                      <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                        <button
                          className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors w-full"
                        >
                          <FileText size={12} /> Ver solicitud
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => updateStatus(req.id, 'rejected', 'Rechazada por administración.')}
                            disabled={isUpdating}
                            className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-red-600 bg-white border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            <XCircle size={12} /> Rechazar
                          </button>
                          <button 
                            onClick={() => updateStatus(req.id, 'approved')}
                            disabled={isUpdating}
                            className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-white bg-gray-900 hover:bg-black transition-colors disabled:opacity-50"
                          >
                            <CheckCircle2 size={12} /> Aprobar
                          </button>
                        </div>
                      </div>
                    )}
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