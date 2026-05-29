class PostureAnalyzer:
    """
    Detects bad posture including:
    - Forward head / neck strain
    - Shoulder imbalance
    - Slouching
    """

    def __init__(self):
        self.bad_posture_frames = 0
        self.alert_threshold = 30  # Alert after 30 bad frames

        print("PostureAnalyzer initialized!")

    def analyze(self, keypoints, context):
        """
        Runs in office/home contexts.
        Returns posture status and any warnings.
        """

        if context not in ["office", "home", "standing"]:
            return {
                "status": "ok",
                "warning": None,
                "active": False
            }

        if not keypoints:
            return {
                "status": "ok",
                "warning": None,
                "active": False
            }

        kp = {k["name"]: k for k in keypoints}

        warnings = []

        # Check each posture issue
        if self._check_forward_head(kp):
            warnings.append("Forward head posture")

        if self._check_shoulder_imbalance(kp):
            warnings.append("Uneven shoulders")

        if self._check_slouching(kp):
            warnings.append("Slouching detected")

        # Track bad posture duration
        if warnings:
            self.bad_posture_frames += 1
        else:
            self.bad_posture_frames = 0

        # Only alert after sustained bad posture
        if self.bad_posture_frames > self.alert_threshold:
            status = "bad"
            warning = warnings[0] if warnings else None
        else:
            status = "ok"
            warning = None

        return {
            "status": status,
            "warning": warning,
            "active": True
        }

    def _check_forward_head(self, kp):
        """
        Forward head: nose is far in front of shoulders horizontally.
        """
        try:
            nose_x = kp["nose"]["x"]
            shoulder_x = (
                kp["left_shoulder"]["x"] +
                kp["right_shoulder"]["x"]
            ) / 2

            # If nose is more than 40px ahead of shoulders
            return abs(nose_x - shoulder_x) > 40

        except KeyError:
            return False

    def _check_shoulder_imbalance(self, kp):
        """
        Uneven shoulders: left and right shoulders at very different heights.
        """
        try:
            left_y = kp["left_shoulder"]["y"]
            right_y = kp["right_shoulder"]["y"]

            # More than 30px difference = uneven
            return abs(left_y - right_y) > 30

        except KeyError:
            return False

    def _check_slouching(self, kp):
        """
        Slouching: ears are lower than usual relative to shoulders.
        """
        try:
            left_ear_y = kp["left_ear"]["y"]
            left_shoulder_y = kp["left_shoulder"]["y"]

            # Ear should be well above shoulder
            # If ear is close to or below shoulder level = slouching
            return (left_shoulder_y - left_ear_y) < 40

        except KeyError:
            return False