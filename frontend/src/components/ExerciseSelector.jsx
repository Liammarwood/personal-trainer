import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import './ExerciseSelector.css';

const ExerciseSelector = () => {
  const { exercises, currentExercise, isTracking, startExercise, stopExercise, loading } = useWorkout();
  const [selectedExercise, setSelectedExercise] = useState('');
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(0);
  const [rest, setRest] = useState(60);

  const handleStart = async () => {
    if (!selectedExercise) return;
    
    await startExercise(selectedExercise, {
      sets: parseInt(sets),
      reps_per_set: parseInt(reps),
      target_weight: parseFloat(weight),
      rest_seconds: parseInt(rest)
    });
  };

  const handleStop = async () => {
    await stopExercise();
    setSelectedExercise('');
  };

  return (
    <div className="exercise-selector">
      <h2>Exercise Selection</h2>
      
      <div className="form-group">
        <label htmlFor="exercise-select">Choose Exercise:</label>
        <select
          id="exercise-select"
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          disabled={isTracking}
        >
          <option value="">-- Select an exercise --</option>
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>
      </div>

      {selectedExercise && !isTracking && (
        <div className="workout-plan">
          <h3>Workout Plan</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sets">Sets:</label>
              <input
                type="number"
                id="sets"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                min="1"
              />
            </div>
            <div className="form-group">
              <label htmlFor="reps">Reps/Set:</label>
              <input
                type="number"
                id="reps"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                min="1"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="weight">Weight (kg):</label>
              <input
                type="number"
                id="weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="0"
                step="2.5"
              />
            </div>
            <div className="form-group">
              <label htmlFor="rest">Rest (sec):</label>
              <input
                type="number"
                id="rest"
                value={rest}
                onChange={(e) => setRest(e.target.value)}
                min="0"
                step="5"
              />
            </div>
          </div>
        </div>
      )}

      <div className="button-group">
        {!isTracking ? (
          <button
            onClick={handleStart}
            disabled={!selectedExercise || loading}
            className="btn btn-primary"
          >
            Start Exercise
          </button>
        ) : (
          <button
            onClick={handleStop}
            disabled={loading}
            className="btn btn-danger"
          >
            Stop Exercise
          </button>
        )}
      </div>

      {isTracking && (
        <div className="tracking-indicator">
          <span className="pulse"></span>
          Tracking: {exercises.find(e => e.id === currentExercise)?.name}
        </div>
      )}
    </div>
  );
};

export default ExerciseSelector;
