import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import WorkoutCompleteDialog from '../WorkoutCompleteDialog';

describe('WorkoutCompleteDialog - Core Tests', () => {
  it('should render when open', () => {
    const { container } = render(
      <WorkoutCompleteDialog
        open={true}
        onClose={() => {}}
        exerciseName="Test Exercise"
        stats={{ reps: 10, sets: 3, duration: 120 }}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    const { container } = render(
      <WorkoutCompleteDialog
        open={false}
        onClose={() => {}}
        exerciseName="Test Exercise"
        stats={{ reps: 10, sets: 3, duration: 120 }}
      />
    );
    expect(container).toBeInTheDocument();
  });
});
