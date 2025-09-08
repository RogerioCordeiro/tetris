"use client";

import { useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { useLanguage, availableLanguages, type LanguageCode } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = availableLanguages.find(
    (lang) => lang.code === language
  );

  const handleLanguageChange = (languageCode: string) => {
    setLanguage(languageCode as LanguageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="sm"
        className="bg-gray-800 hover:bg-gray-700 flex items-center gap-2"
      >
        <Globe className="w-4 h-4" />
        <span className="text-lg">{currentLanguage?.flag}</span>
        <span className="hidden sm:inline">{currentLanguage?.name}</span>
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <>
          {/* Overlay para fechar o dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown menu */}
          <div className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-lg border z-20 min-w-[160px]">
            {availableLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 first:rounded-t-lg last:rounded-b-lg ${
                  lang.code === language ? "bg-gray-50 font-semibold" : ""
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="text-gray-800">{lang.name}</span>
                {lang.code === language && (
                  <span className="ml-auto text-blue-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
