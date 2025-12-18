import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import type { Exercise, WorkoutStats, WorkoutOptions, UploadResults } from '../types';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

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
  const { speak } = useTextToSpeech();
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

  // Rest timer - counts down and resets for next set when complete
  useEffect(() => {
    if (!stats.in_rest_period) return;

    console.log('[WorkoutContext] Rest period started:', stats.rest_remaining, 'seconds');
    
    const timer = setInterval(() => {
      setStats(prev => {
        if (!prev.in_rest_period) return prev;
        
        const remaining = (prev.rest_remaining || 1) - 1;
        
        if (remaining <= 0) {
          // Rest complete - increment sets and ready for next set
          console.log('[WorkoutContext] Rest complete - moving to next set');
          return {
            ...prev,
            sets: prev.sets + 1, // Increment sets now
            reps: 0, // Reset reps for next set
            in_rest_period: false,
            rest_remaining: 0
          };
        }
         
        return {
          ...prev,
          rest_remaining: remaining
        };
      });
    }, 1000);

    return () => clearInterval(timer);
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
    setStats(prev => {
      // GUARD: Don't process reps during rest period
      if (prev.in_rest_period) {
        console.log('[WorkoutContext] Rep ignored - in rest period');
        return prev;
      }

      // GUARD: Don't process reps if workout is complete
      if (prev.workout_complete) {
        console.log('[WorkoutContext] Rep ignored - workout complete');
        return prev;
      }

      // Get workout plan configuration
      const plan = prev.expected_plan || {};
      const targetRepsPerSet = plan.reps_per_set || 0;
      const targetSets = plan.sets || 0;
      const restSeconds = plan.rest_seconds || 60;
      
      // Increment rep count
      const newReps = prev.reps + 1;
      console.log(`[WorkoutContext] Rep ${newReps}/${targetRepsPerSet} (Set ${prev.sets + 1}/${targetSets})`);
      
      // Announce rep
      speak(`${newReps}`, { rate: 1.2 });
      
      // Check if this set is complete
      const setComplete = targetRepsPerSet > 0 && newReps >= targetRepsPerSet;
      
      if (!setComplete) {
        // Still in the middle of a set
        return {
          ...prev,
          reps: newReps,
          rep_quality: repData.quality
        };
      }
      
      // Set is complete - check if workout is complete
      const setsCompleted = prev.sets + 1;
      const workoutComplete = targetSets > 0 && setsCompleted >= targetSets;
      
      if (workoutComplete) {
        // Workout finished!
        console.log('[WorkoutContext] Workout complete!');
        speak('Well done! Workout complete!', { rate: 0.9, pitch: 1.1 });
        return {
          ...prev,
          reps: newReps,
          // Don't increment sets - keeps total reps calculation correct
          // Total reps = sets * reps_per_set + reps
          workout_complete: true,
          rep_quality: repData.quality
        };
      }
      
      // Set complete but more sets remain - start rest
      console.log(`[WorkoutContext] Set ${setsCompleted} complete - starting ${restSeconds}s rest`);
      speak(`Set ${setsCompleted} complete. Take a rest.`, { rate: 0.95 });
      
      return {
        ...prev,
        reps: newReps,
        // Don't increment sets yet - will happen when rest completes
        in_rest_period: true,
        rest_remaining: restSeconds,
        rep_quality: repData.quality
      };
    });
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
