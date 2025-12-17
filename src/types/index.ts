// Exercise types
export interface Exercise {
  id: string;
  name: string;
  description?: string;
}

// Workout plan options
export interface WorkoutOptions {
  sets?: number;
  reps_per_set?: number;
  target_weight?: number;
  rest_seconds?: number;
  exerciseIndex?: number;
}

// Expected plan from stats
export interface ExpectedPlan {
  sets?: number;
  reps_per_set?: number;
  target_weight?: number;
  rest_seconds?: number;
}

// Workout stats
export interface WorkoutStats {
  reps: number;
  sets: number;
  duration: number;
  current_state?: string;
  current_instruction?: string;
  rep_quality?: string;
  expected_plan?: ExpectedPlan;
  video_mode?: boolean;
  workout_complete?: boolean;
  in_rest_period?: boolean;
  rest_remaining?: number;
  joint_angles?: Record<string, number>;
}

// API responses
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface StartExerciseResponse {
  success: boolean;
  message: string;
  exercise: string;
}

export interface StopExerciseResponse {
  success: boolean;
  message: string;
}

export interface ConfigResponse {
  camera_mode: 'server' | 'browser';
  [key: string]: any;
}

export interface AvailableExercisesResponse {
  exercises: Exercise[];
}

// Settings types
export interface AppSettings {
  showStatsOverlay: boolean;
  showRepQuality: boolean;
  soundEnabled: boolean;
  showAdvancedMode: boolean;
  clientSideProcessing: boolean; // New: Enable client-side pose detection
}

// Context types
export interface UploadResults {
  success?: boolean;
  exercises?: Array<{
    id: string;
    name: string;
    sets: number;
    reps_per_set: number;
    completed?: boolean;
    trackable?: boolean;
    weight?: number;
    mapped_exercise?: string;
  }>;
  detected_format?: 'fitbod' | 'generic' | string;
}

export interface WorkoutContextType {
  exercises: Exercise[];
  currentExercise: string;
  isTracking: boolean;
  stats: WorkoutStats;
  loading: boolean;
  currentExerciseIndex: number;
  workoutPlan: UploadResults | null;
  completedExercises: number[];
  uploadResults: UploadResults | null;
  startExercise: (exerciseId: string, options?: WorkoutOptions) => Promise<void>;
  stopExercise: () => Promise<void>;
  uploadVideo: (file: File) => Promise<any>;
  trackVideoFile: (file: File, exerciseId: string, options?: WorkoutOptions) => Promise<void>;
  clearWorkoutPlan: () => void;
  setUploadResults: (results: UploadResults | null) => void;
}

export interface SettingsContextType {
  settings: AppSettings;
  updateSetting: (key: keyof AppSettings, value: boolean) => void;
}
