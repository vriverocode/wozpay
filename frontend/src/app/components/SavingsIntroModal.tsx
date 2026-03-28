import { X, TrendingUp, Shield, Coins, Calculator, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SavingsIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export function SavingsIntroModal({ isOpen, onClose, onContinue }: SavingsIntroModalProps) {
  const [calculatorAmount, setCalculatorAmount] = useState('5.000.000');
  const [calculatorTerm, setCalculatorTerm] = useState(12);
  const [estimatedEarnings, setEstimatedEarnings] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Check localStorage for intro preference
  const getInitialView = () => {
    try {
      const hideIntro = localStorage.getItem('woz_savings_hide_intro');
      return hideIntro === 'true';
    } catch {
      return false;
    }
  };

  // Reset checkbox when modal opens and auto-continue if preference is set
  useEffect(() => {
    if (isOpen) {
      setDontShowAgain(false);
      // If user has set to hide intro, auto-continue
      if (getInitialView()) {
        onContinue();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleContinue = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('woz_savings_hide_intro', 'true');
      } catch (error) {
        console.error('Error saving preference:', error);
      }
    }
    onContinue();
  };

  // Función para formatear números con separadores de miles
  const formatNumber = (value: number): string => {
    return value.toLocaleString('es-PY');
  };

  // Función para parsear el input del usuario
  const parseFormattedNumber = (value: string): number => {
    return parseInt(value.replace(/\./g, '').replace(/,/g, '')) || 0;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseFormattedNumber(value);
    setCalculatorAmount(numericValue > 0 ? formatNumber(numericValue) : '');
  };

  // Calcular ganancias estimadas
  useEffect(() => {
    const amount = parseFormattedNumber(calculatorAmount);
    if (amount > 0) {
      // Tasa total según plazo (no anualizada)
      let totalRate = 0;
      
      if (calculatorTerm < 12) {
        // Menos de 12 meses: progresión de 2% a 10%
        // Interpolación lineal: 2% + (10% - 2%) * (meses / 12)
        totalRate = 0.02 + (0.10 - 0.02) * (calculatorTerm / 12);
      } else if (calculatorTerm === 12) {
        totalRate = 0.25; // 25% para 12 meses
      } else {
        // 12 meses en adelante: de 25% a 90% en 60 meses
        // Interpolación lineal: 25% + (90% - 25%) * ((meses - 12) / (60 - 12))
        const progressBeyond12 = Math.min((calculatorTerm - 12) / (60 - 12), 1);
        totalRate = 0.25 + (0.90 - 0.25) * progressBeyond12;
      }
      
      const earnings = amount * totalRate;
      
      setEstimatedEarnings(Math.round(earnings));
    } else {
      setEstimatedEarnings(0);
    }
  }, [calculatorAmount, calculatorTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0">
      <div className="bg-white w-full h-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6 relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          
          <h2 className="text-2xl font-bold mb-1">
            Ahorro Programado
          </h2>
          <p className="text-green-100 text-sm">
            Haz rendir tu dinero con Woz Payments
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Introducción */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                ¿Qué es el Ahorro Programado?
              </h3>
              <p className="text-gray-700 text-base leading-relaxed text-center mb-6">
                Es una forma inteligente de hacer crecer tu dinero. Depositas un monto, lo mantienes por un tiempo determinado, y al final recibes tu dinero original más ganancias adicionales.
              </p>
              
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <p className="text-gray-900 font-semibold text-center text-base">
                  Tu dinero trabaja para ti mientras ahorras
                </p>
              </div>
            </div>

            {/* Pasos - Cómo funciona */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-5 text-center">
                ¿Cómo hacer rendir tu dinero?
              </h3>
              
              <div className="space-y-5">
                {/* Paso 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-700 font-bold text-lg">1</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">Elige cuánto quieres ahorrar</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Desde 500.000 Gs puedes empezar. Tú decides el monto que quieres invertir.
                    </p>
                  </div>
                </div>

                {/* Paso 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-700 font-bold text-lg">2</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">Define el plazo</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Elige por cuánto tiempo quieres mantener tu ahorro: desde 3 hasta 60 meses.
                    </p>
                  </div>
                </div>

                {/* Paso 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-700 font-bold text-lg">3</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">Tu dinero crece automáticamente</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      No necesitas hacer nada más. Tu ahorro genera ganancias todos los meses.
                    </p>
                  </div>
                </div>

                {/* Paso 4 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-700 font-bold text-lg">4</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">Recibe tu dinero más ganancias</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Al finalizar el plazo, recibes todo: tu ahorro original más las ganancias generadas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Beneficios */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                ¿Por qué elegir Ahorro Programado?
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <TrendingUp className="text-green-600 flex-shrink-0 mt-0.5" size={24} />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Ganancias garantizadas</h4>
                    <p className="text-sm text-gray-600">
                      Tu dinero crece de manera predecible y segura
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Shield className="text-green-600 flex-shrink-0 mt-0.5" size={24} />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">100% seguro</h4>
                    <p className="text-sm text-gray-600">
                      Tu ahorro está protegido en todo momento
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Coins className="text-green-600 flex-shrink-0 mt-0.5" size={24} />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Flexible y accesible</h4>
                    <p className="text-sm text-gray-600">
                      Comienza con poco y elige el plazo que más te convenga
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculadora */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-base text-gray-900 mb-4">
                Calcula tus ganancias
              </h3>

              <div className="space-y-4">
                {/* Monto */}
                <div>
                  <label className="block text-xs text-gray-700 mb-2">
                    Monto a ahorrar
                  </label>
                  <input
                    type="text"
                    placeholder="0"
                    value={calculatorAmount}
                    onChange={handleAmountChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none bg-white text-sm text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Mínimo: 500.000 Gs
                  </p>
                </div>

                {/* Plazo */}
                <div>
                  <label className="block text-xs text-gray-700 mb-2">
                    Plazo
                  </label>
                  <select
                    value={calculatorTerm}
                    onChange={(e) => setCalculatorTerm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none bg-white text-sm text-gray-900"
                  >
                    <option value={3}>3 meses</option>
                    <option value={6}>6 meses</option>
                    <option value={12}>12 meses</option>
                    <option value={18}>18 meses</option>
                    <option value={24}>24 meses</option>
                    <option value={36}>36 meses</option>
                    <option value={48}>48 meses</option>
                    <option value={60}>60 meses</option>
                  </select>
                </div>

                {/* Resultado */}
                <div className="bg-gray-50 rounded-lg p-3 mt-4 border border-gray-200">
                  <h4 className="text-xs text-gray-700 mb-3">Proyección</h4>
                  
                  <div className="space-y-0 divide-y divide-gray-200">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-600">Tu ahorro</span>
                      <span className="text-sm text-gray-900">{calculatorAmount} Gs</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-600">Ganancias</span>
                      <span className="text-sm text-green-700">+{formatNumber(estimatedEarnings)} Gs</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-900">Total a recibir</span>
                      <span className="text-sm text-green-700">{formatNumber(parseFormattedNumber(calculatorAmount) + estimatedEarnings)} Gs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Nota informativa */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="font-semibold">Nota:</span> Las ganancias mostradas son estimaciones. El rendimiento final puede variar según el plazo elegido y las condiciones del mercado.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0 space-y-3">
          <label className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
            />
            <span className="text-sm text-gray-700">No volver a mostrar este mensaje</span>
          </label>

          <button
            onClick={handleContinue}
            className="w-full bg-green-600 text-white py-3.5 rounded-xl font-semibold hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
          >
            Comenzar mi ahorro programado
          </button>
        </div>
      </div>
    </div>
  );
}