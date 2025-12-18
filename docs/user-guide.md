---
layout: default
title: User Guide
nav_order: 3
---

# User Guide

Complete guide to using all features of Personal Trainer.

## Table of Contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Understanding the Interface

### Main Dashboard

When you sign in, you'll see the main dashboard with several key sections:

#### Top Navigation Bar
- **Profile Icon**: Access account settings and sign out
- **Settings Icon**: Configure application preferences
- **About Icon**: View version and app information

#### Input Mode Selector
- Switch between Webcam and Video File modes
- Shows current active mode
- Disabled during active tracking

#### Video Feed Area
- Large central area displaying your camera or video
- Shows pose detection overlay when tracking
- Displays "Camera off" placeholder when inactive

#### Workout Plan Panel
- Lists all exercises in your current plan
- Shows progress (checkmarks for completed exercises)
- Click exercises to select and start tracking

#### Stats Overlay
- Real-time workout statistics
- Exercise name, reps, sets, duration
- Can be toggled on/off in settings

---

## Input Modes Explained

### Webcam Mode

**Best for:** Live workouts, real-time tracking

**How it works:**
1. Your webcam captures you performing exercises
2. AI analyzes your movements frame-by-frame
3. Reps are counted automatically based on movement patterns
4. You receive immediate audio and visual feedback

**Tips:**
- Position camera 6-10 feet away
- Keep full body in frame
- Use landscape orientation
- Ensure good lighting (natural light is best)
- Avoid busy backgrounds

**Limitations:**
- Requires stable internet connection
- Camera must remain stationary
- May struggle with very fast movements

### Video File Mode

**Best for:** Analyzing recorded workouts, offline processing

**How it works:**
1. Upload a video file of your workout
2. The system processes the entire video
3. Results are analyzed and displayed
4. You can review frame-by-frame if needed

**Supported formats:** MP4, MOV, AVI

**Tips:**
- Use high-quality video (720p or higher)
- Maintain consistent camera angle
- Ensure full body is visible throughout
- Keep file size under 100MB for faster processing

---

## Workout Plan Management

### Creating a Workout Plan

#### Method 1: Image Upload

1. Take a photo of your workout plan or find an image online
2. Click **"Upload Workout"**
3. Select your image file
4. Wait for AI to scan and extract exercises
5. Review the detected exercises:
   - Exercise names
   - Sets and reps
   - Rest periods
6. Edit any incorrect details
7. Click **"Confirm"** to save

**Best image practices:**
- High contrast text
- Clear, legible font
- Good lighting, no glare
- Straight angle (not skewed)

#### Method 2: Manual Creation

1. Click **"Workout Plan"** panel
2. Click **"Add Exercise"** button
3. Fill in exercise details:
   - Exercise name
   - Number of sets
   - Reps per set
   - Rest time between sets (optional)
   - Weight used (optional)
4. Click **"Save"**
5. Repeat for additional exercises

#### Method 3: Exercise Library

1. Open **Workout Plan** panel
2. Click **"Choose from Library"**
3. Browse available exercises by category:
   - Upper Body
   - Lower Body
   - Core
   - Cardio
   - Stretching
4. Click an exercise to add it
5. Set your target sets and reps
6. Click **"Add to Plan"**

### Editing Exercises

- Click the **Edit** icon (✏️) next to any exercise
- Modify sets, reps, rest time, or weight
- Click **"Save"** to update

### Removing Exercises

- Click the **Delete** icon (🗑️) next to the exercise
- Confirm deletion in the popup
- Exercise is removed from your plan

### Reordering Exercises

- Click and hold the **Drag Handle** (≡) next to an exercise
- Drag to new position
- Release to save new order

---

## Exercise Tracking

### Starting an Exercise

1. Select an exercise from your workout plan
2. Click **"Start Tracking"**
3. Position yourself in frame (for webcam mode)
4. Begin performing the exercise
5. The system automatically:
   - Counts your reps
   - Tracks your sets
   - Monitors your form
   - Times your workout

### During Exercise

**What you'll see:**
- **Skeleton Overlay**: Green lines showing detected body pose
- **Rep Counter**: Current rep number for this set
- **Set Progress**: "Set 2 of 3" indicator
- **Timer**: Duration of current exercise
- **Form Indicators**: Green/yellow/red indicators for form quality

**What you'll hear (if audio enabled):**
- Rep number after each completion ("1", "2", "3"...)
- Set completion ("Set 1 complete. Take a rest.")
- Encouragement ("Good rep!", "Perfect form!")
- Final celebration ("Well done! Workout complete!")

### Rep Detection

The AI detects reps by analyzing:
- **Range of Motion**: Full extension and contraction
- **Body Position**: Proper starting and ending positions
- **Movement Pattern**: Consistent exercise-specific motion
- **Joint Angles**: Key angles for each exercise type

**Common exercises supported:**
- Push-ups
- Squats
- Lunges
- Bicep curls
- Shoulder press
- Deadlifts
- Sit-ups
- And many more...

### Rest Periods

Between sets:
1. System automatically detects set completion
2. Rest timer begins (default 60 seconds)
3. Visual countdown displayed
4. Audio announcement at 10 seconds remaining
5. "Rest complete" notification when time is up
6. Continue when ready (no forced start)

**Customizing rest time:**
- Edit exercise settings
- Set custom rest duration (15-300 seconds)
- Or skip rest periods entirely

### Form Analysis

Real-time form feedback includes:
- **Joint Angles**: Hip, knee, elbow angles displayed
- **Depth Indicators**: For squats, lunges
- **Alignment Checks**: Back straightness, knee tracking
- **Tempo Feedback**: Movement speed indicators

**Form quality levels:**
- 🟢 **Perfect**: Ideal form, full range of motion
- 🟡 **Good**: Acceptable form, minor issues
- 🔴 **Poor**: Form correction needed

---

## Settings & Customization

### Display Settings

**Show Stats Overlay**
- Toggle on/off: Show or hide real-time statistics
- Includes: reps, sets, duration, exercise name
- Useful to minimize distractions during workout

**Show Rep Quality**
- Display form quality indicators
- Shows color-coded feedback on each rep
- Helps maintain proper form

**Advanced Mode**
- Enable detailed metrics and joint angle displays
- Show raw pose detection data
- For experienced users and debugging

### Audio Settings

**Sound Enabled**
- Master toggle for all audio features
- Enables/disables:
  - Rep count announcements
  - Set completion messages
  - Workout completion celebration
  - Form correction suggestions

**Audio Tips:**
- Keep volume at comfortable level
- Use during hands-free workouts
- Great for cardio exercises
- Disable for gym environments

### Processing Settings

**Client-Side Processing**
- Process video on your device (default)
- Pros: Privacy, no upload required, faster
- Cons: Requires modern device, uses more battery

**Server-Side Processing**
- Process video on remote servers
- Pros: Works on older devices, saves battery
- Cons: Requires upload, slightly slower, less private

### Input Mode

Switch between:
- **Webcam**: Real-time tracking with your camera
- **Video File**: Upload and analyze recorded videos

---

## Progress Tracking

### Viewing Stats

During workout:
- Real-time stats displayed in overlay
- Current rep, set, and time
- Form quality for last rep

After workout:
- Summary dialog with complete stats
- Total reps and sets completed
- Total duration
- Average rep quality
- Exercise completion status

### Workout History

Access your workout history:
1. Click profile icon
2. Select "Workout History"
3. View past workouts by date
4. See detailed stats for each session

**Available metrics:**
- Exercise name and date
- Sets and reps completed
- Duration
- Average form quality
- Personal records

---

## Advanced Features

### Custom Exercise Creation

Create exercises not in the library:
1. Go to Settings → Exercise Library
2. Click "Create Custom Exercise"
3. Enter details:
   - Exercise name
   - Exercise type (bodyweight, weighted, cardio)
   - Target muscle groups
   - Expected movement pattern
4. Save to your personal library

### Exporting Workout Data

1. Go to Profile → Data Export
2. Select date range
3. Choose format (CSV, JSON, PDF)
4. Click "Export"
5. Download file to your device

### Keyboard Shortcuts

Speed up your workflow:
- `Space`: Start/Stop tracking
- `R`: Reset current set
- `N`: Next exercise
- `S`: Open settings
- `Esc`: Close modal/cancel

---

## Privacy & Data

### What Data is Collected

- Workout statistics (reps, sets, duration)
- Exercise selections and preferences
- Account information (name, email)
- App usage analytics

### What is NOT Collected

- Video recordings (unless you explicitly save)
- Webcam footage
- Personal identifiable health information
- Location data

### Data Storage

- Workout stats stored in Firebase
- Encrypted in transit and at rest
- You can delete your data anytime
- Export your data at any time

### Privacy Controls

1. Go to Settings → Privacy
2. Toggle features:
   - Analytics collection
   - Crash reporting
   - Performance monitoring
3. Request data deletion
4. Download your data

---

## Tips for Best Results

### Lighting
- Use natural light when possible
- Avoid backlighting (don't stand in front of windows)
- Use even, diffused lighting
- Avoid harsh shadows

### Camera Positioning
- Position 6-10 feet away
- Keep full body in frame
- Use landscape orientation
- Mount at waist height
- Keep camera stable (use tripod if available)

### Clothing
- Wear form-fitting clothes
- Use contrasting colors from background
- Avoid baggy or loose clothing
- Consider athletic wear

### Background
- Use simple, uncluttered background
- Avoid busy patterns
- Solid colors work best
- Remove distracting objects

### Exercise Performance
- Perform reps at steady pace (not too fast)
- Use full range of motion
- Maintain good form over speed
- Face camera directly
- Keep movements in the same plane

---

## Troubleshooting

For common issues and solutions, see the [Troubleshooting Guide](troubleshooting.md).

Quick fixes:
- **Not counting reps?** Check camera positioning and lighting
- **Audio not working?** Verify sound is enabled in settings
- **Video upload failing?** Check file size and format
- **Webcam not detected?** Grant camera permissions in browser
- **Slow performance?** Try client-side processing mode

---

## Getting Support

Need more help?
- [FAQ](faq.md) - Frequently asked questions
- [Troubleshooting](troubleshooting.md) - Common problems solved
- [GitHub Issues](https://github.com/Liammarwood/personal-trainer/issues) - Report bugs
- Email: support@personaltrainer.app (coming soon)

---

## What's Next?

- [Features Overview](features.md) - Explore all features in detail
- [FAQ](faq.md) - Common questions answered
- [API Documentation](api.md) - For developers
