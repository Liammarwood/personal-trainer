import { useState, ChangeEvent, DragEvent } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import {
  Paper,
  Typography,
  Button,
  Box,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

const UploadInterface: React.FC = () => {
  const { uploadVideo, loading } = useWorkout();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const isValidFileType = (file: File): boolean => {
    const validTypes = ['video/mp4', 'image/jpeg', 'image/png', 'image/jpg'];
    return validTypes.includes(file.type);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file && isValidFileType(file)) {
      setSelectedFile(file);
    } else {
      alert('Please select an MP4, JPG, or PNG file');
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (isValidFileType(file)) {
        setSelectedFile(file);
      } else {
        alert('Please select an MP4, JPG, or PNG file');
      }
    }
  };

  const handleUpload = async (): Promise<void> => {
    if (!selectedFile) return;
    
    try {
      await uploadVideo(selectedFile);
      setSelectedFile(null);
    } catch (error) {
      if (error instanceof Error) {
        alert('Upload failed: ' + error.message);
      } else {
        alert('Upload failed');
      }
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        Upload Workout
      </Typography>
      
      <Box
        sx={{
          border: dragActive ? '2px dashed #667eea' : '2px dashed #ccc',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          backgroundColor: dragActive ? 'action.hover' : 'background.default',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          mb: 2,
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover',
          },
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('video-upload')?.click()}
      >
        <input
          type="file"
          id="video-upload"
          accept="video/mp4,image/jpeg,image/png,image/jpg"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        {selectedFile ? (
          <Box>
            <InsertDriveFileIcon sx={{ fontSize: 60, color: 'primary.main', mb: 1 }} />
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {selectedFile.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </Typography>
          </Box>
        ) : (
          <Box>
            <CloudUploadIcon sx={{ fontSize: 60, color: 'action.disabled', mb: 1 }} />
            <Typography variant="body1" gutterBottom>
              Click to browse or drag and drop
            </Typography>
            <Typography variant="caption" color="text.secondary">
              MP4, JPG, or PNG files
            </Typography>
          </Box>
        )}
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        disabled={!selectedFile || loading}
        startIcon={<CloudUploadIcon />}
        fullWidth
        size="large"
      >
        {loading ? 'Uploading...' : 'Upload & Analyze'}
      </Button>
    </Paper>
  );
};

export default UploadInterface;
