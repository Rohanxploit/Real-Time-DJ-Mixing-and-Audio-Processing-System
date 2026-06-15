import numpy as np
import librosa
import threading

class TimelineClip:
    def __init__(self, clip_id: str, file_path: str, start_time: float, duration: float, track_index: int, sample_rate: int):
        self.id = clip_id
        self.file_path = file_path
        self.start_time = start_time
        self.duration = duration
        self.track_index = track_index
        self.sample_rate = sample_rate
        
        self.start_frame = int(start_time * sample_rate)
        self.end_frame = int((start_time + duration) * sample_rate)
        
        # Load audio into memory for simplicity (for short clips/timeline)
        try:
            self.data, _ = librosa.load(file_path, sr=sample_rate, mono=False)
            if self.data.ndim == 1:
                # Convert mono to stereo
                self.data = np.vstack((self.data, self.data))
            self.data = self.data.T # shape: (frames, 2)
        except Exception as e:
            print(f"Failed to load clip {file_path}: {e}")
            self.data = np.zeros((self.end_frame - self.start_frame, 2), dtype=np.float32)

class TimelineMixer:
    def __init__(self, sample_rate=44100):
        self.sample_rate = sample_rate
        self.clips = []
        self.is_playing = False
        self.playhead_frame = 0
        self.lock = threading.Lock()

    def sync_clips(self, clip_dicts):
        new_clips = []
        for c in clip_dicts:
            new_clips.append(TimelineClip(
                clip_id=c.get('id', ''),
                file_path=c['file_path'],
                start_time=c['start_time'],
                duration=c['duration'],
                track_index=c['track_index'],
                sample_rate=self.sample_rate
            ))
        with self.lock:
            self.clips = new_clips

    def play(self):
        with self.lock:
            self.is_playing = True

    def stop(self):
        with self.lock:
            self.is_playing = False
            self.playhead_frame = 0

    def process(self, frames: int) -> np.ndarray:
        out_buffer = np.zeros((frames, 2), dtype=np.float32)
        
        with self.lock:
            if not self.is_playing:
                return out_buffer
                
            current_start = self.playhead_frame
            current_end = current_start + frames

            for clip in self.clips:
                # Check overlap
                if clip.start_frame < current_end and clip.end_frame > current_start:
                    # Overlap region in the master buffer
                    out_start = max(0, clip.start_frame - current_start)
                    out_end = min(frames, clip.end_frame - current_start)
                    
                    # Corresponding region in the clip data
                    clip_start = max(0, current_start - clip.start_frame)
                    clip_end = clip_start + (out_end - out_start)
                    
                    # Ensure we don't go out of bounds of loaded clip data
                    actual_clip_len = clip.data.shape[0]
                    if clip_start < actual_clip_len:
                        actual_clip_end = min(clip_end, actual_clip_len)
                        write_len = actual_clip_end - clip_start
                        
                        out_buffer[out_start : out_start + write_len] += clip.data[clip_start : actual_clip_end]

            self.playhead_frame += frames
            return out_buffer
