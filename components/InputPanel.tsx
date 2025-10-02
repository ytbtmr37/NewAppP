import React from 'react';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { TextStats } from './TextStats';
import { LightningIcon } from './icons/LightningIcon';
import { StarIcon } from './icons/StarIcon';

interface InputPanelProps {
    inputText: string;
    onInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onFormat: () => void;
    backgroundColor: string;
    onBackgroundColorChange: (color: string) => void;
    textColor: string;
    onTextColorChange: (color: string) => void;
    isLoading: boolean;
    processingStatus: {current: number; total: number} | null;
    outputLanguage: 'ar' | 'en';
    onOutputLanguageChange: (lang: 'ar' | 'en') => void;
    processingMode: 'speed' | 'quality';
    onProcessingModeChange: (mode: 'speed' | 'quality') => void;
    fontFamily: string;
    onFontFamilyChange: (font: string) => void;
    lineHeight: number;
    onLineHeightChange: (height: number) => void;
    headingColor: string;
    onHeadingColorChange: (color: string) => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
    inputText,
    onInputChange,
    onFormat,
    isLoading,
    processingStatus,
    backgroundColor,
    onBackgroundColorChange,
    textColor,
    onTextColorChange,
    outputLanguage,
    onOutputLanguageChange,
    processingMode,
    onProcessingModeChange,
    fontFamily,
    onFontFamilyChange,
    lineHeight,
    onLineHeightChange,
    headingColor,
    onHeadingColorChange,
}) => {

    const getButtonText = () => {
        if (isLoading) {
            if (processingStatus) {
                return `جاري المعالجة...`;
            }
            return "جاري الإنشاء...";
        }
        if (!inputText.trim()) {
            return "لا يوجد نص للإدخال";
        }
        return "إنشاء صفحة HTML";
    };

    const fontOptions = ['Tajawal', 'Cairo', 'Noto Sans Arabic', 'Amiri'];
    const lineHeightOptions = [
        { label: 'ضيق', value: 1.5 },
        { label: 'افتراضي', value: 1.8 },
        { label: 'واسع', value: 2.2 },
    ];


    return (
        <div className="flex flex-col h-full">
            <label htmlFor="input-text" className="text-xl font-semibold mb-3 text-gray-300">
                 النص الأصلي
            </label>
            <div className="flex-grow flex flex-col bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
                <textarea
                    id="input-text"
                    value={inputText}
                    onChange={onInputChange}
                    placeholder={"الصق النص هنا..."}
                    className={`w-full h-96 flex-grow p-4 bg-transparent text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-t-lg`}
                    style={{ minHeight: '300px' }}
                />
                <div className="p-4 border-t border-gray-700">
                     {inputText.trim().length > 0 && (
                        <div className="mb-4">
                           <TextStats text={inputText} />
                        </div>
                    )}
                    <div className="space-y-4 mb-4">
                        {/* Colors Section */}
                        <div>
                            <label className="block text-base font-semibold text-gray-300 mb-2">
                                الألوان
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="bg-color-picker" className="block text-sm font-medium text-gray-400 mb-1">الخلفية</label>
                                    <div className="relative h-12">
                                        <div
                                            className="w-full h-full rounded-md border-2 border-gray-600 flex items-center px-3"
                                            style={{ backgroundColor: backgroundColor }}
                                        >
                                            <span className="font-mono text-white" style={{ mixBlendMode: 'difference' }}>
                                                {backgroundColor}
                                            </span>
                                        </div>
                                        <input
                                            id="bg-color-picker"
                                            type="color"
                                            value={backgroundColor}
                                            onChange={(e) => onBackgroundColorChange(e.target.value)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            title="اختر لون الخلفية"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="text-color-picker" className="block text-sm font-medium text-gray-400 mb-1">النص الأساسي</label>
                                    <div className="relative h-12">
                                        <div
                                            className="w-full h-full rounded-md border-2 border-gray-600 flex items-center px-3"
                                            style={{ backgroundColor: textColor }}
                                        >
                                            <span className="font-mono text-white" style={{ mixBlendMode: 'difference' }}>
                                                {textColor}
                                            </span>
                                        </div>
                                        <input
                                            id="text-color-picker"
                                            type="color"
                                            value={textColor}
                                            onChange={(e) => onTextColorChange(e.target.value)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            title="اختر لون النص"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="heading-color-picker" className="block text-sm font-medium text-gray-400 mb-1">العناوين</label>
                                    <div className="relative h-12">
                                        <div
                                            className="w-full h-full rounded-md border-2 border-gray-600 flex items-center px-3"
                                            style={{ backgroundColor: headingColor }}
                                        >
                                            <span className="font-mono text-white" style={{ mixBlendMode: 'difference' }}>
                                                {headingColor}
                                            </span>
                                        </div>
                                        <input
                                            id="heading-color-picker"
                                            type="color"
                                            value={headingColor}
                                            onChange={(e) => onHeadingColorChange(e.target.value)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            title="اختر لون العناوين"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Typography Section */}
                        <div>
                            <label className="block text-base font-semibold text-gray-300 mb-2">
                                الطباعة
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="font-family-select" className="block text-sm font-medium text-gray-400 mb-1">
                                        الخط
                                    </label>
                                    <select
                                        id="font-family-select"
                                        value={fontFamily}
                                        onChange={(e) => onFontFamilyChange(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 h-12"
                                    >
                                        {fontOptions.map(font => <option key={font} value={font}>{font}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        تباعد الأسطر
                                    </label>
                                    <div className="flex gap-2 h-12" dir="ltr">
                                        {lineHeightOptions.map(opt => (
                                            <button
                                                key={opt.label}
                                                onClick={() => onLineHeightChange(opt.value)}
                                                className={`w-full h-full px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
                                                    lineHeight === opt.value
                                                        ? 'bg-cyan-600 text-white shadow-lg'
                                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-base font-semibold text-gray-300 mb-2">
                                لغة الإخراج
                            </label>
                            <div className="flex gap-2" dir="ltr">
                                <button
                                    onClick={() => onOutputLanguageChange('ar')}
                                    className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
                                        outputLanguage === 'ar'
                                            ? 'bg-cyan-600 text-white shadow-lg'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    العربية
                                </button>
                                <button
                                    onClick={() => onOutputLanguageChange('en')}
                                    className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
                                        outputLanguage === 'en'
                                            ? 'bg-cyan-600 text-white shadow-lg'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    English
                                </button>
                            </div>
                        </div>
                         <div>
                            <label className="block text-base font-semibold text-gray-300 mb-2">
                                وضع المعالجة
                            </label>
                            <div className="flex gap-2" dir="ltr">
                                <button
                                    onClick={() => onProcessingModeChange('speed')}
                                    title="وضع السرعة: مثالي للنتائج السريعة"
                                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
                                        processingMode === 'speed'
                                            ? 'bg-cyan-600 text-white shadow-lg'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    <LightningIcon />
                                    <span>سرعة</span>
                                </button>
                                <button
                                    onClick={() => onProcessingModeChange('quality')}
                                    title="وضع الجودة: قد يستغرق وقتًا أطول للحصول على أفضل النتائج"
                                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
                                        processingMode === 'quality'
                                            ? 'bg-cyan-600 text-white shadow-lg'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    <StarIcon />
                                    <span>جودة</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onFormat}
                        disabled={isLoading || !inputText.trim()}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3 text-lg font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
                    >
                        {isLoading ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <MagicWandIcon />
                        )}
                        {getButtonText()}
                    </button>
                    {isLoading && processingStatus && (
                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-400 mb-2">
                                {`جاري معالجة الجزء ${processingStatus.current} من ${processingStatus.total}`}
                            </p>
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                                <div 
                                    className="bg-cyan-500 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
                                    style={{ width: `${(processingStatus.current / processingStatus.total) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
