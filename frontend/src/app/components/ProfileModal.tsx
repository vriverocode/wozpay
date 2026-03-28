import { useState, useEffect, useRef } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  FileText, 
  Camera, 
  Shield, 
  Bell, 
  LogOut, 
  Trash2,
  ChevronRight,
  Check,
  AlertCircle,
  Calendar,
  Upload,
  Scan,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Section = 'main' | 'personal' | 'email' | 'phone' | 'password' | 'documents' | 'facial' | 'security' | 'notifications' | 'delete';

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('main');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Update local state when user changes
  useEffect(() => {
    if (user) {
      setPersonalData(prev => ({
        ...prev,
        firstName: user.firstName,
        lastName: user.lastName,
        idNumber: user.cedula
      }));
      setEmail(user.email);
    }
  }, [user]);

  // Scroll to top when section changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeSection]);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [documentType, setDocumentType] = useState<'cedula' | 'passport'>('cedula');
  
  // User data states
  const [personalData, setPersonalData] = useState({
    firstName: user?.firstName || 'Juan',
    lastName: user?.lastName || 'Pérez',
    idNumber: user?.cedula || '4.567.890',
    birthDate: '1990-05-15',
    nationality: 'Paraguaya',
    address: 'Av. Mariscal López 1234, Asunción'
  });

  const [email, setEmail] = useState(user?.email || 'juan@wozpayments.com');
  const [newEmail, setNewEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [emailCodeSent, setEmailCodeSent] = useState(false);

  const [phone, setPhone] = useState('+595 981 234567');
  const [newPhone, setNewPhone] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isDocumentVerified, setIsDocumentVerified] = useState(false);
  const [isFacialVerified, setIsFacialVerified] = useState(false);

  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    transactionAlerts: true,
    promotions: false
  });

  if (!isOpen) return null;

  const handleBack = () => {
    setActiveSection('main');
  };

  const handleSavePersonalData = () => {
    setActiveSection('main');
  };

  const handleSendEmailCode = () => {
    setEmailCodeSent(true);
  };

  const handleVerifyEmail = () => {
    if (emailCode.length === 6) {
      setEmail(newEmail);
      setNewEmail('');
      setEmailCode('');
      setEmailCodeSent(false);
      setActiveSection('main');
    }
  };

  const handleSendPhoneCode = () => {
    setPhoneCodeSent(true);
  };

  const handleVerifyPhone = () => {
    if (phoneCode.length === 6) {
      setPhone(newPhone);
      setNewPhone('');
      setPhoneCode('');
      setPhoneCodeSent(false);
      setActiveSection('main');
    }
  };

  const handleChangePassword = () => {
    if (newPassword === confirmPassword && newPassword.length >= 8) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveSection('main');
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleDeleteAccount = () => {
    console.log('Eliminar cuenta');
    onClose();
  };

  // Main Menu
  if (activeSection === 'main') {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-5 py-4 flex items-center justify-between shadow-lg">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h2 className="text-lg font-bold text-white">Mi Perfil</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto pb-6">
          <div className="max-w-lg mx-auto p-5 space-y-4">
            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                  {personalData.firstName.charAt(0)}{personalData.lastName.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {personalData.firstName} {personalData.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">CI: {personalData.idNumber}</p>
                  <p className="text-xs text-gray-500 mt-1">{email}</p>
                </div>
              </div>

              {/* Verification Status */}
              <div className="grid grid-cols-2 gap-2">
                <div className={`px-3 py-2 rounded-xl border ${isDocumentVerified ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-center gap-1.5">
                    {isDocumentVerified ? (
                      <Check size={14} className="text-green-600" />
                    ) : (
                      <AlertCircle size={14} className="text-amber-600" />
                    )}
                    <span className={`text-xs font-semibold ${isDocumentVerified ? 'text-green-700' : 'text-amber-700'}`}>
                      {isDocumentVerified ? 'Verificado' : 'Doc. Pendiente'}
                    </span>
                  </div>
                </div>
                <div className={`px-3 py-2 rounded-xl border ${isFacialVerified ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-center gap-1.5">
                    {isFacialVerified ? (
                      <Check size={14} className="text-green-600" />
                    ) : (
                      <AlertCircle size={14} className="text-amber-600" />
                    )}
                    <span className={`text-xs font-semibold ${isFacialVerified ? 'text-green-700' : 'text-amber-700'}`}>
                      {isFacialVerified ? 'Verificado' : 'Facial Pendiente'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* KYC Alert if not verified */}
            {(!isDocumentVerified || !isFacialVerified) && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
                <div className="flex gap-3">
                  <Shield size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-900 mb-1">
                      Verifica tu identidad
                    </p>
                    <p className="text-xs text-amber-700 mb-3">
                      Completa tu verificación KYC para acceder a todas las funcionalidades de Woz Payments.
                    </p>
                    <button
                      onClick={() => setActiveSection(!isDocumentVerified ? 'documents' : 'facial')}
                      className="text-xs font-semibold text-amber-900 underline hover:text-amber-700"
                    >
                      Completar verificación
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Account Section */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                <h4 className="font-bold text-gray-900 text-sm">Cuenta</h4>
              </div>
              <button
                onClick={() => setActiveSection('personal')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <User size={18} className="text-gray-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">Datos personales</p>
                    <p className="text-xs text-gray-500">Información de tu cuenta</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
              <button
                onClick={() => setActiveSection('email')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Mail size={18} className="text-gray-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">Correo electrónico</p>
                    <p className="text-xs text-gray-500">{email}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
              <button
                onClick={() => setActiveSection('phone')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Phone size={18} className="text-gray-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">Teléfono</p>
                    <p className="text-xs text-gray-500">{phone}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                <h4 className="font-bold text-gray-900 text-sm">Seguridad</h4>
              </div>
              <button
                onClick={() => setActiveSection('password')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Lock size={18} className="text-gray-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">Contraseña</p>
                    <p className="text-xs text-gray-500">Cambiar tu contraseña</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
              <button
                onClick={() => setActiveSection('documents')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <FileText size={18} className="text-gray-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">Verificación documental</p>
                    <p className="text-xs text-gray-500">
                      {isDocumentVerified ? 'Completado' : 'Requerido'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isDocumentVerified && <Check size={16} className="text-green-600" />}
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
              </button>
              <button
                onClick={() => setActiveSection('facial')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Camera size={18} className="text-gray-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">Verificación facial</p>
                    <p className="text-xs text-gray-500">
                      {isFacialVerified ? 'Completado' : 'Requerido'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isFacialVerified && <Check size={16} className="text-green-600" />}
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
              </button>
            </div>

            {/* Settings Section */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                <h4 className="font-bold text-gray-900 text-sm">Configuración</h4>
              </div>
              <button
                onClick={() => setActiveSection('notifications')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Bell size={18} className="text-gray-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">Notificaciones</p>
                    <p className="text-xs text-gray-500">Gestionar alertas</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Actions Section */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <LogOut size={18} className="text-gray-600" />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">Cerrar sesión</p>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
              <button
                onClick={() => setActiveSection('delete')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-red-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <Trash2 size={18} className="text-red-600" />
                  </div>
                  <p className="font-semibold text-red-600 text-sm">Eliminar cuenta</p>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="text-center py-4">
              <p className="text-xs text-gray-400">Woz Payments v1.0.0</p>
            </div>
          </div>
        </div>

        {/* Logout Confirmation */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-5">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Cerrar sesión</h3>
              <p className="text-sm text-gray-600 mb-6">
                ¿Estás seguro de que quieres cerrar sesión?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-900 font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Personal Data Section
  if (activeSection === 'personal') {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-5 py-4 flex items-center gap-3 shadow-lg">
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h2 className="text-lg font-bold text-white">Datos personales</h2>
        </div>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto pb-6">
          <div className="max-w-lg mx-auto p-5 space-y-4">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
              <div className="flex gap-3">
                <Shield size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-900 mb-1">
                    Datos protegidos
                  </p>
                  <p className="text-xs text-amber-700">
                    Por regulaciones financieras, tu nombre completo y cédula no pueden modificarse. Contacta a soporte para cambios.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 space-y-4 shadow-sm border border-gray-100">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Nombres
                </label>
                <div className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed flex items-center justify-between">
                  <span>{personalData.firstName}</span>
                  <Lock size={14} className="text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">Campo bloqueado por seguridad</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Apellidos
                </label>
                <div className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed flex items-center justify-between">
                  <span>{personalData.lastName}</span>
                  <Lock size={14} className="text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">Campo bloqueado por seguridad</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Cédula de Identidad
                </label>
                <div className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed flex items-center justify-between">
                  <span>{personalData.idNumber}</span>
                  <Lock size={14} className="text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">Campo bloqueado por seguridad</p>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Fecha de nacimiento
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={personalData.birthDate}
                    onChange={(e) => setPersonalData({...personalData, birthDate: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                  <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Nacionalidad
                </label>
                <input
                  type="text"
                  value={personalData.nationality}
                  onChange={(e) => setPersonalData({...personalData, nationality: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Dirección
                </label>
                <textarea
                  value={personalData.address}
                  onChange={(e) => setPersonalData({...personalData, address: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleSavePersonalData}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Email Section
  if (activeSection === 'email') {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-5 py-4 flex items-center gap-3 shadow-lg">
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h2 className="text-lg font-bold text-white">Correo electrónico</h2>
        </div>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto pb-6">
          <div className="max-w-lg mx-auto p-5 space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Correo actual
                </label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-medium">
                  {email}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Nuevo correo electrónico
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              {emailCodeSent && (
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Código de verificación
                  </label>
                  <input
                    type="text"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-center text-2xl tracking-widest font-bold"
                  />
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    Código enviado a <span className="font-semibold">{newEmail}</span>
                  </p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <Mail size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-blue-900 mb-1">
                      Verificación requerida
                    </p>
                    <p className="text-xs text-blue-700">
                      Enviaremos un código de 6 dígitos a tu nuevo correo para confirmar el cambio.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {!emailCodeSent ? (
              <button
                onClick={handleSendEmailCode}
                disabled={!newEmail || newEmail === email}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                Enviar código de verificación
              </button>
            ) : (
              <button
                onClick={handleVerifyEmail}
                disabled={emailCode.length !== 6}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                Verificar y cambiar correo
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Phone Section
  if (activeSection === 'phone') {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-5 py-4 flex items-center gap-3 shadow-lg">
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h2 className="text-lg font-bold text-white">Número de teléfono</h2>
        </div>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto pb-6">
          <div className="max-w-lg mx-auto p-5 space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Número actual
                </label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-medium">
                  {phone}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Nuevo número de teléfono
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+595 981 234567"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              {phoneCodeSent && (
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Código de verificación
                  </label>
                  <input
                    type="text"
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-center text-2xl tracking-widest font-bold"
                  />
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    Código enviado por SMS a <span className="font-semibold">{newPhone}</span>
                  </p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <Phone size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-blue-900 mb-1">
                      Verificación por SMS
                    </p>
                    <p className="text-xs text-blue-700">
                      Enviaremos un código de 6 dígitos por SMS a tu nuevo número para confirmar el cambio.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {!phoneCodeSent ? (
              <button
                onClick={handleSendPhoneCode}
                disabled={!newPhone || newPhone === phone}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                Enviar código SMS
              </button>
            ) : (
              <button
                onClick={handleVerifyPhone}
                disabled={phoneCode.length !== 6}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                Verificar y cambiar número
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Password Section
  if (activeSection === 'password') {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-5 py-4 flex items-center gap-3 shadow-lg">
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h2 className="text-lg font-bold text-white">Cambiar contraseña</h2>
        </div>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto pb-6">
          <div className="max-w-lg mx-auto p-5 space-y-4">
            <div className="bg-white rounded-2xl p-5 space-y-4 shadow-sm border border-gray-100">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Contraseña actual
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña actual"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Confirmar nueva contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs font-bold text-blue-900 mb-3">
                  Requisitos de seguridad:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={`text-xs ${newPassword.length >= 8 ? 'text-green-700 font-semibold' : 'text-gray-600'}`}>
                      Mínimo 8 caracteres
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={`text-xs ${/[A-Z]/.test(newPassword) ? 'text-green-700 font-semibold' : 'text-gray-600'}`}>
                      Una letra mayúscula
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={`text-xs ${/[0-9]/.test(newPassword) ? 'text-green-700 font-semibold' : 'text-gray-600'}`}>
                      Un número
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${newPassword === confirmPassword && newPassword.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={`text-xs ${newPassword === confirmPassword && newPassword.length > 0 ? 'text-green-700 font-semibold' : 'text-gray-600'}`}>
                      Las contraseñas coinciden
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleChangePassword}
              disabled={!currentPassword || newPassword.length < 8 || newPassword !== confirmPassword}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              Cambiar contraseña
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Documents Section
  if (activeSection === 'documents') {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-5 py-4 flex items-center gap-3 shadow-lg">
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h2 className="text-lg font-bold text-white">Verificación documental</h2>
        </div>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto pb-6">
          <div className="max-w-lg mx-auto p-5 space-y-4">
            {isDocumentVerified ? (
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                <div className="w-16 h-16 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
                  <Check size={32} className="text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Documentos verificados
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Tu identidad ha sido verificada exitosamente
                </p>
                <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Documento:</span>
                    <span className="font-semibold text-gray-900">Cédula de Identidad</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Número:</span>
                    <span className="font-semibold text-gray-900">{personalData.idNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Verificado:</span>
                    <span className="font-semibold text-green-600">15 Ene 2025</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Document Type Selection */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 mb-4">
                    Selecciona tu tipo de documento
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setDocumentType('cedula')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        documentType === 'cedula'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <FileText size={24} className={documentType === 'cedula' ? 'text-blue-600 mx-auto mb-2' : 'text-gray-400 mx-auto mb-2'} />
                      <p className={`text-sm font-semibold text-center ${documentType === 'cedula' ? 'text-blue-900' : 'text-gray-600'}`}>
                        Cédula
                      </p>
                    </button>
                    <button
                      onClick={() => setDocumentType('passport')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        documentType === 'passport'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <FileText size={24} className={documentType === 'passport' ? 'text-blue-600 mx-auto mb-2' : 'text-gray-400 mx-auto mb-2'} />
                      <p className={`text-sm font-semibold text-center ${documentType === 'passport' ? 'text-blue-900' : 'text-gray-600'}`}>
                        Pasaporte
                      </p>
                    </button>
                  </div>
                </div>

                {/* Document Upload Cards */}
                {documentType === 'cedula' ? (
                  <>
                    {/* Front Side */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                      <div className="mb-4">
                        {/* Cedula Front Illustration */}
                        <div className="w-full aspect-[1.6/1] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden mb-4 relative">
                          <svg viewBox="0 0 320 200" className="w-full h-full">
                            {/* Card background with Paraguay colors */}
                            <rect x="0" y="0" width="320" height="200" fill="#ffffff"/>
                            <rect x="0" y="0" width="320" height="20" fill="#D52B1E"/>
                            <rect x="0" y="20" width="320" height="160" fill="#ffffff"/>
                            <rect x="0" y="180" width="320" height="20" fill="#0038A8"/>
                            
                            {/* Photo placeholder */}
                            <rect x="20" y="40" width="70" height="90" fill="#E5E7EB" rx="4"/>
                            <circle cx="55" cy="70" r="15" fill="#D1D5DB"/>
                            <path d="M 40 95 Q 55 85 70 95" stroke="#D1D5DB" strokeWidth="3" fill="none"/>
                            
                            {/* Text lines */}
                            <rect x="100" y="45" width="180" height="8" fill="#E5E7EB" rx="4"/>
                            <rect x="100" y="65" width="140" height="8" fill="#E5E7EB" rx="4"/>
                            <rect x="100" y="85" width="160" height="8" fill="#E5E7EB" rx="4"/>
                            <rect x="100" y="105" width="120" height="8" fill="#E5E7EB" rx="4"/>
                            
                            {/* Logo/Shield */}
                            <path d="M 160 140 L 150 150 L 150 165 Q 150 175 160 178 Q 170 175 170 165 L 170 150 Z" fill="#0038A8"/>
                            <rect x="155" y="145" width="10" height="4" fill="#D52B1E"/>
                            
                            {/* Document number */}
                            <rect x="20" y="145" width="100" height="10" fill="#F3F4F6" rx="4"/>
                            <text x="25" y="153" fontSize="8" fill="#6B7280" fontFamily="monospace">N° 1234567</text>
                          </svg>
                        </div>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">Foto del frente</h4>
                      <ul className="text-xs text-gray-600 space-y-1.5 mb-4">
                        <li className="flex items-start gap-2">
                          <Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Documento completo dentro del marco</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Foto nítida sin reflejos ni sombras</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Texto legible en toda la cédula</span>
                        </li>
                      </ul>
                      <button className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 shadow-md">
                        <Upload size={18} />
                        Subir frente de cédula
                      </button>
                    </div>

                    {/* Back Side */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                      <div className="mb-4">
                        {/* Cedula Back Illustration */}
                        <div className="w-full aspect-[1.6/1] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden mb-4 relative">
                          <svg viewBox="0 0 320 200" className="w-full h-full">
                            {/* Card background with Paraguay colors */}
                            <rect x="0" y="0" width="320" height="200" fill="#ffffff"/>
                            <rect x="0" y="0" width="320" height="20" fill="#D52B1E"/>
                            <rect x="0" y="20" width="320" height="160" fill="#ffffff"/>
                            <rect x="0" y="180" width="320" height="20" fill="#0038A8"/>
                            
                            {/* Barcode */}
                            <rect x="30" y="40" width="3" height="50" fill="#000000"/>
                            <rect x="36" y="40" width="2" height="50" fill="#000000"/>
                            <rect x="40" y="40" width="4" height="50" fill="#000000"/>
                            <rect x="46" y="40" width="2" height="50" fill="#000000"/>
                            <rect x="50" y="40" width="3" height="50" fill="#000000"/>
                            <rect x="55" y="40" width="2" height="50" fill="#000000"/>
                            <rect x="59" y="40" width="4" height="50" fill="#000000"/>
                            <rect x="65" y="40" width="3" height="50" fill="#000000"/>
                            <rect x="70" y="40" width="2" height="50" fill="#000000"/>
                            <rect x="74" y="40" width="3" height="50" fill="#000000"/>
                            
                            {/* MRZ (Machine Readable Zone) */}
                            <rect x="30" y="110" width="260" height="4" fill="#D1D5DB" rx="1"/>
                            <rect x="30" y="118" width="260" height="4" fill="#D1D5DB" rx="1"/>
                            <rect x="30" y="126" width="260" height="4" fill="#D1D5DB" rx="1"/>
                            
                            {/* Text blocks */}
                            <rect x="100" y="45" width="180" height="8" fill="#E5E7EB" rx="4"/>
                            <rect x="100" y="60" width="150" height="8" fill="#E5E7EB" rx="4"/>
                            <rect x="100" y="75" width="140" height="8" fill="#E5E7EB" rx="4"/>
                            
                            {/* Small shield */}
                            <path d="M 270 45 L 265 50 L 265 60 Q 265 65 270 67 Q 275 65 275 60 L 275 50 Z" fill="#0038A8"/>
                          </svg>
                        </div>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">Foto del dorso</h4>
                      <ul className="text-xs text-gray-600 space-y-1.5 mb-4">
                        <li className="flex items-start gap-2">
                          <Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Código de barras completamente visible</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Datos legibles sin cortes</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Sin reflejos en la superficie</span>
                        </li>
                      </ul>
                      <button className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 shadow-md">
                        <Upload size={18} />
                        Subir dorso de cédula
                      </button>
                    </div>
                  </>
                ) : (
                  /* Passport */
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="mb-4">
                      {/* Passport Illustration */}
                      <div className="w-full aspect-[1.4/1] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden mb-4 relative">
                        <svg viewBox="0 0 280 200" className="w-full h-full">
                          {/* Passport cover */}
                          <rect x="0" y="0" width="280" height="200" fill="#0038A8"/>
                          
                          {/* Paraguay emblem */}
                          <circle cx="140" cy="60" r="35" fill="#D52B1E"/>
                          <circle cx="140" cy="60" r="30" fill="#ffffff"/>
                          <path d="M 140 40 L 135 50 L 135 65 Q 135 72 140 75 Q 145 72 145 65 L 145 50 Z" fill="#0038A8"/>
                          <circle cx="140" cy="48" r="4" fill="#FFD700"/>
                          
                          {/* Text */}
                          <text x="140" y="115" fontSize="14" fill="#ffffff" textAnchor="middle" fontWeight="bold">PARAGUAY</text>
                          <text x="140" y="135" fontSize="10" fill="#ffffff" textAnchor="middle">PASAPORTE</text>
                          <text x="140" y="150" fontSize="10" fill="#ffffff" textAnchor="middle">PASSPORT</text>
                          
                          {/* Bottom stripe */}
                          <rect x="0" y="170" width="280" height="15" fill="#D52B1E"/>
                          <rect x="0" y="185" width="280" height="15" fill="#ffffff"/>
                        </svg>
                      </div>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">Foto de la página principal</h4>
                    <ul className="text-xs text-gray-600 space-y-1.5 mb-4">
                      <li className="flex items-start gap-2">
                        <Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Página con tu foto y datos personales</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Código MRZ (parte inferior) visible</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Foto clara sin reflejos del plástico</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Pasaporte vigente (no vencido)</span>
                      </li>
                    </ul>
                    <button className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 shadow-md">
                      <Upload size={18} />
                      Subir pasaporte
                    </button>
                  </div>
                )}

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <div className="flex gap-3">
                    <Shield size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-blue-900 mb-1">
                        Tus datos están seguros
                      </p>
                      <p className="text-xs text-blue-700">
                        Usamos encriptación de nivel bancario. Tu información está protegida y solo se usa para verificar tu identidad según normativas financieras.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Facial Verification Section
  if (activeSection === 'facial') {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-5 py-4 flex items-center gap-3 shadow-lg">
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h2 className="text-lg font-bold text-white">Verificación facial</h2>
        </div>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto pb-6">
          <div className="max-w-lg mx-auto p-5 space-y-4">
            {isFacialVerified ? (
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                <div className="w-16 h-16 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
                  <Check size={32} className="text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Verificación facial completa
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Tu identidad facial ha sido verificada correctamente
                </p>
                <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Estado:</span>
                    <span className="font-semibold text-green-600">Verificado</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Verificado:</span>
                    <span className="font-semibold text-gray-900">15 Ene 2025</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Nivel de seguridad:</span>
                    <span className="font-semibold text-gray-900">Alto</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Selfie Illustration */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="mb-4">
                    <div className="w-full aspect-[1/1] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden mb-4 relative flex items-center justify-center">
                      <svg viewBox="0 0 300 300" className="w-full h-full">
                        {/* Background */}
                        <rect x="0" y="0" width="300" height="300" fill="#F3F4F6"/>
                        
                        {/* Person outline */}
                        <circle cx="150" cy="110" r="40" fill="#D1D5DB"/>
                        <ellipse cx="150" cy="200" rx="65" ry="80" fill="#D1D5DB"/>
                        
                        {/* Face features */}
                        <circle cx="140" cy="105" r="5" fill="#9CA3AF"/>
                        <circle cx="160" cy="105" r="5" fill="#9CA3AF"/>
                        <path d="M 135 125 Q 150 130 165 125" stroke="#9CA3AF" strokeWidth="3" fill="none" strokeLinecap="round"/>
                        
                        {/* ID Card in hand */}
                        <rect x="190" y="160" width="70" height="45" fill="#ffffff" stroke="#0038A8" strokeWidth="2" rx="3"/>
                        <rect x="190" y="160" width="70" height="5" fill="#D52B1E"/>
                        <rect x="190" y="200" width="70" height="5" fill="#0038A8"/>
                        
                        {/* ID Card details */}
                        <rect x="195" y="170" width="20" height="25" fill="#E5E7EB" rx="2"/>
                        <rect x="220" y="172" width="35" height="3" fill="#D1D5DB" rx="1"/>
                        <rect x="220" y="178" width="30" height="3" fill="#D1D5DB" rx="1"/>
                        <rect x="220" y="184" width="25" height="3" fill="#D1D5DB" rx="1"/>
                        
                        {/* Hand */}
                        <ellipse cx="200" cy="180" rx="15" ry="20" fill="#D1D5DB" transform="rotate(-20 200 180)"/>
                        
                        {/* Camera frame corners */}
                        <path d="M 40 40 L 40 60 M 40 40 L 60 40" stroke="#0038A8" strokeWidth="4" strokeLinecap="round"/>
                        <path d="M 260 40 L 260 60 M 260 40 L 240 40" stroke="#0038A8" strokeWidth="4" strokeLinecap="round"/>
                        <path d="M 40 260 L 40 240 M 40 260 L 60 260" stroke="#0038A8" strokeWidth="4" strokeLinecap="round"/>
                        <path d="M 260 260 L 260 240 M 260 260 L 240 260" stroke="#0038A8" strokeWidth="4" strokeLinecap="round"/>
                        
                        {/* Focus circle */}
                        <circle cx="150" cy="110" r="60" stroke="#0038A8" strokeWidth="2" fill="none" strokeDasharray="10 5" opacity="0.5"/>
                      </svg>
                    </div>
                  </div>

                  <h4 className="font-bold text-gray-900 mb-2">Selfie con tu documento</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Tomaremos una foto tuya sosteniendo tu cédula o pasaporte para verificar tu identidad.
                  </p>

                  <ul className="text-xs text-gray-600 space-y-2 mb-4">
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Sostén tu documento</strong> cerca de tu rostro</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Asegúrate de que tu cara</strong> esté completamente visible</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>El documento debe verse claramente</strong> con tu foto visible</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Buena iluminación,</strong> sin gafas de sol ni gorros</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Fondo neutro</strong> y sin otras personas</span>
                    </li>
                  </ul>

                  <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg">
                    <Scan size={20} />
                    Comenzar identificación
                  </button>
                </div>

                {/* Security Info */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-4">
                  <div className="flex gap-3">
                    <Shield size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-blue-900 mb-1">
                        Verificación biométrica segura
                      </p>
                      <p className="text-xs text-blue-700">
                        Utilizamos tecnología de reconocimiento facial avanzado para verificar que eres tú. Este proceso cumple con todas las normativas de protección de datos y KYC.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle size={18} className="text-amber-600" />
                    Consejos para una verificación exitosa
                  </h4>
                  <ul className="text-xs text-gray-600 space-y-2">
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold">1.</span>
                      <span>Busca un lugar bien iluminado (luz natural es ideal)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold">2.</span>
                      <span>Retira gafas, gorros o accesorios que cubran tu rostro</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold">3.</span>
                      <span>Mantén tu documento a la altura del pecho</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold">4.</span>
                      <span>Mantente quieto mientras se toma la foto</span>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Notifications Section
  if (activeSection === 'notifications') {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-5 py-4 flex items-center gap-3 shadow-lg">
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h2 className="text-lg font-bold text-white">Notificaciones</h2>
        </div>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto pb-6">
          <div className="max-w-lg mx-auto p-5 space-y-4">
            <div className="bg-white rounded-2xl p-5 space-y-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">Notificaciones push</p>
                  <p className="text-xs text-gray-600 mt-0.5">Alertas en tu dispositivo</p>
                </div>
                <button
                  onClick={() => setNotifications({...notifications, pushNotifications: !notifications.pushNotifications})}
                  className={`relative w-14 h-8 rounded-full transition-colors ${notifications.pushNotifications ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${notifications.pushNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">Notificaciones por correo</p>
                  <p className="text-xs text-gray-600 mt-0.5">Emails importantes</p>
                </div>
                <button
                  onClick={() => setNotifications({...notifications, emailNotifications: !notifications.emailNotifications})}
                  className={`relative w-14 h-8 rounded-full transition-colors ${notifications.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${notifications.emailNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">Notificaciones SMS</p>
                  <p className="text-xs text-gray-600 mt-0.5">Mensajes de texto</p>
                </div>
                <button
                  onClick={() => setNotifications({...notifications, smsNotifications: !notifications.smsNotifications})}
                  className={`relative w-14 h-8 rounded-full transition-colors ${notifications.smsNotifications ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${notifications.smsNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">Alertas de transacciones</p>
                  <p className="text-xs text-gray-600 mt-0.5">Pagos y cobros</p>
                </div>
                <button
                  onClick={() => setNotifications({...notifications, transactionAlerts: !notifications.transactionAlerts})}
                  className={`relative w-14 h-8 rounded-full transition-colors ${notifications.transactionAlerts ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${notifications.transactionAlerts ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">Promociones y ofertas</p>
                  <p className="text-xs text-gray-600 mt-0.5">Descuentos especiales</p>
                </div>
                <button
                  onClick={() => setNotifications({...notifications, promotions: !notifications.promotions})}
                  className={`relative w-14 h-8 rounded-full transition-colors ${notifications.promotions ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${notifications.promotions ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Delete Account Section
  if (activeSection === 'delete') {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 px-5 py-4 flex items-center gap-3 shadow-lg">
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h2 className="text-lg font-bold text-white">Eliminar cuenta</h2>
        </div>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto pb-6">
          <div className="max-w-lg mx-auto p-5 space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="w-16 h-16 rounded-full bg-red-100 mx-auto mb-4 flex items-center justify-center">
                <AlertCircle size={32} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">
                Eliminar cuenta permanentemente
              </h3>
              <p className="text-sm text-gray-600 mb-6 text-center">
                Esta acción no se puede deshacer. Se eliminarán todos tus datos.
              </p>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-xs font-bold text-red-900 mb-3">
                  Al eliminar tu cuenta:
                </p>
                <ul className="text-xs text-red-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <X size={14} className="flex-shrink-0 mt-0.5" />
                    <span>Perderás todos tus datos personales y financieros</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X size={14} className="flex-shrink-0 mt-0.5" />
                    <span>Se cancelarán todas tus suscripciones activas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X size={14} className="flex-shrink-0 mt-0.5" />
                    <span>Se eliminarán tus tarjetas vinculadas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X size={14} className="flex-shrink-0 mt-0.5" />
                    <span>Se cerrarán tus cuentas de ahorro</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X size={14} className="flex-shrink-0 mt-0.5" />
                    <span>Perderás tu historial de transacciones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X size={14} className="flex-shrink-0 mt-0.5" />
                    <span>No podrás recuperar esta cuenta nunca más</span>
                  </li>
                </ul>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Escribe "ELIMINAR" para confirmar
                </label>
                <input
                  type="text"
                  placeholder="ELIMINAR"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl font-bold hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
            >
              Eliminar mi cuenta permanentemente
            </button>
            <button
              onClick={handleBack}
              className="w-full bg-white text-gray-900 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors border border-gray-200"
            >
              Cancelar
            </button>
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-5">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Última confirmación</h3>
              <p className="text-sm text-gray-600 mb-6">
                ¿Estás completamente seguro de que quieres eliminar tu cuenta de Woz Payments? Esta acción es irreversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-900 font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
