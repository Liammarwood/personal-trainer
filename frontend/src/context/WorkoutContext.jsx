import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const WorkoutContext = createContext();

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};

export const WorkoutProvider = ({ children }) => {
  const [exercises, setExercises] = useState([]);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(null); // Track which plan exercise is active
  const [stats, setStats] = useState({
    reps: 0,
    sets: 0,
    duration: 0,
    expected_plan: null
  });
  const [uploadResults, setUploadResults] = useState(null);
  const [workoutPlan, setWorkoutPlan] = useState(null); // Persistent workout plan
  const [completedExercises, setCompletedExercises] = useState([]); // Track completed
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load available exercises on mount
  useEffect(() => {
    loadExercises();
  }, []);

  // Poll stats when tracking
  useEffect(() => {
    let interval;
    if (isTracking) {
      interval = setInterval(async () => {
        try {
          const data = await api.getStats();
          setStats(data);
        } catch (error) {
          console.error('Error fetching stats:', error);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await api.getAvailableExercises();
      setExercises(data.exercises || []);
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const startExercise = async (exerciseId, options = {}) => {
    try {
      setLoading(true);
      await api.startExercise(exerciseId, options);
      setCurrentExercise(exerciseId);
      setIsTracking(true);
      setStats({ reps: 0, sets: 0, duration: 0, expected_plan: options });
      
      // If options has an exerciseIndex, track it
      if (options.exerciseIndex !== undefined) {
        setCurrentExerciseIndex(options.exerciseIndex);
      }
    } catch (error) {
      console.error('Error starting exercise:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const stopExercise = async () => {
    try {
      setLoading(true);
      await api.stopExercise();
      
      // Mark exercise as completed if it was from workout plan
      if (currentExerciseIndex !== null && workoutPlan) {
        if (!completedExercises.includes(currentExerciseIndex)) {
          setCompletedExercises([...completedExercises, currentExerciseIndex]);
        }
      }
      
      setIsTracking(false);
      setCurrentExercise(null);
      setCurrentExerciseIndex(null);
    } catch (error) {
      console.error('Error stopping exercise:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const uploadVideo = async (file) => {
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

  const clearWorkoutPlan = () => {
    setWorkoutPlan(null);
    setCompletedExercises([]);
  };

  const value = {
    exercises,
    currentExercise,
    currentExerciseIndex,
    stats,
    uploadResults,
    workoutPlan,
    completedExercises,
    isTracking,
    loading,
    startExercise,
    stopExercise,
    uploadVideo,
    setUploadResults,
    clearWorkoutPlan,
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
};
