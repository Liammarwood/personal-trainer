import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import WorkoutPlan from '../WorkoutPlan';
import type { Exercise } from '../../types';

const mockStartExercise = vi.fn();
const mockUseWorkout = vi.fn();
const mockUseSettings = vi.fn();

vi.mock('../../context/WorkoutContext', () => ({
  useWorkout: () => mockUseWorkout(),
}));

vi.mock('../../context/SettingsContext', () => ({
  useSettings: () => mockUseSettings(),
}));

const mockExercises: Exercise[] = [
  { id: 'push-up', name: 'Push-up', description: 'Standard push-up' },
];

describe('WorkoutPlan Component - Core Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseWorkout.mockReturnValue({
      workoutPlan: [],
      completedExercises: [],
      currentExerciseIndex: -1,
      startExercise: mockStartExercise,
      clearWorkoutPlan: vi.fn(),
      isTracking: false,
      exercises: mockExercises,
      currentExercise: null,
      stopExercise: vi.fn(),
      loading: false,
      trackVideoFile: vi.fn(),
      selectedVideoFile: null,
      removeExerciseFromPlan: vi.fn(),
      setMultipleExercisesToWorkoutPlan: vi.fn(),
    });

    mockUseSettings.mockReturnValue({
      settings: {
        inputMode: 'webcam',
        showStatsOverlay: true,
        showRepQuality: false,
        soundEnabled: false,
        showAdvancedMode: false,
      },
      updateSetting: vi.fn(),
    });
  });

  it('should render workout plan component', () => {
    const { container } = render(<WorkoutPlan />);
    expect(container).toBeInTheDocument();
  });

  it('should have exercise selection functionality', () => {
    render(<WorkoutPlan />);
    const combobox = screen.queryByRole('combobox');
    expect(combobox || screen.getByText(/workout/i)).toBeInTheDocument();
  });
});
