import React, { useState, useEffect } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import api from '../services/api';
import './VideoFeed.css';

const VideoFeed = () => {
  const [loading, setLoading] = useState(true);
  const { isTracking } = useWorkout();
  const videoUrl = api.getVideoFeedUrl();

  useEffect(() => {
    // Reset loading state when tracking starts
    if (isTracking) {
      setLoading(true);
    }
  }, [isTracking]);

  if (!isTracking) {
    return (
      <div className="video-feed-container video-feed-placeholder">
        <div className="placeholder-content">
          <svg className="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h3>Start an Exercise to See Video</h3>
          <p>Select an exercise and click "Start Exercise" to begin tracking</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-feed-container">
      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading video feed...</p>
        </div>
      )}
      <img
        src={videoUrl}
        alt="Video Feed"
        className="video-feed"
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)}
      />
    </div>
  );
};

export default VideoFeed;
