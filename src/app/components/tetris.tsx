"use client";

import { useState } from "react";
import { Inter } from "next/font/google";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n";
import { getAssetPath } from "@/constants/tetris";

// Hooks
import { useTheme, useGameLogic, useGameControls, useMobile } from "@/hooks";

// Components
import {
  GameBoard,
  GameStats,
  HoldPanel,
  NextPiecesPanel,
  MobileControls,
  MobileSettings,
  GameControls,
  GameAudio,
} from "./game";

const inter = Inter({ subsets: ["latin"] });

export default function Tetris() {
  const { t } = useTranslation();
  const { isMobile } = useMobile();
  const { theme, currentTheme, toggleTheme, getPieceColor } = useTheme();
  const { gameState, gameActions } = useGameLogic(getPieceColor);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Configurar controles do teclado
  useGameControls(gameState, gameActions);

  const toggleMusic = () => {
    setIsMusicPlaying(!isMusicPlaying);
  };

  const toggleSettings = () => {
    const newIsOpen = !isSettingsOpen;
    setIsSettingsOpen(newIsOpen);

    // Pausar/despausar o jogo automaticamente
    if (newIsOpen && !gameState.isPaused && !gameState.gameOver) {
      gameActions.togglePause(); // Pausa quando abre configurações
    } else if (!newIsOpen && gameState.isPaused && !gameState.gameOver) {
      gameActions.togglePause(); // Despausa quando fecha configurações
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-start transition-all duration-500 ${inter.className}`}
      style={{
        backgroundColor: theme === "classic" ? "#8B8D7A" : "#e5e7eb",
      }}
    >
      {/* Container principal centralizado */}
      <div
        className={`flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 py-2 ${
          isMobile ? "pb-24" : "min-h-screen py-4"
        }`}
      >
        {/* Logo */}
        <div className={`${isMobile ? "mb-2" : "mb-4 md:mb-8"}`}>
          <Image
            src={getAssetPath("/tetris-logo.png")}
            alt="Tetris Logo"
            width={isMobile ? 200 : 300}
            height={isMobile ? 53 : 80}
            priority
            className="drop-shadow-lg"
          />
        </div>

        {/* Layout principal - responsive */}
        <div
          className={`flex ${
            isMobile ? "flex-row gap-2" : "flex-row"
          } gap-4 md:gap-8 items-start justify-center w-full`}
        >
          {isMobile ? (
            <>
              {/* Layout Mobile - GameBoard à esquerda */}
              <div className="flex flex-col items-center flex-shrink-0">
                <GameBoard
                  gameState={gameState}
                  isMobile={isMobile}
                  currentTheme={currentTheme}
                  getPieceColor={getPieceColor}
                />

                {/* Status do jogo */}
                <div className="h-6 flex items-center justify-center mt-2">
                  {gameState.gameOver && (
                    <div className="text-sm font-bold text-red-600">
                      {t("game.gameOver")}
                    </div>
                  )}
                  {gameState.isPaused && !gameState.gameOver && (
                    <div className="text-sm font-bold text-blue-600">
                      {t("game.paused")}
                    </div>
                  )}
                </div>
              </div>

              {/* Painéis de informação à direita em coluna */}
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <HoldPanel
                  gameState={gameState}
                  isMobile={isMobile}
                  currentTheme={currentTheme}
                  getPieceColor={getPieceColor}
                />

                <GameStats
                  gameState={gameState}
                  currentTheme={currentTheme}
                  isMobile={isMobile}
                />

                <NextPiecesPanel
                  gameState={gameState}
                  isMobile={isMobile}
                  currentTheme={currentTheme}
                  getPieceColor={getPieceColor}
                />
              </div>
            </>
          ) : (
            <>
              {/* Layout Desktop - Layout original */}
              {/* Painel esquerdo - Hold e Stats (desktop) */}
              <div className="flex flex-col gap-4">
                <HoldPanel
                  gameState={gameState}
                  isMobile={isMobile}
                  currentTheme={currentTheme}
                  getPieceColor={getPieceColor}
                />
                <GameStats
                  gameState={gameState}
                  currentTheme={currentTheme}
                  isMobile={isMobile}
                />
              </div>

              {/* Tabuleiro central */}
              <div className="flex flex-col items-center">
                <GameBoard
                  gameState={gameState}
                  isMobile={isMobile}
                  currentTheme={currentTheme}
                  getPieceColor={getPieceColor}
                />

                {/* Status do jogo */}
                <div className="h-8 md:h-12 flex items-center justify-center mt-2 md:mt-4">
                  {gameState.gameOver && (
                    <div className="text-lg md:text-2xl font-bold text-red-600">
                      {t("game.gameOver")}
                    </div>
                  )}
                  {gameState.isPaused && !gameState.gameOver && (
                    <div className="text-lg md:text-2xl font-bold text-blue-600">
                      {t("game.paused")}
                    </div>
                  )}
                </div>
              </div>

              {/* Painel direito - Next pieces (desktop) */}
              <NextPiecesPanel
                gameState={gameState}
                isMobile={isMobile}
                currentTheme={currentTheme}
                getPieceColor={getPieceColor}
              />
            </>
          )}
        </div>
      </div>

      {/* Controles */}
      <GameControls
        gameState={gameState}
        gameActions={gameActions}
        isMobile={isMobile}
        isMusicPlaying={isMusicPlaying}
        theme={theme}
        currentTheme={currentTheme}
        onToggleMusic={toggleMusic}
        onToggleTheme={toggleTheme}
      />

      <MobileControls
        gameState={gameState}
        gameActions={gameActions}
        isMobile={isMobile}
      />

      <MobileSettings
        isOpen={isSettingsOpen}
        onToggle={toggleSettings}
        isMusicPlaying={isMusicPlaying}
        theme={theme}
        onToggleMusic={toggleMusic}
        onToggleTheme={toggleTheme}
        isMobile={isMobile}
      />

      {/* Áudio */}
      <GameAudio gameState={gameState} isMusicPlaying={isMusicPlaying} />
    </div>
  );
}
