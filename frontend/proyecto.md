Te hago un resumen práctico orientado a **rutas, estado global y llamadas al backend**.

### 1. Resumen rápido de la estructura de `frontend`

- **Entry / configuración**
  - `index.html`: `<div id="root"></div>` + `<script type="module" src="/src/main.tsx">`.
  - `vite.config.ts`: Vite con React y Tailwind, alias `@` → `src`.
  - `src/main.tsx`: monta `Main` sobre `#root` e importa los estilos globales.
  - `src/styles/…`: `index.css` importa `tailwind.css`, `theme.css`, `fonts.css`.

- **Núcleo de la app**
  - `src/app/Main.tsx`: envuelve todo en `AuthProvider` y `RouterProvider`.
  - `src/app/routes.tsx`: define las rutas principales con `createBrowserRouter`.
  - `src/app/App.tsx`, `AppWrapper.tsx`: lógica de auth/“wallet app” y flujo principal del usuario.
  - `src/app/contexts/AuthContext.tsx`: contexto de autenticación (similar a un store simple).

- **Páginas y vistas**
  - `src/app/PaymentPage.tsx`, `MembershipsPage.tsx`, `MembershipCheckoutPage.tsx`: páginas conectadas a rutas públicas.
  - `src/app/admin/*.tsx`: panel admin (`AdminDashboard`, `AdminClients`, `AdminLoans`, etc.), todo bajo la ruta `/admin`.

- **Componentes y UI**
  - `src/app/components/*`: modales, tarjetas, navegación, etc.
  - `src/app/components/ui/*`: librería de componentes de UI (tipo design system / shadcn).

- **Utilidades y tipos**
  - `src/app/utils/*`: funciones de ayuda (cálculos, storage, colores de membresía, validaciones).
  - `src/app/types/*`: tipos TypeScript para balances, membresías, etc.
  - `src/app/data/*`: data estática (por ejemplo, `businessRegistrationData.ts`).

- **Integración externa**
  - `frontend/utils/supabase/info.tsx`: `projectId` y `publicAnonKey` de Supabase (se usa sobre todo en admin y formularios).

---

### 2. ¿Dónde modificar / agregar rutas?

- Archivo clave: **`src/app/routes.tsx`**.  
  Ahí está el `createBrowserRouter` con rutas como:
  - `/` → `AppWrapper`
  - `/pay/:paymentId` → `PaymentPage`
  - `/memberships` → `MembershipsPage`
  - `/membership/checkout/:planId` → `MembershipCheckoutPage`
  - `/admin` → `AdminDashboard`

**Para agregar una nueva página**:

1. Crear el componente de página, por ejemplo `src/app/ProfilePage.tsx`.
2. Importarlo en `routes.tsx`.
3. Añadir un objeto más al array del router, por ejemplo:
   - path `/perfil` → `Component: ProfilePage`.

La navegación interna (botones, enlaces) la harías usando `react-router` (`Link`, `useNavigate`) dentro de los componentes que ya están en `src/app/components` o en las propias páginas.

---

### 3. “Algo parecido a Pinia” para control de estado

Ahora mismo tienes:

- **`AuthContext`** en `src/app/contexts/AuthContext.tsx`, que es tu “store” de autenticación:
  - Guarda `user` y expone `login`, `register`, `logout`, etc.
  - `Main` envuelve la app con `<AuthProvider>`.

Si quieres algo parecido a **Pinia** (stores por dominio):

- **Lugar recomendado**:  
  - Crear una carpeta `src/app/contexts` (ya existe para auth) y/o `src/app/stores`.
- **Patrón típico sin librerías extras**:
  - Un archivo por “store” (ej. `WalletStore.tsx`, `MembershipStore.tsx`) que exporte:
    - Un `Context` + `Provider` (como `AuthContext`).
    - Hooks como `useWalletStore()`, `useMembershipStore()`.
  - En `Main.tsx` envuelves todo con los distintos providers (igual que con `AuthProvider`).

Si quieres algo más cercano aún a la experiencia de Pinia (con hooks directos tipo `useWalletStore()` sin tanto boilerplate), podrías introducir una librería tipo **Zustand** o **Jotai**, y ubicar los stores en `src/app/stores`, pero la estructura recomendada seguiría siendo la misma: **un archivo por store de dominio**.

---

### 4. ¿Dónde se hacen (y conviene hacer) las llamadas a la API backend (Laravel)?

Ahora mismo las llamadas HTTP están **dispersas en componentes**, principalmente:

- **Panel admin** (`src/app/admin/*.tsx`):
  - `AdminDashboard.tsx`: usa `fetch(`${API}/admin/...`)` con `API` y `HEADERS` construidos a partir de Supabase (`projectId`, `publicAnonKey`).
  - `AdminClients.tsx`, `AdminLoans.tsx`, `AdminRequests.tsx`, `AdminSavings.tsx`, `AdminCurrency.tsx`, `AdminRevenue.tsx`, `AdminNotifications.tsx`, `AdminCalculator.tsx`: todas estas usan `fetch` a endpoints tipo `.../admin/loans`, `.../admin/currency`, etc.

- **Formularios / ejemplos**:
  - `BusinessRegistrationForm.tsx`: llama a funciones de Supabase (`/validate-business-registration`, `/submit-business-registration`).
  - `WozApiDocs.tsx`: ejemplos que hacen `fetch('/api/process-payment')` y `fetch('/apps/wozpay/create-intent')`, que probablemente son **endpoints de tu backend Laravel**.

Si quieres **organizar mejor y orientarlo expresamente a tu API Laravel**, te recomiendo:

- Crear una carpeta tipo **`src/app/services` o `src/app/api`** y dentro:
  - Un módulo por área, por ejemplo:
    - `adminApi.ts` (clientes, préstamos, ahorros, etc.).
    - `paymentsApi.ts` (pagos, intents, etc. hacia Laravel `/api/...`).
  - Ahí centralizas:
    - El `BASE_URL` de Laravel (por ejemplo `http://tu-dominio.test/api` o relativo `/api`).
    - Los headers comunes (token Sanctum, Bearer, etc.).
    - Funciones como `getClients()`, `createLoan()`, `getRevenue()`, `processPayment()`, etc.
- Luego, en tus componentes (`AdminDashboard`, `PaymentPage`, etc.) solo llamas a esas funciones de servicio, no a `fetch` directamente.

**Conexión específica con Laravel**:

- Todo lo que sea endpoint **`/api/...` o rutas de tu app Laravel** es buen candidato para:
  - Estar encapsulado en uno de estos servicios.
  - Ser invocado desde componentes o desde tus “stores” (contexts) de React.
- Si decides manejar mucho estado en algo tipo “Pinia” (contexts/stores), las **llamadas a Laravel** suelen ir:
  - Desde el store (por ejemplo, `useClientsStore().fetchClients()` llama a `adminApi.getClients()`).
  - O desde hooks específicos (`useClients()` que usan el servicio y guardan en estado).

---

### 5. Resumen operativo

- **Rutas**: modifica/agrega en `src/app/routes.tsx` (y crea nuevas páginas en `src/app`).
- **Estado global tipo Pinia**: sigue el patrón de `AuthContext` en `src/app/contexts`, y añade más contexts/stores por dominio o una carpeta `src/app/stores`.
- **Llamadas a backend Laravel**:
  - Actualmente se hacen con `fetch` en varios componentes (admin, formularios, docs).
  - Lo ideal es que las centralices en `src/app/services` / `src/app/api` y uses siempre esos servicios desde componentes o stores.

Si me dices un caso concreto (por ejemplo: “quiero crear una ruta `/balance` que llame a un endpoint Laravel `/api/balance` y guarde el resultado en un store”), te puedo detallar paso a paso qué archivos tocar y cómo estructurarlo.