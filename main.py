import cv2
import mediapipe as mp

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
pose = mp_pose.Pose()

# Keypoint names for reference
KEYPOINT_NAMES = [
    "nose", "left_eye_inner", "left_eye", "left_eye_outer",
    "right_eye_inner", "right_eye", "right_eye_outer",
    "left_ear", "right_ear", "mouth_left", "mouth_right",
    "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
    "left_wrist", "right_wrist", "left_pinky", "right_pinky",
    "left_index", "right_index", "left_thumb", "right_thumb",
    "left_hip", "right_hip", "left_knee", "right_knee",
    "left_ankle", "right_ankle", "left_heel", "right_heel",
    "left_foot_index", "right_foot_index"
]

# Open webcam
cap = cv2.VideoCapture(0)

print("PoseSense started! Press Q to quit.")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # Get frame dimensions
    h, w, _ = frame.shape

    # Convert to RGB
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Detect pose
    result = pose.process(rgb_frame)

    # Draw skeleton + extract keypoints
    if result.pose_landmarks:
        mp_drawing.draw_landmarks(
            frame,
            result.pose_landmarks,
            mp_pose.POSE_CONNECTIONS
        )

        # Extract and print keypoints
        print("\n--- Keypoints ---")
        for i, landmark in enumerate(result.pose_landmarks.landmark):
            # Convert from 0-1 range to actual pixel coordinates
            x = int(landmark.x * w)
            y = int(landmark.y * h)
            confidence = round(landmark.visibility, 2)

            # Only print keypoints with good confidence
            if confidence > 0.5:
                print(f"{KEYPOINT_NAMES[i]}: x={x}, y={y}, confidence={confidence}")

    # Show frame
    cv2.imshow("PoseSense - Live Pose Detection", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
print("PoseSense stopped.")