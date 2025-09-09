import { useState, useEffect, useCallback, useRef } from "react";
import {
    TetrominoType,
    Piece,
    BoardType,
    GameState,
    GameActions,
} from "@/types/tetris";
import {
    TETROMINOS,
    AVAILABLE_COLORS,
    BOARD_WIDTH,
    BUFFER_ROWS,
    TOTAL_BOARD_HEIGHT,
    INITIAL_DROP_TIME,
    SPEED_INCREASE_FACTOR,
    createEmptyBoard,
} from "@/constants/tetris";

export const useGameLogic = (getPieceColor: (color: string) => string) => {
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
    const [completedRows, setCompletedRows] = useState<number[]>([]);
    const [pieceColors, setPieceColors] = useState<{ [key: string]: string }>({});

    const gameStateRef = useRef({
        board,
        currentPiece,
        gameOver,
        isPaused,
    });

    // Atualizar ref quando o estado mudar
    useEffect(() => {
        gameStateRef.current = { board, currentPiece, gameOver, isPaused };
    }, [board, currentPiece, gameOver, isPaused]);

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
            color: getPieceColor(originalColor),
        };
    }, [pieceColors, getPieceColor]);

    // Função para gerar próximas peças
    const generateNextPieces = useCallback(
        (count = 3) => {
            return Array.from({ length: count }, () => randomTetromino());
        },
        [randomTetromino]
    );

    // Verificar colisão
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

    const spawnNewPiece = useCallback(() => {
        setNextPieces((prevNextPieces) => {
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

    // Actions do jogo
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
            placePieceAtPosition(currentPiece);
        }
    }, [currentPiece, isPaused, isValidMove, placePieceAtPosition]);

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

    const togglePause = useCallback(() => {
        setIsPaused(!isPaused);
    }, [isPaused]);

    const resetGame = useCallback(() => {
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
    }, [generateRandomColors]);

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

    // Spawn de nova peça quando necessário
    useEffect(() => {
        if (!currentPiece && !gameOver) {
            spawnNewPiece();
        }
    }, [currentPiece, gameOver, spawnNewPiece]);

    // Game loop - queda automática das peças
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

    const gameState: GameState = {
        board,
        currentPiece,
        nextPieces,
        heldPiece,
        canHold,
        score,
        highScore,
        lines,
        gameOver,
        isPaused,
        dropTime,
        level,
        completedRows,
    };

    const gameActions: GameActions = {
        moveLeft,
        moveRight,
        moveDown,
        rotate,
        hardDrop,
        holdPiece,
        togglePause,
        resetGame,
    };

    return { gameState, gameActions };
};
