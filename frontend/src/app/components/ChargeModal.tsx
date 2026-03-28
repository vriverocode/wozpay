import { useState, useEffect } from 'react';
import { X, Link2, QrCode, ShoppingBag, Code, Calendar, ArrowLeft, Check, Copy, Download, Globe, Loader2 } from 'lucide-react';
import { WozApiDocs } from './WozApiDocs';
import { savePaymentLink } from '../utils/paymentStorage';
import { membershipProfiles, type MembershipTier } from '../types/membership';

interface ChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMembership?: MembershipTier;
  monthlyLinksQRsCount?: number;
  userName?: string;
  userIdNumber?: string;
  onRequireUpgrade?: (featureName: string) => void;
  onLinkQRGenerated?: (data: {
    type: 'link' | 'qr';
    chargeType: 'sale' | 'freelance' | 'subscription';
    productName: string;
    amount: number;
    currency: 'GS' | 'USD';
    merchantName: string;
    merchantId: string;
    subscriptionFrequency?: 'weekly' | 'monthly' | 'yearly';
    subscriptionStartDate?: string;
  }) => void;
}

type ChargeType = 'sale' | 'freelance' | 'subscription' | null;
type FormatType = 'link' | 'qr' | null;
type CurrencyType = 'GS' | 'USD';

export function ChargeModal({ 
  isOpen, 
  onClose, 
  currentMembership = 'gratuito',
  monthlyLinksQRsCount = 0, 
  userName = 'Usuario', 
  userIdNumber = '0000000', 
  onRequireUpgrade,
  onLinkQRGenerated 
}: ChargeModalProps) {
  const [step, setStep] = useState(1);
  const [chargeType, setChargeType] = useState<ChargeType>(null);
  const [formatType, setFormatType] = useState<FormatType>(null);
  const [currency, setCurrency] = useState<CurrencyType>('GS');
  const [isLoading, setIsLoading] = useState(false);
  const [showApiDocs, setShowApiDocs] = useState(false);
  
  // Obtener límites según la membresía activa
  const membershipProfile = membershipProfiles[currentMembership];
  const MEMBERSHIP_LIMITS = {
    maxLinksQRsPerMonth: membershipProfile.limits.linksAndQrs, // -1 = ilimitado
    minAmountGs: 0, // No hay mínimo definido en los datos
    maxAmountGs: membershipProfile.limits.maxAmountPerLink,
    minAmountUsd: 0, // No hay mínimo definido en los datos
    maxAmountUsd: membershipProfile.limits.maxAmountPerLinkUsd,
    commissionPercent: membershipProfile.commissions.transactionRate / 100, // Convertir de porcentaje a decimal
    fixedFeeUsd: membershipProfile.commissions.fixedFeeUsd,
    fixedFeeGs: membershipProfile.commissions.fixedFeeGs
  };
  
  // Form data
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [details, setDetails] = useState('');
  const [startDate, setStartDate] = useState('');
  const [billingDay, setBillingDay] = useState('1');
  const [subscriptionFrequency, setSubscriptionFrequency] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  
  const [generatedLink, setGeneratedLink] = useState('');
  const [generatedPaymentId, setGeneratedPaymentId] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setStep(1);
    setChargeType(null);
    setFormatType(null);
    setProductName('');
    setPrice('');
    setDetails('');
    setStartDate('');
    setBillingDay('1');
    setGeneratedLink('');
    setCopied(false);
    setIsLoading(false);
    setShowApiDocs(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleTypeSelect = (type: ChargeType) => {
    setChargeType(type);
    setStep(2);
  };

  const handleFormatSelect = (format: FormatType) => {
    setFormatType(format);
    setStep(3);
  };

  const handleGenerate = () => {
    // Verificar membresía
    if (currentMembership === 'gratuito') {
      onRequireUpgrade?.('Cobrar');
      return;
    }

    console.log('=== INICIANDO GENERACIÓN ===');
    console.log('productName:', productName);
    console.log('price:', price);
    console.log('formatType:', formatType);
    console.log('chargeType:', chargeType);
    console.log('monthlyLinksQRsCount:', monthlyLinksQRsCount);
    
    // Validar límite mensual (solo si no es ilimitado)
    if (MEMBERSHIP_LIMITS.maxLinksQRsPerMonth !== -1 && monthlyLinksQRsCount >= MEMBERSHIP_LIMITS.maxLinksQRsPerMonth) {
      alert(`Has alcanzado el límite mensual de ${MEMBERSHIP_LIMITS.maxLinksQRsPerMonth} links/QRs con tu membresía ${membershipProfile.name}.`);
      return;
    }

    // Validar monto
    const numericPrice = parseFloat(price.replace(/\./g, '').replace(/,/g, '.'));
    console.log('numericPrice:', numericPrice);
    
    if (isNaN(numericPrice) || numericPrice <= 0) {
      alert('Por favor ingresa un monto válido.');
      return;
    }
    
    if (currency === 'GS') {
      if (MEMBERSHIP_LIMITS.minAmountGs > 0 && numericPrice < MEMBERSHIP_LIMITS.minAmountGs) {
        alert(`El monto mínimo para cobros es de ${MEMBERSHIP_LIMITS.minAmountGs.toLocaleString('es-PY')} Gs con tu membresía ${membershipProfile.name}.`);
        return;
      }
      if (numericPrice > MEMBERSHIP_LIMITS.maxAmountGs) {
        alert(`El monto máximo para cobros es de ${MEMBERSHIP_LIMITS.maxAmountGs.toLocaleString('es-PY')} Gs con tu membresía ${membershipProfile.name}.`);
        return;
      }
    } else if (currency === 'USD') {
      if (MEMBERSHIP_LIMITS.minAmountUsd > 0 && numericPrice < MEMBERSHIP_LIMITS.minAmountUsd) {
        alert(`El monto mínimo para cobros es de ${MEMBERSHIP_LIMITS.minAmountUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD con tu membresía ${membershipProfile.name}.`);
        return;
      }
      if (numericPrice > MEMBERSHIP_LIMITS.maxAmountUsd) {
        alert(`El monto máximo para cobros es de ${MEMBERSHIP_LIMITS.maxAmountUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD con tu membresía ${membershipProfile.name}.`);
        return;
      }
    }

    console.log('=== VALIDACIONES PASADAS ===');
    setIsLoading(true);
    setStep(4);
    
    // Simulate generation with 5 second loading
    setTimeout(() => {
      const id = 'pay-' + Date.now() + '-' + Math.random().toString(36).substring(7);
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/pay/${id}`;
      
      console.log('=== LINK GENERADO ===');
      console.log('id:', id);
      console.log('link:', link);
      
      setGeneratedPaymentId(id);
      setGeneratedLink(link);
      setIsLoading(false);
      
      const paymentData = {
        id: id,
        type: formatType!,
        chargeType: chargeType!,
        productName: productName,
        amount: numericPrice,
        currency: currency,
        merchantName: userName,
        merchantId: userIdNumber,
        createdAt: new Date().toISOString(),
        status: 'active' as const,
        subscriptionFrequency: chargeType === 'subscription' ? subscriptionFrequency : undefined,
        subscriptionStartDate: chargeType === 'subscription' ? new Date().toISOString() : undefined
      };
      
      console.log('=== GUARDANDO EN LOCALSTORAGE ===');
      console.log('paymentData:', paymentData);
      
      // Guardar en localStorage para que la página de pago pueda acceder
      savePaymentLink(paymentData);
      
      // Notificar al padre que se generó un link/QR
      if (onLinkQRGenerated && formatType && chargeType) {
        console.log('=== NOTIFICANDO AL PADRE ===');
        onLinkQRGenerated(paymentData);
      }
      
      console.log('=== GENERACIÓN COMPLETA ===');
    }, 5000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    // Mock download - en producción esto generaría y descargaría un QR real
    const link = document.createElement('a');
    link.download = `woz-qr-${productName.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    link.click();
  };

  const getTypeLabel = () => {
    switch (chargeType) {
      case 'sale': return 'Venta';
      case 'freelance': return 'Freelance';
      case 'subscription': return 'Suscripción';
      default: return '';
    }
  };

  const getFieldLabel = () => {
    switch (chargeType) {
      case 'sale': return 'producto';
      case 'freelance': return 'proyecto';
      case 'subscription': return 'plan';
      default: return 'producto';
    }
  };

  const formatPrice = (value: string, currencyType: CurrencyType) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '0';
    
    if (currencyType === 'GS') {
      // Guaraníes sin decimales
      return Math.round(numValue).toLocaleString('es-PY');
    } else {
      // Dólares con 2 decimales
      return numValue.toLocaleString('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  };

  const handlePriceChange = (value: string) => {
    // Remove all formatting (dots and commas used as thousands separators)
    const cleanValue = value.replace(/\./g, '').replace(/,/g, '');
    
    // For Guaraníes, only keep digits
    if (currency === 'GS') {
      const digitsOnly = cleanValue.replace(/\D/g, '');
      setPrice(digitsOnly);
    } else {
      // For USD, allow one decimal point
      // Remove all non-numeric except the first decimal point
      let processed = '';
      let hasDecimal = false;
      
      for (let char of cleanValue) {
        if (char >= '0' && char <= '9') {
          processed += char;
        } else if (char === '.' && !hasDecimal) {
          hasDecimal = true;
          processed += char;
        }
      }
      
      // Limit decimals to 2 places
      const parts = processed.split('.');
      if (parts.length === 2 && parts[1].length > 2) {
        processed = parts[0] + '.' + parts[1].slice(0, 2);
      }
      
      setPrice(processed);
    }
  };

  const formatPriceInput = (value: string) => {
    if (!value || value === '') return '';
    
    if (currency === 'GS') {
      // Guaraníes: no decimals, just format the integer
      const numValue = parseInt(value) || 0;
      return numValue.toLocaleString('es-PY');
    } else {
      // Dólares: format integer part, keep decimal part as-is
      const parts = value.split('.');
      const integerPart = parseInt(parts[0]) || 0;
      const formattedInteger = integerPart.toLocaleString('es-PY');
      
      if (parts.length === 2) {
        return `${formattedInteger},${parts[1]}`;
      }
      if (value.endsWith('.')) {
        return `${formattedInteger},`;
      }
      return formattedInteger;
    }
  };

  return (
    <>
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-blue-600 border-b border-blue-700 px-5 py-4 flex items-center justify-between">
        <button
          onClick={() => {
            if (step === 1) {
              handleClose();
            } else if (step >= 4) {
              handleClose();
            } else {
              setStep(step - 1);
            }
          }}
          className="w-9 h-9 rounded-full hover:bg-blue-700 flex items-center justify-center transition-colors"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <h2 className="text-lg font-semibold text-white">
          {step === 4 ? (isLoading ? 'Generando cobro...' : 'Cobro generado') : 'Crear cobro'}
        </h2>
        <button
          onClick={handleClose}
          className="w-9 h-9 rounded-full hover:bg-blue-700 flex items-center justify-center transition-colors"
        >
          <X size={20} className="text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto p-5">
          {/* Step 1: Select Type */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Método de cobro</h3>
                <p className="text-sm text-gray-500">Seleccione el tipo de transacción que desea realizar</p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleTypeSelect('sale')}
                  className="w-full bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-400 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 group-hover:from-gray-200 group-hover:to-gray-300 transition-all">
                      <ShoppingBag size={22} className="text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 text-base">Venta de producto</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">Cobro único por productos o servicios individuales</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleTypeSelect('freelance')}
                  className="w-full bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-400 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 group-hover:from-gray-200 group-hover:to-gray-300 transition-all">
                      <Code size={22} className="text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 text-base">Servicio profesional</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">Facturación por proyectos o trabajos freelance</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleTypeSelect('subscription')}
                  className="w-full bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-400 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 group-hover:from-gray-200 group-hover:to-gray-300 transition-all">
                      <Calendar size={22} className="text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 text-base">Suscripción recurrente</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">Cobro automático mensual para servicios continuos</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setShowApiDocs(true)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-400 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 group-hover:from-gray-200 group-hover:to-gray-300 transition-all">
                      <Code size={22} className="text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 text-base">Woz API</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">Integración de pagos mediante API para desarrolladores</p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
                <div className="flex items-start gap-3">
                  <Globe size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-blue-900 mb-0.5">Transacciones internacionales</p>
                    <p className="text-xs text-blue-700">Aceptamos pagos desde cualquier país del mundo</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Select Format */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Formato de pago</h3>
                <p className="text-sm text-gray-500">Seleccione cómo desea compartir el cobro</p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleFormatSelect('link')}
                  className="w-full bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-400 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 group-hover:from-gray-200 group-hover:to-gray-300 transition-all">
                      <Link2 size={22} className="text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 text-base">Link de pago</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">URL segura para compartir por WhatsApp, email o redes sociales</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleFormatSelect('qr')}
                  className="w-full bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-400 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 group-hover:from-gray-200 group-hover:to-gray-300 transition-all">
                      <QrCode size={22} className="text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 text-base">Código QR</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">Código escaneable para pagos rápidos en punto de venta</p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
                <div className="flex items-start gap-3">
                  <Globe size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-blue-900 mb-0.5">Transacciones internacionales</p>
                    <p className="text-xs text-blue-700">Aceptamos pagos desde cualquier país del mundo</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Form */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-left">Detalles del {getFieldLabel()}</h3>
                <p className="text-sm text-gray-600 text-left">Completa la información para generar tu cobro</p>
              </div>

              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
                <Globe size={18} className="text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-blue-900">Disponible para cobros internacionales</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 space-y-5">
                <div>
                  <label className="block font-semibold text-gray-900 mb-1.5">
                    Nombre del {getFieldLabel()}
                  </label>
                  <p className="text-xs text-gray-600 mb-2">
                    Ingresa un nombre claro y descriptivo
                  </p>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder={`Ej: ${chargeType === 'freelance' ? 'Desarrollo de sitio web' : chargeType === 'subscription' ? 'Plan Premium' : 'Diseño de logo'}`}
                    className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-900 mb-1.5">Moneda</label>
                  <p className="text-xs text-gray-600 mb-2">
                    Selecciona la moneda en que quieres cobrar
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCurrency('GS')}
                      className={`flex-1 py-3.5 rounded-xl font-semibold transition-all ${
                        currency === 'GS'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                      }`}
                    >
                      Guaraníes
                    </button>
                    <button
                      onClick={() => setCurrency('USD')}
                      className={`flex-1 py-3.5 rounded-xl font-semibold transition-all ${
                        currency === 'USD'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                      }`}
                    >
                      Dólares
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-900 mb-1.5">
                    Precio {chargeType === 'subscription' ? (subscriptionFrequency === 'weekly' ? 'semanal' : subscriptionFrequency === 'monthly' ? 'mensual' : 'anual') : ''}
                  </label>
                  <p className="text-xs text-gray-600 mb-2">
                    Monto que cobrarás {chargeType === 'subscription' ? (subscriptionFrequency === 'weekly' ? 'cada semana' : subscriptionFrequency === 'monthly' ? 'cada mes' : 'cada año') : 'por este ' + getFieldLabel()}
                  </p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">
                      {currency === 'GS' ? 'Gs' : 'USD'}
                    </span>
                    <input
                      type="text"
                      value={formatPriceInput(price)}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      placeholder="0"
                      className="w-full pl-16 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-lg font-semibold"
                    />
                  </div>
                </div>

                {chargeType === 'subscription' && (
                  <>
                    <div>
                      <label className="block font-semibold text-gray-900 mb-1.5">
                        Frecuencia de cobro
                      </label>
                      <p className="text-xs text-gray-600 mb-2">
                        ¿Con qué frecuencia se realizará el cobro?
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setSubscriptionFrequency('weekly')}
                          className={`py-3 rounded-xl font-semibold transition-all ${
                            subscriptionFrequency === 'weekly'
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                          }`}
                        >
                          Semanal
                        </button>
                        <button
                          type="button"
                          onClick={() => setSubscriptionFrequency('monthly')}
                          className={`py-3 rounded-xl font-semibold transition-all ${
                            subscriptionFrequency === 'monthly'
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                          }`}
                        >
                          Mensual
                        </button>
                        <button
                          type="button"
                          onClick={() => setSubscriptionFrequency('yearly')}
                          className={`py-3 rounded-xl font-semibold transition-all ${
                            subscriptionFrequency === 'yearly'
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                          }`}
                        >
                          Anual
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-900 mb-1.5">
                        Fecha de inicio
                      </label>
                      <p className="text-xs text-gray-600 mb-2">
                        ¿Cuándo comienza la suscripción?
                      </p>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>

                    {subscriptionFrequency === 'monthly' && (
                      <div>
                        <label className="block font-semibold text-gray-900 mb-1.5">
                          Día de cobro mensual
                        </label>
                        <p className="text-xs text-gray-600 mb-2">
                          Elige qué día del mes se realizará el cobro
                        </p>
                        <select
                          value={billingDay}
                          onChange={(e) => setBillingDay(e.target.value)}
                          className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        >
                          {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                            <option key={day} value={day}>
                              Día {day}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}

                <div>
                  <label className="block font-semibold text-gray-900 mb-1.5">
                    Detalles adicionales
                  </label>
                  <p className="text-xs text-gray-600 mb-2">
                    Información extra que tus clientes deben conocer (opcional)
                  </p>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Ej: Incluye revisiones ilimitadas, entrega en 7 días..."
                    rows={4}
                    className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Información de comisiones y límites */}
              {price && parseFloat(price.replace(/\./g, '').replace(/,/g, '.')) > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-bold text-sm text-blue-900 mb-3">Resumen de comisiones</h4>
                  
                  <div className="space-y-2 text-xs mb-3">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Monto del cobro</span>
                      <span className="font-semibold text-blue-900">
                        {currency === 'GS' ? 'Gs' : 'USD'} {formatPriceInput(price)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Comisión Woz ({membershipProfile.commissions.transactionRate}%)</span>
                      <span className="font-semibold text-blue-900">
                        - {currency === 'GS' ? 'Gs' : 'USD'} {formatPrice(parseFloat(price.replace(/\./g, '').replace(/,/g, '.')) * MEMBERSHIP_LIMITS.commissionPercent, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Tarifa fija</span>
                      <span className="font-semibold text-blue-900">
                        - {currency === 'GS' ? 'Gs' : 'USD'} {currency === 'GS' ? formatPrice(MEMBERSHIP_LIMITS.fixedFeeGs, 'GS') : MEMBERSHIP_LIMITS.fixedFeeUsd.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-blue-300 pt-2 flex justify-between">
                      <span className="font-bold text-blue-900">Recibirás</span>
                      <span className="font-bold text-blue-900">
                        {currency === 'GS' ? 'Gs' : 'USD'} {formatPrice(
                          parseFloat(price.replace(/\./g, '').replace(/,/g, '.')) * (1 - MEMBERSHIP_LIMITS.commissionPercent) - 
                          (currency === 'USD' ? MEMBERSHIP_LIMITS.fixedFeeUsd : MEMBERSHIP_LIMITS.fixedFeeGs),
                          currency
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-blue-700">
                    <p className="mb-1">• Links/QRs este mes: {monthlyLinksQRsCount}/{MEMBERSHIP_LIMITS.maxLinksQRsPerMonth === -1 ? '∞' : MEMBERSHIP_LIMITS.maxLinksQRsPerMonth}</p>
                    {currency === 'GS' && (
                      <p>• Límite máximo por link: {MEMBERSHIP_LIMITS.maxAmountGs.toLocaleString('es-PY')} Gs</p>
                    )}
                    {currency === 'USD' && (
                      <p>• Límite máximo por link: {MEMBERSHIP_LIMITS.maxAmountUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</p>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={handleGenerate}
                  disabled={!productName || !price}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg"
                >
                  Generar {formatType === 'qr' ? 'código QR' : 'link de pago'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Loading & Summary */}
          {step === 4 && (
            <div className="space-y-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                      <Loader2 size={40} className="text-blue-600 animate-spin" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Generando tu cobro</h3>
                  <p className="text-sm text-gray-600 text-center">
                    Estamos creando tu {formatType === 'qr' ? 'código QR' : 'link de pago'}...
                  </p>
                </div>
              ) : (
                <>
                  {/* Success Message - Minimalista */}
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                      <Check size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-green-900">Cobro creado con éxito</p>
                      <p className="text-xs text-green-700">Listo para compartir con tus clientes</p>
                    </div>
                  </div>

                  {/* Link/QR Display */}
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
                    {formatType === 'link' ? (
                      <>
                        <div className="text-center mb-4">
                          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                            <Link2 size={28} className="text-blue-600" />
                          </div>
                          <h4 className="text-lg font-bold text-gray-900 mb-1">Link de pago generado</h4>
                          <p className="text-sm text-gray-600">Comparte este link con tus clientes</p>
                        </div>

                        <div className="space-y-3">
                          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-600 mb-2">Tu link de pago</p>
                            <p className="text-sm text-blue-600 font-mono break-all">{generatedLink}</p>
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={handleCopy}
                              className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                            >
                              {copied ? (
                                <>
                                  <Check size={20} />
                                  ¡Copiado!
                                </>
                              ) : (
                                <>
                                  <Copy size={20} />
                                  Copiar link
                                </>
                              )}
                            </button>
                          </div>

                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5">
                            <p className="text-xs font-semibold text-blue-900 mb-1.5">¿Cómo usarlo?</p>
                            <ul className="text-xs text-blue-700 space-y-1">
                              <li>• Compártelo por WhatsApp, email o redes sociales</li>
                              <li>• Pégalo en tu sitio web o tienda online</li>
                              <li>• Envíalo directamente a tus clientes</li>
                            </ul>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-center mb-4">
                          <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-3">
                            <QrCode size={28} className="text-purple-600" />
                          </div>
                          <h4 className="text-lg font-bold text-gray-900 mb-1">Código QR generado</h4>
                          <p className="text-sm text-gray-600">Descarga y comparte este código</p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex flex-col items-center">
                            <div className="w-72 h-72 bg-white border-4 border-gray-900 rounded-2xl flex items-center justify-center shadow-2xl mb-4 p-3">
                              {/* QR Code completo y denso */}
                              <svg viewBox="0 0 29 29" className="w-full h-full">
                                {/* Cuadrado superior izquierdo */}
                                <rect x="0" y="0" width="7" height="7" fill="black"/>
                                <rect x="1" y="1" width="5" height="5" fill="white"/>
                                <rect x="2" y="2" width="3" height="3" fill="black"/>
                                
                                {/* Cuadrado superior derecho */}
                                <rect x="22" y="0" width="7" height="7" fill="black"/>
                                <rect x="23" y="1" width="5" height="5" fill="white"/>
                                <rect x="24" y="2" width="3" height="3" fill="black"/>
                                
                                {/* Cuadrado inferior izquierdo */}
                                <rect x="0" y="22" width="7" height="7" fill="black"/>
                                <rect x="1" y="23" width="5" height="5" fill="white"/>
                                <rect x="2" y="24" width="3" height="3" fill="black"/>
                                
                                {/* Timing patterns y más datos para llenar */}
                                <rect x="8" y="6" width="1" height="1" fill="black"/>
                                <rect x="9" y="6" width="1" height="1" fill="white"/>
                                <rect x="10" y="6" width="1" height="1" fill="black"/>
                                <rect x="11" y="6" width="1" height="1" fill="white"/>
                                <rect x="12" y="6" width="1" height="1" fill="black"/>
                                <rect x="13" y="6" width="1" height="1" fill="white"/>
                                <rect x="14" y="6" width="1" height="1" fill="black"/>
                                <rect x="15" y="6" width="1" height="1" fill="white"/>
                                <rect x="16" y="6" width="1" height="1" fill="black"/>
                                <rect x="17" y="6" width="1" height="1" fill="white"/>
                                <rect x="18" y="6" width="1" height="1" fill="black"/>
                                <rect x="19" y="6" width="1" height="1" fill="white"/>
                                <rect x="20" y="6" width="1" height="1" fill="black"/>
                                <rect x="21" y="6" width="1" height="1" fill="white"/>
                                
                                <rect x="6" y="8" width="1" height="1" fill="black"/>
                                <rect x="6" y="9" width="1" height="1" fill="white"/>
                                <rect x="6" y="10" width="1" height="1" fill="black"/>
                                <rect x="6" y="11" width="1" height="1" fill="white"/>
                                <rect x="6" y="12" width="1" height="1" fill="black"/>
                                <rect x="6" y="13" width="1" height="1" fill="white"/>
                                <rect x="6" y="14" width="1" height="1" fill="black"/>
                                <rect x="6" y="15" width="1" height="1" fill="white"/>
                                <rect x="6" y="16" width="1" height="1" fill="black"/>
                                <rect x="6" y="17" width="1" height="1" fill="white"/>
                                <rect x="6" y="18" width="1" height="1" fill="black"/>
                                <rect x="6" y="19" width="1" height="1" fill="white"/>
                                <rect x="6" y="20" width="1" height="1" fill="black"/>
                                <rect x="6" y="21" width="1" height="1" fill="white"/>
                                
                                {/* Filas superiores completas */}
                                <rect x="8" y="0" width="1" height="1" fill="black"/>
                                <rect x="9" y="0" width="1" height="1" fill="white"/>
                                <rect x="10" y="0" width="1" height="1" fill="black"/>
                                <rect x="11" y="0" width="1" height="1" fill="black"/>
                                <rect x="12" y="0" width="1" height="1" fill="white"/>
                                <rect x="13" y="0" width="1" height="1" fill="black"/>
                                <rect x="14" y="0" width="1" height="1" fill="white"/>
                                <rect x="15" y="0" width="1" height="1" fill="black"/>
                                <rect x="16" y="0" width="1" height="1" fill="black"/>
                                <rect x="17" y="0" width="1" height="1" fill="white"/>
                                <rect x="18" y="0" width="1" height="1" fill="black"/>
                                <rect x="19" y="0" width="1" height="1" fill="black"/>
                                <rect x="20" y="0" width="1" height="1" fill="white"/>
                                <rect x="21" y="0" width="1" height="1" fill="black"/>
                                
                                <rect x="8" y="1" width="1" height="1" fill="white"/>
                                <rect x="9" y="1" width="1" height="1" fill="black"/>
                                <rect x="10" y="1" width="1" height="1" fill="black"/>
                                <rect x="11" y="1" width="1" height="1" fill="white"/>
                                <rect x="12" y="1" width="1" height="1" fill="black"/>
                                <rect x="13" y="1" width="1" height="1" fill="black"/>
                                <rect x="14" y="1" width="1" height="1" fill="black"/>
                                <rect x="15" y="1" width="1" height="1" fill="white"/>
                                <rect x="16" y="1" width="1" height="1" fill="black"/>
                                <rect x="17" y="1" width="1" height="1" fill="black"/>
                                <rect x="18" y="1" width="1" height="1" fill="white"/>
                                <rect x="19" y="1" width="1" height="1" fill="black"/>
                                <rect x="20" y="1" width="1" height="1" fill="black"/>
                                <rect x="21" y="1" width="1" height="1" fill="white"/>
                                
                                <rect x="8" y="2" width="1" height="1" fill="black"/>
                                <rect x="9" y="2" width="1" height="1" fill="white"/>
                                <rect x="10" y="2" width="1" height="1" fill="black"/>
                                <rect x="11" y="2" width="1" height="1" fill="black"/>
                                <rect x="12" y="2" width="1" height="1" fill="black"/>
                                <rect x="13" y="2" width="1" height="1" fill="white"/>
                                <rect x="14" y="2" width="1" height="1" fill="black"/>
                                <rect x="15" y="2" width="1" height="1" fill="black"/>
                                <rect x="16" y="2" width="1" height="1" fill="white"/>
                                <rect x="17" y="2" width="1" height="1" fill="black"/>
                                <rect x="18" y="2" width="1" height="1" fill="black"/>
                                <rect x="19" y="2" width="1" height="1" fill="white"/>
                                <rect x="20" y="2" width="1" height="1" fill="black"/>
                                <rect x="21" y="2" width="1" height="1" fill="black"/>
                                
                                <rect x="8" y="3" width="1" height="1" fill="white"/>
                                <rect x="9" y="3" width="1" height="1" fill="black"/>
                                <rect x="10" y="3" width="1" height="1" fill="black"/>
                                <rect x="11" y="3" width="1" height="1" fill="black"/>
                                <rect x="12" y="3" width="1" height="1" fill="white"/>
                                <rect x="13" y="3" width="1" height="1" fill="black"/>
                                <rect x="14" y="3" width="1" height="1" fill="black"/>
                                <rect x="15" y="3" width="1" height="1" fill="white"/>
                                <rect x="16" y="3" width="1" height="1" fill="black"/>
                                <rect x="17" y="3" width="1" height="1" fill="white"/>
                                <rect x="18" y="3" width="1" height="1" fill="black"/>
                                <rect x="19" y="3" width="1" height="1" fill="black"/>
                                <rect x="20" y="3" width="1" height="1" fill="white"/>
                                <rect x="21" y="3" width="1" height="1" fill="black"/>
                                
                                <rect x="8" y="4" width="1" height="1" fill="black"/>
                                <rect x="9" y="4" width="1" height="1" fill="black"/>
                                <rect x="10" y="4" width="1" height="1" fill="white"/>
                                <rect x="11" y="4" width="1" height="1" fill="black"/>
                                <rect x="12" y="4" width="1" height="1" fill="black"/>
                                <rect x="13" y="4" width="1" height="1" fill="black"/>
                                <rect x="14" y="4" width="1" height="1" fill="white"/>
                                <rect x="15" y="4" width="1" height="1" fill="black"/>
                                <rect x="16" y="4" width="1" height="1" fill="black"/>
                                <rect x="17" y="4" width="1" height="1" fill="black"/>
                                <rect x="18" y="4" width="1" height="1" fill="white"/>
                                <rect x="19" y="4" width="1" height="1" fill="black"/>
                                <rect x="20" y="4" width="1" height="1" fill="black"/>
                                <rect x="21" y="4" width="1" height="1" fill="white"/>
                                
                                <rect x="8" y="5" width="1" height="1" fill="white"/>
                                <rect x="9" y="5" width="1" height="1" fill="black"/>
                                <rect x="10" y="5" width="1" height="1" fill="black"/>
                                <rect x="11" y="5" width="1" height="1" fill="white"/>
                                <rect x="12" y="5" width="1" height="1" fill="black"/>
                                <rect x="13" y="5" width="1" height="1" fill="white"/>
                                <rect x="14" y="5" width="1" height="1" fill="black"/>
                                <rect x="15" y="5" width="1" height="1" fill="black"/>
                                <rect x="16" y="5" width="1" height="1" fill="white"/>
                                <rect x="17" y="5" width="1" height="1" fill="black"/>
                                <rect x="18" y="5" width="1" height="1" fill="black"/>
                                <rect x="19" y="5" width="1" height="1" fill="black"/>
                                <rect x="20" y="5" width="1" height="1" fill="white"/>
                                <rect x="21" y="5" width="1" height="1" fill="black"/>
                                
                                {/* Columnas izquierdas */}
                                <rect x="0" y="8" width="1" height="1" fill="black"/>
                                <rect x="1" y="8" width="1" height="1" fill="white"/>
                                <rect x="2" y="8" width="1" height="1" fill="black"/>
                                <rect x="3" y="8" width="1" height="1" fill="black"/>
                                <rect x="4" y="8" width="1" height="1" fill="white"/>
                                <rect x="5" y="8" width="1" height="1" fill="black"/>
                                
                                <rect x="0" y="9" width="1" height="1" fill="white"/>
                                <rect x="1" y="9" width="1" height="1" fill="black"/>
                                <rect x="2" y="9" width="1" height="1" fill="black"/>
                                <rect x="3" y="9" width="1" height="1" fill="white"/>
                                <rect x="4" y="9" width="1" height="1" fill="black"/>
                                <rect x="5" y="9" width="1" height="1" fill="black"/>
                                
                                <rect x="0" y="10" width="1" height="1" fill="black"/>
                                <rect x="1" y="10" width="1" height="1" fill="black"/>
                                <rect x="2" y="10" width="1" height="1" fill="white"/>
                                <rect x="3" y="10" width="1" height="1" fill="black"/>
                                <rect x="4" y="10" width="1" height="1" fill="black"/>
                                <rect x="5" y="10" width="1" height="1" fill="white"/>
                                
                                <rect x="0" y="11" width="1" height="1" fill="white"/>
                                <rect x="1" y="11" width="1" height="1" fill="black"/>
                                <rect x="2" y="11" width="1" height="1" fill="black"/>
                                <rect x="3" y="11" width="1" height="1" fill="black"/>
                                <rect x="4" y="11" width="1" height="1" fill="white"/>
                                <rect x="5" y="11" width="1" height="1" fill="black"/>
                                
                                <rect x="0" y="12" width="1" height="1" fill="black"/>
                                <rect x="1" y="12" width="1" height="1" fill="white"/>
                                <rect x="2" y="12" width="1" height="1" fill="black"/>
                                <rect x="3" y="12" width="1" height="1" fill="white"/>
                                <rect x="4" y="12" width="1" height="1" fill="black"/>
                                <rect x="5" y="12" width="1" height="1" fill="black"/>
                                
                                <rect x="0" y="13" width="1" height="1" fill="white"/>
                                <rect x="1" y="13" width="1" height="1" fill="black"/>
                                <rect x="2" y="13" width="1" height="1" fill="black"/>
                                <rect x="3" y="13" width="1" height="1" fill="black"/>
                                <rect x="4" y="13" width="1" height="1" fill="white"/>
                                <rect x="5" y="13" width="1" height="1" fill="black"/>
                                
                                <rect x="0" y="14" width="1" height="1" fill="black"/>
                                <rect x="1" y="14" width="1" height="1" fill="black"/>
                                <rect x="2" y="14" width="1" height="1" fill="white"/>
                                <rect x="3" y="14" width="1" height="1" fill="black"/>
                                <rect x="4" y="14" width="1" height="1" fill="black"/>
                                <rect x="5" y="14" width="1" height="1" fill="white"/>
                                
                                <rect x="0" y="15" width="1" height="1" fill="white"/>
                                <rect x="1" y="15" width="1" height="1" fill="black"/>
                                <rect x="2" y="15" width="1" height="1" fill="black"/>
                                <rect x="3" y="15" width="1" height="1" fill="white"/>
                                <rect x="4" y="15" width="1" height="1" fill="black"/>
                                <rect x="5" y="15" width="1" height="1" fill="black"/>
                                
                                <rect x="0" y="16" width="1" height="1" fill="black"/>
                                <rect x="1" y="16" width="1" height="1" fill="white"/>
                                <rect x="2" y="16" width="1" height="1" fill="black"/>
                                <rect x="3" y="16" width="1" height="1" fill="black"/>
                                <rect x="4" y="16" width="1" height="1" fill="white"/>
                                <rect x="5" y="16" width="1" height="1" fill="black"/>
                                
                                <rect x="0" y="17" width="1" height="1" fill="white"/>
                                <rect x="1" y="17" width="1" height="1" fill="black"/>
                                <rect x="2" y="17" width="1" height="1" fill="black"/>
                                <rect x="3" y="17" width="1" height="1" fill="white"/>
                                <rect x="4" y="17" width="1" height="1" fill="black"/>
                                <rect x="5" y="17" width="1" height="1" fill="white"/>
                                
                                <rect x="0" y="18" width="1" height="1" fill="black"/>
                                <rect x="1" y="18" width="1" height="1" fill="black"/>
                                <rect x="2" y="18" width="1" height="1" fill="white"/>
                                <rect x="3" y="18" width="1" height="1" fill="black"/>
                                <rect x="4" y="18" width="1" height="1" fill="black"/>
                                <rect x="5" y="18" width="1" height="1" fill="black"/>
                                
                                <rect x="0" y="19" width="1" height="1" fill="white"/>
                                <rect x="1" y="19" width="1" height="1" fill="black"/>
                                <rect x="2" y="19" width="1" height="1" fill="black"/>
                                <rect x="3" y="19" width="1" height="1" fill="white"/>
                                <rect x="4" y="19" width="1" height="1" fill="black"/>
                                <rect x="5" y="19" width="1" height="1" fill="white"/>
                                
                                <rect x="0" y="20" width="1" height="1" fill="black"/>
                                <rect x="1" y="20" width="1" height="1" fill="white"/>
                                <rect x="2" y="20" width="1" height="1" fill="black"/>
                                <rect x="3" y="20" width="1" height="1" fill="black"/>
                                <rect x="4" y="20" width="1" height="1" fill="white"/>
                                <rect x="5" y="20" width="1" height="1" fill="black"/>
                                
                                <rect x="0" y="21" width="1" height="1" fill="white"/>
                                <rect x="1" y="21" width="1" height="1" fill="black"/>
                                <rect x="2" y="21" width="1" height="1" fill="black"/>
                                <rect x="3" y="21" width="1" height="1" fill="white"/>
                                <rect x="4" y="21" width="1" height="1" fill="black"/>
                                <rect x="5" y="21" width="1" height="1" fill="black"/>
                                
                                {/* Zona central - Filas 7-21, altamente densas */}
                                <rect x="7" y="7" width="1" height="1" fill="white"/>
                                <rect x="8" y="7" width="1" height="1" fill="black"/>
                                <rect x="9" y="7" width="1" height="1" fill="black"/>
                                <rect x="10" y="7" width="1" height="1" fill="white"/>
                                <rect x="11" y="7" width="1" height="1" fill="black"/>
                                <rect x="12" y="7" width="1" height="1" fill="white"/>
                                <rect x="13" y="7" width="1" height="1" fill="black"/>
                                <rect x="14" y="7" width="1" height="1" fill="black"/>
                                <rect x="15" y="7" width="1" height="1" fill="white"/>
                                <rect x="16" y="7" width="1" height="1" fill="black"/>
                                <rect x="17" y="7" width="1" height="1" fill="black"/>
                                <rect x="18" y="7" width="1" height="1" fill="black"/>
                                <rect x="19" y="7" width="1" height="1" fill="white"/>
                                <rect x="20" y="7" width="1" height="1" fill="black"/>
                                <rect x="21" y="7" width="1" height="1" fill="white"/>
                                
                                {/* Fila 8 */}
                                <rect x="7" y="8" width="1" height="1" fill="black"/>
                                <rect x="8" y="8" width="1" height="1" fill="black"/>
                                <rect x="9" y="8" width="1" height="1" fill="black"/>
                                <rect x="10" y="8" width="1" height="1" fill="white"/>
                                <rect x="11" y="8" width="1" height="1" fill="black"/>
                                <rect x="12" y="8" width="1" height="1" fill="white"/>
                                <rect x="13" y="8" width="1" height="1" fill="black"/>
                                <rect x="14" y="8" width="1" height="1" fill="black"/>
                                <rect x="15" y="8" width="1" height="1" fill="black"/>
                                <rect x="16" y="8" width="1" height="1" fill="white"/>
                                <rect x="17" y="8" width="1" height="1" fill="black"/>
                                <rect x="18" y="8" width="1" height="1" fill="white"/>
                                <rect x="19" y="8" width="1" height="1" fill="black"/>
                                <rect x="20" y="8" width="1" height="1" fill="black"/>
                                <rect x="21" y="8" width="1" height="1" fill="white"/>
                                
                                {/* Fila 9 */}
                                <rect x="7" y="9" width="1" height="1" fill="white"/>
                                <rect x="8" y="9" width="1" height="1" fill="black"/>
                                <rect x="9" y="9" width="1" height="1" fill="white"/>
                                <rect x="10" y="9" width="1" height="1" fill="black"/>
                                <rect x="11" y="9" width="1" height="1" fill="black"/>
                                <rect x="12" y="9" width="1" height="1" fill="black"/>
                                <rect x="13" y="9" width="1" height="1" fill="white"/>
                                <rect x="14" y="9" width="1" height="1" fill="black"/>
                                <rect x="15" y="9" width="1" height="1" fill="white"/>
                                <rect x="16" y="9" width="1" height="1" fill="black"/>
                                <rect x="17" y="9" width="1" height="1" fill="white"/>
                                <rect x="18" y="9" width="1" height="1" fill="black"/>
                                <rect x="19" y="9" width="1" height="1" fill="white"/>
                                <rect x="20" y="9" width="1" height="1" fill="black"/>
                                <rect x="21" y="9" width="1" height="1" fill="black"/>
                                
                                {/* Fila 10 */}
                                <rect x="7" y="10" width="1" height="1" fill="black"/>
                                <rect x="8" y="10" width="1" height="1" fill="white"/>
                                <rect x="9" y="10" width="1" height="1" fill="black"/>
                                <rect x="10" y="10" width="1" height="1" fill="black"/>
                                <rect x="11" y="10" width="1" height="1" fill="white"/>
                                <rect x="12" y="10" width="1" height="1" fill="black"/>
                                <rect x="13" y="10" width="1" height="1" fill="black"/>
                                <rect x="14" y="10" width="1" height="1" fill="white"/>
                                <rect x="15" y="10" width="1" height="1" fill="black"/>
                                <rect x="16" y="10" width="1" height="1" fill="black"/>
                                <rect x="17" y="10" width="1" height="1" fill="black"/>
                                <rect x="18" y="10" width="1" height="1" fill="black"/>
                                <rect x="19" y="10" width="1" height="1" fill="black"/>
                                <rect x="20" y="10" width="1" height="1" fill="white"/>
                                <rect x="21" y="10" width="1" height="1" fill="black"/>
                                
                                {/* Filas 11-21 con máxima densidad */}
                                <rect x="7" y="11" width="1" height="1" fill="white"/>
                                <rect x="8" y="11" width="1" height="1" fill="black"/>
                                <rect x="9" y="11" width="1" height="1" fill="white"/>
                                <rect x="10" y="11" width="1" height="1" fill="black"/>
                                <rect x="11" y="11" width="1" height="1" fill="black"/>
                                <rect x="12" y="11" width="1" height="1" fill="black"/>
                                <rect x="13" y="11" width="1" height="1" fill="white"/>
                                <rect x="14" y="11" width="1" height="1" fill="black"/>
                                <rect x="15" y="11" width="1" height="1" fill="black"/>
                                <rect x="16" y="11" width="1" height="1" fill="black"/>
                                <rect x="17" y="11" width="1" height="1" fill="white"/>
                                <rect x="18" y="11" width="1" height="1" fill="black"/>
                                <rect x="19" y="11" width="1" height="1" fill="white"/>
                                <rect x="20" y="11" width="1" height="1" fill="black"/>
                                <rect x="21" y="11" width="1" height="1" fill="white"/>
                                
                                <rect x="7" y="12" width="1" height="1" fill="black"/>
                                <rect x="8" y="12" width="1" height="1" fill="white"/>
                                <rect x="9" y="12" width="1" height="1" fill="black"/>
                                <rect x="10" y="12" width="1" height="1" fill="black"/>
                                <rect x="11" y="12" width="1" height="1" fill="black"/>
                                <rect x="12" y="12" width="1" height="1" fill="white"/>
                                <rect x="13" y="12" width="1" height="1" fill="black"/>
                                <rect x="14" y="12" width="1" height="1" fill="white"/>
                                <rect x="15" y="12" width="1" height="1" fill="black"/>
                                <rect x="16" y="12" width="1" height="1" fill="white"/>
                                <rect x="17" y="12" width="1" height="1" fill="black"/>
                                <rect x="18" y="12" width="1" height="1" fill="white"/>
                                <rect x="19" y="12" width="1" height="1" fill="black"/>
                                <rect x="20" y="12" width="1" height="1" fill="black"/>
                                <rect x="21" y="12" width="1" height="1" fill="black"/>
                                
                                <rect x="7" y="13" width="1" height="1" fill="white"/>
                                <rect x="8" y="13" width="1" height="1" fill="black"/>
                                <rect x="9" y="13" width="1" height="1" fill="black"/>
                                <rect x="10" y="13" width="1" height="1" fill="white"/>
                                <rect x="11" y="13" width="1" height="1" fill="black"/>
                                <rect x="12" y="13" width="1" height="1" fill="black"/>
                                <rect x="13" y="13" width="1" height="1" fill="white"/>
                                <rect x="14" y="13" width="1" height="1" fill="black"/>
                                <rect x="15" y="13" width="1" height="1" fill="black"/>
                                <rect x="16" y="13" width="1" height="1" fill="black"/>
                                <rect x="17" y="13" width="1" height="1" fill="black"/>
                                <rect x="18" y="13" width="1" height="1" fill="white"/>
                                <rect x="19" y="13" width="1" height="1" fill="black"/>
                                <rect x="20" y="13" width="1" height="1" fill="white"/>
                                <rect x="21" y="13" width="1" height="1" fill="black"/>
                                
                                <rect x="7" y="14" width="1" height="1" fill="black"/>
                                <rect x="8" y="14" width="1" height="1" fill="white"/>
                                <rect x="9" y="14" width="1" height="1" fill="black"/>
                                <rect x="10" y="14" width="1" height="1" fill="black"/>
                                <rect x="11" y="14" width="1" height="1" fill="black"/>
                                <rect x="12" y="14" width="1" height="1" fill="white"/>
                                <rect x="13" y="14" width="1" height="1" fill="black"/>
                                <rect x="14" y="14" width="1" height="1" fill="black"/>
                                <rect x="15" y="14" width="1" height="1" fill="white"/>
                                <rect x="16" y="14" width="1" height="1" fill="black"/>
                                <rect x="17" y="14" width="1" height="1" fill="white"/>
                                <rect x="18" y="14" width="1" height="1" fill="black"/>
                                <rect x="19" y="14" width="1" height="1" fill="white"/>
                                <rect x="20" y="14" width="1" height="1" fill="black"/>
                                <rect x="21" y="14" width="1" height="1" fill="black"/>
                                
                                <rect x="7" y="15" width="1" height="1" fill="white"/>
                                <rect x="8" y="15" width="1" height="1" fill="black"/>
                                <rect x="9" y="15" width="1" height="1" fill="white"/>
                                <rect x="10" y="15" width="1" height="1" fill="black"/>
                                <rect x="11" y="15" width="1" height="1" fill="black"/>
                                <rect x="12" y="15" width="1" height="1" fill="black"/>
                                <rect x="13" y="15" width="1" height="1" fill="white"/>
                                <rect x="14" y="15" width="1" height="1" fill="black"/>
                                <rect x="15" y="15" width="1" height="1" fill="black"/>
                                <rect x="16" y="15" width="1" height="1" fill="white"/>
                                <rect x="17" y="15" width="1" height="1" fill="black"/>
                                <rect x="18" y="15" width="1" height="1" fill="white"/>
                                <rect x="19" y="15" width="1" height="1" fill="black"/>
                                <rect x="20" y="15" width="1" height="1" fill="black"/>
                                <rect x="21" y="15" width="1" height="1" fill="white"/>
                                
                                <rect x="7" y="16" width="1" height="1" fill="black"/>
                                <rect x="8" y="16" width="1" height="1" fill="white"/>
                                <rect x="9" y="16" width="1" height="1" fill="black"/>
                                <rect x="10" y="16" width="1" height="1" fill="white"/>
                                <rect x="11" y="16" width="1" height="1" fill="black"/>
                                <rect x="12" y="16" width="1" height="1" fill="white"/>
                                <rect x="13" y="16" width="1" height="1" fill="black"/>
                                <rect x="14" y="16" width="1" height="1" fill="black"/>
                                <rect x="15" y="16" width="1" height="1" fill="black"/>
                                <rect x="16" y="16" width="1" height="1" fill="black"/>
                                <rect x="17" y="16" width="1" height="1" fill="white"/>
                                <rect x="18" y="16" width="1" height="1" fill="black"/>
                                <rect x="19" y="16" width="1" height="1" fill="white"/>
                                <rect x="20" y="16" width="1" height="1" fill="black"/>
                                <rect x="21" y="16" width="1" height="1" fill="black"/>
                                
                                <rect x="7" y="17" width="1" height="1" fill="white"/>
                                <rect x="8" y="17" width="1" height="1" fill="black"/>
                                <rect x="9" y="17" width="1" height="1" fill="white"/>
                                <rect x="10" y="17" width="1" height="1" fill="black"/>
                                <rect x="11" y="17" width="1" height="1" fill="white"/>
                                <rect x="12" y="17" width="1" height="1" fill="black"/>
                                <rect x="13" y="17" width="1" height="1" fill="black"/>
                                <rect x="14" y="17" width="1" height="1" fill="white"/>
                                <rect x="15" y="17" width="1" height="1" fill="black"/>
                                <rect x="16" y="17" width="1" height="1" fill="white"/>
                                <rect x="17" y="17" width="1" height="1" fill="black"/>
                                <rect x="18" y="17" width="1" height="1" fill="black"/>
                                <rect x="19" y="17" width="1" height="1" fill="black"/>
                                <rect x="20" y="17" width="1" height="1" fill="white"/>
                                <rect x="21" y="17" width="1" height="1" fill="black"/>
                                
                                <rect x="7" y="18" width="1" height="1" fill="black"/>
                                <rect x="8" y="18" width="1" height="1" fill="white"/>
                                <rect x="9" y="18" width="1" height="1" fill="black"/>
                                <rect x="10" y="18" width="1" height="1" fill="white"/>
                                <rect x="11" y="18" width="1" height="1" fill="black"/>
                                <rect x="12" y="18" width="1" height="1" fill="black"/>
                                <rect x="13" y="18" width="1" height="1" fill="white"/>
                                <rect x="14" y="18" width="1" height="1" fill="black"/>
                                <rect x="15" y="18" width="1" height="1" fill="white"/>
                                <rect x="16" y="18" width="1" height="1" fill="black"/>
                                <rect x="17" y="18" width="1" height="1" fill="black"/>
                                <rect x="18" y="18" width="1" height="1" fill="white"/>
                                <rect x="19" y="18" width="1" height="1" fill="black"/>
                                <rect x="20" y="18" width="1" height="1" fill="white"/>
                                <rect x="21" y="18" width="1" height="1" fill="black"/>
                                
                                <rect x="7" y="19" width="1" height="1" fill="white"/>
                                <rect x="8" y="19" width="1" height="1" fill="black"/>
                                <rect x="9" y="19" width="1" height="1" fill="white"/>
                                <rect x="10" y="19" width="1" height="1" fill="black"/>
                                <rect x="11" y="19" width="1" height="1" fill="black"/>
                                <rect x="12" y="19" width="1" height="1" fill="white"/>
                                <rect x="13" y="19" width="1" height="1" fill="black"/>
                                <rect x="14" y="19" width="1" height="1" fill="black"/>
                                <rect x="15" y="19" width="1" height="1" fill="black"/>
                                <rect x="16" y="19" width="1" height="1" fill="white"/>
                                <rect x="17" y="19" width="1" height="1" fill="black"/>
                                <rect x="18" y="19" width="1" height="1" fill="black"/>
                                <rect x="19" y="19" width="1" height="1" fill="white"/>
                                <rect x="20" y="19" width="1" height="1" fill="black"/>
                                <rect x="21" y="19" width="1" height="1" fill="black"/>
                                
                                <rect x="7" y="20" width="1" height="1" fill="black"/>
                                <rect x="8" y="20" width="1" height="1" fill="white"/>
                                <rect x="9" y="20" width="1" height="1" fill="black"/>
                                <rect x="10" y="20" width="1" height="1" fill="white"/>
                                <rect x="11" y="20" width="1" height="1" fill="black"/>
                                <rect x="12" y="20" width="1" height="1" fill="black"/>
                                <rect x="13" y="20" width="1" height="1" fill="black"/>
                                <rect x="14" y="20" width="1" height="1" fill="black"/>
                                <rect x="15" y="20" width="1" height="1" fill="white"/>
                                <rect x="16" y="20" width="1" height="1" fill="black"/>
                                <rect x="17" y="20" width="1" height="1" fill="black"/>
                                <rect x="18" y="20" width="1" height="1" fill="white"/>
                                <rect x="19" y="20" width="1" height="1" fill="black"/>
                                <rect x="20" y="20" width="1" height="1" fill="white"/>
                                <rect x="21" y="20" width="1" height="1" fill="black"/>
                                
                                <rect x="7" y="21" width="1" height="1" fill="white"/>
                                <rect x="8" y="21" width="1" height="1" fill="black"/>
                                <rect x="9" y="21" width="1" height="1" fill="white"/>
                                <rect x="10" y="21" width="1" height="1" fill="black"/>
                                <rect x="11" y="21" width="1" height="1" fill="black"/>
                                <rect x="12" y="21" width="1" height="1" fill="white"/>
                                <rect x="13" y="21" width="1" height="1" fill="black"/>
                                <rect x="14" y="21" width="1" height="1" fill="white"/>
                                <rect x="15" y="21" width="1" height="1" fill="black"/>
                                <rect x="16" y="21" width="1" height="1" fill="black"/>
                                <rect x="17" y="21" width="1" height="1" fill="white"/>
                                <rect x="18" y="21" width="1" height="1" fill="black"/>
                                <rect x="19" y="21" width="1" height="1" fill="black"/>
                                <rect x="20" y="21" width="1" height="1" fill="white"/>
                                <rect x="21" y="21" width="1" height="1" fill="black"/>
                                
                                {/* Zona derecha densamente poblada */}
                                <rect x="22" y="8" width="1" height="1" fill="black"/>
                                <rect x="23" y="8" width="1" height="1" fill="black"/>
                                <rect x="24" y="8" width="1" height="1" fill="white"/>
                                <rect x="25" y="8" width="1" height="1" fill="black"/>
                                <rect x="26" y="8" width="1" height="1" fill="white"/>
                                <rect x="27" y="8" width="1" height="1" fill="black"/>
                                <rect x="28" y="8" width="1" height="1" fill="black"/>
                                
                                <rect x="22" y="9" width="1" height="1" fill="black"/>
                                <rect x="23" y="9" width="1" height="1" fill="white"/>
                                <rect x="24" y="9" width="1" height="1" fill="black"/>
                                <rect x="25" y="9" width="1" height="1" fill="white"/>
                                <rect x="26" y="9" width="1" height="1" fill="black"/>
                                <rect x="27" y="9" width="1" height="1" fill="black"/>
                                <rect x="28" y="9" width="1" height="1" fill="white"/>
                                
                                <rect x="22" y="10" width="1" height="1" fill="white"/>
                                <rect x="23" y="10" width="1" height="1" fill="black"/>
                                <rect x="24" y="10" width="1" height="1" fill="black"/>
                                <rect x="25" y="10" width="1" height="1" fill="black"/>
                                <rect x="26" y="10" width="1" height="1" fill="white"/>
                                <rect x="27" y="10" width="1" height="1" fill="black"/>
                                <rect x="28" y="10" width="1" height="1" fill="black"/>
                                
                                <rect x="22" y="11" width="1" height="1" fill="black"/>
                                <rect x="23" y="11" width="1" height="1" fill="white"/>
                                <rect x="24" y="11" width="1" height="1" fill="black"/>
                                <rect x="25" y="11" width="1" height="1" fill="black"/>
                                <rect x="26" y="11" width="1" height="1" fill="black"/>
                                <rect x="27" y="11" width="1" height="1" fill="white"/>
                                <rect x="28" y="11" width="1" height="1" fill="black"/>
                                
                                <rect x="22" y="12" width="1" height="1" fill="white"/>
                                <rect x="23" y="12" width="1" height="1" fill="black"/>
                                <rect x="24" y="12" width="1" height="1" fill="white"/>
                                <rect x="25" y="12" width="1" height="1" fill="black"/>
                                <rect x="26" y="12" width="1" height="1" fill="white"/>
                                <rect x="27" y="12" width="1" height="1" fill="black"/>
                                <rect x="28" y="12" width="1" height="1" fill="white"/>
                                
                                <rect x="22" y="13" width="1" height="1" fill="black"/>
                                <rect x="23" y="13" width="1" height="1" fill="black"/>
                                <rect x="24" y="13" width="1" height="1" fill="black"/>
                                <rect x="25" y="13" width="1" height="1" fill="white"/>
                                <rect x="26" y="13" width="1" height="1" fill="black"/>
                                <rect x="27" y="13" width="1" height="1" fill="white"/>
                                <rect x="28" y="13" width="1" height="1" fill="black"/>
                                
                                <rect x="22" y="14" width="1" height="1" fill="black"/>
                                <rect x="23" y="14" width="1" height="1" fill="white"/>
                                <rect x="24" y="14" width="1" height="1" fill="black"/>
                                <rect x="25" y="14" width="1" height="1" fill="black"/>
                                <rect x="26" y="14" width="1" height="1" fill="black"/>
                                <rect x="27" y="14" width="1" height="1" fill="black"/>
                                <rect x="28" y="14" width="1" height="1" fill="white"/>
                                
                                <rect x="22" y="15" width="1" height="1" fill="white"/>
                                <rect x="23" y="15" width="1" height="1" fill="black"/>
                                <rect x="24" y="15" width="1" height="1" fill="black"/>
                                <rect x="25" y="15" width="1" height="1" fill="white"/>
                                <rect x="26" y="15" width="1" height="1" fill="black"/>
                                <rect x="27" y="15" width="1" height="1" fill="white"/>
                                <rect x="28" y="15" width="1" height="1" fill="black"/>
                                
                                <rect x="22" y="16" width="1" height="1" fill="black"/>
                                <rect x="23" y="16" width="1" height="1" fill="white"/>
                                <rect x="24" y="16" width="1" height="1" fill="black"/>
                                <rect x="25" y="16" width="1" height="1" fill="black"/>
                                <rect x="26" y="16" width="1" height="1" fill="white"/>
                                <rect x="27" y="16" width="1" height="1" fill="black"/>
                                <rect x="28" y="16" width="1" height="1" fill="black"/>
                                
                                <rect x="22" y="17" width="1" height="1" fill="white"/>
                                <rect x="23" y="17" width="1" height="1" fill="black"/>
                                <rect x="24" y="17" width="1" height="1" fill="white"/>
                                <rect x="25" y="17" width="1" height="1" fill="black"/>
                                <rect x="26" y="17" width="1" height="1" fill="black"/>
                                <rect x="27" y="17" width="1" height="1" fill="white"/>
                                <rect x="28" y="17" width="1" height="1" fill="black"/>
                                
                                <rect x="22" y="18" width="1" height="1" fill="black"/>
                                <rect x="23" y="18" width="1" height="1" fill="black"/>
                                <rect x="24" y="18" width="1" height="1" fill="black"/>
                                <rect x="25" y="18" width="1" height="1" fill="white"/>
                                <rect x="26" y="18" width="1" height="1" fill="black"/>
                                <rect x="27" y="18" width="1" height="1" fill="black"/>
                                <rect x="28" y="18" width="1" height="1" fill="white"/>
                                
                                <rect x="22" y="19" width="1" height="1" fill="black"/>
                                <rect x="23" y="19" width="1" height="1" fill="white"/>
                                <rect x="24" y="19" width="1" height="1" fill="black"/>
                                <rect x="25" y="19" width="1" height="1" fill="black"/>
                                <rect x="26" y="19" width="1" height="1" fill="black"/>
                                <rect x="27" y="19" width="1" height="1" fill="white"/>
                                <rect x="28" y="19" width="1" height="1" fill="black"/>
                                
                                <rect x="22" y="20" width="1" height="1" fill="white"/>
                                <rect x="23" y="20" width="1" height="1" fill="black"/>
                                <rect x="24" y="20" width="1" height="1" fill="black"/>
                                <rect x="25" y="20" width="1" height="1" fill="white"/>
                                <rect x="26" y="20" width="1" height="1" fill="black"/>
                                <rect x="27" y="20" width="1" height="1" fill="black"/>
                                <rect x="28" y="20" width="1" height="1" fill="black"/>
                                
                                <rect x="22" y="21" width="1" height="1" fill="black"/>
                                <rect x="23" y="21" width="1" height="1" fill="white"/>
                                <rect x="24" y="21" width="1" height="1" fill="black"/>
                                <rect x="25" y="21" width="1" height="1" fill="white"/>
                                <rect x="26" y="21" width="1" height="1" fill="black"/>
                                <rect x="27" y="21" width="1" height="1" fill="black"/>
                                <rect x="28" y="21" width="1" height="1" fill="white"/>
                                
                                {/* Zona inferior completa y densa */}
                                <rect x="8" y="22" width="1" height="1" fill="black"/>
                                <rect x="9" y="22" width="1" height="1" fill="black"/>
                                <rect x="10" y="22" width="1" height="1" fill="white"/>
                                <rect x="11" y="22" width="1" height="1" fill="black"/>
                                <rect x="12" y="22" width="1" height="1" fill="white"/>
                                <rect x="13" y="22" width="1" height="1" fill="black"/>
                                <rect x="14" y="22" width="1" height="1" fill="black"/>
                                <rect x="15" y="22" width="1" height="1" fill="white"/>
                                <rect x="16" y="22" width="1" height="1" fill="black"/>
                                <rect x="17" y="22" width="1" height="1" fill="white"/>
                                <rect x="18" y="22" width="1" height="1" fill="black"/>
                                <rect x="19" y="22" width="1" height="1" fill="white"/>
                                <rect x="20" y="22" width="1" height="1" fill="black"/>
                                <rect x="21" y="22" width="1" height="1" fill="black"/>
                                
                                <rect x="8" y="23" width="1" height="1" fill="black"/>
                                <rect x="9" y="23" width="1" height="1" fill="white"/>
                                <rect x="10" y="23" width="1" height="1" fill="black"/>
                                <rect x="11" y="23" width="1" height="1" fill="white"/>
                                <rect x="12" y="23" width="1" height="1" fill="black"/>
                                <rect x="13" y="23" width="1" height="1" fill="black"/>
                                <rect x="14" y="23" width="1" height="1" fill="white"/>
                                <rect x="15" y="23" width="1" height="1" fill="black"/>
                                <rect x="16" y="23" width="1" height="1" fill="white"/>
                                <rect x="17" y="23" width="1" height="1" fill="black"/>
                                <rect x="18" y="23" width="1" height="1" fill="white"/>
                                <rect x="19" y="23" width="1" height="1" fill="black"/>
                                <rect x="20" y="23" width="1" height="1" fill="black"/>
                                <rect x="21" y="23" width="1" height="1" fill="white"/>
                                
                                <rect x="8" y="24" width="1" height="1" fill="white"/>
                                <rect x="9" y="24" width="1" height="1" fill="black"/>
                                <rect x="10" y="24" width="1" height="1" fill="white"/>
                                <rect x="11" y="24" width="1" height="1" fill="black"/>
                                <rect x="12" y="24" width="1" height="1" fill="black"/>
                                <rect x="13" y="24" width="1" height="1" fill="white"/>
                                <rect x="14" y="24" width="1" height="1" fill="black"/>
                                <rect x="15" y="24" width="1" height="1" fill="white"/>
                                <rect x="16" y="24" width="1" height="1" fill="black"/>
                                <rect x="17" y="24" width="1" height="1" fill="black"/>
                                <rect x="18" y="24" width="1" height="1" fill="black"/>
                                <rect x="19" y="24" width="1" height="1" fill="white"/>
                                <rect x="20" y="24" width="1" height="1" fill="black"/>
                                <rect x="21" y="24" width="1" height="1" fill="black"/>
                                
                                <rect x="8" y="25" width="1" height="1" fill="black"/>
                                <rect x="9" y="25" width="1" height="1" fill="white"/>
                                <rect x="10" y="25" width="1" height="1" fill="black"/>
                                <rect x="11" y="25" width="1" height="1" fill="white"/>
                                <rect x="12" y="25" width="1" height="1" fill="black"/>
                                <rect x="13" y="25" width="1" height="1" fill="black"/>
                                <rect x="14" y="25" width="1" height="1" fill="black"/>
                                <rect x="15" y="25" width="1" height="1" fill="black"/>
                                <rect x="16" y="25" width="1" height="1" fill="white"/>
                                <rect x="17" y="25" width="1" height="1" fill="black"/>
                                <rect x="18" y="25" width="1" height="1" fill="white"/>
                                <rect x="19" y="25" width="1" height="1" fill="black"/>
                                <rect x="20" y="25" width="1" height="1" fill="white"/>
                                <rect x="21" y="25" width="1" height="1" fill="black"/>
                                
                                <rect x="8" y="26" width="1" height="1" fill="white"/>
                                <rect x="9" y="26" width="1" height="1" fill="black"/>
                                <rect x="10" y="26" width="1" height="1" fill="white"/>
                                <rect x="11" y="26" width="1" height="1" fill="black"/>
                                <rect x="12" y="26" width="1" height="1" fill="black"/>
                                <rect x="13" y="26" width="1" height="1" fill="white"/>
                                <rect x="14" y="26" width="1" height="1" fill="black"/>
                                <rect x="15" y="26" width="1" height="1" fill="black"/>
                                <rect x="16" y="26" width="1" height="1" fill="black"/>
                                <rect x="17" y="26" width="1" height="1" fill="white"/>
                                <rect x="18" y="26" width="1" height="1" fill="black"/>
                                <rect x="19" y="26" width="1" height="1" fill="white"/>
                                <rect x="20" y="26" width="1" height="1" fill="black"/>
                                <rect x="21" y="26" width="1" height="1" fill="black"/>
                                
                                <rect x="8" y="27" width="1" height="1" fill="black"/>
                                <rect x="9" y="27" width="1" height="1" fill="white"/>
                                <rect x="10" y="27" width="1" height="1" fill="black"/>
                                <rect x="11" y="27" width="1" height="1" fill="black"/>
                                <rect x="12" y="27" width="1" height="1" fill="white"/>
                                <rect x="13" y="27" width="1" height="1" fill="black"/>
                                <rect x="14" y="27" width="1" height="1" fill="white"/>
                                <rect x="15" y="27" width="1" height="1" fill="black"/>
                                <rect x="16" y="27" width="1" height="1" fill="white"/>
                                <rect x="17" y="27" width="1" height="1" fill="black"/>
                                <rect x="18" y="27" width="1" height="1" fill="black"/>
                                <rect x="19" y="27" width="1" height="1" fill="black"/>
                                <rect x="20" y="27" width="1" height="1" fill="white"/>
                                <rect x="21" y="27" width="1" height="1" fill="black"/>
                                
                                <rect x="8" y="28" width="1" height="1" fill="white"/>
                                <rect x="9" y="28" width="1" height="1" fill="black"/>
                                <rect x="10" y="28" width="1" height="1" fill="white"/>
                                <rect x="11" y="28" width="1" height="1" fill="black"/>
                                <rect x="12" y="28" width="1" height="1" fill="black"/>
                                <rect x="13" y="28" width="1" height="1" fill="white"/>
                                <rect x="14" y="28" width="1" height="1" fill="black"/>
                                <rect x="15" y="28" width="1" height="1" fill="black"/>
                                <rect x="16" y="28" width="1" height="1" fill="black"/>
                                <rect x="17" y="28" width="1" height="1" fill="white"/>
                                <rect x="18" y="28" width="1" height="1" fill="black"/>
                                <rect x="19" y="28" width="1" height="1" fill="white"/>
                                <rect x="20" y="28" width="1" height="1" fill="black"/>
                                <rect x="21" y="28" width="1" height="1" fill="black"/>
                                
                                {/* Zona inferior derecha */}
                                <rect x="22" y="22" width="1" height="1" fill="black"/>
                                <rect x="23" y="22" width="1" height="1" fill="white"/>
                                <rect x="24" y="22" width="1" height="1" fill="black"/>
                                <rect x="25" y="22" width="1" height="1" fill="black"/>
                                <rect x="26" y="22" width="1" height="1" fill="white"/>
                                <rect x="27" y="22" width="1" height="1" fill="black"/>
                                <rect x="28" y="22" width="1" height="1" fill="black"/>
                                
                                <rect x="22" y="23" width="1" height="1" fill="white"/>
                                <rect x="23" y="23" width="1" height="1" fill="black"/>
                                <rect x="24" y="23" width="1" height="1" fill="white"/>
                                <rect x="25" y="23" width="1" height="1" fill="black"/>
                                <rect x="26" y="23" width="1" height="1" fill="black"/>
                                <rect x="27" y="23" width="1" height="1" fill="white"/>
                                <rect x="28" y="23" width="1" height="1" fill="black"/>
                                
                                <rect x="22" y="24" width="1" height="1" fill="black"/>
                                <rect x="23" y="24" width="1" height="1" fill="white"/>
                                <rect x="24" y="24" width="1" height="1" fill="black"/>
                                <rect x="25" y="24" width="1" height="1" fill="white"/>
                                <rect x="26" y="24" width="1" height="1" fill="black"/>
                                <rect x="27" y="24" width="1" height="1" fill="black"/>
                                <rect x="28" y="24" width="1" height="1" fill="white"/>
                                
                                <rect x="22" y="25" width="1" height="1" fill="white"/>
                                <rect x="23" y="25" width="1" height="1" fill="black"/>
                                <rect x="24" y="25" width="1" height="1" fill="white"/>
                                <rect x="25" y="25" width="1" height="1" fill="black"/>
                                <rect x="26" y="25" width="1" height="1" fill="black"/>
                                <rect x="27" y="25" width="1" height="1" fill="white"/>
                                <rect x="28" y="25" width="1" height="1" fill="black"/>
                                
                                <rect x="22" y="26" width="1" height="1" fill="black"/>
                                <rect x="23" y="26" width="1" height="1" fill="white"/>
                                <rect x="24" y="26" width="1" height="1" fill="black"/>
                                <rect x="25" y="26" width="1" height="1" fill="black"/>
                                <rect x="26" y="26" width="1" height="1" fill="white"/>
                                <rect x="27" y="26" width="1" height="1" fill="black"/>
                                <rect x="28" y="26" width="1" height="1" fill="black"/>
                                
                                <rect x="22" y="27" width="1" height="1" fill="white"/>
                                <rect x="23" y="27" width="1" height="1" fill="black"/>
                                <rect x="24" y="27" width="1" height="1" fill="white"/>
                                <rect x="25" y="27" width="1" height="1" fill="black"/>
                                <rect x="26" y="27" width="1" height="1" fill="black"/>
                                <rect x="27" y="27" width="1" height="1" fill="white"/>
                                <rect x="28" y="27" width="1" height="1" fill="black"/>
                                
                                <rect x="22" y="28" width="1" height="1" fill="black"/>
                                <rect x="23" y="28" width="1" height="1" fill="white"/>
                                <rect x="24" y="28" width="1" height="1" fill="black"/>
                                <rect x="25" y="28" width="1" height="1" fill="black"/>
                                <rect x="26" y="28" width="1" height="1" fill="white"/>
                                <rect x="27" y="28" width="1" height="1" fill="black"/>
                                <rect x="28" y="28" width="1" height="1" fill="black"/>
                              </svg>
                            </div>
                          </div>

                          <button
                            onClick={handleDownloadQR}
                            className="w-full py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                          >
                            <Download size={20} />
                            Descargar código QR
                          </button>

                          <div className="bg-white border-2 border-gray-200 rounded-xl p-3.5">
                            <p className="text-xs font-semibold text-gray-900 mb-1.5">¿Cómo usarlo?</p>
                            <ul className="text-xs text-gray-700 space-y-1">
                              <li>• Imprímelo y colócalo en tu negocio físico</li>
                              <li>• Compártelo en redes sociales o WhatsApp</li>
                              <li>• Pégalo en catálogos o material publicitario</li>
                            </ul>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Summary Card */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 mb-0.5">Resumen</p>
                        <h4 className="font-bold text-gray-900">{productName}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600 mb-0.5">{getTypeLabel()}</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {currency === 'GS' ? 'Gs' : 'USD'} {formatPrice(price, currency)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Formato</span>
                      <span className="font-medium text-gray-900">{formatType === 'qr' ? 'Código QR' : 'Link de pago'}</span>
                    </div>

                    {chargeType === 'subscription' && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Frecuencia</span>
                          <span className="font-medium text-gray-900">
                            {subscriptionFrequency === 'weekly' && 'Semanal'}
                            {subscriptionFrequency === 'monthly' && 'Mensual'}
                            {subscriptionFrequency === 'yearly' && 'Anual'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Inicio</span>
                          <span className="font-medium text-gray-900">
                            {new Date(startDate).toLocaleDateString('es-PY')}
                          </span>
                        </div>
                        {subscriptionFrequency === 'monthly' && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Día de cobro</span>
                            <span className="font-medium text-gray-900">Día {billingDay}</span>
                          </div>
                        )}
                      </>
                    )}

                    {details && (
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Detalles</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{details}</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleClose}
                    className="w-full bg-gray-100 text-gray-900 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    Crear otro cobro
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Woz API Documentation */}
    <WozApiDocs isOpen={showApiDocs} onClose={() => setShowApiDocs(false)} />
  </>
  );
}