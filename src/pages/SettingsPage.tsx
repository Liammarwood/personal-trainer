import { useSettings } from '../context/SettingsContext';
import { useWorkout } from '../context/WorkoutContext';
import {
  Paper,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { ChangeEvent, MouseEvent, useState } from 'react';

const SettingsPage: React.FC = () => {
  const { settings, updateSetting } = useSettings();
  const { setSelectedVideoFile, isTracking } = useWorkout();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');

  const handleModeChange = (event: MouseEvent<HTMLElement>, newMode: 'webcam' | 'video' | null): void => {
    if (newMode !== null) {
      updateSetting('inputMode', newMode);
      setVideoFile(null);
      setSelectedVideoFile(null);
      setUploadError('');
    }
  };

  const handleVideoFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Please select a valid video file (MP4, AVI, or MOV)');
        setVideoFile(null);
        setSelectedVideoFile(null);
        return;
      }
      setVideoFile(file);
      setSelectedVideoFile(file);
      setUploadError('');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <SettingsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Settings
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <List>
        {/* Input Source */}
        <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 1 }}>
            Input Source
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose between live webcam or pre-recorded video file
          </Typography>
          <ToggleButtonGroup
            value={settings.inputMode}
            exclusive
            onChange={handleModeChange}
            fullWidth
            size="medium"
            disabled={isTracking}
          >
            <ToggleButton value="webcam" aria-label="webcam">
              <VideocamIcon sx={{ mr: 1 }} />
              Webcam
            </ToggleButton>
            <ToggleButton value="video" aria-label="video file">
              <VideoFileIcon sx={{ mr: 1 }} />
              Video File
            </ToggleButton>
          </ToggleButtonGroup>

          {settings.inputMode === 'video' && (
            <Box sx={{ mt: 2, width: '100%' }}>
              <input
                accept="video/*"
                style={{ display: 'none' }}
                id="settings-video-file-upload"
                type="file"
                onChange={handleVideoFileChange}
                disabled={isTracking}
              />
              <label htmlFor="settings-video-file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  startIcon={<UploadFileIcon />}
                  disabled={isTracking}
                >
                  {videoFile ? videoFile.name : 'Select Video File'}
                </Button>
              </label>
              {uploadError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {uploadError}
                </Alert>
              )}
              {videoFile && !uploadError && (
                <Alert severity="success" sx={{ mt: 1 }}>
                  Video file ready: {videoFile.name}
                </Alert>
              )}
              {isTracking && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Cannot change video file while tracking
                </Alert>
              )}
            </Box>
          )}
        </ListItem>

        <Divider sx={{ my: 2 }} />

        <ListItem>
          <Box sx={{ width: '100%' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showStatsOverlay}
                  onChange={(e) => updateSetting('showStatsOverlay', e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    Show Stats Overlay
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Display workout statistics on top of the video feed
                  </Typography>
                </Box>
              }
            />
          </Box>
        </ListItem>

        <Divider sx={{ my: 2 }} />

        <ListItem>
          <Box sx={{ width: '100%' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showRepQuality}
                  onChange={(e) => updateSetting('showRepQuality', e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    Show Rep Quality
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Display quality feedback for each repetition
                  </Typography>
                </Box>
              }
            />
          </Box>
        </ListItem>

        <Divider sx={{ my: 2 }} />

        <ListItem>
          <Box sx={{ width: '100%' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.soundEnabled}
                  onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    Sound Effects
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enable audio feedback during workouts
                  </Typography>
                </Box>
              }
            />
          </Box>
        </ListItem>

        <Divider sx={{ my: 2 }} />

        <ListItem>
          <Box sx={{ width: '100%' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showAdvancedMode}
                  onChange={(e) => updateSetting('showAdvancedMode', e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    Advanced Mode
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Show detailed pose detection and joint angles
                  </Typography>
                </Box>
              }
            />
          </Box>
        </ListItem>

      </List>

      <Box sx={{ mt: 4, p: 2, backgroundColor: 'background.default', borderRadius: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Settings are saved automatically and persist across sessions
        </Typography>
      </Box>
    </Paper>
  );
};

export default SettingsPage;
