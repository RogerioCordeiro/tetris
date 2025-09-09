import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameState, ThemeConfig } from "@/types/tetris";
import { BOARD_WIDTH, BOARD_HEIGHT, BUFFER_ROWS } from "@/constants/tetris";

interface GameBoardProps {
  gameState: GameState;
  isMobile: boolean;
  currentTheme: ThemeConfig;
  getPieceColor: (color: string) => string;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  isMobile,
  currentTheme,
  getPieceColor,
}) => {
  const { board, currentPiece, completedRows } = gameState;

  const renderCell = (x: number, y: number): string | null => {
    const actualY = y + BUFFER_ROWS;

    if (
      currentPiece &&
      currentPiece.tetromino.shape[actualY - currentPiece.y] &&
      currentPiece.tetromino.shape[actualY - currentPiece.y][x - currentPiece.x]
    ) {
      return getPieceColor(currentPiece.tetromino.color);
    }

    const boardCell = board[actualY][x];
    if (boardCell && boardCell !== 0) {
      return getPieceColor(boardCell as string);
    }

    return null;
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className="p-2 md:p-4 rounded-lg shadow-lg"
        style={{
          backgroundColor: currentTheme.containerBg,
        }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
            width: isMobile ? `${BOARD_WIDTH * 20}px` : `${BOARD_WIDTH * 25}px`,
            height: isMobile
              ? `${BOARD_HEIGHT * 20}px`
              : `${BOARD_HEIGHT * 25}px`,
            border: `1px solid ${currentTheme.boardBorder}`,
            backgroundColor: currentTheme.boardBg,
          }}
        >
          {Array.from({ length: BOARD_HEIGHT }, (_, y) =>
            Array.from({ length: BOARD_WIDTH }, (_, x) => (
              <AnimatePresence key={`${y}-${x}`}>
                <motion.div
                  initial={false}
                  animate={{
                    opacity: completedRows.includes(y) ? 0 : 1,
                    scale: completedRows.includes(y) ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  className={isMobile ? "w-5 h-5" : "w-6 h-6"}
                  style={{
                    border: `1px solid ${currentTheme.boardBorder}`,
                    backgroundColor: renderCell(x, y) || currentTheme.emptyCell,
                  }}
                />
              </AnimatePresence>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
