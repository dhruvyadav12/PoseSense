class ExerciseAnalyzer:
    """
    Detects exercise type and counts repetitions
    using wrist and shoulder movement patterns.
    """

    def __init__(self):
        self.rep_count = 0
        self.exercise_type = "none"
        self.position = "down"  # tracks up/down position
        self.prev_wrist_y = None

        print("ExerciseAnalyzer initialized!")

    def analyze(self, keypoints, context):
        """
        Only runs when context is 'gym' or 'active'.
        Returns exercise type and rep count.
        """

        # Only analyze during exercise contexts
        if context not in ["gym", "active"]:
            return {
                "exercise": "none",
                "reps": 0,
                "active": False
            }

        if not keypoints:
            return {
                "exercise": "none",
                "reps": self.rep_count,
                "active": False
            }

        kp = {k["name"]: k for k in keypoints}

        # Detect exercise type
        self.exercise_type = self._detect_exercise(kp)

        # Count reps
        self._count_reps(kp)

        return {
            "exercise": self.exercise_type,
            "reps": self.rep_count,
            "active": True
        }

    def _detect_exercise(self, kp):
        """Identify what exercise is being done."""

        try:
            left_wrist_y = kp["left_wrist"]["y"]
            left_shoulder_y = kp["left_shoulder"]["y"]
            left_elbow_y = kp["left_elbow"]["y"]
            left_hip_y = kp["left_hip"]["y"]

            # Arms raised above head = overhead press or jumping jacks
            if left_wrist_y < left_shoulder_y - 50:
                return "overhead_press"

            # Wrist near shoulder height = bicep curl
            if abs(left_wrist_y - left_shoulder_y) < 80:
                return "bicep_curl"

            # Wrist far below hip = squat position
            if left_wrist_y > left_hip_y + 100:
                return "squat"

            return "general_exercise"

        except KeyError:
            return "unknown"

    def _count_reps(self, kp):
        """
        Count reps by tracking wrist going UP then DOWN.
        One full up+down = one rep.
        """

        try:
            current_wrist_y = kp["left_wrist"]["y"]
            shoulder_y = kp["left_shoulder"]["y"]

            if self.prev_wrist_y is None:
                self.prev_wrist_y = current_wrist_y
                return

            # Wrist went above shoulder = UP position
            if current_wrist_y < shoulder_y and self.position == "down":
                self.position = "up"

            # Wrist came back below shoulder = DOWN position = 1 rep
            elif current_wrist_y > shoulder_y and self.position == "up":
                self.position = "down"
                self.rep_count += 1

            self.prev_wrist_y = current_wrist_y

        except KeyError:
            pass

    def reset_reps(self):
        """Reset rep counter."""
        self.rep_count = 0