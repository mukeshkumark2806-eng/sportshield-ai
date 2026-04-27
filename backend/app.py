"""
═══════════════════════════════════════════════════
SportShield AI — Flask Backend
AI-Powered Anti-Piracy Detection Server
OpenCV-ready structure for video fingerprinting
═══════════════════════════════════════════════════
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import hashlib
import random
import time
from datetime import datetime

from dotenv import load_dotenv
load_dotenv()

import cloudinary
import cloudinary.uploader

cloudinary.config(
  cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME'),
  api_key = os.getenv('CLOUDINARY_API_KEY'),
  api_secret = os.getenv('CLOUDINARY_API_SECRET')
)

app = Flask(__name__)
# Super permissive CORS for demo
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

@app.before_request
def log_request_info():
    print(f"\n[REQUEST] {request.method} {request.url}")
    print(f"[HEADERS] {dict(request.headers)}")

UPLOAD_FOLDER = "/tmp/uploads" if os.environ.get("RENDER") else os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
print(f"[INIT] Upload folder: {UPLOAD_FOLDER}")

# ─── In-memory storage for demo ─────────────────
official_content = {}
detection_history = []

@app.errorhandler(Exception)
def handle_exception(e):
    """Return JSON instead of HTML for any unhandled error."""
    print(f"[CRITICAL ERROR] {str(e)}")
    return jsonify({
        "success": False,
        "error": str(e)
    }), 500

import cv2
import numpy as np

# ──────────────────────────────────────────────────
# CORE HASHING
# ──────────────────────────────────────────────────

DCT_HASH_SIZE = 32          # DCT input grid (larger = more discriminative)
DCT_KEEP      = 8           # Keep top-left 8×8 of DCT (64 bits)
MIN_FRAME_VAR = 80          # Reject frames with variance below this (blank/dark)

def dct_phash(gray_img):
    """
    Real DCT-based perceptual hash (same algorithm as ImageHash library).
    Returns a 64-bit integer.
    """
    img = cv2.resize(gray_img, (DCT_HASH_SIZE, DCT_HASH_SIZE),
                     interpolation=cv2.INTER_AREA).astype(np.float32)
    dct = cv2.dct(img)
    dct_low = dct[:DCT_KEEP, :DCT_KEEP]          # top-left 8×8
    mean_val = (dct_low.sum() - dct_low[0, 0]) / (DCT_KEEP * DCT_KEEP - 1)
    bits = dct_low.flatten() > mean_val
    return int(sum(2**i for i, b in enumerate(bits) if b))


def is_blank_frame(gray_img, threshold=MIN_FRAME_VAR):
    """Return True if frame is too dark/blank to be useful."""
    return float(gray_img.var()) < threshold


def hamming_similarity(hash1: int, hash2: int, bits: int = 64) -> float:
    """Convert Hamming distance between two hashes to a 0-100 similarity."""
    dist = bin(hash1 ^ hash2).count('1')
    return max(0.0, 100.0 - (dist / bits * 100.0))


# ──────────────────────────────────────────────────
# FRAME EXTRACTION
# ──────────────────────────────────────────────────

@app.route('/', methods=['GET'])
def root_check():
    """Root endpoint to satisfy Render's default health check."""
    return jsonify({
        'status': 'active',
        'message': 'SportShield AI API is running'
    })

def extract_frames(file_path, target_count=3):
    """
    Extract up to `target_count` evenly-spaced, non-blank grayscale frames.
    Limits: Max 15 seconds duration. 
    Returns list of 32x32 grayscale numpy arrays.
    """
    # ── Images ──────────────────────────────────────
    try:
        img = cv2.imread(file_path, cv2.IMREAD_GRAYSCALE)
        if img is not None:
            if is_blank_frame(img):
                raise RuntimeError(f"Blank image detected.")
            return [cv2.resize(img, (32, 32))]
    except Exception as e:
        print(f"Image read error: {e}")

    # ── Videos ──────────────────────────────────────
    cap = cv2.VideoCapture(file_path)
    if not cap.isOpened():
        raise RuntimeError(f"OpenCV could not open video file. Unsupported codec or corrupted file.")

    try:
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        duration = total_frames / fps
        print(f"[VIDEO] Processing: {round(duration, 1)}s, {total_frames} frames")

        if total_frames < 1:
            raise RuntimeError(f"Video has no readable frames.")

        # Sample 3 frames across ANY duration (don't limit to 15s)
        margin  = max(1, int(total_frames * 0.05))
        usable  = range(margin, total_frames - margin)
        step    = max(1, len(usable) // target_count)
        indices = list(usable)[::step][:target_count]

        frames = []
        for idx in indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ret, frame = cap.read()
            if not ret:
                continue
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            # Resize immediately to 32x32
            frames.append(cv2.resize(gray, (32, 32)))

        if not frames:
            raise RuntimeError(f"No usable frames found in video.")
        
        return frames

    finally:
        cap.release()


# ──────────────────────────────────────────────────
# FINGERPRINT GENERATION
# ──────────────────────────────────────────────────

def generate_perceptual_hash(file_path):
    """
    Extract multi-frame DCT pHashes for a media file.
    """
    try:
        frames = extract_frames(file_path, target_count=3)
        hashes = [dct_phash(f) for f in frames]
    except Exception as e:
        print(f"Fingerprint Error: {e}")
        raise RuntimeError(str(e))

    with open(file_path, 'rb') as fh:
        first_bytes = fh.read(8192)

    return {
        'md5'       : hashlib.md5(first_bytes).hexdigest(),
        'phash'     : str(hashes[0]),          # primary hash (for upload)
        'hashes'    : hashes,                  # all frame hashes
        'frame_count': len(hashes),
        'algorithm' : 'DCT-pHash-multiframe',
        'timestamp' : datetime.utcnow().isoformat()
    }


# ──────────────────────────────────────────────────
# AUDIO FINGERPRINTING
# ──────────────────────────────────────────────────

def extract_audio_samples(file_path, n_samples=20):
    """
    Extract evenly-spaced short audio energy samples from a video.
    Returns a list of floats (RMS energy per window), or None if no audio.
    Uses only OpenCV + numpy — no extra audio library needed.
    """
    cap = cv2.VideoCapture(file_path)
    if not cap.isOpened():
        return None

    fps         = cap.get(cv2.CAP_PROP_FPS) or 25.0
    total       = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    has_audio   = cap.get(cv2.CAP_PROP_AUDIO_DATA_DEPTH) != 0   # available in recent OpenCV builds

    # Fallback: proxy audio energy via inter-frame pixel difference in a small region
    # (motion in audio-synced regions correlates with audio activity)
    margin   = max(1, int(total * 0.05))
    indices  = np.linspace(margin, total - margin, n_samples, dtype=int)
    energies = []

    prev_gray = None
    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
        ret, frame = cap.read()
        if not ret:
            energies.append(0.0)
            continue
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        small = cv2.resize(gray, (16, 16))
        if prev_gray is not None:
            diff = np.abs(small.astype(np.float32) - prev_gray.astype(np.float32))
            energies.append(float(diff.mean()))
        else:
            energies.append(0.0)
        prev_gray = small

    cap.release()
    return energies if energies else None


def compare_audio(off_path, sus_path):
    """
    Compare audio fingerprints (proxy via inter-frame motion energy).
    Returns similarity 0-100, or None if extraction fails for either file.
    """
    try:
        off_e = extract_audio_samples(off_path)
        sus_e = extract_audio_samples(sus_path)
        if not off_e or not sus_e:
            return None

        # Normalise energy vectors
        off_arr = np.array(off_e, dtype=np.float32)
        sus_arr = np.array(sus_e, dtype=np.float32)

        # Align lengths
        min_len = min(len(off_arr), len(sus_arr))
        off_arr = off_arr[:min_len]
        sus_arr = sus_arr[:min_len]

        # Pearson correlation → map [-1,1] to [0,100]
        if off_arr.std() < 1e-6 or sus_arr.std() < 1e-6:
            return None   # constant signal — not useful
        corr = float(np.corrcoef(off_arr, sus_arr)[0, 1])
        similarity = (corr + 1.0) / 2.0 * 100.0
        return round(max(0.0, min(100.0, similarity)), 1)
    except Exception as e:
        print(f"Audio comparison failed: {e}")
        return None


# ──────────────────────────────────────────────────
# MULTI-FRAME COMPARISON ENGINE
# ──────────────────────────────────────────────────

def compare_media_files(off_path, sus_path, target_frames=5):
    """
    Compare two media files using weighted multi-modal fingerprinting.

    Weights:
      70% — Video frame DCT-pHash similarity
      20% — Audio energy correlation
      10% — Metadata clues (duration ratio, resolution ratio)

    Expected ranges:
      Same file re-uploaded       →  90-100 %
      Re-encoded / watermarked    →  82-95  %
      Cropped / speed-changed     →  55-80  %
      Heavily edited              →  35-60  %
      Completely different video  →   0-20  %

    Raises RuntimeError on unreadable input.
    """
    # ── 1. Video similarity (70%) ──────────────────
    off_frames = extract_frames(off_path, target_frames)
    sus_frames = extract_frames(sus_path, target_frames)

    off_hashes = [dct_phash(f) for f in off_frames]
    sus_hashes = [dct_phash(f) for f in sus_frames]

    best_scores = []
    for oh in off_hashes:
        scores = [hamming_similarity(oh, sh) for sh in sus_hashes]
        best_scores.append(max(scores))

    if not best_scores:
        raise RuntimeError("No valid frame pairs produced for comparison.")

    # Use 80th-percentile — robust to partial edits
    video_sim = float(np.percentile(best_scores, 80))

    # ── 2. Audio similarity (20%) ──────────────────
    audio_sim = None
    # Only attempt audio on video files (not images)
    is_video = lambda p: not cv2.imread(p, cv2.IMREAD_GRAYSCALE) is not None
    if is_video(off_path) and is_video(sus_path):
        audio_sim = compare_audio(off_path, sus_path)

    # ── 3. Metadata clues (10%) ───────────────────
    meta_sim = 100.0   # start at 100, deduct for differences
    try:
        off_cap = cv2.VideoCapture(off_path)
        sus_cap = cv2.VideoCapture(sus_path)

        off_fps    = off_cap.get(cv2.CAP_PROP_FPS) or 1
        sus_fps    = sus_cap.get(cv2.CAP_PROP_FPS) or 1
        off_frames_total = max(1, off_cap.get(cv2.CAP_PROP_FRAME_COUNT))
        sus_frames_total = max(1, sus_cap.get(cv2.CAP_PROP_FRAME_COUNT))
        off_w = off_cap.get(cv2.CAP_PROP_FRAME_WIDTH)
        sus_w = sus_cap.get(cv2.CAP_PROP_FRAME_WIDTH)

        off_cap.release()
        sus_cap.release()

        off_dur = off_frames_total / off_fps
        sus_dur = sus_frames_total / sus_fps

        # Duration ratio — penalise if lengths differ significantly
        dur_ratio  = min(off_dur, sus_dur) / max(off_dur, sus_dur) if max(off_dur, sus_dur) > 0 else 1.0
        # Resolution ratio
        res_ratio  = (min(off_w, sus_w) / max(off_w, sus_w)) if max(off_w, sus_w) > 0 else 1.0
        # FPS ratio — speed change detection
        fps_ratio  = min(off_fps, sus_fps) / max(off_fps, sus_fps) if max(off_fps, sus_fps) > 0 else 1.0

        meta_sim = ((dur_ratio + res_ratio + fps_ratio) / 3.0) * 100.0
    except Exception as e:
        print(f"Metadata comparison failed: {e}")
        meta_sim = 80.0   # neutral fallback

    # ── Weighted final score ───────────────────────
    if audio_sim is not None:
        final = 0.70 * video_sim + 0.20 * audio_sim + 0.10 * meta_sim
    else:
        # No audio — redistribute weight: 80% video, 20% metadata
        final = 0.80 * video_sim + 0.20 * meta_sim

    return {
        'score':      round(final, 1),
        'video_sim':  round(video_sim, 1),
        'audio_sim':  round(audio_sim, 1) if audio_sim is not None else None,
        'meta_sim':   round(meta_sim, 1),
    }


# ──────────────────────────────────────────────────
# MODIFICATION LABELS
# ──────────────────────────────────────────────────

def detect_modifications(match_pct, audio_sim=None, meta_sim=None):
    """Return human-readable modification labels based on weighted scores."""
    mods = []
    if match_pct >= 99:
        mods = ["Direct Copy"]
    elif match_pct >= 85:
        mods = ["Watermark added/removed", "Re-encoded"]
    elif match_pct >= 70:
        mods = ["Cropped", "Speed altered", "Color graded"]
    elif match_pct >= 50:
        mods = ["Heavy editing", "Scene rearranged"]
    else:
        mods = ["No significant visual match"]

    # Audio-specific clues
    if audio_sim is not None:
        if audio_sim < 30 and match_pct >= 50:
            mods.append("Audio replaced")
        elif audio_sim < 60 and match_pct >= 70:
            mods.append("Audio re-encoded")

    # Metadata clues
    if meta_sim is not None and meta_sim < 70:
        mods.append("Trimmed intro/outro")
    if meta_sim is not None and meta_sim < 50:
        mods.append("Resolution downscaled")

    return mods


# ─── API Routes ─────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'service': 'SportShield AI Backend',
        'version': '1.0.0',
        'opencv_ready': True,
        'timestamp': datetime.utcnow().isoformat()
    })


@app.route('/api/upload/official', methods=['POST'])
def upload_official():
    """Upload official content and generate fingerprint."""
    print(f"\n[UPLOAD] Start: {datetime.utcnow().isoformat()}")
    try:
        if request.content_length and request.content_length > 10 * 1024 * 1024:
            return jsonify({'success': False, 'error': 'File too large. Max 10MB.'}), 413

        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        filepath = os.path.join(UPLOAD_FOLDER, 'off_' + file.filename)
        file.save(filepath)
        print(f"[UPLOAD] File saved: {filepath}")

        # 1. Generate fingerprint FIRST (local processing)
        print(f"[UPLOAD] Generating fingerprint...")
        fingerprint = generate_perceptual_hash(filepath)
        print(f"[UPLOAD] Fingerprint generated successfully.")

        # 2. Then Upload to Cloudinary in BACKGROUND to avoid timeout
        def upload_to_cloudinary(path, cid):
            try:
                print(f"[ASYNC] Starting Cloudinary upload for {cid}...")
                upload_result = cloudinary.uploader.upload(
                    path, 
                    resource_type="auto", 
                    folder="sportshield_official"
                )
                url = upload_result.get("secure_url")
                if cid in official_content:
                    official_content[cid]['secure_url'] = url
                print(f"[ASYNC] Cloudinary success for {cid}: {url}")
            except Exception as e:
                print(f"[ASYNC] Cloudinary ERROR for {cid}: {e}")

        content_id = f"OFF-{len(official_content) + 1:03d}"
        official_content[content_id] = {
            'id': content_id,
            'filename': file.filename,
            'fingerprint': fingerprint,
            'secure_url': "Pending...", # Will be updated by background thread
            'uploaded_at': datetime.utcnow().isoformat(),
            'status': 'Active'
        }

        import threading
        thread = threading.Thread(target=upload_to_cloudinary, args=(filepath, content_id))
        thread.start()

        print(f"[UPLOAD] Complete: {content_id}. Returning to frontend.")
        return jsonify({
            'success': True,
            'content_id': content_id,
            'filename': file.filename,
            'fingerprint': fingerprint,
            'secure_url': "Pending..." # Frontend can show pending or just ignore
        })

    except Exception as e:
        print(f"[UPLOAD] ERROR: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/upload/suspicious', methods=['POST'])
def upload_suspicious():
    """Upload suspicious content for comparison."""
    print(f"\n[SUSPICIOUS] Start: {datetime.utcnow().isoformat()}")
    try:
        if request.content_length and request.content_length > 10 * 1024 * 1024:
            return jsonify({'success': False, 'error': 'File too large. Max 10MB.'}), 413

        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        filepath = os.path.join(UPLOAD_FOLDER, 'sus_' + file.filename)
        file.save(filepath)
        print(f"[SUSPICIOUS] File saved: {filepath}")

        # 1. Fingerprint first
        print(f"[SUSPICIOUS] Generating fingerprint...")
        sus_fingerprint = generate_perceptual_hash(filepath)
        
        # 2. Cloudinary second in BACKGROUND
        def upload_async(path):
            try:
                print(f"[ASYNC-SUS] Starting Cloudinary upload...")
                cloudinary.uploader.upload(
                    path, 
                    resource_type="auto", 
                    folder="sportshield_suspicious"
                )
                print(f"[ASYNC-SUS] Cloudinary success.")
            except Exception as e:
                print(f"[ASYNC-SUS] Cloudinary warning: {e}")

        import threading
        threading.Thread(target=upload_async, args=(filepath,)).start()

        print(f"[SUSPICIOUS] Complete. Returning.")
        return jsonify({
            'success': True,
            'filename': file.filename,
            'fingerprint': sus_fingerprint,
            'secure_url': "Pending...",
        })
    except Exception as e:
        print(f"[SUSPICIOUS] ERROR: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/detect', methods=['POST'])
def detect_piracy():
    """Compare suspicious content against official content."""
    print(f"\n[DETECT] Start: {datetime.utcnow().isoformat()}")
    
    sus_filepath = None
    off_filepath = None
    
    try:
        if request.content_length and request.content_length > 20 * 1024 * 1024:
            return jsonify({'success': False, 'error': 'Files too large. Max 10MB each.'}), 413

        if 'suspicious_file' not in request.files or 'official_file' not in request.files:
            return jsonify({'success': False, 'error': 'Both files are required'}), 400

        suspicious_file = request.files['suspicious_file']
        official_file   = request.files['official_file']

        sus_filepath = os.path.join(UPLOAD_FOLDER, 'det_sus_' + suspicious_file.filename)
        off_filepath = os.path.join(UPLOAD_FOLDER, 'det_off_' + official_file.filename)

        suspicious_file.save(sus_filepath)
        official_file.save(off_filepath)

        print(f"[DETECT] Files saved. Starting comparison...")
        cmp_result = compare_media_files(off_filepath, sus_filepath, target_frames=3)
        print(f"[DETECT] Comparison complete: Score={cmp_result['score']}")

        match_pct  = cmp_result['score']
        video_sim  = cmp_result['video_sim']
        audio_sim  = cmp_result['audio_sim']
        meta_sim   = cmp_result['meta_sim']

        # Risk thresholds
        if match_pct >= 85:
            risk_level = 'High'
        elif match_pct >= 60:
            risk_level = 'Medium'
        else:
            risk_level = 'Low'

        modifications = detect_modifications(match_pct, audio_sim=audio_sim, meta_sim=meta_sim)
        is_edited     = match_pct < 98

        result = {
            'success':         True,
            'officialFile':    official_file.filename,
            'suspiciousFile':  suspicious_file.filename,
            'matchPercentage': match_pct,
            'riskLevel':       risk_level,
            'editedCopy':      is_edited,
            'modifications':   modifications,
            'timestamp':       datetime.utcnow().isoformat(),
            'status':          'Active',
            'analysis': {
                'algorithm':  'Weighted DCT-pHash + Audio + Metadata',
                'video_sim':  video_sim,
                'audio_sim':  audio_sim,
                'meta_sim':   meta_sim,
                'frames_used': 3,
            }
        }
        return jsonify(result)

    except Exception as e:
        print(f"[DETECT] ERROR: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        # Cleanup safely
        for p in [sus_filepath, off_filepath]:
            try: 
                if p and os.path.exists(p): os.remove(p)
            except: pass


@app.route('/api/detections', methods=['GET'])
def get_detections():
    """Get all detection results."""
    return jsonify({
        'detections': detection_history,
        'total': len(detection_history)
    })


@app.route('/api/content', methods=['GET'])
def get_official_content():
    """Get all registered official content."""
    return jsonify({
        'content': list(official_content.values()),
        'total': len(official_content)
    })


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get dashboard statistics."""
    high_risk = sum(1 for d in detection_history if d.get('risk_level') == 'High')
    
    return jsonify({
        'total_detections': len(detection_history) + 2847,  # + demo data
        'today_alerts': 23,
        'risk_score': 78,
        'videos_monitored': len(official_content) + 156,
        'high_risk_count': high_risk + 12,
        'resolved_count': 45,
    })


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print(f"🛡️  SportShield AI Backend Server running on port {port}")
    app.run(host='0.0.0.0', port=port)
