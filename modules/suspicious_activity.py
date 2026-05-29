class SuspiciousActivityDetector:
    """
    Detects suspicious behavior patterns:
    - Loitering (staying in same spot too long)
    - Erratic movement (sudden random movements)
    - Crouching/hiding posture
    """

    def __init__(self):
        self.position_history = []
        self.history_size = 60  # 60 frames = ~2 seconds
        self.loiter_threshold = 50  # frames in same area = loitering
        self.erratic_count = 0

        print("SuspiciousActivityDetector initialized!")

    def analyze(self, keypoints, motion_level):
        """
        Returns suspicious activity status and alert type.
        """

        if not keypoints:
            return {
                "suspicious": False,
                "alert": None
            }

        kp = {k["name"]: k for k in keypoints}

        alerts = []

        # Check loitering
        if self._check_loitering(kp):
            alerts.append("Loitering detected")

        # Check erratic movement
        if self._check_erratic_movement(motion_level):
            alerts.append("Erratic movement")

        # Check crouching
        if self._check_crouching(kp):
            alerts.append("Crouching posture")

        if alerts:
            return {
                "suspicious": True,
                "alert": alerts[0]
            }

        return {
            "suspicious": False,
            "alert": None
        }

    def _check_loitering(self, kp):
        """
        Person staying in very same position for too long.
        """
        try:
            nose_x = kp["nose"]["x"]
            nose_y = kp["nose"]["y"]

            self.position_history.append((nose_x, nose_y))

            if len(self.position_history) > self.history_size:
                self.position_history.pop(0)

            if len(self.position_history) < self.history_size:
                return False

            # Calculate how much position has changed over history
            first_x, first_y = self.position_history[0]
            last_x, last_y = self.position_history[-1]

            total_movement = (
                abs(last_x - first_x) +
                abs(last_y - first_y)
            )

            # If barely moved over 60 frames = loitering
            return total_movement < 20

        except KeyError:
            return False

    def _check_erratic_movement(self, motion_level):
        """
        Rapid switches between high and low motion = erratic.
        """
        if motion_level == "High":
            self.erratic_count += 1
        else:
            self.erratic_count = max(0, self.erratic_count - 1)

        # Sustained high motion is erratic
        return self.erratic_count > 45

    def _check_crouching(self, kp):
        """
        Crouching: shoulders very low, close to hip level.
        """
        try:
            shoulder_y = (
                kp["left_shoulder"]["y"] +
                kp["right_shoulder"]["y"]
            ) / 2

            hip_y = (
                kp["left_hip"]["y"] +
                kp["right_hip"]["y"]
            ) / 2

            # Shoulders and hips very close = crouching
            return abs(shoulder_y - hip_y) < 60

        except KeyError:
            return False