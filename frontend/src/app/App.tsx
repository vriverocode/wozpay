import { CardModal } from './components/CardModal';
import { TransactionsModal, Transaction } from './components/TransactionsModal';
import { LinksHistoryModal } from './components/LinksHistoryModal';
import { QRsHistoryModal } from './components/QRsHistoryModal';
import { LoansIntroModal } from './components/LoansIntroModal';
import { LoanApplicationModal } from './components/LoanApplicationModal';
import { SavingsIntroModal } from './components/SavingsIntroModal';
import { SavingsApplicationModal } from './components/SavingsApplicationModal';
import { ActiveSavingsModal } from './components/ActiveSavingsModal';
import { ProfileModal } from './components/ProfileModal';
import { ExternalContentModal } from './components/ExternalContentModal';
import { CapitalMarketsModal } from './components/CapitalMarketsModal';
import { NotificationsModal } from './components/NotificationsModal';
import { MembershipModal } from './components/MembershipModal';
import { MembershipSwitcher } from './components/MembershipSwitcher';
import { MembershipRequiredModal } from './components/MembershipRequiredModal';
import { MenuSidebar } from './components/Sidebar';
import { AdminDashboard } from './admin/AdminDashboard';
import { AuthScreen } from './components/AuthScreen';
import { AuthProvider, useAuth, AuthContext } from './contexts/AuthContext';
import { useState, useEffect, useContext } from 'react';
import { savePaymentLink } from './utils/paymentStorage';
import { WalletHeader } from './components/WalletHeader';
import { StockCard } from './components/StockCard';
import { ActionCard } from './components/ActionCard';
import { FinancialProductCard } from './components/FinancialProductCard';
import { SavingsAccountCard } from './components/SavingsAccountCard';
import { BottomNavigation } from './components/BottomNavigation';
import { ChargeModal } from './components/ChargeModal';
import { PayModal } from './components/PayModal';
import { BankModal } from './components/BankModal';
import { TransferModal } from './components/TransferModal';
import { AddBalanceModal } from './components/AddBalanceModal';
import { getMembershipColors } from './utils/membershipColors';
import type { BalanceBag } from './types/balance';
import type { MembershipTier } from './types/membership';
import { 
  HandCoins, 
  ArrowLeftRight, 
  Plus, 
  TrendingUp, 
  ShoppingBag, 
  Store, 
  Code, 
  Gamepad2,
  CreditCard,
  Clock,
  PiggyBank,
  Check
} from 'lucide-react';

// Re-exportar para mantener compatibilidad
export type { BalanceBag };

interface LinkedCard {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cardType: 'visa' | 'mastercard' | 'amex' | 'oro';
  isValidated: boolean;
  limit?: number; // Límite de crédito para tarjetas oro
}

interface LoanApplication {
  id: string;
  fullName: string;
  idNumber: string;
  country: string;
  whatsapp: string;
  occupation: string;
  salary: number;
  taxType: 'IVA' | 'IPS';
  address: string;
  loanAmount: number;
  term: number;
  monthlyPayment: number;
  selectedCard: string;
  status: 'pending' | 'approved' | 'rejected';
  applicationDate: string;
}

interface SavingsApplication {
  id: string;
  amount: number;
  term: number;
  paymentMethod: 'transfer' | 'card' | 'balance';
  selectedCard?: string;
  earnings: number;
  totalReturn: number;
  startDate: string;
  endDate: string;
  monthsRemaining: number;
  status: 'active' | 'completed' | 'withdrawn';
}

export function WalletApp() {
  const { user, logout } = useAuth();

  // Definir userName y userIdNumber ANTES de cualquier useState que los use
  const userName = user ? `${user.firstName} ${user.lastName}` : "Juan Pérez";
  const userIdNumber = user?.cedula || "4.567.890";
  const verificationStatus: 'incomplete' | 'pending' | 'approved' = 'approved';
  
  const [activeTab, setActiveTab] = useState('home');
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAddBalanceModalOpen, setIsAddBalanceModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);
  const [isLinksHistoryOpen, setIsLinksHistoryOpen] = useState(false);
  const [isQRsHistoryOpen, setIsQRsHistoryOpen] = useState(false);
  const [isLoanIntroModalOpen, setIsLoanIntroModalOpen] = useState(false);
  const [isLoanApplicationModalOpen, setIsLoanApplicationModalOpen] = useState(false);
  const [isSavingsIntroModalOpen, setIsSavingsIntroModalOpen] = useState(false);
  const [isSavingsApplicationModalOpen, setIsSavingsApplicationModalOpen] = useState(false);
  const [isActiveSavingsModalOpen, setIsActiveSavingsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCapitalMarketsOpen, setIsCapitalMarketsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [isMembershipSwitcherOpen, setIsMembershipSwitcherOpen] = useState(false);
  const [isMembershipRequiredOpen, setIsMembershipRequiredOpen] = useState(false);
  const [requiredFeatureName, setRequiredFeatureName] = useState('');
  const [externalContent, setExternalContent] = useState<{ title: string; url: string } | null>(null);
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [savingsApplications, setSavingsApplications] = useState<SavingsApplication[]>([]);
  const [balanceGuaranies, setBalanceGuaranies] = useState(8450000);
  const [balanceDollars, setBalanceDollars] = useState(1250.50);
  
  // Estado de membresía activa
  const [currentMembership, setCurrentMembership] = useState<MembershipTier>('gratuito');
  
  // Estado de bolsas de tiempo - cada ingreso se trackea por separado
  const [balanceBagsGs, setBalanceBagsGs] = useState<BalanceBag[]>([
    {
      id: 'bag-init-gs-1',
      amount: 2000000,
      currency: 'GS',
      receivedAt: new Date(2025, 11, 24).toISOString(), // Hace 51 días (30+ días, comisión 3.9%)
      source: 'link',
      description: 'Cobro de link antiguo'
    },
    {
      id: 'bag-init-gs-2',
      amount: 1800000,
      currency: 'GS',
      receivedAt: new Date(2026, 0, 24).toISOString(), // Hace 20 días (14-29 días, comisión 8%)
      source: 'qr',
      description: 'Cobro de QR medio'
    },
    {
      id: 'bag-init-gs-3',
      amount: 2200000,
      currency: 'GS',
      receivedAt: new Date(2026, 1, 3).toISOString(), // Hace 10 días (7-13 días, comisión 10%)
      source: 'transfer',
      description: 'Transferencia reciente'
    },
    {
      id: 'bag-init-gs-4',
      amount: 2450000,
      currency: 'GS',
      receivedAt: new Date(2026, 1, 10).toISOString(), // Hace 3 días (0-6 días, comisión 15%)
      source: 'link',
      description: 'Cobro muy reciente'
    }
  ]);
  
  const [balanceBagsUsd, setBalanceBagsUsd] = useState<BalanceBag[]>([
    {
      id: 'bag-init-usd-1',
      amount: 450,
      currency: 'USD',
      receivedAt: new Date(2025, 11, 20).toISOString(), // Hace 55 días (30+ días, comisión 3.9%)
      source: 'transfer',
      description: 'Transferencia antigua'
    },
    {
      id: 'bag-init-usd-2',
      amount: 300,
      currency: 'USD',
      receivedAt: new Date(2026, 0, 28).toISOString(), // Hace 16 días (14-29 días, comisión 8%)
      source: 'link',
      description: 'Link de cobro medio'
    },
    {
      id: 'bag-init-usd-3',
      amount: 500.50,
      currency: 'USD',
      receivedAt: new Date(2026, 1, 7).toISOString(), // Hace 6 días (0-6 días, comisión 15%)
      source: 'qr',
      description: 'Cobro QR reciente'
    }
  ]);

  const [showUsd, setShowUsd] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [linkedCards, setLinkedCards] = useState<LinkedCard[]>([
    {
      id: 'card-test-001',
      cardNumber: '4532 1234 5678 9010',
      cardHolder: userName.toUpperCase(),
      expiryDate: '12/28',
      cardType: 'visa',
      isValidated: true
    }
  ]);
  
  const stocks = [
    { companyName: 'Woz Paraguay', companyType: 'Empresa', pricePerShare: 845000, isVerified: true },
    { companyName: 'Woz Dropshipping', companyType: 'Empresa', pricePerShare: 45000, isVerified: true },
    { companyName: 'Woz Marketplace', companyType: 'Empresa', pricePerShare: 37000, isVerified: true }
  ];
  
  const savingsAccountNumber = "2401-567890-4";

  // Estado para tracking de links y QRs generados en el mes actual
  const [generatedLinksQRs, setGeneratedLinksQRs] = useState<Array<{
    id: string;
    type: 'link' | 'qr';
    chargeType: 'sale' | 'freelance' | 'subscription';
    productName: string;
    amount: number;
    currency: 'GS' | 'USD';
    createdAt: string;
    status: 'active' | 'paid' | 'expired';
    merchantName: string;
    merchantId: string;
    subscriptionFrequency?: 'weekly' | 'monthly' | 'yearly';
    subscriptionStartDate?: string;
  }>>([]);

  // Inicializar links demo en localStorage (solo la primera vez)
  useEffect(() => {
    const demoLinksInitialized = localStorage.getItem('woz_demo_links_initialized');
    if (!demoLinksInitialized) {
      // Link demo para ventas
      savePaymentLink({
        id: 'demo-link-sale',
        type: 'link',
        chargeType: 'sale',
        productName: 'Plan Premium - Acceso anual',
        amount: 450000,
        currency: 'GS',
        createdAt: new Date().toISOString(),
        status: 'active',
        merchantName: userName,
        merchantId: userIdNumber
      });

      // QR demo para suscripción mensual
      savePaymentLink({
        id: 'demo-qr-subscription',
        type: 'qr',
        chargeType: 'subscription',
        productName: 'Suscripción Netflix Familiar',
        amount: 35000,
        currency: 'GS',
        createdAt: new Date().toISOString(),
        status: 'active',
        merchantName: userName,
        merchantId: userIdNumber,
        subscriptionFrequency: 'monthly',
        subscriptionStartDate: new Date().toISOString()
      });

      localStorage.setItem('woz_demo_links_initialized', 'true');
    }
  }, [userName, userIdNumber]);

  // Constantes de membresía gratuita
  const MEMBERSHIP_LIMITS = {
    maxLinksQRsPerMonth: 10,
    minAmountGs: 100000,
    maxAmountGs: 700000,
    commissionPercent: 0.15, // 15%
    fixedFeeUsd: 1.50,
    withdrawalWaitDays: 7 // días hábiles
  };

  // Función para contar links/QRs del mes actual
  const getMonthlyLinksQRsCount = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return generatedLinksQRs.filter(item => {
      const itemDate = new Date(item.createdAt);
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    }).length;
  };

  const handleBalanceUpdate = (newBalance: { guaranies: number; dollars: number }) => {
    setBalanceGuaranies(newBalance.guaranies);
    setBalanceDollars(newBalance.dollars);
  };

  const handleBagsUpdate = (newBags: { gs: BalanceBag[]; usd: BalanceBag[] }) => {
    setBalanceBagsGs(newBags.gs);
    setBalanceBagsUsd(newBags.usd);
    
    // Recalcular el saldo total a partir de las bolsas
    const totalGs = newBags.gs.reduce((sum, bag) => sum + bag.amount, 0);
    const totalUsd = newBags.usd.reduce((sum, bag) => sum + bag.amount, 0);
    
    setBalanceGuaranies(totalGs);
    setBalanceDollars(totalUsd);
  };

  const handleTransactionAdd = (transaction: Transaction) => {
    setTransactions([transaction, ...transactions]);
  };

  const handlePayment = (amount: number, currency: 'GS' | 'USD', paymentMethod: string) => {
    // Actualizar saldo según método de pago
    if (paymentMethod === 'balance_gs') {
      setBalanceGuaranies(balanceGuaranies - amount);
    } else if (paymentMethod === 'balance_usd') {
      setBalanceDollars(balanceDollars - amount);
    }

    // Agregar transacción
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'loan_payment',
      date: new Date().toISOString(),
      amount,
      currency,
      status: 'completed',
      note: `Pago de cuota - ${paymentMethod === 'balance_gs' ? 'Saldo Guaraníes' : paymentMethod === 'balance_usd' ? 'Saldo Dólares' : 'Tarjeta'}`
    };
    handleTransactionAdd(transaction);
  };

  const handleLoanSubmit = (application: any) => {
    const newApplication: LoanApplication = {
      id: Date.now().toString(),
      ...application,
      status: 'pending',
      applicationDate: new Date().toISOString()
    };
    setLoanApplications([newApplication, ...loanApplications]);
  };

  const handleSavingsSubmit = (application: any) => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + application.term);

    const newSaving: SavingsApplication = {
      id: Date.now().toString(),
      ...application,
      startDate: startDate.toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      endDate: endDate.toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      monthsRemaining: application.term,
      status: 'active'
    };

    // Descontar del saldo si usa balance
    if (application.paymentMethod === 'balance') {
      setBalanceGuaranies(balanceGuaranies - application.amount);
    }

    setSavingsApplications([newSaving, ...savingsApplications]);
  };

  const handleSavingsWithdrawal = (savingId: string, withdrawalAmount: number) => {
    // Actualizar el estado del ahorro a withdrawn
    setSavingsApplications(prev => 
      prev.map(saving => 
        saving.id === savingId 
          ? { ...saving, status: 'withdrawn' as const }
          : saving
      )
    );

    // Devolver el monto retirado al saldo
    setBalanceGuaranies(balanceGuaranies + withdrawalAmount);

    // Agregar transacción
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'withdrawal',
      date: new Date().toISOString(),
      amount: withdrawalAmount,
      currency: 'GS',
      status: 'completed',
      note: 'Retiro anticipado de ahorro programado'
    };
    handleTransactionAdd(transaction);
  };

  const handleOpenSavings = () => {
    const activeSaving = savingsApplications.find(s => s.status === 'active');
    if (activeSaving) {
      setIsActiveSavingsModalOpen(true);
    } else {
      setIsSavingsIntroModalOpen(true);
    }
  };

  const handleOpenLoans = () => {
    // Si hay una solicitud pendiente, abrir la pantalla de préstamos con el estado
    // Si no hay solicitud, abrir el modal de introducción
    if (loanApplications.length > 0 && loanApplications[0].status === 'pending') {
      // Por ahora solo abrimos el modal de introducción
      // En el futuro, aquí se puede mostrar la información de la solicitud pendiente
      setIsLoanIntroModalOpen(true);
    } else {
      setIsLoanIntroModalOpen(true);
    }
  };

  const handleSidebarNavigation = (section: string) => {
    switch (section) {
      case 'home':
        setActiveTab('home');
        break;
      case 'transactions':
        setIsTransactionsModalOpen(true);
        break;
      case 'cards':
        setIsCardModalOpen(true);
        break;
      case 'loans':
        handleOpenLoans();
        break;
      case 'savings':
        handleOpenSavings();
        break;
      case 'capital-markets':
        setIsCapitalMarketsOpen(true);
        break;
      case 'api':
        setExternalContent({ title: 'Woz API', url: 'https://wozpaymentsapi.figma.site' });
        break;
      case 'marketplace':
        setExternalContent({ title: 'Woz Marketplace', url: 'https://tutienda.figma.site' });
        break;
      case 'dropshipping':
        setExternalContent({ title: 'Woz Dropshipping', url: 'https://wozdropshipping.figma.site' });
        break;
      case 'membership':
        setIsMembershipModalOpen(true);
        break;
      case 'settings':
        setIsProfileModalOpen(true);
        break;
      case 'help':
        // TODO: Agregar modal de ayuda
        break;
      case 'terms':
        // TODO: Agregar modal de términos
        break;
      case 'privacy':
        // TODO: Agregar modal de privacidad
        break;
      case 'logout':
        logout();
        break;
    }
  };

  const handleRequireUpgrade = (featureName: string) => {
    setRequiredFeatureName(featureName);
    setIsMembershipRequiredOpen(true);
  };

  const membershipColors = getMembershipColors(currentMembership);

  return (
    <div className="bg-gray-100 min-h-screen pb-24">
      <WalletHeader 
        userName={userName}
        userIdNumber={userIdNumber}
        verificationStatus={verificationStatus}
        currentMembership={currentMembership}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenMenu={() => setIsSidebarOpen(true)}
        onOpenMembershipSwitcher={() => setIsMembershipSwitcherOpen(true)}
      />
      
      <main className="pt-32 max-w-md mx-auto space-y-0">
        
        {/* Tu dinero disponible - Fondo blanco */}
        <section className="px-4 py-6 bg-gradient-to-b from-gray-50 to-white">
          {/* Header con switch minimalista */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-900 text-sm">
              Tu dinero disponible
            </h2>
            
            {/* Switch de moneda tipo toggle moderno */}
            <div className="relative bg-gray-100 rounded-full p-0.5 flex">
              <button
                onClick={() => setShowUsd(false)}
                className={`relative z-10 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                  !showUsd 
                    ? 'text-white' 
                    : 'text-gray-600'
                }`}
              >
                Gs
              </button>
              <button
                onClick={() => setShowUsd(true)}
                className={`relative z-10 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                  showUsd 
                    ? 'text-white' 
                    : 'text-gray-600'
                }`}
              >
                USD
              </button>
              {/* Indicador deslizante */}
              <div 
                className={`absolute top-0.5 h-[calc(100%-4px)] w-[calc(50%-2px)] ${membershipColors.primary} rounded-full transition-all duration-300 ease-out ${
                  showUsd ? 'left-[calc(50%+2px)]' : 'left-0.5'
                }`}
              />
            </div>
          </div>
          
          <SavingsAccountCard
            accountNumber={savingsAccountNumber}
            balanceGs={balanceGuaranies}
            balanceUsd={balanceDollars}
            showUsd={showUsd}
            activeMembership={currentMembership}
          />
        </section>
        
        {/* Historial de cobros - Fondo gris */}
        <section className="bg-gray-100 px-4 py-5">
          <h3 className="text-gray-900 text-sm mb-3">
            Historial de cobros
          </h3>
          
          {/* Grid de botones con diseño card minimalista */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsLinksHistoryOpen(true)}
              className={`group relative bg-white rounded-2xl p-4 border border-gray-200 ${membershipColors.hover} hover:shadow-lg transition-all duration-300 overflow-hidden`}
            >
              {/* Efecto de fondo en hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${membershipColors.light} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <div className="relative">
                {/* Ícono */}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${membershipColors.light} to-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={membershipColors.badge}>
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                </div>
                
                {/* Texto */}
                <div className="text-left">
                  <p className="text-sm text-gray-900 mb-0.5">Links</p>
                  <p className="text-xs text-gray-500">Ver historial</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setIsQRsHistoryOpen(true)}
              className={`group relative bg-white rounded-2xl p-4 border border-gray-200 ${membershipColors.hover} hover:shadow-lg transition-all duration-300 overflow-hidden`}
            >
              {/* Efecto de fondo en hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${membershipColors.light} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <div className="relative">
                {/* Ícono */}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${membershipColors.light} to-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={membershipColors.badge}>
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                  </svg>
                </div>
                
                {/* Texto */}
                <div className="text-left">
                  <p className="text-sm text-gray-900 mb-0.5">QRs</p>
                  <p className="text-xs text-gray-500">Ver historial</p>
                </div>
              </div>
            </button>
          </div>
        </section>
        
        {/* Tarjetas vinculadas - Fondo blanco */}
        {linkedCards.length > 0 && (
          <section className="bg-white px-4 py-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900 text-base mb-1">
                  Tus tarjetas
                </h2>
                <p className="text-xs text-gray-600">
                  Tarjetas vinculadas a tu cuenta
                </p>
              </div>
              <button
                onClick={() => setIsCardModalOpen(true)}
                className="text-blue-600 text-sm font-semibold hover:text-blue-700"
              >
                Ver todas
              </button>
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide justify-center">
              {linkedCards.map((card) => {
                const isGoldCard = card.cardType === 'oro';
                const cardWidth = linkedCards.length === 1 ? 'w-full max-w-none mx-2' : 'min-w-[260px]';
                
                return (
                  <div key={card.id} className="flex flex-col items-center flex-shrink-0 w-full space-y-3">
                    <div
                      onClick={() => setIsCardModalOpen(true)}
                      className={`${
                        isGoldCard 
                          ? 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600' 
                          : 'bg-gradient-to-br from-blue-600 to-blue-800'
                      } rounded-xl p-4 text-white relative overflow-hidden ${cardWidth} cursor-pointer hover:shadow-lg transition-all`}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                      {isGoldCard && (
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></div>
                      )}
                      <div className="relative z-10 h-full flex flex-col justify-between" style={{ fontFamily: 'Courier Prime, Courier New, monospace' }}>
                        <div className="flex items-start justify-between">
                          <div className="text-xs opacity-90 uppercase tracking-wider font-semibold">
                            {card.cardType === 'oro' ? 'Tarjeta Oro' : card.cardType}
                          </div>
                          {isGoldCard && (
                            <div className="flex items-center gap-1 text-xs bg-white/20 rounded-lg px-2 py-1">
                              <Check size={12} />
                              <span className="font-semibold">Emprendedor Business</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs opacity-75 mb-1">Titular</p>
                            <p className="text-sm tracking-wider uppercase font-[Comfortaa] font-bold">
                              {card.cardHolder}
                            </p>
                          </div>
                          
                          <p className="text-lg tracking-[0.25em]">
                            •••• •••• ••• {card.cardNumber.slice(-4)}
                          </p>
                          
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-xs opacity-75 mb-0.5">Vence</p>
                              <p className="text-sm font-semibold tracking-wider">{card.expiryDate}</p>
                            </div>
                            {isGoldCard && card.limit ? (
                              <div className="text-right">
                                <p className="text-xs opacity-75">Límite</p>
                                <p className="text-sm font-bold">{card.limit.toLocaleString('en-US')} USD</p>
                              </div>
                            ) : (
                              !isGoldCard && card.isValidated && (
                                null
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {isGoldCard && (
                      <p className="text-xs text-center text-gray-600">
                        Activar cuenta Emprendedor Business
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
        
        {/* Woz Seller - Fondo gris */}
        <section className="bg-gray-100 px-4 py-5">
          <div className="mb-3">
            <h2 className="font-bold text-gray-900 text-base mb-1">
              Woz Seller
            </h2>
            <p className="text-xs text-gray-600">
              Vendedores reales que venden por vos
            </p>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {stocks.map((stock, index) => (
              <StockCard
                key={index}
                companyName={stock.companyName}
                companyType={stock.companyType}
                pricePerShare={stock.pricePerShare}
                isVerified={stock.isVerified}
              />
            ))}
          </div>
        </section>
        
        {/* ¿Qué puedes hacer? - Fondo blanco */}
        <section className="bg-white px-4 py-5 rounded-[0px]">
          <h2 className="font-bold text-gray-900 mb-3 text-base">
            ¿Qué puedes hacer?
          </h2>
          
          <div className="grid grid-cols-4 gap-2 auto-rows-fr">
            <ActionCard 
              icon={HandCoins} 
              label="Pagar" 
              onClick={() => setIsPayModalOpen(true)}
              iconColor="text-green-600"
              bgColor="bg-green-50"
            />
            <ActionCard 
              icon={ArrowLeftRight} 
              label="Transferir" 
              onClick={() => setIsTransferModalOpen(true)}
              iconColor="text-blue-600"
              bgColor="bg-blue-50"
            />
            <ActionCard 
              icon={Plus} 
              label="Cargar saldo" 
              onClick={() => setIsAddBalanceModalOpen(true)}
              iconColor="text-purple-600"
              bgColor="bg-purple-50"
            />
            <ActionCard 
              icon={TrendingUp} 
              label="Woz Seller" 
              onClick={() => setIsCapitalMarketsOpen(true)}
              iconColor="text-orange-600"
              bgColor="bg-orange-50"
            />
            
            <ActionCard 
              icon={ShoppingBag} 
              label="Woz Dropshipping" 
              onClick={() => setExternalContent({ title: 'Woz Dropshipping', url: 'https://wozdropshipping.figma.site' })}
              iconColor="text-pink-600"
              bgColor="bg-pink-50"
            />
            <ActionCard 
              icon={Store} 
              label="Woz Marketplace" 
              onClick={() => setExternalContent({ title: 'Woz Marketplace', url: 'https://tutienda.figma.site' })}
              iconColor="text-indigo-600"
              bgColor="bg-indigo-50"
            />
            <ActionCard 
              icon={Code} 
              label="Woz API" 
              onClick={() => setExternalContent({ title: 'Woz API', url: 'https://wozpaymentsapi.figma.site' })}
              iconColor="text-cyan-600"
              bgColor="bg-cyan-50"
            />
            <ActionCard 
              icon={Gamepad2} 
              label="Woz Games" 
              onClick={() => setExternalContent({ title: 'Woz Games', url: 'https://www.wozgames.figma.site' })}
              iconColor="text-red-600"
              bgColor="bg-red-50"
            />
          </div>
        </section>

        {/* Productos financieros - Fondo gris */}
        <section className="px-4 py-5 rounded-t-3xl bg-[#f3f4f6]">
          <h2 className="font-bold text-gray-900 mb-4 text-base">
            Productos financieros
          </h2>
          
          <div className="space-y-3">
            <FinancialProductCard
              icon={CreditCard}
              title="Vincular tarjeta"
              subtitle="Conecta tus tarjetas de débito o crédito"
              onClick={() => setIsCardModalOpen(true)}
              iconColor="text-blue-600"
              bgColor="bg-blue-50"
              accentColor="text-blue-600"
            />
            
            <FinancialProductCard
              icon={HandCoins}
              title="Préstamos"
              subtitle={
                loanApplications.length > 0 && loanApplications[0].status === 'pending'
                  ? "Solicitud pendiente de aprobación"
                  : "Solicita préstamos rápidos y seguros"
              }
              onClick={handleOpenLoans}
              iconColor="text-blue-600"
              bgColor="bg-blue-50"
              accentColor="text-blue-600"
              badge={
                loanApplications.length > 0 && loanApplications[0].status === 'pending'
                  ? { icon: Clock, text: 'Pendiente', color: 'text-amber-600', bgColor: 'bg-amber-50' }
                  : undefined
              }
            />

            <FinancialProductCard
              icon={PiggyBank}
              title="Ahorro programado"
              subtitle="Crea metas de ahorro automáticas"
              onClick={handleOpenSavings}
              iconColor="text-blue-600"
              bgColor="bg-blue-50"
              accentColor="text-blue-600"
            />
          </div>
        </section>
      </main>
      
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCollectClick={() => setIsChargeModalOpen(true)}
        onBankClick={() => setIsBankModalOpen(true)}
        onTransactionsClick={() => setIsTransactionsModalOpen(true)}
        onNotificationsClick={() => setIsNotificationsOpen(true)}
      />
      
      <ChargeModal
        isOpen={isChargeModalOpen}
        onClose={() => setIsChargeModalOpen(false)}
        userName={userName}
        userIdNumber={userIdNumber}
        currentMembership={currentMembership}
        monthlyLinksQRsCount={getMonthlyLinksQRsCount()}
        onRequireUpgrade={handleRequireUpgrade}
        onLinkQRGenerated={(data) => {
          const newItem = {
            id: Date.now().toString(),
            ...data,
            createdAt: new Date().toISOString(),
            status: 'active' as const
          };
          setGeneratedLinksQRs([...generatedLinksQRs, newItem]);
        }}
      />
      
      <PayModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        balanceGuaranies={balanceGuaranies}
        balanceDollars={balanceDollars}
        onPayment={handlePayment}
        linkedCards={linkedCards}
      />

      <BankModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        userName={userName}
        currentMembership={currentMembership}
        availableBalance={{
          guaranies: balanceGuaranies,
          dollars: balanceDollars
        }}
        onBalanceUpdate={handleBalanceUpdate}
        balanceBagsGs={balanceBagsGs}
        balanceBagsUsd={balanceBagsUsd}
        onBagsUpdate={handleBagsUpdate}
        onRequireUpgrade={handleRequireUpgrade}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        userName={userName}
        availableBalance={{
          guaranies: balanceGuaranies,
          dollars: balanceDollars
        }}
        onBalanceUpdate={handleBalanceUpdate}
        onTransactionAdd={handleTransactionAdd}
      />

      <AddBalanceModal
        isOpen={isAddBalanceModalOpen}
        onClose={() => setIsAddBalanceModalOpen(false)}
        availableBalance={{
          guaranies: balanceGuaranies,
          dollars: balanceDollars
        }}
        onBalanceUpdate={handleBalanceUpdate}
        onTransactionAdd={handleTransactionAdd}
      />

      <CardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        onTransactionAdd={handleTransactionAdd}
        linkedCards={linkedCards}
        onCardsUpdate={setLinkedCards}
        currentMembership={currentMembership}
        onRequireUpgrade={handleRequireUpgrade}
      />

      <TransactionsModal
        isOpen={isTransactionsModalOpen}
        onClose={() => setIsTransactionsModalOpen(false)}
        transactions={transactions}
      />

      <LinksHistoryModal
        isOpen={isLinksHistoryOpen}
        onClose={() => setIsLinksHistoryOpen(false)}
      />

      <QRsHistoryModal
        isOpen={isQRsHistoryOpen}
        onClose={() => setIsQRsHistoryOpen(false)}
      />

      <LoansIntroModal
        isOpen={isLoanIntroModalOpen}
        onClose={() => setIsLoanIntroModalOpen(false)}
        onContinue={() => {
          setIsLoanIntroModalOpen(false);
          setIsLoanApplicationModalOpen(true);
        }}
        pendingLoan={loanApplications.length > 0 && loanApplications[0].status === 'pending' ? loanApplications[0] : undefined}
      />

      <LoanApplicationModal
        isOpen={isLoanApplicationModalOpen}
        onClose={() => setIsLoanApplicationModalOpen(false)}
        userName={userName}
        userIdNumber={userIdNumber}
        linkedCards={linkedCards}
        onOpenCardModal={() => {
          setIsLoanApplicationModalOpen(false);
          setIsCardModalOpen(true);
        }}
        onSubmit={handleLoanSubmit}
        hasPendingLoan={loanApplications.length > 0 && loanApplications[0].status === 'pending'}
      />

      <SavingsIntroModal
        isOpen={isSavingsIntroModalOpen}
        onClose={() => setIsSavingsIntroModalOpen(false)}
        onContinue={() => {
          setIsSavingsIntroModalOpen(false);
          setIsSavingsApplicationModalOpen(true);
        }}
      />

      <SavingsApplicationModal
        isOpen={isSavingsApplicationModalOpen}
        onClose={() => setIsSavingsApplicationModalOpen(false)}
        linkedCards={linkedCards}
        availableBalance={balanceGuaranies}
        onSubmit={handleSavingsSubmit}
        currentMembership={currentMembership}
        onRequireUpgrade={handleRequireUpgrade}
      />

      <ActiveSavingsModal
        isOpen={isActiveSavingsModalOpen}
        onClose={() => setIsActiveSavingsModalOpen(false)}
        saving={savingsApplications.find(s => s.status === 'active') || null}
        onWithdraw={handleSavingsWithdrawal}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <ExternalContentModal
        isOpen={externalContent !== null}
        onClose={() => setExternalContent(null)}
        title={externalContent?.title || ''}
        url={externalContent?.url || ''}
      />

      <CapitalMarketsModal
        isOpen={isCapitalMarketsOpen}
        onClose={() => setIsCapitalMarketsOpen(false)}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <MenuSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userName={userName}
        userIdNumber={userIdNumber}
        membershipType="free"
        currentMembership={currentMembership}
        onNavigate={handleSidebarNavigation}
      />

      <MembershipModal
        isOpen={isMembershipModalOpen}
        onClose={() => setIsMembershipModalOpen(false)}
      />

      <MembershipSwitcher
        isOpen={isMembershipSwitcherOpen}
        onClose={() => setIsMembershipSwitcherOpen(false)}
        currentMembership={currentMembership}
        onChangeMembership={(tier) => setCurrentMembership(tier)}
      />

      <MembershipRequiredModal
        isOpen={isMembershipRequiredOpen}
        onClose={() => setIsMembershipRequiredOpen(false)}
        featureName={requiredFeatureName}
        onViewPlans={() => {
          setIsMembershipRequiredOpen(false);
          setIsMembershipModalOpen(true);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

function AuthGate() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(sessionStorage.getItem('woz_admin_auth') === '1');

  if (isAdmin) return <AdminDashboard />;
  if (!user) return <AuthScreen onAdminLogin={() => setIsAdmin(true)} />;
  return <WalletApp />;
}