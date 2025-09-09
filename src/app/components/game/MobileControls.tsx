import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { GameState, GameActions } from "@/types/tetris";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Square,
  Zap,
  Pause,
  Play,
} from "lucide-react";

interface MobileControlsProps {
  gameState: GameState;
  gameActions: GameActions;
  isMobile: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  gameState,
  gameActions,
  isMobile,
}) => {
  const { t } = useTranslation();
  const { gameOver, isPaused, canHold } = gameState;
  const {
    moveLeft,
    moveRight,
    moveDown,
    rotate,
    holdPiece,
    hardDrop,
    togglePause,
    resetGame,
  } = gameActions;

  if (!isMobile) return null;

  // Estilos dos botões
  const controlButtonClass =
    "w-12 h-12 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white rounded-lg flex items-center justify-center shadow-md active:scale-95 transition-all duration-150 select-none touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed";

  // Handler para prevenir scroll e zoom em dispositivos móveis
  const handleTouchStart = (e: React.TouchEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    if (!gameOver) {
      action();
      // Adiciona feedback háptico se disponível
      if ("vibrate" in navigator) {
        navigator.vibrate(50);
      }
    }
  };

  return (
    <>
      {/* Controles principais - Layout reorganizado */}
      <div className="fixed bottom-2 left-2 right-2 z-50">
        <div className="bg-black/85 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex justify-between items-center">
            {/* Controles de movimento (esquerda) - Formato de CRUZ */}
            <div className="flex flex-col items-center">
              <div className="relative w-36 h-36">
                {/* Botão CIMA (Rotacionar) */}
                <button
                  className={`${controlButtonClass} absolute top-0 left-1/2 transform -translate-x-1/2`}
                  onTouchStart={(e) => handleTouchStart(e, rotate)}
                  onClick={rotate}
                  disabled={gameOver || isPaused}
                  aria-label={t("mobile.rotate")}
                >
                  <RotateCw className="w-5 h-5" />
                </button>

                {/* Botão ESQUERDA */}
                <button
                  className={`${controlButtonClass} absolute left-0 top-1/2 transform -translate-y-1/2`}
                  onTouchStart={(e) => handleTouchStart(e, moveLeft)}
                  onClick={moveLeft}
                  disabled={gameOver || isPaused}
                  aria-label={t("mobile.left")}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Botão DIREITA */}
                <button
                  className={`${controlButtonClass} absolute right-0 top-1/2 transform -translate-y-1/2`}
                  onTouchStart={(e) => handleTouchStart(e, moveRight)}
                  onClick={moveRight}
                  disabled={gameOver || isPaused}
                  aria-label={t("mobile.right")}
                >
                  <ArrowRight className="w-5 h-5" />
                </button>

                {/* Botão BAIXO */}
                <button
                  className={`${controlButtonClass} absolute bottom-0 left-1/2 transform -translate-x-1/2`}
                  onTouchStart={(e) => handleTouchStart(e, moveDown)}
                  onClick={moveDown}
                  disabled={gameOver || isPaused}
                  aria-label={t("mobile.down")}
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
              </div>
              <div className="text-white text-xs text-center opacity-70 font-medium mt-2">
                Movimentos
              </div>
            </div>

            {/* Controles centrais - Pause e Reset */}
            <div className="flex flex-col gap-3 items-center">
              <Button
                onClick={togglePause}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 w-14 h-14 touch-manipulation p-0 rounded-full"
                disabled={gameOver}
              >
                {isPaused ? (
                  <Play className="w-6 h-6" />
                ) : (
                  <Pause className="w-6 h-6" />
                )}
              </Button>
              <Button
                onClick={resetGame}
                size="sm"
                className="bg-red-600 hover:bg-red-700 active:bg-red-800 w-14 h-14 text-lg touch-manipulation font-bold p-0 rounded-full"
              >
                R
              </Button>
              <div className="text-white text-xs text-center opacity-70 font-medium">
                Sistema
              </div>
            </div>

            {/* Controles de ação (direita) - Layout diagonal */}
            <div className="flex flex-col items-center">
              <div className="relative w-36 h-36">
                {/* Botão HOLD (superior esquerdo diagonal) */}
                <button
                  className={`${controlButtonClass} bg-purple-600 hover:bg-purple-700 active:bg-purple-800 absolute top-2 left-2`}
                  onTouchStart={(e) => handleTouchStart(e, holdPiece)}
                  onClick={holdPiece}
                  disabled={gameOver || isPaused || !canHold}
                  aria-label={t("mobile.hold")}
                >
                  <Square className="w-5 h-5" />
                </button>

                {/* Botão HARD DROP (inferior direito diagonal) */}
                <button
                  className={`${controlButtonClass} bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 absolute bottom-2 right-2`}
                  onTouchStart={(e) => handleTouchStart(e, hardDrop)}
                  onClick={hardDrop}
                  disabled={gameOver || isPaused}
                  aria-label={t("mobile.drop")}
                >
                  <Zap className="w-5 h-5" />
                </button>
              </div>
              <div className="text-white text-xs text-center opacity-70 font-medium mt-2">
                Ações
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
