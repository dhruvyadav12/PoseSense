import json
import os
from datetime import datetime

class KeypointSaver:
    """
    Saves keypoint data to a JSON file.
    This data will be used later to train behavior models.
    """

    def __init__(self, save_folder="data"):
        self.save_folder = save_folder
        self.session_data = []
        self.frame_count = 0

        # Create data folder if it doesn't exist
        os.makedirs(save_folder, exist_ok=True)

        # Create a unique filename using current time
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.filename = f"{save_folder}/session_{timestamp}.json"
        print(f"Saving keypoints to: {self.filename}")

    def save_frame(self, keypoints):
        """Save keypoints from one frame."""
        if not keypoints:
            return

        frame_data = {
            "frame": self.frame_count,
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "keypoints": keypoints
        }

        self.session_data.append(frame_data)
        self.frame_count += 1

        # Save to file every 30 frames
        if self.frame_count % 30 == 0:
            self._write_to_file()
            print(f"Saved {self.frame_count} frames...")

    def _write_to_file(self):
        """Write all session data to JSON file."""
        with open(self.filename, "w") as f:
            json.dump(self.session_data, f, indent=2)

    def finish(self):
        """Call this when session ends to save everything."""
        self._write_to_file()
        print(f"Session complete! {self.frame_count} frames saved to {self.filename}")