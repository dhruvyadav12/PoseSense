import cv2
from core.pose_engine import PoseEngine

# Initialize engine
engine = PoseEngine()

# Open webcam
cap = cv2.VideoCapture(0)

print("PoseSense started! Press Q to quit.")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # Process frame
    frame, keypoints = engine.process_frame(frame)

    # Print keypoints with good confidence
    for kp in keypoints:
        if kp["confidence"] > 0.5:
            print(f"{kp['name']}: x={kp['x']}, y={kp['y']}")

    # Show frame
    cv2.imshow("PoseSense - Live Pose Detection", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
print("PoseSense stopped.")