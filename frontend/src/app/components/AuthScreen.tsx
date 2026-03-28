import { useState } from 'react';
import { Eye, EyeOff, Loader2, Mail, Lock, User, CreditCard, AlertCircle, CheckCircle2, ArrowLeft, Building2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { validatePassword, getPasswordStrength } from '../utils/passwordValidation';
import { BusinessRegistrationForm } from './BusinessRegistrationForm';

// ── Admin password (simple, para prototipo) ──────────────────────────────
const ADMIN_PASSWORD = 'wozadmin2025';

type AuthView = 'login' | 'register' | 'forgot-password' | 'business-register' | 'admin-login';

export function AuthScreen({ onAdminLogin }: { onAdminLogin?: () => void } = {}) {
  const { login, register, resetPassword } = useAuth();
  const [view, setView] = useState<AuthView>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cedula, setCedula] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');

  // Admin login state
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!adminPassword) { setError('Ingresa la contraseña de administrador.'); return; }
    if (adminPassword !== ADMIN_PASSWORD) { setError('Contraseña incorrecta.'); return; }
    sessionStorage.setItem('woz_admin_auth', '1');
    if (onAdminLogin) {
      onAdminLogin();
    } else {
      window.location.href = '/admin';
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!loginEmail || !loginPassword) throw new Error('Por favor completa todos los campos');
      await login(loginEmail, loginPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!firstName || !lastName || !cedula || !registerEmail || !registerPassword || !confirmPassword)
        throw new Error('Por favor completa todos los campos');
      if (!/^\d{7,8}$/.test(cedula)) throw new Error('El número de cédula debe contener 7 u 8 dígitos');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerEmail)) throw new Error('Por favor ingresa un correo electrónico válido');
      if (registerPassword !== confirmPassword) throw new Error('Las contraseñas no coinciden');
      const passwordValidation = validatePassword(registerPassword, cedula);
      if (!passwordValidation.isValid) throw new Error(passwordValidation.errors[0]);
      await register({ firstName, lastName, cedula, email: registerEmail, password: registerPassword });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally { setLoading(false); }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (!forgotEmail) throw new Error('Por favor ingresa tu correo electrónico');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) throw new Error('Por favor ingresa un correo electrónico válido');
      await resetPassword(forgotEmail);
      setSuccess('Se ha enviado un enlace de recuperación a tu correo electrónico');
      setForgotEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el correo');
    } finally { setLoading(false); }
  };

  const passwordStrength = registerPassword ? getPasswordStrength(registerPassword) : null;

  return (
    <>
      {view === 'business-register' ? (
        <BusinessRegistrationForm onBack={() => { setView('login'); setError(''); }} />
      ) : (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-5">
            <div className="w-10 h-10 flex items-center justify-center">
              <div className="flex items-center gap-[4px]">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-blue-900"></div>
              </div>
            </div>
            <h1 className="tracking-tight font-bold text-blue-900 text-[32px]">Woz Payments</h1>
          </div>
          <p className="text-sm text-gray-400 tracking-wide uppercase" style={{ letterSpacing: '0.08em' }}>Tu billetera digital profesional</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8" style={{ boxShadow: '0 -8px 30px rgba(0,0,0,0.08), 0 8px 30px rgba(0,0,0,0.10)' }}>

          {/* ── LOGIN ── */}
          {view === 'login' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Iniciar Sesión</h2>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Correo electrónico</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="tu@email.com" disabled={loading} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type={showLoginPassword ? 'text' : 'password'} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••" disabled={loading} />
                    <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="button" onClick={() => setView('forgot-password')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  ¿Olvidaste tu contraseña?
                </button>
                <button type="submit" disabled={loading} 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? <><Loader2 size={18} className="animate-spin" />Iniciando sesión...</> : 'Iniciar Sesión'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  ¿No tienes una cuenta?{' '}
                  <button onClick={() => { setView('register'); setError(''); }} className="text-blue-600 hover:text-blue-700 font-semibold">
                    Regístrate
                  </button>
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  <button onClick={() => { setView('business-register'); setError(''); }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-blue-100 rounded-xl text-sm font-semibold text-blue-800 hover:bg-blue-50 transition-colors">
                    <Building2 size={15} />
                    Registrar empresa
                  </button>
                  {/* Admin access — discrete */}
                  <button onClick={() => { setView('admin-login'); setError(''); setAdminPassword(''); }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                    <ShieldCheck size={13} />
                    Acceso administrador
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── ADMIN LOGIN ── */}
          {view === 'admin-login' && (
            <div>
              <button onClick={() => { setView('login'); setError(''); }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeft size={18} /><span>Volver</span>
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 bg-blue-900 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Panel de Administración</h2>
                  <p className="text-xs text-gray-400">Woz Payments · Acceso restringido</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña de administrador</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type={showAdminPassword ? 'text' : 'password'} value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)} autoFocus
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••" />
                    <button type="button" onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showAdminPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit"
                  className="w-full bg-gradient-to-r from-blue-900 to-blue-800 text-white py-3 rounded-lg font-semibold hover:from-blue-800 hover:to-blue-700 transition-all flex items-center justify-center gap-2">
                  <ShieldCheck size={16} />
                  Ingresar al panel
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-4">
                Solo personal autorizado de Woz Payments
              </p>
            </div>
          )}

          {/* ── REGISTER ── */}
          {view === 'register' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Crear Cuenta</h2>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Juan" disabled={loading} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Pérez" disabled={loading} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número de cédula</label>
                  <div className="relative">
                    <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={cedula}
                      onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 8) setCedula(v); }}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="12345678" disabled={loading} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Correo electrónico</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="tu@email.com" disabled={loading} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type={showRegisterPassword ? 'text' : 'password'} value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••" disabled={loading} />
                    <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {registerPassword && passwordStrength && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-300 ${passwordStrength.strength === 'weak' ? 'bg-red-500' : passwordStrength.strength === 'medium' ? 'bg-yellow-500' : passwordStrength.strength === 'strong' ? 'bg-blue-500' : 'bg-green-500'}`}
                            style={{ width: `${passwordStrength.percentage}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {passwordStrength.strength === 'weak' ? 'Débil' : passwordStrength.strength === 'medium' ? 'Media' : passwordStrength.strength === 'strong' ? 'Fuerte' : 'Muy fuerte'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Repetir contraseña</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••" disabled={loading} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPassword && (
                    <div className="mt-2 flex items-center gap-1">
                      {registerPassword === confirmPassword
                        ? <><CheckCircle2 size={14} className="text-green-600" /><span className="text-xs text-green-600">Las contraseñas coinciden</span></>
                        : <><AlertCircle size={14} className="text-red-600" /><span className="text-xs text-red-600">Las contraseñas no coinciden</span></>
                      }
                    </div>
                  )}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-900 mb-2">Requisitos de contraseña:</p>
                  <ul className="text-xs text-gray-700 space-y-1">
                    {['Mínimo 8 caracteres','Letras mayúsculas y minúsculas','Al menos un número y un símbolo','No usar números correlativos (12345678, 987654321)','No usar tu número de cédula'].map(r => (
                      <li key={r} className="flex items-start gap-1"><span className="text-blue-600 mt-0.5">•</span><span>{r}</span></li>
                    ))}
                  </ul>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? <><Loader2 size={18} className="animate-spin" />Registrando...</> : 'Registrarse'}
                </button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-gray-600">¿Ya tienes una cuenta?{' '}
                  <button onClick={() => { setView('login'); setError(''); }} className="text-blue-600 hover:text-blue-700 font-semibold">Inicia sesión</button>
                </p>
              </div>
            </div>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {view === 'forgot-password' && (
            <div>
              <button onClick={() => { setView('login'); setError(''); setSuccess(''); }} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeft size={18} /><span>Volver</span>
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Recuperar Contraseña</h2>
              <p className="text-gray-600 mb-6">Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                  <CheckCircle2 size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              )}
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Correo electrónico</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="tu@email.com" disabled={loading} />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? <><Loader2 size={18} className="animate-spin" />Enviando...</> : 'Enviar enlace de recuperación'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
      )}
    </>
  );
}