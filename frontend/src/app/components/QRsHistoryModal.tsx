import { X, QrCode, CheckCircle, XCircle, Search, Calendar, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface QRsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QRTransaction {
  id: string;
  date: string;
  time: string;
  amount: number;
  currency: 'GS' | 'USD';
  status: 'paid' | 'rejected';
  recipient: string;
  qrCode: string;
}

const mockQRs: QRTransaction[] = [
  {
    id: '1',
    date: '11/02/2026',
    time: '15:45',
    amount: 780000,
    currency: 'GS',
    status: 'paid',
    recipient: 'Comercio Los Andes',
    qrCode: 'WOZ-QR-5601'
  },
  {
    id: '2',
    date: '10/02/2026',
    time: '12:30',
    amount: 67.95,
    currency: 'USD',
    status: 'paid',
    recipient: 'Restaurant El Fogón',
    qrCode: 'WOZ-QR-5600'
  },
  {
    id: '3',
    date: '09/02/2026',
    time: '18:20',
    amount: 2100000,
    currency: 'GS',
    status: 'rejected',
    recipient: 'Supermercado Central',
    qrCode: 'WOZ-QR-5599'
  },
  {
    id: '4',
    date: '08/02/2026',
    time: '10:15',
    amount: 138.90,
    currency: 'USD',
    status: 'paid',
    recipient: 'Farmacia San Roque',
    qrCode: 'WOZ-QR-5598'
  },
  {
    id: '5',
    date: '07/02/2026',
    time: '14:40',
    amount: 380000,
    currency: 'GS',
    status: 'paid',
    recipient: 'Café Literario',
    qrCode: 'WOZ-QR-5597'
  },
  {
    id: '6',
    date: '06/02/2026',
    time: '11:25',
    amount: 218.95,
    currency: 'USD',
    status: 'paid',
    recipient: 'Boutique Elegante',
    qrCode: 'WOZ-QR-5596'
  },
  {
    id: '7',
    date: '05/02/2026',
    time: '16:50',
    amount: 650000,
    currency: 'GS',
    status: 'rejected',
    recipient: 'Librería Cervantes',
    qrCode: 'WOZ-QR-5595'
  },
  {
    id: '8',
    date: '04/02/2026',
    time: '09:35',
    amount: 1100000,
    currency: 'GS',
    status: 'paid',
    recipient: 'Electrodomésticos Sur',
    qrCode: 'WOZ-QR-5594'
  },
  {
    id: '9',
    date: '03/02/2026',
    time: '13:10',
    amount: 78.50,
    currency: 'USD',
    status: 'paid',
    recipient: 'Panadería La Espiga',
    qrCode: 'WOZ-QR-5593'
  },
  {
    id: '10',
    date: '02/02/2026',
    time: '17:55',
    amount: 890000,
    currency: 'GS',
    status: 'rejected',
    recipient: 'Zapatería Moderna',
    qrCode: 'WOZ-QR-5592'
  }
];

export function QRsHistoryModal({ isOpen, onClose }: QRsHistoryModalProps) {
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

  const filteredQRs = mockQRs.filter(qr => {
    const matchesSearch = 
      qr.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qr.qrCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = dateFilter ? qr.date.includes(dateFilter) : true;
    
    return matchesSearch && matchesDate;
  });

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-purple-600 text-white px-5 py-4 flex justify-between items-center">
        <button 
          onClick={onClose} 
          className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          <QrCode size={24} />
          <h2 className="text-lg font-bold">Historial de QRs</h2>
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
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-32 pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="divide-y divide-gray-200">
          {filteredQRs.length > 0 ? (
            filteredQRs.map((qr) => (
              <div
                key={qr.id}
                className="px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                      <QrCode size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm leading-tight">{qr.recipient}</p>
                      <p className="text-xs text-gray-500">{qr.qrCode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">
                      {qr.currency === 'USD' 
                        ? `${qr.amount.toFixed(2)} USD`
                        : `${formatNumber(qr.amount)} Gs`
                      }
                    </p>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      {getStatusIcon(qr.status)}
                      <span className={`text-xs font-medium ${qr.status === 'paid' ? 'text-green-700' : 'text-red-700'}`}>
                        {getStatusText(qr.status)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 ml-10">
                  <span>{qr.date}</span>
                  <span>{qr.time}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-5">
              <Search size={48} className="text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm text-center">
                No se encontraron QRs con los criterios de búsqueda
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}