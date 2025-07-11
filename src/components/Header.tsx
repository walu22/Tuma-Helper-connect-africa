import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X, MapPin, User, LogOut, Building2, Store, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSelector } from "@/components/LanguageSelector";
import { CitySelector } from "@/components/CitySelector";
import { useLanguage } from "@/contexts/LanguageContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const navigate = useNavigate();
  const { user, signOut, loading, isAdmin } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/")}>
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Tuma Helper</h1>
              <p className="text-xs text-muted-foreground">One tap, every service</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Button variant="ghost" onClick={() => navigate("/services")}>
              {t('nav.services')}
            </Button>
            <Button variant="ghost" onClick={() => navigate("/how-it-works")}>
              {t('nav.how_it_works')}
            </Button>
            <Button variant="ghost" onClick={() => navigate("/become-provider")}>
              Become a Provider
            </Button>
            <Button variant="ghost" onClick={() => navigate("/help")}>
              {t('nav.help')}
            </Button>
          </nav>

          {/* Location, Language & Auth */}
          <div className="hidden md:flex items-center space-x-4">
            <CitySelector 
              selectedCityId={selectedCityId} 
              onCityChange={setSelectedCityId}
            />
            <LanguageSelector />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/bookings")}>
                    My Bookings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/favorites")}>
                    Favorites
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/messages")}>
                    Messages
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/corporate-dashboard")}>
                    <Building2 className="w-4 h-4 mr-2" />
                    Corporate Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/franchise-dashboard")}>
                    <Store className="w-4 h-4 mr-2" />
                    Franchise Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/api-management")}>
                    <Key className="w-4 h-4 mr-2" />
                    API Management
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/admin/dashboard")}>
                        Admin Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/admin/analytics")}>
                        Advanced Analytics
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button className="btn-hero" onClick={() => navigate("/auth")}>
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Button variant="ghost" className="justify-start" onClick={() => navigate("/services")}>
                Services
              </Button>
              <Button variant="ghost" className="justify-start" onClick={() => navigate("/how-it-works")}>
                How it Works
              </Button>
              <Button variant="ghost" className="justify-start" onClick={() => navigate("/become-provider")}>
                Become a Provider
              </Button>
              <Button variant="ghost" className="justify-start" onClick={() => navigate("/help")}>
                Help
              </Button>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground px-4">
                <MapPin className="w-4 h-4" />
                <span>Windhoek, Namibia</span>
              </div>
              {user ? (
                <div className="px-4 space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Signed in as {user.email}
                  </div>
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/profile")}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/bookings")}>
                    My Bookings
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-destructive" onClick={signOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2 px-4">
                  <Button variant="outline" className="flex-1" onClick={() => navigate("/auth")}>
                    Sign In
                  </Button>
                  <Button className="btn-hero flex-1" onClick={() => navigate("/auth")}>
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;