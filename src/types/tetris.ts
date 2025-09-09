export type TetrominoType = {
    shape: number[][];
    color: string;
};

export interface Piece {
    x: number;
    y: number;
    tetromino: TetrominoType;
}

export type BoardType = (string | number)[][];

export interface GameState {
    board: BoardType;
    currentPiece: Piece | null;
    nextPieces: TetrominoType[];
    heldPiece: TetrominoType | null;
    canHold: boolean;
    score: number;
    highScore: number;
    lines: number;
    gameOver: boolean;
    isPaused: boolean;
    dropTime: number;
    level: number;
    completedRows: number[];
}

export interface GameActions {
    moveLeft: () => void;
    moveRight: () => void;
    moveDown: () => void;
    rotate: () => void;
    hardDrop: () => void;
    holdPiece: () => void;
    togglePause: () => void;
    resetGame: () => void;
}

export interface ThemeConfig {
    boardBg: string;
    boardBorder: string;
    emptyCell: string;
    containerBg: string;
    blockColor?: string;
}

export type ThemeType = "colorful" | "classic";
