import React, { useState, useEffect, useRef } from 'react';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { TranslateIcon } from './icons/TranslateIcon';
import { FlashcardIcon } from './icons/FlashcardIcon';
import { EyeIcon } from './icons/EyeIcon';
import { CodeIcon } from './icons/CodeIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { PrinterIcon } from './icons/PrinterIcon';


interface OutputPanelProps {
    formattedText: string;
    onFormattedTextChange: (html: string) => void;
    isLoading: boolean;
    isTranslating: boolean;
    processingStatus: {current: number; total: number} | null;
    error: string | null;
    outputLanguage: 'ar' | 'en';
    onTranslate: () => void;
    onCreateFlashcards: () => void;
    outputViewMode: 'preview' | 'editor';
    onOutputViewModeChange: (mode: 'preview' | 'editor') => void;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({ 
    formattedText,
    onFormattedTextChange,
    isLoading,
    isTranslating,
    processingStatus, 
    error, 
    outputLanguage,
    onTranslate,
    onCreateFlashcards,
    outputViewMode,
    onOutputViewModeChange
}) => {
    const [isCopied, setIsCopied] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

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

    const handleDownloadTxt = () => {
        if (formattedText) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = formattedText;
            const plainText = tempDiv.textContent || tempDiv.innerText || '';
            
            const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `page_${outputLanguage}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const handlePrint = () => {
        const iframe = iframeRef.current;
        if (iframe?.contentWindow) {
            iframe.contentWindow.focus(); // Focus is needed for some browsers to work properly.
            iframe.contentWindow.print();
        }
    };

    const renderContent = () => {
        if (error) {
            return <div className="p-4 text-red-800 bg-red-100 rounded-md dark:bg-red-900/50 dark:text-red-300">{error}</div>;
        }

        if (outputViewMode === 'editor') {
            return (
                <textarea
                    value={formattedText}
                    onChange={(e) => onFormattedTextChange(e.target.value)}
                    placeholder="سيظهر كود HTML هنا..."
                    className="w-full h-full p-4 bg-gray-50 text-gray-900 font-mono resize-none focus:outline-none rounded-lg placeholder-gray-400 dark:bg-gray-900 dark:text-gray-200 dark:placeholder-gray-500"
                    spellCheck="false"
                    aria-label="HTML Code Editor"
                    dir="ltr"
                />
            );
        }

        if (isLoading && !formattedText) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-gray-600 dark:text-gray-400">
                    <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-lg">Generating HTML...</p>
                </div>
            );
        }

        if (formattedText) {
            return (
                <iframe
                    ref={iframeRef}
                    srcDoc={formattedText}
                    title="معاينة HTML"
                    className="w-full h-full border-0"
                />
            );
        }

        return (
            <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                <p>ستظهر معاينة صفحة الـ HTML هنا</p>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2" role="group" aria-label="Output View Mode">
                    <button
                        onClick={() => onOutputViewModeChange('preview')}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 focus:ring-blue-500 ${
                            outputViewMode === 'preview'
                                ? 'bg-blue-600 text-white dark:bg-blue-500'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                        aria-pressed={outputViewMode === 'preview'}
                    >
                        <EyeIcon />
                        <span>معاينة</span>
                    </button>
                    <button
                        onClick={() => onOutputViewModeChange('editor')}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 focus:ring-blue-500 ${
                            outputViewMode === 'editor'
                                ? 'bg-blue-600 text-white dark:bg-blue-500'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                         aria-pressed={outputViewMode === 'editor'}
                    >
                        <CodeIcon />
                        <span>المحرر</span>
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    {formattedText && !error && (
                        <>
                            <button
                                onClick={onCreateFlashcards}
                                disabled={isTranslating || isLoading}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 focus:ring-purple-500 dark:disabled:bg-gray-600"
                                title="إنشاء بطاقات تعليمية من هذا المحتوى"
                            >
                                <FlashcardIcon />
                                <span>إنشاء بطاقات</span>
                            </button>
                            <button
                                onClick={onTranslate}
                                disabled={isTranslating || isLoading}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 dark:disabled:bg-gray-600"
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
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 focus:ring-blue-500 dark:bg-gray-700 dark:text-blue-400 dark:hover:bg-gray-600"
                                title="Download HTML file"
                            >
                                <DownloadIcon />
                                تحميل HTML
                            </button>
                            <button
                                onClick={handleDownloadTxt}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 focus:ring-blue-500 dark:bg-gray-700 dark:text-blue-400 dark:hover:bg-gray-600"
                                title="Download plain text file"
                            >
                                <DocumentTextIcon />
                                تحميل TXT
                            </button>
                             <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 focus:ring-blue-500 dark:bg-gray-700 dark:text-blue-400 dark:hover:bg-gray-600"
                                title="طباعة الصفحة"
                            >
                                <PrinterIcon />
                                طباعة
                            </button>
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 focus:ring-blue-500 dark:bg-gray-700 dark:text-blue-400 dark:hover:bg-gray-600"
                                title="Copy HTML code"
                            >
                                {isCopied ? <CheckIcon /> : <ClipboardIcon />}
                                {isCopied ? 'تم النسخ!' : 'نسخ الكود'}
                            </button>
                        </>
                    )}
                </div>
            </div>
            <div className="flex-grow bg-white rounded-lg border border-gray-200 shadow-lg min-h-[448px] overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                {renderContent()}
            </div>
        </div>
    );
};