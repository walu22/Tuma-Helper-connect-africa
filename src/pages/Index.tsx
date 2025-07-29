import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ServiceCategories from "@/components/ServiceCategories";
import FeaturedServices from "@/components/FeaturedServices";
import Features from "@/components/Features";
import ImprovedCallToAction from "@/components/ImprovedCallToAction";
import Footer from "@/components/Footer";
import PersonalizedDashboard from "@/components/PersonalizedDashboard";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();

  // Show personalized dashboard for logged-in users
  if (user) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <PersonalizedDashboard />
        </div>
        <Footer />
      </div>
    );
  }

  // Show marketing homepage for visitors
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <ServiceCategories />
      <FeaturedServices />
      <Footer />
    </div>
  );
};

export default Index;
