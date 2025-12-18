import WorkoutPlan from '../components/WorkoutPlan';
import { Box } from '@mui/material';

const PlanPage: React.FC = () => {
  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <WorkoutPlan />
    </Box>
  );
};

export default PlanPage;
