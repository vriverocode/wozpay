import { useState } from 'react';
import { X, Search, Check, AlertCircle, User, ArrowLeft, Globe, Banknote } from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  availableBalance: {
    guaranies: number;
    dollars: number;
  };
  onBalanceUpdate?: (newBalance: { guaranies: number; dollars: number }) => void;
  onTransactionAdd?: (transaction: any) => void;
}

interface WozAccount {
  id: string;
  name: string;
  accountId: string;
  verified: boolean;
}

export function TransferModal({ isOpen, onClose, userName, availableBalance, onBalanceUpdate, onTransactionAdd }: TransferModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<WozAccount | null>(null);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'GS' | 'USD'>('GS');
  const [transferStatus, setTransferStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [note, setNote] = useState('');
  const [sourceAccount, setSourceAccount] = useState<'GS' | 'USD' | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  
  // Verificar si el usuario ya eligió no mostrar la intro
  const shouldShowIntro = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('woz_skip_transfer_intro') !== 'true';
    }
    return true;
  };
  
  const [showIntro, setShowIntro] = useState(shouldShowIntro());

  // Cuentas simuladas de Woz Payments
  const mockAccounts: WozAccount[] = [
    { id: '1', name: 'Carlos Martínez López', accountId: 'WOZ-001234', verified: true },
    { id: '2', name: 'Ana García Rodríguez', accountId: 'WOZ-005678', verified: true },
    { id: '3', name: 'Luis Benítez Sosa', accountId: 'WOZ-009012', verified: true },
    { id: '4', name: 'María Fernández', accountId: 'WOZ-003456', verified: false },
    { id: '5', name: 'Jorge Villalba Castro', accountId: 'WOZ-007890', verified: true },
  ];

  const filteredAccounts = mockAccounts.filter(acc => 
    acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.accountId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number, curr: 'GS' | 'USD') => {
    if (curr === 'GS') {
      return `Gs ${Math.round(amount).toLocaleString('es-PY')}`;
    }
    return `USD ${amount.toLocaleString('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatInputNumber = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    return parseInt(numericValue).toLocaleString('es-PY');
  };

  const parseInputNumber = (value: string) => {
    return value.replace(/\./g, '').replace(/,/g, '');
  };

  const hasEnoughFunds = (amount: number, curr: 'GS' | 'USD') => {
    if (curr === 'GS') {
      return availableBalance.guaranies >= amount;
    }
    return availableBalance.dollars >= amount;
  };

  const handleTransfer = () => {
    const rawAmount = parseInputNumber(amount);
    const transferAmount = parseFloat(rawAmount);

    if (!selectedAccount || !transferAmount || transferAmount <= 0) {
      alert('Por favor completa todos los campos correctamente');
      return;
    }

    if (!hasEnoughFunds(transferAmount, currency)) {
      alert('Fondos insuficientes para completar la transferencia');
      return;
    }

    setTransferStatus('processing');

    setTimeout(() => {
      // Simulación: 95% éxito
      const success = Math.random() > 0.05;

      if (success && onBalanceUpdate) {
        const newBalance = {
          guaranies: currency === 'GS' ? availableBalance.guaranies - transferAmount : availableBalance.guaranies,
          dollars: currency === 'USD' ? availableBalance.dollars - transferAmount : availableBalance.dollars
        };
        onBalanceUpdate(newBalance);

        // Agregar a transacciones
        if (onTransactionAdd) {
          onTransactionAdd({
            id: Date.now().toString(),
            type: 'transfer_sent',
            date: new Date().toISOString(),
            amount: transferAmount,
            currency,
            recipient: selectedAccount.name,
            recipientId: selectedAccount.accountId,
            note,
            status: 'completed'
          });
        }

        setTransferStatus('success');
      } else {
        setTransferStatus('error');
      }
    }, 2500);
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedAccount(null);
    setAmount('');
    setCurrency('GS');
    setNote('');
    setTransferStatus('idle');
    setSourceAccount(null);
    setShowIntro(true);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleBackToMain = () => {
    setTransferStatus('idle');
  };

  if (!isOpen) return null;

  const getHeaderTitle = () => {
    if (transferStatus === 'success') return 'Transferencia exitosa';
    if (transferStatus === 'error') return 'Transferencia rechazada';
    if (transferStatus === 'processing') return 'Procesando...';
    return 'Transferir dinero';
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header - Siempre visible */}
      <div className="sticky top-0 bg-blue-600 border-b border-blue-700 px-5 py-4 flex items-center justify-between">
        <button
          onClick={() => {
            if (transferStatus === 'success' || transferStatus === 'error') {
              handleBackToMain();
            } else {
              handleClose();
            }
          }}
          className="w-9 h-9 rounded-full hover:bg-blue-700 flex items-center justify-center transition-colors"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        
        <h2 className="text-lg font-semibold text-white">{getHeaderTitle()}</h2>
        
        <button
          onClick={handleClose}
          className="w-9 h-9 rounded-full hover:bg-blue-700 flex items-center justify-center transition-colors"
        >
          <X size={20} className="text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-lg mx-auto p-5">
          {transferStatus === 'idle' && showIntro && (
            <div className="space-y-6 py-8">
              {/* Pantalla de introducción */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-5">
                  <Globe size={40} className="text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Woz Pay to Woz Pay</h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  Envía y recibe dinero de forma instantánea entre usuarios de Woz Payments
                </p>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Globe size={24} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Transferencias globales</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Envía y recibe dinero a cualquier parte del mundo de forma rápida y segura entre usuarios Woz Pay.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Banknote size={24} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Retiros a cuentas bancarias</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Tanto tú como el receptor pueden retirar el dinero a su cuenta bancaria desde cualquier país.
                    </p>
                  </div>
                </div>
              </div>

              {/* Checkbox "No volver a mostrar" */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 font-medium">
                    No volver a mostrar esta pantalla
                  </span>
                </label>
              </div>

              <button
                onClick={() => {
                  if (dontShowAgain) {
                    localStorage.setItem('woz_skip_transfer_intro', 'true');
                  }
                  setShowIntro(false);
                }}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors mt-6"
              >
                Siguiente
              </button>
            </div>
          )}

          {transferStatus === 'idle' && !showIntro && (
            <div className="space-y-5">
              {!selectedAccount ? (
                <>
                  {/* Paso 1: Escoge cuenta a debitar */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Escoge cuenta a debitar</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setSourceAccount('GS');
                          setCurrency('GS');
                        }}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          sourceAccount === 'GS'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">Guaraníes</span>
                          {sourceAccount === 'GS' && (
                            <Check size={16} className="text-blue-600" />
                          )}
                        </div>
                        <p className="text-base font-bold text-gray-900">
                          Gs {availableBalance.guaranies.toLocaleString('es-PY')}
                        </p>
                      </button>

                      <button
                        onClick={() => {
                          setSourceAccount('USD');
                          setCurrency('USD');
                        }}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          sourceAccount === 'USD'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">Dólares</span>
                          {sourceAccount === 'USD' && (
                            <Check size={16} className="text-blue-600" />
                          )}
                        </div>
                        <p className="text-base font-bold text-gray-900">
                          USD {availableBalance.dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Paso 2: Buscar ms contactos */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Buscar más contactos</h3>
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Nombre o ID de cuenta"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none text-sm transition-all"
                      />
                    </div>
                    {searchTerm && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {filteredAccounts.map((account) => (
                          <button
                            key={account.id}
                            onClick={() => setSelectedAccount(account)}
                            className="w-full bg-white border border-gray-200 rounded-xl p-3 hover:border-gray-400 hover:bg-gray-50 transition-all text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <User size={18} className="text-gray-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-sm truncate">{account.name}</p>
                                <p className="text-xs text-gray-500">{account.accountId}</p>
                              </div>
                              {account.verified && (
                                <Check size={14} className="text-gray-900" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Paso 3: Contactos frecuentes */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Contactos frecuentes</h3>
                    <div className="space-y-2.5">
                      {mockAccounts.slice(0, 3).map((account) => (
                        <button
                          key={account.id}
                          onClick={() => setSelectedAccount(account)}
                          className="w-full bg-white border border-gray-200 rounded-xl p-3 hover:border-cyan-400 hover:bg-cyan-50 transition-all text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-cyan-100 flex items-center justify-center">
                              <User size={20} className="text-cyan-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate">{account.name}</p>
                              <p className="text-xs text-gray-500">{account.accountId}</p>
                            </div>
                            {account.verified && (
                              <Check size={14} className="text-cyan-600" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Destinatario seleccionado */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Destinatario</h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center">
                            <User size={18} className="text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{selectedAccount.name}</p>
                            <p className="text-xs text-gray-600">{selectedAccount.accountId}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedAccount(null);
                            setAmount('');
                            setNote('');
                          }}
                          className="text-xs text-gray-600 hover:text-gray-900 font-medium"
                        >
                          Cambiar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Formulario de monto y nota en caja gris */}
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-2 block uppercase tracking-wide">
                        Monto a transferir
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                          {currency === 'GS' ? 'Gs' : 'USD'}
                        </span>
                        <input
                          type="text"
                          placeholder="0"
                          value={amount}
                          onChange={(e) => setAmount(formatInputNumber(e.target.value))}
                          className="w-full pl-14 pr-4 py-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none font-bold text-gray-900 text-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-2 block uppercase tracking-wide">
                        Nota (opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Pago de servicios"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        maxLength={50}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none text-sm"
                      />
                    </div>
                  </div>

                  {/* Resumen dinámico */}
                  <div className="bg-white border-2 border-gray-300 rounded-2xl p-5 space-y-4">
                    <h3 className="text-base font-bold text-gray-900 mb-3">Resumen de transferencia</h3>
                    
                    <div className="space-y-3 text-sm">
                      <div className="pb-3 border-b border-gray-200">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">Emisor</p>
                        <p className="font-semibold text-gray-900">{userName}</p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          Cuenta en {sourceAccount === 'GS' ? 'Guaraníes' : 'Dólares'}
                        </p>
                      </div>

                      <div className="pb-3 border-b border-gray-200">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">Receptor</p>
                        <p className="font-semibold text-gray-900">{selectedAccount.name}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{selectedAccount.accountId}</p>
                      </div>

                      <div className="pb-3 border-b border-gray-200">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">Monto</p>
                        <p className="font-bold text-gray-900 text-lg">
                          {amount 
                            ? formatCurrency(parseFloat(parseInputNumber(amount)) || 0, currency)
                            : `${currency === 'GS' ? 'Gs' : 'USD'} 0`
                          }
                        </p>
                      </div>

                      <div className="pb-3 border-b border-gray-200">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">Fecha y hora</p>
                        <p className="font-medium text-gray-900">
                          {new Date().toLocaleDateString('es-PY', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {new Date().toLocaleTimeString('es-PY', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>

                      {note && (
                        <div className="pb-3 border-b border-gray-200">
                          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">Nota</p>
                          <p className="font-medium text-gray-900">{note}</p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleTransfer}
                      disabled={!amount || parseFloat(parseInputNumber(amount)) <= 0}
                      className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed mt-4"
                    >
                      Confirmar transferencia
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {transferStatus === 'processing' && (
            <div className="py-16 text-center space-y-5">
              <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Procesando transferencia</h3>
                <p className="text-sm text-gray-600">Por favor espera un momento</p>
              </div>
            </div>
          )}

          {transferStatus === 'success' && (
            <div className="space-y-5 py-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Transferencia exitosa</h3>
                <p className="text-sm text-gray-600">
                  El dinero fue enviado correctamente
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                <h4 className="font-semibold text-gray-900 text-sm mb-3">Detalles de la transferencia</h4>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-200">
                    <span className="text-gray-600">Monto enviado</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(parseFloat(parseInputNumber(amount)), currency)}
                    </span>
                  </div>
                  
                  <div className="py-2.5 border-b border-gray-200">
                    <span className="text-gray-600 block mb-1">Destinatario</span>
                    <span className="font-medium text-gray-900">{selectedAccount?.name}</span>
                  </div>
                  
                  <div className="py-2.5 border-b border-gray-200">
                    <span className="text-gray-600 block mb-1">Cuenta</span>
                    <span className="font-medium text-gray-900">{selectedAccount?.accountId}</span>
                  </div>
                  
                  {note && (
                    <div className="py-2.5">
                      <span className="text-gray-600 block mb-1">Nota</span>
                      <span className="font-medium text-gray-900">{note}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Finalizar
              </button>
            </div>
          )}

          {transferStatus === 'error' && (
            <div className="space-y-5 py-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Transferencia rechazada</h3>
                <p className="text-sm text-gray-600">
                  No se pudo completar la operación. Por favor intenta nuevamente.
                </p>
              </div>

              <button
                onClick={handleReset}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Intentar de nuevo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}