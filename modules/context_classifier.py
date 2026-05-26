import numpy as np

class ContextClassifier:
    """
    Context-aware environment classifier for PoseSense.
    Uses rule-based pose analysis.
    """

    def __init__(self):
        self.context_history = []
        self.history_size = 30

        print("ContextClassifier initialized!")

    def classify(self, keypoints):

        if not keypoints:
            return "unknown"

        # Convert list → dictionary
        kp = {k["name"]: k for k in keypoints}

        # Run checks
        sitting = self._is_sitting(kp)
        arms_raised = self._arms_raised(kp)
        active_motion = self._active_motion(kp)
        upper_body_only = self._upper_body_only(kp)

        # Decision logic
        if arms_raised and active_motion:
            context = "gym"

        elif sitting and upper_body_only:
            context = "office"

        elif sitting:
            context = "home"

        elif active_motion:
            context = "active"

        else:
            context = "standing"

        # Smooth predictions
        self.context_history.append(context)

        if len(self.context_history) > self.history_size:
            self.context_history.pop(0)

        return self._stable_prediction()

    def _is_sitting(self, kp):

        try:
            shoulder_y = kp["left_shoulder"]["y"]
            hip_y = kp["left_hip"]["y"]

            return abs(hip_y - shoulder_y) < 150

        except KeyError:
            return False

    def _arms_raised(self, kp):

        try:
            left_wrist = kp["left_wrist"]["y"]
            left_shoulder = kp["left_shoulder"]["y"]

            right_wrist = kp["right_wrist"]["y"]
            right_shoulder = kp["right_shoulder"]["y"]

            return (
                left_wrist < left_shoulder or
                right_wrist < right_shoulder
            )

        except KeyError:
            return False

    def _active_motion(self, kp):

        try:
            wrist_y = kp["left_wrist"]["y"]
            hip_y = kp["left_hip"]["y"]

            return abs(wrist_y - hip_y) > 200

        except KeyError:
            return False

    def _upper_body_only(self, kp):

        lower_parts = [
            "left_knee",
            "right_knee",
            "left_ankle",
            "right_ankle"
        ]

        missing = 0

        for part in lower_parts:

            if (
                part not in kp or
                kp[part]["confidence"] < 0.3
            ):
                missing += 1

        return missing >= 3

    def _stable_prediction(self):

        return max(
            set(self.context_history),
            key=self.context_history.count
        )