import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loading } from '../Loading';

describe('Loading Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading container', () => {
    render(<Loading />);
    
    const container = screen.getByRole('status');
    expect(container).toBeInTheDocument();
  });

  it('should display circular progress indicator', () => {
    render(<Loading />);
    
    const progress = screen.getByRole('progressbar');
    expect(progress).toBeInTheDocument();
  });

  it('should show loading text with custom message', () => {
    render(<Loading message="Loading data" />);
    
    const text = screen.getByText(/loading data/i);
    expect(text).toBeInTheDocument();
  });

  it('should have proper styling classes', () => {
    const { container } = render(<Loading />);
    
    const loadingDiv = container.firstChild;
    expect(loadingDiv).toHaveStyle({
      display: 'flex',
    });
  });
});
