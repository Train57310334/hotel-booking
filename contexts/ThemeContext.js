import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children, initialTheme = 'classic' }) {
    const [theme, setTheme] = useState(initialTheme);

    useEffect(() => {
        if (initialTheme) {
            setTheme(initialTheme);
        }
    }, [initialTheme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {/* Adding the theme class to a wrapper div allows descendant components to inherit CSS variables */}
            <div className={`theme-${theme} font-theme min-h-screen bg-theme-bg text-theme-text transition-colors duration-300`}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
