import React, { createContext, useContext, useEffect, useState } from 'react';
import { THEMES, STORAGE_KEYS } from '../utils/constants';

const ThemeContext = createContext({});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(THEMES.LIGHT);
  const [systemTheme, setSystemTheme] = useState(THEMES.LIGHT);

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      setSystemTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
    };

    // Set initial system theme
    setSystemTheme(mediaQuery.matches ? THEMES.DARK : THEMES.LIGHT);
    
    // Listen for system theme changes
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  // Load saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const actualTheme = theme === THEMES.SYSTEM ? systemTheme : theme;
    
    if (actualTheme === THEMES.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, systemTheme]);

  const toggleTheme = () => {
    const newTheme = theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    setTheme(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
  };

  const setThemeMode = (newTheme) => {
    if (Object.values(THEMES).includes(newTheme)) {
      setTheme(newTheme);
      localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    }
  };

  const getActualTheme = () => {
    return theme === THEMES.SYSTEM ? systemTheme : theme;
  };

  const isDark = () => {
    return getActualTheme() === THEMES.DARK;
  };

  const value = {
    theme,
    systemTheme,
    actualTheme: getActualTheme(),
    isDark: isDark(),
    toggleTheme,
    setTheme: setThemeMode,
    themes: THEMES
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
