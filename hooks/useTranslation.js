import { useRouter } from 'next/router';
import en from '../locales/en.json';
import th from '../locales/th.json';

const translations = { en, th };

export default function useTranslation(namespace) {
    const router = useRouter();
    const locale = router.locale || 'en';
    const dictionary = translations[locale] || translations.en;
    
    // Return a function to get deeply nested keys, or just return the namespace object
    const t = namespace ? (dictionary[namespace] || {}) : dictionary;
    
    return { t, locale, router };
}
