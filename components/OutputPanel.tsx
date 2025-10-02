import React, { useState, useEffect } from 'react';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { TranslateIcon } from './icons/TranslateIcon';
import { FlashcardIcon } from './icons/FlashcardIcon';


interface OutputPanelProps {
    formattedText: string;
    isLoading: boolean;
    isTranslating: boolean;
    processingStatus: {current: number; total: number} | null;
    error: string | null;
    outputLanguage: 'ar' | 'en';
    onTranslate: () => void;
    onCreateFlashcards: () => void;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({ 
    formattedText, 
    isLoading,
    isTranslating,
    processingStatus, 
    error, 
    outputLanguage,
    onTranslate,
    onCreateFlashcards
}) => {
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (isCopied) {
            const timer = setTimeout(() => {
                setIsCopied(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isCopied]);

    const handleCopy = () => {
        if (formattedText) {
            navigator.clipboard.writeText(formattedText);
            setIsCopied(true);
        }
    };

    const handleDownload = () => {
        if (formattedText) {
            const blob = new Blob([formattedText], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `page_${outputLanguage}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            const message = processingStatus 
                ? `يعمل الذكاء الاصطناعي على تصميم الصفحة (الجزء ${processingStatus.current} من ${processingStatus.total})...`
                : 'يعمل الذكاء الاصطناعي على تصميم الصفحة...';

            return (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <svg className="animate-spin h-10 w-10 text-cyan-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-lg">{message}</p>
                </div>
            );
        }
        if (error) {
            return <div className="p-4 text-red-400 bg-red-900/50 rounded-md">{error}</div>;
        }
        if (formattedText) {
            return (
                <iframe
                    srcDoc={formattedText}
                    title="معاينة HTML"
                    className="w-full h-full border-0 bg-white"
                />
            );
        }
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                <p>ستظهر معاينة صفحة الـ HTML هنا</p>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold text-gray-300">
                    {`المعاينة الحية (${outputLanguage === 'ar' ? 'العربية' : 'الإنجليزية'})`}
                </h2>
                <div className="flex items-center gap-2">
                    {formattedText && !error && (
                        <>
                            <button
                                onClick={onCreateFlashcards}
                                disabled={isTranslating || isLoading}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500"
                                title="إنشاء بطاقات تعليمية من هذا المحتوى"
                            >
                                <FlashcardIcon />
                                <span>إنشاء بطاقات</span>
                            </button>
                            <button
                                onClick={onTranslate}
                                disabled={isTranslating || isLoading}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
                                title={`Translate to ${outputLanguage === 'ar' ? 'English' : 'Arabic'}`}
                            >
                                {isTranslating ? (
                                    <>
                                        <svg className="animate-spin -ml-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>جاري الترجمة...</span>
                                    </>
                                ) : (
                                    <>
                                        <TranslateIcon />
                                        <span>{`ترجمة إلى ${outputLanguage === 'ar' ? 'English' : 'العربية'}`}</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-cyan-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
                                title="Download HTML file"
                            >
                                <DownloadIcon />
                                تحميل HTML
                            </button>
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-cyan-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
                                title="Copy HTML code"
                            >
                                {isCopied ? <CheckIcon /> : <ClipboardIcon />}
                                {isCopied ? 'تم النسخ!' : 'نسخ الكود'}
                            </button>
                        </>
                    )}
                </div>
            </div>
            <div className="flex-grow bg-gray-800 rounded-lg border border-gray-700 shadow-lg min-h-[448px] overflow-hidden">
                {renderContent()}
            </div>
        </div>
    );
};