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