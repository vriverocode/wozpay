import { useState } from 'react';
import { X, CreditCard, Wallet, Check, AlertCircle, ArrowLeft } from 'lucide-react';

interface PayModalProps {
  isOpen: boolean;
  onClose: () => void;
  balanceGuaranies: number;
  balanceDollars: number;
  onPayment: (amount: number, currency: 'GS' | 'USD', paymentMethod: string) => void;
  linkedCards?: LinkedCard[];
}

interface LinkedCard {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cardType: string;
}

export function PayModal({ isOpen, onClose, balanceGuaranies, balanceDollars, onPayment, linkedCards = [] }: PayModalProps) {
  const [view, setView] = useState<'select' | 'pay' | 'processing' | 'success'>('select');
  const [selectedLoan, setSelectedLoan] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'balance_gs' | 'balance_usd' | 'card'>('balance_gs');
  const [selectedCard, setSelectedCard] = useState<string>('');

  // Ejemplo de préstamos con cuotas pendientes
  const loans = [
    { id: 'LOAN-2023-045', name: 'Préstamo Personal', nextPayment: 450000, currency: 'GS' as const, dueDate: '2026-03-10' },
    { id: 'LOAN-2024-002', name: 'Préstamo Urgente', nextPayment: 180.00, currency: 'USD' as const, dueDate: '2026-02-20' },
    { id: 'LOAN-2024-089', name: 'Préstamo Express', nextPayment: 320000, currency: 'GS' as const, dueDate: '2026-02-15' }
  ];

  // Usar las tarjetas vinculadas que se pasan desde App.tsx
  const cards = linkedCards;

  if (!isOpen) return null;

  const selectedLoanData = loans.find(l => l.id === selectedLoan);

  const handlePayment = () => {
    if (!selectedLoanData) return;

    setView('processing');

    setTimeout(() => {
      onPayment(selectedLoanData.nextPayment, selectedLoanData.currency, paymentMethod);
      setView('success');
    }, 2000);
  };

  const canPay = () => {
    if (!selectedLoanData) return false;
    
    if (paymentMethod === 'balance_gs') {
      return selectedLoanData.currency === 'GS' && balanceGuaranies >= selectedLoanData.nextPayment;
    } else if (paymentMethod === 'balance_usd') {
      return selectedLoanData.currency === 'USD' && balanceDollars >= selectedLoanData.nextPayment;
    } else if (paymentMethod === 'card') {
      return selectedCard !== '';
    }
    
    return false;
  };

  const handleClose = () => {
    setView('select');
    setSelectedLoan('');
    setPaymentMethod('balance_gs');
    setSelectedCard('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white px-5 py-4 flex justify-between items-center">
        <button 
          onClick={() => {
            if (view === 'select') {
              handleClose();
            } else if (view === 'pay') {
              setView('select');
            } else if (view === 'success') {
              setView('select');
            } else if (view === 'processing') {
              // No hacer nada durante procesamiento
            }
          }}
          className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        
        <h2 className="text-lg font-bold">Pagar</h2>
        
        <button onClick={handleClose} className="text-white hover:bg-white/20 rounded-full p-1 transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-lg mx-auto p-5 space-y-5">
          {view === 'select' && (
            <>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Préstamos y cuotas pendientes</h3>
                <div className="space-y-3">
                  {loans.map((loan) => (
                    <button
                      key={loan.id}
                      onClick={() => {
                        setSelectedLoan(loan.id);
                        setView('pay');
                      }}
                      className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:border-cyan-400 hover:shadow-sm transition-all text-left"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{loan.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">ID: {loan.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-base">
                            {loan.currency === 'GS' 
                              ? `Gs ${loan.nextPayment.toLocaleString('es-PY')}`
                              : `USD ${loan.nextPayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                            }
                          </p>
                          <p className="text-xs text-gray-500">Próxima cuota</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">Vencimiento</span>
                        <span className="text-xs font-medium text-gray-900">{new Date(loan.dueDate).toLocaleDateString('es-PY')}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {loans.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                    <Wallet size={24} className="text-gray-300" />
                  </div>
                  <p className="text-gray-500 text-sm">No tienes cuotas pendientes</p>
                </div>
              )}
            </>
          )}

          {view === 'pay' && selectedLoanData && (
            <>
              {/* Resumen del pago - Compacto con líneas divisorias */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-2.5">Resumen del pago</p>
                <div className="space-y-0 divide-y divide-gray-200">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-gray-600">Préstamo</span>
                    <span className="text-xs font-semibold text-gray-900 text-right">{selectedLoanData.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-gray-600">ID</span>
                    <span className="text-xs font-medium text-gray-700">{selectedLoanData.id}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-gray-600">Monto a pagar</span>
                    <span className="text-lg font-bold text-gray-900">
                      {selectedLoanData.currency === 'GS' 
                        ? `Gs ${selectedLoanData.nextPayment.toLocaleString('es-PY')}`
                        : `USD ${selectedLoanData.nextPayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Método de pago */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Método de pago</h3>
                
                {/* Saldo en Guaraníes */}
                <button
                  onClick={() => setPaymentMethod('balance_gs')}
                  className={`w-full mb-2.5 p-4 rounded-xl border transition-all ${
                    paymentMethod === 'balance_gs'
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        paymentMethod === 'balance_gs' ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Wallet size={18} className={paymentMethod === 'balance_gs' ? 'text-green-600' : 'text-gray-700'} />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 text-sm">Saldo en Guaraníes</p>
                        <p className="text-xs text-gray-500">Gs {balanceGuaranies.toLocaleString('es-PY')}</p>
                      </div>
                    </div>
                    {paymentMethod === 'balance_gs' && (
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                  </div>
                  {selectedLoanData.currency === 'GS' && balanceGuaranies < selectedLoanData.nextPayment && (
                    <div className="mt-3 flex items-start gap-2 bg-red-50 rounded-lg p-2.5 border border-red-100">
                      <AlertCircle size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700">Saldo insuficiente para realizar el pago</p>
                    </div>
                  )}
                </button>

                {/* Saldo en Dólares */}
                <button
                  onClick={() => setPaymentMethod('balance_usd')}
                  className={`w-full mb-2.5 p-4 rounded-xl border transition-all ${
                    paymentMethod === 'balance_usd'
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        paymentMethod === 'balance_usd' ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Wallet size={18} className={paymentMethod === 'balance_usd' ? 'text-green-600' : 'text-gray-700'} />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 text-sm">Saldo en Dólares</p>
                        <p className="text-xs text-gray-500">USD {balanceDollars.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                    {paymentMethod === 'balance_usd' && (
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                  </div>
                  {selectedLoanData.currency === 'USD' && balanceDollars < selectedLoanData.nextPayment && (
                    <div className="mt-3 flex items-start gap-2 bg-red-50 rounded-lg p-2.5 border border-red-100">
                      <AlertCircle size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700">Saldo insuficiente para realizar el pago</p>
                    </div>
                  )}
                </button>

                {/* Tarjetas vinculadas */}
                {cards.length > 0 && (
                  <>
                    <p className="text-xs font-medium text-gray-500 mb-2.5 mt-4">Tarjetas vinculadas</p>
                    {cards.map((card) => (
                      <button
                        key={card.id}
                        onClick={() => {
                          setPaymentMethod('card');
                          setSelectedCard(card.id);
                        }}
                        className={`w-full mb-2.5 p-4 rounded-xl border transition-all ${
                          paymentMethod === 'card' && selectedCard === card.id
                            ? 'border-green-400 bg-green-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                              paymentMethod === 'card' && selectedCard === card.id ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              <CreditCard size={18} className={paymentMethod === 'card' && selectedCard === card.id ? 'text-green-600' : 'text-gray-700'} />
                            </div>
                            <div className="text-left">
                              <p className="font-semibold text-gray-900 text-sm">{card.cardType.toUpperCase()}</p>
                              <p className="text-xs text-gray-500">•••• •••• •••• {card.cardNumber.slice(-4)}</p>
                            </div>
                          </div>
                          {paymentMethod === 'card' && selectedCard === card.id && (
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                              <Check size={14} className="text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setView('select')}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Volver
                </button>
                <button
                  onClick={handlePayment}
                  disabled={!canPay()}
                  className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Confirmar pago
                </button>
              </div>
            </>
          )}

          {view === 'processing' && (
            <div className="py-16 text-center space-y-4">
              <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <h3 className="text-lg font-bold text-gray-900">Procesando pago</h3>
              <p className="text-sm text-gray-500">Por favor espera un momento</p>
            </div>
          )}

          {view === 'success' && selectedLoanData && (
            <div className="space-y-5">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-4">
                  <Check size={28} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Pago exitoso</h3>
                <p className="text-sm text-gray-600">
                  Tu cuota ha sido pagada correctamente
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 mb-3">Detalles del pago</h4>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-600">Préstamo</span>
                    <span className="text-sm font-semibold text-gray-900 text-right">{selectedLoanData.name}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-600">ID</span>
                    <span className="text-sm font-medium text-gray-700">{selectedLoanData.id}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-600">Monto</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {selectedLoanData.currency === 'GS' 
                        ? `Gs ${selectedLoanData.nextPayment.toLocaleString('es-PY')}`
                        : `USD ${selectedLoanData.nextPayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-start pt-2 border-t border-gray-100">
                    <span className="text-sm text-gray-600">Método</span>
                    <span className="text-sm font-medium text-gray-700">
                      {paymentMethod === 'balance_gs' && 'Saldo en Guaraníes'}
                      {paymentMethod === 'balance_usd' && 'Saldo en Dólares'}
                      {paymentMethod === 'card' && 'Tarjeta de crédito'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                Continuar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}