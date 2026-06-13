import sounddevice as sd
import numpy as np
import threading
import queue
import soundfile as sf
import os
import time
from .deck import Deck
from .mixer import Mixer

class AudioEngine:
    def __init__(self):
        self.sample_rate = 44100
        self.block_size = 1024
        self.channels = 2
        
        self.deck_a = Deck()
        self.deck_b = Deck()
        self.mixer = Mixer(self.deck_a, self.deck_b)
        
        self.master_device_id = None
        self.cue_device_id = None
        
        self.master_stream = None
        self.cue_stream = None
        
        self.cue_queue = queue.Queue(maxsize=10) # Small buffer
        self.is_running = False
        
        self.recording_file = None
        self.recordings_dir = os.path.join(os.path.dirname(__file__), '..', 'recordings')
        os.makedirs(self.recordings_dir, exist_ok=True)

    def get_devices(self):
        devices = sd.query_devices()
        outputs = []
        for i, d in enumerate(devices):
            if d['max_output_channels'] > 0:
                outputs.append({
                    "id": i,
                    "name": d['name'],
                    "channels": d['max_output_channels']
                })
        # Try to find a sensible default
        default_out = sd.default.device[1]
        return outputs, default_out

    def set_master_device(self, device_id: int):
        self.master_device_id = device_id
        if self.is_running:
            self.restart()

    def set_cue_device(self, device_id: int):
        self.cue_device_id = device_id
        if self.is_running:
            self.restart()

    def master_callback(self, outdata, frames, time, status):
        if status:
            print(f"Master Status: {status}")
            
        master_buffer, cue_buffer = self.mixer.process(frames)
        
        # Write to master output
        outdata[:] = master_buffer
        
        # Record if active
        if self.recording_file is not None:
            try:
                self.recording_file.write(master_buffer)
            except Exception as e:
                print(f"Recording error: {e}")
        
        # Send cue buffer to queue if cue stream is running
        if self.cue_stream is not None and not self.cue_queue.full():
            try:
                self.cue_queue.put_nowait(cue_buffer)
            except queue.Full:
                pass

    def cue_callback(self, outdata, frames, time, status):
        if status:
            pass # Ignore cue status
            
        try:
            cue_buffer = self.cue_queue.get_nowait()
            if len(cue_buffer) == frames:
                outdata[:] = cue_buffer
                return
        except queue.Empty:
            pass
            
        outdata[:] = np.zeros((frames, self.channels), dtype=np.float32)

    def start(self):
        self.is_running = True
        
        # Start Master Stream
        try:
            self.master_stream = sd.OutputStream(
                device=self.master_device_id,
                channels=self.channels,
                samplerate=self.sample_rate,
                blocksize=self.block_size,
                callback=self.master_callback
            )
            self.master_stream.start()
        except Exception as e:
            print(f"Failed to start master stream: {e}")
            
        # Start Cue Stream if different
        if self.cue_device_id is not None and self.cue_device_id != self.master_device_id:
            try:
                # Clear queue
                while not self.cue_queue.empty():
                    self.cue_queue.get()
                    
                self.cue_stream = sd.OutputStream(
                    device=self.cue_device_id,
                    channels=self.channels,
                    samplerate=self.sample_rate,
                    blocksize=self.block_size,
                    callback=self.cue_callback
                )
                self.cue_stream.start()
            except Exception as e:
                print(f"Failed to start cue stream: {e}")

    def stop(self):
        self.is_running = False
        if self.master_stream:
            self.master_stream.stop()
            self.master_stream.close()
            self.master_stream = None
        if self.cue_stream:
            self.cue_stream.stop()
            self.cue_stream.close()
            self.cue_stream = None

    def restart(self):
        self.stop()
        self.start()

    def start_recording(self) -> str:
        if self.recording_file is not None:
            return None # Already recording
        
        filename = f"mix_{int(time.time())}.wav"
        filepath = os.path.join(self.recordings_dir, filename)
        
        # Open in write mode
        self.recording_file = sf.SoundFile(filepath, mode='w', samplerate=self.sample_rate, channels=self.channels)
        return filename
        
    def stop_recording(self):
        if self.recording_file is not None:
            self.recording_file.close()
            self.recording_file = None

# Global singleton
engine = AudioEngine()
