import numpy as np

class ContextClassifier:
    """
    Analyzes pose keypoints to determine the context/environment.
    Uses rule-based logic - no training data needed.
    """

    def __init__(self):
        self.context_history = []
        self.history_size = 30  # Smooth over 30 frames

    def classify(self, keypoints):
        """Main method - takes keypoints, returns context label."""
        if not keypoints:
            return "unknown"

        # Convert list to dict for easy lookup
        kp = {k["name"]: k for k in keypoints}

        # Run all checks
        person_count_score = self._check_visibility(kp)
        is_sitting = self._check_sitting(kp)
        arms_raised = self._check_arms_raised(kp)
        is_moving = self._check_movement(kp)
        upper_body_only = self._check_upper_body_only(kp)

        # Decision logic
        context = self._decide_context(
            person_count_score,
            is_sitting,
            arms_raised,
            is_moving,
            upper_body_only
        )

        # Smooth the result using history
        self.context_history.append(context)
        if len(self.context_history) > self.history_size:
            self.context_history.pop(0)

        return self._get_stable_context()

    def _check_visibility(self, kp):
        """How many key body parts are visible with high confidence?"""
        important_parts = [
            "nose", "left_shoulder", "right_shoulder",
            "left_hip", "right_hip"
        ]
        visible = sum(
            1 for part in important_parts
            if part in kp and kp[part]["confidence"] > 0.5
        )
        return visible / len(important_parts)

    def _check_sitting(self, kp):
        """Is the person sitting? Hip y-position close to shoulder y-position."""
        try:
            left_shoulder_y = kp["left_shoulder"]["y"]
            left_hip_y = kp["left_hip"]["y"]
            vertical_distance = abs(left_hip_y - left_shoulder_y)
            # If hips and shoulders are close vertically, likely sitting
            return vertical_distance < 150
        except KeyError:
            return False

    def _check_arms_raised(self, kp):
        """Are arms raised above shoulders? Suggests exercise."""
        try:
            left_shoulder_y = kp["left_shoulder"]["y"]
            right_shoulder_y = kp["right_shoulder"]["y"]
            left_wrist_y = kp["left_wrist"]["y"]
            right_wrist_y = kp["right_wrist"]["y"]

            left_raised = left_wrist_y < left_shoulder_y
            right_raised = right_wrist_y < right_shoulder_y
            return left_raised or right_raised
        except KeyError:
            return False

    def _check_movement(self, kp):
        """Simple proxy: are wrists far from hips? Suggests active movement."""
        try:
            left_hip_y = kp["left_hip"]["y"]
            left_wrist_y = kp["left_wrist"]["y"]
            distance = abs(left_wrist_y - left_hip_y)
            return distance > 200
        except KeyError:
            return False

    def _check_upper_body_only(self, kp):
        """Are legs invisible? Suggests desk/seated work."""
        lower_body = ["left_knee", "right_knee", "left_ankle", "right_ankle"]
        low_confidence = sum(
            1 for part in lower_body
            if part in kp and kp[part]["confidence"] < 0.3
        )
        return low_confidence >= 3

    def _decide_context(self, visibility, sitting, arms_raised, moving, upper_body_only):
        """Rule-based decision tree."""

        if visibility < 0.4:
            return "unknown"

        if arms_raised and moving:
            return "gym"

        if sitting and upper_body_only:
            return "office"

        if sitting and not upper_body_only:
            return "home"

        if not sitting and not arms_raised:
            return "standing"

        return "active"

    def _get_stable_context(self):
        """Return the most common context from recent history."""
        if not self.context_history:
            return "unknown"
        return max(set(self.context_history), key=self.context_history.count)