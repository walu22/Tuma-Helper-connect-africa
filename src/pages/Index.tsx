import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ServiceCategories from "@/components/ServiceCategories";
import FeaturedServices from "@/components/FeaturedServices";
import Features from "@/components/Features";
import ImprovedCallToAction from "@/components/ImprovedCallToAction";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <ServiceCategories />
      <FeaturedServices />
      <Features />
      <ImprovedCallToAction />
      <Footer />
    </div>
  );
};

export default Index;
