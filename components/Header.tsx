import React from 'react';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

interface HeaderProps {
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme }) => {
    return (
        <header className="flex items-center justify-between">
             <button
                onClick={onToggleTheme}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 focus:ring-blue-500 transition-colors"
                aria-label="Toggle theme"
            >
                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
            <div className="flex-1 text-center">
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
                    مصمم الصفحات الفوري
                </h1>
            </div>
            {/* Empty div to balance the flexbox layout */}
            <div className="w-10"></div>
        </header>
    );
};