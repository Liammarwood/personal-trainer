import { memo } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { useSettings } from '../context/SettingsContext';
import { Paper, Box, Typography, IconButton, Tooltip } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ClientSideVideoFeed from './ClientSideVideoFeed';
import WorkoutStatsOverlay from './WorkoutStatsOverlay';
import { useFullscreen } from '../hooks/useFullscreen';
import { Z_INDEX, CONTROL_BUTTON_STYLE, VIDEO_ASPECT_RATIO, MOBILE_VIDEO_HEIGHT } from '../constants';

interface VideoFeedProps {
  onToggleVideo: () => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

const VideoFeed: React.FC<VideoFeedProps> = ({ onToggleVideo, onFullscreenChange }) => {
  const { isTracking, stats, sessionId, updateStats, handleRepComplete, currentExercise, selectedVideoFile } = useWorkout();
  const { settings } = useSettings();
  const { isFullscreen, toggleFullscreen, containerRef } = useFullscreen(onFullscreenChange);

  // Client-side processing is now the default
  if (!isTracking) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', backgroundColor: '#f5f5f5', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, width: '100%', height: '100%' }}>
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
        aspectRatio: { xs: 'unset', sm: VIDEO_ASPECT_RATIO }, 
        height: isFullscreen ? '100vh' : { xs: MOBILE_VIDEO_HEIGHT, sm: 'auto' }, 
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
          zIndex: Z_INDEX.OVERLAY_CONTROLS,
          display: 'flex',
          gap: 1,
        }}
      >
        <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
          <IconButton
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            sx={CONTROL_BUTTON_STYLE}
          >
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Tooltip>

        {!isFullscreen && (
          <Tooltip title="Hide Video Feed">
            <IconButton
              onClick={onToggleVideo}
              aria-label="Hide video feed"
              sx={CONTROL_BUTTON_STYLE}
            >
              <VideocamOffIcon />
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

export default memo(VideoFeed);
