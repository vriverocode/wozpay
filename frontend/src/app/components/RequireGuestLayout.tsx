import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../stores/auth.store";

/**
 * Layout para rutas de invitado (ej. login). Si ya hay sesión, redirige a /.
 */
export function RequireGuestLayout() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
