---
layout: default
title: FAQ
nav_order: 5
---

# Frequently Asked Questions

Common questions and answers about Personal Trainer.

## Table of Contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## General Questions

### What is Personal Trainer?

Personal Trainer is a web application that uses computer vision to track your workouts in real-time. It counts your reps, monitors your form, and provides audio feedback to help you achieve your fitness goals.

### Is Personal Trainer free?

Yes! Personal Trainer offers a free tier with core features including webcam tracking, basic exercise library, and audio feedback. Premium features are available for advanced users.

### Do I need special equipment?

No special equipment needed! Just:
- A computer or smartphone with a camera
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Internet connection
- Optional: Weights, resistance bands, or other exercise equipment

### Can I use it at the gym?

Absolutely! Personal Trainer works great at the gym. You can:
- Use your phone's camera on a stand or prop
- Track exercises with or without equipment
- Disable audio if gym environment is noisy
- Work through pre-planned workout routines

---

## Account & Sign-In

### Why do I need to sign in?

Signing in allows us to:
- Save your workout history and progress
- Sync data across devices
- Provide personalized recommendations
- Protect your privacy and data

### What if I don't have a Google account?

Currently, Google Sign-In is the only authentication method. However, we're working on adding:
- Apple Sign-In
- Facebook Sign-In
- Email/password authentication

### Can I delete my account?

Yes. Go to Settings → Privacy → Delete Account. All your data will be permanently removed from our servers.

### Is my data private?

Yes! We take privacy seriously:
- Videos are processed and not stored (unless you save them)
- Workout stats are encrypted
- No sharing without your permission
- GDPR compliant
- Option for client-side processing (data never leaves your device)

---

## Tracking & Accuracy

### How accurate is the rep counting?

Rep counting accuracy is typically 95%+ when:
- Good lighting is present
- Full body is visible in frame
- Camera is stable
- Proper form is maintained

Accuracy may decrease with:
- Poor lighting or shadows
- Partial body occlusion
- Very fast movements
- Unusual exercise variations

### Why isn't it counting my reps?

Common reasons:
1. **Not visible**: Ensure your full body is in frame
2. **Poor lighting**: Add more light or change camera angle
3. **Too fast**: Slow down your rep tempo
4. **Incomplete ROM**: Use full range of motion
5. **Wrong exercise**: Verify you selected the correct exercise

Try:
- Repositioning camera 6-10 feet away
- Turning on more lights
- Wearing contrasting clothing
- Performing reps more slowly

### Can it track all exercises?

Personal Trainer tracks 50+ exercises including:
- **Upper body**: Push-ups, pull-ups, curls, presses
- **Lower body**: Squats, lunges, deadlifts
- **Core**: Sit-ups, planks, crunches
- **Cardio**: Burpees, jumping jacks, mountain climbers

Some exercises are harder to track:
- Very small movements (wrist curls)
- Isometric holds (wall sits)
- Equipment-based exercises (cable machines)
- Exercises performed lying down

### How does form analysis work?

The AI uses pose detection to:
1. Identify 33 body landmarks (joints)
2. Calculate angles between joints
3. Compare to ideal form patterns
4. Provide real-time feedback

Form quality is rated:
- 🟢 **Perfect**: Matches ideal form closely
- 🟡 **Good**: Acceptable with minor deviations
- 🔴 **Poor**: Significant form issues detected

---

## Technical Questions

### What browsers are supported?

**Fully supported:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Opera 76+

**Not supported:**
- Internet Explorer (any version)
- Very old browser versions

### Do I need to download anything?

No downloads required! Personal Trainer is a web application that runs entirely in your browser. You can optionally:
- Install as a Progressive Web App (PWA)
- Add to home screen on mobile
- Bookmark for quick access

### Why is my camera not working?

**Troubleshooting steps:**
1. **Check permissions**: Allow camera access in browser settings
2. **Close other apps**: Only one app can use camera at a time
3. **Try different browser**: Test in Chrome or Firefox
4. **Update browser**: Ensure you have latest version
5. **Restart device**: Simple reboot often fixes issues

**Browser permission locations:**
- Chrome: Settings → Privacy → Camera
- Firefox: Settings → Permissions → Camera
- Safari: Preferences → Websites → Camera

### Can I use it offline?

Partially:
- **Client-side processing**: Works offline after initial load
- **Server-side processing**: Requires internet connection
- **Exercise library**: Cached for offline access
- **Workout plans**: Syncs when online

To use offline:
1. Enable client-side processing in settings
2. Load the app once while online
3. Browser will cache necessary files
4. Track workouts without internet
5. Data syncs when you reconnect

### How much data does it use?

Data usage varies by mode:

**Webcam mode (client-side):**
- Initial load: ~10-20 MB
- Per workout: Minimal (<1 MB)
- Total: ~20-30 MB per session

**Video upload mode:**
- Depends on video file size
- 1 min video ≈ 50-100 MB
- Compression available

**Tips to reduce data:**
- Use client-side processing
- Connect to WiFi for uploads
- Enable data saver mode
- Download exercise library on WiFi

---

## Workouts & Plans

### How do I create a workout plan?

Three methods:

**1. Image Upload:**
- Take photo of your plan
- Upload to app
- AI extracts exercises
- Review and confirm

**2. Manual Entry:**
- Click "Add Exercise"
- Enter name, sets, reps
- Repeat for each exercise
- Save plan

**3. Exercise Library:**
- Browse available exercises
- Select exercises to add
- Set target sets/reps
- Save to plan

### Can I share my workout plan?

Yes! Options:
- **Export as PDF**: Print or email
- **Share link**: Send to friends
- **Public profile**: Share on social media
- **QR code**: Quick access for others

### How do rest periods work?

Rest periods are:
- Automatically triggered after each set
- Customizable duration (15-300 seconds)
- Announced with audio countdown
- Skippable if you're ready early

To customize:
1. Edit exercise in workout plan
2. Set "Rest Time" field
3. Choose duration in seconds
4. Save changes

### What if I can't complete a set?

No problem! Options:
- **Continue**: System tracks actual reps
- **Skip set**: Move to next set
- **Stop exercise**: End and save progress
- **Modify plan**: Adjust target reps/sets

Your actual performance is always recorded, not just targets.

---

## Audio & Feedback

### Why can't I hear audio announcements?

Check:
1. **Sound enabled**: Settings → Audio → Sound Enabled = ON
2. **Device volume**: Turn up volume on device
3. **Browser settings**: Ensure site can play sound
4. **Audio output**: Check correct speaker/headphones selected

### Can I customize what it says?

Currently audio phrases are predefined, but you can:
- Adjust speech rate (faster/slower)
- Control volume
- Toggle on/off per workout
- Choose language (coming soon)

Custom phrases are in development!

### How do I change the voice?

Voice options:
1. Go to Settings → Audio
2. Select "Voice Selection"
3. Choose from available voices
4. Test with sample phrase

Available voices depend on your:
- Operating system
- Browser
- System language settings
- Installed text-to-speech engines

---

## Privacy & Security

### Where is my data stored?

- **Workout stats**: Firebase (Google Cloud)
- **Account info**: Secure authentication service
- **Videos**: Processed in real-time, not stored
- **Exercise library**: Cached on your device

All data is:
- Encrypted in transit (HTTPS)
- Encrypted at rest
- Backed up regularly
- Accessible only to you

### Can others see my workouts?

Only if you choose to share. By default:
- Workouts are private
- Not visible to other users
- Not shared on social media
- Not used in public statistics

You can optionally:
- Share specific workouts
- Make profile public
- Join challenges
- Compare with friends

### Is video recorded?

**No!** Unless you explicitly save:
- Webcam: Processed in real-time, not recorded
- Video files: Analyzed and deleted after processing
- No permanent video storage

You can optionally:
- Save workout recordings
- Export video with analysis overlay
- Keep for personal review

### How do I export my data?

1. Go to Settings → Privacy
2. Click "Export Data"
3. Select date range
4. Choose format (CSV, JSON, PDF)
5. Download file

Exported data includes:
- Workout history
- Exercise stats
- Personal records
- Workout plans
- Settings and preferences

---

## Troubleshooting

### App is running slow

Try:
- **Switch to client-side processing**: Settings → Processing
- **Close other tabs/apps**: Free up resources
- **Lower video quality**: Settings → Display
- **Clear browser cache**: Browser settings
- **Update browser**: Install latest version
- **Restart device**: Fresh start

### Reps not counting consistently

Improve accuracy:
- **Better lighting**: Add light sources
- **Stable camera**: Use tripod or prop
- **Full body visible**: Step back from camera
- **Slower tempo**: Controlled movements
- **Contrasting clothes**: Stand out from background
- **Correct exercise**: Verify selection

### Camera permission denied

Fix permission:
1. Look for camera icon in browser address bar
2. Click and select "Allow"
3. Refresh page
4. Or go to browser settings → permissions
5. Find Personal Trainer site
6. Enable camera access

### Video upload failing

Solutions:
- **Check file size**: Max 100 MB
- **Verify format**: MP4, MOV, or AVI only
- **Stable connection**: Use WiFi if possible
- **Clear browser cache**: Remove old data
- **Try smaller video**: Reduce resolution
- **Different browser**: Test Chrome or Firefox

---

## Mobile Usage

### Does it work on phones?

Yes! Personal Trainer works on:
- iPhone (iOS 14+)
- Android phones (Android 10+)
- Tablets (iPad, Android tablets)

Mobile features:
- Responsive design
- Touch gestures
- Mobile-optimized UI
- Camera switching (front/back)
- Add to home screen

### Can I install it as an app?

Yes! As a Progressive Web App:

**iPhone/iPad:**
1. Open in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. Name the app
5. Launch from home screen

**Android:**
1. Open in Chrome
2. Tap menu (three dots)
3. Select "Add to Home Screen"
4. Confirm
5. Launch from home screen

### Does it work with phone in portrait mode?

Best experience in landscape, but portrait works for:
- Upper body exercises
- Viewing workout plans
- Navigating settings
- Reading instructions

Rotate to landscape for:
- Exercise tracking
- Full body visibility
- Better form analysis

---

## Support & Help

### How do I report a bug?

Report bugs:
1. Visit [GitHub Issues](https://github.com/Liammarwood/personal-trainer/issues)
2. Click "New Issue"
3. Choose "Bug Report"
4. Fill in template with:
   - What happened
   - Expected behavior
   - Steps to reproduce
   - Browser/device info
   - Screenshots if helpful

### How do I request a feature?

Request features:
1. Visit [GitHub Issues](https://github.com/Liammarwood/personal-trainer/issues)
2. Click "New Issue"
3. Choose "Feature Request"
4. Describe:
   - What feature you want
   - Why it's useful
   - How it should work
   - Any examples

### Where can I get more help?

Resources:
- [User Guide](user-guide.md) - Detailed instructions
- [Getting Started](getting-started.md) - Quick start
- [Troubleshooting](troubleshooting.md) - Common fixes
- [GitHub Discussions](https://github.com/Liammarwood/personal-trainer/discussions) - Community help

---

## Still Have Questions?

Can't find your answer?
- Check our [Troubleshooting Guide](troubleshooting.md)
- Read the [User Guide](user-guide.md)
- Ask on [GitHub Discussions](https://github.com/Liammarwood/personal-trainer/discussions)
- Open an [issue on GitHub](https://github.com/Liammarwood/personal-trainer/issues)
