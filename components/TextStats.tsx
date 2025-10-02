import React, { useMemo } from 'react';
import { StatBox } from './StatBox';

interface TextStatsProps {
    text: string;
}

const formatTime = (words: number, wpm: number): string => {
    if (words === 0) return "0 ثانية";
    const minutes = words / wpm;
    const totalSeconds = Math.round(minutes * 60);
    if (totalSeconds < 60) {
        return `${totalSeconds} ثانية`;
    }
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    
    let result = '';
    if (m > 0) {
        result += `${m} ${m > 1 ? 'دقائق' : 'دقيقة'}`;
    }
    if (s > 0) {
        if (result) result += ' و ';
        result += `${s} ${s > 1 ? 'ثواني' : 'ثانية'}`;
    }
    return result || "0 ثانية";
};

export const TextStats: React.FC<TextStatsProps> = ({ text }) => {
    const stats = useMemo(() => {
        const trimmedText = text.trim();
        const words = trimmedText ? trimmedText.split(/\s+/).filter(Boolean) : [];
        const wordCount = words.length;
        const charCount = text.length;
        const charCountNoSpaces = text.replace(/\s/g, '').length;
        const sentenceCount = text.match(/[^.!?؟]+[.!?؟]+/g)?.length || (trimmedText ? 1 : 0);
        const paragraphCount = trimmedText ? trimmedText.split(/\n+/).filter(p => p.trim()).length : 0;
        const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[.,!?;:"'()]/g, ''))).size;
        
        return {
            words: wordCount,
            characters: charCount,
            sentences: sentenceCount,
            paragraphs: paragraphCount,
            charactersNoSpaces: charCountNoSpaces,
            uniqueWords: uniqueWords,
            readingTime: formatTime(wordCount, 238), // Avg. Arabic reading speed
            speakingTime: formatTime(wordCount, 150),
        };
    }, [text]);

    const statItems = [
        { label: 'الكلمات', value: stats.words },
        { label: 'الأحرف', value: stats.characters },
        { label: 'الجمل', value: stats.sentences },
        { label: 'الفقرات', value: stats.paragraphs },
        { label: 'وقت القراءة', value: stats.readingTime },
        { label: 'وقت الكلام', value: stats.speakingTime },
        { label: 'الأحرف (بدون مسافات)', value: stats.charactersNoSpaces },
        { label: 'الكلمات الفريدة', value: stats.uniqueWords },
    ];

    return (
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statItems.map(item => (
                <StatBox key={item.label} label={item.label} value={item.value} />
            ))}
        </dl>
    );
};
