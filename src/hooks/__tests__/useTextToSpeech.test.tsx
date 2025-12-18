import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTextToSpeech } from '../useTextToSpeech';
import { SettingsProvider } from '../../context/SettingsContext';
import { ReactNode } from 'react';

// Mock speech synthesis
const mockSpeak = vi.fn();
const mockCancel = vi.fn();
const mockSpeechSynthesisUtterance = vi.fn();

Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: {
    speak: mockSpeak,
    cancel: mockCancel,
    speaking: false,
  },
});

Object.defineProperty(window, 'SpeechSynthesisUtterance', {
  writable: true,
  value: mockSpeechSynthesisUtterance,
});

describe('useTextToSpeech', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Mock SpeechSynthesisUtterance constructor - must return an object when called with 'new'
    mockSpeechSynthesisUtterance.mockImplementation(function(this: any, text: string) {
      this.text = text;
      this.rate = 1;
      this.pitch = 1;
      this.volume = 1;
      this.lang = 'en-US';
      this.onstart = null;
      this.onend = null;
      this.onerror = null;
      return this;
    });
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <SettingsProvider>{children}</SettingsProvider>
  );

  it('should return speak, cancel, isSpeaking, and isSupported', () => {
    const { result } = renderHook(() => useTextToSpeech(), { wrapper });

    expect(result.current).toHaveProperty('speak');
    expect(result.current).toHaveProperty('cancel');
    expect(result.current).toHaveProperty('isSpeaking');
    expect(result.current).toHaveProperty('isSupported');
    expect(typeof result.current.speak).toBe('function');
    expect(typeof result.current.cancel).toBe('function');
    expect(result.current.isSupported).toBe(true);
  });

  it('should not speak when sound is disabled', () => {
    // Set soundEnabled to false
    localStorage.setItem('workout-settings', JSON.stringify({ soundEnabled: false }));

    const { result } = renderHook(() => useTextToSpeech(), { wrapper });

    act(() => {
      result.current.speak('Hello world');
    });

    expect(mockSpeak).not.toHaveBeenCalled();
  });

  it('should speak when sound is enabled', () => {
    // Set soundEnabled to true
    localStorage.setItem('workout-settings', JSON.stringify({ soundEnabled: true }));

    const { result } = renderHook(() => useTextToSpeech(), { wrapper });

    act(() => {
      result.current.speak('Hello world');
    });

    expect(mockSpeak).toHaveBeenCalled();
  });

  it('should create utterance with custom options', () => {
    localStorage.setItem('workout-settings', JSON.stringify({ soundEnabled: true }));

    const { result } = renderHook(() => useTextToSpeech(), { wrapper });

    act(() => {
      result.current.speak('Test message', {
        rate: 1.5,
        pitch: 1.2,
        volume: 0.8,
        lang: 'en-GB',
      });
    });

    expect(mockSpeechSynthesisUtterance).toHaveBeenCalledWith('Test message');
  });

  it('should cancel ongoing speech', () => {
    localStorage.setItem('workout-settings', JSON.stringify({ soundEnabled: true }));

    const { result } = renderHook(() => useTextToSpeech(), { wrapper });

    act(() => {
      result.current.cancel();
    });

    expect(mockCancel).toHaveBeenCalled();
  });

  it('should not speak empty text', () => {
    localStorage.setItem('workout-settings', JSON.stringify({ soundEnabled: true }));

    const { result } = renderHook(() => useTextToSpeech(), { wrapper });

    act(() => {
      result.current.speak('');
    });

    expect(mockSpeak).not.toHaveBeenCalled();
  });

  it('should cancel previous speech before starting new one', () => {
    localStorage.setItem('workout-settings', JSON.stringify({ soundEnabled: true }));

    const { result } = renderHook(() => useTextToSpeech(), { wrapper });

    act(() => {
      result.current.speak('First message');
    });

    expect(mockCancel).toHaveBeenCalledTimes(1); // Called once before speaking

    act(() => {
      result.current.speak('Second message');
    });

    expect(mockCancel).toHaveBeenCalledTimes(2); // Called again before second message
  });
});
