import React, { useEffect } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import './WorkoutResults.css';

const WorkoutResults = () => {
  const { uploadResults, setUploadResults } = useWorkout();

  // Auto-close modal after setting workout plan
  useEffect(() => {
    if (uploadResults) {
      // Close modal after 500ms to give user feedback
      const timer = setTimeout(() => {
        setUploadResults(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [uploadResults, setUploadResults]);

  if (!uploadResults) return null;

  return (
    <div className="results-overlay">
      <div className="results-modal">
        <div className="results-header">
          <h2>✅ Workout Plan Loaded!</h2>
        </div>

        <div className="results-summary">
          <div className="summary-item">
            <span className="summary-label">Total Exercises:</span>
            <span className="summary-value">{uploadResults.exercises?.length || 0}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Trackable:</span>
            <span className="summary-value success">
              {uploadResults.exercises?.filter(e => e.trackable).length || 0}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Not Trackable:</span>
            <span className="summary-value warning">
              {uploadResults.exercises?.filter(e => !e.trackable).length || 0}
            </span>
          </div>
        </div>

        <div className="success-message">
          <p>Your workout plan has been loaded successfully!</p>
          <p className="sub-message">View it at the top of the screen to start tracking.</p>
        </div>
      </div>
    </div>
  );
};

export default WorkoutResults;
