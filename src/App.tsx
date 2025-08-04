import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Services from "./pages/Services";
import ServicesTest from "./pages/ServicesTest";
import InteriorServices from "./pages/InteriorServices";
import LawnGardenServices from "./pages/LawnGardenServices";
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
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import HowItWorks from "./pages/HowItWorks";
import Help from "./pages/Help";
import About from "./pages/About";
import Safety from "./pages/Safety";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Careers from "./pages/Careers";
import Blog from "./pages/Blog";
import Press from "./pages/Press";
import ProviderResources from "./pages/ProviderResources";
import ProviderLogin from "./pages/ProviderLogin";
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
              <Route path="/profile" element={<Profile />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/help" element={<Help />} />
              <Route path="/about" element={<About />} />
              <Route path="/safety" element={<Safety />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/press" element={<Press />} />
              <Route path="/provider-resources" element={<ProviderResources />} />
              <Route path="/provider-login" element={<ProviderLogin />} />
              <Route path="/training" element={<TrainingCenter />} />
              <Route path="/services-test" element={<ServicesTest />} />
              <Route path="/interior" element={<InteriorServices />} />
              <Route path="/lawn-garden" element={<LawnGardenServices />} />
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
              <Route path="/admin/analytics" element={<AdvancedAnalytics />} />
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
