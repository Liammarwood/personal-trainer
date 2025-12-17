import { useState, ChangeEvent, MouseEvent } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { useSettings } from '../context/SettingsContext';
import {
  Paper,
  Typography,
  Button,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import UploadFileIcon from '@mui/icons-material/UploadFile';

type InputMode = 'webcam' | 'video';

interface InputModeSelectorProps {
  disabled?: boolean;
}

const InputModeSelector: React.FC<InputModeSelectorProps> = ({ disabled = false }) => {
  const { isTracking, setSelectedVideoFile } = useWorkout();
  const { settings, updateSetting } = useSettings();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');

  const handleModeChange = (event: MouseEvent<HTMLElement>, newMode: InputMode | null): void => {
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
      // Validate file type
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
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 2.5 } }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
        Input Mode
      </Typography>
      <ToggleButtonGroup
        value={settings.inputMode}
        exclusive
        onChange={handleModeChange}
        fullWidth
        disabled={disabled || isTracking}
        size="small"
        sx={{
          mb: settings.inputMode === 'video' ? 2 : 0,
          '& .MuiToggleButton-root': {
            py: { xs: 1, sm: 1.5 },
            fontSize: { xs: '0.8rem', sm: '0.875rem' }
          }
        }}
      >
        <ToggleButton value="webcam">
          <VideocamIcon sx={{ mr: { xs: 0.5, sm: 1 }, fontSize: { xs: '1rem', sm: '1.25rem' } }} />
          Webcam
        </ToggleButton>
        <ToggleButton value="video">
          <VideoFileIcon sx={{ mr: { xs: 0.5, sm: 1 }, fontSize: { xs: '1rem', sm: '1.25rem' } }} />
          Video File
        </ToggleButton>
      </ToggleButtonGroup>

      {settings.inputMode === 'video' && !isTracking && (
        <Box>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            startIcon={<UploadFileIcon />}
            sx={{
              py: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.9rem', sm: '1rem' },
              borderStyle: 'dashed',
              '&:hover': { borderStyle: 'dashed' }
            }}
          >
            {videoFile ? videoFile.name : 'Select Video File'}
            <input
              type="file"
              hidden
              accept="video/mp4,video/avi,video/mov,video/quicktime"
              onChange={handleVideoFileChange}
            />
          </Button>
          {uploadError && (
            <Alert severity="error" sx={{ mt: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              {uploadError}
            </Alert>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default InputModeSelector;
