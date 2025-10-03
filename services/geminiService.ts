import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

interface StyleOptions {
    fontFamily: string;
    lineHeight: number;
    headingColor: string;
}

const fonts: { [key: string]: { name: string; googleFont: string } } = {
    'Tajawal': { name: 'Tajawal', googleFont: 'Tajawal:wght@400;500;700' },
    'Cairo': { name: 'Cairo', googleFont: 'Cairo:wght@400;500;700' },
    'Noto Sans Arabic': { name: 'Noto Sans Arabic', googleFont: 'Noto+Sans+Arabic:wght@400;500;700' },
    'Amiri': { name: 'Amiri', googleFont: 'Amiri:wght@400;700' },
};


const createFormatPrompt = (backgroundColor: string, textColor: string, outputLanguage: 'ar' | 'en', styleOptions: StyleOptions) => {
    const selectedFont = fonts[styleOptions.fontFamily] || fonts['Tajawal'];
    const fontLink = selectedFont.googleFont.replace(/\s/g, '+');
    
    return `
Your task is to convert unstructured text into a complete, well-structured, and standards-compliant HTML document. You must follow these rules precisely.

**CRITICAL RULES - YOU MUST FOLLOW THESE:**
1.  **Content Integrity:** Your primary job is to structure and format the user's original text. You **must not** summarize, rephrase, add, or delete any of the user's original words. The word count of the output's visible text must be identical to the input text.
2.  **Language & Translation:** The final HTML's visible text **must** be in **${outputLanguage}**.
    *   If the input text's language is different from **${outputLanguage}**, you **must** translate it accurately.
    *   If the input text is already in **${outputLanguage}**, you **must** use the text as-is, without any modification or rephrasing.
3.  **HTML Structure & Emphasis:** You must analyze the text to identify its semantic structure and add appropriate emphasis.
    *   **Emphasis:** To improve readability and highlight key information, you **must** identify important terms, concepts, or key phrases within the text and wrap them in \`<strong>\` tags. This is a critical step.
    *   **Markdown Conversion:** Recognize and convert common Markdown syntax into semantic HTML tags:
        *   Headings: \`# Heading 1\` -> \`<h1>Heading 1</h1>\`, \`## Heading 2\` -> \`<h2>Heading 2</h2>\`, etc.
        *   Bold: \`**bold text**\` -> \`<strong>bold text</strong>\` (This should also be used for emphasis).
        *   Italics: \`*italic text*\` -> \`<em>italic text</em>\`
        *   Unordered Lists: Lines starting with \`*\`, \`-\`, or \`+\` should be converted into \`<ul>\` and \`<li>\` tags.
        *   Ordered Lists: Lines starting with \`1.\`, \`2.\`, etc., should be converted into \`<ol>\` and \`<li>\` tags.
        *   Paragraphs: Separate blocks of text with \`<p>\` tags.
    *   Do **NOT** use any inline style attributes for formatting. Use semantic tags only.
4.  **Page Template:** You **must** use the exact \`<head>\` section provided below. Insert the user's content within the \`<body>\` tags.

---
**REQUIRED \`<head>\` TEMPLATE:**
\`\`\`html
<head>
    <meta charset="UTF-8">
    <title>Formatted Document</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=${fontLink}&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: '${selectedFont.name}', sans-serif;
            line-height: ${styleOptions.lineHeight};
            padding: 2rem 4rem;
            color: ${textColor};
            background-color: ${backgroundColor};
            direction: ${outputLanguage === 'ar' ? 'rtl' : 'ltr'};
        }
        h1, h2, h3, h4, h5, h6 {
            font-family: '${selectedFont.name}', sans-serif;
            color: ${styleOptions.headingColor};
            font-weight: 700;
            margin-top: 2.5rem;
            margin-bottom: 1.25rem;
            line-height: 1.3;
        }
        h1 {
            font-size: 2.8em;
            border-bottom: 3px solid ${styleOptions.headingColor};
            padding-bottom: 0.5rem;
            margin-bottom: 2rem;
        }
        h2 { font-size: 2.2em; }
        h3 { font-size: 1.7em; }
        p { margin-bottom: 1.2rem; font-size: 1.1em; }
        ul, ol { padding-inline-start: 2rem; margin-bottom: 1.2rem; }
        li { margin-bottom: 0.6rem; }
        strong { color: ${styleOptions.headingColor}; font-weight: 700; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: start; }
        th { background-color: #f7f7f7; }
    </style>
</head>
\`\`\`
---
**Final Output Rule:** Your response **must** be only the raw HTML code, starting with \`<!DOCTYPE html>\`. Do **NOT** include any explanations or markdown fences.

Now, process the following text:
`;
}
export async function* formatTextWithGemini(text: string, backgroundColor: string, textColor: string, outputLanguage: 'ar' | 'en', mode: 'speed' | 'quality', styleOptions: StyleOptions): AsyncGenerator<string, void, undefined> {
  if (!text.trim()) {
    return;
  }
  try {
    const fullPrompt = `${createFormatPrompt(backgroundColor, textColor, outputLanguage, styleOptions)}\n\n---\n\n${text}`;
    
    const config: {
      safetySettings: typeof safetySettings;
      thinkingConfig?: { thinkingBudget: number };
    } = {
      safetySettings,
    };

    if (mode === 'speed') {
      config.thinkingConfig = { thinkingBudget: 0 };
    }

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: config
    });

    let buffer = '';
    for await (const chunk of responseStream) {
        // The first chunk might be empty if safety checks are running.
        if (chunk && chunk.text) {
            buffer += chunk.text;
            // Clean the buffer on the fly to remove markdown
            const cleanedBuffer = buffer.replace(/^```html\n|```$/g, '');
            yield cleanedBuffer;
            // Once we have yielded the cleaned version, we can clear the original buffer
            // to avoid sending the same content twice.
            buffer = ''; 
        }
    }
     // Final cleanup in case the closing ``` is in the last chunk
    const finalCleaned = buffer.replace(/^```html\n|```$/g, '').trim();
    if(finalCleaned) {
        yield finalCleaned;
    }


  } catch (error) {
    console.error("Error formatting text with Gemini:", error);
    let errorMessage = "فشل في تنسيق النص. يرجى المحاولة مرة أخرى.";
    if (error instanceof Error) {
        if (error.message.includes("SAFETY") || error.message.includes("السلامة")) {
            errorMessage = "فشل إنشاء المحتوى بسبب قيود السلامة. يرجى مراجعة النص المدخل.";
        } else {
             errorMessage = `فشل في تنسيق النص. التفاصيل: ${error.message}`;
        }
    }
    throw new Error(errorMessage);
  }
};

export async function* improveTextWithGemini(text: string): AsyncGenerator<string, void, undefined> {
  if (!text.trim()) {
    return;
  }
  try {
    const prompt = `
Your role is to function as a highly precise text formatting utility, specializing in scientific and chemical notations.
Your task is to reformat the provided text based on the following strict rules. You must not alter the core meaning, wording, or length of the original text.

**Formatting Rules:**

1.  **Chemical Formula Subscripts:** Identify chemical formulas and reformat them using Unicode subscript characters for numerical values.
    *   Example Input: \`H2O\`, \`C6H12O6\`
    *   Example Output: \`H₂O\`, \`C₆H₁₂O₆\`

2.  **Scientific Notation Superscripts:** Convert caret (\`^\`) notation for exponents into the corresponding Unicode superscript characters. This applies to numbers, signs (\`+\`, \`-\`), and variables.
    *   Example Input: \`sp^2\`, \`10^-6\`, \`e^-x\`, \`Ca^2+\`
    *   Example Output: \`sp²\`, \`10⁻⁶\`, \`e⁻ˣ\`, \`Ca²⁺\`

**Critical Directives:**

*   **Content Preservation:** You **must not** add, remove, summarize, or rephrase any of the user's original text. Your only function is to apply the formatting rules above.
*   **Output Format:** The final output must be **only** the raw, modified text. Do not include any explanations, comments, or markdown formatting like \`\`\` \`.

Now, process the following text:
---
${text}
---
`;

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            safetySettings,
            thinkingConfig: { thinkingBudget: 0 } 
        }
    });

    for await (const chunk of responseStream) {
        if (chunk && chunk.text) {
            yield chunk.text;
        }
    }
  } catch (error) {
    console.error("Error improving text with Gemini:", error);
    let errorMessage = "فشل في تحسين النص. يرجى المحاولة مرة أخرى.";
    if (error instanceof Error) {
        if (error.message.includes("SAFETY")) {
            errorMessage = "فشل تحسين المحتوى بسبب قيود السلامة.";
        } else {
             errorMessage = `فشل في تحسين النص. التفاصيل: ${error.message}`;
        }
    }
    throw new Error(errorMessage);
  }
}

const createTranslatePrompt = (targetLanguage: 'ar' | 'en') => `
Goal: Translate **only the user-visible text content** within the provided HTML document to **${targetLanguage}**.

**Critical Rules:**
1.  **Preserve Structure:** Do **NOT** alter any HTML tags or attributes. The HTML skeleton must remain identical.
2.  **Translate Text Only:** Only translate text inside tags like \`<h1>\`, \`<p>\`, \`<li>\`, etc. Do not translate code inside the \`<style>\` block.
3.  **Update Directionality:**
    *   Update the main tag to \`<html lang="${targetLanguage}" dir="${targetLanguage === 'ar' ? 'rtl' : 'ltr'}">\`.
    *   **Inside the \`<style>\` block**, update the \`body\` rule to be \`direction: ${targetLanguage === 'ar' ? 'rtl' : 'ltr'};\`.
4.  **Output Format:** Respond with **only the complete, translated HTML code**. No explanations or markdown fences.

Now, translate the following HTML:
`;

export async function* translateHtmlWithGemini(htmlContent: string, targetLanguage: 'ar' | 'en'): AsyncGenerator<string, void, undefined> {
    if (!htmlContent.trim()) {
        return;
    }
    try {
        const fullPrompt = `${createTranslatePrompt(targetLanguage)}\n\n---\n\n${htmlContent}`;
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                safetySettings,
            }
        });

        let buffer = '';
        for await (const chunk of responseStream) {
            if (chunk && chunk.text) {
                buffer += chunk.text;
                const cleanedBuffer = buffer.replace(/^```html\n|```$/g, '');
                yield cleanedBuffer;
                buffer = ''; 
            }
        }
        
        const finalCleaned = buffer.replace(/^```html\n|```$/g, '').trim();
        if(finalCleaned) {
            yield finalCleaned;
        }

    } catch (error) {
        console.error("Error translating HTML with Gemini:", error);
        let errorMessage = "فشل في ترجمة النص. يرجى المحاولة مرة أخرى.";
        if (error instanceof Error) {
            if (error.message.includes("SAFETY")) {
                errorMessage = "فشلت الترجمة بسبب قيود السلامة.";
            } else {
                errorMessage = `فشل في ترجمة النص. التفاصيل: ${error.message}`;
            }
        }
        throw new Error(errorMessage);
    }
};

export const generateFlashcardsFromText = async (text: string): Promise<{ question: string; answer: string; difficulty: 'easy' | 'medium' | 'hard'; }[]> => {
    if (!text.trim()) {
        return [];
    }

    const flashcardSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: {
              type: Type.STRING,
              description: "A clear, concise question based on a key piece of information from the text.",
            },
            answer: {
              type: Type.STRING,
              description: "A direct and brief answer to the corresponding question, taken from the text.",
            },
            difficulty: {
              type: Type.STRING,
              description: "The estimated difficulty of the question. Must be one of: 'easy', 'medium', or 'hard'.",
              enum: ['easy', 'medium', 'hard'],
            },
          },
          required: ["question", "answer", "difficulty"],
        },
    };

    const prompt = `
        Your task is to act as an expert study assistant. Your primary goal is to generate a **comprehensive** set of flashcards from the provided text, ensuring **all** key information is covered.

        **CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE:**
        1.  **BE EXHAUSTIVE:** Process the **entire text** from beginning to end. Do not skip any sections. Your goal is to create as many high-quality flashcards as needed to cover every important concept, definition, fact, and piece of information.
        2.  **FORMAT:** For each piece of key information, create one clear and concise question and a direct, brief answer based *only* on the provided text.
        3.  **DIFFICULTY RATING:** For each flashcard, you **must** assign a difficulty level. The difficulty should be one of three values:
            *   'easy': For foundational concepts or straightforward facts.
            *   'medium': For information that requires some comprehension or connecting ideas.
            *   'hard': For complex topics, nuanced details, or information that requires deeper analysis.
        4.  **OUTPUT:** Your final output **must** be a valid JSON array of objects. Each object must have three keys: "question", "answer", and "difficulty".
        5.  **LANGUAGE:** Ensure the language of the flashcards matches the language of the input text.

        Now, process the following text thoroughly:
        ---
        ${text}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                safetySettings,
                responseMimeType: "application/json",
                responseSchema: flashcardSchema,
            }
        });
        
        const jsonText = response.text.trim();
        if (!jsonText) {
            console.warn("Received empty response from Gemini for flashcard generation.");
            return [];
        }
        // Sometimes the model might wrap the JSON in markdown, let's strip it.
        const cleanedJson = jsonText.replace(/^```json\s*|```$/g, '');
        return JSON.parse(cleanedJson);

    } catch (error) {
        console.error("Error generating flashcards with Gemini:", error);
        let errorMessage = "فشل في إنشاء البطاقات التعليمية. يرجى المحاولة مرة أخرى.";
         if (error instanceof Error) {
            if (error.message.includes("SAFETY")) {
                errorMessage = "فشل إنشاء المحتوى بسبب قيود السلامة. يرجى مراجعة النص المدخل.";
            } else {
                 errorMessage = `فشل في إنشاء البطاقات التعليمية. التفاصيل: ${error.message}`;
            }
        }
        throw new Error(errorMessage);
    }
};