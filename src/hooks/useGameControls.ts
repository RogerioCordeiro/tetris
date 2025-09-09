import { useEffect } from "react";
import { GameActions, GameState } from "@/types/tetris";

export const useGameControls = (gameState: GameState, gameActions: GameActions) => {
    const { gameOver } = gameState;
    const { moveLeft, moveRight, moveDown, rotate, hardDrop, togglePause, holdPiece } = gameActions;

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (gameOver) return;
            switch (e.key) {
                case "ArrowLeft":
                    moveLeft();
                    break;
                case "ArrowRight":
                    moveRight();
                    break;
                case "ArrowDown":
                    moveDown();
                    break;
                case "ArrowUp":
                    rotate();
                    break;
                case " ":
                    e.preventDefault();
                    hardDrop();
                    break;
                case "p":
                case "P":
                    togglePause();
                    break;
                case "h":
                case "H":
                    holdPiece();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [moveLeft, moveRight, moveDown, rotate, gameOver, holdPiece, hardDrop, togglePause]);
};
