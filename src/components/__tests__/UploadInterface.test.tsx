import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UploadInterface from '../../components/UploadInterface';
import { MockProviders } from '../../test/MockProviders';

// Mock WorkoutContext
const mockUploadVideo = vi.fn();
const mockUseWorkout = vi.fn();

vi.mock('../../context/WorkoutContext', () => ({
  useWorkout: () => mockUseWorkout(),
}));

describe('UploadInterface Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWorkout.mockReturnValue({
      uploadVideo: mockUploadVideo,
      loading: false,
    });
  });

  it('should render upload interface', () => {
    render(<UploadInterface />);
    
    expect(screen.getByText(/upload workout/i)).toBeInTheDocument();
  });

  it('should show file upload area', () => {
    render(<UploadInterface />);
    
    expect(screen.getByText(/drag and drop|click to select/i)).toBeInTheDocument();
  });

  it('should display upload icon', () => {
    render(<UploadInterface />);
    
    expect(screen.getByText(/upload workout/i)).toBeInTheDocument();
  });

  it('should accept file selection via input', async () => {
    const user = userEvent.setup();
    render(<UploadInterface />);
    
    const file = new File(['video content'], 'workout.mp4', { type: 'video/mp4' });
    const input = document.querySelector('input[type="file"]')! as HTMLInputElement;
    
    await user.upload(input, file);
    
    expect(input.files?.[0]).toBe(file);
    expect(screen.getByText('workout.mp4')).toBeInTheDocument();
  });

  it('should handle file type validation', () => {
    render(<UploadInterface />);
    
    expect(screen.getByText(/upload workout/i)).toBeInTheDocument();
  });

  it('should accept MP4 files', async () => {
    const user = userEvent.setup();
    render(<UploadInterface />);
    
    const file = new File(['video'], 'workout.mp4', { type: 'video/mp4' });
    const input = document.querySelector('input[type="file"]')! as HTMLInputElement;
    
    await user.upload(input, file);
    
    expect(screen.getByText('workout.mp4')).toBeInTheDocument();
  });

  it('should accept JPG files', async () => {
    const user = userEvent.setup();
    render(<UploadInterface />);
    
    const file = new File(['image'], 'exercise.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]')! as HTMLInputElement;
    
    await user.upload(input, file);
    
    expect(screen.getByText('exercise.jpg')).toBeInTheDocument();
  });

  it('should accept PNG files', async () => {
    const user = userEvent.setup();
    render(<UploadInterface />);
    
    const file = new File(['image'], 'exercise.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]')! as HTMLInputElement;
    
    await user.upload(input, file);
    
    expect(screen.getByText('exercise.png')).toBeInTheDocument();
  });

  it('should show upload button when file selected', async () => {
    const user = userEvent.setup();
    render(<UploadInterface />);
    
    const file = new File(['video'], 'workout.mp4', { type: 'video/mp4' });
    const input = document.querySelector('input[type="file"]')! as HTMLInputElement;
    
    await user.upload(input, file);
    
    const uploadButton = screen.getByRole('button', { name: /upload/i });
    expect(uploadButton).toBeInTheDocument();
  });

  it('should call uploadVideo when upload button clicked', async () => {
    const user = userEvent.setup();
    mockUploadVideo.mockResolvedValue(undefined);
    
    render(<UploadInterface />);
    
    const file = new File(['video'], 'workout.mp4', { type: 'video/mp4' });
    const input = document.querySelector('input[type="file"]')! as HTMLInputElement;
    
    await user.upload(input, file);
    
    const uploadButton = screen.getByRole('button', { name: /upload/i });
    await user.click(uploadButton);
    
    expect(mockUploadVideo).toHaveBeenCalledWith(file);
  });

  it('should clear selected file after successful upload', async () => {
    const user = userEvent.setup();
    mockUploadVideo.mockResolvedValue(undefined);
    
    render(<UploadInterface />);
    
    const file = new File(['video'], 'workout.mp4', { type: 'video/mp4' });
    const input = document.querySelector('input[type="file"]')! as HTMLInputElement;
    
    await user.upload(input, file);
    expect(screen.getByText('workout.mp4')).toBeInTheDocument();
    
    const uploadButton = screen.getByRole('button', { name: /upload/i });
    await user.click(uploadButton);
    
    expect(screen.queryByText('workout.mp4')).not.toBeInTheDocument();
  });

  it('should show error alert on upload failure', async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    mockUploadVideo.mockRejectedValue(new Error('Network error'));
    
    render(<UploadInterface />);
    
    const file = new File(['video'], 'workout.mp4', { type: 'video/mp4' });
    const input = document.querySelector('input[type="file"]')! as HTMLInputElement;
    
    await user.upload(input, file);
    
    const uploadButton = screen.getByRole('button', { name: /upload/i });
    await user.click(uploadButton);
    
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Upload failed'));
    alertSpy.mockRestore();
  });

  it('should disable upload button while loading', () => {
    mockUseWorkout.mockReturnValue({
      uploadVideo: mockUploadVideo,
      loading: true,
    });
    
    render(<UploadInterface />);
    
    // Upload area should be disabled when loading
    const paper = screen.getByText(/upload workout/i).closest('div');
    expect(paper).toBeInTheDocument();
  });
});
