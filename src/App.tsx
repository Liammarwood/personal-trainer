import { useState, useEffect, lazy, Suspense } from 'react';
import { WorkoutProvider, useWorkout } from './context/WorkoutContext';
import WorkoutResults from './components/WorkoutResults';
import WorkoutCompleteDialog from './components/WorkoutCompleteDialog';
import AboutModal from './components/AboutModal';
import QuickActionsSheet from './components/QuickActionsSheet';
import WorkoutPage from './pages/WorkoutPage';
import PlanPage from './pages/PlanPage';
import UploadPage from './pages/UploadPage';
import SettingsPage from './pages/SettingsPage';
import { RequireAuth } from './components/RequireAuth';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Container, Box, Typography, CssBaseline, AppBar, Toolbar, IconButton, Tooltip, BottomNavigation, BottomNavigationAction, Paper, Fab, Snackbar, Alert } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ListAltIcon from '@mui/icons-material/ListAlt';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DownloadIcon from '@mui/icons-material/Download';
import { APP_VERSION } from './libs/buildInfo';
import { BeforeInstallPromptEvent } from './types/events';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Z_INDEX } from './constants';
import { Loading } from './components/Loading';

const HistoryPage = lazy(() => import('./pages/HistoryPage'));

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
  const [aboutOpen, setAboutOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [quickActionsOpen, setQuickActionsOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState<boolean>(false);
  const [showInstallSuccess, setShowInstallSuccess] = useState<boolean>(false);

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

  // PWA install prompt handling
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async (): Promise<void> => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt');
      setShowInstallSuccess(true);
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const handleCloseCompleteDialog = async (): Promise<void> => {
    setShowCompleteDialog(false);
    // Stop the exercise to allow starting a new one
    await stopExercise();
  };

  const currentExerciseName = exercises.find(ex => ex.id === currentExercise)?.name || 'Exercise';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={2} sx={{ zIndex: 1100 }}>
        <Toolbar>
          <FitnessCenterIcon sx={{ mr: 2 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
              One Personal Trainer
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, display: { xs: 'none', sm: 'block' } }}>
              Workout Tracking
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
            v{APP_VERSION || '1.0.0'}
          </Typography>
          {showInstallButton && (
            <Tooltip title="Install App">
              <IconButton
                onClick={handleInstallClick}
                sx={{ color: 'white', mr: 0.5 }}
                size="small"
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="About">
            <IconButton
              onClick={() => setAboutOpen(true)}
              sx={{ color: 'white' }}
              size="small"
            >
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />

      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 3 }, pb: { xs: 10, md: 3 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {currentPage === 0 && (
          <ErrorBoundary fallbackMessage="Failed to load Workout page">
            <WorkoutPage onFullscreenChange={setIsFullscreen} />
          </ErrorBoundary>
        )}
        {currentPage === 1 && (
          <ErrorBoundary fallbackMessage="Failed to load Plan page">
            <PlanPage />
          </ErrorBoundary>
        )}
        {currentPage === 2 && (
          <ErrorBoundary fallbackMessage="Failed to load Upload page">
            <UploadPage />
          </ErrorBoundary>
        )}
        {currentPage === 3 && (
          <ErrorBoundary fallbackMessage="Failed to load History page">
            <Suspense fallback={<Loading />}>
              <HistoryPage />
            </Suspense>
          </ErrorBoundary>
        )}
        {currentPage === 4 && (
          <ErrorBoundary fallbackMessage="Failed to load Settings page">
            <SettingsPage />
          </ErrorBoundary>
        )}
      </Container>

      <WorkoutResults />
      <WorkoutCompleteDialog
        open={showCompleteDialog}
        onClose={handleCloseCompleteDialog}
        stats={stats}
        exerciseName={currentExerciseName}
      />
      <Snackbar
        open={showInstallSuccess}
        autoHideDuration={6000}
        onClose={() => setShowInstallSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setShowInstallSuccess(false)}>
          App installed successfully! You can now use it offline.
        </Alert>
      </Snackbar>
      <QuickActionsSheet
        open={quickActionsOpen}
        onOpen={() => setQuickActionsOpen(true)}
        onClose={() => setQuickActionsOpen(false)}
      />

      {/* Bottom Navigation - Mobile and Desktop */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: Z_INDEX.BOTTOM_NAV,
        }}
        elevation={3}
      >
        <BottomNavigation
          value={currentPage}
          onChange={(event, newValue) => {
            setCurrentPage(newValue);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          showLabels
          sx={{
            height: { xs: 56, sm: 64 },
            '& .MuiBottomNavigationAction-root': {
              minWidth: { xs: 50, sm: 70 },
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
            },
          }}
        >
          <BottomNavigationAction label="Workout" icon={<FitnessCenterIcon />} />
          <BottomNavigationAction label="Plan" icon={<ListAltIcon />} />
          <BottomNavigationAction label="Upload" icon={<UploadFileIcon />} />
          <BottomNavigationAction label="History" icon={<HistoryIcon />} />
          <BottomNavigationAction label="Settings" icon={<SettingsIcon />} />
        </BottomNavigation>
      </Paper>

      {/* Floating Action Button for Quick Actions - Fullscreen Only */}
      {isFullscreen && (
        <Fab
          color="primary"
          aria-label="quick actions"
          onClick={() => setQuickActionsOpen(true)}
          sx={{
            position: 'fixed',
            bottom: { xs: 72, sm: 80 },
            right: 16,
            zIndex: 999,
          }}
        >
          <MoreVertIcon />
        </Fab>
      )}
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
