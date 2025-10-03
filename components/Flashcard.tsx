import React, { useState } from 'react';
import { PencilIcon } from './icons/PencilIcon';
import { XIcon } from './icons/XIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ColorSettings } from './FlashcardCreator';

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

const getContrastYIQ = (hexcolor: string): string => {
    hexcolor = hexcolor.replace("#", "");
    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#1f2937' : '#ffffff'; // returns black or white
};

interface FlashcardProps {
    question: string;
    answer: string;
    difficulty: 'easy' | 'medium' | 'hard';
    isDone: boolean;
    onToggleDone: () => void;
    onUpdate: (question: string, answer: string) => void;
    colorSettings: ColorSettings;
}

const difficultyStyles = {
    easy: { label: 'سهل' },
    medium: { label: 'متوسط' },
    hard: { label: 'صعب' }
};

export const Flashcard: React.FC<FlashcardProps> = ({ question, answer, difficulty, isDone, onToggleDone, onUpdate, colorSettings }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedQuestion, setEditedQuestion] = useState(question);
    const [editedAnswer, setEditedAnswer] = useState(answer);
    
    const style = difficultyStyles[difficulty] || difficultyStyles.medium;
    const badgeBgColor = colorSettings[`${difficulty}Badge` as keyof ColorSettings];
    const badgeTextColor = getContrastYIQ(badgeBgColor);

    const handleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (editedQuestion.trim() && editedAnswer.trim()) {
            onUpdate(editedQuestion, editedAnswer);
            setIsEditing(false);
        }
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(false);
        setEditedQuestion(question);
        setEditedAnswer(answer);
    };

    if (isEditing) {
        return (
            <div className="w-full h-72 flex flex-col p-4 bg-white border-2 border-blue-500 rounded-lg shadow-lg relative dark:bg-gray-800" aria-live="assertive">
                <div className="flex-grow flex flex-col gap-2">
                    <div>
                        <label htmlFor={`q-${question}`} className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1 block">سؤال</label>
                        <textarea
                            id={`q-${question}`}
                            value={editedQuestion}
                            onChange={(e) => setEditedQuestion(e.target.value)}
                            className="w-full h-24 p-2 bg-gray-50 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                            aria-label="Edit question"
                        />
                    </div>
                    <div>
                        <label htmlFor={`a-${answer}`} className="text-sm font-semibold text-amber-500 dark:text-amber-400 mb-1 block">إجابة</label>
                        <textarea
                            id={`a-${answer}`}
                            value={editedAnswer}
                            onChange={(e) => setEditedAnswer(e.target.value)}
                            className="w-full h-24 p-2 bg-gray-50 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                            aria-label="Edit answer"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                    <button onClick={handleCancel} className="flex items-center gap-1 px-3 py-1 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                        <XIcon />
                        <span>إلغاء</span>
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md">
                        <CheckIcon />
                        <span>حفظ</span>
                    </button>
                </div>
            </div>
        );
    }

    const cardStyle = {
        backgroundColor: colorSettings.cardBackground,
        color: colorSettings.cardText,
        borderColor: isDone ? '#2563eb' : colorSettings.cardBorder, // blue-600 for done
        borderWidth: isDone ? '2px' : '1px'
    };

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
                <div 
                    className="absolute w-full h-full flex flex-col justify-center items-center p-6 rounded-lg shadow-lg" 
                    style={{ ...cardStyle, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                    <span 
                        className="absolute top-3 right-3 px-2 py-0.5 text-xs font-semibold rounded-full"
                        style={{ backgroundColor: badgeBgColor, color: badgeTextColor }}
                    >
                        {style.label}
                    </span>
                    <p className="text-sm font-semibold text-blue-600 mb-2">سؤال</p>
                    <p className="text-lg">{question}</p>
                     <div className="absolute bottom-3 right-3 flex items-center gap-2">
                         <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(true);
                            }}
                            title="تعديل البطاقة"
                            className="flex items-center justify-center p-2 h-7 w-7 text-xs font-medium rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                            <PencilIcon />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleDone();
                            }}
                            title={isDone ? "إلغاء الإنجاز" : "تمييز كمنجز"}
                            className={`flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full transition-colors ${isDone ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
                        >
                            <CheckCircleIcon isDone={isDone} />
                            <span>{isDone ? 'مُنجز' : 'إنجاز'}</span>
                        </button>
                    </div>
                </div>
                {/* Back of card */}
                <div 
                    className="absolute w-full h-full flex flex-col justify-center items-center p-6 rounded-lg shadow-lg" 
                    style={{ ...cardStyle, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    <p className="text-sm font-semibold text-amber-500 mb-2">إجابة</p>
                    <p className="text-lg">{answer}</p>
                </div>
            </div>
        </div>
    );
};