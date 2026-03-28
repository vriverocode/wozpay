import { useState } from 'react';
import { 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Link as LinkIcon, 
  QrCode, 
  Wallet,
  TrendingUp,
  TrendingDown,
  Building2,
  HandCoins,
  Repeat,
  Search,
  Filter,
  Calendar,
  ChevronDown,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

interface TransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'transfer_sent' | 'transfer_received' | 'balance_loaded' | 'withdrawal' | 'card_validation' | 'qr_payment' | 'link_payment' | 'stock_purchase' | 'stock_sale' | 'card_debit' | 'loan_credited' | 'loan_payment' | 'subscription';
  date: string;
  amount: number;
  currency: 'GS' | 'USD';
  status: 'completed' | 'pending' | 'failed';
  recipient?: string;
  recipientId?: string;
  sender?: string;
  senderId?: string;
  note?: string;
  method?: string;
  accountNumber?: string;
  bankName?: string;
  cardLast4?: string;
  stockName?: string;
  stockQuantity?: number;
  loanId?: string;
  subscriptionName?: string;
}

// Datos de ejemplo
const exampleTransactions: Transaction[] = [
  // Compra de acciones
  {
    id: '1',
    type: 'stock_purchase',
    date: '2026-02-10T14:30:00',
    amount: 845000,
    currency: 'GS',
    status: 'completed',
    stockName: 'Woz Paraguay',
    stockQuantity: 100,
    note: 'Compra de 100 acciones'
  },
  {
    id: '2',
    type: 'stock_purchase',
    date: '2026-02-09T10:15:00',
    amount: 45000,
    currency: 'GS',
    status: 'completed',
    stockName: 'Woz Dropshipping',
    stockQuantity: 50,
    note: 'Compra de 50 acciones'
  },
  // Venta de acciones
  {
    id: '3',
    type: 'stock_sale',
    date: '2026-02-08T16:45:00',
    amount: 37000,
    currency: 'GS',
    status: 'completed',
    stockName: 'Woz Marketplace',
    stockQuantity: 25,
    note: 'Venta de 25 acciones'
  },
  // Transferencias enviadas
  {
    id: '4',
    type: 'transfer_sent',
    date: '2026-02-07T09:20:00',
    amount: 500000,
    currency: 'GS',
    status: 'completed',
    recipient: 'Mario Gomez',
    recipientId: '3.456.789',
    note: 'Pago de servicios'
  },
  {
    id: '5',
    type: 'transfer_sent',
    date: '2026-02-06T18:30:00',
    amount: 150.00,
    currency: 'USD',
    status: 'completed',
    recipient: 'Ana García',
    recipientId: '5.678.901',
    note: 'Regalo de cumpleaños'
  },
  // Transferencias recibidas
  {
    id: '6',
    type: 'transfer_received',
    date: '2026-02-05T11:00:00',
    amount: 750000,
    currency: 'GS',
    status: 'completed',
    sender: 'Carlos Martínez',
    senderId: '2.345.678',
    note: 'Pago por trabajo'
  },
  {
    id: '7',
    type: 'transfer_received',
    date: '2026-02-04T14:15:00',
    amount: 200.00,
    currency: 'USD',
    status: 'completed',
    sender: 'Laura Benítez',
    senderId: '6.789.012',
    note: 'Reembolso'
  },
  // Débito de tarjeta
  {
    id: '8',
    type: 'card_debit',
    date: '2026-02-03T12:45:00',
    amount: 185000,
    currency: 'GS',
    status: 'completed',
    cardLast4: '4532',
    note: 'Compra en supermercado'
  },
  {
    id: '9',
    type: 'card_debit',
    date: '2026-02-02T19:30:00',
    amount: 45.00,
    currency: 'USD',
    status: 'completed',
    cardLast4: '4532',
    note: 'Compra en línea'
  },
  // Acreditación de préstamos
  {
    id: '10',
    type: 'loan_credited',
    date: '2026-02-01T10:00:00',
    amount: 5000000,
    currency: 'GS',
    status: 'completed',
    loanId: 'LOAN-2024-001',
    note: 'Préstamo personal aprobado'
  },
  {
    id: '11',
    type: 'loan_credited',
    date: '2026-01-28T15:30:00',
    amount: 2000.00,
    currency: 'USD',
    status: 'completed',
    loanId: 'LOAN-2024-002',
    note: 'Préstamo urgente'
  },
  // Pago de cuota de préstamos
  {
    id: '12',
    type: 'loan_payment',
    date: '2026-01-25T08:00:00',
    amount: 450000,
    currency: 'GS',
    status: 'completed',
    loanId: 'LOAN-2023-045',
    note: 'Cuota 3/12'
  },
  {
    id: '13',
    type: 'loan_payment',
    date: '2026-01-20T09:15:00',
    amount: 180.00,
    currency: 'USD',
    status: 'completed',
    loanId: 'LOAN-2024-002',
    note: 'Cuota 1/10'
  },
  // Retiros de dinero
  {
    id: '14',
    type: 'withdrawal',
    date: '2026-01-18T16:20:00',
    amount: 1000000,
    currency: 'GS',
    status: 'completed',
    bankName: 'Banco Nacional',
    accountNumber: '1234567890',
    note: 'Retiro a cuenta bancaria'
  },
  {
    id: '15',
    type: 'withdrawal',
    date: '2026-01-15T11:45:00',
    amount: 500.00,
    currency: 'USD',
    status: 'completed',
    bankName: 'Banco Regional',
    accountNumber: '0987654321',
    note: 'Retiro urgente'
  },
  // Cobros de links
  {
    id: '16',
    type: 'link_payment',
    date: '2026-01-12T13:30:00',
    amount: 250000,
    currency: 'GS',
    status: 'completed',
    sender: 'Pedro López',
    senderId: '7.890.123',
    note: 'Pago por link'
  },
  {
    id: '17',
    type: 'link_payment',
    date: '2026-01-10T17:00:00',
    amount: 75.00,
    currency: 'USD',
    status: 'completed',
    sender: 'Sofía Ramírez',
    senderId: '8.901.234',
    note: 'Cobro por servicios'
  },
  // Cobros de QR
  {
    id: '18',
    type: 'qr_payment',
    date: '2026-01-08T15:15:00',
    amount: 125000,
    currency: 'GS',
    status: 'completed',
    sender: 'Roberto Díaz',
    senderId: '9.012.345',
    note: 'Pago con QR'
  },
  {
    id: '19',
    type: 'qr_payment',
    date: '2026-01-05T12:00:00',
    amount: 30.00,
    currency: 'USD',
    status: 'completed',
    sender: 'Elena Torres',
    senderId: '1.234.567',
    note: 'Cobro en comercio'
  },
  // Suscripciones
  {
    id: '20',
    type: 'subscription',
    date: '2026-01-01T00:00:00',
    amount: 49000,
    currency: 'GS',
    status: 'completed',
    subscriptionName: 'Woz Premium',
    note: 'Suscripción mensual'
  },
  {
    id: '21',
    type: 'subscription',
    date: '2026-01-01T00:00:00',
    amount: 9.99,
    currency: 'USD',
    status: 'completed',
    subscriptionName: 'Woz Cloud Storage',
    note: 'Plan básico mensual'
  },
  // Carga de saldo
  {
    id: '22',
    type: 'balance_loaded',
    date: '2025-12-28T14:30:00',
    amount: 2000000,
    currency: 'GS',
    status: 'completed',
    method: 'Tarjeta de crédito',
    note: 'Carga desde tarjeta'
  },
  {
    id: '23',
    type: 'balance_loaded',
    date: '2025-12-25T10:00:00',
    amount: 500.00,
    currency: 'USD',
    status: 'completed',
    method: 'Transferencia bancaria',
    note: 'Recarga de cuenta'
  },
  // Validación de tarjeta
  {
    id: '24',
    type: 'card_validation',
    date: '2025-12-20T09:15:00',
    amount: 5.50,
    currency: 'USD',
    status: 'completed',
    cardLast4: '4532',
    note: 'Cargo de validación (será reembolsado)'
  }
];

export function TransactionsModal({ isOpen, onClose, transactions }: TransactionsModalProps) {
  const allTransactions = [...exampleTransactions, ...transactions];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  if (!isOpen) return null;

  const formatCurrency = (amount: number, curr: 'GS' | 'USD') => {
    if (curr === 'GS') {
      return `Gs ${Math.round(amount).toLocaleString('es-PY')}`;
    }
    return `USD ${amount.toLocaleString('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Hoy ${date.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Ayer ${date.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'transfer_sent':
        return <ArrowUpRight size={18} className="text-red-600" />;
      case 'transfer_received':
        return <ArrowDownLeft size={18} className="text-green-600" />;
      case 'balance_loaded':
        return <Wallet size={18} className="text-blue-600" />;
      case 'withdrawal':
        return <Building2 size={18} className="text-orange-600" />;
      case 'card_validation':
        return <CreditCard size={18} className="text-purple-600" />;
      case 'card_debit':
        return <CreditCard size={18} className="text-red-600" />;
      case 'qr_payment':
        return <QrCode size={18} className="text-indigo-600" />;
      case 'link_payment':
        return <LinkIcon size={18} className="text-pink-600" />;
      case 'stock_purchase':
        return <TrendingUp size={18} className="text-green-600" />;
      case 'stock_sale':
        return <TrendingDown size={18} className="text-red-600" />;
      case 'loan_credited':
        return <HandCoins size={18} className="text-green-600" />;
      case 'loan_payment':
        return <HandCoins size={18} className="text-orange-600" />;
      case 'subscription':
        return <Repeat size={18} className="text-blue-600" />;
      default:
        return <ArrowUpRight size={18} className="text-gray-600" />;
    }
  };

  const getTransactionTitle = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'transfer_sent':
        return `Transferencia enviada`;
      case 'transfer_received':
        return `Transferencia recibida`;
      case 'balance_loaded':
        return `Saldo cargado`;
      case 'withdrawal':
        return `Retiro bancario`;
      case 'card_validation':
        return `Validación de tarjeta`;
      case 'card_debit':
        return `Débito de tarjeta`;
      case 'qr_payment':
        return `Cobro con QR`;
      case 'link_payment':
        return `Cobro con link`;
      case 'stock_purchase':
        return `Compra de acciones`;
      case 'stock_sale':
        return `Venta de acciones`;
      case 'loan_credited':
        return `Acreditación de préstamo`;
      case 'loan_payment':
        return `Pago de cuota`;
      case 'subscription':
        return `Suscripción`;
      default:
        return 'Transacción';
    }
  };

  const getTransactionSubtitle = (transaction: Transaction) => {
    if (transaction.stockName) return transaction.stockName;
    if (transaction.subscriptionName) return transaction.subscriptionName;
    if (transaction.recipient) return `Para: ${transaction.recipient}`;
    if (transaction.sender) return `De: ${transaction.sender}`;
    if (transaction.bankName) return transaction.bankName;
    if (transaction.method) return transaction.method;
    if (transaction.cardLast4) return `Tarjeta •••• ${transaction.cardLast4}`;
    if (transaction.loanId) return transaction.loanId;
    return transaction.note || '';
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'pending':
        return 'Pendiente';
      case 'failed':
        return 'Fallida';
      default:
        return 'Desconocido';
    }
  };

  const isNegative = (type: Transaction['type']) => {
    return ['transfer_sent', 'withdrawal', 'card_validation', 'qr_payment', 'link_payment', 'stock_purchase', 'card_debit', 'loan_payment', 'subscription'].includes(type);
  };

  const transactionTypes = [
    { value: 'all', label: 'Todas' },
    { value: 'stock_purchase', label: 'Compra de acciones' },
    { value: 'stock_sale', label: 'Venta de acciones' },
    { value: 'transfer_sent', label: 'Transferencias enviadas' },
    { value: 'transfer_received', label: 'Transferencias recibidas' },
    { value: 'card_debit', label: 'Débito de tarjeta' },
    { value: 'loan_credited', label: 'Acreditación de préstamos' },
    { value: 'loan_payment', label: 'Pago de cuotas' },
    { value: 'withdrawal', label: 'Retiros de dinero' },
    { value: 'link_payment', label: 'Cobros con link' },
    { value: 'qr_payment', label: 'Cobros con QR' },
    { value: 'subscription', label: 'Suscripciones' },
    { value: 'balance_loaded', label: 'Carga de saldo' },
    { value: 'card_validation', label: 'Validación de tarjeta' }
  ];

  const months = [
    { value: 'all', label: 'Todos los meses' },
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ];

  const years = [
    { value: 'all', label: 'Todos los años' },
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' }
  ];

  // Filtrado de transacciones
  const filteredTransactions = allTransactions.filter(transaction => {
    // Filtro de búsqueda
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      transaction.recipient?.toLowerCase().includes(searchLower) ||
      transaction.recipientId?.includes(searchLower) ||
      transaction.sender?.toLowerCase().includes(searchLower) ||
      transaction.senderId?.includes(searchLower) ||
      transaction.amount.toString().includes(searchLower) ||
      transaction.note?.toLowerCase().includes(searchLower) ||
      transaction.stockName?.toLowerCase().includes(searchLower) ||
      transaction.subscriptionName?.toLowerCase().includes(searchLower);

    // Filtro de tipo
    const matchesType = selectedType === 'all' || transaction.type === selectedType;

    // Filtro de mes y año
    const transactionDate = new Date(transaction.date);
    const matchesMonth = selectedMonth === 'all' || (transactionDate.getMonth() + 1).toString() === selectedMonth;
    const matchesYear = selectedYear === 'all' || transactionDate.getFullYear().toString() === selectedYear;

    return matchesSearch && matchesType && matchesMonth && matchesYear;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white px-5 py-4 flex justify-between items-center">
        <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-1 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold">Transacciones</h2>
        <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-1 transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Búsqueda y filtros */}
      <div className="bg-white border-b border-gray-200 p-4 space-y-3">
        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por CI, nombre, monto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          />
        </div>

        {/* Botón de filtros */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filtros</span>
          </div>
          <ChevronDown size={18} className={`text-gray-600 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="space-y-3 pt-2">
            {/* Tipo de transacción */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">Tipo de transacción</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              >
                {transactionTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Mes y Año */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Mes</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Año</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                >
                  {years.map(year => (
                    <option key={year.value} value={year.value}>{year.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Contador de resultados */}
        <p className="text-xs text-gray-600 text-center">
          {sortedTransactions.length} transacción{sortedTransactions.length !== 1 ? 'es' : ''} encontrada{sortedTransactions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Lista de transacciones */}
      <div className="flex-1 overflow-y-auto p-4">
        {sortedTransactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Wallet size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm">No se encontraron transacciones</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedTransactions.map((transaction) => (
              <button
                key={transaction.id}
                onClick={() => setSelectedTransaction(transaction)}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {getTransactionTitle(transaction)}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {getTransactionSubtitle(transaction)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`font-bold text-sm ${isNegative(transaction.type) ? 'text-red-600' : 'text-green-600'}`}>
                          {isNegative(transaction.type) ? '- ' : '+ '}
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-1.5">
                      <p className="text-xs text-gray-500">
                        {formatDate(transaction.date)}
                      </p>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
            {/* Header del detalle */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex justify-between items-center rounded-t-3xl">
              <h3 className="text-lg font-bold text-gray-900">Detalle de transacción</h3>
              <button onClick={() => setSelectedTransaction(null)} className="text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Estado */}
              <div className="flex items-center justify-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${selectedTransaction.status === 'completed' ? 'bg-green-100' : selectedTransaction.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'}`}>
                  {getTransactionIcon(selectedTransaction.type)}
                </div>
              </div>

              {/* Monto */}
              <div className="text-center">
                <p className={`text-3xl font-bold ${isNegative(selectedTransaction.type) ? 'text-red-600' : 'text-green-600'}`}>
                  {isNegative(selectedTransaction.type) ? '- ' : '+ '}
                  {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
                </p>
                <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full mt-2 ${getStatusColor(selectedTransaction.status)}`}>
                  {getStatusText(selectedTransaction.status)}
                </span>
              </div>

              {/* Información detallada */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">Tipo</span>
                  <span className="text-sm font-semibold text-gray-900 text-right">{getTransactionTitle(selectedTransaction)}</span>
                </div>

                {selectedTransaction.stockName && (
                  <>
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-gray-600">Acción</span>
                      <span className="text-sm font-semibold text-gray-900 text-right">{selectedTransaction.stockName}</span>
                    </div>
                    {selectedTransaction.stockQuantity && (
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-600">Cantidad</span>
                        <span className="text-sm font-semibold text-gray-900 text-right">{selectedTransaction.stockQuantity} acciones</span>
                      </div>
                    )}
                  </>
                )}

                {selectedTransaction.recipient && (
                  <>
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-gray-600">Destinatario</span>
                      <span className="text-sm font-semibold text-gray-900 text-right">{selectedTransaction.recipient}</span>
                    </div>
                    {selectedTransaction.recipientId && (
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-600">CI</span>
                        <span className="text-sm font-semibold text-gray-900 text-right">{selectedTransaction.recipientId}</span>
                      </div>
                    )}
                  </>
                )}

                {selectedTransaction.sender && (
                  <>
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-gray-600">Remitente</span>
                      <span className="text-sm font-semibold text-gray-900 text-right">{selectedTransaction.sender}</span>
                    </div>
                    {selectedTransaction.senderId && (
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-600">CI</span>
                        <span className="text-sm font-semibold text-gray-900 text-right">{selectedTransaction.senderId}</span>
                      </div>
                    )}
                  </>
                )}

                {selectedTransaction.bankName && (
                  <>
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-gray-600">Banco</span>
                      <span className="text-sm font-semibold text-gray-900 text-right">{selectedTransaction.bankName}</span>
                    </div>
                    {selectedTransaction.accountNumber && (
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-600">Cuenta</span>
                        <span className="text-sm font-semibold text-gray-900 text-right">{selectedTransaction.accountNumber}</span>
                      </div>
                    )}
                  </>
                )}

                {selectedTransaction.cardLast4 && (
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-600">Tarjeta</span>
                    <span className="text-sm font-semibold text-gray-900 text-right">•••• {selectedTransaction.cardLast4}</span>
                  </div>
                )}

                {selectedTransaction.loanId && (
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-600">ID Préstamo</span>
                    <span className="text-sm font-semibold text-gray-900 text-right">{selectedTransaction.loanId}</span>
                  </div>
                )}

                {selectedTransaction.subscriptionName && (
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-600">Plan</span>
                    <span className="text-sm font-semibold text-gray-900 text-right">{selectedTransaction.subscriptionName}</span>
                  </div>
                )}

                {selectedTransaction.method && (
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-600">Método</span>
                    <span className="text-sm font-semibold text-gray-900 text-right">{selectedTransaction.method}</span>
                  </div>
                )}

                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">Fecha</span>
                  <span className="text-sm font-semibold text-gray-900 text-right">{formatDate(selectedTransaction.date)}</span>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">ID Transacción</span>
                  <span className="text-sm font-semibold text-gray-900 text-right">{selectedTransaction.id}</span>
                </div>

                {selectedTransaction.note && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Nota</p>
                    <p className="text-sm text-gray-900 italic">"{selectedTransaction.note}"</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedTransaction(null)}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
