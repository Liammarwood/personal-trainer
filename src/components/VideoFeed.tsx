import { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { useSettings } from '../context/SettingsContext';
import { Paper, Box, Typography, IconButton, Tooltip } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ClientSideVideoFeed from './ClientSideVideoFeed';
import WorkoutStatsOverlay from './WorkoutStatsOverlay';

interface VideoFeedProps {
  onToggleVideo: () => void;
}

const VideoFeed: React.FC<VideoFeedProps> = ({ onToggleVideo }) => {
  const { isTracking, stats, sessionId, updateStats, handleRepComplete, currentExercise, selectedVideoFile } = useWorkout();
  const { settings } = useSettings();

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
    <Paper elevation={3} sx={{ position: 'relative', overflow: 'hidden', aspectRatio: { xs: 'unset', sm: '16/9' }, height: { xs: '80vh', sm: 'auto' }, backgroundColor: '#000' }}>
      {/* Workout Stats Overlay */}
      {isTracking && <WorkoutStatsOverlay stats={stats} visible={settings.showStatsOverlay} />}

      {/* Hide Video Toggle Button */}
      <Tooltip title="Hide Video Feed">
        <IconButton
          onClick={onToggleVideo}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 3,
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
        />
      )}
    </Paper>
  );
};

export default VideoFeed;
