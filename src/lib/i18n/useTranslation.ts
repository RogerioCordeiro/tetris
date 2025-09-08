import { useLanguage } from './context';

// Tipo para navegação aninhada nas traduções
type NestedKeyOf<ObjectType extends object> = {
    [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

type TranslationKey = NestedKeyOf<typeof import('./locales/pt-br.json')>;

// Função para acessar propriedades aninhadas usando dot notation
function getNestedProperty(obj: Record<string, unknown>, path: string): string {
    return path.split('.').reduce((current: unknown, key: string) => {
        if (current && typeof current === 'object' && key in current) {
            return (current as Record<string, unknown>)[key];
        }
        return undefined;
    }, obj) as string || path;
}

export function useTranslation() {
    const { translations } = useLanguage();

    const t = (key: TranslationKey): string => {
        return getNestedProperty(translations, key);
    };

    return { t };
}
