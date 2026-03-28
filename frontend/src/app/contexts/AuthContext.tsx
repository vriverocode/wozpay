import React, { useEffect, ReactNode } from "react";
import { useAuthStore } from "../stores/auth.store";

/**
 * Inicializa la sesión al montar (rehidrata usuario si hay token).
 * useAuth es un alias de useAuthStore para mantener compatibilidad.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const currentUser = useAuthStore((s) => s.currentUser);

    useEffect(() => {
        currentUser();
    }, [currentUser]);

    return <>{children}</>;
}

export const useAuth = useAuthStore;
