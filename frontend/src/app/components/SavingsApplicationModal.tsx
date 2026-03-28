import { useState, useEffect } from 'react';
import { X, Calculator, CreditCard, Building2, Wallet, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';

interface LinkedCard {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cardType: 'visa' | 'mastercard' | 'amex' | 'oro';
  isValidated: boolean;
}

interface SavingsApplication {
  amount: number;
  term: number;
  paymentMethod: 'transfer' | 'card' | 'balance';
  selectedCard?: string;
  earnings: number;
  totalReturn: number;
  acceptedTerms: boolean;
}

interface SavingsApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkedCards: LinkedCard[];
  availableBalance: number;
  onSubmit: (application: SavingsApplication) => void;
  currentMembership?: 'gratuito' | 'emprendedor' | 'empresario';
  onRequireUpgrade?: (featureName: string) => void;
}

export function SavingsApplicationModal({
  isOpen,
  onClose,
  linkedCards,
  availableBalance,
  onSubmit,
  currentMembership,
  onRequireUpgrade
}: SavingsApplicationModalProps) {
  const [step, setStep] = useState<'form' | 'summary' | 'loading' | 'success'>('form');
  const [amountDisplay, setAmountDisplay] = useState('5.000.000');
  const [formData, setFormData] = useState<SavingsApplication>({
    amount: 5000000,
    term: 12,
    paymentMethod: 'balance',
    selectedCard: linkedCards.find(c => c.isValidated)?.id || '',
    earnings: 0,
    totalReturn: 0,
    acceptedTerms: false
  });

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
    
    setFormData(prev => ({ ...prev, amount: numericValue }));
    setAmountDisplay(numericValue > 0 ? formatNumber(numericValue) : '');
  };

  // Calcular ganancias
  useEffect(() => {
    if (formData.amount >= 500000 && formData.term > 0) {
      // Tasa total según plazo (no anualizada)
      let totalRate = 0;
      
      if (formData.term < 12) {
        // Menos de 12 meses: progresión de 2% a 10%
        // Interpolación lineal: 2% + (10% - 2%) * (meses / 12)
        totalRate = 0.02 + (0.10 - 0.02) * (formData.term / 12);
      } else if (formData.term === 12) {
        totalRate = 0.25; // 25% para 12 meses
      } else {
        // 12 meses en adelante: de 25% a 90% en 60 meses
        // Interpolación lineal: 25% + (90% - 25%) * ((meses - 12) / (60 - 12))
        const progressBeyond12 = Math.min((formData.term - 12) / (60 - 12), 1);
        totalRate = 0.25 + (0.90 - 0.25) * progressBeyond12;
      }
      
      const earnings = formData.amount * totalRate;
      const totalReturn = formData.amount + earnings;
      
      setFormData(prev => ({
        ...prev,
        earnings: Math.round(earnings),
        totalReturn: Math.round(totalReturn)
      }));
    }
  }, [formData.amount, formData.term]);

  const handleSubmit = () => {
    if (currentMembership === 'gratuito') {
      onRequireUpgrade?.('Ahorro programado');
      return;
    }

    if (formData.amount < 500000) {
      alert('El monto mínimo es 500.000 Gs');
      return;
    }
    if (!formData.acceptedTerms) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }
    if (formData.paymentMethod === 'balance' && formData.amount > availableBalance) {
      alert('Saldo insuficiente');
      return;
    }
    if (formData.paymentMethod === 'card' && !formData.selectedCard) {
      alert('Selecciona una tarjeta');
      return;
    }
    
    setStep('summary');
  };

  const handleConfirm = () => {
    setStep('loading');
    
    setTimeout(() => {
      onSubmit(formData);
      setStep('success');
    }, 2000);
  };

  const handleCloseSuccess = () => {
    onClose();
    setStep('form');
    setFormData({
      amount: 5000000,
      term: 12,
      paymentMethod: 'balance',
      selectedCard: linkedCards.find(c => c.isValidated)?.id || '',
      earnings: 0,
      totalReturn: 0,
      acceptedTerms: false
    });
    setAmountDisplay('5.000.000');
  };

  if (!isOpen) return null;

  const validatedCards = linkedCards.filter(card => card.isValidated);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0">
      <div className="bg-gray-50 w-full h-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6 relative flex-shrink-0">
          {/* Botón Back - siempre visible */}
          <button
            onClick={() => {
              if (step === 'summary') {
                setStep('form');
              } else if (step === 'loading' || step === 'success') {
                // No hacer nada durante loading o success
                return;
              } else {
                onClose();
              }
            }}
            className={`absolute top-4 left-4 text-white/80 hover:text-white transition-colors ${
              step === 'loading' || step === 'success' ? 'opacity-0 pointer-events-none' : ''
            }`}
          >
            <ArrowLeft size={24} />
          </button>

          {/* Botón Close */}
          <button
            onClick={() => {
              if (step === 'summary') {
                setStep('form');
              } else if (step === 'loading' || step === 'success') {
                return;
              } else {
                onClose();
              }
            }}
            className={`absolute top-4 right-4 text-white/80 hover:text-white transition-colors ${
              step === 'loading' || step === 'success' ? 'opacity-0 pointer-events-none' : ''
            }`}
          >
            <X size={24} />
          </button>
          
          <h2 className="text-2xl font-bold mb-1">
            {step === 'form' 
              ? 'Crear Ahorro Programado' 
              : step === 'summary'
              ? 'Resumen de tu Ahorro'
              : step === 'loading'
              ? 'Procesando'
              : '¡Ahorro Creado!'}
          </h2>
          <p className="text-green-100 text-sm">
            {step === 'form' 
              ? 'Completa los datos para comenzar' 
              : step === 'summary'
              ? 'Verifica tu información antes de confirmar'
              : step === 'loading'
              ? 'Estamos creando tu ahorro programado...'
              : 'Tu ahorro programado está activo'}
          </p>
        </div>

        {step === 'form' ? (
          <>
            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Monto a invertir */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-900 text-base mb-4">
                  Monto a invertir
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ¿Cuánto quieres invertir? <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="0"
                    value={amountDisplay}
                    onChange={handleAmountChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none bg-white text-lg font-semibold"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Mínimo: 500.000 Gs
                  </p>
                </div>

                {formData.amount >= 500000 && (
                  <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <h4 className="text-xs text-gray-700 mb-3">Proyección</h4>
                    
                    <div className="space-y-0 divide-y divide-gray-200">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-xs text-gray-600">Tu ahorro</span>
                        <span className="text-sm text-gray-900">{amountDisplay} Gs</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-xs text-gray-600">Ganancias</span>
                        <span className="text-sm text-green-700">+{formatNumber(formData.earnings)} Gs</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-xs text-gray-900">Total a recibir</span>
                        <span className="text-sm text-green-700">{formatNumber(formData.totalReturn)} Gs</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Plazo */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-900 text-base mb-4">
                  Plazo de inversión
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ¿Por cuánto tiempo? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.term}
                    onChange={(e) => setFormData(prev => ({ ...prev, term: Number(e.target.value) }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none bg-white"
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
              </div>

              {/* Método de pago */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-900 text-base mb-4">
                  Método de pago
                </h3>

                <div className="space-y-3">
                  {/* Saldo disponible */}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'balance' }))}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                      formData.paymentMethod === 'balance'
                        ? 'bg-green-50 border-2 border-green-500'
                        : 'bg-white border-2 border-gray-300 hover:border-green-300'
                    }`}
                  >
                    <Wallet className={formData.paymentMethod === 'balance' ? 'text-green-600' : 'text-gray-400'} size={24} />
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm text-gray-900">
                        Saldo disponible
                      </p>
                      <p className="text-xs text-gray-600">
                        Disponible: {formatNumber(availableBalance)} Gs
                      </p>
                    </div>
                    {formData.paymentMethod === 'balance' && (
                      <CheckCircle className="text-green-600" size={20} />
                    )}
                  </button>

                  {/* Transferencia bancaria */}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'transfer' }))}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                      formData.paymentMethod === 'transfer'
                        ? 'bg-green-50 border-2 border-green-500'
                        : 'bg-white border-2 border-gray-300 hover:border-green-300'
                    }`}
                  >
                    <Building2 className={formData.paymentMethod === 'transfer' ? 'text-green-600' : 'text-gray-400'} size={24} />
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm text-gray-900">
                        Transferencia bancaria
                      </p>
                      <p className="text-xs text-gray-600">
                        Desde tu cuenta bancaria
                      </p>
                    </div>
                    {formData.paymentMethod === 'transfer' && (
                      <CheckCircle className="text-green-600" size={20} />
                    )}
                  </button>

                  {/* Tarjeta de crédito */}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'card' }))}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                      formData.paymentMethod === 'card'
                        ? 'bg-green-50 border-2 border-green-500'
                        : 'bg-white border-2 border-gray-300 hover:border-green-300'
                    }`}
                  >
                    <CreditCard className={formData.paymentMethod === 'card' ? 'text-green-600' : 'text-gray-400'} size={24} />
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm text-gray-900">
                        Tarjeta de crédito
                      </p>
                      <p className="text-xs text-gray-600">
                        Usa una de tus tarjetas vinculadas
                      </p>
                    </div>
                    {formData.paymentMethod === 'card' && (
                      <CheckCircle className="text-green-600" size={20} />
                    )}
                  </button>
                </div>

                {/* Selección de tarjeta si eligió card */}
                {formData.paymentMethod === 'card' && validatedCards.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Selecciona tu tarjeta
                    </label>
                    <div className="space-y-2">
                      {validatedCards.map((card) => (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, selectedCard: card.id }))}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                            formData.selectedCard === card.id
                              ? 'bg-green-50 border-2 border-green-400'
                              : 'bg-gray-50 border-2 border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <CreditCard className={formData.selectedCard === card.id ? 'text-green-600' : 'text-gray-400'} size={20} />
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-sm text-gray-900">
                              •••• •••• ••• {card.cardNumber.slice(-4)}
                            </p>
                            <p className="text-xs text-gray-600">
                              {card.cardHolder}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Validación de saldo */}
                {formData.paymentMethod === 'balance' && formData.amount > availableBalance && (
                  <div className="mt-4 bg-gray-50 border border-gray-300 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="text-gray-600 flex-shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-gray-700">
                      Saldo insuficiente. Necesitas {formatNumber(formData.amount - availableBalance)} Gs más.
                    </p>
                  </div>
                )}
              </div>

              {/* Términos y condiciones */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-900 text-base mb-4">
                  Términos y condiciones
                </h3>

                <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-40 overflow-y-auto text-xs text-gray-700 leading-relaxed space-y-2">
                  <p>• El monto invertido quedará bloqueado durante todo el plazo seleccionado.</p>
                  <p>• Las ganancias se calculan mensualmente y se acreditan al finalizar el plazo.</p>
                  <p>• El retiro anticipado está sujeto a penalizaciones.</p>
                  <p>• Woz Payments se reserva el derecho de modificar las tasas según condiciones del mercado.</p>
                  <p>• Esta inversión no constituye un depósito bancario y no está cubierta por garantía estatal.</p>
                  <p>• Al confirmar, aceptas todos los términos y condiciones del servicio.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, acceptedTerms: !prev.acceptedTerms }))}
                  className="flex items-center gap-3"
                >
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                    formData.acceptedTerms 
                      ? 'bg-green-600 border-green-600' 
                      : 'bg-white border-gray-300'
                  }`}>
                    {formData.acceptedTerms && (
                      <CheckCircle className="text-white" size={16} />
                    )}
                  </div>
                  <span className="text-sm text-gray-700">
                    Acepto los <span className="font-semibold text-green-600">términos y condiciones</span>
                  </span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
              <button
                onClick={handleSubmit}
                disabled={
                  formData.amount < 500000 ||
                  !formData.acceptedTerms ||
                  (formData.paymentMethod === 'balance' && formData.amount > availableBalance) ||
                  (formData.paymentMethod === 'card' && !formData.selectedCard)
                }
                className="w-full bg-green-600 text-white py-3.5 rounded-xl font-semibold hover:bg-green-700 transition-all shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Revisar y confirmar
              </button>
            </div>
          </>
        ) : step === 'summary' ? (
          <>
            {/* Summary Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
              <div className="max-w-2xl mx-auto space-y-4">
                {/* Resumen del ahorro */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <h3 className="text-sm text-gray-900 mb-3">
                    Resumen de tu Ahorro Programado
                  </h3>

                  <div className="space-y-0 divide-y divide-gray-200">
                    {/* Monto invertido */}
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-600">Monto a invertir</span>
                      <span className="text-sm text-gray-900">{formatNumber(formData.amount)} Gs</span>
                    </div>

                    {/* Plazo */}
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-600">Plazo</span>
                      <span className="text-sm text-gray-900">{formData.term} meses</span>
                    </div>

                    {/* Ganancias estimadas */}
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-600">Ganancias estimadas</span>
                      <span className="text-sm text-green-700">+{formatNumber(formData.earnings)} Gs</span>
                    </div>

                    {/* Total a recibir */}
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-900">Total a recibir</span>
                      <span className="text-sm text-green-700">{formatNumber(formData.totalReturn)} Gs</span>
                    </div>

                    {/* Método de pago */}
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-600">Método de pago</span>
                      <div className="flex items-center gap-2">
                        {formData.paymentMethod === 'balance' && (
                          <>
                            <Wallet className="text-green-600" size={16} />
                            <span className="text-sm text-gray-900">Saldo disponible</span>
                          </>
                        )}
                        {formData.paymentMethod === 'transfer' && (
                          <>
                            <Building2 className="text-green-600" size={16} />
                            <span className="text-sm text-gray-900">Transferencia bancaria</span>
                          </>
                        )}
                        {formData.paymentMethod === 'card' && (
                          <>
                            <CreditCard className="text-green-600" size={16} />
                            <span className="text-sm text-gray-900">
                              •••• {linkedCards.find(c => c.id === formData.selectedCard)?.cardNumber.slice(-4)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nota informativa */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Tu inversión quedará bloqueada durante {formData.term} meses. Al finalizar el plazo, recibirás tu inversión más las ganancias generadas.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-white space-y-3 flex-shrink-0">
              <button
                onClick={() => setStep('form')}
                className="w-full bg-white text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all border-2 border-gray-300"
              >
                Volver a editar
              </button>
              <button
                onClick={handleConfirm}
                className="w-full bg-green-600 text-white py-3.5 rounded-xl font-semibold hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
              >
                Confirmar ahorro programado
              </button>
            </div>
          </>
        ) : step === 'loading' ? (
          <>
            {/* Loading Content */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-100">
              <div className="text-center">
                <div className="mb-6 flex justify-center">
                  <Loader2 className="w-16 h-16 text-green-600 animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Creando tu ahorro programado
                </h3>
                <p className="text-gray-600 text-sm max-w-sm mx-auto">
                  Estamos procesando tu inversión. Esto tomará solo unos segundos...
                </p>
              </div>
            </div>
          </>
        ) : step === 'success' ? (
          <>
            {/* Success Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-gray-100 flex items-center justify-center">
              <div className="text-center max-w-md mx-auto my-auto">
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  ¡Ahorro programado creado!
                </h3>
                <p className="text-gray-600 text-base mb-6 leading-relaxed">
                  Tu inversión de <span className="font-bold">{formatNumber(formData.amount)} Gs</span> está activa y generando ganancias.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-6">
                  <p className="text-xs text-gray-700 mb-3">
                    Detalles de tu inversión
                  </p>
                  <div className="space-y-0 divide-y divide-gray-200">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-600">Plazo</span>
                      <span className="text-sm text-gray-900">{formData.term} meses</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-600">Ganancias estimadas</span>
                      <span className="text-sm text-green-700">+{formatNumber(formData.earnings)} Gs</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-900">Total a recibir</span>
                      <span className="text-sm text-green-700">{formatNumber(formData.totalReturn)} Gs</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Puedes consultar el estado de tu ahorro en cualquier momento</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
              <button
                onClick={handleCloseSuccess}
                className="w-full bg-green-600 text-white py-3.5 rounded-xl font-semibold hover:bg-green-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                Entendido
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}