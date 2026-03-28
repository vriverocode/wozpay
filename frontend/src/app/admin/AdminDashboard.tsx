import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, DollarSign, PiggyBank, Landmark, Users,
  FileText, Bell, ArrowRightLeft, Calculator, Menu, X,
  ChevronRight, ShieldCheck, LogOut, Search,
  CheckCircle2, AlertCircle, Clock
} from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { AdminRevenue } from './AdminRevenue';
import { AdminSavings } from './AdminSavings';
import { AdminLoans } from './AdminLoans';
import { AdminClients } from './AdminClients';
import { AdminRequests } from './AdminRequests';
import { AdminNotifications } from './AdminNotifications';
import { AdminCurrency } from './AdminCurrency';
import { AdminCalculator } from './AdminCalculator';

type Section =
  | 'overview' | 'revenue' | 'savings' | 'loans'
  | 'clients' | 'requests' | 'notifications' | 'currency' | 'calculator';

interface NavItem {
  key: Section;
  label: string;
  icon: any;
  group: string;
  badge?: string;
}

const NAV: NavItem[] = [
  { key: 'overview',      label: 'Resumen',              icon: LayoutDashboard, group: 'General' },
  { key: 'revenue',       label: 'Ingresos',             icon: DollarSign,      group: 'Finanzas' },
  { key: 'savings',       label: 'Ahorros',              icon: PiggyBank,       group: 'Finanzas' },
  { key: 'loans',         label: 'Préstamos',            icon: Landmark,        group: 'Finanzas' },
  { key: 'clients',       label: 'Clientes',             icon: Users,           group: 'Gestión' },
  { key: 'requests',      label: 'Solicitudes',          icon: FileText,        group: 'Gestión', badge: 'Pendientes' },
  { key: 'notifications', label: 'Notificaciones',       icon: Bell,            group: 'Herramientas' },
  { key: 'currency',      label: 'Cotización',           icon: ArrowRightLeft,  group: 'Configuración' },
  { key: 'calculator',    label: 'Calculadora',          icon: Calculator,      group: 'Configuración' },
];

const GROUPS = ['General', 'Finanzas', 'Gestión', 'Herramientas', 'Configuración'];

const API = `https://${projectId}.supabase.co/functions/v1/make-server-fe20efe1`;
const HEADERS = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` };
const fmt = (n: number) => new Intl.NumberFormat('es-PY').format(Math.round(n));

interface OverviewData {
  grandTotal: number;
  totalClients: number;
  activeClients: number;
  pendingClients: number;
  totalSavings: number;
  activeLoans: number;
  lateLoans: number;
  delinquentLoans: number;
  pendingRequests: number;
  usdToGs: number;
}

// ── Overview Section (Redesigned) ──────────────────────────────────���───────
function OverviewSection({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [rev, clients, loans, savings, requests, currency] = await Promise.all([
          fetch(`${API}/admin/revenue`, { headers: HEADERS }).then(r => r.json()),
          fetch(`${API}/admin/clients`, { headers: HEADERS }).then(r => r.json()),
          fetch(`${API}/admin/loans`, { headers: HEADERS }).then(r => r.json()),
          fetch(`${API}/admin/savings`, { headers: HEADERS }).then(r => r.json()),
          fetch(`${API}/admin/requests`, { headers: HEADERS }).then(r => r.json()),
          fetch(`${API}/admin/currency`, { headers: HEADERS }).then(r => r.json()),
        ]);
        setData({
          grandTotal: rev.grandTotal || 0,
          totalClients: clients.clients?.length || 0,
          activeClients: clients.clients?.filter((c: any) => c.status === 'approved').length || 0,
          pendingClients: clients.clients?.filter((c: any) => c.status === 'pending').length || 0,
          totalSavings: savings.stats?.totalAccumulated || 0,
          activeLoans: loans.stats?.active || 0,
          lateLoans: loans.stats?.late || 0,
          delinquentLoans: loans.stats?.delinquent || 0,
          pendingRequests: requests.stats?.pending || 0,
          usdToGs: currency.usdToGs || 7400,
        });
      } catch (err) {
        console.error('Overview load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const KPI = ({ label, value, sub, icon: Icon, onClick, alert }: {
    label: string; value: string; sub?: string; icon: any;
    onClick?: () => void; alert?: boolean;
  }) => (
    <button onClick={onClick}
      className={`bg-white rounded-lg border p-4 text-left transition-all hover:border-gray-400 w-full group ${
        alert ? 'border-red-200 bg-red-50/10' : 'border-gray-200'
      }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        <Icon size={14} className={alert ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-600'} />
      </div>
      {loading ? (
        <div className="h-6 w-20 bg-gray-100 rounded animate-pulse" />
      ) : (
        <p className={`text-lg font-semibold tracking-tight ${alert ? 'text-red-700' : 'text-gray-900'}`}>{value}</p>
      )}
      {sub && <p className="text-[10px] text-gray-400 mt-1 truncate">{sub}</p>}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header simple */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Visión General</h2>
          <p className="text-xs text-gray-500">Métricas clave del sistema</p>
        </div>
        {data && <div className="text-xs font-mono text-gray-400">1 USD = {fmt(data.usdToGs)} PYG</div>}
      </div>

      {/* KPI Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI 
          label="Ingresos Totales" 
          value={data ? `Gs ${fmt(data.grandTotal)}` : '—'} 
          sub="Acumulado histórico" 
          icon={DollarSign} 
          onClick={() => onNavigate('revenue')} 
        />
        <KPI 
          label="Clientes Activos" 
          value={data ? `${data.activeClients}` : '—'} 
          sub={`+${data?.pendingClients || 0} pendientes`} 
          icon={Users} 
          onClick={() => onNavigate('clients')} 
        />
        <KPI 
          label="Capital en Ahorro" 
          value={data ? `Gs ${fmt(data.totalSavings)}` : '—'} 
          sub="Captación total" 
          icon={PiggyBank} 
          onClick={() => onNavigate('savings')} 
        />
        <KPI 
          label="Solicitudes" 
          value={data ? `${data.pendingRequests}` : '—'} 
          sub="Requieren atención" 
          icon={FileText} 
          onClick={() => onNavigate('requests')} 
          alert={!!(data && data.pendingRequests > 0)} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Préstamos - Minimalist List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-800">Cartera de Préstamos</h3>
            <button onClick={() => onNavigate('loans')} className="text-xs text-gray-500 hover:text-gray-900">Ver todo</button>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-gray-600">Al día</span>
              </div>
              <span className="text-sm font-mono font-medium text-gray-900">{data?.activeLoans ?? '-'}</span>
            </div>
            <div className="px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-xs text-gray-600">Atrasados</span>
              </div>
              <span className="text-sm font-mono font-medium text-gray-900">{data?.lateLoans ?? '-'}</span>
            </div>
            <div className="px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="text-xs text-gray-600">En mora</span>
              </div>
              <span className="text-sm font-mono font-medium text-gray-900">{data?.delinquentLoans ?? '-'}</span>
            </div>
          </div>
        </div>

        {/* Clientes - Minimalist List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-800">Base de Usuarios</h3>
            <button onClick={() => onNavigate('clients')} className="text-xs text-gray-500 hover:text-gray-900">Gestionar</button>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-gray-400" />
                <span className="text-xs text-gray-600">Verificados</span>
              </div>
              <span className="text-sm font-mono font-medium text-gray-900">{data?.activeClients ?? '-'}</span>
            </div>
            <div className="px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <AlertCircle size={12} className="text-gray-400" />
                <span className="text-xs text-gray-600">Pendientes</span>
              </div>
              <span className="text-sm font-mono font-medium text-gray-900">{data?.pendingClients ?? '-'}</span>
            </div>
            <div className="px-4 py-3 flex justify-between items-center bg-gray-50/30">
              <span className="text-xs font-semibold text-gray-500">Total Registros</span>
              <span className="text-sm font-mono font-bold text-gray-900">{data?.totalClients ?? '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Admin Gate ─────────────────────────────────────────────────────────────
function AdminGate({ children }: { children: React.ReactNode }) {
  const isAuth = sessionStorage.getItem('woz_admin_auth') === '1';
  if (!isAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm max-w-sm w-full text-center">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={18} className="text-gray-900" />
          </div>
          <h2 className="text-sm font-bold text-gray-900 mb-1">Acceso Restringido</h2>
          <p className="text-xs text-gray-500 mb-6">Sesión no válida.</p>
          <button onClick={() => { window.location.href = '/'; }}
            className="w-full py-2.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-black transition-colors">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

// ── Shell Layout ───────────────────────────────────────────────────────────
export function AdminDashboard() {
  const [section, setSection] = useState<Section>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const currentItem = NAV.find(n => n.key === section)!;

  function handleLogout() {
    sessionStorage.removeItem('woz_admin_auth');
    window.location.href = '/';
  }

  function navSection(s: Section) {
    setSection(s);
    setSidebarOpen(false);
    setGlobalSearch(''); // Clear search when navigating manually
  }

  function handleGlobalSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setGlobalSearch(val);
    if (val && section !== 'clients') {
      setSection('clients');
    }
  }

  return (
    <AdminGate>
      <div className="min-h-screen bg-white text-gray-900 font-sans flex overflow-hidden">
        
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed top-0 left-0 bottom-0 w-64 bg-gray-50 border-r border-gray-200 z-50 flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}>
          {/* Header Sidebar */}
          <div className="h-14 flex items-center px-4 border-b border-gray-200 bg-white">
            <div className="w-3 h-3 bg-gray-900 rounded-sm mr-2" />
            <span className="font-bold text-sm tracking-tight text-gray-900">WOZ ADMIN</span>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-gray-400">
              <X size={16} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
            {GROUPS.map(group => {
              const items = NAV.filter(n => n.group === group);
              if (items.length === 0) return null;
              return (
                <div key={group}>
                  <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{group}</p>
                  <div className="space-y-0.5">
                    {items.map(item => {
                      const Icon = item.icon;
                      const isActive = section === item.key;
                      return (
                        <button key={item.key} onClick={() => navSection(item.key)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                            isActive
                              ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                          }`}>
                          <div className="flex items-center gap-3">
                            <Icon size={14} className={isActive ? 'text-gray-900' : 'text-gray-400'} />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="bg-gray-200 text-gray-600 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Footer Sidebar */}
          <div className="p-3 border-t border-gray-200">
            <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-red-600 w-full px-2 py-2 rounded-md hover:bg-red-50 transition-colors">
              <LogOut size={14} /> Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Top Bar */}
          <header className="h-14 flex items-center justify-between px-4 sm:px-6 border-b border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 p-1">
                <Menu size={18} />
              </button>
              <h1 className="text-sm font-semibold text-gray-900">{currentItem.label}</h1>
            </div>

            {/* Global Search Bar */}
            <div className="flex-1 max-w-md mx-4 hidden sm:block">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={14} />
                <input 
                  type="text" 
                  placeholder="Buscar cliente (CI, Tel, Nombre)..." 
                  value={globalSearch}
                  onChange={handleGlobalSearch}
                  className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-200 rounded-lg text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-50"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span>Sistema Online</span>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-auto bg-white p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">
              {section === 'overview'      && <OverviewSection onNavigate={navSection} />}
              {section === 'revenue'       && <AdminRevenue />}
              {section === 'savings'       && <AdminSavings />}
              {section === 'loans'         && <AdminLoans />}
              {section === 'clients'       && <AdminClients initialSearch={globalSearch} />}
              {section === 'requests'      && <AdminRequests />}
              {section === 'notifications' && <AdminNotifications />}
              {section === 'currency'      && <AdminCurrency />}
              {section === 'calculator'    && <AdminCalculator />}
            </div>
          </main>
        </div>
      </div>
    </AdminGate>
  );
}