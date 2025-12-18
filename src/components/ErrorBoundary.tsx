import { Component, ReactNode, ErrorInfo } from 'react';
import { Paper, Box, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, maxWidth: 500 }}>
            <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {this.props.fallbackMessage || 'An unexpected error occurred. Please try again.'}
            </Typography>
            {this.state.error && (
              <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace', maxWidth: '100%', overflow: 'auto' }}>
                {this.state.error.message}
              </Typography>
            )}
            <Button variant="contained" onClick={this.handleReset} sx={{ mt: 2 }}>
              Try Again
            </Button>
          </Box>
        </Paper>
      );
    }

    return this.props.children;
  }
}
