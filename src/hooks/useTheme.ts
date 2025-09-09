import { useState, useCallback } from "react";
import { ThemeType } from "@/types/tetris";
import { THEMES } from "@/constants/tetris";

export const useTheme = () => {
    const [theme, setTheme] = useState<ThemeType>("colorful");

    const toggleTheme = useCallback(() => {
        setTheme((prev) => (prev === "colorful" ? "classic" : "colorful"));
    }, []);

    const getPieceColor = useCallback(
        (originalColor: string) => {
            if (theme === "classic") {
                return THEMES.classic.blockColor!;
            }
            return originalColor;
        },
        [theme]
    );

    const currentTheme = THEMES[theme];

    return {
        theme,
        currentTheme,
        toggleTheme,
        getPieceColor,
    };
};
