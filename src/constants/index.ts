// Z-Index Constants
export const Z_INDEX = {
  BOTTOM_NAV: 1000,
  APP_BAR: 1100,
  OVERLAY: 2,
  OVERLAY_CONTROLS: 3,
  FULLSCREEN_EXIT: 9999,
} as const;

// Button Opacity Constants
export const BUTTON_OPACITY = {
  NORMAL: 0.5,
  HOVER: 0.7,
} as const;

// Default Workout Values
export const DEFAULT_WORKOUT = {
  SETS: 3,
  REPS: 10,
  REST_SECONDS: 60,
  WEIGHT: 0,
} as const;

// UI Constants
export const VIDEO_ASPECT_RATIO = '16/9';
export const MOBILE_VIDEO_HEIGHT = '80vh';

// Shared Button Styles
export const CONTROL_BUTTON_STYLE = {
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
} as const;

export const GRADIENT_BACKGROUNDS = {
  PRIMARY: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  SECONDARY: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  TERTIARY: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  WARNING: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
} as const;

// Session Storage Keys
export const STORAGE_KEYS = {
  WORKOUT_SESSIONS: 'workout_sessions',
  CURRENT_SESSION: 'current_session',
} as const;

// Time Constants
export const TIME = {
  THIRTY_DAYS_MS: 30 * 24 * 60 * 60 * 1000,
  ONE_SECOND_MS: 1000,
} as const;
