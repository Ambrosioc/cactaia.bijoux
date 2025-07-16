'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeColors {
    primary: string;
    secondary: string;
}

interface ThemeContextType {
    colors: ThemeColors;
    updateColors: (newColors: Partial<ThemeColors>) => void;
    resetColors: () => void;
}

const defaultColors: ThemeColors = {
    primary: '#4A7C59',
    secondary: '#F5F5F4',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [colors, setColors] = useState<ThemeColors>(defaultColors);

    // Appliquer les couleurs aux variables CSS
    const applyColors = (newColors: ThemeColors) => {
        const root = document.documentElement;
        root.style.setProperty('--color-primary', newColors.primary);
        root.style.setProperty('--color-secondary', newColors.secondary);

        // Générer des variations de couleurs
        root.style.setProperty('--color-primary-50', `${newColors.primary}0D`);
        root.style.setProperty('--color-primary-100', `${newColors.primary}1A`);
        root.style.setProperty('--color-primary-200', `${newColors.primary}33`);
        root.style.setProperty('--color-primary-300', `${newColors.primary}4D`);
        root.style.setProperty('--color-primary-400', `${newColors.primary}66`);
        root.style.setProperty('--color-primary-500', newColors.primary);
        root.style.setProperty('--color-primary-600', `${newColors.primary}CC`);
        root.style.setProperty('--color-primary-700', `${newColors.primary}E6`);
        root.style.setProperty('--color-primary-800', `${newColors.primary}F2`);
        root.style.setProperty('--color-primary-900', `${newColors.primary}FA`);
    };

    // Mettre à jour les couleurs
    const updateColors = (newColors: Partial<ThemeColors>) => {
        const updatedColors = { ...colors, ...newColors };
        setColors(updatedColors);
        applyColors(updatedColors);

        // Sauvegarder dans localStorage
        localStorage.setItem('cactaia-theme-colors', JSON.stringify(updatedColors));
    };

    // Réinitialiser les couleurs
    const resetColors = () => {
        setColors(defaultColors);
        applyColors(defaultColors);
        localStorage.removeItem('cactaia-theme-colors');
    };

    // Charger les couleurs au démarrage
    useEffect(() => {
        const savedColors = localStorage.getItem('cactaia-theme-colors');
        if (savedColors) {
            try {
                const parsedColors = JSON.parse(savedColors);
                setColors(parsedColors);
                applyColors(parsedColors);
            } catch (error) {
                console.error('Erreur lors du chargement des couleurs:', error);
                applyColors(defaultColors);
            }
        } else {
            applyColors(defaultColors);
        }
    }, []);

    return (
        <ThemeContext.Provider value={{ colors, updateColors, resetColors }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
} 