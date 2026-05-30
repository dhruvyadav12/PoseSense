import cv2
import base64
import numpy as np
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from core.pose_engine import PoseEngine
from utils.keypoint_saver import KeypointSaver
from modules.context_classifier import ContextClassifier
from modules.fall_detector import FallDetector
from modules.exercise_analyzer import ExerciseAnalyzer
from modules.posture_analyzer import PostureAnalyzer
from modules.suspicious_activity import SuspiciousActivityDetector

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI modules
engine     = PoseEngine()
saver      = KeypointSaver()
classifier = ContextClassifier()
fall_det   = FallDetector()
exercise   = ExerciseAnalyzer()
posture    = PostureAnalyzer()
suspicious = SuspiciousActivityDetector()

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/process")
async def process_frame(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if frame is None:
        return JSONResponse({"error": "Invalid frame"}, status_code=400)

    frame, keypoints = engine.process_frame(frame)
    saver.save_frame(keypoints)
    kp_dict = {k["name"]: k for k in keypoints}

    context   = classifier.classify(keypoints)
    stability = classifier.get_stability()
    motion    = classifier.get_motion_level(kp_dict)
    frames    = classifier.frame_counter

    fall_r  = fall_det.detect(keypoints, motion)
    ex_r    = exercise.analyze(keypoints, context)
    post_r  = posture.analyze(keypoints, context)
    susp_r  = suspicious.analyze(keypoints, motion)

    _, buffer = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
    frame_b64 = base64.b64encode(buffer).decode("utf-8")

    alerts = []
    if fall_r:
        alerts.append({"type": "danger", "text": "FALL DETECTED"})
    if post_r["status"] == "bad" and post_r["warning"]:
        alerts.append({"type": "warning", "text": post_r["warning"].upper()})
    if susp_r["suspicious"] and susp_r["alert"]:
        alerts.append({"type": "warning", "text": susp_r["alert"].upper()})

    return {
        "frame": frame_b64,
        "keypoints": keypoints,
        "context": context,
        "stability": stability,
        "motion": motion,
        "frames": frames,
        "exercise": ex_r["exercise"] if ex_r["active"] else "inactive",
        "reps": ex_r["reps"],
        "exercise_active": ex_r["active"],
        "alerts": alerts
    }

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=False)