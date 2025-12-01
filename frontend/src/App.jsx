import React from 'react';
import { WorkoutProvider } from './context/WorkoutContext';
import VideoFeed from './components/VideoFeed';
import ExerciseSelector from './components/ExerciseSelector';
import StatsPanel from './components/StatsPanel';
import UploadInterface from './components/UploadInterface';
import WorkoutResults from './components/WorkoutResults';
import WorkoutPlan from './components/WorkoutPlan';
import './App.css';

function App() {
  return (
    <WorkoutProvider>
      <div className="app">
        <header className="app-header">
          <h1>🏋️ Personal Trainer</h1>
          <p>AI-Powered Workout Tracking</p>
        </header>

        <main className="app-main">
          <div className="main-content">
            <div className="left-column">
              <WorkoutPlan />
              
              <section className="video-section">
                <VideoFeed />
              </section>

              <section className="controls-section">
                <ExerciseSelector />
              </section>
            </div>

            <div className="right-column">
              <section className="controls-section">
                <StatsPanel />
              </section>

              <section className="controls-section">
                <UploadInterface />
              </section>
            </div>
          </div>
        </main>

        <WorkoutResults />
      </div>
    </WorkoutProvider>
  );
}

export default App;
