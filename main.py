import cv2

from core.pose_engine import PoseEngine
from utils.keypoint_saver import KeypointSaver
from modules.context_classifier import ContextClassifier

# Initialize systems
engine = PoseEngine()
saver = KeypointSaver()
classifier = ContextClassifier()

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

    # Frame counter
    cv2.putText(
        frame,
        f"Frames: {classifier.frame_counter}",
        (20, 120),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (255, 255, 255),
        2
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