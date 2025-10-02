import React, { useState, useCallback, useMemo } from 'react';
import { generateFlashcardsFromText } from '../services/geminiService';
import { Flashcard } from './Flashcard';
import { DownloadIcon } from './icons/DownloadIcon';

// This utility function can be moved to a shared file if needed elsewhere.
const extractTextFromHtml = (html: string): string => {
    if (typeof window === 'undefined') return ''; // Avoid server-side errors
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    tempDiv.querySelectorAll('style, script').forEach(el => el.remove());
    return tempDiv.textContent || tempDiv.innerText || '';
};

// Re-using a simplified chunking logic
const MAX_CHUNK_WORDS = 1500;
const wordCount = (str: string): number => str.trim().split(/\s+/).filter(Boolean).length;
const splitTextIntoChunks = (text: string): string[] => {
    if (wordCount(text) <= MAX_CHUNK_WORDS) {
        return [text];
    }
    const paragraphs = text.split(/\n{2,}/);
    const chunks: string[] = [];
    let currentChunk = '';
    for (const p of paragraphs) {
        if (wordCount(currentChunk) + wordCount(p) > MAX_CHUNK_WORDS && currentChunk.length > 0) {
            chunks.push(currentChunk);
            currentChunk = p;
        } else {
            currentChunk += `\n\n${p}`;
        }
    }
    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }
    return chunks;
};


interface FlashcardCreatorProps {
    htmlContent: string;
    onBack: () => void;
}

type Difficulty = 'easy' | 'medium' | 'hard';
type FlashcardData = {
    id: string;
    question: string;
    answer: string;
    difficulty: Difficulty;
    isDone: boolean;
};
type StatusFilter = 'all' | 'active' | 'done';
type DifficultyFilter = 'all' | Difficulty;


const difficultyOrder: Difficulty[] = ['easy', 'medium', 'hard'];
const difficultyLabels: Record<Difficulty, string> = {
    easy: 'سهل',
    medium: 'متوسط',
    hard: 'صعب',
};

const generateFlashcardHtml = (cards: FlashcardData[]): string => {
    const grouped = {
        hard: cards.filter(c => c.difficulty === 'hard'),
        medium: cards.filter(c => c.difficulty === 'medium'),
        easy: cards.filter(c => c.difficulty === 'easy'),
    };

    let bodyContent = '<h1>مجموعة البطاقات التعليمية</h1>';

    for (const level of difficultyOrder) {
        const levelCards = grouped[level];
        if (levelCards.length > 0) {
            bodyContent += `
                <div class="difficulty-group">
                    <h2>${difficultyLabels[level]} (${levelCards.length})</h2>
                    <div class="grid">
                        ${levelCards.map(card => `
                            <div class="card-container" role="button" tabindex="0" aria-label="بطاقة سؤال: ${card.question}">
                                <div class="card-inner">
                                    <div class="card-front">
                                        <span class="badge badge-${card.difficulty}">${difficultyLabels[card.difficulty]}</span>
                                        <p class="card-label">سؤال</p>
                                        <p class="card-text">${card.question}</p>
                                    </div>
                                    <div class="card-back">
                                        <p class="card-label">إجابة</p>
                                        <p class="card-text">${card.answer}</p>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }

    return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>البطاقات التعليمية</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #111827; /* gray-900 */
            --card-front-bg: #1f2937; /* gray-800 */
            --card-back-bg: #374151; /* gray-700 */
            --text-color: #e5e7eb; /* gray-200 */
            --cyan-color: #22d3ee; /* cyan-400 */
            --yellow-color: #facc15; /* yellow-400 */
            --border-color: #4b5563; /* gray-600 */
            --font-family: 'Tajawal', sans-serif;
        }
        body {
            font-family: var(--font-family);
            background-color: var(--bg-color);
            color: var(--text-color);
            line-height: 1.6;
            margin: 0;
            padding: 2rem;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            font-size: 2.25rem;
            font-weight: 700;
            color: var(--cyan-color);
            text-align: center;
            margin-bottom: 2rem;
        }
        h2 {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-color);
            border-bottom: 2px solid var(--border-color);
            padding-bottom: 0.5rem;
            margin-top: 3rem;
            margin-bottom: 1.5rem;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
        }
        .card-container {
            background-color: transparent;
            width: 100%;
            height: 18rem; /* 288px */
            perspective: 1000px;
            cursor: pointer;
            border-radius: 0.5rem;
            outline: none;
        }
        .card-container:focus-visible {
            box-shadow: 0 0 0 3px var(--cyan-color);
        }
        .card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            text-align: center;
            transition: transform 0.3s;
            transform-style: preserve-3d;
        }
        .card-inner.is-flipped {
            transform: rotateY(180deg);
        }
        .card-front, .card-back {
            position: absolute;
            width: 100%;
            height: 100%;
            -webkit-backface-visibility: hidden; /* Safari */
            backface-visibility: hidden;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 1.5rem;
            border: 2px solid var(--border-color);
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
            box-sizing: border-box;
        }
        .card-front {
            background-color: var(--card-front-bg);
        }
        .card-back {
            background-color: var(--card-back-bg);
            transform: rotateY(180deg);
        }
        .card-label {
            font-size: 0.875rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        .card-front .card-label { color: var(--cyan-color); }
        .card-back .card-label { color: var(--yellow-color); }
        .card-text {
            font-size: 1.125rem;
            margin: 0;
        }
        .badge {
            position: absolute;
            top: 0.75rem;
            right: 0.75rem;
            padding: 0.125rem 0.5rem;
            font-size: 0.75rem;
            font-weight: 600;
            border-radius: 9999px;
        }
        .badge-easy { background-color: #14532d; color: #a7f3d0; } /* green-800/300 */
        .badge-medium { background-color: #713f12; color: #fde68a; } /* yellow-800/300 */
        .badge-hard { background-color: #7f1d1d; color: #fecaca; } /* red-800/300 */
    </style>
</head>
<body>
    <div class="container">
        ${bodyContent}
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const cards = document.querySelectorAll('.card-container');
            cards.forEach(card => {
                const inner = card.querySelector('.card-inner');
                if (inner) {
                    const flipCard = () => inner.classList.toggle('is-flipped');
                    card.addEventListener('click', flipCard);
                    card.addEventListener('keypress', function(e) {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            flipCard();
                        }
                    });
                }
            });
        });
    </script>
</body>
</html>
    `;
};

export const FlashcardCreator: React.FC<FlashcardCreatorProps> = ({ htmlContent, onBack }) => {
    const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [processingStatus, setProcessingStatus] = useState<{ current: number; total: number } | null>(null);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');

    const textContent = useMemo(() => extractTextFromHtml(htmlContent), [htmlContent]);

    const handleGenerateFlashcards = useCallback(async () => {
        if (!textContent.trim()) {
            setError("لا يوجد محتوى لإنشاء بطاقات منه.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setFlashcards([]);
        setProcessingStatus(null);
        setStatusFilter('all');
        setDifficultyFilter('all');

        try {
            const textChunks = splitTextIntoChunks(textContent);
            const allFlashcards: FlashcardData[] = [];
            
            for (let i = 0; i < textChunks.length; i++) {
                setProcessingStatus({ current: i + 1, total: textChunks.length });
                const chunkCards = await generateFlashcardsFromText(textChunks[i]);
                const newCards = chunkCards.map((card, index) => ({
                    ...card,
                    id: `${Date.now()}-${i}-${index}`,
                    isDone: false,
                }));
                allFlashcards.push(...newCards);
                setFlashcards([...allFlashcards]);
            }
            
            if (allFlashcards.length === 0) {
                 setError("لم يتمكن الذكاء الاصطناعي من إنشاء بطاقات من هذا النص. حاول مرة أخرى بنص مختلف.");
            }

        } catch (e) {
            setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع أثناء إنشاء البطاقات.');
        } finally {
            setIsLoading(false);
            setProcessingStatus(null);
        }
    }, [textContent]);

    const handleToggleDone = (id: string) => {
        setFlashcards(prev => 
            prev.map(card => card.id === id ? { ...card, isDone: !card.isDone } : card)
        );
    };

    const handleDownloadHtml = () => {
        const htmlString = generateFlashcardHtml(flashcards);
        const blob = new Blob([htmlString], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flashcards.html`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const filteredFlashcards = useMemo(() => {
        let statusFiltered = flashcards;
        if (statusFilter === 'active') {
            statusFiltered = flashcards.filter(c => !c.isDone);
        } else if (statusFilter === 'done') {
            statusFiltered = flashcards.filter(c => c.isDone);
        }

        if (difficultyFilter === 'all') {
            return statusFiltered;
        }
        
        return statusFiltered.filter(c => c.difficulty === difficultyFilter);
    }, [flashcards, statusFilter, difficultyFilter]);

    const groupedFlashcards = useMemo(() => {
        const grouped: Record<Difficulty, FlashcardData[]> = { easy: [], medium: [], hard: [] };
        filteredFlashcards.forEach(card => {
            grouped[card.difficulty]?.push(card);
        });
        return grouped;
    }, [filteredFlashcards]);

    const renderContent = () => {
        if (isLoading) {
             return (
                <div className="text-center py-10">
                    <svg className="animate-spin mx-auto h-12 w-12 text-cyan-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-lg text-gray-300">جاري إنشاء البطاقات التعليمية بجودة عالية...</p>
                    {processingStatus && (
                        <div className="mt-4 max-w-md mx-auto">
                            <p className="text-sm text-gray-400 mb-2">
                                {`جاري معالجة الجزء ${processingStatus.current} من ${processingStatus.total}`}
                            </p>
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                                <div className="bg-cyan-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${(processingStatus.current / processingStatus.total) * 100}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if (error) {
            return <div className="p-4 my-4 text-red-400 bg-red-900/50 rounded-md">{error}</div>;
        }

        if (flashcards.length > 0) {
            return (
                <div>
                     {difficultyOrder.map(level => (
                        groupedFlashcards[level].length > 0 && (
                            <div key={level} className="mb-12">
                                <h3 className="text-2xl font-bold text-gray-300 border-b-2 border-gray-700 pb-2 mb-6">
                                    {difficultyLabels[level]}
                                    <span className="text-base font-normal bg-gray-700 text-gray-400 mr-3 px-3 py-1 rounded-full">{groupedFlashcards[level].length}</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {groupedFlashcards[level].map(card => (
                                        <Flashcard 
                                            key={card.id} 
                                            {...card} 
                                            onToggleDone={() => handleToggleDone(card.id)} 
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    ))}
                    {filteredFlashcards.length === 0 && (
                        <div className="text-center py-10 bg-gray-800 rounded-lg">
                             <p className="text-lg text-gray-400">لا توجد بطاقات تطابق الفلتر المحدد.</p>
                        </div>
                    )}
                </div>
            );
        }

        return null; // Initial state before generation
    };

    return (
        <div className="w-full">
             <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-4 border-b border-gray-700 gap-4">
                 <div>
                    <h2 className="text-3xl font-bold text-gray-200">منشئ البطاقات التعليمية</h2>
                    <p className="text-gray-400 mt-1">حوّل محتواك إلى بطاقات تفاعلية للمراجعة.</p>
                 </div>
                <button
                    onClick={onBack}
                    className="px-4 py-2 text-sm font-medium text-cyan-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors duration-200 self-start sm:self-center"
                >
                    → العودة إلى المحرر
                </button>
            </div>

            {flashcards.length === 0 && !isLoading && (
                <div className="text-center bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-12">
                    <p className="text-lg text-gray-400 mb-6">
                        جاهز لتحويل النص المنسق إلى بطاقات تعليمية شاملة؟
                    </p>
                    <button 
                        onClick={handleGenerateFlashcards}
                        disabled={isLoading}
                        className="flex items-center justify-center mx-auto gap-3 px-8 py-4 text-xl font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-700 disabled:bg-gray-600 transition-all duration-200"
                    >
                        {isLoading ? "جاري الإنشاء..." : "✨ إنشاء البطاقات الآن"}
                    </button>
                </div>
            )}
            
            {flashcards.length > 0 && !isLoading && (
                 <div className="my-6 p-4 bg-gray-800 rounded-lg border border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-4 flex-wrap">
                        {/* Status Filter */}
                        <div className="flex items-center gap-2" role="group" aria-label="فلترة حسب الحالة">
                            <span className="font-semibold text-gray-300">الحالة:</span>
                            {(['all', 'active', 'done'] as StatusFilter[]).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setStatusFilter(f)}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                        statusFilter === f 
                                        ? 'bg-cyan-600 text-white' 
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    {f === 'all' ? `الكل` : f === 'active' ? `النشطة` : `المنجزة`}
                                </button>
                            ))}
                        </div>
                        {/* Difficulty Filter */}
                         <div className="flex items-center gap-2" role="group" aria-label="فلترة حسب الصعوبة">
                            <span className="font-semibold text-gray-300">الصعوبة:</span>
                            {(['all', 'easy', 'medium', 'hard'] as DifficultyFilter[]).map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDifficultyFilter(d)}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                        difficultyFilter === d
                                        ? 'bg-cyan-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    {d === 'all' ? 'الكل' : difficultyLabels[d as Difficulty]}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={handleDownloadHtml}
                        className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium text-cyan-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors duration-200 self-start sm:self-auto"
                    >
                        <DownloadIcon />
                        <span>تحميل HTML</span>
                    </button>
                </div>
            )}

            {renderContent()}

        </div>
    );
};