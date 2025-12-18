import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWorkout } from '../WorkoutContext';
import type { ReactNode } from 'react';
import type { UploadResults } from '../../types';
import { MockProviders } from '../../test/MockProviders';

// Mock the API module
vi.mock('../../services/api', () => ({
  default: {
    getExercisesV2: vi.fn(() => Promise.resolve({
      exercises: [
        { id: 'squat', name: 'Squat', description: 'Lower body exercise' },
        { id: 'pushup', name: 'Push-up', description: 'Upper body exercise' },
        { id: 'deadlift', name: 'Deadlift', description: 'Full body exercise' }
      ]
    })),
    createSessionV2: vi.fn((exerciseId, options) => Promise.resolve({
      session_id: 'test-session-123'
    })),
    completeSessionV2: vi.fn((sessionId) => Promise.resolve({
      summary: { reps: 10, sets: 3, duration: 120 }
    })),
    uploadVideo: vi.fn(() => Promise.resolve({
      success: true,
      exercises: [
        {
          id: 'squat',
          name: 'Squat',
          sets: 3,
          reps_per_set: 10,
          weight: 100,
          trackable: true,
          completed: false,
          mapped_exercise: 'squat'
        }
      ],
      detected_format: 'generic'
    }))
  }
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <MockProviders>{children}</MockProviders>
);

describe('WorkoutContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Initial State', () => {
    it('should initialize with default values', async () => {
      const { result } = renderHook(() => useWorkout(), { wrapper });

      await waitFor(() => {
        expect(result.current.exercises.length).toBeGreaterThan(0);
      });

      expect(result.current.currentExercise).toBeNull();
      expect(result.current.currentExerciseIndex).toBeNull();
      expect(result.current.isTracking).toBe(false);
      expect(result.current.workoutPlan).toBeNull();
      expect(result.current.completedExercises).toEqual([]);
      expect(result.current.stats).toEqual({
        reps: 0,
        sets: 0,
        duration: 0,
        expected_plan: undefined,
        workout_complete: false
      });
    });

    it('should load exercises on mount', async () => {
      const { result } = renderHook(() => useWorkout(), { wrapper });

      await waitFor(() => {
        expect(result.current.exercises).toHaveLength(3);
      });

      expect(result.current.exercises[0]).toEqual({
        id: 'squat',
        name: 'Squat',
        description: 'Lower body exercise'
      });
    });
  });

  describe('startExercise', () => {
    it('should start tracking an exercise', async () => {
      const { result } = renderHook(() => useWorkout(), { wrapper });

      await waitFor(() => {
        expect(result.current.exercises.length).toBeGreaterThan(0);
      });

      await act(async () => {
        await result.current.startExercise('squat', { sets: 3, reps_per_set: 10 });
      });

      expect(result.current.currentExercise).toBe('squat');
      expect(result.current.isTracking).toBe(true);
      expect(result.current.sessionId).toBe('test-session-123');
      expect(result.current.stats.expected_plan).toEqual({
        sets: 3,
        reps_per_set: 10
      });
    });

    it('should set exercise index when provided', async () => {
      const { result } = renderHook(() => useWorkout(), { wrapper });

      await waitFor(() => {
        expect(result.current.exercises.length).toBeGreaterThan(0);
      });

      await act(async () => {
        await result.current.startExercise('squat', { 
          sets: 3, 
          reps_per_set: 10,
          exerciseIndex: 2
        });
      });

      expect(result.current.currentExerciseIndex).toBe(2);
    });
  });

  describe('stopExercise', () => {
    it('should stop tracking and mark exercise as completed', async () => {
      const { result } = renderHook(() => useWorkout(), { wrapper });

      await waitFor(() => {
        expect(result.current.exercises.length).toBeGreaterThan(0);
      });

      // Set up a workout plan first
      const plan: UploadResults = {
        success: true,
        exercises: [
          { id: 'squat', name: 'Squat', sets: 3, reps_per_set: 10, trackable: true, completed: false }
        ]
      };

      act(() => {
        result.current.setManualWorkoutPlan(plan);
      });

      // Start exercise from workout plan
      await act(async () => {
        await result.current.startExercise('squat', { exerciseIndex: 0 });
      });

      expect(result.current.isTracking).toBe(true);

      // Stop exercise
      await act(async () => {
        await result.current.stopExercise();
      });

      expect(result.current.isTracking).toBe(false);
      expect(result.current.currentExercise).toBeNull();
      expect(result.current.currentExerciseIndex).toBeNull();
      expect(result.current.completedExercises).toContain(0);
    });

    it('should reset stats after stopping', async () => {
      const { result } = renderHook(() => useWorkout(), { wrapper });

      await waitFor(() => {
        expect(result.current.exercises.length).toBeGreaterThan(0);
      });

      await act(async () => {
        await result.current.startExercise('squat');
      });

      await act(async () => {
        await result.current.stopExercise();
      });

      expect(result.current.stats).toEqual({
        reps: 0,
        sets: 0,
        duration: 0,
        expected_plan: undefined,
        workout_complete: false
      });
    });
  });

  describe('Workout Plan Management', () => {
    it('should set manual workout plan', () => {
      const { result } = renderHook(() => useWorkout(), { wrapper });

      const plan: UploadResults = {
        success: true,
        exercises: [
          {
            id: 'squat',
            name: 'Squat',
            sets: 3,
            reps_per_set: 10,
            weight: 100,
            trackable: true,
            completed: false,
            mapped_exercise: 'squat'
          }
        ],
        detected_format: 'manual'
      };

      act(() => {
        result.current.setManualWorkoutPlan(plan);
      });

      expect(result.current.workoutPlan).toEqual(plan);
      expect(result.current.uploadResults).toEqual(plan);
      expect(result.current.completedExercises).toEqual([]);
    });

    it('should add single exercise to workout plan', () => {
      const { result } = renderHook(() => useWorkout(), { wrapper });

      act(() => {
        result.current.addExerciseToWorkoutPlan({
          id: 'squat',
          name: 'Squat',
          sets: 3,
          reps_per_set: 10,
          weight: 100
        });
      });

      expect(result.current.workoutPlan?.exercises).toHaveLength(1);
      expect(result.current.workoutPlan?.exercises?.[0]).toMatchObject({
        id: 'squat',
        name: 'Squat',
        sets: 3,
        reps_per_set: 10,
        weight: 100,
        trackable: true
      });
    });

    it('should add multiple exercises to workout plan at once', () => {
      const { result } = renderHook(() => useWorkout(), { wrapper });

      const exercises = [
        { id: 'squat', name: 'Squat', sets: 3, reps_per_set: 10, weight: 100 },
        { id: 'pushup', name: 'Push-up', sets: 3, reps_per_set: 15, weight: 0 },
        { id: 'deadlift', name: 'Deadlift', sets: 3, reps_per_set: 8, weight: 120 }
      ];

      act(() => {
        result.current.setMultipleExercisesToWorkoutPlan(exercises);
      });

      expect(result.current.workoutPlan?.exercises).toHaveLength(3);
      expect(result.current.workoutPlan?.exercises?.[0].name).toBe('Squat');
      expect(result.current.workoutPlan?.exercises?.[1].name).toBe('Push-up');
      expect(result.current.workoutPlan?.exercises?.[2].name).toBe('Deadlift');
    });

    it('should append exercises to existing workout plan', () => {
      const { result } = renderHook(() => useWorkout(), { wrapper });

      // Add initial exercise
      act(() => {
        result.current.addExerciseToWorkoutPlan({
          id: 'squat',
          name: 'Squat',
          sets: 3,
          reps_per_set: 10
        });
      });

      expect(result.current.workoutPlan?.exercises).toHaveLength(1);

      // Add multiple exercises
      act(() => {
        result.current.setMultipleExercisesToWorkoutPlan([
          { id: 'pushup', name: 'Push-up', sets: 3, reps_per_set: 15 },
          { id: 'deadlift', name: 'Deadlift', sets: 3, reps_per_set: 8 }
        ]);
      });

      expect(result.current.workoutPlan?.exercises).toHaveLength(3);
      expect(result.current.workoutPlan?.exercises?.[0].name).toBe('Squat');
      expect(result.current.workoutPlan?.exercises?.[1].name).toBe('Push-up');
      expect(result.current.workoutPlan?.exercises?.[2].name).toBe('Deadlift');
    });

    it('should remove exercise from workout plan', () => {
      const { result } = renderHook(() => useWorkout(), { wrapper });

      const plan: UploadResults = {
        success: true,
        exercises: [
          { id: 'squat', name: 'Squat', sets: 3, reps_per_set: 10, trackable: true, completed: false },
          { id: 'pushup', name: 'Push-up', sets: 3, reps_per_set: 15, trackable: true, completed: false },
          { id: 'deadlift', name: 'Deadlift', sets: 3, reps_per_set: 8, trackable: true, completed: false }
        ]
      };

      act(() => {
        result.current.setManualWorkoutPlan(plan);
      });

      act(() => {
        result.current.removeExerciseFromPlan(1);
      });

      expect(result.current.workoutPlan?.exercises).toHaveLength(2);
      expect(result.current.workoutPlan?.exercises?.[0].name).toBe('Squat');
      expect(result.current.workoutPlan?.exercises?.[1].name).toBe('Deadlift');
    });

    it('should update completed exercise indices when removing exercise', async () => {
      const { result } = renderHook(() => useWorkout(), { wrapper });

      await waitFor(() => {
        expect(result.current.exercises.length).toBeGreaterThan(0);
      });

      const plan: UploadResults = {
        success: true,
        exercises: [
          { id: 'squat', name: 'Squat', sets: 3, reps_per_set: 10, trackable: true, completed: false },
          { id: 'pushup', name: 'Push-up', sets: 3, reps_per_set: 15, trackable: true, completed: false },
          { id: 'deadlift', name: 'Deadlift', sets: 3, reps_per_set: 8, trackable: true, completed: false }
        ]
      };

      act(() => {
        result.current.setManualWorkoutPlan(plan);
      });

      // Complete first exercise
      await act(async () => {
        await result.current.startExercise('squat', { exerciseIndex: 0 });
      });
      await act(async () => {
        await result.current.stopExercise();
      });

      // Complete third exercise
      await act(async () => {
        await result.current.startExercise('deadlift', { exerciseIndex: 2 });
      });
      await act(async () => {
        await result.current.stopExercise();
      });

      expect(result.current.completedExercises).toContain(0);
      expect(result.current.completedExercises).toContain(2);

      // Remove exercise at index 0
      act(() => {
        result.current.removeExerciseFromPlan(0);
      });

      // Index 2 should now be index 1
      expect(result.current.completedExercises).toEqual([1]);
    });

    it('should clear workout plan when last exercise is removed', () => {
      const { result } = renderHook(() => useWorkout(), { wrapper });

      act(() => {
        result.current.addExerciseToWorkoutPlan({
          id: 'squat',
          name: 'Squat',
          sets: 3,
          reps_per_set: 10
        });
      });

      act(() => {
        result.current.removeExerciseFromPlan(0);
      });

      expect(result.current.workoutPlan).toBeNull();
      expect(result.current.completedExercises).toEqual([]);
    });

    it('should clear workout plan', () => {
      const { result } = renderHook(() => useWorkout(), { wrapper });

      const plan: UploadResults = {
        success: true,
        exercises: [
          { id: 'squat', name: 'Squat', sets: 3, reps_per_set: 10, trackable: true, completed: false }
        ]
      };

      act(() => {
        result.current.setManualWorkoutPlan(plan);
      });

      expect(result.current.workoutPlan).not.toBeNull();

      act(() => {
        result.current.clearWorkoutPlan();
      });

      expect(result.current.workoutPlan).toBeNull();
      expect(result.current.completedExercises).toEqual([]);
    });
  });

  describe('Rep Completion', () => {
    it('should increment reps on rep complete', () => {
      const { result } = renderHook(() => useWorkout(), { wrapper });

      act(() => {
        result.current.handleRepComplete({ quality: 'good' });
      });

      expect(result.current.stats.reps).toBe(1);
      expect(result.current.stats.rep_quality).toBe('good');
    });

    it('should increment sets when target reps reached', async () => {
      const { result } = renderHook(() => useWorkout(), { wrapper });

      await waitFor(() => {
        expect(result.current.exercises.length).toBeGreaterThan(0);
      });

      // Start an exercise with expected plan
      await act(async () => {
        await result.current.startExercise('squat', {
          sets: 3,
          reps_per_set: 3,
          rest_seconds: 60
        });
      });

      // Complete 3 reps
      act(() => {
        result.current.handleRepComplete({ quality: 'good' });
      });
      act(() => {
        result.current.handleRepComplete({ quality: 'good' });
      });
      act(() => {
        result.current.handleRepComplete({ quality: 'good' });
      });

      expect(result.current.stats.sets).toBe(1);
      expect(result.current.stats.reps).toBe(0); // Reset for next set
      expect(result.current.stats.in_rest_period).toBe(true);
      expect(result.current.stats.rest_remaining).toBe(60);
    });

    it('should mark workout as complete when all sets done', async () => {
      const { result } = renderHook(() => useWorkout(), { wrapper });

      await waitFor(() => {
        expect(result.current.exercises.length).toBeGreaterThan(0);
      });

      // Start an exercise with expected plan (3 sets of 2 reps)
      await act(async () => {
        await result.current.startExercise('squat', {
          sets: 3,
          reps_per_set: 2,
          rest_seconds: 0 // No rest period for faster test
        });
      });

      // Complete first set
      act(() => {
        result.current.handleRepComplete({ quality: 'good' });
      });
      act(() => {
        result.current.handleRepComplete({ quality: 'good' });
      });

      // Complete second set
      act(() => {
        result.current.handleRepComplete({ quality: 'good' });
      });
      act(() => {
        result.current.handleRepComplete({ quality: 'good' });
      });

      // Complete third set
      act(() => {
        result.current.handleRepComplete({ quality: 'good' });
      });
      act(() => {
        result.current.handleRepComplete({ quality: 'good' });
      });

      expect(result.current.stats.sets).toBe(3);
      expect(result.current.stats.workout_complete).toBe(true);
    });
  });

  describe('Video File Management', () => {
    it('should set selected video file', () => {
      const { result } = renderHook(() => useWorkout(), { wrapper });

      const mockFile = new File(['content'], 'workout.mp4', { type: 'video/mp4' });

      act(() => {
        result.current.setSelectedVideoFile(mockFile);
      });

      expect(result.current.selectedVideoFile).toBe(mockFile);
    });
  });

  describe('Video Upload', () => {
    it('should upload video and set workout plan', async () => {
      const { result } = renderHook(() => useWorkout(), { wrapper });

      const mockFile = new File(['content'], 'workout.mp4', { type: 'video/mp4' });

      await act(async () => {
        await result.current.uploadVideo(mockFile);
      });

      expect(result.current.workoutPlan).not.toBeNull();
      expect(result.current.workoutPlan?.exercises).toHaveLength(1);
      expect(result.current.workoutPlan?.detected_format).toBe('generic');
    });
  });

  describe('Stats Update', () => {
    it('should update joint angles', () => {
      const { result } = renderHook(() => useWorkout(), { wrapper });

      const metrics = {
        left_knee: 90,
        right_knee: 92,
        left_elbow: 180
      };

      act(() => {
        result.current.updateStats(metrics);
      });

      expect(result.current.stats.joint_angles).toEqual(metrics);
    });
  });
});
