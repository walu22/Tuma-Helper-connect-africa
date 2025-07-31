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
import FloatingChatWidget from "@/components/FloatingChatWidget";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const navigate = useNavigate();
  const { user, signOut, loading, isAdmin } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Angi Style */}
          <div className="flex flex-col items-start cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/")}>
            <span className="text-2xl font-bold text-red-500">Tuma Helper</span>
            <span className="text-xs text-gray-500 -mt-1">Find & hire local services</span>
          </div>

          {/* Desktop Navigation - Angi Style */}
          <nav className="hidden md:flex items-center space-x-8">
            <Button variant="ghost" onClick={() => navigate("/services")} className="font-medium text-gray-700 hover:text-gray-900">
              Interior
            </Button>
            <Button variant="ghost" onClick={() => navigate("/services")} className="font-medium text-gray-700 hover:text-gray-900">
              Exterior
            </Button>
            <Button variant="ghost" onClick={() => navigate("/services")} className="font-medium text-gray-700 hover:text-gray-900">
              Lawn & Garden
            </Button>
            <Button variant="ghost" onClick={() => navigate("/services")} className="font-medium text-gray-700 hover:text-gray-900">
              More
            </Button>
            <Button variant="ghost" onClick={() => navigate("/become-provider")} className="font-medium text-gray-700 hover:text-gray-900">
              Join as a Pro
            </Button>
          </nav>

          {/* Auth */}
          <div className="hidden md:flex items-center space-x-3">
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
                <Button variant="ghost" onClick={() => navigate("/auth")} className="font-medium text-gray-700 hover:text-gray-900">
                  Log In
                </Button>
                <Button onClick={() => navigate("/auth")} className="bg-red-500 hover:bg-red-600 text-white px-6 rounded-full font-medium">
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-t shadow-lg z-50">
            <div className="flex flex-col px-4 py-6 space-y-4">
              <Button 
                variant="ghost" 
                className="justify-start py-3 px-3 rounded-lg hover:bg-muted/50" 
                onClick={() => {
                  navigate("/services");
                  setIsMenuOpen(false);
                }}
              >
                {t('nav.services')}
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start py-3 px-3 rounded-lg hover:bg-muted/50" 
                onClick={() => {
                  navigate("/how-it-works");
                  setIsMenuOpen(false);
                }}
              >
                {t('nav.how_it_works')}
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start py-3 px-3 rounded-lg hover:bg-muted/50" 
                onClick={() => {
                  navigate("/become-provider");
                  setIsMenuOpen(false);
                }}
              >
                Become a Provider
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start py-3 px-3 rounded-lg hover:bg-muted/50" 
                onClick={() => {
                  navigate("/help");
                  setIsMenuOpen(false);
                }}
              >
                {t('nav.help')}
              </Button>
              
              <div className="pt-4 border-t border-border/50 space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <CitySelector 
                    selectedCityId={selectedCityId} 
                    onCityChange={setSelectedCityId}
                  />
                  <LanguageSelector />
                </div>
                
                {user ? (
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground px-3 py-2 bg-muted/30 rounded-lg">
                      Signed in as {user.email}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start py-3"
                      onClick={() => {
                        navigate("/profile");
                        setIsMenuOpen(false);
                      }}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start py-3"
                      onClick={() => {
                        navigate("/bookings");
                        setIsMenuOpen(false);
                      }}
                    >
                      My Bookings
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start py-3"
                      onClick={() => {
                        navigate("/favorites");
                        setIsMenuOpen(false);
                      }}
                    >
                      Favorites
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start py-3 text-red-600 hover:text-red-700 hover:bg-red-50/50"
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full py-3"
                      onClick={() => {
                        navigate("/auth");
                        setIsMenuOpen(false);
                      }}
                    >
                      Sign In
                    </Button>
                    <Button 
                      className="btn-hero w-full py-3"
                      onClick={() => {
                        navigate("/auth");
                        setIsMenuOpen(false);
                      }}
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Floating Chat Widget */}
      <FloatingChatWidget />
    </header>
  );
};

export default Header;