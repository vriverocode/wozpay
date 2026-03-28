import { useState } from 'react';
import { X, CreditCard, Wallet, Check, AlertCircle, ArrowLeft } from 'lucide-react';

interface AddBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBalanceUpdate?: (newBalance: { guaranies: number; dollars: number }) => void;
  availableBalance: {
    guaranies: number;
    dollars: number;
  };
  onTransactionAdd?: (transaction: any) => void;
}

export function AddBalanceModal({ isOpen, onClose, availableBalance, onBalanceUpdate, onTransactionAdd }: AddBalanceModalProps) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'GS' | 'USD'>('GS');
  const [loadStatus, setLoadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const formatInputNumber = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    return parseInt(numericValue).toLocaleString('es-PY');
  };

  const parseInputNumber = (value: string) => {
    return value.replace(/\./g, '').replace(/,/g, '');
  };

  const formatCurrency = (amount: number, curr: 'GS' | 'USD') => {
    if (curr === 'GS') {
      return `Gs ${Math.round(amount).toLocaleString('es-PY')}`;
    }
    return `USD ${amount.toLocaleString('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleLoadBalance = () => {
    const rawAmount = parseInputNumber(amount);
    const loadAmount = parseFloat(rawAmount);

    if (!loadAmount || loadAmount <= 0) {
      alert('Por favor completa todos los campos correctamente');
      return;
    }

    setLoadStatus('processing');

    setTimeout(() => {
      // Simulación: 95% éxito
      const success = Math.random() > 0.05;

      if (success && onBalanceUpdate) {
        const newBalance = {
          guaranies: currency === 'GS' ? availableBalance.guaranies + loadAmount : availableBalance.guaranies,
          dollars: currency === 'USD' ? availableBalance.dollars + loadAmount : availableBalance.dollars
        };
        onBalanceUpdate(newBalance);

        // Agregar a transacciones
        if (onTransactionAdd) {
          onTransactionAdd({
            id: Date.now().toString(),
            type: 'balance_loaded',
            date: new Date().toISOString(),
            amount: loadAmount,
            currency,
            method: 'Tarjeta',
            status: 'completed'
          });
        }

        setLoadStatus('success');
      } else {
        setLoadStatus('error');
      }
    }, 2500);
  };

  const handleReset = () => {
    setAmount('');
    setCurrency('GS');
    setLoadStatus('idle');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  const getHeaderTitle = () => {
    if (loadStatus === 'success') return 'Carga exitosa';
    if (loadStatus === 'error') return 'Carga rechazada';
    if (loadStatus === 'processing') return 'Procesando...';
    return 'Cargar saldo';
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-blue-600 border-b border-blue-700 px-5 py-4 flex items-center justify-between">
        <button
          onClick={() => {
            if (loadStatus === 'success' || loadStatus === 'error') {
              handleReset();
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
        <div className="max-w-lg mx-auto p-5 space-y-5">
          {loadStatus === 'idle' && (
            <>
              {/* Método seleccionado */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CreditCard size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Método de pago</p>
                    <p className="font-semibold text-gray-900 text-sm">Tarjeta de débito/crédito</p>
                  </div>
                </div>
              </div>

              {/* Monto */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">Monto a cargar</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-medium text-sm">
                    {currency === 'GS' ? 'Gs' : 'USD'}
                  </span>
                  <input
                    type="text"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(formatInputNumber(e.target.value))}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none font-semibold text-gray-900 text-lg"
                  />
                </div>
                
                {/* Seleccionar moneda - versión discreta */}
                <div className="flex items-center gap-4 pt-1">
                  <button
                    onClick={() => setCurrency('GS')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                      currency === 'GS'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      currency === 'GS' ? 'border-green-600' : 'border-gray-300'
                    }`}>
                      {currency === 'GS' && <div className="w-2 h-2 rounded-full bg-green-600" />}
                    </div>
                    <span className="text-sm font-medium">Guaraníes</span>
                  </button>
                  <button
                    onClick={() => setCurrency('USD')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                      currency === 'USD'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      currency === 'USD' ? 'border-green-600' : 'border-gray-300'
                    }`}>
                      {currency === 'USD' && <div className="w-2 h-2 rounded-full bg-green-600" />}
                    </div>
                    <span className="text-sm font-medium">Dólares</span>
                  </button>
                </div>
              </div>

              {/* Botón cargar */}
              <button
                onClick={handleLoadBalance}
                disabled={!amount || parseFloat(parseInputNumber(amount)) <= 0}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
              >
                <Wallet size={20} />
                Cargar saldo ahora
              </button>
            </>
          )}

          {loadStatus === 'processing' && (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <h3 className="text-lg font-bold text-gray-900">Procesando carga...</h3>
              <p className="text-sm text-gray-600">Por favor espera un momento</p>
            </div>
          )}

          {loadStatus === 'success' && (
            <div className="space-y-4">
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5 text-center">
                <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-3">
                  <Check size={28} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-green-900 mb-1">¡Saldo cargado exitosamente!</h3>
                <p className="text-xs text-green-700">
                  El saldo fue acreditado en tu wallet
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5">
                <h4 className="font-bold text-gray-900 text-sm">Detalles de la carga</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monto cargado:</span>
                    <span className="font-semibold text-green-600">
                      + {formatCurrency(parseFloat(parseInputNumber(amount)), currency)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 space-y-1.5">
                    <p className="text-gray-700">
                      <span className="font-semibold">Método:</span> Tarjeta
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Nuevo saldo:</span> {formatCurrency(
                        currency === 'GS' 
                          ? availableBalance.guaranies + parseFloat(parseInputNumber(amount))
                          : availableBalance.dollars + parseFloat(parseInputNumber(amount)),
                        currency
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-colors"
              >
                Finalizar
              </button>
            </div>
          )}

          {loadStatus === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 text-center">
                <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle size={28} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-red-900 mb-1">Carga rechazada</h3>
                <p className="text-xs text-red-700">
                  No se pudo completar la operación. Intenta nuevamente.
                </p>
              </div>

              <button
                onClick={handleReset}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-colors"
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