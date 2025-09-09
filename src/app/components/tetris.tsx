"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Inter } from "next/font/google";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "@/lib/i18n";
import {
  Play,
  Pause,
  Music,
  VolumeX,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  RotateCw,
  Zap,
  Square,
  Home,
  ExternalLink,
} from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

// Helper function to get correct asset paths for GitHub Pages
const getAssetPath = (path: string) => {
  // Em desenvolvimento, usar caminhos diretos. Em produção, usar /tetris
  const basePath = process.env.NODE_ENV === "production" ? "/tetris" : "";
  return `${basePath}${path}`;
};

// Definições de temas
const THEMES = {
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

const TETROMINOS = {
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
const AVAILABLE_COLORS = [
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

type TetrominoType = {
  shape: number[][];
  color: string;
};

interface Piece {
  x: number;
  y: number;
  tetromino: TetrominoType;
}

type BoardType = (string | number)[][];

const BOARD_WIDTH = 15;
const BOARD_HEIGHT = 20;
const BUFFER_ROWS = 4;
const TOTAL_BOARD_HEIGHT = BOARD_HEIGHT + BUFFER_ROWS;
const INITIAL_DROP_TIME = 800;
const SPEED_INCREASE_FACTOR = 0.8;
const createEmptyBoard = () =>
  Array.from({ length: TOTAL_BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));

export default function Tetris() {
  const { t } = useTranslation();
  const [board, setBoard] = useState<BoardType>(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPieces, setNextPieces] = useState<TetrominoType[]>([]);
  const [heldPiece, setHeldPiece] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState(true);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [dropTime, setDropTime] = useState(INITIAL_DROP_TIME);
  const [level, setLevel] = useState(1);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const [completedRows, setCompletedRows] = useState<number[]>([]);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const gameStateRef = useRef({
    board,
    currentPiece,
    gameOver,
    isPaused,
  });

  // Detectar dispositivo móvel
  const [isMobile, setIsMobile] = useState(false);

  // State para armazenar as cores aleatórias das peças para esta partida
  const [pieceColors, setPieceColors] = useState<{ [key: string]: string }>({});

  // State para controlar o tema visual (colorful ou classic)
  const [theme, setTheme] = useState<"colorful" | "classic">("colorful");

  // Função para obter a cor da peça baseada no tema
  const getPieceColor = useCallback(
    (originalColor: string) => {
      if (theme === "classic") {
        return THEMES.classic.blockColor;
      }
      return originalColor;
    },
    [theme]
  );

  // Função para gerar cores aleatórias para cada tipo de peça
  const generateRandomColors = useCallback(() => {
    const pieceTypes = Object.keys(TETROMINOS) as (keyof typeof TETROMINOS)[];
    const shuffledColors = [...AVAILABLE_COLORS].sort(
      () => Math.random() - 0.5
    );
    const colorMap: { [key: string]: string } = {};

    pieceTypes.forEach((piece, index) => {
      colorMap[piece] = shuffledColors[index % shuffledColors.length];
    });

    return colorMap;
  }, []);

  // Função para gerar uma peça aleatória com cor randomizada
  const randomTetromino = useCallback((): TetrominoType => {
    const keys = Object.keys(TETROMINOS) as (keyof typeof TETROMINOS)[];
    const randKey = keys[Math.floor(Math.random() * keys.length)];
    const tetromino = TETROMINOS[randKey];
    const originalColor = pieceColors[randKey] || tetromino.color;

    return {
      shape: tetromino.shape.map((row) => [...row]),
      color: getPieceColor(originalColor), // Aplica o tema à cor
    };
  }, [pieceColors, getPieceColor]);

  // Função para gerar próximas peças
  const generateNextPieces = useCallback(
    (count = 3) => {
      return Array.from({ length: count }, () => randomTetromino());
    },
    [randomTetromino]
  );

  // Inicializar cores aleatórias quando o componente montar
  useEffect(() => {
    const initialColors = generateRandomColors();
    setPieceColors(initialColors);
  }, [generateRandomColors]);

  // Inicializar nextPieces após as cores serem definidas
  useEffect(() => {
    if (Object.keys(pieceColors).length > 0 && nextPieces.length === 0) {
      setNextPieces(generateNextPieces());
    }
  }, [pieceColors, generateNextPieces, nextPieces.length]);

  useEffect(() => {
    const checkIsMobile = () => {
      const mobile =
        window.innerWidth <= 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      setIsMobile(mobile);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    gameStateRef.current = { board, currentPiece, gameOver, isPaused };
  }, [board, currentPiece, gameOver, isPaused]);

  const checkCollision = useCallback(
    (
      x: number,
      y: number,
      shape: number[][],
      currentBoard: BoardType = board
    ) => {
      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (shape[row][col] !== 0) {
            const newX = x + col;
            const newY = y + row;

            if (newX < 0 || newX >= BOARD_WIDTH) {
              return true;
            }

            if (newY >= TOTAL_BOARD_HEIGHT) {
              return true;
            }

            if (newY >= 0 && currentBoard[newY][newX] !== 0) {
              return true;
            }
          }
        }
      }
      return false;
    },
    [board]
  );

  const isValidMove = useCallback(
    (
      x: number,
      y: number,
      shape: number[][],
      currentBoard: BoardType = board
    ) => {
      return !checkCollision(x, y, shape, currentBoard);
    },
    [checkCollision, board]
  );

  const checkGameOver = useCallback((currentBoard: BoardType) => {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (currentBoard[BUFFER_ROWS][x] !== 0) {
        return true;
      }
    }
    return false;
  }, []);

  const spawnNewPiece = useCallback(() => {
    setNextPieces((prevNextPieces) => {
      // Se não há próximas peças, gerar novas
      if (prevNextPieces.length === 0) {
        const newPieces = generateNextPieces();
        const newPiece = {
          x: Math.floor(BOARD_WIDTH / 2) - 1,
          y: 0,
          tetromino: newPieces[0],
        };

        if (checkCollision(newPiece.x, newPiece.y, newPiece.tetromino.shape)) {
          setGameOver(true);
        } else {
          setCurrentPiece(newPiece);
        }

        return newPieces.slice(1);
      }

      const newPiece = {
        x: Math.floor(BOARD_WIDTH / 2) - 1,
        y: 0,
        tetromino: prevNextPieces[0],
      };

      const updatedNextPieces = [...prevNextPieces.slice(1), randomTetromino()];

      if (checkCollision(newPiece.x, newPiece.y, newPiece.tetromino.shape)) {
        setGameOver(true);
      } else {
        setCurrentPiece(newPiece);
      }

      return updatedNextPieces;
    });
  }, [checkCollision, randomTetromino, generateNextPieces]);

  const clearLines = useCallback(
    (newBoard: BoardType) => {
      const linesCleared: number[] = [];
      const updatedBoard: BoardType = [];

      for (let i = 0; i < TOTAL_BOARD_HEIGHT; i++) {
        const row = newBoard[i];
        if (
          i >= BUFFER_ROWS &&
          row.every((cell: string | number) => cell !== 0)
        ) {
          linesCleared.push(i);
        } else {
          updatedBoard.push([...row]);
        }
      }

      if (linesCleared.length > 0) {
        setCompletedRows(linesCleared.map((row) => row - BUFFER_ROWS));
        setTimeout(() => {
          while (updatedBoard.length < TOTAL_BOARD_HEIGHT) {
            updatedBoard.unshift(Array(BOARD_WIDTH).fill(0));
          }
          setBoard(updatedBoard);
          setCompletedRows([]);

          const newScore = score + linesCleared.length * 100;
          const newLines = lines + linesCleared.length;
          setScore(newScore);
          setLines(newLines);
          setHighScore((prev) => Math.max(prev, newScore));

          if (Math.floor(newLines / 10) > level - 1) {
            setLevel((prev) => prev + 1);
            setDropTime((prev) => Math.max(prev * SPEED_INCREASE_FACTOR, 50));
          }
        }, 500);
      }
    },
    [score, lines, level]
  );

  const holdPiece = useCallback(() => {
    if (!canHold || !currentPiece) return;

    if (heldPiece) {
      const newPiece = {
        x: Math.floor(BOARD_WIDTH / 2) - 1,
        y: 0,
        tetromino: heldPiece,
      };

      if (!isValidMove(newPiece.x, newPiece.y, newPiece.tetromino.shape)) {
        setGameOver(true);
        return;
      }

      setHeldPiece(currentPiece.tetromino);
      setCurrentPiece(newPiece);
    } else {
      setHeldPiece(currentPiece.tetromino);
      spawnNewPiece();
    }
    setCanHold(false);
  }, [currentPiece, heldPiece, canHold, isValidMove, spawnNewPiece]);

  const moveLeft = useCallback(() => {
    if (
      currentPiece &&
      !isPaused &&
      isValidMove(
        currentPiece.x - 1,
        currentPiece.y,
        currentPiece.tetromino.shape
      )
    ) {
      setCurrentPiece((prev) => (prev ? { ...prev, x: prev.x - 1 } : null));
    }
  }, [currentPiece, isPaused, isValidMove]);

  const moveRight = useCallback(() => {
    if (
      currentPiece &&
      !isPaused &&
      isValidMove(
        currentPiece.x + 1,
        currentPiece.y,
        currentPiece.tetromino.shape
      )
    ) {
      setCurrentPiece((prev) => (prev ? { ...prev, x: prev.x + 1 } : null));
    }
  }, [currentPiece, isPaused, isValidMove]);

  // Forward declaration for functions used in callbacks
  const placePieceAtPosition = useCallback(
    (piece: Piece) => {
      const newBoard = board.map((row) => [...row]);
      let validPlacement = true;

      piece.tetromino.shape.forEach((row: number[], y: number) => {
        row.forEach((value: number, x: number) => {
          if (value !== 0) {
            const boardY = y + piece.y;
            const boardX = x + piece.x;

            if (
              boardY >= 0 &&
              boardY < TOTAL_BOARD_HEIGHT &&
              boardX >= 0 &&
              boardX < BOARD_WIDTH
            ) {
              if (newBoard[boardY][boardX] === 0) {
                newBoard[boardY][boardX] = piece.tetromino.color;
              } else {
                validPlacement = false;
              }
            } else {
              validPlacement = false;
            }
          }
        });
      });

      if (validPlacement) {
        setBoard(newBoard);
        setCurrentPiece(null);

        if (checkGameOver(newBoard)) {
          setGameOver(true);
          return;
        }

        clearLines(newBoard);
        setCanHold(true);
        spawnNewPiece();
      } else {
        setGameOver(true);
      }
    },
    [board, checkGameOver, clearLines, spawnNewPiece]
  );

  // Declare placePiece first since it's used in moveDown
  const placePiece = useCallback(() => {
    if (!currentPiece) return;
    placePieceAtPosition(currentPiece);
  }, [currentPiece, placePieceAtPosition]);

  const moveDown = useCallback(() => {
    if (!currentPiece || isPaused) return;
    if (
      isValidMove(
        currentPiece.x,
        currentPiece.y + 1,
        currentPiece.tetromino.shape
      )
    ) {
      setCurrentPiece((prev) => (prev ? { ...prev, y: prev.y + 1 } : null));
    } else {
      placePiece();
    }
  }, [currentPiece, isPaused, isValidMove, placePiece]);

  const rotate = useCallback(() => {
    if (!currentPiece || isPaused) return;
    const rotated = currentPiece.tetromino.shape[0].map(
      (_: number, i: number) =>
        currentPiece.tetromino.shape.map((row: number[]) => row[i]).reverse()
    );
    const newX = currentPiece.x;
    const newY = currentPiece.y;

    const wallKickOffsets = [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, -1],
      [-1, -1],
      [1, -1],
    ];

    for (const [offsetX, offsetY] of wallKickOffsets) {
      const testX = newX + offsetX;
      const testY = newY + offsetY;

      if (isValidMove(testX, testY, rotated)) {
        setCurrentPiece((prev) =>
          prev
            ? {
                ...prev,
                x: testX,
                y: testY,
                tetromino: { ...prev.tetromino, shape: rotated },
              }
            : null
        );
        return;
      }
    }
  }, [currentPiece, isPaused, isValidMove]);

  const hardDrop = useCallback(() => {
    if (!currentPiece || isPaused) return;

    let dropY = currentPiece.y;
    while (
      isValidMove(currentPiece.x, dropY + 1, currentPiece.tetromino.shape)
    ) {
      dropY++;
    }

    if (isValidMove(currentPiece.x, dropY, currentPiece.tetromino.shape)) {
      const droppedPiece = { ...currentPiece, y: dropY };
      placePieceAtPosition(droppedPiece);
    }
  }, [currentPiece, isPaused, isValidMove, placePieceAtPosition]);

  const togglePause = useCallback(() => {
    setIsPaused(!isPaused);
  }, [isPaused]);

  useEffect(() => {
    if (!currentPiece && !gameOver) {
      spawnNewPiece();
    }
  }, [currentPiece, gameOver, spawnNewPiece]);

  useEffect(() => {
    let interval = null;

    if (!gameOver && !isPaused) {
      interval = setInterval(() => {
        const {
          currentPiece: piece,
          board: currentBoard,
          gameOver: isGameOver,
          isPaused: paused,
        } = gameStateRef.current;

        if (isGameOver || paused || !piece) return;

        const canMoveDown = !checkCollision(
          piece.x,
          piece.y + 1,
          piece.tetromino.shape,
          currentBoard
        );

        if (canMoveDown) {
          setCurrentPiece((prev) => (prev ? { ...prev, y: prev.y + 1 } : null));
        } else {
          placePieceAtPosition(piece);
        }
      }, dropTime);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [gameOver, isPaused, dropTime, checkCollision, placePieceAtPosition]);

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
  }, [
    moveLeft,
    moveRight,
    moveDown,
    rotate,
    gameOver,
    holdPiece,
    hardDrop,
    togglePause,
  ]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.loop = true;

      if (!gameOver && isMusicPlaying && !isPaused) {
        audioRef.current
          .play()
          .then(() => {
            setAudioInitialized(true);
          })
          .catch((error) => {
            console.error("Audio playback failed:", error);
            // Se falhou por política de autoplay, vai tentar novamente na primeira interação
            if (!audioInitialized && error.name === "NotAllowedError") {
              console.log(
                "Audio autoplay blocked, will try after user interaction"
              );
            }
          });
      } else {
        audioRef.current.pause();
      }
    }
  }, [gameOver, isMusicPlaying, isPaused, audioInitialized]);

  // Efeito para iniciar áudio após primeira interação do usuário
  useEffect(() => {
    const handleFirstUserInteraction = () => {
      if (
        !audioInitialized &&
        audioRef.current &&
        isMusicPlaying &&
        !gameOver &&
        !isPaused
      ) {
        audioRef.current
          .play()
          .then(() => {
            setAudioInitialized(true);
            console.log("Audio initialized after user interaction");
          })
          .catch((error) =>
            console.error("Failed to start audio after interaction:", error)
          );
      }
    };

    if (!audioInitialized) {
      // Eventos que indicam interação do usuário
      const events = ["click", "keydown", "touchstart"];
      events.forEach((event) => {
        document.addEventListener(event, handleFirstUserInteraction, {
          once: true,
        });
      });

      return () => {
        events.forEach((event) => {
          document.removeEventListener(event, handleFirstUserInteraction);
        });
      };
    }
  }, [audioInitialized, isMusicPlaying, gameOver, isPaused]);

  const resetGame = () => {
    // Gerar novas cores aleatórias para nova partida
    const newColors = generateRandomColors();
    setPieceColors(newColors);

    setBoard(createEmptyBoard());
    setCurrentPiece(null);
    setNextPieces([]); // Será regenerado pelo useEffect quando as cores mudarem
    setHeldPiece(null);
    setCanHold(true);
    setScore(0);
    setLines(0);
    setGameOver(false);
    setIsPaused(false);
    setDropTime(INITIAL_DROP_TIME);
    setLevel(1);
    setCompletedRows([]);
  };

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

  const renderPiece = (tetromino: TetrominoType | null, size: number = 20) => {
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

  const toggleMusic = () => {
    setIsMusicPlaying(!isMusicPlaying);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "colorful" ? "classic" : "colorful"));
  };

  // Componente de controles móveis
  const MobileControls = () => {
    if (!isMobile) return null;

    const controlButtonClass =
      "w-16 h-16 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white rounded-lg flex items-center justify-center shadow-lg active:scale-95 transition-all duration-150 select-none touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed";

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
      <div className="fixed bottom-4 left-4 right-4 z-50">
        {/* Botão Home */}
        <div className="flex justify-center mb-4">
          <Button
            onClick={() =>
              window.open("https://rogeriocordeiro.github.io/", "_blank")
            }
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg touch-manipulation"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm font-medium">{t("ui.backToGithub")}</span>
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>

        {/* Controles do jogo */}
        <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
          <div className="flex justify-between items-end">
            {/* Controles de movimento (esquerda) */}
            <div className="flex flex-col items-center gap-3">
              <div className="grid grid-cols-3 gap-2">
                <div></div>
                <button
                  className={controlButtonClass}
                  onTouchStart={(e) => handleTouchStart(e, rotate)}
                  onClick={rotate}
                  disabled={gameOver || isPaused}
                  aria-label={t("mobile.rotate")}
                >
                  <RotateCw className="w-6 h-6" />
                </button>
                <div></div>

                <button
                  className={controlButtonClass}
                  onTouchStart={(e) => handleTouchStart(e, moveLeft)}
                  onClick={moveLeft}
                  disabled={gameOver || isPaused}
                  aria-label={t("mobile.left")}
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <button
                  className={controlButtonClass}
                  onTouchStart={(e) => handleTouchStart(e, moveDown)}
                  onClick={moveDown}
                  disabled={gameOver || isPaused}
                  aria-label={t("mobile.down")}
                >
                  <ArrowDown className="w-6 h-6" />
                </button>
                <button
                  className={controlButtonClass}
                  onTouchStart={(e) => handleTouchStart(e, moveRight)}
                  onClick={moveRight}
                  disabled={gameOver || isPaused}
                  aria-label={t("mobile.right")}
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
              <div className="text-white text-xs text-center opacity-75 font-medium">
                {t("mobile.controls")}
              </div>
            </div>

            {/* Controles de ação (direita) */}
            <div className="flex flex-col gap-2 items-center">
              <div className="flex flex-col gap-2">
                <button
                  className={`${controlButtonClass} bg-purple-600 hover:bg-purple-700 active:bg-purple-800`}
                  onTouchStart={(e) => handleTouchStart(e, holdPiece)}
                  onClick={holdPiece}
                  disabled={gameOver || isPaused || !canHold}
                  aria-label={t("mobile.hold")}
                >
                  <Square className="w-6 h-6" />
                </button>
                <button
                  className={`${controlButtonClass} bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800`}
                  onTouchStart={(e) => handleTouchStart(e, hardDrop)}
                  onClick={hardDrop}
                  disabled={gameOver || isPaused}
                  aria-label={t("mobile.drop")}
                >
                  <Zap className="w-6 h-6" />
                </button>
              </div>

              <div className="flex gap-2 mt-2">
                <Button
                  onClick={togglePause}
                  size="sm"
                  className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600 w-12 h-12 touch-manipulation"
                  disabled={gameOver}
                >
                  {isPaused ? (
                    <Play className="w-4 h-4" />
                  ) : (
                    <Pause className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  onClick={resetGame}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 active:bg-red-800 w-12 h-12 text-xs touch-manipulation font-bold"
                >
                  R
                </Button>
              </div>

              <div className="flex gap-2">
                <LanguageSelector />
                <Button
                  onClick={toggleTheme}
                  size="sm"
                  className={`w-12 h-12 touch-manipulation transition-colors ${
                    theme === "classic"
                      ? "bg-green-700 hover:bg-green-800 active:bg-green-900"
                      : "bg-purple-600 hover:bg-purple-700 active:bg-purple-800"
                  }`}
                  title={
                    theme === "classic" ? "Modo Colorido" : "Modo Clássico"
                  }
                >
                  <span className="text-xs font-bold">
                    {theme === "classic" ? "🎨" : "📺"}
                  </span>
                </Button>
                <Button
                  onClick={toggleMusic}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 active:bg-green-800 w-12 h-12 touch-manipulation"
                >
                  {isMusicPlaying ? (
                    <Music className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-start transition-all duration-500 ${inter.className}`}
      style={{
        backgroundColor: theme === "classic" ? "#8B8D7A" : "#e5e7eb",
      }}
    >
      {/* Container principal centralizado */}
      <div className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 py-4 min-h-screen">
        {/* Logo */}
        <div className="mb-4 md:mb-8">
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
            isMobile ? "flex-col" : "flex-row"
          } gap-4 md:gap-8 items-start justify-center w-full`}
        >
          {/* Painel esquerdo - Hold e Stats (desktop) ou superior (mobile) */}
          <div
            className={`flex ${
              isMobile ? "flex-row justify-between w-full" : "flex-col"
            } gap-4`}
          >
            <div
              className="p-3 rounded-lg shadow-lg"
              style={{
                backgroundColor:
                  theme === "classic" ? THEMES.classic.containerBg : "white",
              }}
            >
              <h3
                className="text-sm md:text-lg font-bold mb-2 text-center"
                style={{
                  color:
                    theme === "classic" ? THEMES.classic.blockColor : "#1f2937",
                }}
              >
                {t("game.hold")}
              </h3>
              <div
                className="w-16 h-12 md:w-20 md:h-16 rounded flex items-center justify-center"
                style={{
                  backgroundColor:
                    theme === "classic" ? THEMES.classic.boardBg : "#f1f5f9",
                }}
              >
                {renderPiece(heldPiece, isMobile ? 12 : 15)}
              </div>
            </div>

            <div
              className="p-3 rounded-lg shadow-lg"
              style={{
                backgroundColor:
                  theme === "classic" ? THEMES.classic.containerBg : "white",
              }}
            >
              <div className="space-y-2">
                <div>
                  <h4
                    className="text-xs md:text-sm font-bold"
                    style={{
                      color:
                        theme === "classic"
                          ? THEMES.classic.blockColor
                          : "#1f2937",
                    }}
                  >
                    {t("game.highscore")}
                  </h4>
                  <div
                    className="p-1 rounded text-center text-xs md:text-sm"
                    style={{
                      backgroundColor:
                        theme === "classic"
                          ? THEMES.classic.boardBg
                          : "#f1f5f9",
                      color:
                        theme === "classic"
                          ? THEMES.classic.blockColor
                          : "black",
                    }}
                  >
                    {highScore}
                  </div>
                </div>
                <div>
                  <h4
                    className="text-xs md:text-sm font-bold"
                    style={{
                      color:
                        theme === "classic"
                          ? THEMES.classic.blockColor
                          : "#1f2937",
                    }}
                  >
                    {t("game.level")}
                  </h4>
                  <div
                    className="p-1 rounded text-center text-xs md:text-sm"
                    style={{
                      backgroundColor:
                        theme === "classic"
                          ? THEMES.classic.boardBg
                          : "#f1f5f9",
                      color:
                        theme === "classic"
                          ? THEMES.classic.blockColor
                          : "black",
                    }}
                  >
                    {level}
                  </div>
                </div>
                <div>
                  <h4
                    className="text-xs md:text-sm font-bold"
                    style={{
                      color:
                        theme === "classic"
                          ? THEMES.classic.blockColor
                          : "#1f2937",
                    }}
                  >
                    {t("game.score")}
                  </h4>
                  <div
                    className="p-1 rounded text-center text-xs md:text-sm"
                    style={{
                      backgroundColor:
                        theme === "classic"
                          ? THEMES.classic.boardBg
                          : "#f1f5f9",
                      color:
                        theme === "classic"
                          ? THEMES.classic.blockColor
                          : "black",
                    }}
                  >
                    {score}
                  </div>
                </div>
                <div>
                  <h4
                    className="text-xs md:text-sm font-bold"
                    style={{
                      color:
                        theme === "classic"
                          ? THEMES.classic.blockColor
                          : "#1f2937",
                    }}
                  >
                    {t("game.lines")}
                  </h4>
                  <div
                    className="p-1 rounded text-center text-xs md:text-sm"
                    style={{
                      backgroundColor:
                        theme === "classic"
                          ? THEMES.classic.boardBg
                          : "#f1f5f9",
                      color:
                        theme === "classic"
                          ? THEMES.classic.blockColor
                          : "black",
                    }}
                  >
                    {lines}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabuleiro central */}
          <div className="flex flex-col items-center">
            <div
              className="p-2 md:p-4 rounded-lg shadow-lg"
              style={{
                backgroundColor:
                  theme === "classic" ? THEMES.classic.containerBg : "white",
              }}
            >
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
                  width: isMobile
                    ? `${BOARD_WIDTH * 20}px`
                    : `${BOARD_WIDTH * 25}px`,
                  height: isMobile
                    ? `${BOARD_HEIGHT * 20}px`
                    : `${BOARD_HEIGHT * 25}px`,
                  border: `1px solid ${
                    theme === "classic" ? THEMES.classic.boardBorder : "#e5e7eb"
                  }`,
                  backgroundColor:
                    theme === "classic" ? THEMES.classic.boardBg : "#f9fafb",
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
                          border: `1px solid ${
                            theme === "classic"
                              ? THEMES.classic.boardBorder
                              : "#e5e7eb"
                          }`,
                          backgroundColor:
                            renderCell(x, y) ||
                            (theme === "classic"
                              ? THEMES.classic.emptyCell
                              : "#f3f4f6"),
                        }}
                      />
                    </AnimatePresence>
                  ))
                )}
              </div>
            </div>

            {/* Status do jogo */}
            <div className="h-8 md:h-12 flex items-center justify-center mt-2 md:mt-4">
              {gameOver && (
                <div className="text-lg md:text-2xl font-bold text-red-600">
                  {t("game.gameOver")}
                </div>
              )}
              {isPaused && !gameOver && (
                <div className="text-lg md:text-2xl font-bold text-blue-600">
                  {t("game.paused")}
                </div>
              )}
            </div>
          </div>

          {/* Painel direito - Next pieces (desktop) ou inferior (mobile) */}
          <div
            className="p-3 rounded-lg shadow-lg"
            style={{
              backgroundColor:
                theme === "classic" ? THEMES.classic.containerBg : "white",
            }}
          >
            <h3
              className="text-sm md:text-lg font-bold mb-2 text-center"
              style={{
                color:
                  theme === "classic" ? THEMES.classic.blockColor : "#1f2937",
              }}
            >
              {t("game.next")}
            </h3>
            <div className={`${isMobile ? "flex gap-3" : "space-y-3"}`}>
              {nextPieces.slice(0, 3).map((piece, index) => (
                <div
                  key={index}
                  className="w-16 h-12 md:w-20 md:h-16 rounded flex items-center justify-center"
                  style={{
                    backgroundColor:
                      theme === "classic" ? THEMES.classic.boardBg : "#f1f5f9",
                  }}
                >
                  {renderPiece(piece, isMobile ? 12 : 15)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Controles desktop (apenas quando não é mobile) */}
      {!isMobile && (
        <div className="fixed bottom-4 left-4 right-4 flex justify-between items-end">
          <div
            className="p-4 rounded-lg shadow-lg"
            style={{
              backgroundColor:
                theme === "classic" ? THEMES.classic.containerBg : "white",
            }}
          >
            <h3
              className="text-lg font-bold mb-3 text-center"
              style={{
                color:
                  theme === "classic" ? THEMES.classic.blockColor : "#1f2937",
              }}
            >
              {t("controls.title")}
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="px-2 py-1 rounded text-xs font-mono min-w-[60px] flex items-center justify-center"
                  style={{
                    backgroundColor:
                      theme === "classic" ? THEMES.classic.boardBg : "#f3f4f6",
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
                    color:
                      theme === "classic"
                        ? THEMES.classic.blockColor
                        : "#374151",
                  }}
                >
                  {t("controls.move")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="px-2 py-1 rounded text-xs font-mono min-w-[60px] text-center font-bold"
                  style={{
                    backgroundColor:
                      theme === "classic" ? THEMES.classic.boardBg : "#f3f4f6",
                    color:
                      theme === "classic"
                        ? THEMES.classic.blockColor
                        : "#1f2937",
                  }}
                >
                  SPACE
                </div>
                <span
                  style={{
                    color:
                      theme === "classic"
                        ? THEMES.classic.blockColor
                        : "#374151",
                  }}
                >
                  {t("controls.hardDrop")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="px-2 py-1 rounded text-xs font-mono min-w-[60px] text-center font-bold"
                  style={{
                    backgroundColor:
                      theme === "classic" ? THEMES.classic.boardBg : "#f3f4f6",
                    color:
                      theme === "classic"
                        ? THEMES.classic.blockColor
                        : "#1f2937",
                  }}
                >
                  H
                </div>
                <span
                  style={{
                    color:
                      theme === "classic"
                        ? THEMES.classic.blockColor
                        : "#374151",
                  }}
                >
                  {t("controls.holdPiece")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="px-2 py-1 rounded text-xs font-mono min-w-[60px] text-center font-bold"
                  style={{
                    backgroundColor:
                      theme === "classic" ? THEMES.classic.boardBg : "#f3f4f6",
                    color:
                      theme === "classic"
                        ? THEMES.classic.blockColor
                        : "#1f2937",
                  }}
                >
                  P
                </div>
                <span
                  style={{
                    color:
                      theme === "classic"
                        ? THEMES.classic.blockColor
                        : "#374151",
                  }}
                >
                  {t("controls.pause")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <LanguageSelector />
            <Button
              onClick={toggleTheme}
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
              onClick={toggleMusic}
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
      )}

      {/* Controles móveis */}
      <MobileControls />

      <audio
        ref={audioRef}
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Tetris-kxnh5j7hpNEcFspAndlU2huV5n6dvk.mp3"
      />
    </div>
  );
}
