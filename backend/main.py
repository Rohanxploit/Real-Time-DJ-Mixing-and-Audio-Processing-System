from fastapi import FastAPI, UploadFile, File, Form, WebSocket
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os
import tempfile
import asyncio

from audio.engine import engine

app = FastAPI(title="Nexus Mix Audio Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a temp dir for uploaded tracks
TEMP_DIR = tempfile.mkdtemp(prefix="nexusmix_")

@app.on_event("startup")
async def startup_event():
    engine.start()

@app.on_event("shutdown")
async def shutdown_event():
    engine.stop()

# --- Devices ---
@app.get("/api/devices")
async def get_devices():
    devices, default_out = engine.get_devices()
    return {"devices": devices, "default": default_out}

class RoutingRequest(BaseModel):
    master_device_id: int | str
    cue_device_id: int | str

@app.post("/api/settings/routing")
async def set_routing(req: RoutingRequest):
    try:
        master_id = int(req.master_device_id) if req.master_device_id != "default" else None
        cue_id = int(req.cue_device_id) if req.cue_device_id != "default" else None
        
        if master_id is not None:
            engine.set_master_device(master_id)
        if cue_id is not None:
            engine.set_cue_device(cue_id)
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# --- Deck Control ---
@app.post("/api/deck/{deck_id}/load")
async def load_deck(deck_id: str, file: UploadFile = File(...)):
    deck = engine.deck_a if deck_id.lower() == 'a' else engine.deck_b
    
    file_path = os.path.join(TEMP_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    success, info = deck.load_track(file_path)
    if success:
        return {"status": "ok", "info": info}
    else:
        return {"status": "error", "message": info}

@app.post("/api/deck/{deck_id}/play")
async def play_deck(deck_id: str):
    deck = engine.deck_a if deck_id.lower() == 'a' else engine.deck_b
    deck.play()
    return {"status": "ok"}

@app.post("/api/deck/{deck_id}/pause")
async def pause_deck(deck_id: str):
    deck = engine.deck_a if deck_id.lower() == 'a' else engine.deck_b
    deck.pause()
    return {"status": "ok"}

@app.post("/api/deck/{deck_id}/seek")
async def seek_deck(deck_id: str, position: float):
    deck = engine.deck_a if deck_id.lower() == 'a' else engine.deck_b
    deck.seek(position)
    return {"status": "ok"}

@app.post("/api/deck/{deck_id}/pitch")
async def set_pitch(deck_id: str, rate: float):
    deck = engine.deck_a if deck_id.lower() == 'a' else engine.deck_b
    deck.set_pitch(rate)
    return {"status": "ok"}

class EQRequest(BaseModel):
    low: float
    mid: float
    high: float

@app.post("/api/deck/{deck_id}/volume")
async def set_volume(deck_id: str, val: float):
    deck = engine.deck_a if deck_id.lower() == 'a' else engine.deck_b
    deck.volume = max(0.0, min(1.0, val))
    return {"status": "ok"}

@app.post("/api/deck/{deck_id}/eq")
async def set_eq(deck_id: str, req: EQRequest):
    deck = engine.deck_a if deck_id.lower() == 'a' else engine.deck_b
    deck.set_eq(req.low, req.mid, req.high)
    return {"status": "ok"}

@app.post("/api/deck/{deck_id}/filter")
async def set_filter(deck_id: str, val: float = None, type: str = None, freq: float = None):
    deck = engine.deck_a if deck_id.lower() == 'a' else engine.deck_b
    # Support both direct knob value (val 0-100) or type/freq logic if frontend passes it
    if val is not None:
        deck.set_filter(val)
    return {"status": "ok"}

class FXRequest(BaseModel):
    delay: float = None
    dist: float = None

@app.post("/api/deck/{deck_id}/fx")
async def set_fx(deck_id: str, req: FXRequest):
    deck = engine.deck_a if deck_id.lower() == 'a' else engine.deck_b
    deck.set_fx(delay=req.delay, dist=req.dist)
    return {"status": "ok"}

class LoopRequest(BaseModel):
    in_sec: float = None
    out_sec: float = None
    active: bool = None

@app.post("/api/deck/{deck_id}/loop")
async def set_loop(deck_id: str, req: LoopRequest):
    deck = engine.deck_a if deck_id.lower() == 'a' else engine.deck_b
    deck.set_loop(start_sec=req.in_sec, end_sec=req.out_sec, active=req.active)
    return {"status": "ok"}

# --- Mixer Control ---
@app.post("/api/mixer/crossfader")
async def set_crossfader(value: float):
    engine.mixer.set_crossfader(value)
    return {"status": "ok"}

@app.post("/api/mixer/volume")
async def set_volume(master: float = None, cue: float = None):
    if master is not None:
        engine.mixer.set_master_volume(master)
    if cue is not None:
        engine.mixer.set_cue_volume(cue)
    return {"status": "ok"}

@app.post("/api/mixer/cue/{deck_id}")
async def set_deck_cue(deck_id: str, enabled: bool):
    engine.mixer.set_deck_cue(deck_id, enabled)
    return {"status": "ok"}

# State fetching (simplistic polling alternative to websockets for quick integration)
@app.get("/api/state")
async def get_state():
    return {
        "deck_a": {
            "playing": engine.deck_a.is_playing,
            "position": engine.deck_a.position / engine.deck_a.sample_rate if engine.deck_a.sample_rate else 0,
        },
        "deck_b": {
            "playing": engine.deck_b.is_playing,
            "position": engine.deck_b.position / engine.deck_b.sample_rate if engine.deck_b.sample_rate else 0,
        }
    }

# --- WebSocket State ---
@app.websocket("/ws/state")
async def websocket_state(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            payload = {
                "deck1": {
                    "position": engine.deck_a.position / engine.deck_a.sample_rate if engine.deck_a.sample_rate else 0,
                    "rms": float(engine.deck_a.rms)
                },
                "deck2": {
                    "position": engine.deck_b.position / engine.deck_b.sample_rate if engine.deck_b.sample_rate else 0,
                    "rms": float(engine.deck_b.rms)
                },
                "master_rms": float(engine.mixer.master_rms),
                "master_fft": engine.mixer.master_fft.tolist()
            }
            await websocket.send_json(payload)
            await asyncio.sleep(0.05) # 50ms interval
    except Exception:
        pass

@app.post("/api/recording/start")
async def start_recording():
    filename = engine.start_recording()
    if filename:
        return {"status": "ok", "filename": filename}
    return {"status": "error", "message": "Already recording"}

@app.post("/api/recording/stop")
async def stop_recording():

    filename = engine.recording_file.name if engine.recording_file else None
    engine.stop_recording()
    if filename:
        basename = os.path.basename(filename)
        return {"status": "ok", "filename": basename}
    return {"status": "error", "message": "Not recording"}

@app.get("/api/recording/download/{filename}")
async def download_recording(filename: str):
    filepath = os.path.join(engine.recordings_dir, filename)
    if os.path.exists(filepath):
        return FileResponse(filepath, media_type="audio/wav", filename=filename)
    return {"status": "error", "message": "File not found"}
