import cv2

from core.pose_engine import PoseEngine
from utils.keypoint_saver import KeypointSaver
from modules.context_classifier import ContextClassifier
from modules.fall_detector import FallDetector

# Initialize systems
engine = PoseEngine()
saver = KeypointSaver()
classifier = ContextClassifier()
fall_detector = FallDetector()

# Open webcam
cap = cv2.VideoCapture(0)

print("PoseSense started! Press Q to quit.")

while cap.isOpened():

    ret, frame = cap.read()

    if not ret:
        break

    # Process frame
    frame, keypoints = engine.process_frame(frame)

    # Save keypoints
    saver.save_frame(keypoints)

    # Detect context
    context = classifier.classify(keypoints)

    # Get stability
    stability = classifier.get_stability()
        # Motion level
    motion = classifier.get_motion_level(
        {k["name"]: k for k in keypoints}
    )
    # Fall detection
    fall_detected = fall_detector.detect(keypoints, motion)

    # Context label
    cv2.putText(
        frame,
        f"Context: {context}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2
    )

    # Stability label
    cv2.putText(
        frame,
        f"Stability: {stability}",
        (20, 80),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (255, 255, 0),
        2
    )
        # Motion label
    cv2.putText(
        frame,
        f"Motion: {motion}",
        (20, 120),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 165, 255),
        2
    )

    # Frame counter
    cv2.putText(
        frame,
        f"Frames: {classifier.frame_counter}",
        (20, 160),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (255, 255, 255),
        2
    )
    # Fall alert
    if fall_detected:
        cv2.putText(
            frame,
            "ALERT: POSSIBLE FALL DETECTED",
            (20, 220),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 0, 255),
            3
        )

    # Show webcam feed
    cv2.imshow(
        "PoseSense - Context Aware Intelligence",
        frame
    )

    # Quit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Cleanup
cap.release()
cv2.destroyAllWindows()

saver.finish()

print("PoseSense stopped.")