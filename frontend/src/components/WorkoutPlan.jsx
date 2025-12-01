import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import './WorkoutPlan.css';

const WorkoutPlan = () => {
  const { workoutPlan, completedExercises, currentExerciseIndex, startExercise, clearWorkoutPlan, isTracking } = useWorkout();
  const [expanded, setExpanded] = useState(true);

  if (!workoutPlan) {
    return null;
  }

  const handleStartExercise = (exercise, index) => {
    if (isTracking || completedExercises.includes(index)) return;
    
    startExercise(exercise.mapped_exercise, {
      sets: exercise.sets,
      reps_per_set: exercise.reps,
      target_weight: exercise.weight,
      rest_seconds: 60,
      exerciseIndex: index  // Pass the index so we know which one is active
    });
  };

  const totalExercises = workoutPlan.exercises?.length || 0;
  const completedCount = completedExercises.length;
  const progressPercent = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;

  return (
    <div className="workout-plan-panel">
      <div className="workout-plan-header" onClick={() => setExpanded(!expanded)}>
        <div className="header-left">
          <h3>📋 Today's Workout</h3>
          <span className="progress-badge">
            {completedCount} / {totalExercises} completed
          </span>
        </div>
        <div className="header-right">
          <button 
            className="clear-plan-btn"
            onClick={(e) => {
              e.stopPropagation();
              clearWorkoutPlan();
            }}
            title="Clear workout plan"
          >
            ✕
          </button>
          <span className={`expand-icon ${expanded ? 'expanded' : ''}`}>▼</span>
        </div>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {expanded && (
        <div className="workout-plan-content">
          {workoutPlan.exercises?.map((exercise, index) => {
            const isCompleted = completedExercises.includes(index);
            const isCurrentlyTracking = currentExerciseIndex === index && isTracking;
            const isTrackable = exercise.trackable;

            return (
              <div 
                key={index} 
                className={`plan-exercise-card ${isCompleted ? 'completed' : ''} ${isCurrentlyTracking ? 'in-progress' : ''} ${!isTrackable ? 'not-trackable' : ''}`}
              >
                <div className="plan-exercise-info">
                  <div className="plan-exercise-header">
                    <h4>{exercise.name}</h4>
                    {isCompleted && <span className="completed-badge">✓ Done</span>}
                    {isCurrentlyTracking && <span className="in-progress-badge">⏱ In Progress</span>}
                    {!isTrackable && <span className="not-trackable-badge">Not Trackable</span>}
                  </div>
                  
                  <div className="plan-exercise-details">
                    <span className="detail">
                      <strong>{exercise.sets}</strong> sets
                    </span>
                    <span className="detail">
                      <strong>{exercise.reps}</strong> reps
                    </span>
                    {exercise.weight > 0 && (
                      <span className="detail">
                        <strong>{exercise.weight}</strong> kg
                      </span>
                    )}
                  </div>

                  {isTrackable && exercise.mapped_exercise && (
                    <div className="mapped-exercise">
                      Maps to: <strong>{exercise.mapped_exercise}</strong>
                    </div>
                  )}
                </div>

                {isTrackable && !isCompleted && (
                  <button 
                    className="start-btn"
                    onClick={() => handleStartExercise(exercise, index)}
                    disabled={isTracking}
                  >
                    {isCurrentlyTracking ? 'Tracking...' : isTracking ? 'In Progress...' : 'Start'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkoutPlan;
