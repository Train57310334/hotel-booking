import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en.json';
import th from '../locales/th.json';

const dictionaries = { en, th };

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Check local storage for saved language preference on mount
        const savedLanguage = localStorage.getItem('languagePreference');
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'th')) {
            setLanguage(savedLanguage);
        }
        setMounted(true);
    }, []);

    const changeLanguage = (lang) => {
        if (lang === 'en' || lang === 'th') {
            setLanguage(lang);
            localStorage.setItem('languagePreference', lang);
        }
    };

    const t = (key) => {
        const dict = dictionaries[language];
        return dict[key] || key; // Return the key itself if translation is missing
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
            {!mounted ? (
                <div style={{ visibility: 'hidden' }}>{children}</div>
            ) : (
                children
            )}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
