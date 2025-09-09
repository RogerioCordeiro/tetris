import React from "react";
import { TetrominoType } from "@/types/tetris";

interface PieceRendererProps {
  tetromino: TetrominoType | null;
  size?: number;
  getPieceColor: (color: string) => string;
}

export const PieceRenderer: React.FC<PieceRendererProps> = ({
  tetromino,
  size = 20,
  getPieceColor,
}) => {
  if (!tetromino) return null;

  const pieceColor = getPieceColor(tetromino.color);

  return (
    <div
      className="grid gap-0.5"
      style={{
        gridTemplateColumns: `repeat(${tetromino.shape[0].length}, 1fr)`,
      }}
    >
      {tetromino.shape.map((row: number[], y: number) =>
        row.map((cell: number, x: number) => (
          <div
            key={`${y}-${x}`}
            className={`${cell ? "" : "bg-transparent"}`}
            style={{
              width: size,
              height: size,
              backgroundColor: cell ? pieceColor : "transparent",
              border: cell ? "1px solid rgba(0,0,0,0.2)" : "none",
            }}
          />
        ))
      )}
    </div>
  );
};
