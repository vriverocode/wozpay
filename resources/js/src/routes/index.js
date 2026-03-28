import { createWebHistory, createRouter } from 'vue-router'
import guest from './middlewares/guest'
import auth from './middlewares/auth'
import admin from './middlewares/admin'

import dashboardLayout from '@/layouts/dashboardLayout.vue';
import authLayout from '@/layouts/authLayout.vue';
import paysLayout from '@/layouts/paysLayout.vue';
import userAdminLayout from '@/layouts/userAdminLayout.vue';
import rekutuApply from '@/components/rekutu/rekutuApply.vue';
import bankPage from '@/pages/bank.vue';
import bankAccountPage from '@/pages/accountBank.vue';
import lastOperationPage from '@/pages/lastOperations.vue';
import notificationsPage from '@/pages/notifications.vue';
import deposit from '@/pages/deposit.vue'
import creditApply from '@/pages/creditApply.vue'
import loanPage from '@/pages/loan.vue'
import allUsers from '@/pages/admin/users.vue'
import usersWithLoan from '@/pages/admin/loanRequest.vue'
import loanPayView from '@/pages/admin/loanPayView.vue'
import loanApplication from '@/pages/admin/loanApplication.vue'
import cleanUsers from '@/components/admin/users/cleanUsers.vue'
import slowPayer from '@/components/admin/users/slowPayerUsers.vue'
import loanViewAdmin from '@/pages/admin/loanView.vue'
import userInfo from '@/components/profile/userInfo.vue'
import userAddress from '@/components/profile/userAddress.vue'
import userProffesion from '@/components/profile/userProffesion.vue'
import addAccountBank from '@/components/accountsBank/addAccountBank.vue'
import userById from '@/components/admin/users/userById.vue'
import userVerification from '@/components/admin/users/userVerification.vue'
import userNotification from '@/components/admin/notification/notificationPush.vue'
import verificationKyc from '@/components/profile/verificationKyc.vue'
import loanPay from '@/components/loan/loanPay.vue'
import loanPayFinish from '@/components/loan/loanPayFinish.vue'
import selectPayLoan from '@/components/loan/selectPayLoan.vue';
import loanView from '@/components/loan/loanView.vue'
import viewTransaction from '@/components/transaction/viewTransaction.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            name: "landing",
            // component: () => import('@/pages/landing.vue'),
            component: () => import("@/pages/optionalLading.vue"),
            meta: {
                title: "Crea tu cuenta",
            },
        },
        // { path: '/', redirect: window.localStorage.getItem('is_admin') == 'true' ? '/admin/dashboard' :'/dashboard' },
        {
            path: "/requestPay",
            name: "payLink",
            beforeEnter: auth,
            component: () => import("@/pages/payLink.vue"),
            meta: {
                title: "Solicitar Pago",
            },
        },
        {
            path: "/generatePayLink/:type",
            name: "generatePayLinkNew",
            beforeEnter: auth,
            component: () => import("@/pages/generatePayLink.vue"),
            meta: {
                title: "Solicitar Pago",
            },
        },
        {
            path: "/",
            name: "payLinkForm",

            component: () => import("@/layouts/payFormLinkLayout.vue"),
            children: [
                {
                    path: "/form_pay_link/user/:type",
                    name: "form_pay_lin_user",
                    beforeEnter: auth,
                    component: () => import("@/pages/paylinkFormUser.vue"),
                    meta: {
                        title: "Pagos",
                    },
                },
                {
                    path: "/deposit/pay/",
                    name: "deposit_pay",
                    beforeEnter: auth,
                    component: () =>
                        import("@/components/deposit/depositForm.vue"),
                    meta: {
                        title: "Completa tu deposito",
                    },
                },
                {
                    path: "/v1/pay/link/:code",
                    name: "form_pay_link",
                    component: () => import("@/pages/paylinkFormUser.vue"),
                    meta: {
                        title: "Pagos",
                    },
                },
            ],
        },
        {
            path: "/",
            name: "home",
            component: dashboardLayout,
            children: [
                {
                    name: "dashboard",
                    path: "/dashboard",
                    component: () => import("@/pages/dashboard.vue"),
                    beforeEnter: auth,
                    meta: {
                        // middleware: [
                        //   auth
                        // ],
                        title: "Dashboard",
                    },
                },
                {
                    name: "dashboard_admin",
                    path: "/admin/dashboard",
                    component: () => import("@/pages/admin/dashboard.vue"),
                    beforeEnter: admin,
                    meta: {
                        // middleware: [
                        //   auth
                        // ],
                        title: "Dashboard",
                    },
                },
            ],
        },
        {
            path: "/",
            name: "auth",
            component: authLayout,
            beforeEnter: guest,
            children: [
                {
                    path: "/login",
                    name: "Login",
                    component: () => import("@/pages/login.vue"),
                    meta: {
                        title: "Bienvenido",
                    },
                },
                {
                    path: "/register",
                    name: "register",
                    component: () => import("@/pages/register.vue"),
                    meta: {
                        title: "Crea tu cuenta",
                    },
                },
            ],
        },
        {
            path: "/link_card",
            name: "link_card",
            component: () => import("@/pages/link_card.vue"),
            meta: {
                title: "Vincular tarjeta",
            },
            beforeEnter: auth,
        },
        {
            path: "/bank_info",
            name: "bank_info",
            component: () => import("@/pages/bankPresentation.vue"),
            meta: {
                title: "Banco",
            },
            beforeEnter: auth,
        },
        {
            path: "/transfer",
            name: "transfer",
            component: () => import("@/pages/transfer.vue"),
            meta: {
                title: "Transferir",
            },
            beforeEnter: auth,
        },
        {
            path: "/v1/pay/:id",
            name: "pay",
            component: () => import("@/pages/transfer.vue"),
            meta: {
                title: "Pagar",
            },
            beforeEnter: auth,
        },
        {
            path: "/finish_transfer/:id",
            name: "finish_transfer",
            component: () => import("@/components/transfer/finishTransfer.vue"),
            meta: {
                title: "¡Envío exitoso!",
            },
            beforeEnter: auth,
        },
        {
            path: "/link/pay/:id",
            name: "payLinkDetails",
            component: () => import("@/pages/detailsPayLink.vue"),
            meta: {
                title: "¡Envío exitoso!",
            },
            beforeEnter: auth,
        },
        {
            path: "/link/byUser/:user",
            name: "linksByUser",
            component: () => import("@/pages/admin/linksByUser.vue"),
            meta: {
                title: "Links de pago",
            },
            beforeEnter: admin,
        },
        {
            path: "/link/allByUser/:user",
            name: "AllLinksByUser",
            component: () => import("@/pages/AllLinksByUser.vue"),
            meta: {
                title: "Links de pago",
            },
            beforeEnter: auth,
        },
        {
            path: "/",
            name: "admin",
            component: paysLayout,
            beforeEnter: admin,
            children: [
                {
                    path: "/admin/user/:id",
                    name: "userById",
                    component: userById,
                    beforeEnter: admin,
                    meta: {
                        title: "Perfil",
                    },
                },
                {
                    path: "/admin/user/verification/:id",
                    name: "userVerificationId",
                    component: userVerification,
                    beforeEnter: admin,
                    meta: {
                        title: "Perfil",
                    },
                },
                {
                    path: "/admin/notification/send",
                    name: "sendNotification",
                    component: userNotification,
                    beforeEnter: admin,
                    meta: {
                        title: "Notificaciones push",
                    },
                },
                {
                    path: "/admin/loan/:id",
                    name: "adminLoan",
                    component: loanApplication,
                    beforeEnter: admin,
                    meta: {
                        title: "Solicitud",
                    },
                },
                {
                    path: "/admin/loan_view/:id",
                    component: loanViewAdmin,
                    meta: {
                        title: "Préstamo",
                    },
                },
                {
                    path: "/admin/pay/loanView/:id",
                    component: loanPayView,
                    meta: {
                        title: "Pagos pendientes",
                    },
                },
                {
                    path: "/admin/loans",
                    component: () => import("@/pages/admin/loans.vue"),
                    meta: {
                        title: "Préstamo",
                    },
                },
                {
                    path: "/admin/interest",
                    component: () => import("@/pages/admin/interest.vue"),
                    meta: {
                        title: "Calculadora de intereses",
                    },
                },
                {
                    path: "/admin/depositPendingList/",
                    component: () =>
                        import("@/pages/admin/depositsPendingList.vue"),
                    meta: {
                        title: "Depositos pendientes",
                    },
                },
                {
                    path: "/admin/deposit/byId/:id",
                    component: () => import("@/pages/admin/depositById.vue"),
                    meta: {
                        title: "Detalle de deposito",
                    },
                },
                {
                    path: "/admin/payPendingList/:id",
                    component: () =>
                        import("@/pages/admin/paysPendingList.vue"),
                    meta: {
                        title: "Lista de pagos pendientes",
                    },
                },
                {
                    path: "/admin/paysDetailsOther/:id",
                    component: () =>
                        import("@/pages/admin/paysDetailsOther.vue"),
                    meta: {
                        title: "Detalles de pago",
                    },
                },
                {
                    path: "/admin/dropshipping/pay/:id",
                    component: () =>
                        import("@/pages/dropshipping/admin/dropshippingPayById.vue"),
                    meta: {
                        title: "Detalles de pago",
                    },
                },
                {
                    path: "/admin/exchange-rate",
                    name: "exchangeRate",
                    component: () => import("@/pages/admin/exchangeRate.vue"),
                    beforeEnter: admin,
                    meta: {
                        title: "Monedas",
                    },
                },
                {
                    path: "/admin/dropshipping",
                    name: "dropshippingOptions",
                    component: () =>
                        import("@/pages/admin/dropshippingPage.vue"),
                    meta: {
                        title: "Dropshipping ",
                    },
                },
                {
                    path: "/admin/dropshipping/categories",
                    name: "dropshipping-categorie",
                    component: () =>
                        import("@/pages/admin/categoriesProduct.vue"),
                    meta: {
                        title: "Categorias dropshipping",
                    },
                },
                {
                    path: "/admin/dropshipping/product",
                    name: "dropshipping-product",
                    component: () => import("@/pages/admin/products.vue"),
                    meta: {
                        title: "Productos dropshipping",
                    },
                },
                {
                    path: "/admin/dropshipping/product/all",
                    name: "dropshipping-productView",
                    component: () =>
                        import("@/pages/admin/viewAllProducts.vue"),
                    meta: {
                        title: "Todos productos",
                    },
                },
                {
                    path: "/admin/dropshipping/product/create",
                    name: "dropshipping-productCreate",
                    component: () => import("@/pages/admin/createProducts.vue"),
                    meta: {
                        title: "Crear productos",
                    },
                },
                {
                    path: "/admin/dropshipping/product/view/:id",
                    name: "dropshipping-productviewById",
                    component: () => import("@/pages/admin/productDetails.vue"),
                    meta: {
                        title: "Ver productos",
                    },
                },
                {
                    path: "/admin/dropshipping/categories/all",
                    name: "dropshipping-categorieView",
                    component: () =>
                        import("@/pages/admin/viewAllCategories.vue"),
                    meta: {
                        title: "Todos las categorias",
                    },
                },
                {
                    path: "/admin/dropshipping/categories/create",
                    name: "dropshipping-categoriesCreate",
                    component: () =>
                        import("@/pages/admin/createCategories.vue"),
                    meta: {
                        title: "Crear categorias",
                    },
                },
                {
                    path: "/admin/dropshipping/sell/all",
                    name: "dropshipping-sell",
                    component: () =>
                        import("@/pages/admin/sellDropshipping.vue"),
                    meta: {
                        title: "Ver ventas",
                    },
                },
            ],
        },
        {
            path: "/",
            name: "adminClient",
            component: userAdminLayout,
            beforeEnter: admin,
            children: [
                {
                    path: "/users",
                    name: "users",
                    component: allUsers,
                    meta: {
                        title: "Clientes",
                    },
                },
                {
                    path: "/users/loan",
                    name: "usersWithLoan",
                    component: usersWithLoan,
                    meta: {
                        title: "Solicitudes",
                    },
                },
                {
                    path: "/users/clean",
                    name: "usersClean",
                    component: cleanUsers,
                    meta: {
                        title: "Clientes",
                    },
                },
                {
                    path: "/users/slow_payer",
                    name: "usersSlowPayer",
                    component: slowPayer,
                    meta: {
                        title: "Clientes",
                    },
                },
                {
                    path: "/pays/pending",
                    name: "paysPeding",
                    component: () => import("@/pages/admin/paysPending.vue"),
                    meta: {
                        title: "Pagos pendientes",
                    },
                },
            ],
        },
        {
            path: "/trasacction/view/:type/:id",
            name: "view_transx",
            beforeEnter: auth,
            component: viewTransaction,
            meta: {
                title: "Comprobante",
            },
        },
        {
            path: "/withdrawal",
            name: "withdrawal",
            beforeEnter: auth,
            component: () => import("@/pages/withdrawalPage.vue"),
            meta: {
                title: "Retiro",
            },
        },
        {
            path: "/withdrawal-complete",
            name: "withdrawal-complete",
            beforeEnter: auth,
            component: () => import("@/pages/withdrawalCompletePage.vue"),
            meta: {
                title: "Retiro",
            },
        },
        {
            path: "/withdrawal-history",
            name: "withdrawal-history",
            beforeEnter: auth,
            component: () => import("@/pages/withdrawalHistory.vue"),
            meta: {
                title: "Retiro",
            },
        },
        {
            path: "/withdrawal-details/:id",
            name: "withdrawal-details",
            beforeEnter: auth,
            component: () => import("@/pages/withdrawalDetails.vue"),
            meta: {
                title: "Detalles del Retiro",
            },
        },
        {
            path: "/trasacction-public/view/:type/:id",
            name: "view_trans",
            component: viewTransaction,
            meta: {
                title: "Comprobante",
            },
        },
        {
            path: "/",
            name: "link",
            component: paysLayout,
            beforeEnter: auth,
            children: [
                {
                    path: "/link_card_form",
                    name: "link_card_form",
                    component: () => import("@/pages/creditForDebit.vue"),
                    meta: {
                        title: "Credito por debito",
                    },
                },
                {
                    path: "/linked_card/:id_card",
                    name: "linki",
                    component: () => import("@/pages/linked_card.vue"),
                    meta: {
                        title: "Adjuntar tarjeta de crédito o débito",
                    },
                },
                {
                    path: "/transfer_send",
                    name: "send_transfer",
                    component: () =>
                        import("@/components/transfer/sendTransfer.vue"),
                    meta: {
                        title: "Enviar dinero",
                    },
                },
                {
                    path: "/verification_kyc",
                    name: "verificationKyc",
                    component: verificationKyc,
                    meta: {
                        title: "Perfil",
                    },
                },
                {
                    path: "/bank",
                    component: bankPage,
                    meta: {
                        title: "Bancos",
                        // middleware: [
                        //   auth,
                    },
                },
                {
                    path: "/profile",
                    component: () => import("@/pages/profile.vue"),
                    meta: {
                        title: "Perfil",
                    },
                },
                {
                    path: "/notifications",
                    component: notificationsPage,
                    meta: {
                        title: "Notificaciones",
                    },
                },
                {
                    path: "/deposit",
                    component: deposit,
                    meta: {
                        // middleware: [
                        //   auth,

                        // ],
                        title: "Cargar dinero a tu billetera",
                    },
                },
                {
                    path: "/account_bank",
                    component: bankAccountPage,
                    meta: {
                        title: "Banco",
                    },
                },
                {
                    path: "/last-operations",
                    component: lastOperationPage,
                    meta: {
                        // middleware: [
                        //   auth,

                        // ],
                        title: "Ult. Trans.",
                    },
                },
                {
                    path: "/apply",
                    component: creditApply,
                    meta: {
                        // middleware: [
                        //   auth,

                        // ],
                        title: "Solicitar",
                    },
                },
                {
                    path: "/user_info",
                    component: userInfo,
                    meta: {
                        // middleware: [
                        //   auth,

                        // ],
                        title: "Perfil",
                    },
                },
                {
                    path: "/user_address",
                    component: userAddress,
                    meta: {
                        // middleware: [
                        //   auth,

                        // ],
                        title: "Perfil",
                    },
                },
                {
                    path: "/user_proffesion",
                    component: userProffesion,
                    meta: {
                        // middleware: [
                        //   auth,

                        // ],
                        title: "Perfil",
                    },
                },
                {
                    path: "/add_account_bank/:id",
                    component: addAccountBank,
                    meta: {
                        title: "Agregar cuenta bancaria",
                    },
                },
                {
                    path: "/card",
                    component: () => import("@/pages/card.vue"),
                    meta: {
                        title: "Vincular tarjeta de crédito",
                    },
                },
                {
                    path: "/loan",
                    component: loanPage,
                    meta: {
                        title: "Mi préstamo",
                    },
                },
                {
                    path: "/loan_pay/:type",
                    component: loanPay,
                    meta: {
                        title: "Paga tu préstamo",
                    },
                },
                {
                    path: "/loan_view",
                    component: loanView,
                    meta: {
                        title: "Mi préstamo",
                    },
                },
                {
                    path: "/loan_select_pay",
                    component: selectPayLoan,
                    meta: {
                        title: "Paga tu préstamo",
                    },
                },
                {
                    path: "/loan/pay/finish",
                    component: loanPayFinish,
                    meta: {
                        title: "Mi préstamo",
                    },
                },
                {
                    path: "/transactions",
                    component: () => import("@/pages/allTransaction.vue"),
                    meta: {
                        title: "Ultimas transacciones",
                    },
                },
                {
                    path: "/rekutu_apply",
                    component: rekutuApply,
                    meta: {
                        title: "Solicitar rekutu",
                    },
                },
            ],
        },
        {
            path: "/pay_link_services",
            name: "pay_link_landing",
            component: () => import("@/pages/linkLanding.vue"),
            meta: {
                title: "Inicia el servicio",
            },
            beforeEnter: auth,
        },
        {
            path: "/pay_link_landing_services",
            name: "new_link_landing",
            component: () => import("@/pages/newLandingLink.vue"),
            meta: {
                title: "Comienza ahora",
            },
            beforeEnter: auth,
        },
        {
            path: "/checkout_plan",
            name: "checkout_plan",
            component: () => import("@/pages/checkoutPlanPage.vue"),
            meta: {
                title: "🔐 Woz payments - pago seguro",
            },
            beforeEnter: auth,
        },
        {
            path: "/checkout/success",
            name: "checkout_success",
            component: () => import("@/pages/checkoutSuccess.vue"),
            meta: {
                title: "🔐 Woz payments - pago seguro",
            },
            beforeEnter: auth,
        },
        {
            path: "/pay_link_dashboard",
            name: "pay_link_dashboard",
            component: () => import("@/pages/dashboardLink.vue"),
            meta: {
                title: "Bienvenido",
            },
            beforeEnter: auth,
        },
        {
            path: "/",
            name: "dropshipping_Layout",
            component: () => import("@/layouts/dropshipping.vue"),
            beforeEnter: auth,
            children: [
                {
                    path: "/dropshipping/welcome",
                    name: "dropshipping_landing",
                    component: () => import("@/pages/dropshipping/landing.vue"),
                    meta: {
                        title: "Woz Dropshipping",
                    },
                },
                {
                    path: "/dropshipping/categories",
                    name: "dropshipping_categories",
                    component: () =>
                        import("@/pages/dropshipping/categories.vue"),
                    meta: {
                        title: "Woz Dropshipping",
                    },
                },
                {
                    path: "/dropshipping/category/:id/products",
                    name: "productByCategroy",
                    component: () =>
                        import("@/pages/dropshipping/productsByCategory.vue"),
                    meta: {
                        title: "Woz Dropshipping",
                    },
                },
                {
                    path: "/dropshipping/products/search",
                    name: "productSearch",
                    component: () =>
                        import("@/pages/dropshipping/productSearch.vue"),
                    meta: {
                        title: "Woz Dropshipping",
                    },
                },
                {
                    path: "/dropshipping/product/:id",
                    name: "productById",
                    component: () => import("@/pages/dropshipping/product.vue"),
                    meta: {
                        title: "Woz Dropshipping",
                    },
                },
            ],
        },
        {
            path: "/",
            name: "dropshipping_profile",
            component: () => import("@/layouts/dropshippingProfile.vue"),
            beforeEnter: auth,
            children: [
                {
                    path: "/dropshipping/profile",
                    name: "profile",
                    component: () =>
                        import("@/pages/dropshipping/profileDropshipping.vue"),
                    meta: {
                        title: "Woz Dropshipping",
                    },
                },
                {
                    path: "/dropshipping/product/:id",
                    name: "productById",
                    component: () => import("@/pages/dropshipping/product.vue"),
                    meta: {
                        title: "Woz Dropshipping",
                    },
                },
                {
                    path: "/dropshipping/pays/all/:id",
                    name: "allPaysDropx",
                    component: () =>
                        import("@/pages/dropshipping/paysToUser.vue"),
                    meta: {
                        title: "Woz Dropshipping",
                    },
                },
                {
                    path: "/dropshipping/products/all/:id",
                    name: "allProductosDropsshiping",
                    component: () =>
                        import("@/pages/dropshipping/productsSellByUser.vue"),
                    meta: {
                        title: "Woz Dropshipping",
                    },
                },
                {
                    path: "/dropshipping/sells/all/:id",
                    name: "allSellDrop",
                    component: () =>
                        import("@/pages/dropshipping/totalIncome.vue"),
                    meta: {
                        title: "Woz Dropshipping",
                    },
                },
            ],
        },
        {
            path: "/dropshipping/generatePayLink/:id",
            name: "generatePayLinkDrop",
            beforeEnter: auth,
            component: () => import("@/pages/dropshipping/generateLink.vue"),
            meta: {
                title: "Solicitar Pago",
            },
        },
        {
            path: "/dropshipping/details_link/:id",
            name: "detailsLinkDrop",
            beforeEnter: auth,
            component: () => import("@/pages/dropshipping/detailsLink.vue"),
            meta: {
                title: "Detalles del Link",
            },
        },
        {
            path: "/dropshipping/activateForm",
            name: "generatePayLinkd",
            beforeEnter: auth,
            component: () => import("@/pages/dropshipping/payActivation.vue"),
            meta: {
                title: "Activa tu cuenta",
            },
        },
        {
            path: "/dropshipping/iaResult/:id",
            name: "iaResult",
            beforeEnter: auth,
            component: () => import("@/pages/dropshipping/IAResult.vue"),
            meta: {
                title: "Woz Dropshipping",
            },
        },
        {
            path: "/v1/pay/dropshipping/link/:code",
            name: "form_pay_dropshipping_link",
            component: () =>
                import("@/pages/dropshipping/paylinkFormDropshpping.vue"),
            meta: {
                title: "Pagos",
            },
        },
    ],
});



export default router
