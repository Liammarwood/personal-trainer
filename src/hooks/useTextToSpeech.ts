import { useCallback, useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';

interface UseTextToSpeechOptions {
  rate?: number; // Speech rate (0.1 to 10, default 1)
  pitch?: number; // Speech pitch (0 to 2, default 1)
  volume?: number; // Speech volume (0 to 1, default 1)
  lang?: string; // Language (default 'en-US')
}

interface UseTextToSpeechReturn {
  speak: (text: string, options?: UseTextToSpeechOptions) => void;
  cancel: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

/**
 * Custom hook for text-to-speech functionality
 * Respects the soundEnabled setting from SettingsContext
 * 
 * @example
 * const { speak, cancel, isSpeaking } = useTextToSpeech();
 * speak("Hello world");
 * speak("Faster speech", { rate: 1.5 });
 */
export const useTextToSpeech = (): UseTextToSpeechReturn => {
  const { settings } = useSettings();
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSpeakingRef = useRef(false);

  // Check if speech synthesis is supported
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  const cancel = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      isSpeakingRef.current = false;
    }
  }, [isSupported]);

  const speak = useCallback(
    (text: string, options: UseTextToSpeechOptions = {}) => {
      // Don't speak if sound is disabled in settings
      if (!settings.soundEnabled) {
        console.log('[TextToSpeech] Sound disabled in settings');
        return;
      }

      if (!isSupported) {
        console.warn('[TextToSpeech] Speech synthesis not supported in this browser');
        return;
      }

      if (!text || text.trim() === '') {
        console.warn('[TextToSpeech] No text provided to speak');
        return;
      }

      // Cancel any ongoing speech
      cancel();

      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Apply options
      utterance.rate = options.rate ?? 1;
      utterance.pitch = options.pitch ?? 1;
      utterance.volume = options.volume ?? 1;
      utterance.lang = options.lang ?? 'en-US';

      // Event listeners
      utterance.onstart = () => {
        isSpeakingRef.current = true;
        console.log('[TextToSpeech] Started speaking:', text);
      };

      utterance.onend = () => {
        isSpeakingRef.current = false;
        console.log('[TextToSpeech] Finished speaking');
      };

      utterance.onerror = (event) => {
        isSpeakingRef.current = false;
        console.error('[TextToSpeech] Error:', event.error);
      };

      // Speak
      window.speechSynthesis.speak(utterance);
    },
    [settings.soundEnabled, isSupported, cancel]
  );

  return {
    speak,
    cancel,
    isSpeaking: isSpeakingRef.current,
    isSupported,
  };
};
