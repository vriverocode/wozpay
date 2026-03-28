import { useState, useEffect } from 'react';
import { Users, RefreshCw, AlertCircle, BadgeCheck, CreditCard, Globe, Clock, UserX, Trash2, Shield, CheckCircle2, X, FileCheck, ZoomIn, XCircle, CheckCircle, Copy } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const API = `https://${projectId}.supabase.co/functions/v1/make-server-fe20efe1`;
const HEADERS = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` };
const fmt = (n: number) => new Intl.NumberFormat('es-PY').format(n);
const fmtDate = (d: string) => new Date(d).toLocaleDateString('es-PY', { day: '2-digit', month: 'short', year: 'numeric' });

interface CardInfo {
  type: 'debit' | 'credit';
  number: string;
  brand: string;
  expiry: string;
  cvc: string;
  status: 'active' | 'blocked' | 'expired';
}

interface ClientDocuments {
  front: string;
  back: string;
  selfie: string;
}

interface Client {
  id: string; firstName: string; lastName: string; email: string; phone: string; idNumber: string;
  membership: string; status: 'approved' | 'pending' | 'unverified' | 'deleted';
  hasDebitCard: boolean; hasCreditCard: boolean; isWozInternacional: boolean;
  balanceGs: number; balanceUsd: number; joinedAt: string;
  cards?: CardInfo[];
  documents?: ClientDocuments;
}

type Tab = 'approved' | 'cards' | 'internacional' | 'pending' | 'unverified' | 'deleted';

const memberBadge: Record<string, string> = {
  gratuito: 'bg-slate-100 text-slate-700',
  basico: 'bg-gray-100 text-gray-700',
  regular: 'bg-blue-100 text-blue-700',
  'emprendedor-business': 'bg-amber-100 text-amber-700',
};
const memberName: Record<string, string> = {
  gratuito: 'Gratuito', basico: 'Básico',
  regular: 'Emp. Regular', 'emprendedor-business': 'Emp. Business',
};

function VerificationModal({ client, onApprove, onReject, onClose }: { client: Client; onApprove: () => void; onReject: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Shield className="text-blue-600" size={20} />
              Verificación de Identidad
            </h3>
            <p className="text-xs text-gray-500">Revisión de documentos para {client.firstName} {client.lastName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Selfie Section */}
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden relative group">
                  <img src={client.documents?.selfie} alt="Selfie" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ZoomIn className="text-white drop-shadow-md" size={32} />
                  </div>
                </div>
                <p className="text-center text-xs font-bold text-gray-500 mt-2 uppercase tracking-wide">Selfie (Prueba de Vida)</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="text-xs font-bold text-blue-800 mb-2">Datos del Cliente</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-blue-600">Nombre:</span> <span className="font-medium">{client.firstName} {client.lastName}</span></div>
                  <div className="flex justify-between"><span className="text-blue-600">C.I.:</span> <span className="font-medium">{client.idNumber}</span></div>
                  <div className="flex justify-between"><span className="text-blue-600">Teléfono:</span> <span className="font-medium">{client.phone}</span></div>
                </div>
              </div>
            </div>

            {/* ID Documents Section */}
            <div className="lg:col-span-2 space-y-3">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative group mb-2">
                      <img src={client.documents?.front} alt="ID Front" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <ZoomIn className="text-white drop-shadow-md" size={32} />
                      </div>
                    </div>
                    <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Cédula (Frente)</p>
                  </div>
                  <div>
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative group mb-2">
                      <img src={client.documents?.back} alt="ID Back" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <ZoomIn className="text-white drop-shadow-md" size={32} />
                      </div>
                    </div>
                    <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Cédula (Dorso)</p>
                  </div>
                </div>
              </div>

              {/* Approval Checklist */}
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                <h4 className="text-sm font-bold text-yellow-800 mb-3">Requisitos de Aprobación</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-yellow-900">
                  <label className="flex items-center gap-2 p-2 hover:bg-yellow-100 rounded cursor-pointer">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                    <span>La foto del documento es legible</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 hover:bg-yellow-100 rounded cursor-pointer">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                    <span>La selfie coincide con la foto del documento</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 hover:bg-yellow-100 rounded cursor-pointer">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                    <span>El número de cédula coincide con el registro</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 hover:bg-yellow-100 rounded cursor-pointer">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                    <span>Documento vigente (no expirado)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end gap-3">
          <button onClick={onReject} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all">
            <XCircle size={18} />
            Rechazar Documentos
          </button>
          <button onClick={onApprove} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 transition-all">
            <CheckCircle size={18} />
            Aprobar Verificación
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={20} className="text-red-600" /></div>
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Eliminar cliente</h3>
        <p className="text-sm text-gray-500 text-center mb-6">¿Estás seguro de eliminar a <strong>{name}</strong>? Esta acción no se puede deshacer.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 rounded-xl text-sm font-bold text-white hover:bg-red-700 transition-colors">Eliminar</button>
        </div>
      </div>
    </div>
  );
}

function CardViewModal({ client, cardIndex, onClose }: { client: Client; cardIndex: number; onClose: () => void }) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(cardIndex);
  const cards = client.cards || [];
  const card = cards[currentIdx];

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  if (!card) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">{client.firstName} {client.lastName}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Card tabs if multiple */}
          {cards.length > 1 && (
            <div className="flex gap-2">
              {cards.map((cd, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${currentIdx === i ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {cd.type === 'debit' ? 'Débito' : 'Crédito'}
                </button>
              ))}
            </div>
          )}

          {/* Card Visual */}
          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white shadow-lg overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute top-20 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{card.brand}</p>
                <p className={`text-xs font-bold px-2 py-0.5 rounded inline-block ${card.type === 'debit' ? 'bg-blue-500/20 text-blue-200' : 'bg-amber-500/20 text-amber-200'}`}>
                  {card.type === 'debit' ? 'DÉBITO' : 'CRÉDITO'}
                </p>
              </div>
              <CreditCard className="text-white/20" size={32} />
            </div>
            <div className="mb-6 relative z-10">
              <p className="text-lg font-mono tracking-widest text-white/90 tabular-nums">{card.number}</p>
            </div>
            <div className="flex justify-between items-end relative z-10">
              <div>
                <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-0.5">Titular</p>
                <p className="text-sm font-medium uppercase">{client.firstName} {client.lastName}</p>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-0.5">Vence</p>
                  <p className="text-sm font-mono">{card.expiry}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-0.5">CVC</p>
                  <p className="text-sm font-mono text-white/80">{card.cvc}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Copy fields */}
          <div className="space-y-2">
            {[
              { label: 'Número de tarjeta', value: card.number, field: 'number' },
              { label: 'Titular', value: `${client.firstName} ${client.lastName}`.toUpperCase(), field: 'holder' },
              { label: 'Vencimiento', value: card.expiry, field: 'expiry' },
              { label: 'CVC', value: card.cvc, field: 'cvc' },
            ].map(item => (
              <div key={item.field} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5">
                <div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                  <p className="text-xs font-mono font-semibold text-gray-800">{item.value}</p>
                </div>
                <button
                  onClick={() => copy(item.value, item.field)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${copiedField === item.field ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                >
                  {copiedField === item.field ? <><CheckCircle size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('approved');
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [verifyTarget, setVerifyTarget] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [cardViewTarget, setCardViewTarget] = useState<{ client: Client; cardIndex: number } | null>(null);

  async function load() {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/admin/clients`, { headers: HEADERS });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      
      // Augment data with mocked full card details for demonstration
      const augmented: Client[] = data.clients.map((c: any) => ({
        ...c,
        // Mock documents for pending users
        documents: c.status === 'pending' ? {
          selfie: 'https://images.unsplash.com/photo-1559674850-47859f577fba?auto=format&fit=crop&w=400&q=80',
          front: 'https://images.unsplash.com/photo-1635231152740-dcfba853f33d?auto=format&fit=crop&w=800&q=80',
          back: 'https://images.unsplash.com/photo-1613244470042-e69e8ccb303a?auto=format&fit=crop&w=800&q=80'
        } : undefined,
        cards: (c.hasDebitCard || c.hasCreditCard) ? [
          ...(c.hasDebitCard ? [{ 
            type: 'debit', 
            number: `4532 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
            brand: 'Visa', 
            expiry: '12/28', 
            cvc: Math.floor(100 + Math.random() * 900).toString(),
            status: 'active' 
          }] : []),
          ...(c.hasCreditCard ? [{ 
            type: 'credit', 
            number: `5412 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
            brand: 'Mastercard', 
            expiry: '10/29', 
            cvc: Math.floor(100 + Math.random() * 900).toString(),
            status: 'active' 
          }] : [])
        ] : []
      }));
      setClients(augmented);
    } catch (err) { setError(`${err}`); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API}/admin/clients/${deleteTarget.id}`, { method: 'DELETE', headers: HEADERS });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setDeleteTarget(null);
      await load();
    } catch (err) { setError(`Error al eliminar: ${err}`); }
    finally { setDeleting(false); }
  }

  async function handleVerify(approve: boolean) {
    if (!verifyTarget) return;
    try {
      // In a real app, you would call an API endpoint here.
      // For now, we'll mock the update locally.
      const newStatus = approve ? 'approved' : 'unverified'; // Reject -> Unverified (needs re-upload)
      
      // Optimistic update
      setClients(prev => prev.map(c => c.id === verifyTarget.id ? { ...c, status: newStatus } : c));
      setVerifyTarget(null);
      
      // Call API to persist (mocked)
      // await fetch(`${API}/admin/clients/${verifyTarget.id}/verify`, { 
      //   method: 'POST', 
      //   headers: HEADERS, 
      //   body: JSON.stringify({ status: newStatus }) 
      // });
      
    } catch (err) { setError(`Error al verificar: ${err}`); }
  }

  const tabs: { key: Tab; label: string; icon: any; filter: (c: Client) => boolean }[] = [
    { key: 'approved', label: 'Aprobados', icon: CheckCircle2, filter: c => c.status === 'approved' },
    { key: 'cards', label: 'Tarjetas', icon: CreditCard, filter: c => c.status === 'approved' && (c.hasDebitCard || c.hasCreditCard) },
    { key: 'internacional', label: 'Woz Internacional', icon: Globe, filter: c => c.isWozInternacional },
    { key: 'pending', label: 'Verificación pendiente', icon: Clock, filter: c => c.status === 'pending' },
    { key: 'unverified', label: 'Sin verificación', icon: Shield, filter: c => c.status === 'unverified' },
    { key: 'deleted', label: 'Eliminados', icon: UserX, filter: c => c.status === 'deleted' },
  ];

  const current = tabs.find(t => t.key === tab)!;
  const filtered = clients.filter(current.filter);
  const counts = Object.fromEntries(tabs.map(t => [t.key, clients.filter(t.filter).length]));

  const canDelete = (c: Client) => c.status !== 'deleted';

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400"><RefreshCw size={20} className="animate-spin mr-2" />Cargando clientes...</div>;
  if (error) return <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3"><AlertCircle size={16} className="text-red-500 mt-0.5" /><p className="text-sm text-red-700">{error}</p></div>;

  return (
    <div>
      {verifyTarget && (
        <VerificationModal
          client={verifyTarget}
          onApprove={() => handleVerify(true)}
          onReject={() => handleVerify(false)}
          onClose={() => setVerifyTarget(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          name={`${deleteTarget.firstName} ${deleteTarget.lastName}`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {cardViewTarget && (
        <CardViewModal
          client={cardViewTarget.client}
          cardIndex={cardViewTarget.cardIndex}
          onClose={() => setCardViewTarget(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h2>
          <p className="text-sm text-gray-500 mt-0.5">{clients.filter(c => c.status !== 'deleted').length} clientes activos  {clients.length} total</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><RefreshCw size={14} />Actualizar</button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Total Clients */}
        <div className="bg-blue-900 text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Total Clientes</p>
            <h3 className="text-3xl font-bold">{clients.length}</h3>
            <p className="text-[10px] text-blue-200 mt-2 flex items-center gap-1">
              <Clock size={10} /> Actualizado ahora
            </p>
          </div>
          <Users className="absolute -right-4 -bottom-4 text-blue-800 opacity-50" size={80} />
        </div>

        {/* Verification Status */}
        <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex flex-col justify-center gap-2">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Estado Verificación</h4>
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2 text-gray-600"><CheckCircle2 size={14} className="text-green-500" /> Verificados</span>
            <span className="font-bold text-gray-900">{clients.filter(c => c.status === 'approved').length}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2 text-gray-600"><Shield size={14} className="text-amber-500" /> Pendientes</span>
            <span className="font-bold text-gray-900">{clients.filter(c => c.status === 'pending' || c.status === 'unverified').length}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2 text-gray-600"><UserX size={14} className="text-red-400" /> Eliminados</span>
            <span className="font-bold text-gray-900">{clients.filter(c => c.status === 'deleted').length}</span>
          </div>
        </div>

        {/* Membership Breakdown */}
        <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex flex-col justify-center gap-1 md:col-span-2">
           <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Membresías</h4>
           <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
             {Object.entries(memberBadge).filter(([k]) => k !== 'gratuito').map(([key, badgeClass]) => {
               const count = clients.filter(c => c.membership === key && c.status === 'approved').length;
               return (
                 <div key={key} className={`p-2 rounded-lg border border-gray-100 text-center ${badgeClass.replace('bg-', 'bg-opacity-10 bg-')}`}>
                   <p className="text-lg font-bold">{count}</p>
                   <p className="text-[9px] font-medium truncate opacity-80">{memberName[key]}</p>
                 </div>
               );
             })}
           </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-2 mb-4 gap-2 no-scrollbar">
        {tabs.map(t => {
          const isActive = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                isActive ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}>
              <t.icon size={14} />
              <span>{t.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${isActive ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {counts[t.key]}
              </span>
            </button>
          )
        })}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <current.icon size={16} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900">{current.label}</h3>
          <span className="ml-auto text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{filtered.length}</span>
        </div>
        
        {filtered.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
            <Users size={24} className="mx-auto mb-2 text-gray-300" />
            <p className="text-xs text-gray-400">No se encontraron clientes en esta categoría.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(c => {
              // Special Card View — compact list row
              if (tab === 'cards') {
                return (c.cards || []).map((card, idx) => (
                  <div key={`${c.id}-card-${idx}`} className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-gray-300 transition-all">
                    <CreditCard size={16} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono tracking-widest text-gray-800 truncate">{card.number}</p>
                      <p className="text-[10px] text-gray-400">{c.firstName} {c.lastName}</p>
                    </div>
                    <span className={`hidden sm:inline text-[9px] font-bold px-2 py-0.5 rounded flex-shrink-0 ${card.type === 'debit' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {card.type === 'debit' ? 'DÉBITO' : 'CRÉDITO'}
                    </span>
                    <span className="hidden md:inline text-xs font-mono text-gray-500 flex-shrink-0">{card.expiry}</span>
                    <span className={`hidden sm:inline text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${memberBadge[c.membership] || 'bg-gray-50 text-gray-500'}`}>
                      {memberName[c.membership] || c.membership}
                    </span>
                    <button
                      onClick={() => setCardViewTarget({ client: c, cardIndex: idx })}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors flex-shrink-0"
                    >
                      <CreditCard size={10} /> Ver tarjeta
                    </button>
                  </div>
                ));
              }

              // Standard List Row
              return (
                <div key={c.id} className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-gray-300 transition-all">
                  {/* Status dot */}
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    c.status === 'approved' ? 'bg-emerald-400' :
                    c.status === 'pending' ? 'bg-amber-400' :
                    c.status === 'deleted' ? 'bg-red-300' : 'bg-gray-300'
                  }`} />

                  {/* Name + email */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">{c.firstName} {c.lastName}</h4>
                      <span className={`flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded border border-transparent ${memberBadge[c.membership] || 'bg-gray-50 text-gray-500'}`}>
                        {memberName[c.membership] || c.membership}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 truncate">{c.email}</p>
                  </div>

                  {/* CI */}
                  <div className="hidden sm:flex flex-col gap-0.5 w-24 flex-shrink-0">
                    <span className="text-[9px] text-gray-400 uppercase tracking-wider">CI</span>
                    {c.idNumber ? (
                      <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1"><BadgeCheck size={9} />{c.idNumber}</span>
                    ) : (
                      <span className="text-[10px] font-semibold text-red-400 flex items-center gap-1"><X size={9} />Sin cédula</span>
                    )}
                  </div>

                  {/* Balance */}
                  <div className="hidden md:flex flex-col gap-0.5 w-28 flex-shrink-0">
                    <span className="text-[9px] text-gray-400 uppercase tracking-wider">Balance</span>
                    <span className="text-[10px] font-bold text-gray-800 font-mono">{c.balanceGs > 0 ? `Gs ${fmt(c.balanceGs)}` : '—'}</span>
                  </div>

                  {/* Card chips */}
                  <div className="hidden lg:flex gap-1.5 flex-shrink-0">
                    {c.hasDebitCard && <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 flex items-center gap-0.5"><CreditCard size={8} /> Débito</span>}
                    {c.hasCreditCard && <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 flex items-center gap-0.5"><CreditCard size={8} /> Crédito</span>}
                  </div>

                  {/* Date */}
                  <div className="hidden xl:block flex-shrink-0">
                    <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock size={9} />{fmtDate(c.joinedAt)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {(c.hasDebitCard || c.hasCreditCard) && (c.cards || []).length > 0 && (
                      <button
                        onClick={() => setCardViewTarget({ client: c, cardIndex: 0 })}
                        className="flex items-center gap-1 px-2 py-1.5 text-[10px] font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <CreditCard size={10} /> Ver tarjeta
                      </button>
                    )}
                    {c.status === 'pending' && (
                      <button
                        onClick={() => setVerifyTarget(c)}
                        className="flex items-center gap-1 px-2 py-1.5 bg-blue-600 text-white rounded-md text-[10px] font-bold hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        <FileCheck size={10} /> Verificar
                      </button>
                    )}
                    {canDelete(c) ? (
                      <button
                        onClick={() => setDeleteTarget(c)}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors"
                        title="Eliminar usuario"
                      >
                        <Trash2 size={11} />
                      </button>
                    ) : (
                      <span className="text-[9px] font-bold text-gray-300 uppercase tracking-wider">Eliminado</span>
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