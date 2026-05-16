import cv2
import mediapipe as mp

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

class PoseEngine:
    """
    Core pose detection engine using MediaPipe.
    Detects 33 keypoints per person from webcam or video.
    """

    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        self.pose = self.mp_pose.Pose()
        print("PoseEngine initialized!")

    def process_frame(self, frame):
        """
        Takes a single frame, returns:
        - frame with skeleton drawn on it
        - list of keypoints (name, x, y, confidence)
        """
        h, w, _ = frame.shape
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = self.pose.process(rgb_frame)

        keypoints = []

        if result.pose_landmarks:
            # Draw skeleton
            self.mp_drawing.draw_landmarks(
                frame,
                result.pose_landmarks,
                self.mp_pose.POSE_CONNECTIONS
            )

            # Extract keypoints
            for i, landmark in enumerate(result.pose_landmarks.landmark):
                x = int(landmark.x * w)
                y = int(landmark.y * h)
                confidence = round(landmark.visibility, 2)
                keypoints.append({
                    "name": KEYPOINT_NAMES[i],
                    "x": x,
                    "y": y,
                    "confidence": confidence
                })

        return frame, keypoints