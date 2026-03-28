import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../stores/auth.store";
import JwtService from "../services/jwt/index.js";
import LoaderPage  from "./LoaderPage.js";
/**
 * Layout que exige sesión. Si no hay usuario logueado, redirige a /login.
 * Si hay token pero el usuario aún no se cargó, muestra carga (evita flash a login).
 */
export function RequireAuthLayout() {
    const { isAuthenticated, user } = useAuthStore();
    const hasToken = !!JwtService.getToken();

    if (hasToken && !user) {
        return <LoaderPage />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
