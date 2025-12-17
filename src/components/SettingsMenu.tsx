import React, { useState, MouseEvent, ChangeEvent } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  Switch,
  ListItemText,
  ListItemIcon,
  Divider,
  Typography,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Alert,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useSettings } from '../context/SettingsContext';
import { useWorkout } from '../context/WorkoutContext';
import type { AppSettings } from '../types';

const SettingsMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { settings, updateSetting } = useSettings();
  const { setSelectedVideoFile, isTracking } = useWorkout();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const handleToggle = (key: keyof AppSettings): void => {
    updateSetting(key, !settings[key]);
  };

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
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: 'white',
          backgroundColor: 'rgba(255,255,255,0.1)',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.2)',
          },
        }}
      >
        <SettingsIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            minWidth: 250,
            backgroundColor: 'background.paper',
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Input Source
          </Typography>
        </Box>
        
        <Box sx={{ px: 2, py: 1 }}>
          <ToggleButtonGroup
            value={settings.inputMode}
            exclusive
            onChange={handleModeChange}
            fullWidth
            size="small"
            disabled={isTracking}
          >
            <ToggleButton value="webcam" aria-label="webcam">
              <VideocamIcon sx={{ mr: 0.5, fontSize: 20 }} />
              Webcam
            </ToggleButton>
            <ToggleButton value="video" aria-label="video file">
              <VideoFileIcon sx={{ mr: 0.5, fontSize: 20 }} />
              Video File
            </ToggleButton>
          </ToggleButtonGroup>

          {settings.inputMode === 'video' && (
            <Box sx={{ mt: 1 }}>
              <input
                accept="video/*"
                style={{ display: 'none' }}
                id="video-file-upload"
                type="file"
                onChange={handleVideoFileChange}
                disabled={isTracking}
              />
              <label htmlFor="video-file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  startIcon={<UploadFileIcon />}
                  disabled={isTracking}
                  size="small"
                >
                  {videoFile ? videoFile.name : 'Choose Video'}
                </Button>
              </label>
              {uploadError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {uploadError}
                </Alert>
              )}
              {videoFile && !uploadError && (
                <Typography variant="caption" color="success.main" display="block" sx={{ mt: 0.5 }}>
                  ✓ Video loaded successfully
                </Typography>
              )}
            </Box>
          )}
        </Box>

        <Divider />

        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Display Settings
          </Typography>
        </Box>
        
        <Divider />

        <MenuItem onClick={() => handleToggle('showStatsOverlay')}>
          <ListItemIcon>
            <AssessmentIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Show Stats Overlay" />
          <Switch
            edge="end"
            checked={settings.showStatsOverlay}
            onChange={() => handleToggle('showStatsOverlay')}
          />
        </MenuItem>

        <MenuItem onClick={() => handleToggle('showRepQuality')}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Show Rep Quality" />
          <Switch
            edge="end"
            checked={settings.showRepQuality}
            onChange={() => handleToggle('showRepQuality')}
          />
        </MenuItem>

        <MenuItem onClick={() => handleToggle('showAdvancedMode')}>
          <ListItemIcon>
            <DeveloperModeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Advanced Mode" 
            secondary="Show joint angles & skeleton tracking"
          />
          <Switch
            edge="end"
            checked={settings.showAdvancedMode}
            onChange={() => handleToggle('showAdvancedMode')}
          />
        </MenuItem>

        <Divider />

        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Audio Settings
          </Typography>
        </Box>

        <MenuItem onClick={() => handleToggle('soundEnabled')}>
          <ListItemIcon>
            <VolumeUpIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Sound Effects" />
          <Switch
            edge="end"
            checked={settings.soundEnabled}
            onChange={() => handleToggle('soundEnabled')}
          />
        </MenuItem>
      </Menu>
    </>
  );
};

export default SettingsMenu;
