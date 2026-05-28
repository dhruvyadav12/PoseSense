class FallDetector:
    """
    Detects possible falls using body posture
    and motion analysis.
    """

    def __init__(self):
        self.fall_detected = False
        self.fall_frame_count = 0
        self.cooldown = 0

        print("FallDetector initialized!")

    def detect(self, keypoints, motion_level):

        if not keypoints:
            return False

        # Cooldown so alert doesn't flicker
        if self.cooldown > 0:
            self.cooldown -= 1
            return self.fall_detected

        kp = {k["name"]: k for k in keypoints}

        try:
            left_shoulder = kp["left_shoulder"]
            right_shoulder = kp["right_shoulder"]
            left_hip = kp["left_hip"]
            right_hip = kp["right_hip"]

            # Average shoulder position
            shoulder_y = (
                left_shoulder["y"] +
                right_shoulder["y"]
            ) / 2

            shoulder_x = (
                left_shoulder["x"] +
                right_shoulder["x"]
            ) / 2

            # Average hip position
            hip_y = (
                left_hip["y"] +
                right_hip["y"]
            ) / 2

            hip_x = (
                left_hip["x"] +
                right_hip["x"]
            ) / 2

            # Vertical distance between shoulders and hips
            vertical_distance = abs(shoulder_y - hip_y)

            # Horizontal spread between shoulders and hips
            horizontal_distance = abs(shoulder_x - hip_x)

            # Fall logic:
            # When someone falls, body becomes horizontal
            # So vertical distance becomes SMALL
            # And horizontal distance becomes LARGE
            if (
                vertical_distance < 80 and
                horizontal_distance > 50 and
                motion_level == "High"
            ):
                self.fall_frame_count += 1

                # Confirm fall after 3 consecutive frames
                if self.fall_frame_count >= 3:
                    self.fall_detected = True
                    self.cooldown = 30  # Show alert for 30 frames
                    return True

            else:
                self.fall_frame_count = 0
                self.fall_detected = False
                return False

        except KeyError:
            return False