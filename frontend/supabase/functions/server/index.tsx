import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import {
  ADMIN_CLIENTS, ADMIN_LOANS, ADMIN_SAVINGS,
  ADMIN_REQUESTS, ADMIN_REVENUE, DEFAULT_CURRENCY, DEFAULT_RATES
} from "./admin_seed.tsx";

const app = new Hono();

app.use('*', logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

app.get("/make-server-fe20efe1/health", (c) => {
  return c.json({ status: "ok" });
});

// ── Helpers ──────────────────────────────────────────────────────────────
async function getOrSeed(key: string, seed: unknown) {
  const raw = await kv.get(key);
  if (raw) return JSON.parse(raw as string);
  await kv.set(key, JSON.stringify(seed));
  return seed;
}

// ── ADMIN: Revenue ───────────────────────────────────────────────────────
app.get("/make-server-fe20efe1/admin/revenue", async (c) => {
  try {
    const revenue = await getOrSeed("admin_revenue_v10", ADMIN_REVENUE);
    const currency = await getOrSeed("admin_currency", DEFAULT_CURRENCY);

    // ── INGRESOS OPERATIVOS ──
    const totalMemberships = revenue.memberships.totalRevenue;
    const linksRev = revenue.commissions.links;
    const qrRev = revenue.commissions.qr;
    const totalCommissions = 
      (linksRev.ventas.revenue + linksRev.freelance.revenue + linksRev.suscripciones.revenue) +
      (qrRev.ventas.revenue + qrRev.freelance.revenue + qrRev.suscripciones.revenue);
    const totalWithdrawals = revenue.withdrawals.totalRevenue;
    const totalApi = revenue.wozApi.totalRevenue;
    const totalMarketplace = revenue.wozMarketplace.totalRevenue;
    
    const subtotalOperational = totalMemberships + totalCommissions + totalWithdrawals + totalApi + totalMarketplace;

    // ── INGRESOS FINANCIEROS (NETOS PARA SUB TOTAL) ──
    // A. Préstamos: Interés cobrado - Provisión
    const loanInterestCollected = revenue.loans.interestCollected;
    const loanBadDebtProvision = revenue.loans.badDebtProvision;
    const netLoanResult = loanInterestCollected - loanBadDebtProvision;

    // B. Ahorro: Rendimiento Generado - Interés Pagado
    const savingsYield = revenue.savings.totalYieldGenerated;
    const savingsInterestPaid = revenue.savings.interestPaid;
    const netSavingsSpread = savingsYield - savingsInterestPaid;

    const subtotalFinancial = netLoanResult + netSavingsSpread;

    // ── INGRESO BRUTO CONSOLIDADO (Operativo + Financiero Neto) ──
    // Pero el usuario pidió separar Costos y Provisiones en el Consolidado.
    // Vamos a calcular un "Ingreso Total Bruto" y luego deducir Costos/Provisiones.
    
    const grossFinancialIncome = loanInterestCollected + savingsYield;
    const grossTotalIncome = subtotalOperational + grossFinancialIncome;
    
    // ── DEDUCCIONES (Costos y Provisiones Reales) ──
    // Provisión Incobrable (Loans) + Intereses Pagados (Savings)
    // + (Opcional) Costos Operativos/Financieros genéricos si existieran (ahora 0 en seed).
    
    const totalDeductions = loanBadDebtProvision + savingsInterestPaid + 
                            (revenue.costs.operational || 0) + 
                            (revenue.costs.financial || 0) + 
                            (revenue.costs.additionalProvisions || 0);

    // ── RESULTADO NETO WOZ ──
    const netIncome = grossTotalIncome - totalDeductions;

    // Build response object
    const responseData = {
      ...revenue,
      consolidated: {
        subtotalOperational,
        subtotalFinancial, // Keep for backward compat or reference
        grossFinancialIncome, // New: Gross Financial Income for display
        grossTotalIncome,     // New: Total Gross Income
        totalDeductions,      // New: Total Deductions
        netIncome,
        netLoanResult,
        netSavingsSpread,
        // Detailed deductions for frontend
        deductions: {
          badDebtProvision: loanBadDebtProvision,
          interestPaid: savingsInterestPaid,
          otherCosts: (revenue.costs.operational || 0) + (revenue.costs.financial || 0) + (revenue.costs.additionalProvisions || 0)
        }
      },
      currency
    };

    return c.json(responseData);
  } catch (err) {
    console.log(`[admin/revenue] Error: ${err}`);
    return c.json({ error: `Error al obtener ingresos: ${err}` }, 500);
  }
});

// ── ADMIN: Clients ───────────────────────────────────────────────────────
app.get("/make-server-fe20efe1/admin/clients", async (c) => {
  try {
    const clients = await getOrSeed("admin_clients", ADMIN_CLIENTS);
    return c.json({ clients });
  } catch (err) {
    console.log(`[admin/clients] GET Error: ${err}`);
    return c.json({ error: `${err}` }, 500);
  }
});

app.delete("/make-server-fe20efe1/admin/clients/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const clients: any[] = await getOrSeed("admin_clients", ADMIN_CLIENTS);
    const idx = clients.findIndex(cl => cl.id === id);
    if (idx === -1) return c.json({ error: "Cliente no encontrado" }, 404);
    clients[idx] = { ...clients[idx], status: "deleted", balanceGs: 0, balanceUsd: 0 };
    await kv.set("admin_clients", JSON.stringify(clients));
    console.log(`[admin/clients] Deleted client ${id}`);
    return c.json({ success: true });
  } catch (err) {
    console.log(`[admin/clients] DELETE Error: ${err}`);
    return c.json({ error: `${err}` }, 500);
  }
});

// ── ADMIN: Loans ─────────────────────────────────────────────────────────
app.get("/make-server-fe20efe1/admin/loans", async (c) => {
  try {
    const loans: any[] = await getOrSeed("admin_loans", ADMIN_LOANS);
    const stats = {
      total: loans.length,
      active: loans.filter(l => l.status === 'active').length,
      late: loans.filter(l => l.status === 'late').length,
      delinquent: loans.filter(l => l.status === 'delinquent').length,
      totalGranted: loans.reduce((s, l) => s + l.amountGranted, 0),
      totalToReturn: loans.reduce((s, l) => s + l.amountToReturn, 0),
    };
    return c.json({ loans, stats });
  } catch (err) {
    console.log(`[admin/loans] Error: ${err}`);
    return c.json({ error: `${err}` }, 500);
  }
});

// ── ADMIN: Savings ───────────────────────────────────────────────────────
app.get("/make-server-fe20efe1/admin/savings", async (c) => {
  try {
    // Use v11 to load new CDA structure
    const savings: any[] = await getOrSeed("admin_savings_v11", ADMIN_SAVINGS);
    const stats = {
      total: savings.length,
      totalCapital: savings.reduce((s, sv) => s + (sv.amountInvested || 0), 0),
      avgRate: savings.length > 0 ? (savings.reduce((s, sv) => s + (sv.rate || 0), 0) / savings.length).toFixed(1) : 0,
      totalYield: savings.reduce((s, sv) => s + ((sv.totalToReceive || 0) - (sv.amountInvested || 0)), 0),
    };
    return c.json({ savings, stats });
  } catch (err) {
    console.log(`[admin/savings] Error: ${err}`);
    return c.json({ error: `${err}` }, 500);
  }
});

// ── ADMIN: Requests ──────────────────────────────────────────────────────
app.get("/make-server-fe20efe1/admin/requests", async (c) => {
  try {
    const requests: any[] = await getOrSeed("admin_requests", ADMIN_REQUESTS);
    const stats = {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
    };
    return c.json({ requests, stats });
  } catch (err) {
    console.log(`[admin/requests] GET Error: ${err}`);
    return c.json({ error: `${err}` }, 500);
  }
});

app.put("/make-server-fe20efe1/admin/requests/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const requests: any[] = await getOrSeed("admin_requests", ADMIN_REQUESTS);
    const idx = requests.findIndex(r => r.id === id);
    if (idx === -1) return c.json({ error: "Solicitud no encontrada" }, 404);
    requests[idx] = { ...requests[idx], status: body.status, notes: body.notes || requests[idx].notes };
    await kv.set("admin_requests", JSON.stringify(requests));
    console.log(`[admin/requests] Updated ${id} �� ${body.status}`);
    return c.json({ success: true, request: requests[idx] });
  } catch (err) {
    console.log(`[admin/requests] PUT Error: ${err}`);
    return c.json({ error: `${err}` }, 500);
  }
});

// ── ADMIN: Notifications ─────────────────────────────────────────────────
app.post("/make-server-fe20efe1/admin/notifications", async (c) => {
  try {
    const body = await c.req.json();
    const { target, clientIds, subject, message } = body;
    if (!subject?.trim() || !message?.trim()) {
      return c.json({ error: "Asunto y mensaje son obligatorios." }, 400);
    }
    const notifKey = `admin_notification:${Date.now()}`;
    const record = {
      id: notifKey,
      target, clientIds: clientIds || [],
      subject, message,
      sentAt: new Date().toISOString(),
      recipients: target === 'all' ? 'todos' : `${clientIds?.length || 0} clientes`,
    };
    await kv.set(notifKey, JSON.stringify(record));
    console.log(`[admin/notifications] Sent: "${subject}" → ${record.recipients}`);
    const recipients = target === 'all' ? 'todos los clientes activos' : `${clientIds?.length || 0} cliente(s) seleccionado(s)`;
    return c.json({ success: true, message: `Notificación enviada a ${recipients}.` });
  } catch (err) {
    console.log(`[admin/notifications] Error: ${err}`);
    return c.json({ error: `${err}` }, 500);
  }
});

// ── ADMIN: Currency ──────────────────────────────────────────────────────
app.get("/make-server-fe20efe1/admin/currency", async (c) => {
  try {
    const data = await getOrSeed("admin_currency", DEFAULT_CURRENCY);
    return c.json(data);
  } catch (err) {
    console.log(`[admin/currency] GET Error: ${err}`);
    return c.json({ error: `${err}` }, 500);
  }
});

app.post("/make-server-fe20efe1/admin/currency", async (c) => {
  try {
    const body = await c.req.json();
    const { usdToGs, updatedBy } = body;
    if (!usdToGs || usdToGs <= 0) return c.json({ error: "Cotización inválida." }, 400);
    const record = { usdToGs, updatedAt: new Date().toISOString(), updatedBy: updatedBy || 'admin' };
    await kv.set("admin_currency", JSON.stringify(record));
    console.log(`[admin/currency] Updated: 1 USD = Gs ${usdToGs} by ${updatedBy}`);
    return c.json({ success: true, ...record });
  } catch (err) {
    console.log(`[admin/currency] POST Error: ${err}`);
    return c.json({ error: `${err}` }, 500);
  }
});

// ── ADMIN: Rates ─────────────────────────────────────────────────────────
app.get("/make-server-fe20efe1/admin/rates", async (c) => {
  try {
    const data = await getOrSeed("admin_rates", DEFAULT_RATES);
    return c.json(data);
  } catch (err) {
    console.log(`[admin/rates] GET Error: ${err}`);
    return c.json({ error: `${err}` }, 500);
  }
});

app.post("/make-server-fe20efe1/admin/rates", async (c) => {
  try {
    const body = await c.req.json();
    const { loanMonthlyRate, moraMonthlyRate } = body;
    if (!loanMonthlyRate || loanMonthlyRate <= 0) return c.json({ error: "Tasa de préstamo inválida." }, 400);
    if (!moraMonthlyRate || moraMonthlyRate <= 0) return c.json({ error: "Tasa de mora inválida." }, 400);
    const record = {
      loanMonthlyRate, moraMonthlyRate,
      updatedAt: new Date().toISOString(),
      note: `Tasas configuradas: préstamo ${loanMonthlyRate}%/mes, mora ${moraMonthlyRate}%/mes`,
    };
    await kv.set("admin_rates", JSON.stringify(record));
    console.log(`[admin/rates] Updated: loan=${loanMonthlyRate}%, mora=${moraMonthlyRate}%`);
    return c.json({ success: true, ...record });
  } catch (err) {
    console.log(`[admin/rates] POST Error: ${err}`);
    return c.json({ error: `${err}` }, 500);
  }
});

// ── Legal entity validation ──────────────────────────────────────────────
const VALID_COMBINATIONS: Record<string, string[]> = {
  PY: ['unipersonal','eas','sa','srl','eirl','cooperativa'],
  PE: ['sac','sa','srl','eirl'],
  AR: ['sas','sa','srl','monotributista'],
  CL: ['spa','sa','ltda','eirl'],
  CO: ['sas','sa','ltda','persona_natural'],
  MX: ['sapi','sa_cv','srl_cv','persona_fisica'],
  BR: ['ltda','sa','mei','eireli'],
  UY: ['sas','sa','srl','unipersonal'],
  BO: ['srl','sa','unipersonal'],
  EC: ['sa','cia_ltda','persona_natural'],
  VE: ['ca','srl','firma_personal'],
  CR: ['sa','srl','persona_fisica'],
  PA: ['sa','srl','fondation'],
  GT: ['sa','srl','empresa_individual'],
  DO: ['sa','srl','eirl'],
  US: ['llc','c_corp','s_corp','sole_prop','partnership'],
  CA: ['corporation','sole_prop','partnership'],
  ES: ['autonomo','sl','sa','cooperativa'],
  DE: ['gmbh','ug','ag','einzelunternehmen'],
  FR: ['sas','sarl','sa','micro_entreprise'],
  IT: ['srl','spa','ditta_individuale'],
  PT: ['lda','sa','eni'],
  GB: ['ltd','plc','sole_trader','llp'],
  NL: ['bv','nv','eenmanszaak'],
};

app.post("/make-server-fe20efe1/validate-business-registration", async (c) => {
  try {
    const { countryCode, entityTypeId, companyName, taxId, repEmail } = await c.req.json();
    if (!countryCode || !entityTypeId || !companyName || !taxId || !repEmail)
      return c.json({ valid: false, message: "Faltan campos obligatorios." }, 400);
    if (!VALID_COMBINATIONS[countryCode])
      return c.json({ valid: false, message: `País "${countryCode}" no reconocido.` }, 400);
    if (!VALID_COMBINATIONS[countryCode].includes(entityTypeId))
      return c.json({ valid: false, message: `Tipo societario "${entityTypeId}" no válido para ${countryCode}.` }, 422);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(repEmail))
      return c.json({ valid: false, message: "Correo del representante inválido." }, 400);
    await kv.set(`biz_reg_validation:${Date.now()}:${countryCode}`, JSON.stringify({ countryCode, entityTypeId, timestamp: new Date().toISOString() }));
    return c.json({ valid: true, message: "Combinación válida." });
  } catch (err) {
    return c.json({ valid: false, message: `Error: ${err}` }, 500);
  }
});

app.post("/make-server-fe20efe1/submit-business-registration", async (c) => {
  try {
    const body = await c.req.json();
    const { countryCode, entityTypeId } = body;
    if (!VALID_COMBINATIONS[countryCode]?.includes(entityTypeId))
      return c.json({ error: "Combinación inválida. Solicitud bloqueada." }, 422);
    const registrationId = `biz_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    await kv.set(`business_registration:${registrationId}`, JSON.stringify({ ...body, id: registrationId, status: 'pending_kyc', submittedAt: new Date().toISOString() }));
    return c.json({ success: true, registrationId, message: "Registro empresarial recibido. Proceso KYC iniciado." });
  } catch (err) {
    return c.json({ error: `Error al guardar: ${err}` }, 500);
  }
});

Deno.serve(app.fetch);
