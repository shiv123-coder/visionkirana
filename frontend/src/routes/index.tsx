import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LandingPage } from "@/pages/LandingPage";
import { ShopRegistrationForm } from "@/features/shop/ShopRegistrationForm";
import { ShopEditForm } from "@/features/shop/ShopEditForm";
import { DashboardPage } from "@/pages/DashboardPage";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { AdminDashboard } from "@/features/dashboard/AdminDashboard";
import { AdminProfile } from "@/features/admin/AdminProfile";
import { AuditLogs } from "@/features/admin/AuditLogs";
import { AdminShopsList } from "@/features/admin/AdminShopsList";
import { AdminApplicationsList } from "@/features/admin/AdminApplicationsList";
import { AdminUsersList } from "@/features/admin/AdminUsersList";
import { AdminDemoRequests } from "@/features/admin/AdminDemoRequests";
import { AdminNotifications } from "@/features/admin/AdminNotifications";
import { LoanOfficerDashboard } from "@/features/dashboard/LoanOfficerDashboard";
import { DocumentUploadView } from "@/features/application/DocumentUploadView";
import { ApplicationReportView } from "@/features/application/ApplicationReportView";
import { Navbar } from "@/components/layout/Navbar";
import SystemStatusPage from "@/pages/SystemStatusPage";
import { LoginPage } from "@/pages/LoginPage";
import { SignUpPage } from "@/pages/SignUpPage";
import { FeaturesPage } from "@/pages/public/FeaturesPage";
import { PricingPage } from "@/pages/public/PricingPage";
import { CaseStudiesPage } from "@/pages/public/CaseStudiesPage";
import { AboutPage } from "@/pages/public/AboutPage";
import { CareersPage } from "@/pages/public/CareersPage";
import { ContactPage } from "@/pages/public/ContactPage";
import { PrivacyPolicyPage } from "@/pages/public/PrivacyPolicyPage";
import { TermsOfServicePage } from "@/pages/public/TermsOfServicePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignUpPage />,
  },
  {
    path: "/register",
    element: (
      <div className="min-h-screen bg-background">
        <Navbar />
        <ShopRegistrationForm />
      </div>
    ),
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },
  {
    path: "/shops/:shopId/edit",
    element: (
      <div className="min-h-screen bg-background">
        <Navbar />
        <ShopEditForm />
      </div>
    ),
  },
  {
    path: "/applications/:applicationId/documents",
    element: (
      <div className="min-h-screen bg-background">
        <Navbar />
        <DocumentUploadView />
      </div>
    ),
  },
  {
    path: "/applications/:applicationId/report",
    element: <ApplicationReportView />,
  },
  {
    path: "/system-status",
    element: (
      <div className="min-h-screen bg-background">
        <Navbar />
        <SystemStatusPage />
      </div>
    ),
  },
  { path: "/features", element: <FeaturesPage /> },
  { path: "/pricing", element: <PricingPage /> },
  { path: "/case-studies", element: <CaseStudiesPage /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/careers", element: <CareersPage /> },
  { path: "/contact", element: <ContactPage /> },
  { path: "/privacy-policy", element: <PrivacyPolicyPage /> },
  { path: "/terms-of-service", element: <TermsOfServicePage /> },
  {
    path: "/admin",
    element: <PortalLayout allowedRoles={["admin"]} basePath="/admin" />,
    children: [
      { path: "", element: <AdminDashboard /> },
      { path: "settings", element: <AdminProfile /> },
      { path: "audit-logs", element: <AuditLogs /> },
      { path: "shops", element: <AdminShopsList /> },
      { path: "applications", element: <AdminApplicationsList /> },
      { path: "users", element: <AdminUsersList /> },
      { path: "demo-requests", element: <AdminDemoRequests /> },
      { path: "notifications", element: <AdminNotifications /> },
    ]
  },
  {
    path: "/officer",
    element: <PortalLayout allowedRoles={["loan_officer"]} basePath="/officer" />,
    children: [
      { path: "", element: <LoanOfficerDashboard /> },
      { path: "settings", element: <AdminProfile /> },
      { path: "users", element: <AdminUsersList /> },
      { path: "shops", element: <AdminShopsList /> },
      { path: "applications", element: <AdminApplicationsList /> },
      { path: "notifications", element: <AdminNotifications /> },
    ]
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

