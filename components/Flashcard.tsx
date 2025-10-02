import React, { useState } from 'react';

// Inlined icon component to avoid creating a new file
const CheckCircleIcon: React.FC<{isDone?: boolean; className?: string}> = ({ isDone, className="h-5 w-5" }) => (
    isDone ? (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
    )
);


interface FlashcardProps {
    question: string;
    answer: string;
    difficulty: 'easy' | 'medium' | 'hard';
    isDone: boolean;
    onToggleDone: () => void;
}

const difficultyStyles = {
    easy: {
        label: 'سهل',
        badge: 'bg-green-800 text-green-300',
        border: 'border-green-700',
    },
    medium: {
        label: 'متوسط',
        badge: 'bg-yellow-800 text-yellow-300',
        border: 'border-yellow-700',
    },
    hard: {
        label: 'صعب',
        badge: 'bg-red-800 text-red-300',
        border: 'border-red-700',
    }
};

export const Flashcard: React.FC<FlashcardProps> = ({ question, answer, difficulty, isDone, onToggleDone }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const style = difficultyStyles[difficulty] || difficultyStyles.medium;

    return (
        <div 
            className="w-full h-72 bg-transparent cursor-pointer group" 
            style={{ perspective: '1000px' }}
            onClick={() => setIsFlipped(!isFlipped)}
            onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsFlipped(!isFlipped); }}
            role="button"
            tabIndex={0}
            aria-live="polite"
        >
            <div 
                className={`relative w-full h-full text-center transition-transform duration-300 ease-in-out`}
                style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
            >
                {/* Front of card */}
                <div className={`absolute w-full h-full flex flex-col justify-center items-center p-6 bg-gray-800 border-2 rounded-lg shadow-lg ${isDone ? 'border-cyan-600' : 'border-gray-700'}`} style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                    <span className={`absolute top-3 right-3 px-2 py-0.5 text-xs font-semibold rounded-full ${style.badge}`}>
                        {style.label}
                    </span>
                    <p className="text-sm font-semibold text-cyan-400 mb-2">سؤال</p>
                    <p className="text-lg text-gray-200">{question}</p>
                     <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleDone();
                        }}
                        title={isDone ? "إلغاء الإنجاز" : "تمييز كمنجز"}
                        className={`absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full transition-colors ${isDone ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        <CheckCircleIcon isDone={isDone} />
                        <span>{isDone ? 'مُنجز' : 'إنجاز'}</span>
                    </button>
                </div>
                {/* Back of card */}
                <div className={`absolute w-full h-full flex flex-col justify-center items-center p-6 bg-gray-700 border-2 rounded-lg shadow-lg ${isDone ? 'border-cyan-600' : 'border-gray-600'}`} style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    <p className="text-sm font-semibold text-yellow-400 mb-2">إجابة</p>
                    <p className="text-lg text-gray-200">{answer}</p>
                </div>
            </div>
        </div>
    );
};