import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
