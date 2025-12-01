import { useEffect } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Grid,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const WorkoutResults: React.FC = () => {
  const { uploadResults, setUploadResults } = useWorkout();

  // Auto-close modal after setting workout plan
  useEffect(() => {
    if (uploadResults) {
      // Close modal after 500ms to give user feedback
      const timer = setTimeout(() => {
        setUploadResults(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [uploadResults, setUploadResults]);

  if (!uploadResults) return null;

  const totalExercises = uploadResults.exercises?.length || 0;
  const trackableCount = uploadResults.exercises?.filter((e) => e.trackable).length || 0;
  const notTrackableCount = uploadResults.exercises?.filter((e) => !e.trackable).length || 0;

  return (
    <Dialog
      open={!!uploadResults}
      onClose={() => setUploadResults(null)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle component="div" sx={{ textAlign: 'center', pb: 1 }}>
        <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 1 }} />
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Workout Plan Loaded!
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'primary.main', color: 'white', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {totalExercises}
              </Typography>
              <Typography variant="caption">
                Total Exercises
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'success.main', color: 'white', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {trackableCount}
              </Typography>
              <Typography variant="caption">
                Trackable
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'warning.main', color: 'white', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {notTrackableCount}
              </Typography>
              <Typography variant="caption">
                Not Trackable
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Alert severity="success" sx={{ textAlign: 'center' }}>
          <Typography variant="body1" gutterBottom>
            Your workout plan has been loaded successfully!
          </Typography>
          <Typography variant="body2">
            View it at the top of the screen to start tracking.
          </Typography>
        </Alert>
      </DialogContent>
    </Dialog>
  );
};

export default WorkoutResults;
