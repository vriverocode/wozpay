import { X, TrendingUp, Calendar, Coins, AlertTriangle, Building2, ArrowDownToLine, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface ActiveSaving {
  id: string;
  amount: number;
  term: number;
  earnings: number;
  totalReturn: number;
  startDate: string;
  endDate: string;
  monthsRemaining: number;
}

interface ActiveSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  saving: ActiveSaving | null;
  onWithdraw: (savingId: string, withdrawalAmount: number) => void;
}

export function ActiveSavingsModal({
  isOpen,
  onClose,
  saving,
  onWithdraw
}: ActiveSavingsModalProps) {
  const [showWithdrawalFlow, setShowWithdrawalFlow] = useState(false);
  const [selectedBankAccount, setSelectedBankAccount] = useState('');

  if (!isOpen || !saving) return null;

  // Función para formatear números con separadores de miles
  const formatNumber = (value: number): string => {
    return value.toLocaleString('es-PY');
  };

  // Calcular penalizaciones
  const adminFee = saving.amount * 0.15; // 15% gastos administrativos
  const commission = saving.amount * 0.10; // 10% comisión sobre monto
  const earlyWithdrawalFee = saving.amount * 0.08; // 8% comisión por retiro anticipado
  const totalPenalties = adminFee + commission + earlyWithdrawalFee;
  const withdrawalAmount = saving.amount - totalPenalties;

  const progressPercentage = ((saving.term - saving.monthsRemaining) / saving.term) * 100;

  const handleConfirmWithdrawal = () => {
    if (!selectedBankAccount) {
      alert('Selecciona una cuenta bancaria');
      return;
    }
    
    onWithdraw(saving.id, withdrawalAmount);
    setShowWithdrawalFlow(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0">
      <div className="bg-white w-full h-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6 relative flex-shrink-0">
          <button
            onClick={() => {
              setShowWithdrawalFlow(false);
              onClose();
            }}
            className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <button
            onClick={() => {
              setShowWithdrawalFlow(false);
              onClose();
            }}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          
          <h2 className="text-2xl font-bold mb-1">
            {showWithdrawalFlow ? 'Retiro Anticipado' : 'Tu Ahorro Programado'}
          </h2>
          <p className="text-green-100 text-sm">
            {showWithdrawalFlow ? 'Información sobre penalizaciones' : 'Estado actual de tu inversión'}
          </p>
        </div>

        {!showWithdrawalFlow ? (
          <>
            {/* Content - Vista principal */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="max-w-2xl mx-auto space-y-4">
                {/* Card principal con monto */}
                <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg p-4 text-white shadow-sm">
                  <p className="text-xs text-green-100 mb-1">Monto invertido</p>
                  <p className="text-2xl mb-3">{formatNumber(saving.amount)} Gs</p>
                  
                  <div className="bg-white/20 rounded-md p-3">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs">Progreso</span>
                      <span className="text-xs">{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-white/30 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-white h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Información del plazo */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <h3 className="text-sm text-gray-900 mb-3">
                    Información del plazo
                  </h3>

                  <div className="space-y-0 divide-y divide-gray-200">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-600">Fecha de inicio</span>
                      <span className="text-sm text-gray-900">{saving.startDate}</span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-600">Fecha de finalización</span>
                      <span className="text-sm text-gray-900">{saving.endDate}</span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-600">Meses restantes</span>
                      <span className="text-sm text-green-700">{saving.monthsRemaining} de {saving.term} meses</span>
                    </div>
                  </div>
                </div>

                {/* Proyección de ganancias */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <h3 className="text-sm text-gray-900 mb-3">
                    Proyección al finalizar
                  </h3>

                  <div className="space-y-0 divide-y divide-gray-200">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-600">Monto invertido</span>
                      <span className="text-sm text-gray-900">{formatNumber(saving.amount)} Gs</span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-600">Ganancias estimadas</span>
                      <span className="text-sm text-green-700">+{formatNumber(saving.earnings)} Gs</span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-900">Total a recibir</span>
                      <span className="text-sm text-green-700">{formatNumber(saving.totalReturn)} Gs</span>
                    </div>
                  </div>
                </div>

                {/* Nota informativa */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <Coins className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-blue-900 leading-relaxed">
                      Tu dinero está generando ganancias de forma automática. Al finalizar el plazo, el monto completo estará disponible en tu cuenta.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
              <button
                onClick={() => setShowWithdrawalFlow(true)}
                className="w-full bg-gray-600 text-white py-3.5 rounded-xl font-semibold hover:bg-gray-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <ArrowDownToLine size={20} />
                Solicitar retiro anticipado
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Content - Flujo de retiro */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="max-w-2xl mx-auto space-y-4">
                {/* Advertencia principal */}
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="text-gray-600 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                      <h3 className="text-sm text-gray-900 mb-1">
                        Retiro Anticipado
                      </h3>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        Al retirar tu dinero antes del plazo acordado, se aplicarán las siguientes penalizaciones sobre el monto invertido.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cálculo de penalizaciones */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <h3 className="text-sm text-gray-900 mb-3">
                    Detalle de penalizaciones
                  </h3>

                  <div className="space-y-0 divide-y divide-gray-200">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-600">Monto invertido</span>
                      <span className="text-sm text-gray-900">{formatNumber(saving.amount)} Gs</span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-600">Gastos administrativos (15%)</span>
                      <span className="text-sm text-gray-700">-{formatNumber(adminFee)} Gs</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-600">Comisión sobre monto (10%)</span>
                      <span className="text-sm text-gray-700">-{formatNumber(commission)} Gs</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-600">Comisión retiro anticipado (8%)</span>
                      <span className="text-sm text-gray-700">-{formatNumber(earlyWithdrawalFee)} Gs</span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-900">Total de penalizaciones</span>
                      <span className="text-sm text-gray-900">-{formatNumber(totalPenalties)} Gs</span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-900">Saldo total a retirar</span>
                      <span className="text-sm text-gray-900">{formatNumber(withdrawalAmount)} Gs</span>
                    </div>
                  </div>
                </div>

                {/* Cuenta bancaria de destino */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                  <h3 className="font-bold text-gray-900 text-base mb-4">
                    Cuenta bancaria de destino
                  </h3>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setSelectedBankAccount('itau-123')}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                        selectedBankAccount === 'itau-123'
                          ? 'bg-green-50 border-2 border-green-500'
                          : 'bg-white border-2 border-gray-300 hover:border-green-300'
                      }`}
                    >
                      <Building2 className={selectedBankAccount === 'itau-123' ? 'text-green-600' : 'text-gray-400'} size={24} />
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-sm text-gray-900">
                          Banco Itaú
                        </p>
                        <p className="text-xs text-gray-600">
                          Cuenta corriente •••• 1234
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedBankAccount('continental-456')}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                        selectedBankAccount === 'continental-456'
                          ? 'bg-green-50 border-2 border-green-500'
                          : 'bg-white border-2 border-gray-300 hover:border-green-300'
                      }`}
                    >
                      <Building2 className={selectedBankAccount === 'continental-456' ? 'text-green-600' : 'text-gray-400'} size={24} />
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-sm text-gray-900">
                          Banco Continental
                        </p>
                        <p className="text-xs text-gray-600">
                          Caja de ahorro •••• 5678
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Advertencia final */}
                <div className="bg-gray-50 border border-gray-300 rounded-xl p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-semibold">Atención:</span> Esta acción no se puede deshacer. Una vez confirmado el retiro, las penalizaciones se aplicarán inmediatamente y perderás las ganancias acumuladas.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-white space-y-3 flex-shrink-0">
              <button
                onClick={() => setShowWithdrawalFlow(false)}
                className="w-full bg-white text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all border-2 border-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmWithdrawal}
                disabled={!selectedBankAccount}
                className="w-full bg-green-600 text-white py-3.5 rounded-xl font-semibold hover:bg-green-700 transition-all shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Confirmar retiro anticipado
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}