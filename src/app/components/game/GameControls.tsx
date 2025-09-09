import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "@/lib/i18n";
import { GameState, GameActions, ThemeType, ThemeConfig } from "@/types/tetris";
import { getAssetPath } from "@/constants/tetris";
import { Play, Pause, Music, VolumeX, Home } from "lucide-react";

interface GameControlsProps {
  gameState: GameState;
  gameActions: GameActions;
  isMobile: boolean;
  isMusicPlaying: boolean;
  theme: ThemeType;
  currentTheme: ThemeConfig;
  onToggleMusic: () => void;
  onToggleTheme: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  gameActions,
  isMobile,
  isMusicPlaying,
  theme,
  currentTheme,
  onToggleMusic,
  onToggleTheme,
}) => {
  const { t } = useTranslation();
  const { gameOver, isPaused } = gameState;
  const { togglePause, resetGame } = gameActions;

  if (isMobile) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 flex justify-between items-end">
      {/* Painel de controles do jogo */}
      <div
        className="p-4 rounded-lg shadow-lg"
        style={{
          backgroundColor: currentTheme.containerBg,
        }}
      >
        <h3
          className="text-lg font-bold mb-3 text-center"
          style={{
            color: currentTheme.blockColor || "#1f2937",
          }}
        >
          {t("controls.title")}
        </h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div
              className="px-2 py-1 rounded text-xs font-mono min-w-[60px] flex items-center justify-center"
              style={{
                backgroundColor: currentTheme.boardBg,
              }}
            >
              <Image
                src={getAssetPath("/arrow-keys.png")}
                alt="Arrow Keys"
                width={40}
                height={30}
                className="object-contain"
              />
            </div>
            <span
              style={{
                color: currentTheme.blockColor || "#374151",
              }}
            >
              {t("controls.move")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="px-2 py-1 rounded text-xs font-mono min-w-[60px] text-center font-bold"
              style={{
                backgroundColor: currentTheme.boardBg,
                color: currentTheme.blockColor || "#1f2937",
              }}
            >
              SPACE
            </div>
            <span
              style={{
                color: currentTheme.blockColor || "#374151",
              }}
            >
              {t("controls.hardDrop")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="px-2 py-1 rounded text-xs font-mono min-w-[60px] text-center font-bold"
              style={{
                backgroundColor: currentTheme.boardBg,
                color: currentTheme.blockColor || "#1f2937",
              }}
            >
              H
            </div>
            <span
              style={{
                color: currentTheme.blockColor || "#374151",
              }}
            >
              {t("controls.holdPiece")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="px-2 py-1 rounded text-xs font-mono min-w-[60px] text-center font-bold"
              style={{
                backgroundColor: currentTheme.boardBg,
                color: currentTheme.blockColor || "#1f2937",
              }}
            >
              P
            </div>
            <span
              style={{
                color: currentTheme.blockColor || "#374151",
              }}
            >
              {t("controls.pause")}
            </span>
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex gap-2">
        <LanguageSelector />
        <Button
          onClick={onToggleTheme}
          size="sm"
          className={`transition-colors ${
            theme === "classic"
              ? "bg-green-700 hover:bg-green-800"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
          title={theme === "classic" ? "Modo Colorido" : "Modo Clássico"}
        >
          <span className="mr-1">{theme === "classic" ? "🎨" : "📺"}</span>
          <span className="hidden lg:inline">
            {theme === "classic" ? "Colorido" : "Clássico"}
          </span>
        </Button>
        <Button
          onClick={() =>
            window.open("https://rogeriocordeiro.github.io/", "_blank")
          }
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1"
        >
          <Home className="w-4 h-4" />
          <span className="hidden lg:inline">{t("ui.home")}</span>
        </Button>
        <Button
          onClick={togglePause}
          size="sm"
          className="bg-gray-800 hover:bg-gray-700"
        >
          {isPaused ? (
            <Play className="w-4 h-4" />
          ) : (
            <Pause className="w-4 h-4" />
          )}
        </Button>
        <Button
          onClick={onToggleMusic}
          size="sm"
          className="bg-gray-800 hover:bg-gray-700"
        >
          {isMusicPlaying ? (
            <Music className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </Button>
        <Button
          onClick={resetGame}
          size="sm"
          className="bg-gray-800 hover:bg-gray-700"
        >
          {gameOver ? t("game.playAgain") : t("game.reset")}
        </Button>
      </div>
    </div>
  );
};
