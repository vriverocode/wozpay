import { create } from "zustand";
import ApiService from "../services/api";
import JwtService from "../services/jwt/index.js";

export interface User {
    id: string | number;
    firstName?: string;
    lastName?: string;
    cedula?: string;
    dni?: string;
    email?: string;
    [key: string]: unknown;
}

export interface RegisterData {
    firstName: string;
    lastName: string;
    cedula: string;
    email: string;
    password: string;
}

/** Forma del usuario tal como puede venir de la API (Laravel). */
type ApiUserShape = {
    id?: string | number;
    name?: string;
    firstName?: string;
    lastName?: string;
    cedula?: string;
    dni?: string;
    email?: string;
    [key: string]: unknown;
};

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    errors: Record<string, string> | null;
    setAuth: (payload: { data?: { data?: User } | User } | { code?: number; data?: User }) => void;
    setUser: (user: User | null) => void;
    logoutAction: () => void;
    login: (dniOrEmail: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (userData: RegisterData) => Promise<void>;
    currentUser: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: !!JwtService.getToken(),
    errors: null,

    setAuth: (payload) => {
        const raw = (payload?.data?.data ?? payload?.data ?? payload) as ApiUserShape | null | undefined;
        if (!raw) {
            set({ isAuthenticated: true, errors: null, user: null });
            return;
        }
        // Normalizar user de Laravel (name, dni) al formato de la app (firstName, lastName, cedula)
        const [firstName = "", lastName = ""] = (raw.name ?? "").toString().trim().split(/\s+/, 2);
        const user: User = {
            ...raw,
            id: raw.id ?? "",
            firstName: raw.firstName ?? firstName,
            lastName: raw.lastName ?? lastName,
            cedula: raw.cedula ?? raw.dni ?? "",
            email: raw.email ?? "",
        };
        set({ isAuthenticated: true, errors: null, user });
    },

    setUser: (user) => set({ user }),

    logoutAction: () => {
        sessionStorage.removeItem("is_admin");
        sessionStorage.removeItem("user_unique_id");
        JwtService.destroyToken();
        set({ isAuthenticated: false, user: null, errors: null });
    },

    login: async (email, password) => {
        const credentials = { email, password };
        try {
            const { data } = await ApiService.post<{ code?: number; data?: { access_token?: string } }>(
                "api/auth/login",
                credentials
            );
            const token = data?.data?.access_token ?? (data as { access_token?: string })?.access_token;
            if (!token) {
                throw new Error((data as { error?: { message?: string } })?.error?.message ?? "No se recibió token");
            }
            JwtService.saveToken(token);
            ApiService.setHeader();
            const userRes = await ApiService.query<{ code?: number; data?: User }>("api/auth/current_user");
            get().setAuth(userRes.data);
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
                    ?.message ?? "Error al iniciar sesión";
            set({ errors: { login: msg } });
            throw new Error(msg);
        }
    },

    logout: async () => {
        try {
            if (JwtService.getToken()) {
                ApiService.setHeader();
                await ApiService.query("api/auth/logout");
            }
        } catch {
            // Ignorar error de red; limpiar sesión local de todos modos
        }
        get().logoutAction();
    },

    register: async (userData) => {
        try {
            const { data } = await ApiService.post<{ code?: number }>("api/auth/register", userData);
            if (!data?.code) {
                throw new Error((data as { error?: { message?: string } })?.error?.message ?? "Error al registrarse");
            }
            await get().login(userData.cedula, userData.password);
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
                    ?.message ?? (err instanceof Error ? err.message : "Error al registrarse");
            set({ errors: { register: msg } });
            throw new Error(msg);
        }
    },

    currentUser: async () => {
        if (!JwtService.getToken()) return;
        try {
            ApiService.setHeader();
            const res = await ApiService.query<{ code?: number; data?: User }>("api/auth/current_user");
            if (res?.data?.code === 200 && res?.data?.data) {
                get().setAuth(res.data);
            }
        } catch {
            get().logoutAction();
        }
    },

    resetPassword: async (_email: string) => {
        // TODO: Conectar con endpoint de Laravel cuando exista
        await new Promise((resolve) => setTimeout(resolve, 500));
    },
}));
