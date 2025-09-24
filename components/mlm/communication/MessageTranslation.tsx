'use client';

import React, { useState, useEffect } from 'react';
import { 
  Languages, 
  Globe, 
  Check, 
  X, 
  RotateCcw, 
  Download,
  Copy,
  Volume2,
  VolumeX,
  Settings,
  ChevronDown,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface Translation {
  id: string;
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
  translatedAt: Date;
  isAuto: boolean;
}

interface MessageTranslationProps {
  message: {
    id: string;
    content: string;
    sender: {
      id: string;
      name: string;
      language?: string;
    };
  };
  currentUserLanguage?: string;
  onTranslate?: (messageId: string, targetLanguage: string) => Promise<Translation>;
  onSetLanguage?: (language: string) => void;
  className?: string;
}

const SUPPORTED_LANGUAGES = [
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
];

export default function MessageTranslation({
  message,
  currentUserLanguage = 'en',
  onTranslate,
  onSetLanguage,
  className = ''
}: MessageTranslationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(currentUserLanguage);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Initialize speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  // Check if message needs translation
  const needsTranslation = message.sender.language && 
    message.sender.language !== currentUserLanguage && 
    message.sender.language !== 'auto';

  // Get existing translation for selected language
  const existingTranslation = translations.find(t => 
    t.targetLanguage === selectedLanguage && t.originalText === message.content
  );

  const handleTranslate = async () => {
    if (!onTranslate || isTranslating) return;

    setIsTranslating(true);
    setError(null);

    try {
      const translation = await onTranslate(message.id, selectedLanguage);
      
      // Add or update translation
      setTranslations(prev => {
        const filtered = prev.filter(t => 
          !(t.targetLanguage === selectedLanguage && t.originalText === message.content)
        );
        return [...filtered, translation];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    setShowLanguageSelector(false);
    
    if (onSetLanguage) {
      onSetLanguage(languageCode);
    }
  };

  const handleSpeak = (text: string, language: string) => {
    if (!speechSynthesis || isPlaying) return;

    // Stop any current speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    speechSynthesis.speak(utterance);
  };

  const handleStopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const handleCopyTranslation = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const handleDownloadTranslation = (translation: Translation) => {
    const content = `Original (${translation.sourceLanguage}): ${translation.originalText}\n\nTranslated (${translation.targetLanguage}): ${translation.translatedText}\n\nTranslated on: ${translation.translatedAt.toLocaleString()}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translation-${message.id}-${translation.targetLanguage}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLanguageName = (code: string) => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code)?.name || code;
  };

  const getLanguageFlag = (code: string) => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code)?.flag || '🌐';
  };

  if (!needsTranslation && !isExpanded) {
    return null;
  }

  return (
    <div className={`border-t border-gray-200 pt-3 ${className}`}>
      {/* Translation Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Languages className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Translation</span>
          {needsTranslation && (
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
              Auto-translate available
            </span>
          )}
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <span>{isExpanded ? 'Hide' : 'Show'}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Language Selector */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Translate to:</span>
            <div className="relative">
              <button
                onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span>{getLanguageFlag(selectedLanguage)}</span>
                <span className="text-sm">{getLanguageName(selectedLanguage)}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showLanguageSelector && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {SUPPORTED_LANGUAGES.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 text-left"
                    >
                      <span className="text-lg">{language.flag}</span>
                      <span className="text-sm text-gray-700">{language.name}</span>
                      {selectedLanguage === language.code && (
                        <Check className="w-4 h-4 text-blue-500 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleTranslate}
              disabled={isTranslating || existingTranslation !== undefined}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-sm rounded-lg transition-colors flex items-center space-x-2"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Translating...</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  <span>Translate</span>
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          {/* Translation Results */}
          {existingTranslation && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    {getLanguageFlag(existingTranslation.targetLanguage)} {getLanguageName(existingTranslation.targetLanguage)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {Math.round(existingTranslation.confidence * 100)}% confidence
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleSpeak(existingTranslation.translatedText, existingTranslation.targetLanguage)}
                    disabled={isPlaying}
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Speak translation"
                  >
                    {isPlaying ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleCopyTranslation(existingTranslation.translatedText)}
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Copy translation"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDownloadTranslation(existingTranslation)}
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Download translation"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-gray-800 leading-relaxed">
                {existingTranslation.translatedText}
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  Translated {existingTranslation.translatedAt.toLocaleString()}
                  {existingTranslation.isAuto && ' (Auto)'}
                </span>
                
                <button
                  onClick={() => handleStopSpeaking()}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  Stop speaking
                </button>
              </div>
            </div>
          )}

          {/* All Translations */}
          {translations.length > 1 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">All Translations</h4>
              {translations
                .filter(t => t.originalText === message.content)
                .map((translation) => (
                  <div key={translation.id} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span>{getLanguageFlag(translation.targetLanguage)}</span>
                        <span className="text-sm font-medium">{getLanguageName(translation.targetLanguage)}</span>
                        <span className="text-xs text-gray-500">
                          {Math.round(translation.confidence * 100)}%
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleSpeak(translation.translatedText, translation.targetLanguage)}
                          className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCopyTranslation(translation.translatedText)}
                          className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-800">
                      {translation.translatedText}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
