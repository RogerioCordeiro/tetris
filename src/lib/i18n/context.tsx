"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { LanguageCode, defaultLanguage } from "./config";
import ptBrTranslations from "./locales/pt-br.json";
import enTranslations from "./locales/en.json";

// Tipos para as traduções
type TranslationKeys = typeof ptBrTranslations;

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  translations: TranslationKeys;
}

const translations = {
  "pt-br": ptBrTranslations,
  en: enTranslations,
} as const;

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<LanguageCode>(defaultLanguage);

  // Carregar idioma do localStorage na inicialização
  useEffect(() => {
    const savedLanguage = localStorage.getItem(
      "tetris-language"
    ) as LanguageCode;
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Salvar idioma no localStorage quando mudar
  const setLanguage = (newLanguage: LanguageCode) => {
    setLanguageState(newLanguage);
    localStorage.setItem("tetris-language", newLanguage);
  };

  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    translations: translations[language],
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage deve ser usado dentro de um LanguageProvider");
  }
  return context;
}
