import { BrowserRouter, Routes, Route, useLocation, useNavigate, useParams } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { useEffect, lazy, Suspense } from "react";
import { Toaster, toast } from "sonner";
import ScrollToTop from "@/components/layout/ScrollToTop";
import AuthInitializer from "@/components/layout/AuthInitializer";
import ProtectedAdminRoute from "@/components/layout/ProtectedAdminRoute";
import { trackPageView } from "@/hooks/useTracking";
import RouteLoader from "@/components/layout/RouteLoader";

// Public Pages
const HomePage = lazy(() => import("@/pages/HomePage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const ProductsPage = lazy(() => import("@/pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("@/pages/ProductDetailPage"));
const IndustriesPage = lazy(() => import("@/pages/IndustriesPage"));
const FinancingPage = lazy(() => import("@/pages/FinancingPage"));
const ServicePage = lazy(() => import("@/pages/ServicePage"));
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const BlogArticlePage = lazy(() => import("@/pages/BlogArticlePage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const ComparePage = lazy(() => import("@/pages/ComparePage"));
const LegalPage = lazy(() => import("@/pages/LegalPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Admin Pages
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminLeads = lazy(() => import("@/pages/admin/AdminLeads"));
const AdminProducts = lazy(() => import("@/pages/admin/AdminProducts"));
const AdminContent = lazy(() => import("@/pages/admin/AdminContent"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminCustomers = lazy(() => import("@/pages/admin/AdminCustomers"));
const AdminQuotations = lazy(() => import("@/pages/admin/AdminQuotations"));
const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics"));
const AdminContacts = lazy(() => import("@/pages/admin/AdminContacts"));
const AdminChat = lazy(() => import("@/pages/admin/AdminChat"));
const AdminAppointments = lazy(() => import("@/pages/admin/AdminAppointments"));
const AdminSystemSettings = lazy(() => import("@/pages/admin/AdminSystemSettings"));
const AdminMedia = lazy(() => import("@/pages/admin/AdminMedia"));

// Customer Pages
const CustomerDashboard = lazy(() => import("@/pages/customer/CustomerDashboard"));

import PublicLayout from "@/components/layout/PublicLayout";
import LiveChat from "@/components/features/LiveChat";

import { useSystemSettings } from "@/hooks/useSystemSettings";

// Dynamic tracking component using Firebase-synced Site Title
function PageTracker() {
  const location = useLocation();
  const { settings } = useSystemSettings();
  const siteTitle = settings.site_title || "TRIP Mobility";

  useEffect(() => {
    const pageTitleMap: Record<string, string> = {
      "/": `${siteTitle} | Premium Electric Bikes Philippines`,
      "/about": `About Us — ${siteTitle}`,
      "/products": `All Models — ${siteTitle}`,
      "/industries": `Industries — ${siteTitle}`,
      "/financing": `Financing — ${siteTitle}`,
      "/service": `Service — ${siteTitle}`,
      "/blog": `Knowledge Hub — ${siteTitle}`,
      "/contact": `Contact Us — ${siteTitle}`,
      "/my-quotes": `My Quotations — ${siteTitle}`,
    };

    const title = pageTitleMap[location.pathname] || siteTitle;
    document.title = title;
    trackPageView(location.pathname, title);
  }, [location.pathname, siteTitle]);
  return null;
}

function ReferralHandler() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      sessionStorage.setItem("referrer_code", code);
      sessionStorage.setItem("referral_code", code);
      toast.success("Referral code applied!");
    }
    navigate("/products", { replace: true });
  }, [code, navigate]);

  return null;
}

export default function App() {
  return (
    <HelmetProvider>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthInitializer />
      <ScrollToTop />
      <PageTracker />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#FFFFFF",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            borderLeft: "4px solid #000000",
            color: "#000000",
            fontFamily: "var(--font-sans, sans-serif)",
            borderRadius: "2px",
            boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)",
            padding: "14px 16px",
            fontWeight: "bold",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          },
        }}
      />
      <LiveChat />
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/industries" element={<IndustriesPage />} />
            <Route path="/financing" element={<FinancingPage />} />
            <Route path="/service" element={<ServicePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogArticlePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/legal" element={<LegalPage />} />
            <Route path="/refer/:code" element={<ReferralHandler />} />
          </Route>

          {/* Customer Portal */}
          <Route path="/my-quotes" element={<CustomerDashboard />} />

          {/* Admin Login (unprotected) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedAdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="quotations" element={<AdminQuotations />} />
              <Route path="contacts" element={<AdminContacts />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="chat" element={<AdminChat />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="settings" element={<AdminSystemSettings />} />
              <Route path="media" element={<AdminMedia />} />

            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
    </HelmetProvider>
  );
}
