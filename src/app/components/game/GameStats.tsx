import React from "react";
import { GameState, ThemeConfig } from "@/types/tetris";
import { useTranslation } from "@/lib/i18n";

interface GameStatsProps {
  gameState: GameState;
  currentTheme: ThemeConfig;
  isMobile?: boolean;
}

export const GameStats: React.FC<GameStatsProps> = ({
  gameState,
  currentTheme,
  isMobile = false,
}) => {
  const { t } = useTranslation();
  const { highScore, level, score, lines } = gameState;

  return (
    <div
      className={`rounded-lg shadow-lg ${isMobile ? "p-2" : "p-3"}`}
      style={{
        backgroundColor: currentTheme.containerBg,
      }}
    >
      <div className={isMobile ? "space-y-1" : "space-y-2"}>
        <div>
          <h4
            className={`font-bold ${
              isMobile ? "text-xs" : "text-xs md:text-sm"
            }`}
            style={{
              color: currentTheme.blockColor || "#1f2937",
            }}
          >
            {t("game.highscore")}
          </h4>
          <div
            className={`rounded text-center ${
              isMobile ? "p-1 text-xs" : "p-1 text-xs md:text-sm"
            }`}
            style={{
              backgroundColor: currentTheme.boardBg,
              color: currentTheme.blockColor || "black",
            }}
          >
            {highScore}
          </div>
        </div>
        <div>
          <h4
            className={`font-bold ${
              isMobile ? "text-xs" : "text-xs md:text-sm"
            }`}
            style={{
              color: currentTheme.blockColor || "#1f2937",
            }}
          >
            {t("game.level")}
          </h4>
          <div
            className={`rounded text-center ${
              isMobile ? "p-1 text-xs" : "p-1 text-xs md:text-sm"
            }`}
            style={{
              backgroundColor: currentTheme.boardBg,
              color: currentTheme.blockColor || "black",
            }}
          >
            {level}
          </div>
        </div>
        <div>
          <h4
            className={`font-bold ${
              isMobile ? "text-xs" : "text-xs md:text-sm"
            }`}
            style={{
              color: currentTheme.blockColor || "#1f2937",
            }}
          >
            {t("game.score")}
          </h4>
          <div
            className={`rounded text-center ${
              isMobile ? "p-1 text-xs" : "p-1 text-xs md:text-sm"
            }`}
            style={{
              backgroundColor: currentTheme.boardBg,
              color: currentTheme.blockColor || "black",
            }}
          >
            {score}
          </div>
        </div>
        <div>
          <h4
            className={`font-bold ${
              isMobile ? "text-xs" : "text-xs md:text-sm"
            }`}
            style={{
              color: currentTheme.blockColor || "#1f2937",
            }}
          >
            {t("game.lines")}
          </h4>
          <div
            className={`rounded text-center ${
              isMobile ? "p-1 text-xs" : "p-1 text-xs md:text-sm"
            }`}
            style={{
              backgroundColor: currentTheme.boardBg,
              color: currentTheme.blockColor || "black",
            }}
          >
            {lines}
          </div>
        </div>
      </div>
    </div>
  );
};
