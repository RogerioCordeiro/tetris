export const languages = {
    'pt-br': {
        code: 'pt-br',
        name: 'Português (BR)',
        flag: '🇧🇷'
    },
    'en': {
        code: 'en',
        name: 'English',
        flag: '🇺🇸'
    }
} as const;

export type LanguageCode = keyof typeof languages;

export const defaultLanguage: LanguageCode = 'pt-br';

export const availableLanguages = Object.values(languages);
