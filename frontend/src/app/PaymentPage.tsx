import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Check, CreditCard, Shield } from 'lucide-react';
import { getPaymentLink, updatePaymentLinkStatus, PaymentLink } from './utils/paymentStorage';

export default function PaymentPage() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const paymentLink = paymentId ? getPaymentLink(paymentId) : null;

  if (!paymentLink) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Link de pago no encontrado</h1>
          <p className="text-gray-600">Este link de pago no existe o ha expirado.</p>
        </div>
      </div>
    );
  }

  if (paymentLink.status === 'paid') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Pago ya realizado</h1>
          <p className="text-gray-600">Este link de pago ya fue utilizado.</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'GS') {
      return amount.toLocaleString('es-PY');
    }
    return amount.toFixed(2);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 16) {
      setCardNumber(value);
    }
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setExpiryDate(value);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) {
      setCvv(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simular procesamiento de pago
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Marcar el link como pagado
    if (paymentId) {
      updatePaymentLinkStatus(paymentId, 'paid');
    }

    setIsProcessing(false);
    setIsSuccess(true);

    // Redirigir después de 3 segundos
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  const getChargeTypeLabel = (type: string) => {
    switch (type) {
      case 'sale': return 'Venta';
      case 'freelance': return 'Servicio Freelance';
      case 'subscription': return 'Suscripción';
      default: return type;
    }
  };

  const getSubscriptionFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensual';
      case 'yearly': return 'Anual';
      default: return freq;
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">¡Pago exitoso!</h1>
          <p className="text-gray-600 mb-4">Tu pago ha sido procesado correctamente.</p>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(paymentLink.amount, paymentLink.currency)} {paymentLink.currency}
          </div>
          <p className="text-sm text-gray-500">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Logo y header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-3">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Woz Payments</h1>
          <p className="text-sm text-gray-600 mt-1">Completa tu pago de forma segura</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Datos del usuario que genera el link/QR */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Datos del comerciante</h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Nombre</span>
                <span className="text-sm font-medium text-gray-900">{paymentLink.merchantName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cédula</span>
                <span className="text-sm font-medium text-gray-900">{paymentLink.merchantId}</span>
              </div>
            </div>
          </div>

          {/* Detalles del link */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Detalles del pago</h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tipo</span>
                <span className="text-sm font-medium text-gray-900">{getChargeTypeLabel(paymentLink.chargeType)}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-600">Producto/Servicio</span>
                <span className="text-sm font-medium text-gray-900 text-right max-w-[200px]">{paymentLink.productName}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-900">Monto total</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(paymentLink.amount, paymentLink.currency)} {paymentLink.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detalles de suscripción si aplica */}
          {paymentLink.chargeType === 'subscription' && paymentLink.subscriptionFrequency && (
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
              <h2 className="text-sm font-semibold text-blue-900 mb-3">Detalles de suscripción</h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Frecuencia</span>
                  <span className="text-sm font-medium text-blue-900">
                    {getSubscriptionFrequencyLabel(paymentLink.subscriptionFrequency)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Fecha de inicio</span>
                  <span className="text-sm font-medium text-blue-900">
                    {new Date(paymentLink.subscriptionStartDate!).toLocaleDateString('es-PY')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Próximo cobro</span>
                  <span className="text-sm font-medium text-blue-900">
                    {paymentLink.subscriptionFrequency === 'monthly' && 
                      new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('es-PY')}
                    {paymentLink.subscriptionFrequency === 'weekly' && 
                      new Date(new Date().setDate(new Date().getDate() + 7)).toLocaleDateString('es-PY')}
                    {paymentLink.subscriptionFrequency === 'yearly' && 
                      new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('es-PY')}
                  </span>
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  Se realizará un cobro automático {getSubscriptionFrequencyLabel(paymentLink.subscriptionFrequency).toLowerCase()} a tu tarjeta.
                </p>
              </div>
            </div>
          )}

          {/* Datos de tarjeta */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Datos de la tarjeta</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Número de tarjeta
                </label>
                <input
                  type="text"
                  value={formatCardNumber(cardNumber)}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Nombre en la tarjeta
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Mario Gomez"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Vencimiento
                  </label>
                  <input
                    type="text"
                    value={formatExpiryDate(expiryDate)}
                    onChange={handleExpiryDateChange}
                    placeholder="MM/AA"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={handleCvvChange}
                    placeholder="123"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botón pagar */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Procesando...
              </span>
            ) : (
              `Pagar ${formatCurrency(paymentLink.amount, paymentLink.currency)} ${paymentLink.currency}`
            )}
          </button>

          {/* Footer seguridad */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
            <Shield className="w-4 h-4" />
            <span>Pagos seguros con Woz Payments</span>
          </div>
        </form>
      </div>
    </div>
  );
}
