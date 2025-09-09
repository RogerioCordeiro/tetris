import React from "react";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "@/lib/i18n";
import { ThemeType } from "@/types/tetris";
import { Settings, X, VolumeX, Music, Home, ExternalLink } from "lucide-react";

interface MobileSettingsProps {
  isOpen: boolean;
  onToggle: () => void;
  isMusicPlaying: boolean;
  theme: ThemeType;
  onToggleMusic: () => void;
  onToggleTheme: () => void;
  isMobile: boolean;
}

export const MobileSettings: React.FC<MobileSettingsProps> = ({
  isOpen,
  onToggle,
  isMusicPlaying,
  theme,
  onToggleMusic,
  onToggleTheme,
  isMobile,
}) => {
  const { t } = useTranslation();

  if (!isMobile) return null;

  return (
    <>
      {/* Botão de configurações fixo no topo */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          onClick={onToggle}
          size="sm"
          className="bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg touch-manipulation p-0"
          title="Configurações"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Botão Home fixo no topo direito */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() =>
            window.open("https://rogeriocordeiro.github.io/", "_blank")
          }
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg touch-manipulation p-0"
          title={t("ui.backToGithub")}
        >
          <Home className="w-4 h-4" />
          <ExternalLink className="w-2 h-2 absolute -top-0.5 -right-0.5" />
        </Button>
      </div>

      {/* Modal de configurações */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm border border-white/20 shadow-2xl backdrop-blur-sm">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-bold">Configurações</h2>
              <Button
                onClick={onToggle}
                size="sm"
                className="bg-gray-700 hover:bg-gray-600 active:bg-gray-500 rounded-full w-10 h-10 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Opções */}
            <div className="space-y-6">
              {/* Tema */}
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-white font-medium text-sm">
                    Tema do Jogo
                  </span>
                  <span className="text-gray-400 text-xs">
                    {theme === "classic"
                      ? "Clássico (Verde)"
                      : "Colorido (Moderno)"}
                  </span>
                </div>
                <Button
                  onClick={onToggleTheme}
                  size="sm"
                  className={`w-20 h-12 touch-manipulation transition-colors rounded-lg ${
                    theme === "classic"
                      ? "bg-green-700 hover:bg-green-800 active:bg-green-900"
                      : "bg-purple-600 hover:bg-purple-700 active:bg-purple-800"
                  }`}
                  title={
                    theme === "classic"
                      ? "Mudar para Colorido"
                      : "Mudar para Clássico"
                  }
                >
                  <span className="text-lg">
                    {theme === "classic" ? "🎨" : "📺"}
                  </span>
                </Button>
              </div>

              {/* Música */}
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-white font-medium text-sm">
                    Música de Fundo
                  </span>
                  <span className="text-gray-400 text-xs">
                    {isMusicPlaying ? "Ativada" : "Desativada"}
                  </span>
                </div>
                <Button
                  onClick={onToggleMusic}
                  size="sm"
                  className={`w-20 h-12 touch-manipulation rounded-lg transition-colors ${
                    isMusicPlaying
                      ? "bg-green-600 hover:bg-green-700 active:bg-green-800"
                      : "bg-red-600 hover:bg-red-700 active:bg-red-800"
                  }`}
                >
                  {isMusicPlaying ? (
                    <Music className="w-5 h-5" />
                  ) : (
                    <VolumeX className="w-5 h-5" />
                  )}
                </Button>
              </div>

              {/* Idioma */}
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-white font-medium text-sm">Idioma</span>
                  <span className="text-gray-400 text-xs">
                    Português / English
                  </span>
                </div>
                <div className="flex-shrink-0">
                  <LanguageSelector />
                </div>
              </div>
            </div>

            {/* Informações do jogo */}
            <div className="mt-6 pt-4 border-t border-white/10 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <p className="text-yellow-400 text-sm font-medium">
                  Jogo Pausado
                </p>
              </div>
              <p className="text-gray-400 text-xs">
                Feche as configurações para continuar jogando
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
