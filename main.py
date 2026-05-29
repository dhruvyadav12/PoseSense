import cv2
from core.pose_engine import PoseEngine
from utils.keypoint_saver import KeypointSaver
from modules.context_classifier import ContextClassifier
from modules.fall_detector import FallDetector
from modules.exercise_analyzer import ExerciseAnalyzer
from modules.posture_analyzer import PostureAnalyzer
from modules.suspicious_activity import SuspiciousActivityDetector

# Initialize all systems
engine = PoseEngine()
saver = KeypointSaver()
classifier = ContextClassifier()
fall_detector = FallDetector()
exercise_analyzer = ExerciseAnalyzer()
posture_analyzer = PostureAnalyzer()
suspicious_detector = SuspiciousActivityDetector()

# Open webcam
cap = cv2.VideoCapture(0)
print("PoseSense started! Press Q to quit.")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # Process frame — get skeleton + keypoints
    frame, keypoints = engine.process_frame(frame)

    # Save keypoints to JSON
    saver.save_frame(keypoints)

    # Convert keypoints to dict for motion level
    kp_dict = {k["name"]: k for k in keypoints}

    # Run all analyzers
    context = classifier.classify(keypoints)
    stability = classifier.get_stability()
    motion = classifier.get_motion_level(kp_dict)
    fall_detected = fall_detector.detect(keypoints, motion)
    exercise = exercise_analyzer.analyze(keypoints, context)
    posture = posture_analyzer.analyze(keypoints, context)
    suspicious = suspicious_detector.analyze(keypoints, motion)

    # ── HUD DISPLAY ──────────────────────────────

    # Context
    cv2.putText(frame, f"Context: {context}",
        (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    # Stability
    cv2.putText(frame, f"Stability: {stability}",
        (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)

    # Motion
    cv2.putText(frame, f"Motion: {motion}",
        (20, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 165, 255), 2)

    # Frame counter
    cv2.putText(frame, f"Frames: {classifier.frame_counter}",
        (20, 160), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

    # Exercise info (only shows in gym/active context)
    if exercise["active"]:
        cv2.putText(frame, f"Exercise: {exercise['exercise']}",
            (20, 200), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
        cv2.putText(frame, f"Reps: {exercise['reps']}",
            (20, 240), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)

    # Posture warning (only shows in office/home context)
    if posture["active"] and posture["status"] == "bad":
        cv2.putText(frame, f"POSTURE: {posture['warning']}",
            (20, 280), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 100, 255), 2)

    # Fall alert
    if fall_detected:
        cv2.putText(frame, "ALERT: POSSIBLE FALL DETECTED",
            (20, 320), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)

    # Suspicious activity alert
    if suspicious["suspicious"]:
        cv2.putText(frame, f"ALERT: {suspicious['alert']}",
            (20, 360), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)

    # Show webcam feed
    cv2.imshow("PoseSense - Behavior Intelligence", frame)

    # Quit on Q
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Cleanup
cap.release()
cv2.destroyAllWindows()
saver.finish()
print("PoseSense stopped.")