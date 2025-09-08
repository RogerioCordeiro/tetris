"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Inter } from "next/font/google";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "@/lib/i18n";
import { Play, Pause, Music, VolumeX } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

// Helper function to get correct asset paths for GitHub Pages
const getAssetPath = (path: string) => {
  const basePath = process.env.NODE_ENV === 'production' ? '/tetris' : '';
  return `${basePath}${path}`;
};

const TETROMINOS = {
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
} as const;

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

const randomTetromino = (): TetrominoType => {
  const keys = Object.keys(TETROMINOS) as (keyof typeof TETROMINOS)[];
  const randKey = keys[Math.floor(Math.random() * keys.length)];
  const tetromino = TETROMINOS[randKey];
  return {
    shape: tetromino.shape.map((row) => [...row]),
    color: tetromino.color,
  };
};

const generateNextPieces = (count = 3) => {
  return Array.from({ length: count }, () => randomTetromino());
};

export default function Tetris() {
  const { t } = useTranslation();
  const [board, setBoard] = useState<BoardType>(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPieces, setNextPieces] = useState<TetrominoType[]>(
    generateNextPieces()
  );
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const gameStateRef = useRef({
    board,
    currentPiece,
    gameOver,
    isPaused,
  });

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
  }, [checkCollision]);

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
          .catch((error) => console.error("Audio playback failed:", error));
      } else {
        audioRef.current.pause();
      }
    }
  }, [gameOver, isMusicPlaying, isPaused]);

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPiece(null);
    setNextPieces(generateNextPieces());
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
      return currentPiece.tetromino.color;
    }

    const boardCell = board[actualY][x];
    return boardCell && boardCell !== 0 ? (boardCell as string) : null;
  };

  const renderPiece = (tetromino: TetrominoType | null, size: number = 20) => {
    if (!tetromino) return null;
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
                backgroundColor: cell ? tetromino.color : "transparent",
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

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen p-4 bg-gray-200 ${inter.className}`}
    >
      <div className="mb-8">
        <Image
          src={getAssetPath("/tetris-logo.png")}
          alt="Tetris Logo"
          width={300}
          height={80}
          priority
          className="drop-shadow-lg"
        />
      </div>

      <div className="flex gap-8 items-start">
        <div className="flex flex-col gap-4">
          <div className="bg-white p-3 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-2 text-center text-gray-800">
              {t("game.hold")}
            </h3>
            <div className="w-20 h-16 rounded flex items-center justify-center bg-slate-200">
              {renderPiece(heldPiece, 15)}
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-lg">
            <div className="space-y-2">
              <div>
                <h4 className="font-bold text-gray-800">
                  {t("game.highscore")}
                </h4>
                <div className="p-1 rounded text-center bg-slate-200 text-black">
                  {highScore}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-800">{t("game.level")}</h4>
                <div className="p-1 rounded text-center bg-slate-200 text-black">
                  {level}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-800">{t("game.score")}</h4>
                <div className="p-1 rounded text-center bg-slate-200 text-black">
                  {score}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-800">{t("game.lines")}</h4>
                <div className="p-1 rounded text-center bg-slate-200 text-black">
                  {lines}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div
              className="grid bg-gray-300"
              style={{
                gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
                width: `${BOARD_WIDTH * 25}px`,
                height: `${BOARD_HEIGHT * 25}px`,
                border: "1px solid #e5e7eb",
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
                      className="w-6 h-6"
                      style={{
                        border: "1px solid #e5e7eb",
                        backgroundColor: renderCell(x, y) || "#f3f4f6",
                      }}
                    />
                  </AnimatePresence>
                ))
              )}
            </div>
          </div>

          <div className="h-12 flex items-center justify-center mt-4">
            {gameOver && (
              <div className="text-2xl font-bold text-red-600">
                {t("game.gameOver")}
              </div>
            )}
            {isPaused && !gameOver && (
              <div className="text-2xl font-bold text-blue-600">
                {t("game.paused")}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white p-3 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-2 text-center text-gray-800">
              {t("game.next")}
            </h3>
            <div className="space-y-3">
              {nextPieces.slice(0, 3).map((piece, index) => (
                <div
                  key={index}
                  className="w-20 h-16 rounded flex items-center justify-center bg-slate-200"
                >
                  {renderPiece(piece, 15)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 left-4 right-4 flex justify-between items-end">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-bold mb-3 text-center text-gray-800">
            {t("controls.title")}
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="bg-gray-200 px-2 py-1 rounded text-xs font-mono min-w-[60px] flex items-center justify-center">
                <Image
                  src={getAssetPath("/arrow-keys.png")}
                  alt="Arrow Keys"
                  width={40}
                  height={30}
                  className="object-contain"
                />
              </div>
              <span className="text-gray-700">{t("controls.move")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-gray-200 px-2 py-1 rounded text-xs font-mono min-w-[60px] text-center text-gray-800 font-bold">
                SPACE
              </div>
              <span className="text-gray-700">{t("controls.hardDrop")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-gray-200 px-2 py-1 rounded text-xs font-mono min-w-[60px] text-center text-gray-800 font-bold">
                H
              </div>
              <span className="text-gray-700">{t("controls.holdPiece")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-gray-200 px-2 py-1 rounded text-xs font-mono min-w-[60px] text-center text-gray-800 font-bold">
                P
              </div>
              <span className="text-gray-700">{t("controls.pause")}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <LanguageSelector />
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

      <audio
        ref={audioRef}
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Tetris-kxnh5j7hpNEcFspAndlU2huV5n6dvk.mp3"
      />
    </div>
  );
}
