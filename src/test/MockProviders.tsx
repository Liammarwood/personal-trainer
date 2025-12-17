import { ReactNode } from 'react';
import { SettingsProvider } from '../context/SettingsContext';
import { WorkoutProvider } from '../context/WorkoutContext';

interface MockProvidersProps {
  children: ReactNode;
}

/**
 * Wraps components with all necessary providers for testing
 */
export const MockProviders: React.FC<MockProvidersProps> = ({ children }) => {
  return (
    <SettingsProvider>
      <WorkoutProvider>
        {children}
      </WorkoutProvider>
    </SettingsProvider>
  );
};

export default MockProviders;
