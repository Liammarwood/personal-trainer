import React, { useState, MouseEvent } from 'react';
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
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import { useSettings } from '../context/SettingsContext';
import type { AppSettings } from '../types';

const SettingsMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { settings, updateSetting } = useSettings();
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
