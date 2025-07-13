import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ServicesTest = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Services Test Page</h1>
        <p>This is a test page to verify the services route is working.</p>
        <p>If you can see this, the routing is working correctly.</p>
      </div>
      <Footer />
    </div>
  );
};

export default ServicesTest;