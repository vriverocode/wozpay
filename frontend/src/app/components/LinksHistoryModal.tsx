import { X, Link, CheckCircle, XCircle, Search, Calendar, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface LinksHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LinkTransaction {
  id: string;
  date: string;
  time: string;
  amount: number;
  currency: 'GS' | 'USD';
  status: 'paid' | 'rejected';
  recipient: string;
  linkCode: string;
}

const mockLinks: LinkTransaction[] = [
  {
    id: '1',
    date: '11/02/2026',
    time: '14:30',
    amount: 500000,
    currency: 'GS',
    status: 'paid',
    recipient: 'Mario Gomez',
    linkCode: 'WOZ-LNK-2401'
  },
  {
    id: '2',
    date: '10/02/2026',
    time: '11:15',
    amount: 75.50,
    currency: 'USD',
    status: 'paid',
    recipient: 'María González',
    linkCode: 'WOZ-LNK-2400'
  },
  {
    id: '3',
    date: '09/02/2026',
    time: '16:45',
    amount: 1200000,
    currency: 'GS',
    status: 'rejected',
    recipient: 'Carlos Ramírez',
    linkCode: 'WOZ-LNK-2399'
  },
  {
    id: '4',
    date: '08/02/2026',
    time: '09:20',
    amount: 128.35,
    currency: 'USD',
    status: 'paid',
    recipient: 'Ana Martínez',
    linkCode: 'WOZ-LNK-2398'
  },
  {
    id: '5',
    date: '07/02/2026',
    time: '13:55',
    amount: 320000,
    currency: 'GS',
    status: 'paid',
    recipient: 'Luis Fernández',
    linkCode: 'WOZ-LNK-2397'
  },
  {
    id: '6',
    date: '06/02/2026',
    time: '10:10',
    amount: 101.95,
    currency: 'USD',
    status: 'paid',
    recipient: 'Patricia López',
    linkCode: 'WOZ-LNK-2396'
  },
  {
    id: '7',
    date: '05/02/2026',
    time: '15:30',
    amount: 1500000,
    currency: 'GS',
    status: 'rejected',
    recipient: 'Roberto Silva',
    linkCode: 'WOZ-LNK-2395'
  },
  {
    id: '8',
    date: '04/02/2026',
    time: '08:45',
    amount: 420000,
    currency: 'GS',
    status: 'paid',
    recipient: 'Sandra Rojas',
    linkCode: 'WOZ-LNK-2394'
  },
  {
    id: '9',
    date: '03/02/2026',
    time: '12:20',
    amount: 147.90,
    currency: 'USD',
    status: 'paid',
    recipient: 'Miguel Ortiz',
    linkCode: 'WOZ-LNK-2393'
  },
  {
    id: '10',
    date: '02/02/2026',
    time: '17:05',
    amount: 550000,
    currency: 'GS',
    status: 'rejected',
    recipient: 'Laura Benítez',
    linkCode: 'WOZ-LNK-2392'
  }
];

export function LinksHistoryModal({ isOpen, onClose }: LinksHistoryModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  if (!isOpen) return null;

  const formatNumber = (num: number) => {
    return num.toLocaleString('es-PY');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle size={14} className="text-green-600" />;
      case 'rejected':
        return <XCircle size={14} className="text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pagado';
      case 'rejected':
        return 'Rechazado';
      default:
        return status;
    }
  };

  const filteredLinks = mockLinks.filter(link => {
    const matchesSearch = 
      link.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.linkCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = dateFilter ? link.date.includes(dateFilter) : true;
    
    return matchesSearch && matchesDate;
  });

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white px-5 py-4 flex justify-between items-center">
        <button 
          onClick={onClose} 
          className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          <Link size={24} />
          <h2 className="text-lg font-bold">Historial de Links</h2>
        </div>
        <button 
          onClick={onClose} 
          className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Buscador y filtro de fechas */}
      <div className="bg-white border-b border-gray-200 px-5 py-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o referencia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-32 pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="divide-y divide-gray-200">
          {filteredLinks.length > 0 ? (
            filteredLinks.map((link) => (
              <div
                key={link.id}
                className="px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Link size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm leading-tight">{link.recipient}</p>
                      <p className="text-xs text-gray-500">{link.linkCode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">
                      {link.currency === 'USD' 
                        ? `${link.amount.toFixed(2)} USD`
                        : `${formatNumber(link.amount)} Gs`
                      }
                    </p>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      {getStatusIcon(link.status)}
                      <span className={`text-xs font-medium ${link.status === 'paid' ? 'text-green-700' : 'text-red-700'}`}>
                        {getStatusText(link.status)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 ml-10">
                  <span>{link.date}</span>
                  <span>{link.time}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-5">
              <Search size={48} className="text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm text-center">
                No se encontraron links con los criterios de búsqueda
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
