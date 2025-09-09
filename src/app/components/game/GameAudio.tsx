import React, { useEffect, useRef, useState } from "react";
import { GameState } from "@/types/tetris";

interface GameAudioProps {
  gameState: GameState;
  isMusicPlaying: boolean;
}

export const GameAudio: React.FC<GameAudioProps> = ({
  gameState,
  isMusicPlaying,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const { gameOver, isPaused } = gameState;

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

  return (
    <audio
      ref={audioRef}
      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Tetris-kxnh5j7hpNEcFspAndlU2huV5n6dvk.mp3"
    />
  );
};
