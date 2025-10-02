import React, { useState, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { formatTextWithGemini, translateHtmlWithGemini } from './services/geminiService';
import { FlashcardCreator } from './components/FlashcardCreator';

const MIN_CHUNK_WORDS = 1000;
const MAX_CHUNK_WORDS = 2000;

const wordCount = (str: string): number => str.trim().split(/\s+/).filter(Boolean).length;

const splitTextIntoChunks = (text: string): string[] => {
    if (wordCount(text) <= MAX_CHUNK_WORDS) {
        return [text];
    }

    // Step 1: Create initial chunks, splitting oversized paragraphs intelligently.
    const initialChunks: string[] = [];
    let currentChunk = "";
    const paragraphs = text.split(/\n{2,}/).filter(p => p.trim().length > 0);

    for (const paragraph of paragraphs) {
        // Case 1: A single paragraph is larger than the max chunk size.
        if (wordCount(paragraph) > MAX_CHUNK_WORDS) {
            if (currentChunk.trim()) {
                initialChunks.push(currentChunk.trim());
                currentChunk = "";
            }
            // Split the oversized paragraph by sentences and create chunks from them.
            const sentences = paragraph.match(/[^.!?؟]+[.!?؟]*\s*/g) || [paragraph];
            let sentenceChunk = "";
            for (const sentence of sentences) {
                if (wordCount(sentenceChunk) + wordCount(sentence) > MAX_CHUNK_WORDS) {
                    initialChunks.push(sentenceChunk.trim());
                    sentenceChunk = sentence.trim();
                } else {
                    sentenceChunk += (sentenceChunk ? " " : "") + sentence.trim();
                }
            }
            if (sentenceChunk.trim()) {
                initialChunks.push(sentenceChunk.trim());
            }
            continue;
        }

        // Case 2: Normal paragraph handling.
        if (wordCount(currentChunk) + wordCount(paragraph) > MAX_CHUNK_WORDS) {
            if (currentChunk.trim()) {
                initialChunks.push(currentChunk.trim());
            }
            currentChunk = paragraph;
        } else {
            currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
        }
    }
    if (currentChunk.trim()) {
        initialChunks.push(currentChunk.trim());
    }

    // Step 2: Merge small chunks together to ensure they have enough context.
    if (initialChunks.length <= 1) {
        return initialChunks;
    }
    
    const mergedChunks: string[] = [];
    let buffer = "";
    for (const chunk of initialChunks) {
        buffer += (buffer ? "\n\n" : "") + chunk;
        if (wordCount(buffer) >= MIN_CHUNK_WORDS) {
            mergedChunks.push(buffer);
            buffer = "";
        }
    }

    // Handle the last remaining buffer.
    if (buffer.trim()) {
        const lastMergedChunk = mergedChunks.length > 0 ? mergedChunks[mergedChunks.length - 1] : null;

        // If the buffer is tiny, try to append it to the last chunk.
        if (lastMergedChunk && wordCount(buffer) < MIN_CHUNK_WORDS / 2) {
            // Only merge if it doesn't create an oversized chunk.
            if (wordCount(lastMergedChunk) + wordCount(buffer) <= MAX_CHUNK_WORDS) {
                 mergedChunks[mergedChunks.length - 1] += "\n\n" + buffer;
            } else {
                mergedChunks.push(buffer);
            }
        } else {
            // Otherwise, it's substantial enough to be its own chunk.
            mergedChunks.push(buffer);
        }
    }

    return mergedChunks.filter(c => c.trim().length > 0);
};

const mergeHtmlChunks = (htmlChunks: string[]): string => {
        if (htmlChunks.length < 1) {
            return "";
        }
        
        // Take head from the first chunk
        const firstChunkWithHead = htmlChunks[0];
        const headMatch = firstChunkWithHead.match(/<head>([\s\S]*?)<\/head>/);
        const headContent = headMatch ? headMatch[1] : '<meta charset="UTF-8"><title>Merged Document</title>';

        const bodyContents = htmlChunks.map(chunk => {
            const bodyMatch = chunk.match(/<body[^>]*>([\s\S]*?)<\/body>/);
            // Return the chunk itself if body tags are not found, as a fallback.
            return bodyMatch ? bodyMatch[1] : chunk;
        }).join('\n<hr style="border-top: 1px dashed #ccc; margin: 2rem 0;" />\n');

        const finalHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                ${headContent}
            </head>
            <body>
                ${bodyContents}
            </body>
            </html>
        `;

        return finalHtml.trim();
};


const App: React.FC = () => {
    const [inputText, setInputText] = useState<string>('');
    const [formattedText, setFormattedText] = useState<string>('');
    const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
    const [textColor, setTextColor] = useState<string>('#000000');
    const [appStatus, setAppStatus] = useState<'idle' | 'formatting' | 'translating'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [outputLanguage, setOutputLanguage] = useState<'ar' | 'en'>('ar');
    const [processingStatus, setProcessingStatus] = useState<{current: number; total: number} | null>(null);
    const [processingMode, setProcessingMode] = useState<'speed' | 'quality'>('speed');
    const [fontFamily, setFontFamily] = useState<string>('Tajawal');
    const [lineHeight, setLineHeight] = useState<number>(1.8);
    const [headingColor, setHeadingColor] = useState<string>('#0d6efd');
    const [view, setView] = useState<'editor' | 'flashcards'>('editor');
    const [htmlForFlashcards, setHtmlForFlashcards] = useState<string>('');


    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(e.target.value);
    }, []);

    const handleFormat = useCallback(async () => {
        if (!inputText.trim()) {
            setFormattedText('');
            return;
        }
        
        setAppStatus('formatting');
        setError(null);
        setFormattedText('');
        setProcessingStatus(null);
        
        try {
            const styleOptions = { fontFamily, lineHeight, headingColor };
            const textChunks = splitTextIntoChunks(inputText);
            const isMultiChunk = textChunks.length > 1;

            if (isMultiChunk) {
                const allFormattedChunks: string[] = [];
                setProcessingStatus({ current: 1, total: textChunks.length });
                
                for (let i = 0; i < textChunks.length; i++) {
                    const chunkToProcess = textChunks[i];
                    setProcessingStatus({ current: i + 1, total: textChunks.length });
                    
                    let chunkResult = '';
                    const stream = formatTextWithGemini(chunkToProcess, backgroundColor, textColor, outputLanguage, processingMode, styleOptions);
                    for await (const chunk of stream) {
                        chunkResult += chunk;
                    }
                    allFormattedChunks.push(chunkResult);
                }
                
                const finalHtml = mergeHtmlChunks(allFormattedChunks);
                setFormattedText(finalHtml);

            } else {
                // Single chunk logic with streaming to UI
                let finalResult = '';
                const stream = formatTextWithGemini(inputText, backgroundColor, textColor, outputLanguage, processingMode, styleOptions);
                for await (const chunk of stream) {
                    finalResult += chunk;
                    setFormattedText(finalResult);
                }
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع.');
        } finally {
            setAppStatus('idle');
            setProcessingStatus(null);
        }
    }, [inputText, backgroundColor, textColor, outputLanguage, processingMode, fontFamily, lineHeight, headingColor]);

    const handleTranslate = useCallback(async () => {
        if (!formattedText) return;
        const targetLanguage = outputLanguage === 'ar' ? 'en' : 'ar';
        const originalFormattedText = formattedText; // Store the text to be translated.
    
        setAppStatus('translating');
        setError(null);
        setFormattedText(''); // Clear the display for the new stream.
    
        try {
            let translatedResult = '';
            const stream = translateHtmlWithGemini(originalFormattedText, targetLanguage); // Use the stored text
            for await (const chunk of stream) {
                translatedResult += chunk;
                setFormattedText(translatedResult);
            }
            setOutputLanguage(targetLanguage);
        } catch (e) {
            // In case of error, restore the pre-translation content.
            setFormattedText(originalFormattedText);
            setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع أثناء الترجمة.');
        } finally {
            setAppStatus('idle');
        }
    }, [formattedText, outputLanguage]);

    const handleCreateFlashcards = useCallback(() => {
        if (formattedText) {
            setHtmlForFlashcards(formattedText);
            setView('flashcards');
        }
    }, [formattedText]);
    
    const isLoading = appStatus === 'formatting';
    const isTranslating = appStatus === 'translating';

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <Header />
                <main className="mt-8">
                    {view === 'editor' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <InputPanel
                                inputText={inputText}
                                onInputChange={handleInputChange}
                                onFormat={handleFormat}
                                backgroundColor={backgroundColor}
                                onBackgroundColorChange={setBackgroundColor}
                                textColor={textColor}
                                onTextColorChange={setTextColor}
                                isLoading={isLoading}
                                processingStatus={processingStatus}
                                outputLanguage={outputLanguage}
                                onOutputLanguageChange={setOutputLanguage}
                                processingMode={processingMode}
                                onProcessingModeChange={setProcessingMode}
                                fontFamily={fontFamily}
                                onFontFamilyChange={setFontFamily}
                                lineHeight={lineHeight}
                                onLineHeightChange={setLineHeight}
                                headingColor={headingColor}
                                onHeadingColorChange={setHeadingColor}
                            />
                            <OutputPanel
                                formattedText={formattedText}
                                isLoading={isLoading}
                                isTranslating={isTranslating}
                                processingStatus={processingStatus}
                                error={error}
                                outputLanguage={outputLanguage}
                                onTranslate={handleTranslate}
                                onCreateFlashcards={handleCreateFlashcards}
                            />
                        </div>
                    ) : (
                        <FlashcardCreator
                            htmlContent={htmlForFlashcards}
                            onBack={() => setView('editor')}
                        />
                    )}
                </main>
                <footer className="text-center mt-12 py-4 border-t border-gray-700">
                    <p className="text-sm text-gray-500">
                        أنشئ هذا الموقع بواسطة عمر ابراهيم
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default App;