import { NextRequest, NextResponse } from "next/server"

// Mock translation service - in production, you would use Google Translate API, Azure Translator, or similar
const MOCK_TRANSLATIONS = {
  'en': {
    'es': 'Hola, ¿cómo estás?',
    'fr': 'Bonjour, comment allez-vous?',
    'de': 'Hallo, wie geht es dir?',
    'it': 'Ciao, come stai?',
    'pt': 'Olá, como você está?',
    'ru': 'Привет, как дела?',
    'ja': 'こんにちは、元気ですか？',
    'ko': '안녕하세요, 어떻게 지내세요?',
    'zh': '你好，你好吗？',
    'ar': 'مرحبا، كيف حالك؟',
    'hi': 'नमस्ते, आप कैसे हैं?'
  },
  'es': {
    'en': 'Hello, how are you?',
    'fr': 'Bonjour, comment allez-vous?',
    'de': 'Hallo, wie geht es dir?',
    'it': 'Ciao, come stai?',
    'pt': 'Olá, como você está?',
    'ru': 'Привет, как дела?',
    'ja': 'こんにちは、元気ですか？',
    'ko': '안녕하세요, 어떻게 지내세요?',
    'zh': '你好，你好吗？',
    'ar': 'مرحبا، كيف حالك؟',
    'hi': 'नमस्ते, आप कैसे हैं?'
  }
  // Add more language pairs as needed
};

const DETECTED_LANGUAGES = {
  'Hello': 'en',
  'Hola': 'es',
  'Bonjour': 'fr',
  'Hallo': 'de',
  'Ciao': 'it',
  'Olá': 'pt',
  'Привет': 'ru',
  'こんにちは': 'ja',
  '안녕하세요': 'ko',
  '你好': 'zh',
  'مرحبا': 'ar',
  'नमस्ते': 'hi'
};

// Simple language detection based on common words
function detectLanguage(text: string): string {
  const lowerText = text.toLowerCase();
  
  for (const [word, lang] of Object.entries(DETECTED_LANGUAGES)) {
    if (lowerText.includes(word.toLowerCase())) {
      return lang;
    }
  }
  
  // Default to English if no pattern matches
  return 'en';
}

// Type guard to check if a string is a top-level language key in MOCK_TRANSLATIONS
function isTopLevelLang(lang: string): lang is keyof typeof MOCK_TRANSLATIONS {
  return Object.prototype.hasOwnProperty.call(MOCK_TRANSLATIONS, lang)
}

// Mock translation function
function translateText(text: string, sourceLang: string, targetLang: string): { translatedText: string; confidence: number } {
  // If source and target are the same, return original
  if (sourceLang === targetLang) {
    return { translatedText: text, confidence: 1.0 };
  }
  
  // Check if we have a direct translation
  if (isTopLevelLang(sourceLang)) {
    const table = MOCK_TRANSLATIONS[sourceLang]
    if (targetLang in table) {
      return {
        translatedText: table[targetLang as keyof typeof table],
        confidence: 0.95
      }
    }
  }
  
  // Check if we have a reverse translation
  if (isTopLevelLang(targetLang)) {
    const reverseTable = MOCK_TRANSLATIONS[targetLang]
    if (sourceLang in reverseTable) {
      // This is a simplified reverse lookup - in reality, you'd need proper reverse translations
      return {
        translatedText: `[Translated from ${sourceLang} to ${targetLang}] ${text}`,
        confidence: 0.7
      }
    }
  }
  
  // Fallback: return text with translation note
  return {
    translatedText: `[Translated from ${sourceLang} to ${targetLang}] ${text}`,
    confidence: 0.5
  };
}

// POST - Translate a message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messageId, text, sourceLanguage, targetLanguage, userId } = body

    if (!messageId || !text || !targetLanguage) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log(`🌐 Translating message ${messageId} from ${sourceLanguage || 'auto'} to ${targetLanguage}`)

    // Detect source language if not provided
    const detectedSourceLang = sourceLanguage === 'auto' ? detectLanguage(text) : sourceLanguage

    // Perform translation
    const { translatedText, confidence } = translateText(text, detectedSourceLang, targetLanguage)

    const translation = {
      id: `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      messageId,
      originalText: text,
      translatedText,
      sourceLanguage: detectedSourceLang,
      targetLanguage,
      confidence,
      translatedAt: new Date().toISOString(),
      isAuto: sourceLanguage === 'auto',
      userId
    }

    console.log('✅ Translation completed:', {
      sourceLang: detectedSourceLang,
      targetLang: targetLanguage,
      confidence: Math.round(confidence * 100) + '%'
    })

    return NextResponse.json({
      success: true,
      data: translation
    })
  } catch (error) {
    console.error('Error translating message:', error)
    return NextResponse.json(
      { success: false, error: 'Translation failed' },
      { status: 500 }
    )
  }
}

// GET - Get supported languages
export async function GET(request: NextRequest) {
  try {
    const supportedLanguages = [
      { code: 'auto', name: 'Auto-detect', flag: '🌐' },
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Spanish', flag: '🇪🇸' },
      { code: 'fr', name: 'French', flag: '🇫🇷' },
      { code: 'de', name: 'German', flag: '🇩🇪' },
      { code: 'it', name: 'Italian', flag: '🇮🇹' },
      { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
      { code: 'ru', name: 'Russian', flag: '🇷🇺' },
      { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
      { code: 'ko', name: 'Korean', flag: '🇰🇷' },
      { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
      { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
      { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
      { code: 'th', name: 'Thai', flag: '🇹🇭' },
      { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
      { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
      { code: 'pl', name: 'Polish', flag: '🇵🇱' },
      { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
      { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
      { code: 'da', name: 'Danish', flag: '🇩🇰' },
      { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
      { code: 'fi', name: 'Finnish', flag: '🇫🇮' }
    ]

    return NextResponse.json({
      success: true,
      data: supportedLanguages
    })
  } catch (error) {
    console.error('Error fetching supported languages:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch languages' },
      { status: 500 }
    )
  }
}
