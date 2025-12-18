import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Link, Stack } from '@mui/material';
import buildInfo, { COMMIT_SHA, BUILD_TIME, APP_VERSION, REPOSITORY } from '../libs/buildInfo';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AboutModal({ open, onClose }: Props) {
  const commitShort = COMMIT_SHA ? COMMIT_SHA.substring(0, 7) : '';
  const repoBase = REPOSITORY ? `https://github.com/${REPOSITORY}` : '';

  const infoText = `Version: ${APP_VERSION || buildInfo.version || 'unknown'}\nCommit: ${COMMIT_SHA || 'unknown'}\nBuild time: ${BUILD_TIME || 'unknown'}`;

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(infoText);
        alert('Build info copied to clipboard');
      } else {
        // fallback: open prompt so user can copy manually
        window.prompt('Copy build info', infoText);
      }
    } catch (err) {
      console.error('Failed to copy build info', err);
      alert('Failed to copy build info');
    }
  };

  const buildIssueUrl = () => {
    const title = encodeURIComponent('Bug: [short description]');
    const body = encodeURIComponent(`
<!-- Please describe the issue and steps to reproduce -->

--
**Build info**
${infoText}
`);
    if (!repoBase) return '#';
    return `${repoBase}/issues/new?title=${title}&body=${body}`;
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="about-dialog-title">
      <DialogTitle id="about-dialog-title">About Personal Trainer</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" gutterBottom>
          Version: <strong>{APP_VERSION || buildInfo.version || 'unknown'}</strong>
        </Typography>
        <Typography variant="body2" gutterBottom>
          Commit: {commitShort ? (
            <Link href={`${repoBase}/commit/${COMMIT_SHA}`} target="_blank" rel="noopener noreferrer">
              {commitShort}
            </Link>
          ) : 'unknown'}
        </Typography>
        <Typography variant="body2" gutterBottom>
          Build time: {BUILD_TIME || 'unknown'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Workout tracking using MediaPipe for real-time pose detection and form analysis. For debugging provide the version and commit when filing issues.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button onClick={handleCopy} variant="outlined" size="small">Copy build info</Button>
          <Button component={Link} href={buildIssueUrl()} target="_blank" rel="noopener noreferrer" variant="contained" size="small">Report issue</Button>
          <Button onClick={onClose}>Close</Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
