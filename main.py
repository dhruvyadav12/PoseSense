import cv2
from core.pose_engine import PoseEngine
from utils.keypoint_saver import KeypointSaver

# Initialize
engine = PoseEngine()
saver = KeypointSaver()

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

    # Show frame
    cv2.imshow("PoseSense - Live Pose Detection", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Cleanup
cap.release()
cv2.destroyAllWindows()
saver.finish()
print("PoseSense stopped.")