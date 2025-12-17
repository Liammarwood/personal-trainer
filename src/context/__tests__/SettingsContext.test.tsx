import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsProvider, useSettings } from '../SettingsContext';
import { renderHook, act } from '@testing-library/react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('SettingsContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should provide default settings', () => {
    const { result } = renderHook(() => useSettings(), {
      wrapper: SettingsProvider,
    });

    expect(result.current.settings).toEqual({
      showStatsOverlay: true,
      showRepQuality: false,
      soundEnabled: false,
      showAdvancedMode: false,
      clientSideProcessing: true,
      inputMode: 'webcam',
    });
  });

  it('should update boolean settings', () => {
    const { result } = renderHook(() => useSettings(), {
      wrapper: SettingsProvider,
    });

    act(() => {
      result.current.updateSetting('soundEnabled', true);
    });

    expect(result.current.settings.soundEnabled).toBe(true);
  });

  it('should update string settings', () => {
    const { result } = renderHook(() => useSettings(), {
      wrapper: SettingsProvider,
    });

    act(() => {
      result.current.updateSetting('inputMode', 'video');
    });

    expect(result.current.settings.inputMode).toBe('video');
  });

  it('should persist settings to localStorage', () => {
    const { result } = renderHook(() => useSettings(), {
      wrapper: SettingsProvider,
    });

    act(() => {
      result.current.updateSetting('showAdvancedMode', true);
    });

    const saved = JSON.parse(localStorage.getItem('workout-settings') || '{}');
    expect(saved.showAdvancedMode).toBe(true);
  });

  it('should load settings from localStorage', () => {
    const savedSettings = {
      showStatsOverlay: false,
      showRepQuality: true,
      soundEnabled: true,
      showAdvancedMode: true,
      clientSideProcessing: false,
      inputMode: 'video',
    };
    localStorage.setItem('workout-settings', JSON.stringify(savedSettings));

    const { result } = renderHook(() => useSettings(), {
      wrapper: SettingsProvider,
    });

    expect(result.current.settings).toEqual(savedSettings);
  });

  it('should toggle multiple settings independently', () => {
    const { result } = renderHook(() => useSettings(), {
      wrapper: SettingsProvider,
    });

    act(() => {
      result.current.updateSetting('showStatsOverlay', false);
      result.current.updateSetting('soundEnabled', true);
      result.current.updateSetting('showAdvancedMode', true);
    });

    expect(result.current.settings.showStatsOverlay).toBe(false);
    expect(result.current.settings.soundEnabled).toBe(true);
    expect(result.current.settings.showAdvancedMode).toBe(true);
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useSettings());
    }).toThrow('useSettings must be used within a SettingsProvider');

    spy.mockRestore();
  });
});
