import { useState, useEffect } from 'react';
import { Bell, Send, Users, User, CheckCircle2, AlertCircle, RefreshCw, X, Search, Check } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const API = `https://${projectId}.supabase.co/functions/v1/make-server-fe20efe1`;
const HEADERS = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` };

interface Client { id: string; firstName: string; lastName: string; email: string; status: string; }

export function AdminNotifications() {
  const [target, setTarget] = useState<'all' | 'specific'>('all');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [clientSearch, setClientSearch] = useState('');

  async function loadClients() {
    setLoadingClients(true);
    try {
      const res = await fetch(`${API}/admin/clients`, { headers: HEADERS });
      const data = await res.json();
      setClients(data.clients.filter((c: Client) => c.status === 'approved'));
    } catch (err) { console.error(err); }
    finally { setLoadingClients(false); }
  }
  useEffect(() => { loadClients(); }, []);

  async function handleSend() {
    setError(''); setSuccess('');
    if (!subject.trim()) { setError('El asunto es obligatorio.'); return; }
    if (!message.trim()) { setError('El mensaje es obligatorio.'); return; }
    if (target === 'specific' && selectedClients.length === 0) { setError('Selecciona al menos un cliente.'); return; }
    
    setSending(true);
    try {
      const res = await fetch(`${API}/admin/notifications`, {
        method: 'POST', headers: HEADERS,
        body: JSON.stringify({ target, clientIds: target === 'specific' ? selectedClients : [], subject, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error desconocido');
      
      setSuccess('Notificación enviada correctamente');
      setSubject(''); setMessage(''); setSelectedClients([]);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(`${err}`); }
    finally { setSending(false); }
  }

  function toggleClient(id: string) {
    setSelectedClients(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  }

  const filteredClients = clients.filter(c => 
    c.firstName.toLowerCase().includes(clientSearch.toLowerCase()) || 
    c.lastName.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(clientSearch.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Notificaciones Push</h2>
          <p className="text-xs text-gray-500">Comunicación directa con usuarios</p>
        </div>
        <div className="bg-gray-100 p-2 rounded-full">
           <Bell size={16} className="text-gray-500" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 space-y-6">
        
        {/* Target Selection */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Destinatarios</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button 
              onClick={() => setTarget('all')}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left group ${target === 'all' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${target === 'all' ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
                <Users size={14} />
              </div>
              <div>
                <p className={`text-sm font-medium ${target === 'all' ? 'text-gray-900' : 'text-gray-600'}`}>Todos</p>
                <p className="text-[10px] text-gray-400">{clients.length} usuarios activos</p>
              </div>
              {target === 'all' && <CheckCircle2 size={16} className="ml-auto text-gray-900" />}
            </button>

            <button 
              onClick={() => setTarget('specific')}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left group ${target === 'specific' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${target === 'specific' ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
                <User size={14} />
              </div>
              <div>
                <p className={`text-sm font-medium ${target === 'specific' ? 'text-gray-900' : 'text-gray-600'}`}>Seleccionar</p>
                <p className="text-[10px] text-gray-400">Manual</p>
              </div>
              {target === 'specific' && <CheckCircle2 size={16} className="ml-auto text-gray-900" />}
            </button>
          </div>
        </div>

        {/* Client Selection List */}
        {target === 'specific' && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Lista de Usuarios ({selectedClients.length})
              </label>
              <div className="relative">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="pl-6 pr-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 w-32"
                />
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto bg-gray-50/50">
              {loadingClients ? (
                <div className="p-4 text-center text-xs text-gray-400">Cargando...</div>
              ) : filteredClients.length === 0 ? (
                 <div className="p-4 text-center text-xs text-gray-400">No se encontraron usuarios</div>
              ) : (
                filteredClients.map((client) => {
                  const isSelected = selectedClients.includes(client.id);
                  return (
                    <div 
                      key={client.id}
                      onClick={() => toggleClient(client.id)}
                      className={`
                        flex items-center gap-3 px-3 py-2 cursor-pointer border-b border-gray-100 last:border-0 hover:bg-white transition-colors
                        ${isSelected ? 'bg-white' : ''}
                      `}
                    >
                      <div className={`
                        w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all
                        ${isSelected ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-300'}
                      `}>
                        {isSelected && <Check size={10} className="text-white" />}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-medium truncate ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                          {client.firstName} {client.lastName}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">{client.email}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Message Form */}
        <div className="space-y-4 pt-2 border-t border-gray-100">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Asunto</label>
            <input 
              type="text" 
              value={subject} 
              onChange={e => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-gray-400 transition-all"
              placeholder="Ej: Mantenimiento programado"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Mensaje</label>
            <textarea 
              value={message} 
              onChange={e => setMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-gray-400 transition-all resize-none"
              placeholder="Escribe tu mensaje aquí..."
            />
            <div className="flex justify-end mt-1">
              <span className="text-[10px] text-gray-400">{message.length} caracteres</span>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-xs font-medium animate-in fade-in">
            <AlertCircle size={14} />
            {error}
          </div>
        )}
        
        {success && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium animate-in fade-in">
            <CheckCircle2 size={14} />
            {success}
          </div>
        )}

        {/* Action Button */}
        <button 
          onClick={handleSend} 
          disabled={sending}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 hover:bg-black text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
          {sending ? 'Enviando...' : 'Enviar Notificación'}
        </button>

      </div>
    </div>
  );
}