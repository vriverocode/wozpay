import { useState, useEffect } from 'react';
import { X, Calculator, CreditCard, AlertCircle, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';

interface LinkedCard {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cardType: 'visa' | 'mastercard' | 'amex' | 'oro';
  isValidated: boolean;
}

interface LoanApplication {
  fullName: string;
  idNumber: string;
  country: string;
  whatsapp: string;
  occupation: string;
  salary: number;
  taxType: 'IVA' | 'IPS' | '';
  address: string;
  street1: string;
  street2: string;
  houseNumber: string;
  unitType: 'casa' | 'departamento' | '';
  reference: string;
  neighborhood: string;
  city: string;
  loanAmount: number;
  term: number;
  monthlyPayment: number;
  selectedCard?: string;
}

interface LoanApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userIdNumber: string;
  linkedCards: LinkedCard[];
  onOpenCardModal: () => void;
  onSubmit: (application: LoanApplication) => void;
  hasPendingLoan?: boolean;
}

export function LoanApplicationModal({
  isOpen,
  onClose,
  userName,
  userIdNumber,
  linkedCards,
  onOpenCardModal,
  onSubmit,
  hasPendingLoan = false
}: LoanApplicationModalProps) {
  const [step, setStep] = useState<'form' | 'summary' | 'loading' | 'success'>('form');
  const [showCalculation, setShowCalculation] = useState(false);
  const [loanAmountDisplay, setLoanAmountDisplay] = useState('15.000.000');
  const [salaryDisplay, setSalaryDisplay] = useState('4.500.000');
  const [isPlatformDriver, setIsPlatformDriver] = useState(true);

  const [formData, setFormData] = useState<LoanApplication>({
    fullName: userName,
    idNumber: userIdNumber,
    country: 'Paraguay',
    whatsapp: '+595 981 234567',
    occupation: 'Conductor de plataforma (Uber/Bolt)',
    salary: 4500000,
    taxType: 'IPS',
    address: '',
    street1: 'Avda. Eusebio Ayala',
    street2: 'Capitán Rivas',
    houseNumber: '1234',
    unitType: 'casa',
    reference: 'Frente a la farmacia San Roque',
    neighborhood: 'Barrio Obrero',
    city: 'Asunción',
    loanAmount: 15000000,
    term: 24,
    monthlyPayment: 0,
    selectedCard: linkedCards.length > 0 ? linkedCards[0].id : ''
  });

  // Función para formatear números con separadores de miles
  const formatNumber = (value: number): string => {
    return value.toLocaleString('es-PY');
  };

  // Función para parsear el input del usuario
  const parseFormattedNumber = (value: string): number => {
    return parseInt(value.replace(/\./g, '').replace(/,/g, '')) || 0;
  };

  const handleLoanAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseFormattedNumber(value);
    
    setFormData(prev => ({ ...prev, loanAmount: numericValue }));
    setLoanAmountDisplay(numericValue > 0 ? formatNumber(numericValue) : '');
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseFormattedNumber(value);
    
    setFormData(prev => ({ ...prev, salary: numericValue }));
    setSalaryDisplay(numericValue > 0 ? formatNumber(numericValue) : '');
  };

  // Auto-seleccionar la primera tarjeta validada si existe
  useEffect(() => {
    if (linkedCards.length > 0 && !formData.selectedCard) {
      const validatedCard = linkedCards.find(card => card.isValidated);
      if (validatedCard) {
        setFormData(prev => ({ ...prev, selectedCard: validatedCard.id }));
      }
    }
  }, [linkedCards]);

  // Cálculo automático de cuota
  useEffect(() => {
    if (formData.loanAmount > 0 && formData.term > 0) {
      const monthlyRate = 0.08 / 12; // 8% anual
      const numPayments = formData.term;
      const principal = formData.loanAmount;
      
      // Fórmula de amortización
      const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                            (Math.pow(1 + monthlyRate, numPayments) - 1);
      
      setFormData(prev => ({
        ...prev,
        monthlyPayment: Math.round(monthlyPayment)
      }));
      
      setShowCalculation(true);
    } else {
      setShowCalculation(false);
    }
  }, [formData.loanAmount, formData.term]);

  const validatedCards = linkedCards.filter(card => card.isValidated);
  const maxLoanAmount = formData.term <= 60 ? 600000000 : 600000000;

  const handleSubmit = () => {
    setStep('summary');
  };

  const handleConfirm = () => {
    console.log('handleConfirm called');
    // Mostrar loading
    setStep('loading');
    
    // Simular envío de datos (2 segundos)
    setTimeout(() => {
      console.log('Submitting form data:', formData);
      onSubmit(formData);
      setStep('success');
    }, 2000);
  };

  const handleCloseSuccess = () => {
    onClose();
    // Reset form with test data
    setStep('form');
    setFormData({
      fullName: userName,
      idNumber: userIdNumber,
      country: 'Paraguay',
      whatsapp: '+595 981 234567',
      occupation: 'Conductor de plataforma (Uber/Bolt)',
      salary: 4500000,
      taxType: 'IPS',
      address: '',
      street1: 'Avda. Eusebio Ayala',
      street2: 'Capitán Rivas',
      houseNumber: '1234',
      unitType: 'casa',
      reference: 'Frente a la farmacia San Roque',
      neighborhood: 'Barrio Obrero',
      city: 'Asunción',
      loanAmount: 15000000,
      term: 24,
      monthlyPayment: 0,
      selectedCard: linkedCards.length > 0 ? linkedCards[0].id : ''
    });
    setLoanAmountDisplay('15.000.000');
    setSalaryDisplay('4.500.000');
    setIsPlatformDriver(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0">
      <div className="bg-gray-50 w-full h-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 relative flex-shrink-0">
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
                // No permitir cerrar durante loading o success
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
              ? 'Solicitud de Préstamo' 
              : step === 'summary'
              ? 'Resumen de Solicitud'
              : step === 'loading'
              ? 'Procesando Solicitud'
              : '¡Solicitud Enviada!'}
          </h2>
          <p className="text-blue-100 text-sm">
            {step === 'form' 
              ? 'Completa los datos para solicitar tu préstamo' 
              : step === 'summary'
              ? 'Verifica tu información antes de enviar'
              : step === 'loading'
              ? 'Estamos procesando tu solicitud...'
              : 'Tu solicitud ha sido recibida exitosamente'}
          </p>
        </div>

        {step === 'form' ? (
          <>
            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Datos pre-llenados */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-900 text-base mb-4">
                  Datos del solicitante
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Número de cédula
                    </label>
                    <input
                      type="text"
                      value={formData.idNumber}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* Datos a completar */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-900 text-base mb-4">
                  Información de contacto
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      País <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                    >
                      <option value="Paraguay">Paraguay</option>
                      <option value="Argentina">Argentina</option>
                      <option value="Brasil">Brasil</option>
                      <option value="Uruguay">Uruguay</option>
                      <option value="Chile">Chile</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+595 XXX XXX XXX"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Dirección detallada */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-900 text-base mb-4">
                  Dirección completa
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Calle principal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Avenida Eusebio Ayala"
                      value={formData.street1}
                      onChange={(e) => setFormData(prev => ({ ...prev, street1: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Calle secundaria
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Esquina con calle Brasil"
                      value={formData.street2}
                      onChange={(e) => setFormData(prev => ({ ...prev, street2: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Número de casa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 1234"
                      value={formData.houseNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, houseNumber: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tipo de vivienda <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, unitType: 'casa' }))}
                        className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                          formData.unitType === 'casa'
                            ? 'bg-blue-600 text-white border-2 border-blue-600'
                            : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300'
                        }`}
                      >
                        Casa
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, unitType: 'departamento' }))}
                        className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                          formData.unitType === 'departamento'
                            ? 'bg-blue-600 text-white border-2 border-blue-600'
                            : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300'
                        }`}
                      >
                        Departamento
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Referencia <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Cerca del supermercado ABC"
                      value={formData.reference}
                      onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Barrio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Villa Morra"
                      value={formData.neighborhood}
                      onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ciudad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Asunción"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Datos laborales */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-900 text-base mb-4">
                  Información laboral
                </h3>

                <div className="space-y-4">
                  {/* Switch conductor de plataforma */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 mb-0.5">
                          Soy conductor de plataforma
                        </p>
                        <p className="text-xs text-blue-600 font-semibold">
                          Uber, Bolt, MUV
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsPlatformDriver(!isPlatformDriver);
                          if (!isPlatformDriver) {
                            // Cuando activa el switch, establecer IVA y ocupación
                            setFormData(prev => ({ 
                              ...prev, 
                              taxType: 'IVA',
                              occupation: 'Conductor de plataforma'
                            }));
                          } else {
                            // Cuando desactiva el switch, limpiar ocupación
                            setFormData(prev => ({ 
                              ...prev, 
                              occupation: ''
                            }));
                          }
                        }}
                        className={`relative w-14 h-8 rounded-full transition-all ${
                          isPlatformDriver ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                            isPlatformDriver ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ocupación / Trabajo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Contador, Comerciante, Ingeniero"
                      value={formData.occupation}
                      onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                      disabled={isPlatformDriver}
                      className={`w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none ${
                        isPlatformDriver ? 'bg-gray-50 text-gray-600' : 'bg-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {isPlatformDriver ? 'Jornal por día (Gs)' : 'Salario mensual (Gs)'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="0"
                      value={salaryDisplay}
                      onChange={handleSalaryChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Régimen tributario <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => !isPlatformDriver && setFormData(prev => ({ ...prev, taxType: 'IVA' }))}
                        disabled={isPlatformDriver}
                        className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                          formData.taxType === 'IVA'
                            ? 'bg-blue-600 text-white border-2 border-blue-600'
                            : isPlatformDriver
                            ? 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed'
                            : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300'
                        }`}
                      >
                        IVA
                      </button>
                      <button
                        type="button"
                        onClick={() => !isPlatformDriver && setFormData(prev => ({ ...prev, taxType: 'IPS' }))}
                        disabled={isPlatformDriver}
                        className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                          formData.taxType === 'IPS'
                            ? 'bg-blue-600 text-white border-2 border-blue-600'
                            : isPlatformDriver
                            ? 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed'
                            : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300'
                        }`}
                      >
                        IPS
                      </button>
                    </div>
                    {isPlatformDriver && (
                      <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                        Régimen fijo para conductores de plataforma
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Datos del préstamo */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-900 text-base mb-4">
                  Detalles del préstamo
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Monto solicitado (Gs) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="0"
                      value={loanAmountDisplay}
                      onChange={handleLoanAmountChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white text-lg font-semibold"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Máximo: {maxLoanAmount.toLocaleString('es-PY')} Gs (hasta 60 meses a sola firma)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Plazo (meses) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.term}
                      onChange={(e) => setFormData(prev => ({ ...prev, term: Number(e.target.value) }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                    >
                      <option value={12}>12 meses</option>
                      <option value={18}>18 meses</option>
                      <option value={24}>24 meses</option>
                      <option value={36}>36 meses</option>
                      <option value={48}>48 meses</option>
                      <option value={60}>60 meses</option>
                    </select>
                  </div>

                  {showCalculation && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Calculator className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                        <div className="flex-1">
                          <h4 className="font-semibold text-green-900 text-sm mb-1">
                            Cálculo de cuota
                          </h4>
                          <p className="text-2xl font-bold text-green-900 mb-2">
                            {formData.monthlyPayment.toLocaleString('es-PY')} Gs/mes
                          </p>
                          <div className="space-y-1 text-xs text-green-800">
                            <p>• Tasa de interés: <span className="font-semibold">8% anual</span></p>
                            <p>• Total a pagar: <span className="font-semibold">{(formData.monthlyPayment * formData.term).toLocaleString('es-PY')} Gs</span></p>
                            <p>• Intereses totales: <span className="font-semibold">{((formData.monthlyPayment * formData.term) - formData.loanAmount).toLocaleString('es-PY')} Gs</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Débito automático */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-900 text-base mb-4">
                  Método de pago
                </h3>

                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <h4 className="font-semibold text-blue-900 text-sm mb-1">
                          Débito automático obligatorio
                        </h4>
                        <p className="text-xs text-blue-800 leading-relaxed">
                          Para garantizar el pago puntual de las cuotas, se requiere vincular una tarjeta de débito o crédito para el débito automático mensual.
                        </p>
                      </div>
                    </div>
                  </div>

                  {validatedCards.length > 0 ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Selecciona tu tarjeta <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-2">
                        {validatedCards.map((card) => (
                          <button
                            key={card.id}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, selectedCard: card.id }))}
                            className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                              formData.selectedCard === card.id
                                ? 'bg-blue-50 border-2 border-blue-500'
                                : 'bg-white border-2 border-gray-300 hover:border-blue-300'
                            }`}
                          >
                            <CreditCard className={formData.selectedCard === card.id ? 'text-blue-600' : 'text-gray-400'} size={24} />
                            <div className="flex-1 text-left">
                              <p className="font-semibold text-sm text-gray-900">
                                •••• •••• •••• {card.cardNumber.slice(-4)}
                              </p>
                              <p className="text-xs text-gray-600">
                                {card.cardHolder}
                              </p>
                            </div>
                            {card.isValidated && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                                Verificada
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenCardModal();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gray-50 text-gray-700 font-semibold hover:bg-gray-100 transition-all border-2 border-dashed border-gray-300"
                    >
                      <CreditCard size={20} />
                      Vincular tarjeta
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
              <button
                onClick={handleSubmit}
                disabled={
                  !formData.whatsapp ||
                  !formData.occupation ||
                  !formData.salary ||
                  !formData.taxType ||
                  !formData.street1 ||
                  !formData.houseNumber ||
                  !formData.unitType ||
                  !formData.reference ||
                  !formData.neighborhood ||
                  !formData.city ||
                  !formData.loanAmount ||
                  !formData.selectedCard
                }
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Revisar solicitud
              </button>
            </div>
          </>
        ) : step === 'summary' ? (
          <>
            {/* Summary Content - Diseño de Proforma */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
              {/* Documento de Proforma */}
              <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header del Documento */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="text-xl font-bold mb-1">PROFORMA DE PRÉSTAMO</h2>
                      <p className="text-sm text-blue-100">Woz Payments</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-blue-100 mb-0.5">N° Referencia</p>
                      <p className="text-sm font-bold">{Date.now().toString().slice(-8)}</p>
                    </div>
                  </div>
                  <div className="text-xs text-blue-100">
                    <p>Fecha: {new Date().toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                  </div>
                </div>

                {/* Contenido del Documento */}
                <div className="p-6 space-y-6">
                  {/* Datos del Solicitante */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-gray-300">
                      Datos del Solicitante
                    </h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Nombre Completo</p>
                        <p className="text-gray-900">{formData.fullName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Cédula de Identidad</p>
                        <p className="text-gray-900">{formData.idNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">WhatsApp</p>
                        <p className="text-gray-900">{formData.whatsapp}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">País</p>
                        <p className="text-gray-900">{formData.country}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dirección */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-gray-300">
                      Dirección
                    </h3>
                    <div className="text-sm space-y-1">
                      <p className="text-gray-900">
                        <span className="text-gray-600">Calle:</span> {formData.street1}{formData.street2 && `, ${formData.street2}`}
                      </p>
                      <p className="text-gray-900">
                        <span className="text-gray-600">Número:</span> {formData.houseNumber} - {formData.unitType === 'casa' ? 'Casa' : 'Departamento'}
                      </p>
                      <p className="text-gray-900">
                        <span className="text-gray-600">Referencia:</span> {formData.reference}
                      </p>
                      <p className="text-gray-900">
                        <span className="text-gray-600">Barrio:</span> {formData.neighborhood}, <span className="text-gray-600">Ciudad:</span> {formData.city}
                      </p>
                    </div>
                  </div>

                  {/* Información Laboral */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-gray-300">
                      Información Laboral
                    </h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Ocupación</p>
                        <p className="text-gray-900">{formData.occupation}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Ingreso Mensual</p>
                        <p className="text-gray-900">{formData.salary.toLocaleString('es-PY')} Gs</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Régimen Tributario</p>
                        <p className="text-gray-900">{formData.taxType}</p>
                      </div>
                    </div>
                  </div>

                  {/* Detalles del Préstamo */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-gray-300">
                      Detalles del Préstamo
                    </h3>
                    <div className="bg-gray-100 rounded-lg p-3 mb-4 border border-gray-300">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-600 mb-0.5">Monto Solicitado</p>
                          <p className="text-lg font-bold text-gray-900">
                            {formData.loanAmount.toLocaleString('es-PY')} Gs
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-0.5">Plazo</p>
                          <p className="text-lg font-bold text-gray-900">{formData.term} meses</p>
                        </div>
                      </div>
                    </div>

                    {/* Tabla de Resumen Financiero */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <tbody>
                          <tr className="border-b border-gray-200">
                            <td className="py-3 px-4 text-gray-600">Tasa de Interés Anual</td>
                            <td className="py-3 px-4 text-right text-gray-900">8.00%</td>
                          </tr>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <td className="py-3 px-4 text-gray-600">Cuota Mensual</td>
                            <td className="py-3 px-4 text-right text-gray-900">{formData.monthlyPayment.toLocaleString('es-PY')} Gs</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-3 px-4 text-gray-600">Total a Pagar</td>
                            <td className="py-3 px-4 text-right text-gray-900">{(formData.monthlyPayment * formData.term).toLocaleString('es-PY')} Gs</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="py-3 px-4 text-gray-600">Intereses Totales</td>
                            <td className="py-3 px-4 text-right text-gray-900">{((formData.monthlyPayment * formData.term) - formData.loanAmount).toLocaleString('es-PY')} Gs</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Método de Pago */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-gray-300">
                      Método de Pago
                    </h3>
                    <div className="flex items-center gap-3 text-sm">
                      <CreditCard className="text-blue-600" size={20} />
                      <div>
                        <p className="font-semibold text-gray-900">Débito Automático</p>
                        <p className="text-xs text-gray-600">
                          Tarjeta terminada en <span className="font-semibold">{linkedCards.find(c => c.id === formData.selectedCard)?.cardNumber.slice(-4)}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Términos y Condiciones */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-xs font-bold text-gray-700 mb-2">TÉRMINOS Y CONDICIONES</h4>
                    <ul className="text-xs text-gray-600 space-y-1 leading-relaxed">
                      <li>• La aprobación del prstamo está sujeta a evaluación crediticia.</li>
                      <li>• El débito automático se realizará el día 5 de cada mes.</li>
                      <li>• Esta proforma tiene una validez de 15 días desde su emisión.</li>
                      <li>• Te notificaremos el resultado en un plazo de 24 a 48 horas hábiles.</li>
                    </ul>
                  </div>

                  {/* Firma */}
                  <div className="pt-6 border-t-2 border-gray-300">
                    <div className="text-center">
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 mb-8">FIRMA DEL SOLICITANTE</p>
                        <div className="border-t border-gray-400 w-64 mx-auto"></div>
                      </div>
                      <p className="text-xs font-semibold text-gray-700">{formData.fullName}</p>
                      <p className="text-xs text-gray-500">CI: {formData.idNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Footer del Documento */}
                <div className="bg-gray-100 px-6 py-4 text-center border-t border-gray-300">
                  <p className="text-xs text-gray-500">
                    Woz Payments - Soluciones Financieras Digitales
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    www.wozpayments.com | contacto@wozpayments.com
                  </p>
                </div>
              </div>
            </div>

            {/* Footer - Botones de Acción */}
            <div className="p-4 border-t border-gray-200 bg-white space-y-3 flex-shrink-0">
              <button
                onClick={() => setStep('form')}
                className="w-full bg-white text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all border-2 border-gray-300"
              >
                Volver a editar
              </button>
              <button
                onClick={handleConfirm}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                Confirmar y enviar solicitud
              </button>
            </div>
          </>
        ) : step === 'loading' ? (
          <>
            {/* Loading Content */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-100">
              <div className="text-center">
                <div className="mb-6 flex justify-center">
                  <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Procesando tu solicitud
                </h3>
                <p className="text-gray-600 text-sm max-w-sm mx-auto">
                  Estamos enviando tu solicitud de préstamo. Esto tomará solo unos segundos...
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
                  ¡Solicitud enviada exitosamente!
                </h3>
                <p className="text-gray-600 text-base mb-6 leading-relaxed">
                  Tu solicitud de préstamo ha sido recibida y será evaluada por nuestro equipo.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-blue-900 font-semibold mb-2">
                    📋 Próximos pasos
                  </p>
                  <ul className="text-xs text-blue-800 text-left space-y-2">
                    <li>• Evaluaremos tu solicitud en las próximas 24-48 horas</li>
                    <li>• Te notificaremos por WhatsApp y correo electrónico</li>
                    <li>• Puedes consultar el estado en cualquier momento</li>
                  </ul>
                </div>
                <div className="text-sm text-gray-500">
                  <p>N° de referencia: <span className="font-bold text-gray-700">{Date.now().toString().slice(-8)}</span></p>
                </div>
              </div>
            </div>

            {/* Footer - Botones de Acción */}
            <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
              <button
                onClick={handleCloseSuccess}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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