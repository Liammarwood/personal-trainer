import { useState, useEffect } from 'react';
import { WorkoutProvider, useWorkout } from './context/WorkoutContext';
import VideoFeed from './components/VideoFeed';
import StatsPanel from './components/StatsPanel';
import UploadInterface from './components/UploadInterface';
import WorkoutResults from './components/WorkoutResults';
import WorkoutPlan from './components/WorkoutPlan';
import InstallPrompt from './components/InstallPrompt';
import InstallPWA from './components/InstallPWA';
import WorkoutCompleteDialog from './components/WorkoutCompleteDialog';
import SettingsMenu from './components/SettingsMenu';
import AboutModal from './components/AboutModal';
import { RequireAuth } from './components/RequireAuth';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Container, Box, Typography, CssBaseline, AppBar, Toolbar, IconButton, Tooltip } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Grid from '@mui/material/Grid';
import { APP_VERSION } from './libs/buildInfo';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function AppContent(): JSX.Element {
  const { stats, exercises, currentExercise, stopExercise } = useWorkout();
  const [showCompleteDialog, setShowCompleteDialog] = useState<boolean>(false);
  const [hideVideoFeed, setHideVideoFeed] = useState<boolean>(false);
  const [aboutOpen, setAboutOpen] = useState<boolean>(false);

  // Show completion dialog when workout is complete
  useEffect(() => {
    if (stats.workout_complete && !showCompleteDialog) {
      setShowCompleteDialog(true);
    }
    // Reset dialog state when workout_complete becomes false (e.g., new exercise started)
    if (!stats.workout_complete && showCompleteDialog) {
      setShowCompleteDialog(false);
    }
  }, [stats.workout_complete, showCompleteDialog]);

  const handleCloseCompleteDialog = async (): Promise<void> => {
    setShowCompleteDialog(false);
    // Stop the exercise to allow starting a new one
    await stopExercise();
  };

  const currentExerciseName = exercises.find(ex => ex.id === currentExercise)?.name || 'Exercise';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <FitnessCenterIcon sx={{ mr: 2 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
              Personal Trainer
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, display: { xs: 'none', sm: 'block' } }}>
              Workout Tracking
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
            v{APP_VERSION || '1.0.0'}
          </Typography>
          <Tooltip title="About">
            <IconButton
              onClick={() => setAboutOpen(true)}
              sx={{ color: 'white', mr: 1 }}
              size="small"
            >
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <SettingsMenu />
        </Toolbar>
      </AppBar>
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />

      <Container maxWidth={false} disableGutters sx={{ px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 3 }, flex: 1 }}>
        <Grid container spacing={{ xs: 1, sm: 2 }}>
          {/* Left column - Video/Stats */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: hideVideoFeed ? 'none' : 'block' }}>
              <VideoFeed onToggleVideo={() => setHideVideoFeed(!hideVideoFeed)} />
            </Box>
            {hideVideoFeed && <StatsPanel onShowVideo={() => setHideVideoFeed(false)} />}
          </Grid>

          {/* Right column - Today's Workout and Upload */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ mb: { xs: 2, sm: 3 } }}>
              <WorkoutPlan />
            </Box>
            <UploadInterface />
          </Grid>
          
        </Grid>
      </Container>

      <WorkoutResults />
      <InstallPrompt />
      <InstallPWA />
      <WorkoutCompleteDialog
        open={showCompleteDialog}
        onClose={handleCloseCompleteDialog}
        stats={stats}
        exerciseName={currentExerciseName}
      />
    </Box>
  );
}

function App(): JSX.Element {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RequireAuth>
        <WorkoutProvider>
          <AppContent />
        </WorkoutProvider>
      </RequireAuth>
    </ThemeProvider>
  );
}

export default App;
