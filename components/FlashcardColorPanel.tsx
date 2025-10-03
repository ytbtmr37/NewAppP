import React from 'react';
import { ColorSettings } from './FlashcardCreator';

interface FlashcardColorPanelProps {
    colors: ColorSettings;
    onColorChange: (key: keyof ColorSettings, value: string) => void;
}

const ColorInput: React.FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
        <div className="relative h-12 w-full rounded-md border-2 border-gray-300 dark:border-gray-600 overflow-hidden">
            <div
                className="w-full h-full flex items-center px-3"
                style={{ backgroundColor: value }}
            >
                <span className="font-mono text-white text-sm" style={{ mixBlendMode: 'difference' }}>
                    {value}
                </span>
            </div>
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title={`اختر لون ${label}`}
            />
        </div>
    </div>
);

export const FlashcardColorPanel: React.FC<FlashcardColorPanelProps> = ({ colors, onColorChange }) => {
    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <div>
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    ألوان البطاقة
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <ColorInput label="الخلفية" value={colors.cardBackground} onChange={(val) => onColorChange('cardBackground', val)} />
                    <ColorInput label="النص" value={colors.cardText} onChange={(val) => onColorChange('cardText', val)} />
                    <ColorInput label="الإطار" value={colors.cardBorder} onChange={(val) => onColorChange('cardBorder', val)} />
                </div>
            </div>
             <div>
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    ألوان شارات الصعوبة
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <ColorInput label="سهل" value={colors.easyBadge} onChange={(val) => onColorChange('easyBadge', val)} />
                    <ColorInput label="متوسط" value={colors.mediumBadge} onChange={(val) => onColorChange('mediumBadge', val)} />
                    <ColorInput label="صعب" value={colors.hardBadge} onChange={(val) => onColorChange('hardBadge', val)} />
                </div>
            </div>
        </div>
    );
};