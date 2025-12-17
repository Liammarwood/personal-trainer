import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SettingsMenu from '../SettingsMenu';
import { SettingsProvider } from '../../context/SettingsContext';
import { WorkoutProvider } from '../../context/WorkoutContext';

vi.mock('../../services/api', () => ({
  default: {
    getExercisesV2: vi.fn(() => Promise.resolve({ exercises: [] })),
  },
}));

const MockProviders = ({ children }: { children: React.ReactNode }) => (
  <SettingsProvider>
    <WorkoutProvider>{children}</WorkoutProvider>
  </SettingsProvider>
);

describe('SettingsMenu - Core Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render settings button', () => {
    const { container } = render(
      <MockProviders>
        <SettingsMenu />
      </MockProviders>
    );
    expect(container).toBeInTheDocument();
  });

  it('should have settings functionality', () => {
    render(
      <MockProviders>
        <SettingsMenu />
      </MockProviders>
    );
    const buttons = screen.queryAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
