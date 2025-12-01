import { useState, useEffect } from 'react';
import { Box, Button, Snackbar, Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import IosShareIcon from '@mui/icons-material/IosShare';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    // Check if running as PWA
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as { standalone?: boolean }).standalone 
      || document.referrer.includes('android-app://');
    
    setIsStandalone(isInStandaloneMode);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as { MSStream?: unknown }).MSStream;
    setIsIOS(iOS);

    // Handle install prompt (Chrome/Edge/Android)
    const handleBeforeInstallPrompt = (e: Event): void => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      // Don't show if already installed or dismissed in last 7 days
      const dismissedAt = localStorage.getItem('pwa-install-dismissed');
      if (dismissedAt) {
        const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed < 7) return;
      }
      
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show iOS prompt if conditions met
    if (iOS && !isInStandaloneMode) {
      const dismissedAt = localStorage.getItem('pwa-install-dismissed-ios');
      if (!dismissedAt || (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24) >= 7) {
        // Show iOS prompt after 3 seconds
        setTimeout(() => setShowPrompt(true), 3000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async (): Promise<void> => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleClose = (): void => {
    setShowPrompt(false);
    localStorage.setItem(
      isIOS ? 'pwa-install-dismissed-ios' : 'pwa-install-dismissed',
      Date.now().toString()
    );
  };

  // Don't show if already installed
  if (isStandalone) return null;

  // iOS installation instructions
  if (isIOS && showPrompt) {
    return (
      <Snackbar
        open={showPrompt}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 70, sm: 24 } }}
      >
        <Alert
          severity="info"
          icon={<IosShareIcon />}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
          sx={{
            width: { xs: '90vw', sm: 'auto' },
            fontSize: { xs: '0.85rem', sm: '0.875rem' }
          }}
        >
          Install this app: Tap <IosShareIcon sx={{ fontSize: '1rem', verticalAlign: 'middle', mx: 0.5 }} /> then "Add to Home Screen"
        </Alert>
      </Snackbar>
    );
  }

  // Chrome/Edge/Android installation
  if (deferredPrompt && showPrompt) {
    return (
      <Snackbar
        open={showPrompt}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 70, sm: 24 } }}
      >
        <Alert
          severity="success"
          icon={<InstallMobileIcon />}
          action={
            <>
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleInstallClick}
                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                Install
              </Button>
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleClose}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </>
          }
          sx={{
            width: { xs: '90vw', sm: 'auto' },
            fontSize: { xs: '0.85rem', sm: '0.875rem' }
          }}
        >
          Install Personal Trainer app for quick access!
        </Alert>
      </Snackbar>
    );
  }

  return null;
};

export default InstallPrompt;
