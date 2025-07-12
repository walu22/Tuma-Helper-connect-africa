import React, { createContext, useContext, useState, useEffect } from 'react';

interface Translations {
  [key: string]: {
    [language: string]: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.home': {
    en: 'Home',
    af: 'Tuis',
    de: 'Startseite',
    oshiwambo: 'Eumbo',
  },
  'nav.services': {
    en: 'Services',
    af: 'Dienste',
    de: 'Dienstleistungen',
    oshiwambo: 'Omaangelo',
  },
  'nav.how_it_works': {
    en: 'How it Works',
    af: 'Hoe dit werk',
    de: 'Wie es funktioniert',
    oshiwambo: 'Omwa itanga',
  },
  'nav.help': {
    en: 'Help',
    af: 'Hulp',
    de: 'Hilfe',
    oshiwambo: 'Oulongeli',
  },
  'nav.login': {
    en: 'Login',
    af: 'Aanmeld',
    de: 'Anmelden',
    oshiwambo: 'Ingila',
  },

  // Hero Section
  'hero.title': {
    en: 'One Tap, Every Service',
    af: 'Een Tik, Elke Diens',
    de: 'Ein Klick, Jeder Service',
    oshiwambo: 'Otu kufa, okaangelo kehe',
  },
  'hero.subtitle': {
    en: 'Connect with verified local service providers in Windhoek and across Namibia. From plumbing to house cleaning, we\'ve got you covered.',
    af: 'Verbind met geverifieerde plaaslike diensverskaffers in Windhoek en regoor Namibië. Van loodgieterswerk tot huisreiniging, ons het jou gedek.',
    de: 'Verbinden Sie sich mit verifizierten lokalen Dienstleistern in Windhoek und ganz Namibia. Von Klempnerarbeiten bis zur Hausreinigung, wir haben Sie abgedeckt.',
    oshiwambo: 'Longitha nomulongithiwa sha pamwe nombateko yomunona muWindhoek nokwiNamibia. Kuza momulimo gwamena nokukonga ongombo, oto ku pangela.',
  },
  'hero.search_placeholder': {
    en: 'What service do you need?',
    af: 'Watter diens benodig jy?',
    de: 'Welchen Service benötigen Sie?',
    oshiwambo: 'Ngiini okaangelo oshi li wongala?',
  },
  'hero.find_services': {
    en: 'Find Services Now',
    af: 'Vind Dienste Nou',
    de: 'Services Jetzt Finden',
    oshiwambo: 'Mangulula Omaangelo Eshi',
  },
  'hero.popular_searches': {
    en: 'Popular searches:',
    af: 'Gewilde soektogte:',
    de: 'Beliebte Suchen:',
    oshiwambo: 'Omangululo yehupilwa:',
  },
  'hero.rating': {
    en: '4.8/5 Rating',
    af: '4.8/5 Gradering',
    de: '4.8/5 Bewertung',
    oshiwambo: '4.8/5 Ehupilo',
  },
  'hero.providers': {
    en: '500+ Providers',
    af: '500+ Verskaffers',
    de: '500+ Anbieter',
    oshiwambo: '500+ Ovatumbeli',
  },
  'hero.customers': {
    en: '10k+ Customers',
    af: '10k+ Klante',
    de: '10k+ Kunden',
    oshiwambo: '10k+ Ovatuni',
  },

  // Service Categories
  'services.browse': {
    en: 'Browse Our Services',
    af: 'Blaai Deur Ons Dienste',
    de: 'Unsere Services Durchsuchen',
    oshiwambo: 'Talitha Omaangelo Yetu',
  },
  'services.browse_desc': {
    en: 'Discover trusted professionals for every service you need. All providers are verified and rated by our community.',
    af: 'Ontdek vertroude professionele persone vir elke diens wat jy nodig het. Alle verskaffers word geverifieer en gegradeer deur ons gemeenskap.',
    de: 'Entdecken Sie vertrauenswürdige Fachleute für jeden Service, den Sie benötigen. Alle Anbieter werden von unserer Community verifiziert und bewertet.',
    oshiwambo: 'Ndiila avakonakoni avene vamutethekele nkene kaangelo kehe nka li wongala. Ovatumbeli vehe ova li longwa nokuhupilwa kovetu.',
  },
  'services.text': {
    en: 'services',
    af: 'dienste',
    de: 'Dienstleistungen',
    oshiwambo: 'omaangelo',
  },
  'services.verified': {
    en: 'Verified',
    af: 'Geverifieer',
    de: 'Verifiziert',
    oshiwambo: 'Peuwe',
  },
  'services.view': {
    en: 'View Services',
    af: 'Bekyk Dienste',
    de: 'Services Anzeigen',
    oshiwambo: 'Talitha Omaangelo',
  },
  'services.view_all': {
    en: 'View All Services',
    af: 'Bekyk Alle Dienste',
    de: 'Alle Services Anzeigen',
    oshiwambo: 'Talitha Omaangelo Yoshe',
  },

  // Features
  'features.why_choose': {
    en: 'Why Choose Tuma Helper?',
    af: 'Waarom Kies Tuma Helper?',
    de: 'Warum Tuma Helper Wählen?',
    oshiwambo: 'Ngiini Okutula Tuma Helper?',
  },
  'features.why_choose_desc': {
    en: 'We\'re committed to connecting you with the best service providers in Namibia. Here\'s what makes us different.',
    af: 'Ons is toegewyd om jou te verbind met die beste diensverskaffers in Namibië. Hier is wat ons anders maak.',
    de: 'Wir sind darauf bedacht, Sie mit den besten Dienstleistern in Namibia zu verbinden. Hier ist, was uns anders macht.',
    oshiwambo: 'Oto kwathelelwa kokukuhameleka novatumbeli vamaangelo avameme muNamibia. Ehi ngiike otu tetekela.',
  },
  'features.verified_providers': {
    en: 'Verified Providers',
    af: 'Geverifieerde Verskaffers',
    de: 'Verifizierte Anbieter',
    oshiwambo: 'Ovatumbeli Vapeuwe',
  },
  'features.verified_providers_desc': {
    en: 'All service providers undergo thorough background checks and verification processes',
    af: 'Alle diensverskaffers ondergaan deeglike agtergrondondersoeke en verifikasie prosesse',
    de: 'Alle Dienstleister durchlaufen gründliche Hintergrundprüfungen und Verifizierungsprozesse',
    oshiwambo: 'Ovatumbeli vehe ova kwata omautangulo yonduhu nokukahupila',
  },
  'features.real_time_booking': {
    en: 'Real-time Booking',
    af: 'Realtyd Bespreking',
    de: 'Echtzeit-Buchung',
    oshiwambo: 'Epateko lyEhika',
  },
  'features.real_time_booking_desc': {
    en: 'Instant booking with real-time availability. Schedule services that fit your timeline',
    af: 'Kitsklaarbesprekings met realtyd beskikbaarheid. Skeduleer dienste wat by jou tydlyn pas',
    de: 'Sofortige Buchung mit Echtzeit-Verfügbarkeit. Planen Sie Services, die zu Ihrem Zeitplan passen',
    oshiwambo: 'Epateko lyehika nomenya gwehika. Panga omaangelo anke ka li noyetu',
  },
  'features.secure_payments': {
    en: 'Secure Payments',
    af: 'Veilige Betalings',
    de: 'Sichere Zahlungen',
    oshiwambo: 'Omalipo Yaimbililwa',
  },
  'features.secure_payments_desc': {
    en: 'Safe and secure payment processing with multiple payment options available',
    af: 'Veilige en sekere betalingsverwerking met verskeie betalingsopsies beskikbaar',
    de: 'Sichere und geschützte Zahlungsabwicklung mit mehreren verfügbaren Zahlungsoptionen',
    oshiwambo: 'Omalipo yaimbililwa noyamukwatathano ovalakulangwa',
  },
  'features.quality_assurance': {
    en: 'Quality Assurance',
    af: 'Kwaliteitsversekering',
    de: 'Qualitätssicherung',
    oshiwambo: 'Ehupilo lyEkwatathano',
  },
  'features.quality_assurance_desc': {
    en: 'Rate and review services to maintain high quality standards across the platform',
    af: 'Gradeer en resenseer dienste om hoë kwaliteitstandaarde oor die platform te handhaaf',
    de: 'Bewerten und überprüfen Sie Services, um hohe Qualitätsstandards auf der Plattform aufrechtzuerhalten',
    oshiwambo: 'Hupila nokuyuva omaangelo okukumbathela omiteko yashole muplatform',
  },
  'features.easy_to_use': {
    en: 'Easy to Use',
    af: 'Maklik om te Gebruik',
    de: 'Einfach zu Verwenden',
    oshiwambo: 'Hali Kukwata',
  },
  'features.easy_to_use_desc': {
    en: 'Simple and intuitive interface designed for everyone to use effortlessly',
    af: 'Eenvoudige en intuïtiewe koppelvlak ontwerp vir almal om moeiteloos te gebruik',
    de: 'Einfache und intuitive Benutzeroberfläche, die für jeden mühelos zu verwenden ist',
    oshiwambo: 'Ombonongalo yehali noyememeno yokutula wanahe va ka kwate nafyakulwasha',
  },
  'features.community_driven': {
    en: 'Community Driven',
    af: 'Gemeenskapgedrewe',
    de: 'Gemeinschaftsgetrieben',
    oshiwambo: 'Pakwatathano',
  },
  'features.community_driven_desc': {
    en: 'Built by locals, for locals. Supporting the Namibian service community',
    af: 'Gebou deur plaaslike mense, vir plaaslike mense. Ondersteuning van die Namibiese diensgemeenskap',
    de: 'Von Einheimischen für Einheimische gebaut. Unterstützung der namibischen Dienstgemeinschaft',
    oshiwambo: 'Pakululwa kovetu, nkene kovetu. Thika okwatathano kwaangelo shaNamibia',
  },
  'features.trusted_by_thousands': {
    en: 'Trusted by Thousands',
    af: 'Vertrou deur Duisende',
    de: 'Von Tausenden Vertraut',
    oshiwambo: 'Kutetekela Kovanaantu',
  },
  'features.trusted_desc': {
    en: 'Join the growing community of satisfied customers who trust Tuma Helper for all their needs.',
    af: 'Sluit aan by die groeiende gemeenskap van tevrede klante wat Tuma Helper vir al hul behoeftes vertrou.',
    de: 'Treten Sie der wachsenden Gemeinschaft zufriedener Kunden bei, die Tuma Helper für alle ihre Bedürfnisse vertrauen.',
    oshiwambo: 'Lombwa mokwatathano okukula kwavatuni avahalelwa ava tetekela Tuma Helper nkene momapumbeko gawo oshe.',
  },
  'features.happy_customers': {
    en: 'Happy Customers',
    af: 'Gelukkige Klante',
    de: 'Zufriedene Kunden',
    oshiwambo: 'Ovatuni Vahalelwa',
  },
  'features.services_completed': {
    en: 'Services Completed',
    af: 'Dienste Voltooi',
    de: 'Abgeschlossene Services',
    oshiwambo: 'Omaangelo Kakolongwa',
  },
  'features.average_rating': {
    en: 'Average Rating',
    af: 'Gemiddelde Gradering',
    de: 'Durchschnittliche Bewertung',
    oshiwambo: 'Ehupilo lyeKukatera',
  },

  // Call to Action
  'cta.ready_to_start': {
    en: 'Ready to Get Started?',
    af: 'Gereed om te Begin?',
    de: 'Bereit Anzufangen?',
    oshiwambo: 'Wa li pumbwalwa okutengula?',
  },
  'cta.ready_to_start_desc': {
    en: 'Join thousands of satisfied customers who trust Tuma Helper for all their home and business needs. Get started in just a few clicks.',
    af: 'Sluit aan by duisende tevrede klante wat Tuma Helper vir al hul huis- en sakebehoeftes vertrou. Begin in net \'n paar klieke.',
    de: 'Treten Sie Tausenden zufriedener Kunden bei, die Tuma Helper für alle ihre Heim- und Geschäftsbedürfnisse vertrauen. Beginnen Sie mit nur wenigen Klicks.',
    oshiwambo: 'Lombwa kovanaantu ava li halelwa ava tetekela Tuma Helper momapumbeko gawo goshe gongombo nogogakalunga. Tengula nofyakulafu.',
  },
  'cta.quality_guaranteed': {
    en: 'Quality Guaranteed',
    af: 'Kwaliteit Gewaarborg',
    de: 'Qualität Garantiert',
    oshiwambo: 'Ehupilo lya Tumbulukila',
  },
  'cta.easy_mobile_booking': {
    en: 'Easy Mobile Booking',
    af: 'Maklike Mobiele Bespreking',
    de: 'Einfache Mobile Buchung',
    oshiwambo: 'Epateko lyaMobile Hali',
  },
  'cta.get_started_today': {
    en: 'Get Started Today',
    af: 'Begin Vandag',
    de: 'Heute Starten',
    oshiwambo: 'Tengula Poo',
  },
  'cta.browse_services': {
    en: 'Browse Services',
    af: 'Blaai Dienste',
    de: 'Services Durchsuchen',
    oshiwambo: 'Talitha Omaangelo',
  },
  'cta.provider_question': {
    en: 'Are You a Service Provider?',
    af: 'Is Jy \'n Diensverskaffer?',
    de: 'Sind Sie ein Dienstleister?',
    oshiwambo: 'Owa li Mukwashilyangi waKaangelo?',
  },
  'cta.provider_desc': {
    en: 'Join our platform and grow your business. Connect with customers in your area and take your service business to the next level.',
    af: 'Sluit aan by ons platform en laat jou besigheid groei. Verbind met klante in jou area en neem jou diensbesigheid na die volgende vlak.',
    de: 'Treten Sie unserer Plattform bei und lassen Sie Ihr Unternehmen wachsen. Verbinden Sie sich mit Kunden in Ihrer Nähe und bringen Sie Ihr Dienstleistungsunternehmen auf die nächste Stufe.',
    oshiwambo: 'Lombwa moplatform yetu nokukula ombishi yoye. Hameleka novatuni vomutaleni yoye nokukwatha ombishi yokaangelo komutenya gwongula.',
  },
  'cta.flexible_hours': {
    en: 'Flexible working hours',
    af: 'Buigsame werktye',
    de: 'Flexible Arbeitszeiten',
    oshiwambo: 'Omayoho yolimo gakutula',
  },
  'cta.competitive_earnings': {
    en: 'Competitive earnings',
    af: 'Mededingende verdienste',
    de: 'Wettbewerbsfähige Verdienste',
    oshiwambo: 'Omakwato gamaulongwa',
  },
  'cta.marketing_support': {
    en: 'Marketing support',
    af: 'Bemarkingsondersteuning',
    de: 'Marketing-Unterstützung',
    oshiwambo: 'Ondjokosho yaMarketing',
  },
  'cta.training_provided': {
    en: 'Training provided',
    af: 'Opleiding verskaf',
    de: 'Schulung bereitgestellt',
    oshiwambo: 'Okutongwa kou li',
  },
  'cta.become_provider': {
    en: 'Become a Provider',
    af: 'Word \'n Verskaffer',
    de: 'Anbieter Werden',
    oshiwambo: 'Pumbwa Omukwashilyangeli',
  },

  // Footer
  'footer.stay_updated': {
    en: 'Stay Updated',
    af: 'Bly Op Hoogte',
    de: 'Bleiben Sie Informiert',
    oshiwambo: 'Kala Noshipewa',
  },
  'footer.stay_updated_desc': {
    en: 'Get the latest updates on new services, special offers, and tips for your home.',
    af: 'Kry die nuutste opdaterings oor nuwe dienste, spesiale aanbiedinge, en wenke vir jou huis.',
    de: 'Erhalten Sie die neuesten Updates zu neuen Services, Sonderangeboten und Tipps für Ihr Zuhause.',
    oshiwambo: 'Kwata oshipewa shashike shomaangelo kashike, omakumo yamalavi, nomautangulo gongombo yoye.',
  },
  'footer.email_placeholder': {
    en: 'Enter your email address',
    af: 'Voer jou e-posadres in',
    de: 'Geben Sie Ihre E-Mail-Adresse ein',
    oshiwambo: 'Nyanditha email yoye',
  },
  'footer.subscribe': {
    en: 'Subscribe',
    af: 'Inteken',
    de: 'Abonnieren',
    oshiwambo: 'Lombwa',
  },
  'footer.tagline': {
    en: 'One tap, every service',
    af: 'Een tik, elke diens',
    de: 'Ein Klick, jeder Service',
    oshiwambo: 'Otu kufa, okaangelo nke',
  },
  'footer.description': {
    en: 'Connecting Namibians with trusted service providers. Making home services accessible, reliable, and affordable for everyone.',
    af: 'Verbind Namibiërs met vertroude diensverskaffers. Maak huisdienste toeganklik, betroubaar en bekostigbaar vir almal.',
    de: 'Namibier mit vertrauenswürdigen Dienstleistern verbinden. Hausdienste für alle zugänglich, zuverlässig und erschwinglich machen.',
    oshiwambo: 'Hameleka ovaNamibia novatumbeli avene va tetekela. Panga omaangelo yongombo oya li noyakulafwa, yakaleka, noyashigwana novehe.',
  },
  'footer.copyright': {
    en: '© 2024 Tuma Helper. All rights reserved.',
    af: '© 2024 Tuma Helper. Alle regte voorbehou.',
    de: '© 2024 Tuma Helper. Alle Rechte vorbehalten.',
    oshiwambo: '© 2024 Tuma Helper. Omafululwakalo goshe gakongilwa.',
  },

  // Common buttons
  'button.search': {
    en: 'Search',
    af: 'Soek',
    de: 'Suchen',
    oshiwambo: 'Londja',
  },
  'button.book_now': {
    en: 'Book Now',
    af: 'Bespreek Nou',
    de: 'Jetzt buchen',
    oshiwambo: 'Longitha',
  },
  'button.view_details': {
    en: 'View Details',
    af: 'Sien Besonderhede',
    de: 'Details anzeigen',
    oshiwambo: 'Pula omauyelele',
  },
  // Location and cities
  'city.windhoek': {
    en: 'Windhoek',
    af: 'Windhoek',
    de: 'Windhoek',
    oshiwambo: 'Windhoek',
  },
  'city.walvis_bay': {
    en: 'Walvis Bay',
    af: 'Walvisbaai',
    de: 'Walfischbucht',
    oshiwambo: 'Walvis Bay',
  },
  'label.select_city': {
    en: 'Select City',
    af: 'Kies Stad',
    de: 'Stadt auswählen',
    oshiwambo: 'Longitha edolobha',
  },
  // Service categories
  'category.home_services': {
    en: 'Home Services',
    af: 'Tuisdienste',
    de: 'Hausdienstleistungen',
    oshiwambo: 'Omaangelo gomumbo',
  },
  'category.personal_care': {
    en: 'Personal Care',
    af: 'Persoonlike Sorg',
    de: 'Körperpflege',
    oshiwambo: 'Omunhu gwamuhe',
  },
  // Account types
  'account.individual': {
    en: 'Individual Account',
    af: 'Individuele Rekening',
    de: 'Privatkonto',
    oshiwambo: 'Omuntu gumwe',
  },
  'account.corporate': {
    en: 'Corporate Account',
    af: 'Korporatiewe Rekening',
    de: 'Firmenkonto',
    oshiwambo: 'Okambati',
  },
  'account.franchise': {
    en: 'Franchise Account',
    af: 'Franchise Rekening',
    de: 'Franchise-Konto',
    oshiwambo: 'Franchise',
  },
};

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  availableLanguages: { code: string; name: string; flag: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const availableLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'oshiwambo', name: 'Oshiwambo', flag: '🇳🇦' },
];

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<string>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || translations[key]?.['en'] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        t,
        availableLanguages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};