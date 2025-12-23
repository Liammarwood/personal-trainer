import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkoutStatsOverlay from '../WorkoutStatsOverlay';
import type { WorkoutStats } from '../../types';
import MockProviders from '../../test/MockProviders';

describe('WorkoutStatsOverlay - Core Tests', () => {
  const mockStats: WorkoutStats = {
    reps: 8,
    sets: 2,
    duration: 60,
  };

  it('should render when visible is true', () => {
    const { container } = render(
      <MockProviders>
        <WorkoutStatsOverlay stats={mockStats} visible={true} />
      </MockProviders>
    );
    expect(container).toBeInTheDocument();
  });

  it('should handle null stats', () => {
    const { container } = render(
      <MockProviders>
        <WorkoutStatsOverlay stats={null} visible={true} />
      </MockProviders>
    );
    expect(container).toBeInTheDocument();
  });

  it('should display workout progress when visible', () => {
    render(
      <MockProviders>
        <WorkoutStatsOverlay stats={mockStats} visible={true} />
      </MockProviders>
    );
    const progress = screen.queryByText(/workout progress/i) || screen.queryByText(/reps|sets/i);
    expect(progress || screen.getByRole('progressbar')).toBeTruthy();
  });

  it('should show minimize button when overlay is visible', () => {
    render(
      <MockProviders>
        <WorkoutStatsOverlay stats={mockStats} visible={true} />
      </MockProviders>
    );
    const minimizeButton = screen.getByLabelText(/minimize workout stats/i);
    expect(minimizeButton).toBeInTheDocument();
  });

  it('should minimize overlay when minimize button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MockProviders>
        <WorkoutStatsOverlay stats={mockStats} visible={true} />
      </MockProviders>
    );
    
    const minimizeButton = screen.getByLabelText(/minimize workout stats/i);
    await user.click(minimizeButton);
    
    // After minimizing, "Workout Progress" should not be visible
    expect(screen.queryByText(/workout progress/i)).not.toBeInTheDocument();
    
    // Restore button should be visible
    const restoreButton = screen.getByLabelText(/show workout stats/i);
    expect(restoreButton).toBeInTheDocument();
  });

  it('should restore overlay when restore button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MockProviders>
        <WorkoutStatsOverlay stats={mockStats} visible={true} />
      </MockProviders>
    );
    
    // First minimize the overlay
    const minimizeButton = screen.getByLabelText(/minimize workout stats/i);
    await user.click(minimizeButton);
    
    // Then restore it
    const restoreButton = screen.getByLabelText(/show workout stats/i);
    await user.click(restoreButton);
    
    // After restoring, "Workout Progress" should be visible again
    expect(screen.getByText(/workout progress/i)).toBeInTheDocument();
    
    // Minimize button should be visible again
    expect(screen.getByLabelText(/minimize workout stats/i)).toBeInTheDocument();
  });

  it('should not show overlay controls when visible is false', () => {
    render(
      <MockProviders>
        <WorkoutStatsOverlay stats={mockStats} visible={false} />
      </MockProviders>
    );
    
    // Neither minimize nor restore button should be visible
    expect(screen.queryByLabelText(/minimize workout stats/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/show workout stats/i)).not.toBeInTheDocument();
  });
});
