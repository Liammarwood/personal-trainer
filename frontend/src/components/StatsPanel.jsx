import React from 'react';
import { useWorkout } from '../context/WorkoutContext';
import './StatsPanel.css';

const StatsPanel = () => {
  const { stats, isTracking } = useWorkout();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="stats-panel">
      <h2>Workout Stats</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.reps || 0}</div>
          <div className="stat-label">Reps</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.sets || 0}</div>
          <div className="stat-label">Sets</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{formatTime(stats.duration || 0)}</div>
          <div className="stat-label">Duration</div>
        </div>
      </div>

      {stats.expected_plan && (
        <div className="expected-plan">
          <h3>Target Workout</h3>
          <div className="plan-details">
            <div className="plan-item">
              <span className="plan-label">Target Sets:</span>
              <span className="plan-value">{stats.expected_plan.sets}</span>
            </div>
            <div className="plan-item">
              <span className="plan-label">Target Reps/Set:</span>
              <span className="plan-value">{stats.expected_plan.reps_per_set}</span>
            </div>
            {stats.expected_plan.target_weight > 0 && (
              <div className="plan-item">
                <span className="plan-label">Target Weight:</span>
                <span className="plan-value">{stats.expected_plan.target_weight} kg</span>
              </div>
            )}
            <div className="plan-item">
              <span className="plan-label">Rest Period:</span>
              <span className="plan-value">{stats.expected_plan.rest_seconds}s</span>
            </div>
          </div>
        </div>
      )}

      {!isTracking && stats.reps === 0 && (
        <div className="no-data">
          <p>Start an exercise to see stats</p>
        </div>
      )}
    </div>
  );
};

export default StatsPanel;
