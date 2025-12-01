import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import './UploadInterface.css';

const UploadInterface = () => {
  const { uploadVideo, loading } = useWorkout();
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const isValidFileType = (file) => {
    const validTypes = ['video/mp4', 'image/jpeg', 'image/png', 'image/jpg'];
    return validTypes.includes(file.type);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && isValidFileType(file)) {
      setSelectedFile(file);
    } else {
      alert('Please select an MP4, JPG, or PNG file');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
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

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      await uploadVideo(selectedFile);
      setSelectedFile(null);
    } catch (error) {
      alert('Upload failed: ' + error.message);
    }
  };

  return (
    <div className="upload-interface">
      <h2>Upload FitBod Workout</h2>
      
      <div 
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="video-upload"
          accept="video/mp4,image/jpeg,image/png,image/jpg"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        <label htmlFor="video-upload" className="upload-label">
          {selectedFile ? (
            <>
              <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p className="file-name">{selectedFile.name}</p>
              <p className="file-size">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            </>
          ) : (
            <>
              <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p>Click to browse or drag and drop</p>
              <p className="file-hint">MP4, JPG, or PNG files</p>
            </>
          )}
        </label>
      </div>

      <button
        onClick={handleUpload}
        disabled={!selectedFile || loading}
        className="btn btn-upload"
      >
        {loading ? 'Uploading...' : 'Upload & Analyze'}
      </button>
    </div>
  );
};

export default UploadInterface;
