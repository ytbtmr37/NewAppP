import React from 'react';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { TextStats } from './TextStats';
import { LightningIcon } from './icons/LightningIcon';
import { StarIcon } from './icons/StarIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { TrashIcon } from './icons/TrashIcon';
import { FlashcardIcon } from './icons/FlashcardIcon';

interface InputPanelProps {
    inputText: string;
    onInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onFormat: () => void;
    onClearText: () => void;
    backgroundColor: string;
    onBackgroundColorChange: (color: string) => void;
    textColor: string;
    onTextColorChange: (color: string) => void;
    isLoading: boolean;
    isImproving: boolean;
    onImproveText: () => void;
    onCreateFlashcards: () => void;
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
    onClearText,
    isLoading,
    isImproving,
    onImproveText,
    onCreateFlashcards,
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
    const headingColorPalette = ['#ff0000', '#77ff00', '#bc0cf3', '#f30cca', '#f30c5f', '#f30c0c'];


    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-3 gap-2">
                <label htmlFor="input-text" className="text-xl font-semibold text-gray-900 dark:text-white">
                    النص الأصلي
                </label>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onImproveText}
                        disabled={isImproving || isLoading || !inputText.trim()}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-blue-500 dark:bg-gray-700 dark:text-blue-400 dark:hover:bg-gray-600 dark:disabled:bg-gray-800 dark:disabled:text-gray-500 dark:focus:ring-offset-gray-900"
                        title="تحسين النص وتنسيق الرموز العلمية"
                    >
                        {isImproving ? (
                            <svg className="animate-spin h-5 w-5 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <SparklesIcon />
                        )}
                        <span>{isImproving ? 'جاري التحسين...' : 'تحسين النص'}</span>
                    </button>
                    <button
                        onClick={onClearText}
                        disabled={isLoading || isImproving || !inputText.trim()}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-500 bg-gray-100 rounded-md hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-red-500 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-gray-600 dark:disabled:bg-gray-800 dark:disabled:text-gray-500 dark:focus:ring-offset-gray-900"
                        title="مسح كل النصوص"
                    >
                        <TrashIcon />
                        <span>مسح الكل</span>
                    </button>
                </div>
            </div>
            <div className="flex-grow flex flex-col bg-white rounded-lg border border-gray-200 shadow-lg dark:bg-gray-800 dark:border-gray-700">
                <textarea
                    id="input-text"
                    value={inputText}
                    onChange={onInputChange}
                    placeholder={"الصق النص هنا..."}
                    className={`w-full h-96 flex-grow p-4 bg-white text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-t-lg disabled:bg-gray-100/50 placeholder-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:ring-blue-500 dark:disabled:bg-gray-800/50`}
                    style={{ minHeight: '300px' }}
                    disabled={isLoading || isImproving}
                />
                <fieldset disabled={isLoading || isImproving} className="p-4 border-t border-gray-200 dark:border-gray-700">
                     {inputText.trim().length > 0 && (
                        <div className="mb-4">
                           <TextStats text={inputText} />
                        </div>
                    )}
                    <div className="space-y-4 mb-4">
                        {/* Colors Section */}
                        <div>
                            <label className="block text-base font-semibold text-gray-800 mb-2 dark:text-gray-200">
                                الألوان
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="bg-color-picker" className="block text-sm font-medium text-gray-500 mb-1 dark:text-gray-400">الخلفية</label>
                                    <div className="relative h-12">
                                        <div
                                            className="w-full h-full rounded-md border-2 border-gray-300 dark:border-gray-600 flex items-center px-3"
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
                                    <label htmlFor="text-color-picker" className="block text-sm font-medium text-gray-500 mb-1 dark:text-gray-400">النص الأساسي</label>
                                    <div className="relative h-12">
                                        <div
                                            className="w-full h-full rounded-md border-2 border-gray-300 dark:border-gray-600 flex items-center px-3"
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
                                    <label htmlFor="heading-color-picker" className="block text-sm font-medium text-gray-500 mb-1 dark:text-gray-400">العناوين</label>
                                    <div className="relative h-12">
                                        <div
                                            className="w-full h-full rounded-md border-2 border-gray-300 dark:border-gray-600 flex items-center px-3"
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
                                    <div className="mt-2 flex flex-wrap gap-2 justify-start">
                                        {headingColorPalette.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => onHeadingColorChange(color)}
                                                className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 shadow-sm cursor-pointer transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                                                style={{ backgroundColor: color }}
                                                aria-label={`Set heading color to ${color}`}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Typography Section */}
                        <div>
                            <label className="block text-base font-semibold text-gray-800 mb-2 dark:text-gray-200">
                                الطباعة
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="font-family-select" className="block text-sm font-medium text-gray-500 mb-1 dark:text-gray-400">
                                        الخط
                                    </label>
                                    <select
                                        id="font-family-select"
                                        value={fontFamily}
                                        onChange={(e) => onFontFamilyChange(e.target.value)}
                                        className="w-full px-3 py-2 bg-white text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                    >
                                        {fontOptions.map(font => <option key={font} value={font}>{font}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1 dark:text-gray-400">
                                        تباعد الأسطر
                                    </label>
                                    <div className="flex gap-2 h-12" dir="ltr">
                                        {lineHeightOptions.map(opt => (
                                            <button
                                                key={opt.label}
                                                onClick={() => onLineHeightChange(opt.value)}
                                                className={`w-full h-full px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500 ${
                                                    lineHeight === opt.value
                                                        ? 'bg-blue-600 text-white shadow-lg dark:bg-blue-500'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
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
                            <label className="block text-base font-semibold text-gray-800 mb-2 dark:text-gray-200">
                                لغة الإخراج
                            </label>
                            <div className="flex gap-2" dir="ltr">
                                <button
                                    onClick={() => onOutputLanguageChange('ar')}
                                    className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500 ${
                                        outputLanguage === 'ar'
                                            ? 'bg-blue-600 text-white shadow-lg dark:bg-blue-500'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    العربية
                                </button>
                                <button
                                    onClick={() => onOutputLanguageChange('en')}
                                    className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500 ${
                                        outputLanguage === 'en'
                                            ? 'bg-blue-600 text-white shadow-lg dark:bg-blue-500'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    English
                                </button>
                            </div>
                        </div>
                         <div>
                            <label className="block text-base font-semibold text-gray-800 mb-2 dark:text-gray-200">
                                وضع المعالجة
                            </label>
                            <div className="flex gap-2" dir="ltr">
                                <button
                                    onClick={() => onProcessingModeChange('speed')}
                                    title="وضع السرعة: مثالي للنتائج السريعة"
                                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500 ${
                                        processingMode === 'speed'
                                            ? 'bg-blue-600 text-white shadow-lg dark:bg-blue-500'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    <LightningIcon />
                                    <span>سرعة</span>
                                </button>
                                <button
                                    onClick={() => onProcessingModeChange('quality')}
                                    title="وضع الجودة: قد يستغرق وقتًا أطول للحصول على أفضل النتائج"
                                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500 ${
                                        processingMode === 'quality'
                                            ? 'bg-blue-600 text-white shadow-lg dark:bg-blue-500'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    <StarIcon />
                                    <span>جودة</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={onFormat}
                            disabled={isLoading || isImproving || !inputText.trim()}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500 dark:disabled:bg-blue-800/50"
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
                        <button
                            onClick={onCreateFlashcards}
                            disabled={isLoading || isImproving || !inputText.trim()}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3 text-lg font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-purple-500 dark:disabled:bg-purple-800/50"
                            title="إنشاء بطاقات تعليمية من النص الأصلي"
                        >
                            <FlashcardIcon />
                            <span>إنشاء بطاقات</span>
                        </button>
                    </div>
                    {isLoading && processingStatus && (
                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                {`جاري معالجة الجزء ${processingStatus.current} من ${processingStatus.total}`}
                            </p>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div 
                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
                                    style={{ width: `${(processingStatus.current / processingStatus.total) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </fieldset>
            </div>
        </div>
    );
};
