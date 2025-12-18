import { useState, useRef, useEffect } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { useSettings } from '../context/SettingsContext';
import { Paper, Box, Typography, IconButton, Tooltip } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ClientSideVideoFeed from './ClientSideVideoFeed';
import WorkoutStatsOverlay from './WorkoutStatsOverlay';

interface VideoFeedProps {
  onToggleVideo: () => void;
}

const VideoFeed: React.FC<VideoFeedProps> = ({ onToggleVideo }) => {
  const { isTracking, stats, sessionId, updateStats, handleRepComplete, currentExercise, selectedVideoFile } = useWorkout();
  const { settings } = useSettings();
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Listen for fullscreen changes (e.g., user presses ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleFullscreenToggle = async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        // Enter fullscreen
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  // Client-side processing is now the default
  if (!isTracking) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <VideocamIcon sx={{ fontSize: 80, color: 'action.disabled' }} />
          <Typography variant="h6" color="text.secondary">
            Start an Exercise to See Video
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Select an exercise and click "Start Exercise" to begin tracking
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper 
      ref={containerRef}
      elevation={3} 
      sx={{ 
        position: 'relative', 
        overflow: 'hidden', 
        aspectRatio: { xs: 'unset', sm: '16/9' }, 
        height: isFullscreen ? '100vh' : { xs: '80vh', sm: 'auto' }, 
        width: isFullscreen ? '100vw' : 'auto',
        backgroundColor: '#000' 
      }}
    >
      {/* Workout Stats Overlay */}
      {isTracking && <WorkoutStatsOverlay stats={stats} visible={settings.showStatsOverlay} />}

      {/* Control Buttons */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 3,
          display: 'flex',
          gap: 1,
        }}
      >
        <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
          <IconButton
            onClick={handleFullscreenToggle}
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Tooltip>

        {!isFullscreen && (
          <Tooltip title="Hide Video Feed">
            <IconButton
              onClick={onToggleVideo}
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                },
              }}
            >
              <VisibilityOffIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Client-side pose detection and rendering */}
      {sessionId && currentExercise && (
        <ClientSideVideoFeed
          exerciseId={currentExercise}
          sessionId={sessionId}
          onMetricsUpdate={updateStats}
          onRepComplete={handleRepComplete}
          isTracking={isTracking}
          videoFile={selectedVideoFile}
          inRestPeriod={stats.in_rest_period || false}
          workoutComplete={stats.workout_complete || false}
          showAdvancedMode={settings.showAdvancedMode}
        />
      )}
    </Paper>
  );
};

export default VideoFeed;
