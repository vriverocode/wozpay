import { useState, useMemo, useRef, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, Search, Check, ChevronDown, Info,
  Building2, Globe, FileText, User, ShieldCheck, AlertCircle,
  CheckCircle2, Loader2, X, HelpCircle, BadgeCheck, Zap, Lock
} from 'lucide-react';
import {
  COUNTRIES_MAP, COUNTRIES_LIST, getCountriesByRegion, REGION_LABELS,
  validateCountryEntityCombination, COMPLIANCE_COLORS,
  type CountryConfig, type EntityType, type FiscalField
} from '../data/businessRegistrationData';
import { projectId, publicAnonKey } from '/utils/supabase/info';

// ── Types ──────────────────────────────────────────────────────────────────
interface FormData {
  countryCode: string;
  entityTypeId: string;
  companyName: string;
  taxId: string;
  businessAddress: string;
  city: string;
  phone: string;
  website: string;
  dynamicFields: Record<string, string>;
  repFirstName: string;
  repLastName: string;
  repIdType: string;
  repIdNumber: string;
  repEmail: string;
  repPhone: string;
  repPosition: string;
  acceptTerms: boolean;
  acceptKyc: boolean;
}

const STEPS = [
  { id: 1, label: 'País', icon: Globe },
  { id: 2, label: 'Entidad', icon: Building2 },
  { id: 3, label: 'Datos Fiscales', icon: FileText },
  { id: 4, label: 'Representante', icon: User },
  { id: 5, label: 'Confirmación', icon: ShieldCheck },
];

const initialForm: FormData = {
  countryCode: '', entityTypeId: '', companyName: '', taxId: '',
  businessAddress: '', city: '', phone: '', website: '',
  dynamicFields: {}, repFirstName: '', repLastName: '',
  repIdType: 'cedula', repIdNumber: '', repEmail: '', repPhone: '',
  repPosition: '', acceptTerms: false, acceptKyc: false,
};

// ── Tooltip Component ──────────────────────────────────────────────────────
function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <HelpCircle size={14} className="text-gray-400 cursor-help" />
      {show && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-56 bg-gray-900 text-white text-xs rounded-lg p-2.5 shadow-xl leading-relaxed pointer-events-none">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

// ── Step Indicator ────────────────��────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-between mb-8 relative">
      <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />
      <div
        className="absolute top-4 left-0 h-0.5 bg-blue-600 z-0 transition-all duration-500"
        style={{ width: `${((current - 1) / (STEPS.length - 1)) * 100}%` }}
      />
      {STEPS.map(step => {
        const Icon = step.icon;
        const done = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex flex-col items-center gap-1.5 z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              done ? 'bg-blue-600 text-white shadow-md shadow-blue-200' :
              active ? 'bg-blue-900 text-white shadow-md shadow-blue-300 ring-4 ring-blue-100' :
              'bg-white text-gray-400 border-2 border-gray-200'
            }`}>
              {done ? <Check size={14} strokeWidth={3} /> : <Icon size={13} />}
            </div>
            <span className={`text-[10px] font-semibold hidden sm:block ${
              active ? 'text-blue-900' : done ? 'text-blue-600' : 'text-gray-400'
            }`}>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1: Country ────────────────────────────────────────────────────────
function Step1Country({ form, setForm }: { form: FormData; setForm: (f: FormData) => void }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const regionGroups = getCountriesByRegion();
  const selected = form.countryCode ? COUNTRIES_MAP[form.countryCode] : null;

  const filtered = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return COUNTRIES_LIST.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }, [search]);

  useEffect(() => {
    function handler(e: MouseEvent) { if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function select(code: string) {
    const changed = code !== form.countryCode;
    setForm({ ...form, countryCode: code, entityTypeId: changed ? '' : form.entityTypeId, dynamicFields: changed ? {} : form.dynamicFields });
    setOpen(false); setSearch('');
  }

  const renderList = (countries: CountryConfig[]) => countries.map(c => (
    <button key={c.code} onClick={() => select(c.code)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
        form.countryCode === c.code ? 'bg-blue-50 text-blue-900' : 'hover:bg-gray-50'
      }`}>
      <span className="text-xl">{c.flag}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
        <p className="text-xs text-gray-400">{c.currency} · {c.entityTypes.length} tipos societarios</p>
      </div>
      {form.countryCode === c.code && <Check size={14} className="text-blue-600 flex-shrink-0" />}
    </button>
  ));

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Selecciona el país de constitución</h2>
      <p className="text-sm text-gray-500 mb-6">El tipo de entidad legal disponible depende del país.</p>

      <div ref={dropRef} className="relative mb-5">
        <button onClick={() => setOpen(!open)}
          className={`w-full flex items-center gap-3 px-4 py-3.5 border rounded-xl text-left transition-all ${
            open ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
          } bg-white`}>
          {selected ? (
            <>
              <span className="text-2xl">{selected.flag}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{selected.name}</p>
                <p className="text-xs text-gray-400">{selected.currency} · {selected.entityTypes.length} formas jurídicas disponibles</p>
              </div>
            </>
          ) : (
            <span className="text-gray-400 flex items-center gap-2"><Globe size={16} /> Buscar y seleccionar país...</span>
          )}
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 max-h-80 overflow-hidden flex flex-col">
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Buscar país..." />
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              {filtered ? (
                filtered.length ? renderList(filtered) : <p className="text-sm text-gray-400 text-center py-4">Sin resultados</p>
              ) : (
                <>
                  {(Object.entries(regionGroups) as [keyof typeof regionGroups, CountryConfig[]][]).map(([region, countries]) => (
                    <div key={region} className="mb-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase px-2 py-1.5 tracking-widest">{REGION_LABELS[region]}</p>
                      {renderList(countries)}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {selected && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <BadgeCheck size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900">{selected.name} seleccionado</p>
            <p className="text-xs text-blue-700 mt-0.5">
              Moneda: <strong>{selected.currency}</strong> · ID Fiscal: <strong>{selected.taxIdLabel}</strong> ·{' '}
              {selected.entityTypes.length} formas jurídicas disponibles en el siguiente paso.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step 2: Entity Type ────────────────────────────────────────────────────
function Step2EntityType({ form, setForm }: { form: FormData; setForm: (f: FormData) => void }) {
  const country = COUNTRIES_MAP[form.countryCode];
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  function select(id: string) {
    setForm({ ...form, entityTypeId: id, dynamicFields: {} });
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{country.flag}</span>
        <h2 className="text-xl font-bold text-gray-900">Tipo de entidad legal</h2>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Solo se muestran los tipos societarios válidos en <strong>{country.name}</strong>.
      </p>

      <div className="space-y-2.5">
        {country.entityTypes.map(et => {
          const comp = COMPLIANCE_COLORS[et.complianceLevel];
          const isSelected = form.entityTypeId === et.id;
          return (
            <button key={et.id} onClick={() => select(et.id)}
              className={`w-full text-left rounded-xl border-2 p-4 transition-all duration-200 ${
                isSelected
                  ? 'border-blue-600 bg-blue-50 shadow-md shadow-blue-100'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 bg-white'
              }`}>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                }`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">{et.name}</span>
                    <span className="text-sm text-gray-500">—</span>
                    <span className="text-sm text-gray-600">{et.fullName}</span>
                    <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${comp.bg} ${comp.text}`}>
                      {comp.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2 leading-relaxed">{et.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {et.features.map((f, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        <Check size={8} className="text-green-600" /> {f}
                      </span>
                    ))}
                    {et.minCapital && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-medium">
                        Capital mín.: {et.minCapital}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setActiveTooltip(activeTooltip === et.id ? null : et.id); }}
                  className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${activeTooltip === et.id ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>
                  <Info size={14} />
                </button>
              </div>
              {activeTooltip === et.id && (
                <div className="mt-3 ml-8 p-3 bg-gray-900 rounded-lg text-xs text-gray-100 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <Info size={12} className="text-blue-400 flex-shrink-0 mt-0.5" />
                    {et.tooltip}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
        <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          <strong>Validación legal activa:</strong> Solo se muestran combinaciones válidas para <strong>{country.name}</strong>.
          Las combinaciones inválidas son bloqueadas automáticamente por el sistema.
        </p>
      </div>
    </div>
  );
}

// ── Step 3: Fiscal Data ────────────────────────────────────────────────────
function Step3FiscalData({ form, setForm }: { form: FormData; setForm: (f: FormData) => void }) {
  const country = COUNTRIES_MAP[form.countryCode];
  const entity = country.entityTypes.find(e => e.id === form.entityTypeId)!;

  const visibleDynamicFields = country.fiscalFields.filter(f =>
    !f.onlyFor || f.onlyFor.includes(form.entityTypeId)
  );

  function set(key: keyof FormData, val: string) {
    setForm({ ...form, [key]: val });
  }
  function setDynamic(key: string, val: string) {
    setForm({ ...form, dynamicFields: { ...form.dynamicFields, [key]: val } });
  }

  const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all bg-white";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{country.flag}</span>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Datos fiscales y legales</h2>
          <p className="text-xs text-gray-400 font-medium">{country.name} · {entity.name} – {entity.fullName}</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-5">Los campos se adaptan automáticamente al tipo societario seleccionado.</p>

      <div className="space-y-4">
        {/* Company Name */}
        <div>
          <label className={labelCls}>Razón Social / Nombre Empresarial <span className="text-red-500">*</span></label>
          <input type="text" value={form.companyName} onChange={e => set('companyName', e.target.value)}
            className={inputCls} placeholder={`Ej: Mi Empresa ${entity.name}`} />
        </div>

        {/* Tax ID */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <label className={labelCls.replace('mb-1.5', '')}>{country.taxIdLabel} <span className="text-red-500">*</span></label>
            <Tooltip text={country.taxIdHelpText} />
          </div>
          <input type="text" value={form.taxId} onChange={e => set('taxId', e.target.value)}
            className={inputCls} placeholder={country.taxIdPlaceholder} />
          <p className="text-xs text-gray-400 mt-1">{country.taxIdHelpText}</p>
        </div>

        {/* Address & City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Dirección registrada <span className="text-red-500">*</span></label>
            <input type="text" value={form.businessAddress} onChange={e => set('businessAddress', e.target.value)}
              className={inputCls} placeholder="Calle, número, piso..." />
          </div>
          <div>
            <label className={labelCls}>Ciudad / Localidad <span className="text-red-500">*</span></label>
            <input type="text" value={form.city} onChange={e => set('city', e.target.value)}
              className={inputCls} placeholder="Ciudad" />
          </div>
        </div>

        {/* Phone & Website */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Teléfono empresarial <span className="text-red-500">*</span></label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
              className={inputCls} placeholder="+1 234 567 8900" />
          </div>
          <div>
            <label className={labelCls}>Sitio web</label>
            <input type="text" value={form.website} onChange={e => set('website', e.target.value)}
              className={inputCls} placeholder="https://miempresa.com" />
          </div>
        </div>

        {/* Dynamic country+entity fields */}
        {visibleDynamicFields.length > 0 && (
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-2">
                Campos específicos · {country.name}
              </span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>
            <div className="space-y-4">
              {visibleDynamicFields.map(field => (
                <DynamicField key={field.id} field={field}
                  value={form.dynamicFields[field.id] || ''}
                  onChange={val => setDynamic(field.id, val)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DynamicField({ field, value, onChange }: { field: FiscalField; value: string; onChange: (v: string) => void }) {
  const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all bg-white";
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <label className="block text-sm font-semibold text-gray-700">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        {field.helpText && <Tooltip text={field.helpText} />}
      </div>
      {field.type === 'select' && field.options ? (
        <div className="relative">
          <select value={value} onChange={e => onChange(e.target.value)} className={inputCls + ' pr-10 appearance-none'}>
            <option value="">Seleccionar...</option>
            {field.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      ) : (
        <input type={field.type} value={value} onChange={e => onChange(e.target.value)}
          className={inputCls} placeholder={field.placeholder} />
      )}
      {field.helpText && <p className="text-xs text-gray-400 mt-1">{field.helpText}</p>}
    </div>
  );
}

// ── Step 4: Representative ─────────────────────────────────────────────────
function Step4Representative({ form, setForm }: { form: FormData; setForm: (f: FormData) => void }) {
  function set(key: keyof FormData, val: string) {
    setForm({ ...form, [key]: val });
  }
  const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all bg-white";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Representante Legal</h2>
      <p className="text-sm text-gray-500 mb-5">Datos de la persona autorizada para firmar y actuar en nombre de la empresa.</p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Nombre <span className="text-red-500">*</span></label>
            <input type="text" value={form.repFirstName} onChange={e => set('repFirstName', e.target.value)}
              className={inputCls} placeholder="Juan" />
          </div>
          <div>
            <label className={labelCls}>Apellido <span className="text-red-500">*</span></label>
            <input type="text" value={form.repLastName} onChange={e => set('repLastName', e.target.value)}
              className={inputCls} placeholder="Pérez" />
          </div>
        </div>

        <div>
          <label className={labelCls}>Cargo / Posición <span className="text-red-500">*</span></label>
          <div className="relative">
            <select value={form.repPosition} onChange={e => set('repPosition', e.target.value)}
              className={inputCls + ' appearance-none pr-10'}>
              <option value="">Seleccionar cargo...</option>
              <option value="ceo">CEO / Director General</option>
              <option value="president">Presidente</option>
              <option value="director">Director</option>
              <option value="gerente">Gerente General</option>
              <option value="socio_gerente">Socio Gerente</option>
              <option value="apoderado">Apoderado Legal</option>
              <option value="administrador">Administrador Único</option>
              <option value="fundador">Fundador / Titular</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Tipo ID <span className="text-red-500">*</span></label>
            <div className="relative">
              <select value={form.repIdType} onChange={e => set('repIdType', e.target.value)}
                className={inputCls + ' appearance-none pr-10'}>
                <option value="cedula">Cédula</option>
                <option value="dni">DNI</option>
                <option value="passport">Pasaporte</option>
                <option value="rut">RUT</option>
                <option value="curp">CURP</option>
                <option value="ssn">SSN</option>
                <option value="nid">NID</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Número de identificación <span className="text-red-500">*</span></label>
            <input type="text" value={form.repIdNumber} onChange={e => set('repIdNumber', e.target.value)}
              className={inputCls} placeholder="Número de documento" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Correo electrónico <span className="text-red-500">*</span></label>
            <input type="email" value={form.repEmail} onChange={e => set('repEmail', e.target.value)}
              className={inputCls} placeholder="representante@empresa.com" />
          </div>
          <div>
            <label className={labelCls}>Teléfono <span className="text-red-500">*</span></label>
            <input type="tel" value={form.repPhone} onChange={e => set('repPhone', e.target.value)}
              className={inputCls} placeholder="+1 234 567 8900" />
          </div>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <Lock size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-900 mb-1">Proceso KYC / AML</p>
            <p className="text-xs text-amber-800 leading-relaxed">
              Los datos del representante legal serán verificados mediante nuestro proceso de
              Conoce a Tu Cliente (KYC) y Anti-Lavado de Dinero (AML). Se requiere documentación
              adicional en el siguiente paso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step 5: Confirmation ───────────────────────────────────────────────────
function Step5Confirmation({
  form, setForm, onSubmit, loading, error, success
}: {
  form: FormData; setForm: (f: FormData) => void;
  onSubmit: () => void; loading: boolean; error: string; success: boolean;
}) {
  const country = COUNTRIES_MAP[form.countryCode];
  const entity = country.entityTypes.find(e => e.id === form.entityTypeId)!;
  const comp = COMPLIANCE_COLORS[entity.complianceLevel];

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Registro enviado!</h2>
        <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
          Tu solicitud de registro empresarial fue enviada correctamente.
          Recibirás un correo en <strong>{form.repEmail}</strong> con los próximos pasos del proceso KYC.
        </p>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-left max-w-sm mx-auto">
          <p className="text-xs font-bold text-blue-900 mb-2">¿Qué sigue?</p>
          <ul className="space-y-1.5 text-xs text-blue-800">
            {['Verificación de identidad (KYC)', 'Validación de documentos societarios', 'Aprobación por el equipo de compliance', 'Activación de cuenta empresarial Woz'].map((s, i) => (
              <li key={i} className="flex items-center gap-2"><Check size={10} className="text-blue-600" />{s}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Confirmar y enviar</h2>
      <p className="text-sm text-gray-500 mb-5">Revisa la información antes de enviar tu solicitud de registro.</p>

      <div className="space-y-3 mb-5">
        {/* Entity Summary */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex items-center gap-2">
            <Building2 size={14} className="text-gray-500" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Entidad Legal</span>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-xs text-gray-400">País</p><p className="font-semibold">{country.flag} {country.name}</p></div>
            <div><p className="text-xs text-gray-400">Tipo societario</p><p className="font-semibold">{entity.name} <span className={`text-[10px] ${comp.text} ${comp.bg} px-1.5 py-0.5 rounded-full ml-1`}>{comp.label}</span></p></div>
            <div className="col-span-2"><p className="text-xs text-gray-400">Razón social</p><p className="font-semibold">{form.companyName}</p></div>
            <div><p className="text-xs text-gray-400">{country.taxIdLabel}</p><p className="font-semibold font-mono">{form.taxId}</p></div>
            <div><p className="text-xs text-gray-400">Teléfono</p><p className="font-semibold">{form.phone}</p></div>
            <div className="col-span-2"><p className="text-xs text-gray-400">Dirección</p><p className="font-semibold">{form.businessAddress}, {form.city}</p></div>
          </div>
        </div>

        {/* Representative Summary */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex items-center gap-2">
            <User size={14} className="text-gray-500" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Representante Legal</span>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-xs text-gray-400">Nombre completo</p><p className="font-semibold">{form.repFirstName} {form.repLastName}</p></div>
            <div><p className="text-xs text-gray-400">Cargo</p><p className="font-semibold capitalize">{form.repPosition.replace(/_/g, ' ')}</p></div>
            <div><p className="text-xs text-gray-400">ID ({form.repIdType.toUpperCase()})</p><p className="font-semibold font-mono">{form.repIdNumber}</p></div>
            <div><p className="text-xs text-gray-400">Email</p><p className="font-semibold text-xs truncate">{form.repEmail}</p></div>
          </div>
        </div>
      </div>

      {/* Legal checkboxes */}
      <div className="space-y-3 mb-5">
        {[
          { key: 'acceptTerms' as const, label: 'Acepto los Términos y Condiciones de Woz Payments para cuentas empresariales y confirmo que la información proporcionada es verdadera y verificable.' },
          { key: 'acceptKyc' as const, label: 'Autorizo el proceso de verificación KYC/AML y el tratamiento de datos personales conforme a la política de privacidad de Woz Payments.' },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-start gap-3 cursor-pointer group">
            <div onClick={() => setForm({ ...form, [key]: !form[key] })}
              className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                form[key] ? 'border-blue-600 bg-blue-600' : 'border-gray-300 group-hover:border-blue-400'
              }`}>
              {form[key] && <Check size={11} className="text-white" strokeWidth={3} />}
            </div>
            <span className="text-xs text-gray-600 leading-relaxed">{label}</span>
          </label>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
          <AlertCircle size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <button onClick={onSubmit} disabled={loading || !form.acceptTerms || !form.acceptKyc}
        className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
        {loading ? <><Loader2 size={16} className="animate-spin" />Validando y enviando...</> : <><ShieldCheck size={16} />Enviar solicitud de registro empresarial</>}
      </button>
      <p className="text-center text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
        <Lock size={10} /> Transmisión cifrada SSL · Validación backend activa
      </p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export function BusinessRegistrationForm({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function canProceed(): boolean {
    if (step === 1) return !!form.countryCode;
    if (step === 2) return !!form.entityTypeId && validateCountryEntityCombination(form.countryCode, form.entityTypeId);
    if (step === 3) {
      const country = COUNTRIES_MAP[form.countryCode];
      const requiredDynamic = country.fiscalFields.filter(f =>
        f.required && (!f.onlyFor || f.onlyFor.includes(form.entityTypeId))
      ).every(f => !!form.dynamicFields[f.id]);
      return !!form.companyName && !!form.taxId && !!form.businessAddress && !!form.city && !!form.phone && requiredDynamic;
    }
    if (step === 4) return !!form.repFirstName && !!form.repLastName && !!form.repEmail && !!form.repPhone && !!form.repIdNumber && !!form.repPosition;
    return true;
  }

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      // Backend validation
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fe20efe1/validate-business-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ countryCode: form.countryCode, entityTypeId: form.entityTypeId, companyName: form.companyName, taxId: form.taxId, repEmail: form.repEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) throw new Error(data.message || 'Validación fallida en el servidor.');
      // Submit registration
      const submitRes = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fe20efe1/submit-business-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify(form),
      });
      if (!submitRes.ok) throw new Error('Error al guardar el registro. Intenta nuevamente.');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  function next() { if (canProceed() && step < 5) { setError(''); setStep(s => s + 1); } }
  function prev() { if (step > 1) { setError(''); setStep(s => s - 1); } }

  return (
    <div className="min-h-screen bg-white flex items-start justify-center p-4 py-8">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-teal-400" />
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <div className="w-2 h-2 rounded-full bg-blue-900" />
              </div>
              <span className="font-bold text-blue-900 text-sm">Woz Payments</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Registro Empresarial</h1>
          </div>
          <div className="ml-auto flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1">
            <ShieldCheck size={12} className="text-green-600" />
            <span className="text-[10px] font-bold text-green-700">KYC Ready</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8" style={{ boxShadow: '0 -8px 30px rgba(0,0,0,0.08), 0 8px 30px rgba(0,0,0,0.10)' }}>
          {!success && <StepIndicator current={step} />}

          {step === 1 && <Step1Country form={form} setForm={setForm} />}
          {step === 2 && <Step2EntityType form={form} setForm={setForm} />}
          {step === 3 && <Step3FiscalData form={form} setForm={setForm} />}
          {step === 4 && <Step4Representative form={form} setForm={setForm} />}
          {step === 5 && (
            <Step5Confirmation form={form} setForm={setForm}
              onSubmit={handleSubmit} loading={loading} error={error} success={success} />
          )}

          {!success && step < 5 && (
            <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
              <button onClick={prev} disabled={step === 1}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-xl hover:bg-gray-50">
                <ArrowLeft size={15} /> Anterior
              </button>
              <span className="text-xs text-gray-400">{step} / {STEPS.length}</span>
              <button onClick={next} disabled={!canProceed()}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-blue-900 text-white rounded-xl hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-blue-200">
                Siguiente <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>

        {!success && (
          <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1.5">
            <Lock size={10} /> Datos cifrados · Validación legal en tiempo real · Preparado para KYC/AML
          </p>
        )}
      </div>
    </div>
  );
}