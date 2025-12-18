import { useState } from 'react';
import VideoFeed from '../components/VideoFeed';
import StatsPanel from '../components/StatsPanel';
import { Box } from '@mui/material';

interface WorkoutPageProps {
  onFullscreenChange: (isFullscreen: boolean) => void;
}

const WorkoutPage: React.FC<WorkoutPageProps> = ({ onFullscreenChange }) => {
  const [hideVideoFeed, setHideVideoFeed] = useState<boolean>(false);

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: hideVideoFeed ? 'none' : 'flex', flex: 1, flexDirection: 'column' }}>
        <VideoFeed 
          onToggleVideo={() => setHideVideoFeed(!hideVideoFeed)} 
          onFullscreenChange={onFullscreenChange}
        />
      </Box>
      {hideVideoFeed && <StatsPanel onShowVideo={() => setHideVideoFeed(false)} />}
    </Box>
  );
};

export default WorkoutPage;
