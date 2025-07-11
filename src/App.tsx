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
import { AuthProvider } from "./hooks/useAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/bookings/:id" element={<BookingDetail />} />
            <Route path="/become-provider" element={<BecomeProvider />} />
            <Route path="/kyc-verification" element={<KYCVerification />} />
            <Route path="/provider/dashboard" element={<ProviderDashboard />} />
            <Route path="/provider/profile" element={<ProviderProfile />} />
            <Route path="/provider/training" element={<TrainingCenter />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
