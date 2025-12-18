import { useWorkout } from '../context/WorkoutContext';
import {
  SwipeableDrawer,
  Box,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import StopIcon from '@mui/icons-material/Stop';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import InfoIcon from '@mui/icons-material/Info';
import TimerIcon from '@mui/icons-material/Timer';

interface QuickActionsSheetProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const QuickActionsSheet: React.FC<QuickActionsSheetProps> = ({ open, onOpen, onClose }) => {
  const { stopExercise, isTracking, stats } = useWorkout();

  const handleStopExercise = async (): Promise<void> => {
    await stopExercise();
    onClose();
  };

  const handleSkipRest = (): void => {
    // This would need to be implemented in WorkoutContext
    // For now, just close the sheet
    onClose();
  };

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      disableSwipeToOpen={false}
      sx={{
        '& .MuiDrawer-paper': {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '80vh',
          pb: 2,
        },
      }}
    >
      <Box sx={{ px: 2, pt: 2 }}>
        {/* Drag handle */}
        <Box
          sx={{
            width: 40,
            height: 4,
            backgroundColor: 'grey.300',
            borderRadius: 2,
            mx: 'auto',
            mb: 2,
          }}
        />

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Quick Actions
        </Typography>

        <List>
          {isTracking && (
            <ListItem
              component={Button}
              onClick={handleStopExercise}
              sx={{
                width: '100%',
                justifyContent: 'flex-start',
                textTransform: 'none',
                py: 2,
                mb: 1,
                backgroundColor: 'error.light',
                color: 'error.dark',
                '&:hover': {
                  backgroundColor: 'error.main',
                  color: 'white',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                <StopIcon />
              </ListItemIcon>
              <ListItemText
                primary="Stop Exercise"
                secondary="End current workout session"
              />
            </ListItem>
          )}

          {isTracking && stats.in_rest_period && (
            <ListItem
              component={Button}
              onClick={handleSkipRest}
              sx={{
                width: '100%',
                justifyContent: 'flex-start',
                textTransform: 'none',
                py: 2,
                mb: 1,
                backgroundColor: 'warning.light',
                '&:hover': {
                  backgroundColor: 'warning.main',
                },
              }}
            >
              <ListItemIcon>
                <SkipNextIcon />
              </ListItemIcon>
              <ListItemText
                primary="Skip Rest Period"
                secondary={`${stats.rest_remaining}s remaining`}
              />
            </ListItem>
          )}

          <Divider sx={{ my: 1 }} />

          <ListItem
            component={Button}
            onClick={onClose}
            sx={{
              width: '100%',
              justifyContent: 'flex-start',
              textTransform: 'none',
              py: 2,
            }}
          >
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText primary="View Form Tips" secondary="Coming soon" />
          </ListItem>

          {stats.expected_plan && (
            <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TimerIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Workout Target
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Sets: {stats.sets}/{stats.expected_plan.sets} • Reps/Set:{' '}
                {stats.expected_plan.reps_per_set}
              </Typography>
            </ListItem>
          )}
        </List>
      </Box>
    </SwipeableDrawer>
  );
};

export default QuickActionsSheet;
