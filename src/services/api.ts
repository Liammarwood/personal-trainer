import axios from 'axios';
import type {
  WorkoutOptions,
} from '../types';
import * as sessionStorage from './sessionStorage';
import { getExercise, getExercises, assessRepQuality, isAtRepPosition, isAtStartingPosition } from './exerciseConfig';
import { getWorkoutScanner, ScanProgress } from './workoutScanner';

const API_BASE_URL = '/api';

export const api = {
  // ========== Workout Scanner (Client-Side with Tesseract.js) ==========
  
  // Upload video/image for workout plan scanning (now client-side)
  uploadVideo: async (
    file: File,
    onProgress?: (progress: ScanProgress) => void
  ): Promise<any> => {
    const scanner = getWorkoutScanner();
    
    try {
      // Initialize scanner if needed
      await scanner.initialize(onProgress);

      // Process based on file type
      let result;
      if (file.type.startsWith('video/')) {
        result = await scanner.processVideo(file, onProgress);
      } else if (file.type.startsWith('image/')) {
        result = await scanner.processImage(file, onProgress);
      } else {
        throw new Error('Unsupported file type. Please upload an image or video.');
      }

      onProgress?.({
        status: 'complete',
        progress: 100,
        message: `Found ${result.total_exercises} exercises`
      });

      return {
        success: true,
        ...result
      };
    } catch (error) {
      onProgress?.({
        status: 'error',
        progress: 0,
        message: `Scan failed: ${error}`
      });
      throw error;
    }
  },

  // ========== Client-Side Session Management (IndexedDB) ==========

  // Get all exercises (client-side)
  getExercisesV2: async (): Promise<any> => {
    const exercises = await getExercises();
    return {
      success: true,
      exercises
    };
  },

  // Create workout session (client-side)
  createSessionV2: async (exerciseId: string, plan: WorkoutOptions, userId?: string): Promise<any> => {
    const session = await sessionStorage.createSession(exerciseId, plan, userId);
    return {
      success: true,
      session_id: session.session_id,
      session
    };
  },

  // Get session data (client-side)
  getSessionV2: async (sessionId: string): Promise<any> => {
    const session = await sessionStorage.getSession(sessionId);
    if (!session) {
      return {
        success: false,
        error: 'Session not found'
      };
    }
    return {
      success: true,
      session
    };
  },

  // Log a rep (client-side)
  logRepV2: async (sessionId: string, metrics: any, quality: string): Promise<any> => {
    const session = await sessionStorage.logRep(sessionId, metrics, quality);
    return {
      success: true,
      session,
      rep: session.reps[session.reps.length - 1]
    };
  },

  // Validate rep metrics (client-side)
  validateRepV2: async (exerciseId: string, metrics: any, position: 'starting' | 'rep'): Promise<any> => {
    const exercise = await getExercise(exerciseId);
    
    let isValid: boolean;
    if (position === 'starting') {
      isValid = isAtStartingPosition(exercise, metrics);
    } else {
      isValid = isAtRepPosition(exercise, metrics);
    }
    
    const quality = assessRepQuality(exercise, metrics);
    
    return {
      success: true,
      valid: isValid,
      quality,
      metrics
    };
  },

  // Complete session (client-side)
  completeSessionV2: async (sessionId: string): Promise<any> => {
    const result = await sessionStorage.completeSession(sessionId);
    return {
      success: true,
      summary: result.summary,
      session: result.session
    };
  },

  // Health check (client-side)
  healthCheckV2: async (): Promise<any> => {
    const sessions = await sessionStorage.getActiveSessions();
    return {
      success: true,
      status: 'healthy',
      version: '2.0.0-client',
      active_sessions: sessions.length,
      storage: 'IndexedDB'
    };
  },
};

export default api;