# 📹 FitBod Video Upload Feature

## Overview

The web interface now supports uploading FitBod workout plan videos (MP4) for automatic exercise detection and tracking.

## How It Works

### 1. Upload MP4 Video
- Click "📹 Upload FitBod Workout Video (MP4)"
- Select your FitBod workout plan video
- Click "📤 Upload & Scan Video"

### 2. Automatic Exercise Detection
The system will:
- Extract text from video frames using OCR
- Parse exercise names, sets, reps, and weights
- Map detected exercises to available tracking exercises
- Display results with clear "Trackable" vs "Untackable" badges

### 3. Review Detected Exercises
You'll see a list showing:
- **Exercise Name** - As detected from video
- **Status Badge** - ✓ TRACKABLE or ✗ UNTACKABLE
- **Workout Details** - Sets, Reps, Weight (kg)
- **Start Button** - For trackable exercises only

### 4. Start Tracking
- Click "▶️ Start Tracking This Exercise" on any trackable exercise
- Camera activates automatically
- Expected workout plan (sets/reps/weight) displays in stats panel
- Perform the exercise and track your reps in real-time

## Exercise Mapping

### Supported Exercise Names
The system recognizes many variations:
- **Squat** - "Squats", "Barbell Squats"
- **Shoulder Press** - "Shoulder Presses", "Overhead Press", "Military Press"
- **Deadlift** - "Deadlifts"
- **Romanian Deadlift** - "Romanian Deadlifts", "RDL"
- **Calf Raise** - "Calf Raises", "Standing Calf Raise"
- **Barbell Row** - "Barbell Rows", "Bent Over Row"
- **Bicep Curl** - "Bicep Curls", "Dumbbell Curl"
- **Bench Press** - "Bench Presses", "Barbell Bench Press"
- **Front Raise** - "Front Raises", "Dumbbell Front Raise"
- **Dumbbell Fly** - "Dumbbell Flys", "Dumbbell Flyes", "Chest Fly", "Pec Fly"

### Untackable Exercises
If an exercise is marked as "✗ UNTACKABLE", it means:
- The exercise name doesn't match any supported tracking exercise
- The system can still display the workout plan details
- You can manually select a similar exercise from the dropdown

## Upload Results Display

### Summary Section
```
Found 5 exercises
✓ 4 Trackable | ✗ 1 Untackable
```

### Exercise Cards
Each detected exercise shows:
- **Name** with position number (1, 2, 3...)
- **Status Badge** - Color-coded (green = trackable, red = untackable)
- **Workout Details** - Sets, Reps, Weight
- **Action Button** - "Start Tracking" for trackable exercises
- **Warning Note** - For untackable exercises

## Expected Workout Plan

When you start tracking from an uploaded exercise, the stats panel will show:

**📋 Workout Plan**
- Sets: 3
- Reps: 12
- Weight: 20 kg

This helps you:
- Know your target before starting
- Compare actual performance vs expected
- Track progress across sets

## API Endpoints

### POST `/upload_video`
Upload and scan MP4 video file.

**Request:**
- `multipart/form-data`
- `file`: MP4 file

**Response:**
```json
{
  "success": true,
  "message": "File processed",
  "source": "uploads/workout.mp4",
  "total_exercises": 5,
  "suggestions": [
    {
      "name": "Squat",
      "matched": true,
      "exercise_id": "squat",
      "sets": 3,
      "reps": 12,
      "weight_kg": 60
    },
    {
      "name": "Bulgarian Split Squat",
      "matched": false,
      "exercise_id": null,
      "sets": 3,
      "reps": 10,
      "weight_kg": null
    }
  ]
}
```

### POST `/start_exercise`
Start tracking with optional workout plan.

**Request:**
```json
{
  "exercise": "squat",
  "sets": 3,
  "reps_per_set": 12,
  "target_weight": 60,
  "rest_seconds": 90
}
```

**Response:**
```json
{
  "success": true,
  "message": "Started squat tracking",
  "exercise": "squat"
}
```

## File Storage

- Uploaded videos are saved to: `uploads/`
- Original filename is preserved
- Files are kept for future reference/debugging
- Manual cleanup: delete files from `uploads/` directory

## Tips

### Best Results
- Use high-quality MP4 videos
- Ensure exercise names are clearly visible
- FitBod app screenshots work best
- Screen recordings of workout plans are ideal

### Troubleshooting
- **No exercises detected**: Video may be too blurry or text not visible
- **Wrong exercise mapping**: Manually select correct exercise from dropdown
- **Upload fails**: Check file is valid MP4 format
- **Slow processing**: Large videos take longer to scan

## Example Workflow

1. **Record FitBod Workout Plan**
   - Open FitBod app
   - Navigate to today's workout
   - Screen record scrolling through exercises
   - Save as MP4

2. **Upload to Personal Trainer**
   - Open web interface (`http://localhost:5000`)
   - Click upload button
   - Select your MP4 file
   - Wait for scan to complete

3. **Review Exercises**
   - See list of detected exercises
   - Note which are trackable
   - Check sets/reps/weight match your plan

4. **Start First Exercise**
   - Click "Start Tracking" on first trackable exercise
   - Position yourself in camera view
   - Perform your sets
   - Watch real-time rep counting

5. **Continue Workout**
   - After completing sets, click "Stop"
   - Scroll to next exercise in results
   - Click "Start Tracking" on next exercise
   - Repeat until workout complete

## Future Enhancements

Potential improvements:
- Auto-queue exercises (start next automatically)
- Set-by-set tracking (not just total reps)
- Rest timer between sets
- Workout summary/report at end
- Exercise history and progress tracking
- Export workout data to JSON/CSV
