import { Typography, Box } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Chip } from '@mui/material';

interface WorkoutPlanHeaderProps {
  title: string;
  completedCount?: number;
  totalCount?: number;
  buildingCount?: number;
  showProgress?: boolean;
}

export const WorkoutPlanHeader: React.FC<WorkoutPlanHeaderProps> = ({ 
  title, 
  completedCount, 
  totalCount, 
  buildingCount,
  showProgress 
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
      <AssignmentIcon color="primary" sx={{ fontSize: 32 }} />
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
        {title}
      </Typography>
      {buildingCount !== undefined && buildingCount > 0 && (
        <Chip 
          label={`${buildingCount} exercise${buildingCount > 1 ? 's' : ''}`}
          color="primary"
          size="small"
        />
      )}
      {showProgress && completedCount !== undefined && totalCount !== undefined && (
        <>
          <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main', ml: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {completedCount} of {totalCount} completed
          </Typography>
        </>
      )}
    </Box>
  );
};
