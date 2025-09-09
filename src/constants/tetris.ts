import { TetrominoType, ThemeConfig } from "@/types/tetris";

// Dimensões do tabuleiro
export const BOARD_WIDTH = 15;
export const BOARD_HEIGHT = 20;
export const BUFFER_ROWS = 4;
export const TOTAL_BOARD_HEIGHT = BOARD_HEIGHT + BUFFER_ROWS;

// Configurações do jogo
export const INITIAL_DROP_TIME = 800;
export const SPEED_INCREASE_FACTOR = 0.8;

// Definições de temas
export const THEMES: Record<"colorful" | "classic", ThemeConfig> = {
    colorful: {
        boardBg: "#f3f4f6", // gray-100
        boardBorder: "#e5e7eb", // gray-200
        emptyCell: "#f3f4f6", // gray-100
        containerBg: "#e5e7eb", // gray-200
    },
    classic: {
        boardBg: "#9CA894", // Game Boy verde-amarelado
        boardBorder: "#8B8D7A", // Tom mais escuro para bordas
        emptyCell: "#9CA894", // Mesmo tom do fundo
        containerBg: "#B8C5A6", // Tom mais claro para contraste
        blockColor: "#2D3319", // Verde muito escuro, quase preto
    },
} as const;

// Definições de peças
export const TETROMINOS: Record<string, TetrominoType> = {
    A: {
        shape: [[1]],
        color: "#22c55e", // green-500
    },
    I: { shape: [[1, 1, 1, 1]], color: "#06b6d4" }, // cyan-500
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
        ],
        color: "#3b82f6", // blue-500
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
        ],
        color: "#f97316", // orange-500
    },
    O: {
        shape: [
            [1, 1],
            [1, 1],
        ],
        color: "#eab308", // yellow-500
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
        ],
        color: "#22c55e", // green-500
    },
    S2: {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
        ],
        color: "#22c55e", // green-500
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
        ],
        color: "#a855f7", // purple-500
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
        ],
        color: "#ef4444", // red-500
    },
    U: {
        shape: [
            [1, 0, 1],
            [1, 1, 1],
        ],
        color: "#ec4899", // pink-500
    },
} as const;

// Cores vibrantes disponíveis para randomização
export const AVAILABLE_COLORS = [
    "#ef4444", // red-500
    "#f97316", // orange-500
    "#eab308", // yellow-500
    "#22c55e", // green-500
    "#06b6d4", // cyan-500
    "#3b82f6", // blue-500
    "#8b5cf6", // violet-500
    "#a855f7", // purple-500
    "#ec4899", // pink-500
    "#f43f5e", // rose-500
    "#84cc16", // lime-500
    "#10b981", // emerald-500
    "#14b8a6", // teal-500
    "#6366f1", // indigo-500
    "#d946ef", // fuchsia-500
    "#f59e0b", // amber-500
];

// Função auxiliar para obter caminhos de assets
export const getAssetPath = (path: string) => {
    const basePath = process.env.NODE_ENV === "production" ? "/tetris" : "";
    return `${basePath}${path}`;
};

// Função para criar tabuleiro vazio
export const createEmptyBoard = () =>
    Array.from({ length: TOTAL_BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));
