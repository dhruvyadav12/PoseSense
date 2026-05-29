import cv2
import base64
import numpy as np
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
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

# Allow browser to talk to API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize all AI modules once
engine     = PoseEngine()
saver      = KeypointSaver()
classifier = ContextClassifier()
fall_det   = FallDetector()
exercise   = ExerciseAnalyzer()
posture    = PostureAnalyzer()
suspicious = SuspiciousActivityDetector()

# Global webcam
cap = None

@app.get("/")
async def root():
    with open("static/index.html", encoding="utf-8") as f:
        return HTMLResponse(f.read())

@app.get("/dashboard")
async def dashboard():
    with open("static/dashboard.html", encoding="utf-8") as f:
        return HTMLResponse(f.read())

@app.get("/start")
async def start_camera():
    global cap
    if cap is None or not cap.isOpened():
        cap = cv2.VideoCapture(0)
    return {"status": "started"}

@app.get("/stop")
async def stop_camera():
    global cap
    if cap and cap.isOpened():
        cap.release()
        cap = None
    return {"status": "stopped"}

@app.get("/frame")
async def get_frame():
    global cap
    if cap is None or not cap.isOpened():
        return JSONResponse({"error": "Camera not started"}, status_code=400)

    ret, frame = cap.read()
    if not ret:
        return JSONResponse({"error": "Frame read failed"}, status_code=500)

    # Run AI
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

    # Encode frame as base64 JPEG
    _, buffer = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
    frame_b64 = base64.b64encode(buffer).decode("utf-8")

    # Build alerts list
    alerts = []
    if fall_r:
        alerts.append({"type": "danger", "text": "FALL DETECTED"})
    if post_r["status"] == "bad" and post_r["warning"]:
        alerts.append({"type": "warning", "text": post_r["warning"].upper()})
    if susp_r["suspicious"] and susp_r["alert"]:
        alerts.append({"type": "warning", "text": susp_r["alert"].upper()})

    return {
        "frame": frame_b64,
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