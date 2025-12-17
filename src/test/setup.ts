import { expect, afterEach, vi, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Mock localStorage for all tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorageMock.clear();
});

// Mock MediaPipe
vi.mock('@mediapipe/pose', () => ({
  Pose: vi.fn(() => ({
    setOptions: vi.fn(),
    onResults: vi.fn(),
    send: vi.fn(),
    close: vi.fn(),
  })),
  POSE_LANDMARKS: {},
}));

// Mock Tesseract.js for faster tests
vi.mock('tesseract.js', () => ({
  createWorker: vi.fn(() => Promise.resolve({
    loadLanguage: vi.fn(() => Promise.resolve()),
    initialize: vi.fn(() => Promise.resolve()),
    setParameters: vi.fn(() => Promise.resolve()),
    recognize: vi.fn(() => Promise.resolve({
      data: { text: 'Mocked OCR text' }
    })),
    terminate: vi.fn(() => Promise.resolve()),
  })),
  PSM: {
    AUTO: 3,
  },
  default: {
    createWorker: vi.fn(),
  },
}));

// Mock IndexedDB
const indexedDB = {
  open: vi.fn(() => ({
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null,
  })),
};

global.indexedDB = indexedDB as any;
