# Text-to-Speech Hook

A custom React hook that provides text-to-speech functionality throughout the application.

## Features

- ✅ Respects the `soundEnabled` setting from SettingsContext
- ✅ Browser compatibility checking
- ✅ Customizable voice options (rate, pitch, volume, language)
- ✅ Automatic cleanup on unmount
- ✅ Cancellation support

## Installation

The hook is already available in `src/hooks/useTextToSpeech.ts`

## Basic Usage

```typescript
import { useTextToSpeech } from '../hooks/useTextToSpeech';

function MyComponent() {
  const { speak, cancel, isSpeaking, isSupported } = useTextToSpeech();

  const handleClick = () => {
    speak("Hello, this is a test message!");
  };

  return (
    <div>
      <button onClick={handleClick} disabled={!isSupported}>
        Speak
      </button>
      {isSpeaking && <p>Speaking...</p>}
    </div>
  );
}
```

## Advanced Usage

### Custom Voice Options

```typescript
const { speak } = useTextToSpeech();

// Speak faster
speak("This will be faster", { rate: 1.5 });

// Higher pitch
speak("Higher pitch voice", { pitch: 1.5 });

// Lower volume
speak("Quieter message", { volume: 0.5 });

// Different language
speak("Bonjour le monde", { lang: 'fr-FR' });

// Combine multiple options
speak("Custom voice", {
  rate: 1.2,
  pitch: 1.1,
  volume: 0.8,
  lang: 'en-GB'
});
```

### Cancel Speech

```typescript
const { speak, cancel } = useTextToSpeech();

// Start speaking
speak("This is a long message that can be cancelled");

// Cancel it
setTimeout(() => {
  cancel();
}, 1000);
```

## Real-World Examples

### Workout Feedback

```typescript
function WorkoutComponent() {
  const { speak } = useTextToSpeech();
  const { handleRepComplete } = useWorkout();

  const onRepComplete = (quality: string) => {
    handleRepComplete({ quality });
    
    // Provide audio feedback
    if (quality === 'good') {
      speak("Good rep!");
    } else if (quality === 'perfect') {
      speak("Perfect form!");
    }
  };

  return <button onClick={() => onRepComplete('good')}>Complete Rep</button>;
}
```

### Set Completion Announcements

```typescript
function SetTracker() {
  const { speak } = useTextToSpeech();
  const { stats } = useWorkout();

  useEffect(() => {
    if (stats.sets > 0) {
      speak(`Set ${stats.sets} complete. Take a rest.`);
    }
  }, [stats.sets]);

  return <div>Sets: {stats.sets}</div>;
}
```

### Exercise Instructions

```typescript
function ExerciseGuide() {
  const { speak } = useTextToSpeech();

  const announceExercise = (name: string) => {
    speak(`Starting exercise: ${name}. Get ready!`, { rate: 0.9 });
  };

  return (
    <button onClick={() => announceExercise('Push-ups')}>
      Start Exercise
    </button>
  );
}
```

### Rest Timer with Audio

```typescript
function RestTimer() {
  const { speak } = useTextToSpeech();
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (timeLeft === 10) {
      speak("10 seconds remaining");
    } else if (timeLeft === 0) {
      speak("Rest complete. Get ready for the next set!");
    }
  }, [timeLeft]);

  return <div>Rest: {timeLeft}s</div>;
}
```

### Form Correction Feedback

```typescript
function FormChecker() {
  const { speak } = useTextToSpeech();

  const provideFeedback = (issue: string) => {
    switch(issue) {
      case 'low_depth':
        speak("Go deeper on your squat", { rate: 0.9 });
        break;
      case 'poor_alignment':
        speak("Keep your back straight", { rate: 0.9 });
        break;
      case 'too_fast':
        speak("Slow down your movement", { rate: 0.8 });
        break;
    }
  };

  return <button onClick={() => provideFeedback('low_depth')}>Check Form</button>;
}
```

## API Reference

### `useTextToSpeech()`

Returns an object with the following properties:

#### `speak(text: string, options?: UseTextToSpeechOptions): void`

Converts text to speech.

**Parameters:**
- `text` (string, required): The text to speak
- `options` (object, optional):
  - `rate` (number, 0.1-10): Speech rate (default: 1)
  - `pitch` (number, 0-2): Speech pitch (default: 1)
  - `volume` (number, 0-1): Speech volume (default: 1)
  - `lang` (string): Language code (default: 'en-US')

#### `cancel(): void`

Cancels any ongoing speech.

#### `isSpeaking: boolean`

Indicates whether speech is currently active.

#### `isSupported: boolean`

Indicates whether the browser supports speech synthesis.

## Settings Integration

The hook automatically respects the `soundEnabled` setting from the SettingsContext. When sound is disabled in settings, the `speak` function will not produce any audio.

To enable/disable sound:

```typescript
import { useSettings } from '../context/SettingsContext';

function SoundToggle() {
  const { settings, updateSetting } = useSettings();

  return (
    <button onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}>
      Sound: {settings.soundEnabled ? 'On' : 'Off'}
    </button>
  );
}
```

## Browser Support

The Speech Synthesis API is supported in most modern browsers:
- ✅ Chrome/Edge 33+
- ✅ Firefox 49+
- ✅ Safari 7+
- ❌ Internet Explorer

Always check `isSupported` before relying on TTS functionality.

## Notes

- The hook automatically cancels any ongoing speech when the component unmounts
- Multiple calls to `speak()` will automatically cancel previous speech
- Empty or whitespace-only text will not be spoken
- Console logs are included for debugging (can be removed in production)
