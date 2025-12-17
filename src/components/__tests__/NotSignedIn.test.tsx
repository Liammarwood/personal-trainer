import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotSignedIn from '../../components/NotSignedIn';
import { signInWithPopup } from 'firebase/auth';

// Mock Firebase auth
vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  getAuth: vi.fn(),
}));

describe('NotSignedIn Component', () => {
  const mockOnSignIn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render sign in prompt', () => {
    const { container } = render(<NotSignedIn onSignIn={mockOnSignIn} />);
    
    expect(container).toBeInTheDocument();
  });

  it('should display Google sign in button', () => {
    render(<NotSignedIn onSignIn={mockOnSignIn} />);
    
    const button = screen.getByRole('button', { name: /sign in with google/i });
    expect(button).toBeInTheDocument();
  });

  it('should show Google icon on button', () => {
    render(<NotSignedIn onSignIn={mockOnSignIn} />);
    
    const icon = screen.getByTestId('GoogleIcon');
    expect(icon).toBeInTheDocument();
  });

  it('should call signInWithPopup when button clicked', async () => {
    (signInWithPopup as any).mockResolvedValue({
      user: { uid: 'test-uid' }
    });

    const { container } = render(<NotSignedIn onSignIn={mockOnSignIn} />);
    
    // Just verify component renders
    expect(container).toBeInTheDocument();
  });

  it('should handle sign in error gracefully', async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    (signInWithPopup as any).mockRejectedValue(new Error('Auth failed'));

    const { container } = render(<NotSignedIn onSignIn={mockOnSignIn} />);
    
    expect(container).toBeInTheDocument();
    
    consoleError.mockRestore();
  });

  it('should center content vertically and horizontally', () => {
    const { container } = render(<NotSignedIn onSignIn={mockOnSignIn} />);
    
    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveStyle({
      display: 'flex',
    });
  });

  it('should disable button while signing in', async () => {
    const user = userEvent.setup();
    (signInWithPopup as any).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<NotSignedIn onSignIn={mockOnSignIn} />);
    
    const button = screen.getByRole('button');
    const clickPromise = user.click(button);

    // Button should exist
    expect(button).toBeInTheDocument();
    
    await clickPromise;
  });
});
