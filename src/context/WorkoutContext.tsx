import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import type { Exercise, WorkoutStats, WorkoutOptions, UploadResults } from '../types';

interface WorkoutContextValue {
  exercises: Exercise[];
  currentExercise: string | null;
  currentExerciseIndex: number | null;
  stats: WorkoutStats;
  uploadResults: UploadResults | null;
  workoutPlan: UploadResults | null;
  completedExercises: number[];
  isTracking: boolean;
  loading: boolean;
  selectedVideoFile: File | null;
  sessionId: string | null;
  setSelectedVideoFile: (file: File | null) => void;
  startExercise: (exerciseId: string, options?: WorkoutOptions) => Promise<void>;
  stopExercise: () => Promise<void>;
  trackVideoFile: (videoFile: File, exerciseId: string, options?: WorkoutOptions) => Promise<void>;
  uploadVideo: (file: File) => Promise<any>;
  setUploadResults: (results: UploadResults | null) => void;
  setManualWorkoutPlan: (plan: UploadResults) => void;
  addExerciseToWorkoutPlan: (exercise: { id: string; name: string; sets: number; reps_per_set: number; weight?: number; rest_seconds?: number }) => void;
  setMultipleExercisesToWorkoutPlan: (exercises: Array<{ id: string; name: string; sets: number; reps_per_set: number; weight?: number; rest_seconds?: number }>) => void;
  removeExerciseFromPlan: (index: number) => void;
  clearWorkoutPlan: () => void;
  updateStats: (metrics: any) => void;
  handleRepComplete: (repData: any) => void;
}

const WorkoutContext = createContext<WorkoutContextValue | undefined>(undefined);

export const useWorkout = (): WorkoutContextValue => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};

interface WorkoutProviderProps {
  children: ReactNode;
}

export const WorkoutProvider: React.FC<WorkoutProviderProps> = ({ children }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState<string | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [stats, setStats] = useState<WorkoutStats>({
    reps: 0,
    sets: 0,
    duration: 0,
    expected_plan: undefined,
    workout_complete: false
  });
  const [uploadResults, setUploadResults] = useState<UploadResults | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<UploadResults | null>(null);
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  // Load available exercises on mount
  useEffect(() => {
    loadExercises();
  }, []);

  // Update duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && startTime > 0) {
      interval = setInterval(() => {
        setStats(prev => ({
          ...prev,
          duration: Math.floor((Date.now() - startTime) / 1000)
        }));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, startTime]);

  // Rest timer effect
  useEffect(() => {
    if (!stats.in_rest_period) return;

    console.log('[WorkoutContext] Starting rest timer with', stats.rest_remaining, 'seconds');
    
    const timer = setInterval(() => {
      setStats(prev => {
        if (!prev.in_rest_period) return prev; // Safety check
        
        const newRemaining = (prev.rest_remaining || 0) - 1;
        
        if (newRemaining <= 0) {
          // Rest period complete - just clear rest state, don't increment sets
          console.log('[WorkoutContext] Rest complete, ready for next set');
          return {
            ...prev,
            in_rest_period: false,
            rest_remaining: 0
          };
        }
         
        return {
          ...prev,
          rest_remaining: newRemaining
        };
      });
    }, 1000);

    return () => {
      console.log('[WorkoutContext] Clearing rest timer');
      clearInterval(timer);
    };
  }, [stats.in_rest_period]);

  const loadExercises = async (): Promise<void> => {
    try {
      setLoading(true);
      // Use V2 API
      const data = await api.getExercisesV2();
      const exerciseList = data.exercises.map((ex: any) => ({
        id: ex.id,
        name: ex.name,
        description: ex.description
      }));
      setExercises(exerciseList || []);
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const startExercise = async (exerciseId: string, options: WorkoutOptions = {}): Promise<void> => {
    try {
      setLoading(true);
      
      // Create session with V2 API
      const response = await api.createSessionV2(exerciseId, options);
      const newSessionId = response.session_id;
      
      setSessionId(newSessionId);
      setCurrentExercise(exerciseId);
      setIsTracking(true);
      setStartTime(Date.now());
      setStats({ 
        reps: 0, 
        sets: 0, 
        duration: 0, 
        expected_plan: options,
        joint_angles: {}
      });
      
      if (options.exerciseIndex !== undefined) {
        setCurrentExerciseIndex(options.exerciseIndex);
      }
      
      console.log('[WorkoutContext] Session created:', newSessionId);
    } catch (error) {
      console.error('Error starting exercise:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const trackVideoFile = async (videoFile: File, exerciseId: string, options: WorkoutOptions = {}): Promise<void> => {
    try {
      setLoading(true);
      console.log('[WorkoutContext] trackVideoFile called with:', { 
        videoFileName: videoFile?.name, 
        videoFileSize: videoFile?.size, 
        exerciseId, 
        options 
      });
      setSelectedVideoFile(videoFile);
      
      // Create session with V2 API
      const response = await api.createSessionV2(exerciseId, options);
      console.log('[WorkoutContext] API response:', response);
      const newSessionId = response.session_id || response.session?.id;
      console.log('[WorkoutContext] Session ID:', newSessionId);
      
      setSessionId(newSessionId);
      setCurrentExercise(exerciseId);
      setIsTracking(true);
      setStartTime(Date.now());
      setStats({ reps: 0, sets: 0, duration: 0, expected_plan: options, video_mode: true });
      
      if (options.exerciseIndex !== undefined) {
        setCurrentExerciseIndex(options.exerciseIndex);
      }
      
      console.log('[WorkoutContext] Video file tracking started, session:', newSessionId);
    } catch (error) {
      console.error('Error tracking video:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const stopExercise = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Complete session with V2 API
      if (sessionId) {
        const response = await api.completeSessionV2(sessionId);
        console.log('[WorkoutContext] Session completed:', response.summary);
      }
      
      // Mark exercise as completed if it was from workout plan
      if (currentExerciseIndex !== null && workoutPlan) {
        if (!completedExercises.includes(currentExerciseIndex)) {
          setCompletedExercises([...completedExercises, currentExerciseIndex]);
        }
      }
      
      setIsTracking(false);
      setCurrentExercise(null);
      setCurrentExerciseIndex(null);
      setSessionId(null);
      setStats({
        reps: 0,
        sets: 0,
        duration: 0,
        expected_plan: undefined,
        workout_complete: false
      });
    } catch (error) {
      console.error('Error stopping exercise:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (metrics: any): void => {
    // Update live joint angles/metrics
    setStats(prev => ({
      ...prev,
      joint_angles: metrics
    }));
  };

  const handleRepComplete = (repData: any): void => {
    console.log('[WorkoutContext] handleRepComplete called with:', repData);
    
    setStats(prev => {
      const newReps = prev.reps + 1;
      const expectedPlan = prev.expected_plan || {};
      const repsPerSet = expectedPlan.reps_per_set || 0;
      const totalSets = expectedPlan.sets || 0;
      const restSeconds = expectedPlan.rest_seconds || 60;
      
      console.log('[WorkoutContext] Incrementing reps:', prev.reps, '->', newReps);
      
      // Check if set is complete
      let newSets = prev.sets;
      let shouldStartRest = false;
      let repsForNextSet = newReps;
      
      if (repsPerSet > 0 && newReps >= repsPerSet) {
        // Set completed!
        newSets = prev.sets + 1;
        repsForNextSet = 0; // Reset reps for next set
        shouldStartRest = newSets < totalSets; // Only rest if more sets remaining
        console.log('[WorkoutContext] Set complete! Sets:', prev.sets, '->', newSets, 'Starting rest:', shouldStartRest);
      }
      
      // Check if workout is complete
      const workoutComplete = totalSets > 0 && newSets >= totalSets;
      
      // Start rest period if set completed and more sets remain
      if (shouldStartRest && !workoutComplete) {
        console.log('[WorkoutContext] Starting rest period:', restSeconds, 'seconds');
        // TODO: Implement rest timer logic here
        // For now, just mark that we're in rest
      }
      
      return {
        ...prev,
        reps: repsForNextSet,
        sets: newSets,
        rep_quality: repData.quality,
        workout_complete: workoutComplete,
        in_rest_period: shouldStartRest && !workoutComplete,
        rest_remaining: shouldStartRest && !workoutComplete ? restSeconds : 0
      };
    });
    
    console.log('[WorkoutContext] Rep completed:', repData);
  };

  const uploadVideo = async (file: File): Promise<any> => {
    try {
      setLoading(true);
      const data = await api.uploadVideo(file);
      setUploadResults(data);
      
      // Set as active workout plan
      if (data.success && data.exercises) {
        setWorkoutPlan(data);
        setCompletedExercises([]);
      }
      
      return data;
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const setManualWorkoutPlan = (plan: UploadResults): void => {
    // Set both uploadResults (to show modal) and workoutPlan
    setUploadResults(plan);
    setWorkoutPlan(plan);
    setCompletedExercises([]);
  };

  const addExerciseToWorkoutPlan = (exercise: { id: string; name: string; sets: number; reps_per_set: number; weight?: number; rest_seconds?: number }): void => {
    const newExercise = {
      id: exercise.id,
      name: exercise.name,
      sets: exercise.sets,
      reps_per_set: exercise.reps_per_set,
      weight: exercise.weight,
      trackable: true,
      completed: false,
      mapped_exercise: exercise.id
    };

    if (workoutPlan && workoutPlan.exercises) {
      // Add to existing workout plan
      const updatedPlan: UploadResults = {
        ...workoutPlan,
        exercises: [...workoutPlan.exercises, newExercise]
      };
      setWorkoutPlan(updatedPlan);
    } else {
      // Create new workout plan
      const newPlan: UploadResults = {
        success: true,
        exercises: [newExercise],
        detected_format: 'manual'
      };
      setWorkoutPlan(newPlan);
      setCompletedExercises([]);
    }
  };

  const setMultipleExercisesToWorkoutPlan = (exercises: Array<{ id: string; name: string; sets: number; reps_per_set: number; weight?: number; rest_seconds?: number }>): void => {
    const newExercises = exercises.map(exercise => ({
      id: exercise.id,
      name: exercise.name,
      sets: exercise.sets,
      reps_per_set: exercise.reps_per_set,
      weight: exercise.weight,
      trackable: true,
      completed: false,
      mapped_exercise: exercise.id
    }));

    if (workoutPlan && workoutPlan.exercises) {
      // Add to existing workout plan
      const updatedPlan: UploadResults = {
        ...workoutPlan,
        exercises: [...workoutPlan.exercises, ...newExercises]
      };
      setWorkoutPlan(updatedPlan);
    } else {
      // Create new workout plan
      const newPlan: UploadResults = {
        success: true,
        exercises: newExercises,
        detected_format: 'manual'
      };
      setWorkoutPlan(newPlan);
      setCompletedExercises([]);
    }
  };

  const removeExerciseFromPlan = (index: number): void => {
    if (!workoutPlan || !workoutPlan.exercises) return;
    
    // Create new exercises array without the deleted exercise
    const updatedExercises = workoutPlan.exercises.filter((_, i) => i !== index);
    
    // Update workout plan
    const updatedPlan: UploadResults = {
      ...workoutPlan,
      exercises: updatedExercises
    };
    
    setWorkoutPlan(updatedPlan);
    
    // Update completed exercises indices (shift down indices after deleted one)
    const updatedCompleted = completedExercises
      .filter(i => i !== index) // Remove if this was completed
      .map(i => i > index ? i - 1 : i); // Shift indices down
    
    setCompletedExercises(updatedCompleted);
    
    // If we deleted all exercises, clear the plan
    if (updatedExercises.length === 0) {
      setWorkoutPlan(null);
      setCompletedExercises([]);
    }
  };

  const clearWorkoutPlan = (): void => {
    setWorkoutPlan(null);
    setCompletedExercises([]);
  };

  const value: WorkoutContextValue = {
    exercises,
    currentExercise,
    currentExerciseIndex,
    stats,
    uploadResults,
    workoutPlan,
    completedExercises,
    isTracking,
    loading,
    selectedVideoFile,
    sessionId,
    setSelectedVideoFile,
    startExercise,
    stopExercise,
    trackVideoFile,
    uploadVideo,
    setUploadResults,
    setManualWorkoutPlan,
    addExerciseToWorkoutPlan,
    setMultipleExercisesToWorkoutPlan,
    removeExerciseFromPlan,
    clearWorkoutPlan,
    updateStats,
    handleRepComplete,
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
};
