import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Star, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const CallToAction = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-gradient-to-r from-primary via-primary-glow to-accent text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                {t('cta.ready_to_start')}
              </h2>
              <p className="text-xl mb-8 text-white/90 leading-relaxed">
                {t('cta.ready_to_start_desc')}
              </p>

              {/* Benefits */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <Shield className="w-6 h-6 text-white" />
                  <span className="text-white/90">100% {t('services.verified')} {t('hero.providers').replace('500+ ', '')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="w-6 h-6 text-white" />
                  <span className="text-white/90">{t('cta.quality_guaranteed')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-6 h-6 text-white" />
                  <span className="text-white/90">{t('cta.easy_mobile_booking')}</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90 font-semibold"
                  onClick={() => navigate("/register")}
                >
                  {t('cta.get_started_today')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10"
                  onClick={() => navigate("/services")}
                >
                  {t('cta.browse_services')}
                </Button>
              </div>
            </div>

            {/* Right Side - Provider CTA */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-4">{t('cta.provider_question')}</h3>
              <p className="text-white/90 mb-6 leading-relaxed">
                {t('cta.provider_desc')}
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2 text-sm text-white/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  <span>{t('cta.flexible_hours')}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-white/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  <span>{t('cta.competitive_earnings')}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-white/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  <span>{t('cta.marketing_support')}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-white/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  <span>{t('cta.training_provided')}</span>
                </div>
              </div>

              <Button 
                className="w-full bg-accent hover:bg-accent/90 text-white font-semibold"
                onClick={() => navigate("/become-provider")}
              >
                {t('cta.become_provider')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;