export type ComplianceLevel = 'simple' | 'moderate' | 'complex';
export type Region = 'latam' | 'northamerica' | 'europe';

export interface EntityType {
  id: string;
  name: string;
  fullName: string;
  description: string;
  tooltip: string;
  features: string[];
  minCapital?: string;
  complianceLevel: ComplianceLevel;
}

export interface FiscalField {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'date' | 'number';
  required: boolean;
  pattern?: string;
  patternMessage?: string;
  helpText?: string;
  options?: { value: string; label: string }[];
  onlyFor?: string[]; // entity type ids
}

export interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  region: Region;
  currency: string;
  taxIdLabel: string;
  taxIdPlaceholder: string;
  taxIdHelpText: string;
  entityTypes: EntityType[];
  fiscalFields: FiscalField[];
}

// ──────────────────────────────────────────────
// LATIN AMERICA
// ──────────────────────────────────────────────
const PARAGUAY: CountryConfig = {
  code: 'PY', name: 'Paraguay', flag: '🇵🇾', region: 'latam', currency: 'PYG',
  taxIdLabel: 'RUC', taxIdPlaceholder: '80012345-6',
  taxIdHelpText: 'Registro Único del Contribuyente emitido por la SET.',
  entityTypes: [
    { id: 'unipersonal', name: 'Unipersonal', fullName: 'Empresa Unipersonal', description: 'Persona física que realiza actividad comercial a su nombre.', tooltip: 'Ideal para comerciantes individuales. Sin separación de patrimonio personal.', features: ['Sin capital mínimo', 'Responsabilidad ilimitada', 'RUC personal'], complianceLevel: 'simple' },
    { id: 'eas', name: 'EAS', fullName: 'Empresa por Acciones Simplificada', description: 'Sociedad flexible y ágil con acciones y responsabilidad limitada.', tooltip: 'La forma societaria más moderna de Paraguay. Constitución digital disponible.', features: ['Capital mínimo: 1 PYG simbólico', 'Responsabilidad limitada', 'Constitución simplificada'], complianceLevel: 'simple' },
    { id: 'sa', name: 'SA', fullName: 'Sociedad Anónima', description: 'Sociedad de capital con acciones transferibles libremente.', tooltip: 'Para empresas medianas/grandes con múltiples accionistas o inversión extranjera.', features: ['Capital mínimo establecido', 'Acciones transferibles', 'Junta de accionistas'], minCapital: '₲ 10.000.000', complianceLevel: 'complex' },
    { id: 'srl', name: 'SRL', fullName: 'Sociedad de Responsabilidad Limitada', description: 'Sociedad de personas con responsabilidad limitada al capital aportado.', tooltip: 'Muy popular para PyMEs familiares. Máximo 25 socios.', features: ['Máx. 25 socios', 'Responsabilidad limitada', 'Cuotas no negociables libremente'], complianceLevel: 'moderate' },
    { id: 'eirl', name: 'EIRL', fullName: 'Empresa Individual de Responsabilidad Limitada', description: 'Empresa con un único titular y patrimonio separado del personal.', tooltip: 'Protege el patrimonio personal del empresario. Solo un titular.', features: ['Un único titular', 'Patrimonio separado', 'Responsabilidad limitada'], complianceLevel: 'moderate' },
    { id: 'cooperativa', name: 'Cooperativa', fullName: 'Cooperativa', description: 'Organización democrática de socios con fines comunes.', tooltip: 'Regida por el INCOOP. Requiere mínimo 20 socios fundadores.', features: ['Mínimo 20 socios', 'Gestión democrática', 'Beneficios fiscales'], complianceLevel: 'complex' },
  ],
  fiscalFields: [
    { id: 'actividadEconomica', label: 'Actividad Económica Principal', placeholder: 'Ej: Comercio al por menor', type: 'text', required: true },
    { id: 'fechaConst', label: 'Fecha de Constitución', placeholder: '', type: 'date', required: true, onlyFor: ['sa', 'srl', 'eas', 'eirl', 'cooperativa'] },
    { id: 'nroRegistroPublico', label: 'Nro. Registro Público de Comercio', placeholder: 'Ej: 12345/2023', type: 'text', required: false, onlyFor: ['sa', 'srl', 'eas'] },
  ],
};

const PERU: CountryConfig = {
  code: 'PE', name: 'Perú', flag: '🇵🇪', region: 'latam', currency: 'PEN',
  taxIdLabel: 'RUC', taxIdPlaceholder: '20123456789',
  taxIdHelpText: 'Registro Único de Contribuyentes de 11 dígitos emitido por SUNAT.',
  entityTypes: [
    { id: 'sac', name: 'SAC', fullName: 'Sociedad Anónima Cerrada', description: 'Sociedad con máximo 20 accionistas y acciones no inscritas en Bolsa.', tooltip: 'La forma más popular para startups y PyMEs peruanas. Directorio opcional.', features: ['Máx. 20 accionistas', 'Acciones no cotizadas', 'Directorio opcional'], complianceLevel: 'moderate' },
    { id: 'sa', name: 'SA', fullName: 'Sociedad Anónima', description: 'Sociedad de capital abierta con acciones libremente transferibles.', tooltip: 'Para empresas que buscan inversión de terceros o cotización en Bolsa.', features: ['Accionistas ilimitados', 'Directorio obligatorio', 'Puede cotizar en bolsa'], complianceLevel: 'complex' },
    { id: 'srl', name: 'SRL', fullName: 'Sociedad de Responsabilidad Limitada', description: 'Sociedad de personas con participaciones y responsabilidad limitada.', tooltip: 'Ideal para negocios familiares o con pocos socios. Máx. 20 socios.', features: ['Máx. 20 socios', 'Participaciones no negociables libremente', 'Sin directorio obligatorio'], complianceLevel: 'moderate' },
    { id: 'eirl', name: 'EIRL', fullName: 'Empresa Individual de Responsabilidad Limitada', description: 'Una sola persona natural con patrimonio separado.', tooltip: 'Creada exclusivamente para un solo titular. Protege bienes personales.', features: ['Un único titular', 'Patrimonio autónomo', 'Responsabilidad limitada'], complianceLevel: 'simple' },
  ],
  fiscalFields: [
    { id: 'regimeTributario', label: 'Régimen Tributario', placeholder: '', type: 'select', required: true, options: [{ value: 'rmt', label: 'RMT – Régimen MYPE Tributario' }, { value: 'general', label: 'Régimen General' }, { value: 'especial', label: 'Régimen Especial (RER)' }, { value: 'nrus', label: 'Nuevo RUS' }] },
    { id: 'ciiu', label: 'Código CIIU (Actividad)', placeholder: 'Ej: 4711 - Venta al por menor', type: 'text', required: true },
    { id: 'fechaInicioActividades', label: 'Fecha de Inicio de Actividades', placeholder: '', type: 'date', required: true },
  ],
};

const ARGENTINA: CountryConfig = {
  code: 'AR', name: 'Argentina', flag: '🇦🇷', region: 'latam', currency: 'ARS',
  taxIdLabel: 'CUIT', taxIdPlaceholder: '30-12345678-9',
  taxIdHelpText: 'Clave Única de Identificación Tributaria de 11 dígitos emitida por AFIP.',
  entityTypes: [
    { id: 'sas', name: 'SAS', fullName: 'Sociedad por Acciones Simplificada', description: 'Sociedad ágil, 100% digital, con un solo socio posible.', tooltip: 'La forma más moderna. Se puede constituir en 24 hs por plataforma digital del MJyDH.', features: ['Desde 1 socio', 'Constitución online', 'Capital: 2 salarios mínimos'], minCapital: 'ARS equiv. 2 salarios mínimos', complianceLevel: 'simple' },
    { id: 'sa', name: 'SA', fullName: 'Sociedad Anónima', description: 'Sociedad de capital con directorio y accionistas.', tooltip: 'Para empresas consolidadas. Requiere fiscalización estatal si supera ciertos umbrales.', features: ['Mínimo 2 accionistas', 'Directorio obligatorio', 'Capital mínimo ARS 100.000'], minCapital: 'ARS 100.000', complianceLevel: 'complex' },
    { id: 'srl', name: 'SRL', fullName: 'Sociedad de Responsabilidad Limitada', description: 'Sociedad de personas con cuotas partes y responsabilidad limitada.', tooltip: 'Muy usada por PyMEs. Máx. 50 socios. Gerente obligatorio.', features: ['Máx. 50 socios', 'Gerente obligatorio', 'Capital: ARS 12.000'], minCapital: 'ARS 12.000', complianceLevel: 'moderate' },
    { id: 'monotributista', name: 'Monotributista', fullName: 'Monotributista (Persona Física)', description: 'Régimen simplificado para pequeños contribuyentes.', tooltip: 'No es una sociedad sino un régimen fiscal unipersonal. Límite de facturación anual.', features: ['Sin estructura societaria', 'Impuesto fijo mensual', 'Facturación limitada'], complianceLevel: 'simple' },
  ],
  fiscalFields: [
    { id: 'condicionAfip', label: 'Condición ante AFIP', placeholder: '', type: 'select', required: true, options: [{ value: 'responsable_inscripto', label: 'Responsable Inscripto' }, { value: 'monotributista', label: 'Monotributista' }, { value: 'exento', label: 'Exento' }] },
    { id: 'ingresosBrutos', label: 'Nro. Ingresos Brutos (IIBB)', placeholder: 'Ej: 901-234567-8', type: 'text', required: false },
    { id: 'actividadAfip', label: 'Código de Actividad AFIP', placeholder: 'Ej: 479000', type: 'text', required: true },
  ],
};

const CHILE: CountryConfig = {
  code: 'CL', name: 'Chile', flag: '🇨🇱', region: 'latam', currency: 'CLP',
  taxIdLabel: 'RUT', taxIdPlaceholder: '76.123.456-7',
  taxIdHelpText: 'Rol Único Tributario emitido por el SII. Formato: XX.XXX.XXX-X',
  entityTypes: [
    { id: 'spa', name: 'SPA', fullName: 'Sociedad por Acciones', description: 'Sociedad flexible con acciones, puede tener un solo accionista.', tooltip: 'La más recomendada para emprendimientos. Constitución en notaría simplificada.', features: ['Desde 1 accionista', 'Sin capital mínimo', 'Flexible estatutariamente'], complianceLevel: 'simple' },
    { id: 'sa', name: 'SA', fullName: 'Sociedad Anónima', description: 'Sociedad de capital abierta o cerrada con directorio.', tooltip: 'SA Abierta: cotiza en bolsa. SA Cerrada: de 2 a ilimitados accionistas.', features: ['Mínimo 2 accionistas', 'Directorio de 3 miembros', 'Puede ser abierta o cerrada'], complianceLevel: 'complex' },
    { id: 'ltda', name: 'LTDA', fullName: 'Sociedad de Responsabilidad Limitada', description: 'Sociedad de personas con responsabilidad limitada a los aportes.', tooltip: 'Muy popular para PyMEs. Máx. 50 socios. Escritura pública obligatoria.', features: ['Máx. 50 socios', 'Escritura pública', 'Responsabilidad limitada'], complianceLevel: 'moderate' },
    { id: 'eirl', name: 'EIRL', fullName: 'Empresa Individual de Responsabilidad Limitada', description: 'Un único titular con patrimonio separado.', tooltip: 'Solo para personas naturales chilenas o extranjeras con residencia.', features: ['Un titular', 'Patrimonio separado', 'Sin socios'], complianceLevel: 'simple' },
  ],
  fiscalFields: [
    { id: 'giroComercial', label: 'Giro Comercial (SII)', placeholder: 'Ej: Venta al por menor de vestuario', type: 'text', required: true },
    { id: 'comunaRegistro', label: 'Comuna de Registro', placeholder: 'Ej: Santiago Centro', type: 'text', required: true },
    { id: 'inicioActividades', label: 'Fecha Inicio de Actividades', placeholder: '', type: 'date', required: true },
  ],
};

const COLOMBIA: CountryConfig = {
  code: 'CO', name: 'Colombia', flag: '🇨🇴', region: 'latam', currency: 'COP',
  taxIdLabel: 'NIT', taxIdPlaceholder: '900.123.456-1',
  taxIdHelpText: 'Número de Identificación Tributaria emitido por la DIAN.',
  entityTypes: [
    { id: 'sas', name: 'SAS', fullName: 'Sociedad por Acciones Simplificada', description: 'Sociedad flexible con mínimo 1 accionista, constitución por documento privado.', tooltip: 'La forma societaria más usada en Colombia. Puede crearse con documento privado, sin notaría.', features: ['Desde 1 accionista', 'Sin capital mínimo', 'Constitución por doc. privado'], complianceLevel: 'simple' },
    { id: 'sa', name: 'SA', fullName: 'Sociedad Anónima', description: 'Sociedad de capital con acciones y mínimo 5 accionistas.', tooltip: 'Para empresas grandes con múltiples inversionistas. Requiere 5 accionistas mínimo.', features: ['Mínimo 5 accionistas', 'Junta directiva obligatoria', 'Revisor fiscal si supera topes'], complianceLevel: 'complex' },
    { id: 'ltda', name: 'Ltda', fullName: 'Sociedad de Responsabilidad Limitada', description: 'Sociedad de cuotas con responsabilidad limitada.', tooltip: 'Máximo 25 socios. Las cuotas no son libremente cedibles.', features: ['Máx. 25 socios', 'Escritura pública', 'Cuotas no cotizables'], complianceLevel: 'moderate' },
    { id: 'persona_natural', name: 'Persona Natural', fullName: 'Comerciante Persona Natural', description: 'Persona física que ejerce actividad comercial directamente.', tooltip: 'Sin separación de patrimonio. Debe inscribirse en el Registro Mercantil.', features: ['Sin capital mínimo', 'Responsabilidad ilimitada', 'Registro mercantil obligatorio'], complianceLevel: 'simple' },
  ],
  fiscalFields: [
    { id: 'actividadEconomica', label: 'Código Actividad Económica (CIIU)', placeholder: 'Ej: 4711', type: 'text', required: true },
    { id: 'camaraComercio', label: 'Cámara de Comercio de Registro', placeholder: 'Ej: Bogotá, Medellín, Cali...', type: 'text', required: true },
    { id: 'responsabilidadFiscal', label: 'Responsabilidad Fiscal', placeholder: '', type: 'select', required: true, options: [{ value: 'simplificado', label: 'Régimen Simple de Tributación' }, { value: 'ordinario', label: 'Régimen Ordinario' }] },
  ],
};

const MEXICO: CountryConfig = {
  code: 'MX', name: 'México', flag: '🇲🇽', region: 'latam', currency: 'MXN',
  taxIdLabel: 'RFC', taxIdPlaceholder: 'ABC123456XYZ',
  taxIdHelpText: 'Registro Federal de Contribuyentes emitido por el SAT. 12 o 13 caracteres.',
  entityTypes: [
    { id: 'sapi', name: 'SAPI de CV', fullName: 'Sociedad Anónima Promotora de Inversión de Capital Variable', description: 'Sociedad de capital variable orientada a atracción de inversión.', tooltip: 'Ideal para startups que buscan inversión. Permite restricciones a transferencia de acciones.', features: ['Capital variable', 'Apta para inversión VC', 'Protección anti-dilución posible'], complianceLevel: 'complex' },
    { id: 'sa_cv', name: 'SA de CV', fullName: 'Sociedad Anónima de Capital Variable', description: 'La forma corporativa más común en México con capital variable.', tooltip: 'Clásica para empresas medianas y grandes. Mínimo 2 accionistas.', features: ['Mínimo 2 accionistas', 'Capital mínimo: MXN 50.000', 'Accionistas anónimos posible'], minCapital: 'MXN 50.000', complianceLevel: 'complex' },
    { id: 'srl_cv', name: 'S de RL de CV', fullName: 'Sociedad de Responsabilidad Limitada de Capital Variable', description: 'Sociedad con partes sociales y máximo 50 socios.', tooltip: 'Equivalente a la SRL. Muy usada por PyMEs y empresas familiares.', features: ['Máx. 50 socios', 'Capital mínimo: MXN 3.000', 'Partes sociales'], minCapital: 'MXN 3.000', complianceLevel: 'moderate' },
    { id: 'persona_fisica', name: 'Persona Física', fullName: 'Persona Física con Actividad Empresarial', description: 'Persona natural que realiza actividades comerciales.', tooltip: 'Requiere RFC de persona física. Facturas a su nombre. Sin separación patrimonial.', features: ['Sin constitución societaria', 'RFC personal', 'Responsabilidad ilimitada'], complianceLevel: 'simple' },
  ],
  fiscalFields: [
    { id: 'actividadSat', label: 'Actividad Económica (Catálogo SAT)', placeholder: 'Ej: Comercio al por menor', type: 'text', required: true },
    { id: 'regimenFiscal', label: 'Régimen Fiscal SAT', placeholder: '', type: 'select', required: true, options: [{ value: '601', label: '601 – General de Ley Personas Morales' }, { value: '603', label: '603 – Personas Morales con Fines no Lucrativos' }, { value: '612', label: '612 – Personas Físicas con Actividades Empresariales' }, { value: '626', label: '626 – Régimen Simplificado de Confianza' }] },
    { id: 'estadoRegistro', label: 'Estado de Registro', placeholder: 'Ej: Ciudad de México', type: 'text', required: true },
  ],
};

const BRASIL: CountryConfig = {
  code: 'BR', name: 'Brasil', flag: '🇧🇷', region: 'latam', currency: 'BRL',
  taxIdLabel: 'CNPJ', taxIdPlaceholder: '12.345.678/0001-90',
  taxIdHelpText: 'Cadastro Nacional da Pessoa Jurídica de 14 dígitos emitido por la Receita Federal.',
  entityTypes: [
    { id: 'ltda', name: 'LTDA', fullName: 'Sociedade Limitada', description: 'Sociedad de cuotas con responsabilidad limitada. Forma más común.', tooltip: 'La LTDA es la forma societaria más utilizada en Brasil. Muy flexible desde la reforma de 2021.', features: ['Desde 1 socio (Unipessoal)', 'Sin capital mínimo', 'Responsabilidade limitada'], complianceLevel: 'moderate' },
    { id: 'sa', name: 'SA', fullName: 'Sociedade Anônima', description: 'Sociedad de capital con acciones, puede ser abierta o cerrada.', tooltip: 'Para grandes empresas o las que planean cotizar en bolsa (B3). Regulada por CVM.', features: ['SA Aberta: cotiza en bolsa', 'Conselho de Administração', 'Capital mínimo definido por estatuto'], complianceLevel: 'complex' },
    { id: 'mei', name: 'MEI', fullName: 'Microempreendedor Individual', description: 'Registro simplificado para micro-emprendedores individuales.', tooltip: 'Límite de facturación R$ 81.000/año. CNPJ propio. Sin socios. Muy popular en Brasil.', features: ['Facturación máx.: R$ 81.000/año', 'Sin socios', 'CNPJ gratuito'], complianceLevel: 'simple' },
    { id: 'eireli', name: 'EIRELI', fullName: 'Empresa Individual de Responsabilidade Limitada', description: 'Empresa de una sola persona con patrimonio separado.', tooltip: 'Capital mínimo de 100 salarios mínimos. Hoy reemplazada en parte por LTDA Unipessoal.', features: ['Un único titular', 'Capital mínimo: 100 salarios mínimos', 'Patrimonio separado'], complianceLevel: 'moderate' },
  ],
  fiscalFields: [
    { id: 'cnae', label: 'CNAE (Código de Atividade)', placeholder: 'Ej: 4711-3/01', type: 'text', required: true },
    { id: 'regimeTributario', label: 'Regime Tributário', placeholder: '', type: 'select', required: true, options: [{ value: 'simples', label: 'Simples Nacional' }, { value: 'lucro_presumido', label: 'Lucro Presumido' }, { value: 'lucro_real', label: 'Lucro Real' }, { value: 'mei', label: 'MEI' }] },
    { id: 'estadoRegistro', label: 'Estado de Registro (UF)', placeholder: 'Ej: SP, RJ, MG', type: 'text', required: true },
  ],
};

const URUGUAY: CountryConfig = {
  code: 'UY', name: 'Uruguay', flag: '🇺🇾', region: 'latam', currency: 'UYU',
  taxIdLabel: 'RUT', taxIdPlaceholder: '210012345678',
  taxIdHelpText: 'Registro Único Tributario de 12 dígitos emitido por la DGI.',
  entityTypes: [
    { id: 'sas', name: 'SAS', fullName: 'Sociedad por Acciones Simplificada', description: 'Sociedad moderna con constitución digital desde 2022.', tooltip: 'Constitución online sin notario. Ideal para startups y emprendedores digitales.', features: ['Online sin notario', 'Desde 1 accionista', 'Capital mínimo: 1 UI'], complianceLevel: 'simple' },
    { id: 'sa', name: 'SA', fullName: 'Sociedad Anónima', description: 'Sociedad de capital tradicional con acciones.', tooltip: 'Puede ser nominativa o al portador (con limitaciones). Requiere escritura pública.', features: ['Escritura pública', 'Acciones nominativas', 'Directorio posible'], complianceLevel: 'complex' },
    { id: 'srl', name: 'SRL', fullName: 'Sociedad de Responsabilidad Limitada', description: 'Sociedad con cuotas de participación y responsabilidad limitada.', tooltip: 'Máximo 50 socios. Requiere escritura pública e inscripción en el RNC.', features: ['Máx. 50 socios', 'Escritura pública', 'Cuotas intransferibles sin unanimidad'], complianceLevel: 'moderate' },
    { id: 'unipersonal', name: 'Unipersonal', fullName: 'Empresa Unipersonal', description: 'Persona física que ejerce comercio a su nombre.', tooltip: 'Sin separación patrimonial. Inscripción en el Registro Nacional de Comercio.', features: ['Sin capital mínimo', 'Responsabilidad ilimitada', 'BPS e impuestos directos'], complianceLevel: 'simple' },
  ],
  fiscalFields: [
    { id: 'actividadEconomica', label: 'Actividad Económica Principal', placeholder: 'Ej: Servicios informáticos', type: 'text', required: true },
    { id: 'departamento', label: 'Departamento de Registro', placeholder: 'Ej: Montevideo', type: 'text', required: true },
  ],
};

const BOLIVIA: CountryConfig = {
  code: 'BO', name: 'Bolivia', flag: '🇧🇴', region: 'latam', currency: 'BOB',
  taxIdLabel: 'NIT', taxIdPlaceholder: '1023456789',
  taxIdHelpText: 'Número de Identificación Tributaria emitido por el SIN.',
  entityTypes: [
    { id: 'srl', name: 'SRL', fullName: 'Sociedad de Responsabilidad Limitada', description: 'La forma societaria más popular para PyMEs bolivianas.', tooltip: 'Máximo 25 socios. Gestión por gerente. Requiere FUNDEMPRESA.', features: ['Máx. 25 socios', 'Capital mínimo: Bs 1.000', 'Registro en FUNDEMPRESA'], minCapital: 'Bs 1.000', complianceLevel: 'moderate' },
    { id: 'sa', name: 'SA', fullName: 'Sociedad Anónima', description: 'Sociedad de capital con directorio y acciones transferibles.', tooltip: 'Para empresas medianas/grandes. Supervisada por ASFI si es del sector financiero.', features: ['Directorio obligatorio', 'Acciones nominativas', 'Capital mínimo Bs 10.000'], minCapital: 'Bs 10.000', complianceLevel: 'complex' },
    { id: 'unipersonal', name: 'Unipersonal', fullName: 'Empresa Unipersonal', description: 'Persona natural que ejerce actividad comercial.', tooltip: 'Inscripción en FUNDEMPRESA obligatoria si supera ingresos establecidos.', features: ['Sin socios', 'Responsabilidad ilimitada', 'FUNDEMPRESA'], complianceLevel: 'simple' },
  ],
  fiscalFields: [
    { id: 'actividadEconomica', label: 'Actividad Económica', placeholder: 'Ej: Comercio textil', type: 'text', required: true },
    { id: 'departamento', label: 'Departamento', placeholder: 'Ej: La Paz, Santa Cruz', type: 'text', required: true },
    { id: 'modalidad', label: 'Modalidad Tributaria', placeholder: '', type: 'select', required: true, options: [{ value: 'rg', label: 'Régimen General' }, { value: 'rus', label: 'RUS – Régimen Unificado Simplificado' }, { value: 'sit', label: 'SIT – Sistema Tributario Integrado' }] },
  ],
};

const ECUADOR: CountryConfig = {
  code: 'EC', name: 'Ecuador', flag: '🇪🇨', region: 'latam', currency: 'USD',
  taxIdLabel: 'RUC', taxIdPlaceholder: '1790012345001',
  taxIdHelpText: 'Registro Único de Contribuyentes de 13 dígitos emitido por el SRI.',
  entityTypes: [
    { id: 'sa', name: 'SA', fullName: 'Compañía Anónima', description: 'Sociedad de capital con acciones y mínimo 2 accionistas.', tooltip: 'Regulada por la Ley de Compañías y supervisada por la Superintendencia de Compañías.', features: ['Mínimo 2 accionistas', 'Capital mínimo: USD 800', 'Acciones nominativas'], minCapital: 'USD 800', complianceLevel: 'complex' },
    { id: 'cia_ltda', name: 'Cía. Ltda.', fullName: 'Compañía de Responsabilidad Limitada', description: 'Sociedad con participaciones y responsabilidad limitada.', tooltip: 'De 2 a 15 socios. Capital mínimo USD 400. Muy popular para PyMEs.', features: ['2 a 15 socios', 'Capital mínimo: USD 400', 'Participaciones'], minCapital: 'USD 400', complianceLevel: 'moderate' },
    { id: 'persona_natural', name: 'Persona Natural', fullName: 'Persona Natural Obligada a Llevar Contabilidad', description: 'Persona física con actividad económica y contabilidad formal.', tooltip: 'Obligada cuando supera USD 300.000 en ingresos o USD 240.000 en costos.', features: ['Contabilidad obligatoria al superar umbrales', 'Sin socios', 'RUC personal'], complianceLevel: 'simple' },
  ],
  fiscalFields: [
    { id: 'actividadEconomica', label: 'Actividad Económica (CIIU)', placeholder: 'Ej: G4711 Comercio al por menor', type: 'text', required: true },
    { id: 'regimen', label: 'Régimen Tributario', placeholder: '', type: 'select', required: true, options: [{ value: 'general', label: 'Régimen General' }, { value: 'rimpe_negocios', label: 'RIMPE – Negocios Populares' }, { value: 'rimpe_emprendedor', label: 'RIMPE – Emprendedor' }] },
  ],
};

const VENEZUELA: CountryConfig = {
  code: 'VE', name: 'Venezuela', flag: '🇻🇪', region: 'latam', currency: 'VES',
  taxIdLabel: 'RIF', taxIdPlaceholder: 'J-12345678-9',
  taxIdHelpText: 'Registro de Información Fiscal emitido por el SENIAT.',
  entityTypes: [
    { id: 'ca', name: 'C.A.', fullName: 'Compañía Anónima', description: 'Sociedad de capital con accionistas y acciones transferibles.', tooltip: 'La forma corporativa más común en Venezuela. Inscripción en el Registro Mercantil.', features: ['Mínimo 2 accionistas', 'Acciones nominativas', 'Registro Mercantil'], complianceLevel: 'complex' },
    { id: 'srl', name: 'SRL', fullName: 'Sociedad de Responsabilidad Limitada', description: 'Sociedad de cuotas con responsabilidad limitada.', tooltip: 'Máximo 20 socios. Capital mínimo Bs.S 20.000.', features: ['Máx. 20 socios', 'Capital mínimo', 'Cuotas no cotizables'], complianceLevel: 'moderate' },
    { id: 'firma_personal', name: 'Firma Personal', fullName: 'Firma Personal', description: 'Comerciante individual sin separación patrimonial.', tooltip: 'Registro en el Registro Mercantil local. Sin socios.', features: ['Sin socios', 'Responsabilidad ilimitada', 'Registro Mercantil'], complianceLevel: 'simple' },
  ],
  fiscalFields: [
    { id: 'actividadEconomica', label: 'Actividad Económica', placeholder: 'Ej: Comercio al detal', type: 'text', required: true },
    { id: 'estadoRegistro', label: 'Estado de Registro', placeholder: 'Ej: Caracas, Zulia', type: 'text', required: true },
  ],
};

const COSTA_RICA: CountryConfig = {
  code: 'CR', name: 'Costa Rica', flag: '🇨🇷', region: 'latam', currency: 'CRC',
  taxIdLabel: 'Cédula Jurídica', taxIdPlaceholder: '3-101-123456',
  taxIdHelpText: 'Cédula Jurídica emitida por el Registro Nacional de Costa Rica.',
  entityTypes: [
    { id: 'sa', name: 'SA', fullName: 'Sociedad Anónima', description: 'Forma societaria más común con junta directiva y acciones.', tooltip: 'Requiere 2 socios mínimo. Inscripción en el Registro Nacional.', features: ['Mínimo 2 socios', 'Junta directiva', 'Acciones nominativas'], complianceLevel: 'moderate' },
    { id: 'srl', name: 'SRL', fullName: 'Sociedad de Responsabilidad Limitada', description: 'Sociedad de cuotas con responsabilidad limitada.', tooltip: 'Máximo 25 socios. Muy usada por empresas familiares y PyMEs.', features: ['Máx. 25 socios', 'Cuotas no negociables libremente', 'Gerente obligatorio'], complianceLevel: 'moderate' },
    { id: 'persona_fisica', name: 'Persona Física', fullName: 'Empresa Individual (Persona Física)', description: 'Persona natural que ejerce actividad comercial.', tooltip: 'Sin separación patrimonial. Inscripción en el Ministerio de Hacienda.', features: ['Sin socios', 'Responsabilidad ilimitada', 'Tributos personales'], complianceLevel: 'simple' },
  ],
  fiscalFields: [
    { id: 'actividadEconomica', label: 'Actividad Económica (Clasificador)', placeholder: 'Ej: Comercio al por menor', type: 'text', required: true },
    { id: 'provincia', label: 'Provincia de Registro', placeholder: 'Ej: San José', type: 'text', required: true },
  ],
};

const PANAMA: CountryConfig = {
  code: 'PA', name: 'Panamá', flag: '🇵🇦', region: 'latam', currency: 'PAB',
  taxIdLabel: 'RUC', taxIdPlaceholder: '155-123-45678',
  taxIdHelpText: 'Registro Único del Contribuyente emitido por la DGI.',
  entityTypes: [
    { id: 'sa', name: 'SA', fullName: 'Sociedad Anónima', description: 'La forma societaria más utilizada en Panamá, con gran flexibilidad.', tooltip: 'Sin capital mínimo. Muy usada para negocios internacionales y holdings.', features: ['Sin capital mínimo', 'Acciones al portador (con restricciones)', 'Muy flexible'], complianceLevel: 'moderate' },
    { id: 'srl', name: 'SRL', fullName: 'Sociedad de Responsabilidad Limitada', description: 'Sociedad con cuotas y responsabilidad limitada.', tooltip: 'Alternativa a la SA para negocios locales más simples.', features: ['Cuotas de participación', 'Responsabilidad limitada', 'Hasta 20 socios'], complianceLevel: 'moderate' },
    { id: 'fondation', name: 'FIP', fullName: 'Fundación de Interés Privado', description: 'Estructura patrimonial para protección y planificación de activos.', tooltip: 'No es una sociedad. Se usa para protección de patrimonio y herencias.', features: ['No tiene socios', 'Gestión patrimonial', 'Beneficiarios designados'], complianceLevel: 'complex' },
  ],
  fiscalFields: [
    { id: 'actividadEconomica', label: 'Actividad Económica', placeholder: 'Ej: Importación y exportación', type: 'text', required: true },
    { id: 'registroMercantil', label: 'Tomo y Folio Registro Mercantil', placeholder: 'Ej: Tomo 123, Folio 456', type: 'text', required: false },
  ],
};

const GUATEMALA: CountryConfig = {
  code: 'GT', name: 'Guatemala', flag: '🇬🇹', region: 'latam', currency: 'GTQ',
  taxIdLabel: 'NIT', taxIdPlaceholder: '1234567-8',
  taxIdHelpText: 'Número de Identificación Tributaria emitido por la SAT.',
  entityTypes: [
    { id: 'sa', name: 'SA', fullName: 'Sociedad Anónima', description: 'Sociedad de capital con acciones y junta de accionistas.', tooltip: 'La forma más popular para empresas en Guatemala. Mínimo 2 socios.', features: ['Mínimo 2 socios', 'Acciones nominativas', 'Directores obligatorios'], complianceLevel: 'moderate' },
    { id: 'srl', name: 'SRL', fullName: 'Sociedad de Responsabilidad Limitada', description: 'Sociedad con cuotas y responsabilidad limitada al aporte.', tooltip: 'Para pequeñas empresas con pocos socios. Gerente administrador.', features: ['Cuotas de participación', 'Gerente administrador', 'Sin acciones'], complianceLevel: 'moderate' },
    { id: 'empresa_individual', name: 'E. Individual', fullName: 'Empresa Individual', description: 'Comerciante individual sin personalidad jurídica separada.', tooltip: 'Sin separación de patrimonio. Registro en el Registro Mercantil.', features: ['Sin socios', 'Responsabilidad ilimitada', 'NIT personal'], complianceLevel: 'simple' },
  ],
  fiscalFields: [
    { id: 'actividadEconomica', label: 'Actividad Económica', placeholder: 'Ej: Comercio al por menor', type: 'text', required: true },
    { id: 'departamento', label: 'Departamento de Registro', placeholder: 'Ej: Guatemala, Quetzaltenango', type: 'text', required: true },
  ],
};

const DOMINICAN_REPUBLIC: CountryConfig = {
  code: 'DO', name: 'Rep. Dominicana', flag: '🇩🇴', region: 'latam', currency: 'DOP',
  taxIdLabel: 'RNC / Cédula', taxIdPlaceholder: '1-01-12345-6',
  taxIdHelpText: 'Registro Nacional del Contribuyente o Cédula, emitido por la DGII.',
  entityTypes: [
    { id: 'sa', name: 'SA', fullName: 'Sociedad Anónima', description: 'Sociedad de capital con acciones y mínimo 2 socios.', tooltip: 'Regulada por la Ley General de Sociedades Comerciales 479-08.', features: ['Mínimo 2 socios', 'Acciones nominativas', 'Asamblea general'], complianceLevel: 'complex' },
    { id: 'srl', name: 'SRL', fullName: 'Sociedad de Responsabilidad Limitada', description: 'Sociedad con cuotas de participación.', tooltip: 'De 2 a 50 socios. Capital mínimo RD$ 100.000.', features: ['2 a 50 socios', 'Capital mínimo: RD$ 100.000', 'Cuotas'], minCapital: 'RD$ 100.000', complianceLevel: 'moderate' },
    { id: 'eirl', name: 'EIRL', fullName: 'Empresa Individual de Responsabilidad Limitada', description: 'Empresa de un solo titular con patrimonio separado.', tooltip: 'Permite operar sin socios con responsabilidad limitada.', features: ['Un titular', 'Patrimonio separado', 'Capital mínimo: RD$ 30.000'], minCapital: 'RD$ 30.000', complianceLevel: 'simple' },
  ],
  fiscalFields: [
    { id: 'actividadEconomica', label: 'Actividad Económica', placeholder: 'Ej: Servicios de tecnología', type: 'text', required: true },
    { id: 'provincia', label: 'Provincia de Registro', placeholder: 'Ej: Santo Domingo', type: 'text', required: true },
  ],
};

// ──────────────────────────────────────────────
// NORTH AMERICA
// ──────────────────────────────────────────────
const USA: CountryConfig = {
  code: 'US', name: 'Estados Unidos', flag: '🇺🇸', region: 'northamerica', currency: 'USD',
  taxIdLabel: 'EIN', taxIdPlaceholder: '12-3456789',
  taxIdHelpText: 'Employer Identification Number de 9 dígitos emitido por el IRS. Formato: XX-XXXXXXX.',
  entityTypes: [
    { id: 'llc', name: 'LLC', fullName: 'Limited Liability Company', description: 'Estructura flexible con responsabilidad limitada y tributación pass-through.', tooltip: 'La más popular para startups y small business. Muy flexible en gestión y tributación.', features: ['Pass-through taxation', 'Sin junta de accionistas requerida', 'Flexible operationally'], complianceLevel: 'simple' },
    { id: 'c_corp', name: 'C-Corp', fullName: 'C Corporation', description: 'Corporación estándar, apta para inversión institucional y múltiples clases de acciones.', tooltip: 'Ideal para startups con inversores VC. Puede tener múltiples clases de acciones. Doble tributación.', features: ['Múltiples clases de acciones', 'Apta para VC e IPO', 'Doble tributación'], complianceLevel: 'complex' },
    { id: 's_corp', name: 'S-Corp', fullName: 'S Corporation', description: 'Corporación con tributación pass-through y limitaciones de accionistas.', tooltip: 'Máximo 100 accionistas, todos ciudadanos/residentes americanos. Tributación pass-through.', features: ['Máx. 100 accionistas', 'Solo residentes/ciudadanos US', 'Pass-through taxation'], complianceLevel: 'complex' },
    { id: 'sole_prop', name: 'Sole Proprietorship', fullName: 'Sole Proprietorship', description: 'Empresa individual sin estructura legal separada.', tooltip: 'La forma más simple. Sin registro formal en la mayoría de estados. Sin separación patrimonial.', features: ['Sin registro formal', 'Responsabilidad ilimitada', 'Sin capital mínimo'], complianceLevel: 'simple' },
    { id: 'partnership', name: 'Partnership', fullName: 'General Partnership', description: 'Sociedad de dos o más personas con responsabilidad compartida.', tooltip: 'Cada socio es personalmente responsable. No recomendado sin acuerdo formal de socios.', features: ['Mínimo 2 socios', 'Responsabilidad conjunta', 'Pass-through taxation'], complianceLevel: 'moderate' },
  ],
  fiscalFields: [
    { id: 'stateOfIncorporation', label: 'State of Incorporation / Formation', placeholder: 'Ej: Delaware, Wyoming, California', type: 'text', required: true },
    { id: 'naicsCode', label: 'NAICS Industry Code', placeholder: 'Ej: 522110', type: 'text', required: false, helpText: 'North American Industry Classification System code.' },
    { id: 'taxClassification', label: 'Federal Tax Classification', placeholder: '', type: 'select', required: true, options: [{ value: 'sole_prop', label: 'Sole Proprietor / Single-member LLC' }, { value: 'partnership', label: 'Partnership / Multi-member LLC' }, { value: 'c_corp', label: 'C Corporation' }, { value: 's_corp', label: 'S Corporation' }] },
  ],
};

const CANADA: CountryConfig = {
  code: 'CA', name: 'Canadá', flag: '🇨🇦', region: 'northamerica', currency: 'CAD',
  taxIdLabel: 'BN (Business Number)', taxIdPlaceholder: '123456789 RT 0001',
  taxIdHelpText: 'Business Number de 9 dígitos emitido por la CRA. Se agrega el programa RT para GST/HST.',
  entityTypes: [
    { id: 'corporation', name: 'Corporation', fullName: 'Federal/Provincial Corporation', description: 'Corporación con responsabilidad limitada, puede ser federal o provincial.', tooltip: 'Federal Corp (CBCA): opera en todo Canadá. Provincial: solo en la provincia de registro.', features: ['Federal o Provincial', 'Directores residente-canadiense', 'NUANS name search requerido'], complianceLevel: 'moderate' },
    { id: 'sole_prop', name: 'Sole Proprietorship', fullName: 'Sole Proprietorship', description: 'Negocio individual sin separación de personalidad jurídica.', tooltip: 'Registro a nivel provincial. Sin separación de responsabilidad. Simple y económico.', features: ['Sin separación de responsabilidad', 'Registro provincial', 'Income personal tax'], complianceLevel: 'simple' },
    { id: 'partnership', name: 'Partnership', fullName: 'General / Limited Partnership', description: 'Sociedad de dos o más personas para negocio común.', tooltip: 'General Partnership: todos son responsables. Limited Partnership: socios limitados y generales.', features: ['Mínimo 2 socios', 'Acuerdo de partnership recomendado', 'Pass-through taxation'], complianceLevel: 'moderate' },
  ],
  fiscalFields: [
    { id: 'province', label: 'Province of Registration', placeholder: 'Ej: Ontario, British Columbia, Québec', type: 'text', required: true },
    { id: 'gstHst', label: 'GST/HST Registration Number', placeholder: 'Ej: 123456789 RT 0001', type: 'text', required: false, helpText: 'Required if annual taxable supplies exceed CAD $30,000.' },
    { id: 'naicsCode', label: 'NAICS Industry Code', placeholder: 'Ej: 541510', type: 'text', required: false },
  ],
};

// ──────────────────────────────────────────────
// EUROPE
// ──────────────────────────────────────────────
const SPAIN: CountryConfig = {
  code: 'ES', name: 'España', flag: '🇪🇸', region: 'europe', currency: 'EUR',
  taxIdLabel: 'CIF / NIF', taxIdPlaceholder: 'B-12345678',
  taxIdHelpText: 'CIF para personas jurídicas (B-XXXXXXXX). NIF para autónomos (DNI+letra).',
  entityTypes: [
    { id: 'autonomo', name: 'Autónomo', fullName: 'Trabajador Autónomo', description: 'Persona física que realiza actividad económica por cuenta propia.', tooltip: 'Alta en RETA obligatoria. Sin separación patrimonial. El más simple de todos.', features: ['Alta en RETA', 'Sin capital mínimo', 'Responsabilidad ilimitada'], complianceLevel: 'simple' },
    { id: 'sl', name: 'SL', fullName: 'Sociedad Limitada', description: 'La forma societaria más popular en España. Capital mínimo 1€ (desde 2023).', tooltip: 'Desde 2023, capital mínimo 1€. Responsabilidad limitada al capital aportado. Escritura notarial.', features: ['Capital mínimo: 1€ (desde 2023)', 'Responsabilidad limitada', 'Escritura notarial obligatoria'], minCapital: '1 €', complianceLevel: 'moderate' },
    { id: 'sa', name: 'SA', fullName: 'Sociedad Anónima', description: 'Sociedad de capital con acciones, apta para grandes empresas.', tooltip: 'Capital mínimo 60.000€. Para empresas que buscan cotizar o captar inversión institucional.', features: ['Capital mínimo: 60.000 €', 'Acciones nominativas o al portador', 'Puede cotizar en bolsa'], minCapital: '60.000 €', complianceLevel: 'complex' },
    { id: 'cooperativa', name: 'Cooperativa', fullName: 'Sociedad Cooperativa', description: 'Sociedad democrática de socios trabajadores o de consumo.', tooltip: 'Puede ser de trabajo asociado, consumidores, servicios, etc. Ley 27/1999.', features: ['Gestión democrática', 'Socios trabajadores', 'Beneficios fiscales específicos'], complianceLevel: 'complex' },
  ],
  fiscalFields: [
    { id: 'epigrafIAE', label: 'Epígrafe IAE (Actividad)', placeholder: 'Ej: 661 – Comercio al por menor', type: 'text', required: true },
    { id: 'ccaa', label: 'Comunidad Autónoma de Registro', placeholder: 'Ej: Madrid, Cataluña, Valencia', type: 'text', required: true },
    { id: 'regimenIva', label: 'Régimen IVA', placeholder: '', type: 'select', required: true, options: [{ value: 'general', label: 'Régimen General' }, { value: 'simplificado', label: 'Régimen Simplificado' }, { value: 'recargo', label: 'Recargo de Equivalencia' }, { value: 'exento', label: 'Actividad Exenta' }] },
  ],
};

const GERMANY: CountryConfig = {
  code: 'DE', name: 'Alemania', flag: '🇩🇪', region: 'europe', currency: 'EUR',
  taxIdLabel: 'Steuernummer / USt-IdNr.', taxIdPlaceholder: 'DE 123456789',
  taxIdHelpText: 'USt-IdNr. (VAT ID) para comercio intracomunitario. Steuernummer del Finanzamt para impuestos locales.',
  entityTypes: [
    { id: 'gmbh', name: 'GmbH', fullName: 'Gesellschaft mit beschränkter Haftung', description: 'La sociedad limitada alemana. La forma societaria más popular.', tooltip: 'Capital mínimo €25.000 (€12.500 al constituir). Notario obligatorio. Registro en el Handelsregister.', features: ['Capital mínimo: €25.000', 'Geschäftsführer (gerente) obligatorio', 'Handelsregister Eintrag'], minCapital: '€ 25.000', complianceLevel: 'moderate' },
    { id: 'ug', name: 'UG', fullName: 'Unternehmergesellschaft (haftungsbeschränkt)', description: 'Mini-GmbH con capital mínimo de 1€. Debe acumular reservas para llegar a GmbH.', tooltip: 'UG es una GmbH con capital reducido. Obligación de reservar el 25% del beneficio neto anual.', features: ['Capital mínimo: 1 €', 'Debe acumular 25% de beneficio anual', 'Se convierte en GmbH al llegar a €25.000'], minCapital: '1 €', complianceLevel: 'moderate' },
    { id: 'ag', name: 'AG', fullName: 'Aktiengesellschaft', description: 'Sociedad anónima alemana con acciones y supervisión del Aufsichtsrat.', tooltip: 'Capital mínimo €50.000. Para grandes empresas o las que planean cotizar en bolsa (DAX, MDAX...).', features: ['Capital mínimo: €50.000', 'Vorstand + Aufsichtsrat', 'Puede cotizar en bolsa'], minCapital: '€ 50.000', complianceLevel: 'complex' },
    { id: 'einzelunternehmen', name: 'Einzelunternehmen', fullName: 'Einzelunternehmen (Freiberufler / Gewerbetreibender)', description: 'Empresa individual. Puede ser Freiberufler (liberal) o Gewerbetreibender (comerciante).', tooltip: 'Sin capital mínimo. Sin separación de responsabilidad. Registro en Finanzamt y Gewerbeamt.', features: ['Sin capital mínimo', 'Responsabilidad ilimitada', 'Gewerbeamt + Finanzamt'], complianceLevel: 'simple' },
  ],
  fiscalFields: [
    { id: 'wirtschaftszweig', label: 'Wirtschaftszweig (Sector de actividad)', placeholder: 'Ej: Einzelhandel, IT-Dienstleistungen', type: 'text', required: true },
    { id: 'bundesland', label: 'Bundesland (Estado Federado)', placeholder: 'Ej: Bayern, Berlin, NRW', type: 'text', required: true },
    { id: 'ustIdNr', label: 'USt-IdNr. (VAT ID)', placeholder: 'DE 123456789', type: 'text', required: false, helpText: 'Necesaria si supera €22.000 facturación anual.' },
  ],
};

const FRANCE: CountryConfig = {
  code: 'FR', name: 'Francia', flag: '🇫🇷', region: 'europe', currency: 'EUR',
  taxIdLabel: 'SIREN / SIRET', taxIdPlaceholder: '123 456 789 00012',
  taxIdHelpText: 'SIREN: 9 dígitos (empresa). SIRET: 14 dígitos (establecimiento). Emitido por el INSEE.',
  entityTypes: [
    { id: 'sas', name: 'SAS', fullName: 'Société par Actions Simplifiée', description: 'La forma societaria más flexible y popular para startups en Francia.', tooltip: 'Sin capital mínimo, gran libertad estatutaria. Muy usada por startups y scale-ups.', features: ['Sin capital mínimo', 'Gran libertad estatutaria', 'President obligatorio'], complianceLevel: 'moderate' },
    { id: 'sarl', name: 'SARL', fullName: 'Société à Responsabilité Limitée', description: 'Equivalente a la SRL. Estructura más regulada que la SAS.', tooltip: 'Máximo 100 socios. Gérant obligatorio. Muy popular para negocios familiares.', features: ['Máx. 100 socios', 'Gérant obligatorio', 'Estatutos tipo disponibles'], complianceLevel: 'moderate' },
    { id: 'sa', name: 'SA', fullName: 'Société Anonyme', description: 'Sociedad anónima con capital mínimo de €37.000.', tooltip: 'Para grandes empresas. Capital mínimo €37.000. Conseil d\'administration o Directoire.', features: ['Capital mínimo: €37.000', 'Mínimo 2 accionistas (7 si cotiza)', 'Puede cotizar en bolsa'], minCapital: '€ 37.000', complianceLevel: 'complex' },
    { id: 'micro_entreprise', name: 'Micro-entreprise', fullName: 'Micro-entreprise (Auto-entrepreneur)', description: 'Régimen simplificado para pequeños emprendedores individuales.', tooltip: 'Límite de facturación €77.700 (servicios) o €188.700 (venta). Sin TVA si es micro.', features: ['Límite de facturación anual', 'Sin contabilidad compleja', 'Cotizaciones sobre ingresos reales'], complianceLevel: 'simple' },
  ],
  fiscalFields: [
    { id: 'codeNaf', label: 'Code NAF / APE (Activité)', placeholder: 'Ej: 62.01Z – Programmation informatique', type: 'text', required: true },
    { id: 'departement', label: 'Département de domiciliation', placeholder: 'Ej: 75 Paris, 69 Lyon', type: 'text', required: true },
    { id: 'regimeTva', label: 'Régime TVA', placeholder: '', type: 'select', required: true, options: [{ value: 'reel_normal', label: 'Régime Réel Normal' }, { value: 'reel_simplifie', label: 'Régime Réel Simplifié' }, { value: 'franchise', label: 'Franchise en Base (sans TVA)' }] },
  ],
};

const ITALY: CountryConfig = {
  code: 'IT', name: 'Italia', flag: '🇮🇹', region: 'europe', currency: 'EUR',
  taxIdLabel: 'Partita IVA / CF', taxIdPlaceholder: 'IT12345678901',
  taxIdHelpText: 'Partita IVA (11 dígitos) para actividades económicas. Codice Fiscale para personas físicas.',
  entityTypes: [
    { id: 'srl', name: 'SRL', fullName: 'Società a Responsabilità Limitata', description: 'La forma societaria más usada en Italia para PyMEs.', tooltip: 'Capital mínimo €10.000 (€1 para SRL Semplificata bajo 35 años). Atto notarile obligatorio.', features: ['Capital mínimo: €10.000 (o €1 SRL Semplificata)', 'Atto notarile', 'Consiglio di Amministrazione posible'], minCapital: '€ 10.000', complianceLevel: 'moderate' },
    { id: 'spa', name: 'SpA', fullName: 'Società per Azioni', description: 'Sociedad anónima italiana para grandes empresas.', tooltip: 'Capital mínimo €50.000. Obligatoria para bancos, aseguradoras y empresas cotizadas.', features: ['Capital mínimo: €50.000', 'Organi societari complejos', 'Puede cotizar en Borsa Italiana'], minCapital: '€ 50.000', complianceLevel: 'complex' },
    { id: 'ditta_individuale', name: 'Ditta Individuale', fullName: 'Ditta Individuale / Impresa Individuale', description: 'Empresa individual sin separación de responsabilidad.', tooltip: 'Sin capital mínimo. Iscrizione al Registro Imprese e INPS obligatoria.', features: ['Sin capital mínimo', 'Responsabilità illimitata', 'Registro Imprese + INPS'], complianceLevel: 'simple' },
  ],
  fiscalFields: [
    { id: 'codiceateco', label: 'Codice ATECO (Attività)', placeholder: 'Ej: 62.01.00 – Produzione di software', type: 'text', required: true },
    { id: 'regioneRegistro', label: 'Regione di Registrazione', placeholder: 'Ej: Lombardia, Lazio, Veneto', type: 'text', required: true },
    { id: 'regimeContabile', label: 'Regime Contabile', placeholder: '', type: 'select', required: true, options: [{ value: 'forfettario', label: 'Regime Forfettario (< €85.000)' }, { value: 'ordinario', label: 'Contabilità Ordinaria' }, { value: 'semplificata', label: 'Contabilità Semplificata' }] },
  ],
};

const PORTUGAL: CountryConfig = {
  code: 'PT', name: 'Portugal', flag: '🇵🇹', region: 'europe', currency: 'EUR',
  taxIdLabel: 'NIF / NIPC', taxIdPlaceholder: '501234567',
  taxIdHelpText: 'NIF (Número de Identificação Fiscal) personal. NIPC para personas jurídicas. 9 dígitos.',
  entityTypes: [
    { id: 'lda', name: 'Lda.', fullName: 'Sociedade por Quotas (Limitada)', description: 'La forma societaria más utilizada en Portugal.', tooltip: 'Capital mínimo €1. Máximo 50 sócios. Pode ter gerente único (Unipessoal Lda.).', features: ['Capital mínimo: €1', 'Máx. 50 sócios', 'Gerente obligatório'], minCapital: '€ 1', complianceLevel: 'moderate' },
    { id: 'sa', name: 'SA', fullName: 'Sociedade Anónima', description: 'Sociedad anónima para grandes empresas y atracción de capital.', tooltip: 'Capital mínimo €50.000. Mínimo 5 acionistas (o 1 si es SA unipessoal de €1M+).', features: ['Capital mínimo: €50.000', 'Conselho de Administração', 'Pode cotizar em bolsa'], minCapital: '€ 50.000', complianceLevel: 'complex' },
    { id: 'eni', name: 'ENI', fullName: 'Empresário em Nome Individual', description: 'Empresario individual sin separación de responsabilidad.', tooltip: 'Sin capital mínimo. Matrícula na Conservatória do Registo Comercial obligatoria.', features: ['Sin capital mínimo', 'Responsabilidade ilimitada', 'Registo Comercial'], complianceLevel: 'simple' },
  ],
  fiscalFields: [
    { id: 'cae', label: 'CAE (Código de Atividade Económica)', placeholder: 'Ej: 62010 – Programação Informática', type: 'text', required: true },
    { id: 'distritoRegistro', label: 'Distrito de Registo', placeholder: 'Ej: Lisboa, Porto, Braga', type: 'text', required: true },
    { id: 'regimeIva', label: 'Regime de IVA', placeholder: '', type: 'select', required: true, options: [{ value: 'normal', label: 'Regime Normal' }, { value: 'isencao', label: 'Isenção (artigo 53.º)' }, { value: 'pequenos_retalhistas', label: 'Pequenos Retalhistas' }] },
  ],
};

const UK: CountryConfig = {
  code: 'GB', name: 'Reino Unido', flag: '🇬🇧', region: 'europe', currency: 'GBP',
  taxIdLabel: 'UTR / Company Number', taxIdPlaceholder: '12345678',
  taxIdHelpText: 'Company Number de 8 dígitos (Companies House). UTR: 10 dígitos para tax personal.',
  entityTypes: [
    { id: 'ltd', name: 'Ltd', fullName: 'Private Limited Company (Ltd)', description: 'La forma corporativa más popular en el Reino Unido.', tooltip: 'Registro en Companies House online en minutos. Capital mínimo £1. Sin socios mínimos obligatorios.', features: ['Capital mínimo: £1', 'Registro online Companies House', 'Director obligatorio'], minCapital: '£ 1', complianceLevel: 'moderate' },
    { id: 'plc', name: 'PLC', fullName: 'Public Limited Company (PLC)', description: 'Sociedad anónima que puede cotizar en bolsa.', tooltip: 'Capital mínimo £50.000 (25% desembolsado). Para empresas que planean cotizar en LSE.', features: ['Capital mínimo: £50.000', 'Puede cotizar en bolsa', 'Al menos 2 directores'], minCapital: '£ 50.000', complianceLevel: 'complex' },
    { id: 'sole_trader', name: 'Sole Trader', fullName: 'Sole Trader (Self-Employed)', description: 'Negocio individual. La forma más simple y más común.', tooltip: 'Registro en HMRC obligatorio. Sin separación de responsabilidad. Self Assessment tax return anual.', features: ['Registro HMRC', 'Self Assessment anual', 'Sin separación patrimonial'], complianceLevel: 'simple' },
    { id: 'llp', name: 'LLP', fullName: 'Limited Liability Partnership', description: 'Sociedad de socios con responsabilidad limitada. Popular en servicios profesionales.', tooltip: 'Muy usado por firmas legales, contables y de consultoría. Mínimo 2 socios designados.', features: ['Mínimo 2 designated members', 'Responsabilidad limitada', 'Pass-through taxation'], complianceLevel: 'moderate' },
  ],
  fiscalFields: [
    { id: 'sicCode', label: 'SIC Code (Industry)', placeholder: 'Ej: 62012 – Business and domestic software development', type: 'text', required: true },
    { id: 'vatNumber', label: 'VAT Registration Number', placeholder: 'GB 123456789', type: 'text', required: false, helpText: 'Required if taxable turnover exceeds £85,000/year.' },
    { id: 'registeredOffice', label: 'Registered Office Address', placeholder: 'London, Manchester, Edinburgh...', type: 'text', required: true },
  ],
};

const NETHERLANDS: CountryConfig = {
  code: 'NL', name: 'Países Bajos', flag: '🇳🇱', region: 'europe', currency: 'EUR',
  taxIdLabel: 'KVK-nummer / BTW-nummer', taxIdPlaceholder: '12345678',
  taxIdHelpText: 'KVK-nummer (8 dígitos) del Kamer van Koophandel. BTW-nummer para IVA.',
  entityTypes: [
    { id: 'bv', name: 'BV', fullName: 'Besloten Vennootschap', description: 'Equivalente a la SRL. La forma societaria más usada en Países Bajos.', tooltip: 'Capital mínimo €0,01. Registro en el KVK obligatorio. Notario para el acta de constitución.', features: ['Capital mínimo: €0,01', 'Registro KVK', 'Notaris obligatorio'], minCapital: '€ 0,01', complianceLevel: 'moderate' },
    { id: 'nv', name: 'NV', fullName: 'Naamloze Vennootschap', description: 'Sociedad anónima holandesa para grandes empresas.', tooltip: 'Capital mínimo €45.000. Para empresas que planean cotizar en Euronext Amsterdam.', features: ['Capital mínimo: €45.000', 'Apta para cotización bursátil', 'Supervisión AFM si cotiza'], minCapital: '€ 45.000', complianceLevel: 'complex' },
    { id: 'eenmanszaak', name: 'Eenmanszaak', fullName: 'Eenmanszaak (ZZP/Freelancer)', description: 'Empresa individual. Muy popular entre freelancers (ZZP-ers).', tooltip: 'Sin capital mínimo. Registro KVK requerido. El más usado por autónomos en NL.', features: ['Sin capital mínimo', 'Registro KVK simple', 'BTW-nummer disponible'], complianceLevel: 'simple' },
  ],
  fiscalFields: [
    { id: 'sbiCode', label: 'SBI-code (Standaard Bedrijfsindeling)', placeholder: 'Ej: 6201 – Ontwikkelen van software', type: 'text', required: true },
    { id: 'gemeente', label: 'Gemeente (Municipio de Registro)', placeholder: 'Ej: Amsterdam, Rotterdam, Utrecht', type: 'text', required: true },
    { id: 'btwNummer', label: 'BTW-nummer (VAT)', placeholder: 'NL123456789B01', type: 'text', required: false },
  ],
};

// ──────────────────────────────────────────────
// MASTER REGISTRY
// ──────────────────────────────────────────────
export const COUNTRIES_MAP: Record<string, CountryConfig> = {
  PY: PARAGUAY, PE: PERU, AR: ARGENTINA, CL: CHILE, CO: COLOMBIA,
  MX: MEXICO, BR: BRASIL, UY: URUGUAY, BO: BOLIVIA, EC: ECUADOR,
  VE: VENEZUELA, CR: COSTA_RICA, PA: PANAMA, GT: GUATEMALA, DO: DOMINICAN_REPUBLIC,
  US: USA, CA: CANADA,
  ES: SPAIN, DE: GERMANY, FR: FRANCE, IT: ITALY, PT: PORTUGAL, GB: UK, NL: NETHERLANDS,
};

export const COUNTRIES_LIST = Object.values(COUNTRIES_MAP).sort((a, b) => a.name.localeCompare(b.name));

export const REGION_LABELS: Record<Region, string> = {
  latam: 'América Latina',
  northamerica: 'América del Norte',
  europe: 'Europa',
};

export function getCountriesByRegion(): Record<Region, CountryConfig[]> {
  const grouped: Record<Region, CountryConfig[]> = { latam: [], northamerica: [], europe: [] };
  COUNTRIES_LIST.forEach(c => grouped[c.region].push(c));
  return grouped;
}

export function validateCountryEntityCombination(countryCode: string, entityTypeId: string): boolean {
  const country = COUNTRIES_MAP[countryCode];
  if (!country) return false;
  return country.entityTypes.some(e => e.id === entityTypeId);
}

export const COMPLIANCE_COLORS: Record<ComplianceLevel, { bg: string; text: string; label: string }> = {
  simple: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Simple' },
  moderate: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Moderado' },
  complex: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Complejo' },
};
