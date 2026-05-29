import cv2
import streamlit as st
import numpy as np
import time
from core.pose_engine import PoseEngine
from utils.keypoint_saver import KeypointSaver
from modules.context_classifier import ContextClassifier
from modules.fall_detector import FallDetector
from modules.exercise_analyzer import ExerciseAnalyzer
from modules.posture_analyzer import PostureAnalyzer
from modules.suspicious_activity import SuspiciousActivityDetector

st.set_page_config(
    page_title="PoseSense AI",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600;700&family=Share+Tech+Mono&display=swap');

#MainMenu, footer, header {visibility: hidden;}

.stApp {
    background: #020408;
    font-family: 'Rajdhani', sans-serif;
    overflow-x: hidden;
}

/* ── Animated starfield background ── */
.stApp::before {
    content: '';
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background:
        radial-gradient(ellipse at 20% 50%, rgba(0,255,255,0.03) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 20%, rgba(123,47,255,0.04) 0%, transparent 60%),
        radial-gradient(ellipse at 60% 80%, rgba(0,100,255,0.03) 0%, transparent 60%);
    animation: bgPulse 8s ease-in-out infinite alternate;
    pointer-events: none;
    z-index: 0;
}

@keyframes bgPulse {
    0% { opacity: 0.5; }
    100% { opacity: 1; }
}

/* ── Scrolling grid ── */
.stApp::after {
    content: '';
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 200%;
    background-image:
        linear-gradient(rgba(0,255,255,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,255,255,0.025) 1px, transparent 1px);
    background-size: 40px 40px;
    animation: gridScroll 15s linear infinite;
    pointer-events: none;
    z-index: 0;
}

@keyframes gridScroll {
    0% { transform: translateY(0); }
    100% { transform: translateY(25%); }
}

/* ── Main title ── */
.hero-title {
    font-family: 'Orbitron', monospace;
    font-size: 4rem;
    font-weight: 900;
    text-align: center;
    background: linear-gradient(90deg,
        #00ffff 0%, #7b2fff 25%, #ff006e 50%, #7b2fff 75%, #00ffff 100%);
    background-size: 300% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: titleShimmer 4s linear infinite;
    filter: drop-shadow(0 0 20px rgba(0,255,255,0.3));
    letter-spacing: 8px;
}

@keyframes titleShimmer {
    0% { background-position: 0% center; }
    100% { background-position: 300% center; }
}

.hero-sub {
    text-align: center;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.75rem;
    color: rgba(0,255,255,0.35);
    letter-spacing: 6px;
    text-transform: uppercase;
    animation: subtitleFloat 4s ease-in-out infinite;
}

@keyframes subtitleFloat {
    0%, 100% { opacity: 0.35; transform: translateY(0); }
    50% { opacity: 0.6; transform: translateY(-2px); }
}

/* ── Ticker bar ── */
.ticker-wrap {
    background: linear-gradient(90deg,
        transparent, rgba(0,255,255,0.08), transparent);
    border-top: 1px solid rgba(0,255,255,0.15);
    border-bottom: 1px solid rgba(0,255,255,0.15);
    padding: 6px 0;
    margin: 12px 0;
    overflow: hidden;
    position: relative;
}

.ticker {
    display: inline-block;
    white-space: nowrap;
    animation: tickerScroll 20s linear infinite;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.7rem;
    color: rgba(0,255,255,0.5);
    letter-spacing: 3px;
}

@keyframes tickerScroll {
    0% { transform: translateX(100vw); }
    100% { transform: translateX(-100%); }
}

/* ── Stat card ── */
.stat-card {
    background: linear-gradient(135deg,
        rgba(0,255,255,0.04) 0%,
        rgba(0,0,20,0.8) 100%);
    border: 1px solid rgba(0,255,255,0.15);
    border-radius: 8px;
    padding: 14px 18px;
    margin: 6px 0;
    position: relative;
    overflow: hidden;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
    border-color: rgba(0,255,255,0.5);
    box-shadow: 0 0 20px rgba(0,255,255,0.1);
}

/* Animated top bar */
.stat-card::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 60%; height: 1px;
    background: linear-gradient(90deg, transparent, #00ffff, transparent);
    animation: cardScan 4s linear infinite;
}

@keyframes cardScan {
    0% { left: -60%; }
    100% { left: 160%; }
}

/* Corner decorations */
.stat-card::after {
    content: '';
    position: absolute;
    bottom: 0; right: 0;
    width: 12px; height: 12px;
    border-bottom: 1px solid rgba(0,255,255,0.4);
    border-right: 1px solid rgba(0,255,255,0.4);
}

.stat-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.65rem;
    color: rgba(0,255,255,0.4);
    letter-spacing: 4px;
    text-transform: uppercase;
    margin-bottom: 6px;
}

.stat-value {
    font-family: 'Orbitron', monospace;
    font-size: 1.3rem;
    font-weight: 700;
    animation: valueFloat 3s ease-in-out infinite;
}

@keyframes valueFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-2px); }
}

/* ── Big rep counter ── */
.rep-wrap {
    background: linear-gradient(135deg,
        rgba(123,47,255,0.08) 0%,
        rgba(0,0,20,0.8) 100%);
    border: 1px solid rgba(123,47,255,0.3);
    border-radius: 8px;
    padding: 14px 18px;
    margin: 6px 0;
    text-align: center;
    position: relative;
    overflow: hidden;
}

.rep-number {
    font-family: 'Orbitron', monospace;
    font-size: 4rem;
    font-weight: 900;
    color: #7b2fff;
    text-shadow:
        0 0 20px rgba(123,47,255,0.8),
        0 0 40px rgba(123,47,255,0.4),
        0 0 80px rgba(123,47,255,0.2);
    animation: repPulse 2s ease-in-out infinite;
    line-height: 1;
}

@keyframes repPulse {
    0%, 100% {
        text-shadow: 0 0 20px rgba(123,47,255,0.8), 0 0 40px rgba(123,47,255,0.4);
        transform: scale(1);
    }
    50% {
        text-shadow: 0 0 30px rgba(123,47,255,1), 0 0 60px rgba(123,47,255,0.6), 0 0 100px rgba(123,47,255,0.3);
        transform: scale(1.05);
    }
}

/* ── Alert cards ── */
.alert-clear {
    background: rgba(0,255,100,0.05);
    border: 1px solid rgba(0,255,100,0.25);
    border-radius: 8px;
    padding: 14px 18px;
    margin: 6px 0;
    animation: clearGlow 3s ease-in-out infinite;
}

@keyframes clearGlow {
    0%, 100% { box-shadow: 0 0 5px rgba(0,255,100,0.1); }
    50% { box-shadow: 0 0 15px rgba(0,255,100,0.2); }
}

.alert-danger {
    background: rgba(255,0,80,0.08);
    border: 1px solid rgba(255,0,80,0.6);
    border-radius: 8px;
    padding: 14px 18px;
    margin: 6px 0;
    animation: dangerFlash 0.8s ease-in-out infinite;
}

@keyframes dangerFlash {
    0%, 100% {
        border-color: rgba(255,0,80,0.6);
        box-shadow: 0 0 10px rgba(255,0,80,0.2);
        background: rgba(255,0,80,0.08);
    }
    50% {
        border-color: rgba(255,0,80,1);
        box-shadow: 0 0 30px rgba(255,0,80,0.5), inset 0 0 20px rgba(255,0,80,0.1);
        background: rgba(255,0,80,0.15);
    }
}

.alert-warn {
    background: rgba(255,165,0,0.06);
    border: 1px solid rgba(255,165,0,0.4);
    border-radius: 8px;
    padding: 14px 18px;
    margin: 6px 0;
    animation: warnPulse 1.5s ease-in-out infinite;
}

@keyframes warnPulse {
    0%, 100% { box-shadow: 0 0 8px rgba(255,165,0,0.2); }
    50% { box-shadow: 0 0 25px rgba(255,165,0,0.4); }
}

.alert-text {
    font-family: 'Orbitron', monospace;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 2px;
}

/* ── Section headers ── */
.sec-header {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.7rem;
    color: rgba(0,255,255,0.45);
    letter-spacing: 5px;
    text-transform: uppercase;
    padding: 8px 0 6px 0;
    margin: 14px 0 8px 0;
    border-bottom: 1px solid rgba(0,255,255,0.12);
    position: relative;
}

.sec-header::after {
    content: '';
    position: absolute;
    bottom: -1px; left: 0;
    width: 30px; height: 1px;
    background: #00ffff;
    animation: headerLine 3s ease-in-out infinite;
}

@keyframes headerLine {
    0%, 100% { width: 30px; }
    50% { width: 80px; }
}

/* ── Offline placeholder ── */
.offline-box {
    background: linear-gradient(135deg,
        rgba(0,255,255,0.02) 0%,
        rgba(0,0,0,0.5) 100%);
    border: 1px dashed rgba(0,255,255,0.15);
    border-radius: 12px;
    min-height: 420px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
}

.sonar {
    position: relative;
    width: 100px; height: 100px;
    display: flex; align-items: center; justify-content: center;
}

.sonar-ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(0,255,255,0.4);
    animation: sonarExpand 2s ease-out infinite;
}

.sonar-ring:nth-child(1) { width: 30px; height: 30px; animation-delay: 0s; }
.sonar-ring:nth-child(2) { width: 60px; height: 60px; animation-delay: 0.5s; }
.sonar-ring:nth-child(3) { width: 90px; height: 90px; animation-delay: 1s; }

@keyframes sonarExpand {
    0% { opacity: 0.8; transform: scale(0.8); }
    100% { opacity: 0; transform: scale(1.3); }
}

.sonar-dot {
    width: 8px; height: 8px;
    background: #00ffff;
    border-radius: 50%;
    box-shadow: 0 0 10px #00ffff;
    animation: dotBlink 1s ease-in-out infinite;
    z-index: 1;
}

@keyframes dotBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
}

/* ── Sidebar ── */
[data-testid="stSidebar"] {
    background: linear-gradient(180deg, #020408 0%, #040810 100%) !important;
    border-right: 1px solid rgba(0,255,255,0.1) !important;
}

[data-testid="stSidebar"] * {
    color: rgba(0,255,255,0.8) !important;
}

.status-line {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.75rem;
    letter-spacing: 2px;
    padding: 8px 12px;
    border-radius: 4px;
    margin: 4px 0;
}

.status-online {
    background: rgba(0,255,100,0.08);
    border: 1px solid rgba(0,255,100,0.3);
    color: #00ff64 !important;
    animation: onlinePulse 2s ease-in-out infinite;
}

@keyframes onlinePulse {
    0%, 100% { box-shadow: 0 0 5px rgba(0,255,100,0.2); }
    50% { box-shadow: 0 0 15px rgba(0,255,100,0.4); }
}

.status-offline {
    background: rgba(255,0,80,0.08);
    border: 1px solid rgba(255,0,80,0.3);
    color: #ff0050 !important;
}

/* ── Floating bar chart (decorative) ── */
.bar-chart {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: 30px;
    margin: 4px 0;
}

.bar {
    width: 4px;
    background: linear-gradient(180deg, #00ffff, rgba(0,255,255,0.2));
    border-radius: 2px 2px 0 0;
    animation: barFloat var(--dur) ease-in-out infinite alternate;
}

@keyframes barFloat {
    0% { height: var(--min-h); opacity: 0.4; }
    100% { height: var(--max-h); opacity: 1; }
}
</style>
""", unsafe_allow_html=True)

# ── HERO ───────────────────────────────────────────────────────────────
st.markdown('<h1 class="hero-title">POSESENSE</h1>', unsafe_allow_html=True)
st.markdown('<p class="hero-sub">⬡ Neural Behavior Intelligence System v3.0 ⬡</p>', unsafe_allow_html=True)

# ── TICKER ─────────────────────────────────────────────────────────────
st.markdown("""
<div class="ticker-wrap">
  <span class="ticker">
    ◈ MEDIAPIPE POSE ENGINE ACTIVE &nbsp;&nbsp;&nbsp;
    ◈ 33 KEYPOINT TRACKING &nbsp;&nbsp;&nbsp;
    ◈ CONTEXT CLASSIFICATION ONLINE &nbsp;&nbsp;&nbsp;
    ◈ FALL DETECTION ARMED &nbsp;&nbsp;&nbsp;
    ◈ EXERCISE ANALYSIS READY &nbsp;&nbsp;&nbsp;
    ◈ POSTURE MONITORING ACTIVE &nbsp;&nbsp;&nbsp;
    ◈ SUSPICIOUS ACTIVITY SCANNER ONLINE &nbsp;&nbsp;&nbsp;
    ◈ REAL-TIME BEHAVIORAL AI &nbsp;&nbsp;&nbsp;
  </span>
</div>
""", unsafe_allow_html=True)

# ── SIDEBAR ────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown('<div style="font-family:Orbitron,monospace;font-size:0.85rem;color:#00ffff;letter-spacing:4px;padding:8px 0;">🎛 CONTROL CENTER</div>', unsafe_allow_html=True)
    run = st.toggle("▶ ACTIVATE CAMERA", value=False)

    st.markdown("---")
    st.markdown('<div style="font-family:Share Tech Mono,monospace;font-size:0.7rem;color:rgba(0,255,255,0.5);letter-spacing:4px;">⚡ MODULES</div>', unsafe_allow_html=True)
    show_exercise  = st.checkbox("🏋️ Exercise Analyzer",  value=True)
    show_posture   = st.checkbox("🪑 Posture Analyzer",   value=True)
    show_fall      = st.checkbox("⚠️ Fall Detector",      value=True)
    show_suspicious= st.checkbox("👁️ Suspicious Activity",value=True)

    st.markdown("---")
    if run:
        st.markdown('<div class="status-line status-online">● CAMERA ONLINE</div>', unsafe_allow_html=True)
    else:
        st.markdown('<div class="status-line status-offline">● CAMERA OFFLINE</div>', unsafe_allow_html=True)

    # Decorative animated bars
    st.markdown("""
    <div style="margin-top:20px;">
      <div style="font-family:Share Tech Mono,monospace;font-size:0.6rem;color:rgba(0,255,255,0.3);letter-spacing:3px;margin-bottom:6px;">SIGNAL</div>
      <div class="bar-chart">
        <div class="bar" style="--dur:0.6s;--min-h:4px;--max-h:22px;"></div>
        <div class="bar" style="--dur:0.8s;--min-h:8px;--max-h:28px;"></div>
        <div class="bar" style="--dur:0.5s;--min-h:5px;--max-h:18px;"></div>
        <div class="bar" style="--dur:1.1s;--min-h:10px;--max-h:30px;"></div>
        <div class="bar" style="--dur:0.7s;--min-h:3px;--max-h:20px;"></div>
        <div class="bar" style="--dur:0.9s;--min-h:7px;--max-h:26px;"></div>
        <div class="bar" style="--dur:0.6s;--min-h:4px;--max-h:16px;"></div>
        <div class="bar" style="--dur:1.2s;--min-h:9px;--max-h:28px;"></div>
        <div class="bar" style="--dur:0.8s;--min-h:5px;--max-h:22px;"></div>
        <div class="bar" style="--dur:0.5s;--min-h:11px;--max-h:30px;"></div>
        <div class="bar" style="--dur:0.7s;--min-h:6px;--max-h:18px;"></div>
        <div class="bar" style="--dur:1.0s;--min-h:3px;--max-h:24px;"></div>
      </div>
    </div>

    <div style="margin-top:16px;">
      <div style="font-family:Share Tech Mono,monospace;font-size:0.6rem;color:rgba(123,47,255,0.4);letter-spacing:3px;margin-bottom:6px;">NEURAL LOAD</div>
      <div class="bar-chart">
        <div class="bar" style="--dur:1.3s;--min-h:6px;--max-h:20px;background:linear-gradient(180deg,#7b2fff,rgba(123,47,255,0.2));"></div>
        <div class="bar" style="--dur:0.9s;--min-h:10px;--max-h:28px;background:linear-gradient(180deg,#7b2fff,rgba(123,47,255,0.2));"></div>
        <div class="bar" style="--dur:0.7s;--min-h:4px;--max-h:16px;background:linear-gradient(180deg,#7b2fff,rgba(123,47,255,0.2));"></div>
        <div class="bar" style="--dur:1.1s;--min-h:8px;--max-h:26px;background:linear-gradient(180deg,#7b2fff,rgba(123,47,255,0.2));"></div>
        <div class="bar" style="--dur:0.6s;--min-h:12px;--max-h:30px;background:linear-gradient(180deg,#7b2fff,rgba(123,47,255,0.2));"></div>
        <div class="bar" style="--dur:0.8s;--min-h:5px;--max-h:22px;background:linear-gradient(180deg,#7b2fff,rgba(123,47,255,0.2));"></div>
        <div class="bar" style="--dur:1.0s;--min-h:9px;--max-h:24px;background:linear-gradient(180deg,#7b2fff,rgba(123,47,255,0.2));"></div>
        <div class="bar" style="--dur:0.5s;--min-h:3px;--max-h:18px;background:linear-gradient(180deg,#7b2fff,rgba(123,47,255,0.2));"></div>
        <div class="bar" style="--dur:0.7s;--min-h:7px;--max-h:28px;background:linear-gradient(180deg,#7b2fff,rgba(123,47,255,0.2));"></div>
        <div class="bar" style="--dur:1.2s;--min-h:11px;--max-h:30px;background:linear-gradient(180deg,#7b2fff,rgba(123,47,255,0.2));"></div>
        <div class="bar" style="--dur:0.9s;--min-h:4px;--max-h:20px;background:linear-gradient(180deg,#7b2fff,rgba(123,47,255,0.2));"></div>
        <div class="bar" style="--dur:0.6s;--min-h:8px;--max-h:26px;background:linear-gradient(180deg,#7b2fff,rgba(123,47,255,0.2));"></div>
      </div>
    </div>
    """, unsafe_allow_html=True)

# ── LAYOUT ─────────────────────────────────────────────────────────────
col1, col2 = st.columns([2, 1])

with col1:
    st.markdown('<div class="sec-header">◈ LIVE NEURAL FEED</div>', unsafe_allow_html=True)
    video_placeholder = st.empty()

with col2:
    st.markdown('<div class="sec-header">◈ INTELLIGENCE PANEL</div>', unsafe_allow_html=True)
    ctx_ph    = st.empty()
    stab_ph   = st.empty()
    mot_ph    = st.empty()
    frame_ph  = st.empty()

    st.markdown('<div class="sec-header">◈ EXERCISE TRACKER</div>', unsafe_allow_html=True)
    ex_ph     = st.empty()
    rep_ph    = st.empty()

    st.markdown('<div class="sec-header">◈ THREAT MONITOR</div>', unsafe_allow_html=True)
    alert_ph  = st.empty()

# ── SESSION STATE ──────────────────────────────────────────────────────
if "engine" not in st.session_state:
    st.session_state.engine     = PoseEngine()
    st.session_state.saver      = KeypointSaver()
    st.session_state.classifier = ContextClassifier()
    st.session_state.fall       = FallDetector()
    st.session_state.exercise   = ExerciseAnalyzer()
    st.session_state.posture    = PostureAnalyzer()
    st.session_state.suspicious = SuspiciousActivityDetector()

# ── HELPERS ────────────────────────────────────────────────────────────
def stat_card(label, value, color="#00ffff"):
    return f"""
    <div class="stat-card">
        <div class="stat-label">{label}</div>
        <div class="stat-value" style="color:{color};
             text-shadow:0 0 12px {color}99;">
            {value}
        </div>
    </div>"""

def rep_card(n):
    return f"""
    <div class="rep-wrap">
        <div class="stat-label">REPETITIONS</div>
        <div class="rep-number">{n}</div>
    </div>"""

# ── OFFLINE ────────────────────────────────────────────────────────────
if not run:
    video_placeholder.markdown("""
    <div class="offline-box">
        <div class="sonar">
            <div class="sonar-ring"></div>
            <div class="sonar-ring"></div>
            <div class="sonar-ring"></div>
            <div class="sonar-dot"></div>
        </div>
        <div style="font-family:'Orbitron',monospace;color:rgba(0,255,255,0.35);
                    font-size:0.85rem;letter-spacing:5px;text-align:center;">
            AWAITING ACTIVATION
        </div>
        <div style="font-family:'Share Tech Mono',monospace;color:rgba(0,255,255,0.2);
                    font-size:0.65rem;letter-spacing:3px;">
            ▸ TOGGLE CAMERA IN SIDEBAR
        </div>
    </div>
    """, unsafe_allow_html=True)

    ctx_ph.markdown(stat_card("CONTEXT",   "OFFLINE", "#ff0050"), unsafe_allow_html=True)
    stab_ph.markdown(stat_card("STABILITY", "——"),                unsafe_allow_html=True)
    mot_ph.markdown(stat_card("MOTION",    "——"),                 unsafe_allow_html=True)
    frame_ph.markdown(stat_card("FRAMES",  "——"),                 unsafe_allow_html=True)
    ex_ph.markdown(stat_card("EXERCISE",   "——", "#7b2fff"),      unsafe_allow_html=True)
    rep_ph.markdown(rep_card("—"),                                unsafe_allow_html=True)
    alert_ph.markdown("""
    <div class="alert-clear">
        <span class="alert-text" style="color:rgba(0,255,100,0.5);">
            ◉ SYSTEM STANDBY
        </span>
    </div>""", unsafe_allow_html=True)

# ── LIVE LOOP ──────────────────────────────────────────────────────────
else:
    cap = cv2.VideoCapture(0)

    while run:
        ret, frame = cap.read()
        if not ret:
            st.error("Cannot access webcam.")
            break

        frame, keypoints = st.session_state.engine.process_frame(frame)
        st.session_state.saver.save_frame(keypoints)
        kp_dict = {k["name"]: k for k in keypoints}

        context   = st.session_state.classifier.classify(keypoints)
        stability = st.session_state.classifier.get_stability()
        motion    = st.session_state.classifier.get_motion_level(kp_dict)
        frames    = st.session_state.classifier.frame_counter

        fall_r  = False
        ex_r    = {"active": False, "exercise": "none", "reps": 0}
        post_r  = {"active": False, "status": "ok",    "warning": None}
        susp_r  = {"suspicious": False, "alert": None}

        if show_fall:       fall_r = st.session_state.fall.detect(keypoints, motion)
        if show_exercise:   ex_r   = st.session_state.exercise.analyze(keypoints, context)
        if show_posture:    post_r = st.session_state.posture.analyze(keypoints, context)
        if show_suspicious: susp_r = st.session_state.suspicious.analyze(keypoints, motion)

        # Video
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        video_placeholder.image(frame_rgb, channels="RGB", use_container_width=True)

        # Colors
        ctx_color  = {"gym":"#00ff64","office":"#00ffff","home":"#7b2fff",
                      "active":"#ffa500","standing":"#00ffff","unknown":"#ff0050"}.get(context,"#00ffff")
        stab_color = {"High":"#00ff64","Medium":"#ffa500","Low":"#ff0050"}.get(stability,"#00ffff")
        mot_color  = {"High":"#ff0050","Medium":"#ffa500","Low":"#00ff64"}.get(motion,"#00ffff")

        ctx_ph.markdown(stat_card("CONTEXT",   context.upper(),   ctx_color),  unsafe_allow_html=True)
        stab_ph.markdown(stat_card("STABILITY", stability.upper(), stab_color), unsafe_allow_html=True)
        mot_ph.markdown(stat_card("MOTION",    motion.upper(),    mot_color),  unsafe_allow_html=True)
        frame_ph.markdown(stat_card("FRAMES",  str(frames)),                   unsafe_allow_html=True)

        if ex_r["active"]:
            ex_ph.markdown(stat_card("EXERCISE", ex_r["exercise"].upper(), "#7b2fff"), unsafe_allow_html=True)
            rep_ph.markdown(rep_card(ex_r["reps"]), unsafe_allow_html=True)
        else:
            ex_ph.markdown(stat_card("EXERCISE", "INACTIVE", "#7b2fff"), unsafe_allow_html=True)
            rep_ph.markdown(rep_card("—"), unsafe_allow_html=True)

        # Alerts
        html = ""
        if fall_r:
            html += '<div class="alert-danger"><span class="alert-text" style="color:#ff0050;">⚠ FALL DETECTED</span></div>'
        if post_r["status"] == "bad" and post_r["warning"]:
            html += f'<div class="alert-warn"><span class="alert-text" style="color:#ffa500;">⚠ {post_r["warning"].upper()}</span></div>'
        if susp_r["suspicious"] and susp_r["alert"]:
            html += f'<div class="alert-warn"><span class="alert-text" style="color:#ffa500;">👁 {susp_r["alert"].upper()}</span></div>'
        if not html:
            html = '<div class="alert-clear"><span class="alert-text" style="color:#00ff64;">✓ ALL SYSTEMS CLEAR</span></div>'

        alert_ph.markdown(html, unsafe_allow_html=True)

    cap.release()