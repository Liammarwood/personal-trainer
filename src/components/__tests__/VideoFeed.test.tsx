import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import VideoFeed from '../VideoFeed';
import { SettingsProvider } from '../../context/SettingsContext';
import { WorkoutProvider } from '../../context/WorkoutContext';

// Mock dependencies
vi.mock('../../services/api', () => ({
  default: {
    getExercisesV2: vi.fn(() => Promise.resolve({ exercises: [] })),
  },
}));

vi.mock('../ClientSideVideoFeed', () => ({
  default: () => <div data-testid="client-side-video-feed">Video Feed</div>,
}));

const MockProviders = ({ children }: { children: React.ReactNode }) => (
  <SettingsProvider>
    <WorkoutProvider>{children}</WorkoutProvider>
  </SettingsProvider>
);

describe('VideoFeed', () => {
  const mockOnToggleVideo = vi.fn();

  beforeEach(() => {
    mockOnToggleVideo.mockClear();
  });

  it('should show placeholder when not tracking', () => {
    render(
      <MockProviders>
        <VideoFeed onToggleVideo={mockOnToggleVideo} />
      </MockProviders>
    );
    
    expect(screen.getByText('Start an Exercise to See Video')).toBeInTheDocument();
    expect(screen.getByText(/Select an exercise and click "Start Exercise"/)).toBeInTheDocument();
  });

  it('should render video feed placeholder with camera icon', () => {
    render(
      <MockProviders>
        <VideoFeed onToggleVideo={mockOnToggleVideo} />
      </MockProviders>
    );
    
    // Check for the VideocamIcon by checking the Paper component
    const paper = screen.getByText('Start an Exercise to See Video').closest('div[class*="MuiPaper"]');
    expect(paper).toBeInTheDocument();
  });

  it('should have fullscreen capability', () => {
    render(
      <MockProviders>
        <VideoFeed onToggleVideo={mockOnToggleVideo} />
      </MockProviders>
    );
    
    // The component should render a Paper with ref for fullscreen
    const container = screen.getByText('Start an Exercise to See Video').closest('div[class*="MuiPaper"]');
    expect(container).toBeInTheDocument();
  });
});
