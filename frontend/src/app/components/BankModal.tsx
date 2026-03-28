import { useState, useEffect } from 'react';
import { X, Plus, Building2, Edit2, Trash2, ArrowLeft, Check, AlertCircle, DollarSign, TrendingDown, Clock } from 'lucide-react';
import { BalanceBag } from '../types/balance';
import { 
  calculateWithdrawalByBags, 
  WithdrawalCalculation, 
  formatSource, 
  formatDaysOld
} from '../utils/withdrawalCalculations';
import { membershipProfiles, type MembershipTier } from '../types/membership';

interface BankModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  currentMembership?: MembershipTier;
  availableBalance: {
    guaranies: number;
    dollars: number;
  };
  onBalanceUpdate?: (newBalance: { guaranies: number; dollars: number }) => void;
  balanceBagsGs?: BalanceBag[];
  balanceBagsUsd?: BalanceBag[];
  onBagsUpdate?: (bags: { gs: BalanceBag[]; usd: BalanceBag[] }) => void;
  onRequireUpgrade?: (featureName: string) => void;
}

interface BankAccount {
  id: string;
  bankName: string;
  country: string;
  accountNumber: string;
  currency: 'GS' | 'USD';
  accountType: 'savings' | 'checking';
  holderName: string;
}

interface Withdrawal {
  id: string;
  date: string;
  amount: number;
  currency: 'GS' | 'USD';
  commission: number;
  iva: number;
  netAmount: number;
  totalDebited: number;
  status: 'success' | 'rejected';
  accountNumber: string;
  bankName: string;
}

type ViewType = 'intro' | 'main' | 'add-account' | 'edit-account' | 'withdraw' | 'history';

export function BankModal({ 
  isOpen, 
  onClose, 
  userName, 
  currentMembership = 'gratuito',
  availableBalance, 
  onBalanceUpdate, 
  balanceBagsGs, 
  balanceBagsUsd, 
  onBagsUpdate,
  onRequireUpgrade
}: BankModalProps) {
  // Check localStorage for intro preference
  const getInitialView = (): ViewType => {
    try {
      const hideIntro = localStorage.getItem('woz_bank_hide_intro');
      return hideIntro === 'true' ? 'main' : 'intro';
    } catch {
      return 'intro';
    }
  };

  const [view, setView] = useState<ViewType>(getInitialView());
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [accounts, setAccounts] = useState<BankAccount[]>([
    {
      id: '1',
      bankName: 'Banco Nacional de Fomento',
      country: 'Paraguay',
      accountNumber: '2401-567890-4',
      currency: 'GS',
      accountType: 'savings',
      holderName: userName
    }
  ]);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([
    {
      id: '1',
      date: '2026-02-08T10:30:00',
      amount: 500000,
      currency: 'GS',
      commission: 75000,
      iva: 7500,
      netAmount: 417500,
      totalDebited: 500000,
      status: 'success',
      accountNumber: '2401-567890-4',
      bankName: 'Banco Nacional de Fomento'
    },
    {
      id: '2',
      date: '2026-02-05T14:20:00',
      amount: 200,
      currency: 'USD',
      commission: 30,
      iva: 3,
      netAmount: 167,
      totalDebited: 200,
      status: 'rejected',
      accountNumber: '9876543210',
      bankName: 'Banco Internacional'
    }
  ]);

  // Form states
  const [bankName, setBankName] = useState('');
  const [country, setCountry] = useState('Paraguay');
  const [accountNumber, setAccountNumber] = useState('');
  const [currency, setCurrency] = useState<'GS' | 'USD'>('GS');
  const [accountType, setAccountType] = useState<'savings' | 'checking'>('savings');

  // Withdraw states
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<'GS' | 'USD'>('GS');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawStatus, setWithdrawStatus] = useState<'idle' | 'processing' | 'success' | 'rejected'>('idle');

  // Reset view when modal opens
  useEffect(() => {
    if (isOpen) {
      setView(getInitialView());
      setDontShowAgain(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleContinueFromIntro = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('woz_bank_hide_intro', 'true');
      } catch (error) {
        console.error('Error saving preference:', error);
      }
    }
    setView('main');
  };

  const resetForm = () => {
    setBankName('');
    setCountry('Paraguay');
    setAccountNumber('');
    setCurrency('GS');
    setAccountType('savings');
    setEditingAccount(null);
  };

  const resetWithdrawForm = () => {
    setSelectedAccount('');
    setSelectedCurrency('GS');
    setWithdrawAmount('');
    setWithdrawStatus('idle');
  };

  const handleClose = () => {
    setView('intro');
    resetForm();
    resetWithdrawForm();
    onClose();
  };

  const handleAddAccount = () => {
    if (currentMembership === 'gratuito') {
      onRequireUpgrade?.('Agregar banco');
      return;
    }

    if (accounts.length >= 5) {
      alert('Has alcanzado el límite de 5 cuentas');
      return;
    }
    resetForm();
    setView('add-account');
  };

  const handleEditAccount = (account: BankAccount) => {
    setEditingAccount(account);
    setBankName(account.bankName);
    setCountry(account.country);
    setAccountNumber(account.accountNumber);
    setCurrency(account.currency);
    setAccountType(account.accountType);
    setView('edit-account');
  };

  const handleDeleteAccount = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta cuenta bancaria?')) {
      setAccounts(accounts.filter(acc => acc.id !== id));
    }
  };

  const handleSaveAccount = () => {
    if (!bankName || !accountNumber) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const accountData: BankAccount = {
      id: editingAccount?.id || Date.now().toString(),
      bankName,
      country,
      accountNumber,
      currency,
      accountType,
      holderName: userName
    };

    if (editingAccount) {
      setAccounts(accounts.map(acc => acc.id === editingAccount.id ? accountData : acc));
    } else {
      setAccounts([...accounts, accountData]);
    }

    resetForm();
    setView('main');
  };

  const hasEnoughFunds = (amount: number, curr: 'GS' | 'USD') => {
    const balance = curr === 'GS' ? availableBalance.guaranies : availableBalance.dollars;
    const bags = curr === 'GS' ? (balanceBagsGs || []) : (balanceBagsUsd || []);
    const calc = calculateWithdrawalByBags(amount, bags, currentMembership);
    return balance >= calc.totalDebited;
  };

  const getWithdrawalCalculation = (amount: number, curr: 'GS' | 'USD'): WithdrawalCalculation => {
    const bags = curr === 'GS' ? (balanceBagsGs || []) : (balanceBagsUsd || []);
    return calculateWithdrawalByBags(amount, bags, currentMembership);
  };

  const handleWithdraw = () => {
    const rawAmount = parseInputNumber(withdrawAmount);
    const amount = parseFloat(rawAmount);
    if (!selectedAccount || !amount || amount <= 0) {
      alert('Por favor completa todos los campos correctamente');
      return;
    }

    const account = accounts.find(acc => acc.id === selectedAccount);
    if (!account) return;

    // Obtener todas las bolsas y calcular usando FIFO interno
    const bags = selectedCurrency === 'GS' ? (balanceBagsGs || []) : (balanceBagsUsd || []);
    const availableBalance = bags.reduce((sum, bag) => sum + bag.amount, 0);

    // Validar que no exceda el disponible
    if (amount > availableBalance) {
      alert('El monto excede el saldo disponible');
      return;
    }

    setWithdrawStatus('processing');

    setTimeout(() => {
      // Simulación: 80% éxito, 20% rechazo
      const success = Math.random() > 0.2;
      
      // Calcular usando todas las bolsas con FIFO
      const calc = calculateWithdrawalByBags(amount, bags);

      const newWithdrawal: Withdrawal = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        amount,
        currency: selectedCurrency,
        commission: calc.totalCommission,
        iva: calc.totalIva,
        netAmount: calc.netAmount,
        totalDebited: calc.totalDebited,
        status: success ? 'success' : 'rejected',
        accountNumber: account.accountNumber,
        bankName: account.bankName
      };

      setWithdrawals([newWithdrawal, ...withdrawals]);
      setWithdrawStatus(success ? 'success' : 'rejected');

      // Actualizar saldo si el retiro fue exitoso
      if (success && onBalanceUpdate) {
        const newBalance = {
          guaranies: selectedCurrency === 'GS' ? availableBalance.guaranies - calc.totalDebited : availableBalance.guaranies,
          dollars: selectedCurrency === 'USD' ? availableBalance.dollars - calc.totalDebited : availableBalance.dollars
        };
        onBalanceUpdate(newBalance);
      }

      // Actualizar bolsas si el retiro fue exitoso
      if (success && onBagsUpdate) {
        const { consumeBagsAfterWithdrawal } = require('../utils/withdrawalCalculations');
        const newBagsGs = selectedCurrency === 'GS' && balanceBagsGs ? consumeBagsAfterWithdrawal(balanceBagsGs, calc) : balanceBagsGs || [];
        const newBagsUsd = selectedCurrency === 'USD' && balanceBagsUsd ? consumeBagsAfterWithdrawal(balanceBagsUsd, calc) : balanceBagsUsd || [];
        
        onBagsUpdate({
          gs: newBagsGs,
          usd: newBagsUsd
        });
      }
    }, 3000);
  };

  const handleBackToMain = () => {
    resetWithdrawForm();
    setView('main');
  };

  const formatCurrency = (amount: number, curr: 'GS' | 'USD') => {
    if (curr === 'GS') {
      return `Gs ${Math.round(amount).toLocaleString('es-PY')}`;
    }
    return `USD ${amount.toLocaleString('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatInputNumber = (value: string) => {
    // Elimina todo lo que no sea número
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    // Formatea con separadores de miles
    return parseInt(numericValue).toLocaleString('es-PY');
  };

  const parseInputNumber = (value: string) => {
    // Elimina los separadores de miles para obtener el número
    return value.replace(/\./g, '').replace(/,/g, '');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PY', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasAnyFunds = availableBalance.guaranies > 0 || availableBalance.dollars > 0;

  const getHeaderTitle = () => {
    switch (view) {
      case 'intro': return 'Banco';
      case 'add-account': return 'Agregar cuenta';
      case 'edit-account': return 'Editar cuenta';
      case 'withdraw': return 'Retirar fondos';
      case 'history': return 'Historial de retiros';
      default: return 'Banco';
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-blue-600 border-b border-blue-700 px-5 py-4 flex items-center justify-between">
        <button
          onClick={() => {
            if (view === 'main' || view === 'intro') {
              handleClose();
            } else if (view === 'withdraw' && withdrawStatus !== 'idle') {
              handleBackToMain();
            } else {
              resetForm();
              resetWithdrawForm();
              setView('main');
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
          {/* Intro View */}
          {view === 'intro' && (
            <div className="space-y-5 py-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Cuenta bancaria para retiros</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Para retirar tus ingresos y ganancias, debes agregar una cuenta bancaria verificada a tu nombre.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Información importante</h3>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="w-1 h-1 rounded-full bg-blue-400 flex-shrink-0 mt-1.5"></div>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      La cuenta bancaria debe estar registrada a nombre del titular de la cuenta Woz Payments
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-1 h-1 rounded-full bg-blue-400 flex-shrink-0 mt-1.5"></div>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Los retiros tienen un tiempo de espera de <strong>7 días hábiles</strong> antes de procesarse mediante transferencia bancaria
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-1 h-1 rounded-full bg-blue-400 flex-shrink-0 mt-1.5"></div>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Puedes agregar múltiples cuentas bancarias y seleccionar una como predeterminada
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-1 h-1 rounded-full bg-blue-400 flex-shrink-0 mt-1.5"></div>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Tus datos bancarios se almacenan de forma encriptada y segura
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-3.5 rounded-r">
                <p className="text-xs text-gray-700 leading-relaxed">
                  <strong className="font-semibold text-gray-900">Requisito obligatorio:</strong> Debes tener al menos una cuenta bancaria agregada para poder realizar retiros de fondos desde tu wallet Woz Payments.
                </p>
              </div>

              <label className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700">No volver a mostrar este mensaje</span>
              </label>

              <button
                onClick={handleContinueFromIntro}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
              >
                Agregar cuenta bancaria
              </button>
            </div>
          )}

          {/* Main View */}
          {view === 'main' && (
            <div className="space-y-5">
              {/* Saldo disponible para retiro - Minimalista sin color */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Saldo disponible para retiro</h3>
                <div className="bg-white border border-gray-300 rounded-xl p-3">
                  {/* Guaraníes */}
                  <div className="pb-2.5 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Guaraníes</span>
                      {availableBalance.guaranies > 0 && (
                        <span className="text-xs text-gray-400">Disponible</span>
                      )}
                    </div>
                    <p className="text-lg text-gray-900">
                      {availableBalance.guaranies.toLocaleString('es-PY')}
                    </p>
                  </div>
                  
                  {/* Dólares */}
                  <div className="pt-2.5">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Dólares</span>
                      {availableBalance.dollars > 0 && (
                        <span className="text-xs text-gray-400">Disponible</span>
                      )}
                    </div>
                    <p className="text-lg text-gray-900">
                      {availableBalance.dollars.toLocaleString('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              {!hasAnyFunds && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Sin fondos disponibles</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Necesitas tener fondos en tu cuenta para realizar retiros
                    </p>
                  </div>
                </div>
              )}

              {/* Cuentas bancarias */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">Cuentas bancarias</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{accounts.length} de 5 cuentas</p>
                  </div>
                  {accounts.length < 5 && (
                    <button
                      onClick={handleAddAccount}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Plus size={16} />
                      Agregar
                    </button>
                  )}
                </div>

                {accounts.length === 0 ? (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Building2 size={40} className="text-gray-400 mx-auto mb-2" />
                    <p className="font-semibold text-gray-900 mb-1 text-sm">No hay cuentas agregadas</p>
                    <p className="text-xs text-gray-600 mb-3">Agrega una cuenta bancaria para poder retirar fondos</p>
                    <button
                      onClick={handleAddAccount}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                      Agregar primera cuenta
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {accounts.map((account) => (
                      <div key={account.id} className="bg-white border border-gray-200 rounded-lg p-3.5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <Building2 size={16} className="text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">{account.bankName}</h4>
                              <p className="text-xs text-gray-500">{account.country}</p>
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleEditAccount(account)}
                              className="w-7 h-7 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteAccount(account.id)}
                              className="w-7 h-7 rounded bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2.5 text-xs">
                          <div className="flex justify-between items-center pb-2.5 border-b border-gray-200">
                            <span className="text-gray-600">Nº de cuenta</span>
                            <span className="font-semibold text-gray-900 font-mono">{account.accountNumber}</span>
                          </div>
                          <div className="flex justify-between items-center pb-2.5 border-b border-gray-200">
                            <span className="text-gray-600">Tipo</span>
                            <span className="font-medium text-gray-900">
                              {account.accountType === 'savings' ? 'Ahorro' : 'Corriente'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pb-2.5 border-b border-gray-200">
                            <span className="text-gray-600">Moneda</span>
                            <span className="font-medium text-gray-900">{account.currency === 'GS' ? 'Guaraníes (GS)' : 'Dólares (USD)'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Titular</span>
                            <span className="font-medium text-gray-900">{account.holderName}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Historial */}
              <button
                onClick={() => setView('history')}
                className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
              >
                Ver historial de retiros
              </button>
            </div>
          )}

          {/* Add/Edit Account View - Minimalista con titular primero */}
          {(view === 'add-account' || view === 'edit-account') && (
            <div className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Titular de la cuenta</label>
                  <input
                    type="text"
                    value={userName}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    El titular debe coincidir con tu cuenta registrada
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Banco</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Ej: Banco Nacional"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">País</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Paraguay">Paraguay</option>
                    <option value="Argentina">Argentina</option>
                    <option value="Brasil">Brasil</option>
                    <option value="Chile">Chile</option>
                    <option value="Uruguay">Uruguay</option>
                    <option value="Estados Unidos">Estados Unidos</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Número de cuenta</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Ej: 1234567890"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Moneda</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setCurrency('GS')}
                      className={`py-2.5 rounded-lg font-medium transition-all ${
                        currency === 'GS'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Guaraníes
                    </button>
                    <button
                      onClick={() => setCurrency('USD')}
                      className={`py-2.5 rounded-lg font-medium transition-all ${
                        currency === 'USD'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Dólares
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Tipo de cuenta</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setAccountType('savings')}
                      className={`py-2.5 rounded-lg font-medium transition-all ${
                        accountType === 'savings'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Ahorro
                    </button>
                    <button
                      onClick={() => setAccountType('checking')}
                      className={`py-2.5 rounded-lg font-medium transition-all ${
                        accountType === 'checking'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Corriente
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveAccount}
                disabled={!bankName || !accountNumber}
                className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {editingAccount ? 'Guardar cambios' : 'Agregar cuenta'}
              </button>
            </div>
          )}

          {/* Withdraw View */}
          {view === 'withdraw' && (
            <div className="space-y-4">
              {withdrawStatus === 'idle' && (
                <>
                  {accounts.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-center">
                      <AlertCircle size={40} className="text-gray-500 mx-auto mb-2" />
                      <p className="font-semibold text-gray-900 mb-1 text-sm">No tienes cuentas bancarias</p>
                      <p className="text-xs text-gray-600 mb-3">
                        Necesitas agregar al menos una cuenta bancaria para retirar fondos
                      </p>
                      <button
                        onClick={handleAddAccount}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                      >
                        Agregar cuenta bancaria
                      </button>
                    </div>
                  ) : !hasAnyFunds ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-center">
                      <AlertCircle size={40} className="text-gray-500 mx-auto mb-2" />
                      <p className="font-semibold text-gray-900 mb-1 text-sm">Sin fondos disponibles</p>
                      <p className="text-xs text-gray-600">
                        No tienes fondos suficientes para realizar un retiro
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Selector de moneda - Minimalista con switches */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2.5">Moneda a retirar</h3>
                        <div className="bg-white border border-gray-300 rounded-xl p-3">
                          {/* Guaraníes */}
                          <div
                            onClick={() => {
                              setSelectedCurrency('GS');
                              setWithdrawAmount('');
                            }}
                            className="w-full pb-2.5 border-b border-gray-200 text-left cursor-pointer"
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-xs text-gray-500 uppercase tracking-wide">Guaraníes</span>
                              <div className="flex items-center gap-2">
                                {availableBalance.guaranies > 0 && (
                                  <span className="text-xs text-gray-400">Disponible</span>
                                )}
                                <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${selectedCurrency === 'GS' ? 'bg-[#05bc52]' : 'bg-gray-300'}`}>
                                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${selectedCurrency === 'GS' ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                </div>
                              </div>
                            </div>
                            <p className="text-lg text-gray-900">
                              {availableBalance.guaranies.toLocaleString('es-PY')}
                            </p>
                          </div>
                          
                          {/* Dólares */}
                          <div
                            onClick={() => {
                              setSelectedCurrency('USD');
                              setWithdrawAmount('');
                            }}
                            className="w-full pt-2.5 text-left cursor-pointer"
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-xs text-gray-500 uppercase tracking-wide">Dólares</span>
                              <div className="flex items-center gap-2">
                                {availableBalance.dollars > 0 && (
                                  <span className="text-xs text-gray-400">Disponible</span>
                                )}
                                <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${selectedCurrency === 'USD' ? 'bg-[#05bc52]' : 'bg-gray-300'}`}>
                                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${selectedCurrency === 'USD' ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                </div>
                              </div>
                            </div>
                            <p className="text-lg text-gray-900">
                              {availableBalance.dollars.toLocaleString('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">Cuenta de destino</label>
                          <select
                            value={selectedAccount}
                            onChange={(e) => {
                              setSelectedAccount(e.target.value);
                              setWithdrawAmount('');
                            }}
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            <option value="">Selecciona una cuenta</option>
                            {accounts.map((account) => (
                              <option key={account.id} value={account.id}>
                                {account.bankName} • {account.accountNumber} • {account.currency}
                              </option>
                            ))}
                          </select>

                        </div>

                        {/* Input de monto - siempre visible primero */}
                        {selectedAccount && (
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Monto a retirar</label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">
                                {selectedCurrency === 'USD' ? 'USD' : 'Gs'}
                              </span>
                              <input
                                type="text"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(formatInputNumber(e.target.value))}
                                placeholder="0"
                                className="w-full pl-14 pr-3.5 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base font-semibold"
                              />
                            </div>
                          </div>
                        )}

                        {/* Cálculo automático de comisión */}
                        {selectedAccount && withdrawAmount && parseFloat(parseInputNumber(withdrawAmount)) > 0 && (() => {
                          const amount = parseFloat(parseInputNumber(withdrawAmount));
                          const bags = selectedCurrency === 'GS' ? (balanceBagsGs || []) : (balanceBagsUsd || []);
                          const availableBalance = bags.reduce((sum, bag) => sum + bag.amount, 0);

                          // Validar que no exceda el disponible
                          if (amount > availableBalance) {
                            return (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-xs text-red-800 font-semibold">
                                  ⚠️ Monto excede el saldo disponible
                                </p>
                                <p className="text-xs text-red-700 mt-1">
                                  Máximo disponible: <strong>{formatCurrency(availableBalance, selectedCurrency)}</strong>
                                </p>
                              </div>
                            );
                          }

                          // Calcular usando FIFO interno
                          const calc = calculateWithdrawalByBags(amount, bags);
                          const fixedFeeAmount = selectedCurrency === 'USD' ? 1.5 : (1.5 * 7500);

                          return (
                            <div className="bg-white border border-gray-300 rounded-lg p-4">
                              <div className="space-y-2.5 text-sm">
                                <div className="pb-2.5 border-b border-gray-200">
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-700">Comisión de retiro</span>
                                    <span className="text-gray-900">
                                      {formatCurrency(calc.totalCommission, selectedCurrency)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {calc.bagsUsed.length === 1 
                                      ? formatDaysOld(calc.bagsUsed[0].daysOld)
                                      : `${Math.min(...calc.bagsUsed.map(b => b.daysOld))} - ${Math.max(...calc.bagsUsed.map(b => b.daysOld))} días`
                                    }
                                  </p>
                                </div>
                                
                                <div className="pb-2.5 border-b border-gray-200">
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-700">IVA sobre comisión</span>
                                    <span className="text-gray-900">
                                      {formatCurrency(calc.totalIva, selectedCurrency)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5">10% de la comisión de retiro</p>
                                </div>
                                
                                <div className="pt-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-900 font-medium">Total a retirar</span>
                                    <span className="text-green-600 font-semibold text-base">
                                      {formatCurrency(calc.netAmount, selectedCurrency)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Cuadro informativo de comisiones */}
                        {selectedAccount && (
                          <div className="bg-white border border-gray-300 rounded-lg p-4">
                            <h4 className="text-gray-900 mb-3 text-sm">Comisiones por tiempo de retiro</h4>
                            <div className="space-y-2.5">
                              <div className="border-b border-gray-200 pb-2.5">
                                <p className="text-gray-900 text-sm">Comisión 15%</p>
                                <p className="text-xs text-gray-600 mt-0.5">Retiro instantáneo</p>
                              </div>
                              <div className="border-b border-gray-200 pb-2.5">
                                <p className="text-gray-900 text-sm">Comisión 10%</p>
                                <p className="text-xs text-gray-600 mt-0.5">Retirando a los 7 días</p>
                              </div>
                              <div className="border-b border-gray-200 pb-2.5">
                                <p className="text-gray-900 text-sm">Comisión 8%</p>
                                <p className="text-xs text-gray-600 mt-0.5">Retirando a los 14 días</p>
                              </div>
                              <div>
                                <p className="text-gray-900 text-sm">Comisión 3,9%</p>
                                <p className="text-xs text-gray-600 mt-0.5">Retirando a los 30 días</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={handleWithdraw}
                          disabled={
                            !selectedAccount || 
                            !withdrawAmount || 
                            parseFloat(parseInputNumber(withdrawAmount)) <= 0 ||
                            (() => {
                              const bags = selectedCurrency === 'GS' ? (balanceBagsGs || []) : (balanceBagsUsd || []);
                              const available = bags.reduce((sum, bag) => sum + bag.amount, 0);
                              return parseFloat(parseInputNumber(withdrawAmount)) > available;
                            })()
                          }
                          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          Confirmar retiro
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}

              {withdrawStatus === 'processing' && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Procesando retiro</h3>
                  <p className="text-sm text-gray-600 text-center">
                    Estamos procesando tu solicitud...
                  </p>
                </div>
              )}

              {withdrawStatus === 'success' && (() => {
                const account = accounts.find(a => a.id === selectedAccount)!;
                const bags = selectedCurrency === 'GS' ? (balanceBagsGs || []) : (balanceBagsUsd || []);
                const calc = calculateWithdrawalByBags(parseFloat(parseInputNumber(withdrawAmount)), bags);
                
                return (
                  <div className="space-y-5">
                    {/* Icono y mensaje principal */}
                    <div className="text-center py-4">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                        <Clock size={32} className="text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Retiro pendiente</h3>
                      <p className="text-sm text-gray-600">
                        Se acreditará en <span className="font-semibold text-gray-900">24 horas</span>
                      </p>
                    </div>

                    {/* Tarjeta con información del monto */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-xs text-green-700 uppercase tracking-wide mb-1">Monto a recibir</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(calc.netAmount, selectedCurrency)}
                      </p>
                    </div>

                    {/* Detalles del retiro */}
                    <div className="bg-white border border-gray-300 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 text-sm mb-3">Detalles del retiro</h4>
                      <div className="space-y-2.5 text-sm">
                        <div className="pb-2.5 border-b border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Banco</span>
                            <span className="font-medium text-gray-900">{account.bankName}</span>
                          </div>
                        </div>
                        
                        <div className="pb-2.5 border-b border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Cuenta</span>
                            <span className="font-medium text-gray-900 font-mono">{account.accountNumber}</span>
                          </div>
                        </div>
                        
                        <div className="pb-2.5 border-b border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Titular</span>
                            <span className="font-medium text-gray-900">{userName}</span>
                          </div>
                        </div>
                        
                        <div className="pb-2.5 border-b border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Moneda</span>
                            <span className="font-medium text-gray-900">{selectedCurrency === 'GS' ? 'Guaraníes (GS)' : 'Dólares (USD)'}</span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Tiempo estimado</span>
                            <span className="font-medium text-blue-600">24 horas</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Información adicional */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-blue-900 leading-relaxed">
                            <strong className="font-semibold">Tu dinero está en camino.</strong> El procesamiento bancario puede tardar hasta 24 horas hábiles. Te notificaremos cuando el dinero esté disponible en tu cuenta.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleBackToMain}
                      className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Entendido
                    </button>
                  </div>
                );
              })()}

              {withdrawStatus === 'rejected' && (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-5 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mx-auto mb-3">
                      <X size={32} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-red-900 mb-1">Retiro rechazado</h3>
                    <p className="text-sm text-red-700">
                      Tu solicitud de retiro no pudo ser procesada
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2.5">
                    <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-900">Motivos comunes de rechazo</p>
                      <ul className="text-xs text-yellow-700 mt-1.5 space-y-1">
                        <li>• Datos bancarios incorrectos</li>
                        <li>• Cuenta bancaria bloqueada o inactiva</li>
                        <li>• Problemas de verificación de identidad</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      onClick={() => setWithdrawStatus('idle')}
                      className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Intentar de nuevo
                    </button>
                    <button
                      onClick={handleBackToMain}
                      className="flex-1 bg-gray-100 text-gray-900 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Volver
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History View */}
          {view === 'history' && (
            <div className="space-y-3">
              {withdrawals.length === 0 ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <DollarSign size={40} className="text-gray-400 mx-auto mb-2" />
                  <p className="font-semibold text-gray-900 mb-1 text-sm">Sin retiros realizados</p>
                  <p className="text-xs text-gray-600">Tu historial de retiros aparecerá aquí</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {withdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="bg-white border border-gray-200 rounded-lg p-3.5">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          withdrawal.status === 'success'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {withdrawal.status === 'success' ? 'Exitoso' : 'Rechazado'}
                        </span>
                        <p className="text-xs text-gray-500">{formatDate(withdrawal.date)}</p>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between items-center pb-1.5 mb-1.5 border-b border-gray-200">
                          <span className="text-gray-600">Monto neto recibido</span>
                          <span className="font-bold text-green-600 text-sm">
                            {formatCurrency(withdrawal.netAmount, withdrawal.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Banco</span>
                          <span className="font-medium text-gray-900">{withdrawal.bankName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cuenta</span>
                          <span className="font-medium text-gray-900 font-mono">{withdrawal.accountNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Moneda</span>
                          <span className="font-medium text-gray-900">{withdrawal.currency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Comisión</span>
                          <span className="text-gray-700">{formatCurrency(withdrawal.commission, withdrawal.currency)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">IVA</span>
                          <span className="text-gray-700">{formatCurrency(withdrawal.iva, withdrawal.currency)}</span>
                        </div>
                        <div className="flex justify-between pt-1 mt-1 border-t border-gray-200">
                          <span className="text-gray-600">Total debitado</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(withdrawal.totalDebited, withdrawal.currency)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Botón fijo en la parte inferior solo en vista main */}
      {view === 'main' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => hasAnyFunds && accounts.length > 0 ? setView('withdraw') : null}
              disabled={!hasAnyFunds || accounts.length === 0}
              className={`w-full py-4 rounded-lg text-lg flex items-center justify-center gap-2 transition-colors ${ hasAnyFunds && accounts.length > 0 ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed' }`}
            >
              
              Retirar fondos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}