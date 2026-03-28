import { createBrowserRouter } from "react-router";
import { RequireAuthLayout } from "./components/RequireAuthLayout";
import { RequireGuestLayout } from "./components/RequireGuestLayout";
import { AuthScreen } from "./components/AuthScreen";
import { WalletApp } from "./App";
import PaymentPage from "./PaymentPage";
import MembershipsPage from "./MembershipsPage";
import MembershipCheckoutPage from "./MembershipCheckoutPage";
import { AdminDashboard } from "./admin/AdminDashboard";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: RequireGuestLayout,
    children: [{ index: true, Component: AuthScreen }],
  },
  {
    path: "/",
    Component: RequireAuthLayout,
    children: [
      { index: true, Component: WalletApp },
      { path: "pay/:paymentId", Component: PaymentPage },
      { path: "memberships", Component: MembershipsPage },
      { path: "membership/checkout/:planId", Component: MembershipCheckoutPage },
    ],
  },
  {
    path: "/admin",
    Component: AdminDashboard,
  },
]);