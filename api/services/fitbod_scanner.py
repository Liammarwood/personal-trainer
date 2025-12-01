import cv2
import pytesseract
import json
import re
import os
from datetime import datetime
from pathlib import Path

# If you're on Windows, you may need to specify the tesseract path:
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

class FitBodScanner:
    def __init__(self):
        pass
    
    def parse_extracted_text_advanced(self, text):
        """Parse extracted text with advanced deduplication and filtering"""
        exercises = []
        seen_exercises = set()  # To track duplicates based on exercise name only
        
        # Split into lines for processing
        lines = text.split('\n')
        
        i = 0
        
        while i < len(lines):
            line = lines[i].strip()
            i += 1
            
            if not line or line in ['Start Workout', 'Body Targets Log', 'Target Muscles', 'FOCUS']:
                continue
            
            # Skip lines that are clearly not exercises
            skip_keywords = ['workout', 'swap', 'exercises', 'your gym', 'intermediate', 
                            'target muscles', 'abs glutes', 'quadrice', 'superset', 'rounds', 'focus']
            if any(keyword in line.lower() for keyword in skip_keywords):
                continue
            
            # Look for capitalized exercise names (2+ words, title case)
            # Also catch single words if they're clearly exercise names
            exercise_pattern = r'(?:^|[^A-Za-z]+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)'
            exercise_match = re.search(exercise_pattern, line)
            
            # Also try to match single-word exercises like "Sit Up" that might have garbage before
            if not exercise_match:
                single_word_pattern = r'([A-Z][a-z]+\s+[Uu]p|[Ss]it\s+[Uu]p|[Kk]neeling\s+[A-Z][a-z]+)'
                exercise_match = re.search(single_word_pattern, line)
            
            if not exercise_match:
                continue
            
            exercise_name = exercise_match.group(1).strip()
            
            # Normalize exercise names
            if exercise_name.lower() == 'sit up':
                exercise_name = 'Sit Up'
            
            # Filter out false positives
            if len(exercise_name) <= 4 or exercise_name in ['Body Targets', 'Start Workout']:
                continue
            
            # Check if already seen (skip duplicates)
            if exercise_name in seen_exercises:
                continue
            
            # Special case: normalize corrupted "Jump Rope" variants
            if 'jump rope' in exercise_name.lower():
                exercise_name = 'Jump Rope'
                if exercise_name in seen_exercises:
                    continue
            
            # Now check if the NEXT line has valid Sets/Reps/Weight data
            # Try up to 2 lines ahead to skip garbage lines
            exercise_data = None
            for lookahead in range(2):
                if i + lookahead >= len(lines):
                    break
                    
                next_line = lines[i + lookahead].strip()
                
                # Skip obvious garbage lines
                if len(next_line) < 5 or not any(char.isdigit() for char in next_line):
                    continue
                
                # Pattern 1: Sets + Reps + Weight
                pattern1 = r'^\s*[^\d]*(\d+)\s*[Ss]ets?\s*[+»×xX*\-«>°:]+\s*(\d+)\s*[Rr]eps?\s*[+»×xX*\-«>°:]+\s*(\d+(?:\.\d+)?)\s*k'
                match = re.search(pattern1, next_line)
                if match:
                    sets = int(match.group(1))
                    reps = int(match.group(2))
                    weight = float(match.group(3))
                    exercise_data = {
                        'exercise': exercise_name,
                        'sets': sets,
                        'reps': reps,
                        'weight_kg': weight
                    }
                
                # Pattern 2: Sets + Time only
                if not exercise_data:
                    pattern2 = r'^\s*[^\d]*(\d+)\s*[Ss]ets?\s*[+»×xX*\-«>°]+\s*(\d+):(\d+)'
                    match = re.search(pattern2, next_line)
                    if match:
                        sets = int(match.group(1))
                        minutes = int(match.group(2))
                        seconds = int(match.group(3))
                        exercise_data = {
                            'exercise': exercise_name,
                            'sets': sets,
                            'duration': f"{minutes}:{seconds:02d}"
                        }
                
                # Pattern 3: Sets + Time + Weight
                if not exercise_data:
                    pattern3 = r'^\s*[^\d]*(\d+)\s*[Ss]ets?[.\s]*[+»×xX*\-«>°]*\s*(\d+):(\d+)\s*[+»×xX*\-«>°]+\s*(\d+(?:\.\d+)?)\s*k'
                    match = re.search(pattern3, next_line)
                    if match:
                        sets = int(match.group(1))
                        minutes = int(match.group(2))
                        seconds = int(match.group(3))
                        weight = float(match.group(4))
                        exercise_data = {
                            'exercise': exercise_name,
                            'sets': sets,
                            'duration': f"{minutes}:{seconds:02d}",
                            'weight_kg': weight
                        }
                
                # Pattern 4: Sets + Reps only (no weight)
                if not exercise_data:
                    pattern4 = r'^\s*[^\d]*(\d+)\s*[Ss]ets?\s*[+»×xX*\-«>°]+\s*(\d+)\s*[Rr]eps?'
                    match = re.search(pattern4, next_line)
                    if match:
                        sets = int(match.group(1))
                        reps = int(match.group(2))
                        exercise_data = {
                            'exercise': exercise_name,
                            'sets': sets,
                            'reps': reps
                        }
                
                # Pattern 5: Sets + Max Effort (no reps/weight specified)
                if not exercise_data:
                    pattern5 = r'^\s*[^\d]*(\d+)\s*[Ss]ets?\s*[+»×xX*\-«>°]+\s*[Mm]ax\s*[Ee]ffort'
                    match = re.search(pattern5, next_line)
                    if match:
                        sets = int(match.group(1))
                        exercise_data = {
                            'exercise': exercise_name,
                            'sets': sets,
                            'reps': 'Max Effort'
                        }
                
                # If we found valid exercise data, add it and break
                if exercise_data:
                    seen_exercises.add(exercise_name)
                    exercises.append(exercise_data)
                    break  # Break from lookahead loop
        
        return exercises
    
    def preprocess_image(self, frame):
        """Preprocess the image for better OCR results"""
        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Apply thresholding to get better contrast
        _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
        
        # Denoise
        denoised = cv2.fastNlMeansDenoising(thresh, None, 10, 7, 21)
        
        return denoised
    
    def extract_text(self, frame):
        """Extract text from the frame using OCR"""
        processed = self.preprocess_image(frame)
        
        # Use pytesseract to extract text
        text = pytesseract.image_to_string(processed, config='--psm 6')
        return text
    
    def process_uploaded_image(self, image_path):
        """Process a single uploaded image file (PNG/JPG)"""
        if not os.path.exists(image_path):
            print(f"Error: File not found: {image_path}")
            return
        
        # Read the image
        frame = cv2.imread(image_path)
        if frame is None:
            print(f"Error: Could not read image file: {image_path}")
            return
        
        print(f"\nProcessing image: {image_path}")
        
        # Extract text from image
        text = self.extract_text(frame)
        
        # Save extracted text to file
        text_filename = f"extracted_text_image_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        with open(text_filename, 'w', encoding='utf-8') as f:
            f.write(text)
        print(f"✓ Extracted text saved to: {text_filename}")
        
        # Parse workout data using advanced parser
        workouts = self.parse_extracted_text_advanced(text)
        
        if workouts:
            print(f"✓ Found {len(workouts)} unique exercises:\n")
            for i, ex in enumerate(workouts, 1):
                print(f"{i}. {ex['exercise']}")
                print(f"   Sets: {ex['sets']}", end="")
                if 'reps' in ex:
                    print(f" | Reps: {ex['reps']}", end="")
                if 'duration' in ex:
                    print(f" | Duration: {ex['duration']}", end="")
                if 'weight_kg' in ex:
                    print(f" | Weight: {ex['weight_kg']} kg", end="")
                print()
            
            # Save to JSON
            filename = f"workout_from_image_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            output_data = {
                'source': image_path,
                'source_type': 'image',
                'total_exercises': len(workouts),
                'timestamp': datetime.now().isoformat(),
                'exercises': workouts
            }
            
            with open(filename, 'w') as f:
                json.dump(output_data, f, indent=2)
            
            print(f"\n✓ Workout data saved to: {filename}")
        else:
            print("No workouts detected in the image.")
    
    def process_uploaded_video(self, video_path):
        """Process an uploaded video file (MP4)"""
        if not os.path.exists(video_path):
            print(f"Error: File not found: {video_path}")
            return
        
        # Open the video file
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"Error: Could not open video file: {video_path}")
            return
        
        print(f"\nProcessing video: {video_path}")
        
        # Get video properties
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = frame_count / fps if fps > 0 else 0
        
        print(f"Video info: {frame_count} frames, {fps:.2f} fps, {duration:.2f} seconds")
        
        # Process frames (sample every 0.5 seconds to avoid duplicates)
        frame_interval = int(fps * 0.5) if fps > 0 else 15
        all_text = []
        processed_count = 0
        
        frame_idx = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Process every nth frame
            if frame_idx % frame_interval == 0:
                text = self.extract_text(frame)
                if text.strip():
                    all_text.append(text)
                processed_count += 1
                
                # Show progress
                if processed_count % 5 == 0:
                    print(f"Processed {processed_count} frames...")
            
            frame_idx += 1
        
        cap.release()
        
        print(f"\nProcessed {processed_count} frames from video")
        
        # Combine all text and save to file
        combined_text = '\n'.join(all_text)
        text_filename = f"extracted_text_video_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        with open(text_filename, 'w', encoding='utf-8') as f:
            f.write(combined_text)
        print(f"✓ Extracted text saved to: {text_filename}")
        
        # Parse workout data using advanced parser
        workouts = self.parse_extracted_text_advanced(combined_text)
        
        if workouts:
            print(f"✓ Found {len(workouts)} unique exercises:\n")
            for i, ex in enumerate(workouts, 1):
                print(f"{i}. {ex['exercise']}")
                print(f"   Sets: {ex['sets']}", end="")
                if 'reps' in ex:
                    print(f" | Reps: {ex['reps']}", end="")
                if 'duration' in ex:
                    print(f" | Duration: {ex['duration']}", end="")
                if 'weight_kg' in ex:
                    print(f" | Weight: {ex['weight_kg']} kg", end="")
                print()
            
            # Save to JSON
            filename = f"workout_from_video_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            output_data = {
                'source': video_path,
                'source_type': 'video',
                'total_exercises': len(workouts),
                'timestamp': datetime.now().isoformat(),
                'exercises': workouts
            }
            
            with open(filename, 'w') as f:
                json.dump(output_data, f, indent=2)
            
            print(f"\n✓ Workout data saved to: {filename}")
        else:
            print("No workouts detected in the video.")

    def process_uploaded_video_return(self, video_path):
        """Process an uploaded video file and return parsed workouts as a dict.

        This is a programmatic variant of `process_uploaded_video` that returns
        the parsed data instead of just printing and saving files. Useful for
        web-server integrations.
        """
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"File not found: {video_path}")

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise IOError(f"Could not open video file: {video_path}")

        # Get video properties
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = frame_count / fps if fps > 0 else 0

        # Process frames (sample every 0.5 seconds)
        frame_interval = int(fps * 0.5) if fps > 0 else 15
        all_text = []
        processed_count = 0

        frame_idx = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            if frame_idx % frame_interval == 0:
                text = self.extract_text(frame)
                if text.strip():
                    all_text.append(text)
                processed_count += 1

            frame_idx += 1

        cap.release()

        combined_text = '\n'.join(all_text)

        workouts = self.parse_extracted_text_advanced(combined_text)

        output_data = {
            'source': video_path,
            'source_type': 'video',
            'total_exercises': len(workouts),
            'timestamp': datetime.now().isoformat(),
            'exercises': workouts,
            'raw_text': combined_text
        }

        return output_data
    
    def process_uploaded_image_return(self, image_path):
        """Process an uploaded image file and return parsed workouts as a dict.

        This is a programmatic variant of `process_uploaded_image` that returns
        the parsed data instead of just printing and saving files. Useful for
        web-server integrations.
        """
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"File not found: {image_path}")

        # Read the image
        frame = cv2.imread(image_path)
        if frame is None:
            raise IOError(f"Could not read image file: {image_path}")

        # Extract text from image
        text = self.extract_text(frame)

        # Parse workout data using advanced parser
        workouts = self.parse_extracted_text_advanced(text)

        output_data = {
            'source': image_path,
            'source_type': 'image',
            'total_exercises': len(workouts),
            'timestamp': datetime.now().isoformat(),
            'exercises': workouts,
            'raw_text': text
        }

        return output_data
    
    def run(self):
        """Run the scanner in file upload mode"""
        print("\n=== FitBod Workout Scanner ===")
        print("Supported formats: MP4 (video), PNG/JPG (images)")
        print("\nEnter the file path (or 'q' to quit):")
        
        while True:
            file_path = input("\nFile path: ").strip().strip('"').strip("'")
            
            if file_path.lower() == 'q':
                break
            
            if not file_path:
                continue
            
            # Get file extension
            file_ext = Path(file_path).suffix.lower()
            
            if file_ext == '.mp4':
                self.process_uploaded_video(file_path)
            elif file_ext in ['.png', '.jpg', '.jpeg']:
                self.process_uploaded_image(file_path)
            else:
                print(f"Unsupported file format: {file_ext}")
                print("Please upload MP4, PNG, JPG, or JPEG files.")
        
        print("\nGoodbye!")


if __name__ == "__main__":
    scanner = FitBodScanner()
    
    try:
        scanner.run()
    except KeyboardInterrupt:
        print("\n\nInterrupted by user.")
    except Exception as e:
        print(f"Error: {e}")

