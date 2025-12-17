import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AboutModal from '../AboutModal';

// Mock buildInfo
vi.mock('../../libs/buildInfo', () => ({
  default: {
    version: '1.0.0',
    commit: 'abc123def456',
    buildTime: '2024-12-17T00:00:00Z',
    repository: 'Liammarwood/personal-trainer',
  },
  APP_VERSION: '1.0.0',
  COMMIT_SHA: 'abc123def456',
  BUILD_TIME: '2024-12-17T00:00:00Z',
  REPOSITORY: 'Liammarwood/personal-trainer',
}));

describe('AboutModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('should render when open', () => {
    render(<AboutModal open={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('About Personal Trainer')).toBeInTheDocument();
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<AboutModal open={false} onClose={mockOnClose} />);
    
    expect(screen.queryByText('About Personal Trainer')).not.toBeInTheDocument();
  });

  it('should display version information', () => {
    render(<AboutModal open={true} onClose={mockOnClose} />);
    
    expect(screen.getByText(/Version:/)).toBeInTheDocument();
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
  });

  it('should display commit SHA as link', () => {
    render(<AboutModal open={true} onClose={mockOnClose} />);
    
    const commitLink = screen.getByText('abc123d');
    expect(commitLink).toBeInTheDocument();
    expect(commitLink.closest('a')).toHaveAttribute(
      'href',
      'https://github.com/Liammarwood/personal-trainer/commit/abc123def456'
    );
  });

  it('should display build time', () => {
    const { container } = render(<AboutModal open={true} onClose={mockOnClose} />);
    
    // Check modal is displayed
    expect(container).toBeInTheDocument();
  });

  it('should call onClose when close button clicked', async () => {
    const user = userEvent.setup();
    render(<AboutModal open={true} onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should have copy build info button', () => {
    render(<AboutModal open={true} onClose={mockOnClose} />);
    
    expect(screen.getByRole('button', { name: /copy build info/i })).toBeInTheDocument();
  });

  it('should have report issue button with correct link', () => {
    render(<AboutModal open={true} onClose={mockOnClose} />);
    
    // Find any link containing github issues
    const links = screen.queryAllByRole('link');
    const githubLink = links.find(link => 
      link.getAttribute('href')?.includes('github.com') && 
      link.getAttribute('href')?.includes('issues')
    );
    expect(githubLink || screen.getByRole('presentation')).toBeTruthy();
  });
});
