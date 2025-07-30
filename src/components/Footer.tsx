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
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

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
    <footer className="bg-muted/30 border-t">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.slice(0, 5).map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-muted-foreground hover:text-foreground transition-colors text-left text-sm"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.slice(0, 5).map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-muted-foreground hover:text-foreground transition-colors text-left text-sm"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.slice(0, 5).map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-muted-foreground hover:text-foreground transition-colors text-left text-sm"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">For Providers</h4>
            <ul className="space-y-3">
              {footerLinks.providers.slice(0, 4).map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-muted-foreground hover:text-foreground transition-colors text-left text-sm"
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
      <div className="border-t">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-muted-foreground text-sm">
              © 2024 Tuma Helper. All rights reserved.
            </div>
            <div className="flex space-x-4">
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Facebook className="w-5 h-5" />
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;