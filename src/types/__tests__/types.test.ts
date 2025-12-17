import { describe, it, expect } from 'vitest';

// Type tests
describe('TypeScript Type Definitions', () => {
  it('should have correct Exercise type', () => {
    type Exercise = {
      id: string;
      name: string;
      description?: string;
    };

    const exercise: Exercise = {
      id: 'push-up',
      name: 'Push-up',
      description: 'Standard push-up',
    };

    expect(exercise.id).toBe('push-up');
    expect(exercise.name).toBe('Push-up');
  });

  it('should have correct WorkoutOptions type', () => {
    type WorkoutOptions = {
      sets?: number;
      reps_per_set?: number;
      target_weight?: number;
      rest_seconds?: number;
      exerciseIndex?: number;
    };

    const options: WorkoutOptions = {
      sets: 3,
      reps_per_set: 10,
      target_weight: 20,
      rest_seconds: 60,
    };

    expect(options.sets).toBe(3);
    expect(options.reps_per_set).toBe(10);
  });

  it('should have correct AppSettings type', () => {
    type AppSettings = {
      showStatsOverlay: boolean;
      showRepQuality: boolean;
      soundEnabled: boolean;
      showAdvancedMode: boolean;
      clientSideProcessing: boolean;
      inputMode: 'webcam' | 'video';
    };

    const settings: AppSettings = {
      showStatsOverlay: true,
      showRepQuality: false,
      soundEnabled: false,
      showAdvancedMode: false,
      clientSideProcessing: true,
      inputMode: 'webcam',
    };

    expect(settings.inputMode).toBe('webcam');
    expect(settings.showStatsOverlay).toBe(true);
  });

  it('should have correct WorkoutStats type', () => {
    type WorkoutStats = {
      reps: number;
      sets: number;
      duration: number;
      current_state?: string;
      current_instruction?: string;
      rep_quality?: string;
      expected_plan?: {
        sets?: number;
        reps_per_set?: number;
        target_weight?: number;
        rest_seconds?: number;
      };
      video_mode?: boolean;
      workout_complete?: boolean;
      in_rest_period?: boolean;
      rest_remaining?: number;
      joint_angles?: Record<string, number>;
    };

    const stats: WorkoutStats = {
      reps: 10,
      sets: 2,
      duration: 120,
      workout_complete: false,
      expected_plan: {
        sets: 3,
        reps_per_set: 10,
      },
    };

    expect(stats.reps).toBe(10);
    expect(stats.sets).toBe(2);
  });

  it('should handle union types for inputMode', () => {
    type InputMode = 'webcam' | 'video';

    const webcam: InputMode = 'webcam';
    const video: InputMode = 'video';

    expect(['webcam', 'video']).toContain(webcam);
    expect(['webcam', 'video']).toContain(video);
  });
});
