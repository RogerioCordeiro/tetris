import React from "react";
import { GameState, ThemeConfig } from "@/types/tetris";
import { useTranslation } from "@/lib/i18n";
import { PieceRenderer } from "./PieceRenderer";

interface HoldPanelProps {
  gameState: GameState;
  isMobile: boolean;
  currentTheme: ThemeConfig;
  getPieceColor: (color: string) => string;
}

export const HoldPanel: React.FC<HoldPanelProps> = ({
  gameState,
  isMobile,
  currentTheme,
  getPieceColor,
}) => {
  const { t } = useTranslation();
  const { heldPiece } = gameState;

  return (
    <div
      className={`p-3 rounded-lg shadow-lg ${isMobile ? "p-2" : ""}`}
      style={{
        backgroundColor: currentTheme.containerBg,
      }}
    >
      <h3
        className={`font-bold text-center ${
          isMobile ? "text-xs mb-1" : "text-sm md:text-lg mb-2"
        }`}
        style={{
          color: currentTheme.blockColor || "#1f2937",
        }}
      >
        {t("game.hold")}
      </h3>
      <div
        className={`rounded flex items-center justify-center ${
          isMobile ? "w-full h-8" : "w-16 h-12 md:w-20 md:h-16"
        }`}
        style={{
          backgroundColor: currentTheme.boardBg,
        }}
      >
        <PieceRenderer
          tetromino={heldPiece}
          size={isMobile ? 8 : 12}
          getPieceColor={getPieceColor}
        />
      </div>
    </div>
  );
};
