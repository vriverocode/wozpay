import { useState } from 'react';
import { X, CreditCard, Check, AlertCircle, Trash2, Plus, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

// CardModal Component - Gestión de tarjetas vinculadas
interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransactionAdd?: (transaction: any) => void;
  linkedCards: LinkedCard[];
  onCardsUpdate: (cards: LinkedCard[]) => void;
  currentMembership?: 'gratuito' | 'emprendedor' | 'empresario';
  onRequireUpgrade?: (featureName: string) => void;
}

interface LinkedCard {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cardType: 'visa' | 'mastercard' | 'amex' | 'oro';
  isValidated: boolean;
  limit?: number;
}

export function CardModal({ isOpen, onClose, onTransactionAdd, linkedCards, onCardsUpdate, currentMembership, onRequireUpgrade }: CardModalProps) {
  const [view, setView] = useState<'main' | 'add' | 'processing' | 'success' | 'error'>('main');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [acceptValidation, setAcceptValidation] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  
  // Estado para tarjeta ORO
  const [isOroCardEnabled, setIsOroCardEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('woz_oro_card_enabled') === 'true';
    }
    return false;
  });
  
  const [showOroBenefits, setShowOroBenefits] = useState(false);
  
  // Verificar si el usuario ya eligió no mostrar la intro
  const shouldShowIntro = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('woz_skip_card_intro') !== 'true';
    }
    return true;
  };
  
  const [showIntro, setShowIntro] = useState(shouldShowIntro());

  const handleToggleOroCard = () => {
    const newState = !isOroCardEnabled;
    setIsOroCardEnabled(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('woz_oro_card_enabled', newState.toString());
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const detectCardType = (number: string): 'visa' | 'mastercard' | 'amex' | 'oro' => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'visa';
    if (cleaned.startsWith('5')) return 'mastercard';
    if (cleaned.startsWith('3')) return 'amex';
    if (cleaned.startsWith('6011') && isOroCardEnabled) return 'oro';
    return 'visa';
  };

  const maskCardNumber = (number: string) => {
    const last4 = number.slice(-4);
    return `•••• •• •••• ${last4}`;
  };

  const handleOpenAddView = () => {
    if (currentMembership === 'gratuito') {
      onRequireUpgrade?.('Vincular tarjeta');
      return;
    }
    setView('add');
  };

  const handleAddCard = () => {
    if (currentMembership === 'gratuito') {
      onRequireUpgrade?.('Vincular tarjeta');
      return;
    }
    const cleanedCard = cardNumber.replace(/\s/g, '');
    
    if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (cleanedCard.length < 15) {
      alert('Número de tarjeta inválido');
      return;
    }

    if (!acceptValidation) {
      alert('Debes aceptar el cargo de validación de 5,50 USD');
      return;
    }

    setView('processing');

    setTimeout(() => {
      const newCard: LinkedCard = {
        id: Date.now().toString(),
        cardNumber: cleanedCard,
        cardHolder: cardHolder.toUpperCase(),
        expiryDate,
        cardType: detectCardType(cleanedCard),
        isValidated: true
      };

      const updatedCards = [...linkedCards, newCard];
      onCardsUpdate(updatedCards);

      // Agregar transacción de validación
      if (onTransactionAdd) {
        onTransactionAdd({
          id: Date.now().toString(),
          type: 'card_validation',
          date: new Date().toISOString(),
          amount: 5.50,
          currency: 'USD',
          cardLast4: cleanedCard.slice(-4),
          status: 'completed',
          note: 'Cargo de validación (será reembolsado)'
        });
      }

      setView('success');
      
      // Reset form
      setCardNumber('');
      setCardHolder('');
      setExpiryDate('');
      setCvv('');
      setAcceptValidation(false);
    }, 2500);
  };

  const handleDeleteCard = (cardId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta tarjeta?')) {
      const updatedCards = linkedCards.filter(card => card.id !== cardId);
      onCardsUpdate(updatedCards);
    }
  };

  const handleReset = () => {
    setView('main');
    setCardNumber('');
    setCardHolder('');
    setExpiryDate('');
    setCvv('');
    setAcceptValidation(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header - Siempre visible */}
      <div className="bg-blue-600 text-white px-5 py-4 flex justify-between items-center">
        <button onClick={handleClose} className="text-white hover:bg-white/20 rounded-full p-1 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold">Vincular tarjeta</h2>
        <button onClick={handleClose} className="text-white hover:bg-white/20 rounded-full p-1 transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {view === 'main' && showIntro && (
          <div className="space-y-6 py-8">
            {/* Pantalla de introducción */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-5">
                <CreditCard size={40} className="text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Vincula tus tarjetas</h3>
              <p className="text-base text-gray-700 leading-relaxed">
                Conecta tus tarjetas de débito o crédito para realizar pagos y transferencias de forma rápida y segura
              </p>
            </div>

            <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <Check size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Pagos instantáneos</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Realiza pagos de forma inmediata sin necesidad de ingresar los datos de tu tarjeta cada vez.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <Check size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">100% seguro</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Tus datos están protegidos con encriptación de nivel bancario y nunca se comparten con terceros.
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
                  className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700 font-medium">
                  No volver a mostrar esta pantalla
                </span>
              </label>
            </div>

            <button
              onClick={() => {
                if (dontShowAgain) {
                  localStorage.setItem('woz_skip_card_intro', 'true');
                }
                setShowIntro(false);
              }}
              className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors mt-6"
            >
              Siguiente
            </button>
          </div>
        )}

        {view === 'main' && !showIntro && (
          <>
            {/* Tarjeta ORO - Fija y no editable */}
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900">Tarjeta ORO de Woz</h3>
              
              <div className={`relative rounded-xl p-4 text-white overflow-hidden transition-opacity ${
                isOroCardEnabled 
                  ? 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600' 
                  : 'bg-gradient-to-br from-gray-400 to-gray-500 opacity-60'
              }`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                {isOroCardEnabled && (
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></div>
                )}
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="text-xs opacity-90 uppercase tracking-wider font-semibold">
                      Tarjeta Oro
                    </div>
                    
                    {/* Toggle Switch */}
                    <button
                      onClick={handleToggleOroCard}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        isOroCardEnabled ? 'bg-white/30' : 'bg-black/20'
                      }`}
                    >
                      <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform shadow-lg ${
                        isOroCardEnabled ? 'translate-x-8' : 'translate-x-1'
                      }`}></div>
                    </button>
                  </div>
                  
                  <div className="space-y-3 mt-3">
                    <div>
                      <p className="text-xs opacity-75 mb-1">Titular</p>
                      <p className="text-sm tracking-wider uppercase">
                        María Rodríguez González
                      </p>
                    </div>
                    
                    <p className="text-lg tracking-[0.25em]">
                      •••• •••• •••• 7890
                    </p>
                    
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs opacity-75 mb-0.5">Vence</p>
                        <p className="text-sm font-semibold tracking-wider">12/28</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs opacity-75">Límite</p>
                        <p className="text-sm font-bold">2,000 USD</p>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-gray-300 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                    <CreditCard size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">Membresía Emprendedor Business</h4>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Activa todos los beneficios de tu Tarjeta ORO por solo{' '}
                      <span className="font-bold text-gray-900">1.500.000 Gs</span> al año
                    </p>
                  </div>
                </div>

                {/* Botón Ver beneficios */}
                <button
                  onClick={() => setShowOroBenefits(!showOroBenefits)}
                  className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 py-2 text-sm transition-colors"
                >
                  <span className="font-medium">{showOroBenefits ? 'Ocultar beneficios' : 'Ver beneficios'}</span>
                  {showOroBenefits ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {/* Beneficios principales */}
                {showOroBenefits && (
                  <div className="bg-white rounded-lg p-3 space-y-3">
                    <div className="flex items-start gap-2">
                      <Check size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-900">Límite de crédito: 2.000 USD</p>
                        <p className="text-xs text-gray-600">Disponible para todas tus compras</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Check size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-900">Adelanto de efectivo del 100%</p>
                        <p className="text-xs text-gray-600">Retira dinero en cajeros sin comisiones</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Check size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-900">Pago de servicios sin cargos</p>
                        <p className="text-xs text-gray-600">Luz, agua, internet, telefonía, seguros, impuestos y más</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Check size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-900">Transferencias internacionales</p>
                        <p className="text-xs text-gray-600">Envía dinero a cualquier país con tarifas preferenciales</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Check size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-900">Compras online protegidas</p>
                        <p className="text-xs text-gray-600">Amazon, Netflix, Spotify, Google, Apple y plataformas digitales</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Call to action */}
                <button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3 rounded-lg font-bold transition-colors shadow-md">
                  Comprar plan
                </button>
              </div>
            </div>

            {/* Lista de tarjetas vinculadas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Tarjetas vinculadas ({linkedCards.length}/2)</h3>
                {linkedCards.length < 2 && (
                  <button
                    onClick={handleOpenAddView}
                    className="text-blue-600 hover:bg-blue-50 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Agregar
                  </button>
                )}
              </div>

              {linkedCards.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <CreditCard size={28} className="text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-sm mb-4">No tienes tarjetas vinculadas</p>
                  <button
                    onClick={handleOpenAddView}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Vincular primera tarjeta
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {linkedCards.map((card) => (
                    <div
                      key={card.id}
                      className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 text-white relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="text-xs opacity-90 uppercase tracking-wider">
                            {card.cardType}
                          </div>
                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-lg font-mono tracking-wider mb-3">
                          {maskCardNumber(card.cardNumber)}
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs opacity-75">Titular</p>
                            <p className="text-sm font-semibold">{card.cardHolder}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs opacity-75">Vence</p>
                            <p className="text-sm font-semibold">{card.expiryDate}</p>
                          </div>
                        </div>
                        {card.isValidated && (
                          <div className="mt-3 flex items-center gap-1 text-xs bg-green-500 rounded-lg px-2 py-1 w-fit">
                            <Check size={14} className="font-bold" />
                            <span className="font-semibold">Verificada</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Información importante */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs text-blue-900 font-semibold mb-1">ℹ️ Información importante</p>
              <ul className="space-y-1 text-xs text-blue-800">
                <li>• Puedes vincular hasta 2 tarjetas</li>
                <li>• Se cobrará 5,50 USD para validación</li>
                <li>• El monto será reembolsado al instante</li>
                <li>• Tus datos están encriptados y seguros</li>
              </ul>
            </div>
          </>
        )}

        {view === 'add' && (
          <>
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900">Datos de la tarjeta</h3>

              {/* Número de tarjeta */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">Número de tarjeta</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Titular */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">Titular de la tarjeta</label>
                <input
                  type="text"
                  placeholder="NOMBRE APELLIDO"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase"
                />
              </div>

              {/* Vencimiento y CVV */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">Vencimiento</label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                    maxLength={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    maxLength={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Cargo de validación */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    <Check size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-green-900 mb-1.5">Validación con reembolso instantáneo</p>
                    <p className="text-xs text-green-800 leading-relaxed mb-2">
                      Para validar tu tarjeta, realizaremos un cargo único de <span className="font-bold">5,50 USD</span> que 
                      será <span className="font-bold">reembolsado al instante</span> una vez completada la verificación.
                    </p>
                    <div className="bg-white/60 rounded-lg px-3 py-2 mt-2">
                      <p className="text-xs text-green-900 font-semibold">✨ El dinero vuelve a tu cuenta inmediatamente</p>
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer bg-white rounded-lg p-3 hover:bg-green-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={acceptValidation}
                    onChange={(e) => setAcceptValidation(e.target.checked)}
                    className="mt-0.5 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                  />
                  <span className="text-xs text-gray-900 leading-relaxed">
                    Acepto el cargo temporal de <span className="font-bold">5,50 USD</span> para validación, 
                    que será reembolsado <span className="font-bold">instantáneamente</span>
                  </span>
                </label>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={() => setView('main')}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddCard}
                  disabled={!acceptValidation}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Vincular tarjeta
                </button>
              </div>
            </div>
          </>
        )}

        {view === 'processing' && (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h3 className="text-lg font-bold text-gray-900">Cargando tarjeta...</h3>
            <p className="text-sm text-gray-600">Procesando cargo de validación</p>
          </div>
        )}

        {view === 'success' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-2">¡Tarjeta vinculada exitosamente!</h3>
              <p className="text-sm text-green-700 leading-relaxed">
                Tu tarjeta ha sido validada correctamente y ya está lista para usar
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-4 space-y-3">
              <h4 className="font-bold text-gray-900">Detalles de validación</h4>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Cargo temporal:</span>
                  <span className="font-bold text-gray-900">5,50 USD</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Tarjeta:</span>
                  <span className="font-bold text-gray-900 font-mono">
                    •••• {cardNumber.replace(/\s/g, '').slice(-4)}
                  </span>
                </div>
                <div className="bg-green-50 rounded-lg p-3 mt-2">
                  <div className="flex items-start gap-2">
                    <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-green-900 font-semibold leading-relaxed">
                      El reembolso ha sido procesado instantáneamente y ya está disponible en tu cuenta
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg"
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}