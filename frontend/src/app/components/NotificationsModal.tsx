import { ArrowLeft, X, Link, QrCode, ArrowDownLeft, DollarSign, Wallet, CreditCard, HandCoins, PiggyBank, TrendingUp, Gift, AlertCircle, Bell, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Notification {
  id: string;
  type: 'link_paid' | 'qr_paid' | 'transfer_received' | 'balance_added' | 'loan_disbursed' | 'savings_completed' | 'payment_received' | 'card_linked' | 'stock_purchase' | 'dividend_paid' | 'promotion' | 'alert';
  title: string;
  description: string;
  amount?: number;
  currency?: 'GS' | 'USD';
  timestamp: string;
  read: boolean;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  if (!isOpen) return null;

  // Notificaciones de ejemplo con todos los tipos posibles
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'link_paid',
      title: 'Link de pago completado',
      description: 'Mario Gomez pagó tu link de pago #LP-45812',
      amount: 150000,
      currency: 'GS',
      timestamp: 'Hace 5 minutos',
      read: false
    },
    {
      id: '2',
      type: 'qr_paid',
      title: 'Pago QR recibido',
      description: 'María González escaneó tu código QR y completó el pago',
      amount: 85000,
      currency: 'GS',
      timestamp: 'Hace 15 minutos',
      read: false
    },
    {
      id: '3',
      type: 'transfer_received',
      title: 'Transferencia recibida',
      description: 'Carlos Martínez te envió una transferencia',
      amount: 500000,
      currency: 'GS',
      timestamp: 'Hace 1 hora',
      read: false
    },
    {
      id: '4',
      type: 'balance_added',
      title: 'Saldo agregado',
      description: 'Tu recarga mediante tarjeta Visa ****4582 fue exitosa',
      amount: 1000000,
      currency: 'GS',
      timestamp: 'Hace 2 horas',
      read: true
    },
    {
      id: '5',
      type: 'loan_disbursed',
      title: 'Préstamo desembolsado',
      description: 'Tu préstamo ha sido aprobado y depositado en tu cuenta',
      amount: 5000000,
      currency: 'GS',
      timestamp: 'Hace 3 horas',
      read: true
    },
    {
      id: '6',
      type: 'savings_completed',
      title: 'Ahorro programado completado',
      description: 'Tu meta de ahorro de 6 meses se completó exitosamente',
      amount: 3500000,
      currency: 'GS',
      timestamp: 'Hace 5 horas',
      read: true
    },
    {
      id: '7',
      type: 'payment_received',
      title: 'Pago recibido',
      description: 'Recibiste un pago de Comercio XYZ por venta #1234',
      amount: 250000,
      currency: 'GS',
      timestamp: 'Ayer a las 18:30',
      read: true
    },
    {
      id: '8',
      type: 'card_linked',
      title: 'Tarjeta vinculada',
      description: 'Tu tarjeta Mastercard ****3891 fue vinculada exitosamente',
      timestamp: 'Ayer a las 14:20',
      read: true
    },
    {
      id: '9',
      type: 'stock_purchase',
      title: 'Compra de acciones confirmada',
      description: 'Compraste 10 acciones de Woz Paraguay Holding',
      amount: 3500000,
      currency: 'GS',
      timestamp: 'Hace 2 días',
      read: true
    },
    {
      id: '10',
      type: 'dividend_paid',
      title: 'Dividendos recibidos',
      description: 'Recibiste dividendos de tus acciones de Woz Gaming',
      amount: 45000,
      currency: 'GS',
      timestamp: 'Hace 2 días',
      read: true
    },
    {
      id: '11',
      type: 'link_paid',
      title: 'Link de pago completado',
      description: 'Andrea López pagó tu link de pago #LP-45698',
      amount: 320000,
      currency: 'GS',
      timestamp: 'Hace 3 días',
      read: true
    },
    {
      id: '12',
      type: 'qr_paid',
      title: 'Pago QR recibido',
      description: 'Roberto Silva escaneó tu código QR',
      amount: 175000,
      currency: 'GS',
      timestamp: 'Hace 3 días',
      read: true
    },
    {
      id: '13',
      type: 'promotion',
      title: 'Promoción especial',
      description: '¡Aprovecha 0% de interés en préstamos hasta 1.000.000 Gs!',
      timestamp: 'Hace 4 días',
      read: true
    },
    {
      id: '14',
      type: 'alert',
      title: 'Recordatorio de pago',
      description: 'Tu cuota de préstamo vence en 3 días',
      amount: 450000,
      currency: 'GS',
      timestamp: 'Hace 5 días',
      read: true
    },
    {
      id: '15',
      type: 'transfer_received',
      title: 'Transferencia recibida',
      description: 'Laura Benítez te envió una transferencia',
      amount: 180000,
      currency: 'GS',
      timestamp: 'Hace 6 días',
      read: true
    }
  ];

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'link_paid':
        return { Icon: Link, color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'qr_paid':
        return { Icon: QrCode, color: 'text-green-600', bg: 'bg-green-50' };
      case 'transfer_received':
        return { Icon: ArrowDownLeft, color: 'text-purple-600', bg: 'bg-purple-50' };
      case 'balance_added':
        return { Icon: Wallet, color: 'text-orange-600', bg: 'bg-orange-50' };
      case 'loan_disbursed':
        return { Icon: HandCoins, color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'savings_completed':
        return { Icon: PiggyBank, color: 'text-green-600', bg: 'bg-green-50' };
      case 'payment_received':
        return { Icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' };
      case 'card_linked':
        return { Icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'stock_purchase':
        return { Icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' };
      case 'dividend_paid':
        return { Icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' };
      case 'promotion':
        return { Icon: Gift, color: 'text-pink-600', bg: 'bg-pink-50' };
      case 'alert':
        return { Icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' };
      default:
        return { Icon: Bell, color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-PY').format(amount);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Modal de detalle de notificación
  if (selectedNotification) {
    const { Icon, color, bg } = getNotificationIcon(selectedNotification.type);
    
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-4 flex items-center gap-3 flex-shrink-0">
          <button 
            onClick={() => setSelectedNotification(null)} 
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-bold text-base">Detalle</h1>
        </div>

        {/* Contenido del detalle */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-md mx-auto p-5">
            {/* Icono central */}
            <div className="flex justify-center mb-6 mt-4">
              <div className={`w-20 h-20 rounded-full ${bg} flex items-center justify-center`}>
                <Icon size={32} className={color} />
              </div>
            </div>

            {/* Título */}
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              {selectedNotification.title}
            </h2>

            {/* Timestamp */}
            <p className="text-sm text-gray-500 text-center mb-6">
              {selectedNotification.timestamp}
            </p>

            {/* Monto si existe */}
            {selectedNotification.amount && (
              <div className="bg-white rounded-2xl p-6 mb-4 text-center shadow-sm border border-gray-100">
                <p className="text-sm text-gray-600 mb-1">Monto</p>
                <p className="text-3xl font-bold text-green-700">
                  + {formatAmount(selectedNotification.amount)}
                </p>
                <p className="text-sm text-gray-600 mt-1">{selectedNotification.currency}</p>
              </div>
            )}

            {/* Descripción */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-700 leading-relaxed">
                {selectedNotification.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header fijo */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
        <button 
          onClick={onClose} 
          className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
          <Bell size={20} />
          <h1 className="font-bold text-base">Notificaciones</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="w-10" />
      </div>

      {/* Lista de notificaciones scrolleable */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-md mx-auto">
          {/* Notificaciones no leídas */}
          {unreadCount > 0 && (
            <>
              <div className="bg-gray-50 px-5 py-4">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nuevas</h2>
              </div>
              
              {notifications.filter(n => !n.read).map((notification, index) => {
                const { Icon, color, bg } = getNotificationIcon(notification.type);
                
                return (
                  <button
                    key={notification.id}
                    onClick={() => setSelectedNotification(notification)}
                    className="w-full px-5 py-5 flex items-center gap-4 hover:bg-gray-50 transition-colors active:bg-gray-100 border-b border-gray-100"
                  >
                    {/* Icono */}
                    <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={18} className={color} />
                    </div>
                    
                    {/* Contenido */}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-bold text-sm text-gray-900 mb-1">{notification.title}</p>
                      <p className="text-xs text-gray-500">{notification.timestamp}</p>
                    </div>

                    {/* Indicador */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      <ChevronRight size={18} className="text-gray-400" />
                    </div>
                  </button>
                );
              })}

              {/* Espaciado entre secciones */}
              <div className="h-6 bg-gray-50" />
            </>
          )}

          {/* Notificaciones anteriores */}
          {notifications.filter(n => n.read).length > 0 && (
            <>
              <div className="bg-gray-50 px-5 py-4">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Anteriores</h2>
              </div>
              
              {notifications.filter(n => n.read).map((notification) => {
                const { Icon, color, bg } = getNotificationIcon(notification.type);
                
                return (
                  <button
                    key={notification.id}
                    onClick={() => setSelectedNotification(notification)}
                    className="w-full px-5 py-5 flex items-center gap-4 hover:bg-gray-50 transition-colors active:bg-gray-100 border-b border-gray-100"
                  >
                    {/* Icono */}
                    <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={18} className={color} />
                    </div>
                    
                    {/* Contenido */}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-semibold text-sm text-gray-700 mb-1">{notification.title}</p>
                      <p className="text-xs text-gray-400">{notification.timestamp}</p>
                    </div>

                    {/* Chevron */}
                    <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
                  </button>
                );
              })}
            </>
          )}

          {/* Estado vacío */}
          {notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-5">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Bell size={32} className="text-gray-400" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">Sin notificaciones</h3>
              <p className="text-sm text-gray-600 text-center">
                No tienes notificaciones en este momento
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
