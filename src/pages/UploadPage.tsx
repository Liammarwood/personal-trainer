import UploadInterface from '../components/UploadInterface';
import { Box } from '@mui/material';

const UploadPage: React.FC = () => {
  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <UploadInterface />
    </Box>
  );
};

export default UploadPage;
