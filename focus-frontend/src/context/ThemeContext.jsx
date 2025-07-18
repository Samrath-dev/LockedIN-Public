import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext({
  dark: false,
  toggle: () => {}
});

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false);

  // whenever theme changes, update `data-theme` on <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  const toggle = () => setDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}