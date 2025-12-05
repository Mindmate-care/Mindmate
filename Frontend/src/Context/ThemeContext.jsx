import { createContext, useState, useContext, useEffect } from "react";

// Options
const themes = ["light", "dark"];
const colors = ["blue", "purple", "green", "yellow", "red", "orange"];
const fonts = ["default", "serif", "sans-serif"];
const defaultAccessibility = { highContrast: false, largeText: false };

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // ✅ Load from localStorage if available
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [color, setColor] = useState(localStorage.getItem("color") || "blue");
  const [font, setFont] = useState(localStorage.getItem("font") || "default");
  const [accessibility, setAccessibility] = useState(
    JSON.parse(localStorage.getItem("accessibility")) || defaultAccessibility
  );

  useEffect(() => {
    // Remove old classes
    document.body.classList.remove(
      ...themes,
      ...colors.map((c) => `color-${c}`),
      ...fonts.map((f) => `font-${f}`),
      "high-contrast",
      "large-text"
    );

    // Apply new theme
    document.body.classList.add(theme);
    document.body.classList.add(`color-${color}`);
    document.body.classList.add(`font-${font}`);

    if (accessibility.highContrast) {
      document.body.classList.add("high-contrast");
    }
    if (accessibility.largeText) {
      document.body.classList.add("large-text");
    }

    // ✅ Save preferences
    localStorage.setItem("theme", theme);
    localStorage.setItem("color", color);
    localStorage.setItem("font", font);
    localStorage.setItem("accessibility", JSON.stringify(accessibility));
  }, [theme, color, font, accessibility]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        color,
        setColor,
        font,
        setFont,
        accessibility,
        setAccessibility,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Hook
export const useTheme = () => useContext(ThemeContext);
