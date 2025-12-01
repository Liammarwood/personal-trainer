# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- opencv-python (camera/video)
- mediapipe (pose detection)
- numpy (calculations)
- flask (web interface)

### 2. Verify Setup

```bash
python verify_setup.py
```

This tests that all 10 exercises load correctly. Should see:
```
✓ ALL TESTS PASSED - System ready to use!
```

### 3. Start Using

Choose one:

#### Option A: Web Interface (Recommended)
```bash
python web_server.py
```

Open browser to `http://localhost:5000`

**Features:**
- ✅ All 10 exercises in dropdown
- ✅ Live video feed with pose tracking
- ✅ Real-time rep counting
- ✅ Form instructions
- ✅ Exercise stats
- ✅ **NEW: Upload FitBod workout videos (MP4)**
- ✅ **NEW: Automatic exercise detection & mapping**
- ✅ **NEW: Expected workout plan tracking**

#### Option B: Command Line
```bash
python example_usage.py
```

**Features:**
- ✅ Interactive menu
- ✅ Select exercise by number
- ✅ Full-screen tracking

#### Option C: Direct Script
```bash
# For old scripts (still work)
python squat.py
python shoulder_press.py
```

## 📝 What Exercises Are Available?

1. **Squat** - Full depth squat tracking
2. **Shoulder Press** - Overhead press
3. **Deadlift** - Hip hinge with lockout
4. **Romanian Deadlift** - Straight-leg variant
5. **Calf Raise** - Ankle extension
6. **Barbell Row** - Bent-over row
7. **Bicep Curl** - Elbow flexion
8. **Bench Press** - Chest press
9. **Front Raise** - Forward arm raise
10. **Dumbbell Fly** - Chest fly

## 🎥 Camera Setup

For best results:
- **Distance**: Stand 6-8 feet from camera
- **Position**: Full body visible (head to feet)
- **Lighting**: Well-lit room
- **Background**: Clear, contrasting background
- **Clothing**: Fitted clothing (easier tracking)

## 📊 Where Are My Logs?

All workout logs saved to `logs/` directory:
- `logs/squat_log.txt`
- `logs/deadlift_log.txt`
- `logs/bicep_curl_log.txt`
- etc.

Format:
```
Timestamp | Rep # | Metrics | Duration | Quality
2024-01-15 10:30:45 | #005 | 87.3° | Depth: 0.121 | 2.3s | Excellent
```

## 🛠️ Troubleshooting

### Camera Not Working
```bash
# Try different camera index
# Edit in web_server.py or exercise scripts
camera_index=1  # Change from 0 to 1 or 2
```

### Import Errors
```bash
# Make sure you're in the project directory
cd personal-trainer

# Reinstall dependencies
pip install -r requirements.txt
```

### Detection Problems
- Move further from camera
- Improve lighting
- Wear contrasting/fitted clothing
- Ensure full body visible

## 📚 Next Steps

**For Users:**
- See `README.md` for complete documentation
- Try different exercises
- Review your workout logs

**For Developers:**
- See `RESTRUCTURE.md` for architecture details
- See "Adding a New Exercise" section in `README.md`
- Check `exercises/base_exercise.py` for base class
- Review `exercises/utils.py` for helper functions

## 🎯 Example Workflow

### Manual Workout
```bash
# 1. Start web server
python web_server.py

# 2. Open browser
# Go to http://localhost:5000

# 3. Select exercise
# Choose "Squat" from dropdown

# 4. Click "Start"
# Stand in view of camera

# 5. Perform exercise
# Follow on-screen instructions

# 6. View stats
# Reps counted automatically
# Instructions update in real-time

# 7. Review logs
# Check logs/squat_log.txt for details
```

### FitBod Video Upload (NEW! 🎉)
```bash
# 1. Start web server
python web_server.py

# 2. Open browser
# Go to http://localhost:5000

# 3. Record FitBod workout
# Screen record your FitBod workout plan (MP4)

# 4. Upload video
# Click "Upload FitBod Workout Video"
# Select your MP4 file
# Click "Upload & Scan Video"

# 5. Review detected exercises
# See list with trackable/untackable badges
# Check sets, reps, weight for each exercise

# 6. Start tracking
# Click "Start Tracking This Exercise"
# Camera activates automatically
# Expected plan shows in stats panel

# 7. Complete workout
# Perform all exercises from detected list
# Each rep tracked in real-time
# Logs saved automatically
```

**See `UPLOAD_FEATURE.md` for detailed upload documentation**

## 💡 Pro Tips

### Maximize Rep Counts
- **Full range of motion**: Exercises require proper depth/height
- **Return to start**: Must return to starting position between reps
- **Controlled movement**: Smooth, deliberate motions track better
- **Proper form**: System validates technique, not just movement

### Better Tracking
- **Side view works best** for most exercises
- **Stand centered** in frame
- **Avoid baggy clothes** that hide body shape
- **Keep consistent distance** from camera

### Multiple Users
- Each user can have their own log files
- Edit detector initialization:
  ```python
  detector = get_exercise_detector('squat', log_file='logs/squat_john.txt')
  ```

## 🆘 Need Help?

1. Check `README.md` - Complete documentation
2. Check `RESTRUCTURE.md` - Architecture details
3. Run `verify_setup.py` - Diagnose setup issues
4. Check error messages - Usually indicate missing joints or camera issues

## ✅ Success Checklist

Before your first workout:
- [ ] Installed dependencies (`pip install -r requirements.txt`)
- [ ] Ran verification (`python verify_setup.py`)
- [ ] Tested camera (can see video feed)
- [ ] Verified full body visible in frame
- [ ] Set up good lighting
- [ ] Chose your first exercise

Ready to train! 💪
