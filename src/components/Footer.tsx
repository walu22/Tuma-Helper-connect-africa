import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  const footerLinks = {
    services: [
      { name: "House Cleaning", path: "/services/house-cleaning" },
      { name: "Plumbing", path: "/services/plumbing" },
      { name: "Electrical", path: "/services/electrical" },
      { name: "Gardening", path: "/services/gardening" },
      { name: "Beauty & Wellness", path: "/services/beauty-wellness" },
      { name: "Car Services", path: "/services/car-services" }
    ],
    company: [
      { name: "About Us", path: "/about" },
      { name: "How it Works", path: "/how-it-works" },
      { name: "Careers", path: "/careers" },
      { name: "Press", path: "/press" },
      { name: "Blog", path: "/blog" }
    ],
    support: [
      { name: "Help Center", path: "/help" },
      { name: "Safety", path: "/safety" },
      { name: "Contact Us", path: "/contact" },
      { name: "Terms of Service", path: "/terms" },
      { name: "Privacy Policy", path: "/privacy" }
    ],
    providers: [
      { name: "Become a Provider", path: "/become-provider" },
      { name: "Provider Resources", path: "/provider-resources" },
      { name: "Provider Login", path: "/provider-login" },
      { name: "Training", path: "/training" }
    ]
  };

  return (
    <footer className="bg-foreground text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-4">Stay Updated</h3>
            <p className="text-white/80 mb-8 text-lg">
              Get the latest updates on new services, special offers, and tips for your home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
              <Button className="bg-primary hover:bg-primary-glow">
                Subscribe
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-glow rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Tuma Helper</h1>
                <p className="text-sm text-white/70">One tap, every service</p>
              </div>
            </div>
            <p className="text-white/80 mb-6 leading-relaxed">
              Connecting Namibians with trusted service providers. Making home services accessible, reliable, and affordable for everyone.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-white/80">
                <MapPin className="w-5 h-5 text-primary" />
                <span>Windhoek, Namibia</span>
              </div>
              <div className="flex items-center space-x-3 text-white/80">
                <Phone className="w-5 h-5 text-primary" />
                <span>+264 61 123 4567</span>
              </div>
              <div className="flex items-center space-x-3 text-white/80">
                <Mail className="w-5 h-5 text-primary" />
                <span>hello@tumahelper.na</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-white/80 hover:text-white transition-colors text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-white/80 hover:text-white transition-colors text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-white/80 hover:text-white transition-colors text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h4 className="text-lg font-semibold mb-6">For Providers</h4>
            <ul className="space-y-3">
              {footerLinks.providers.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-white/80 hover:text-white transition-colors text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-white/80">
              © 2024 Tuma Helper. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <button className="text-white/80 hover:text-white transition-colors">
                <Facebook className="w-6 h-6" />
              </button>
              <button className="text-white/80 hover:text-white transition-colors">
                <Twitter className="w-6 h-6" />
              </button>
              <button className="text-white/80 hover:text-white transition-colors">
                <Instagram className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;