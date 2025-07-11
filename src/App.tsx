import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Bookings from "./pages/Bookings";
import BookingDetail from "./pages/BookingDetail";
import KYCVerification from "./pages/KYCVerification";
import BecomeProvider from "./pages/BecomeProvider";
import ProviderDashboard from "./pages/ProviderDashboard";
import ProviderProfile from "./pages/ProviderProfile";
import TrainingCenter from "./pages/TrainingCenter";
import Messages from "./pages/Messages";
import Favorites from "./pages/Favorites";
import AdminDashboard from "./pages/AdminDashboard";
import HowItWorks from "./pages/HowItWorks";
import Help from "./pages/Help";
import { AuthProvider } from "./hooks/useAuth";
import { LanguageProvider } from "./contexts/LanguageContext";
import Header from "./components/Header";
import { CorporateAccountManager } from "./components/CorporateAccountManager";
import { FranchiseManager } from "./components/FranchiseManager";
import { APIIntegrationPanel } from "./components/APIIntegrationPanel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/help" element={<Help />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:id" element={<ServiceDetail />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/bookings/:id" element={<BookingDetail />} />
              <Route path="/become-provider" element={<BecomeProvider />} />
              <Route path="/kyc-verification" element={<KYCVerification />} />
              <Route path="/provider/dashboard" element={<ProviderDashboard />} />
              <Route path="/provider/profile" element={<ProviderProfile />} />
              <Route path="/provider/training" element={<TrainingCenter />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/corporate-dashboard" element={
                <div className="min-h-screen bg-gradient-to-br from-background to-muted">
                  <div className="sticky top-0 z-50 w-full"><Header /></div>
                  <CorporateAccountManager />
                </div>
              } />
              <Route path="/franchise-dashboard" element={
                <div className="min-h-screen bg-gradient-to-br from-background to-muted">
                  <div className="sticky top-0 z-50 w-full"><Header /></div>
                  <FranchiseManager />
                </div>
              } />
              <Route path="/api-management" element={
                <div className="min-h-screen bg-gradient-to-br from-background to-muted">
                  <div className="sticky top-0 z-50 w-full"><Header /></div>
                  <APIIntegrationPanel />
                </div>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
