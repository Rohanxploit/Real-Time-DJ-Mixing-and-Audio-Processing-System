import numpy as np
import soundfile as sf
from scipy import signal
import threading
import math

class Deck:
    def __init__(self):
        self.audio_data = None
        self.sample_rate = 44100
        self.channels = 2
        self.position = 0
        self.is_playing = False
        self.playback_rate = 1.0
        
        # Audio properties
        self.volume = 1.0  # 0.0 to 1.0
        self.eq = {'low': 1.0, 'mid': 1.0, 'high': 1.0}
        self.filter_val = 50.0  # 0-100, 50 is flat
        
        # FX
        self.fx_delay_val = 0.0 # 0.0 to 1.0
        self.fx_dist_val = 0.0 # 0.0 to 1.0
        # 1-second delay buffer (assuming max delay is 1s)
        self.delay_buffer = np.zeros((self.sample_rate, self.channels), dtype=np.float32)
        
        # Loop properties
        self.loop_start = None
        self.loop_end = None
        self.loop_active = False
        
        # Metering
        self.rms = 0.0
        
        # Lock for thread safety during loading vs playing
        self.lock = threading.Lock()
        
        self._init_filters(self.sample_rate)

    def _init_filters(self, sr):
        nyq = 0.5 * sr
        
        # 3-Band EQ (using SOS for stability and zi for continuity)
        self.sos_low = signal.butter(2, 250 / nyq, btype='low', output='sos')
        self.sos_mid = signal.butter(2, [250 / nyq, 2000 / nyq], btype='bandpass', output='sos')
        self.sos_high = signal.butter(2, 2000 / nyq, btype='high', output='sos')
        
        # Filter State zi shapes: (n_sections, 2) per channel. 
        # But we process stereo, so we keep a list of zi per channel
        self._reset_eq_zi()
        
        # Main Filter (Highpass/Lowpass)
        self.sos_main_filter = None
        self.zi_main_filter = None

    def _reset_eq_zi(self):
        # zi shape for sosfilt is (n_sections, 2)
        # We need this per channel
        self.zi_low = [signal.sosfilt_zi(self.sos_low) for _ in range(self.channels)]
        self.zi_mid = [signal.sosfilt_zi(self.sos_mid) for _ in range(self.channels)]
        self.zi_high = [signal.sosfilt_zi(self.sos_high) for _ in range(self.channels)]

    def _update_main_filter(self):
        val = self.filter_val
        if 48 <= val <= 52:
            self.sos_main_filter = None
            self.zi_main_filter = None
            return
            
        nyq = 0.5 * self.sample_rate
        if val < 50:
            # Lowpass: 0->50 maps 80Hz -> 20000Hz (log)
            t = val / 50.0
            freq = 80 * math.pow(20000 / 80, t)
            freq = min(freq, nyq - 1)
            self.sos_main_filter = signal.butter(2, freq / nyq, btype='low', output='sos')
        else:
            # Highpass: 50->100 maps 20000Hz -> 20Hz (reverse log) -> Actually DJ mixers map 50->100 as 20Hz -> 18000Hz
            t = (val - 50) / 50.0
            freq = 20 * math.pow(18000 / 20, t)
            freq = min(max(freq, 1), nyq - 1)
            self.sos_main_filter = signal.butter(2, freq / nyq, btype='high', output='sos')
            
        self.zi_main_filter = [signal.sosfilt_zi(self.sos_main_filter) for _ in range(self.channels)]

    def load_track(self, filepath: str):
        with self.lock:
            try:
                data, sr = sf.read(filepath, always_2d=True)
                if data.shape[1] == 1:
                    data = np.repeat(data, 2, axis=1) # Mono to stereo
                
                self.audio_data = data.astype(np.float32)
                self.sample_rate = sr
                self.channels = 2
                self.position = 0
                self.is_playing = False
                self.playback_rate = 1.0
                self.loop_start = None
                self.loop_end = None
                self.loop_active = False
                self.fx_delay_val = 0.0
                self.fx_dist_val = 0.0
                self.delay_buffer = np.zeros((sr, self.channels), dtype=np.float32)
                
                self._init_filters(sr)
                self._update_main_filter()
                return True, {"duration": len(data) / sr, "sample_rate": sr}
            except Exception as e:
                print(f"Error loading track: {e}")
                return False, str(e)

    def play(self):
        if self.audio_data is not None:
            self.is_playing = True

    def pause(self):
        self.is_playing = False

    def seek(self, position_seconds: float):
        with self.lock:
            if self.audio_data is not None:
                new_pos = int(position_seconds * self.sample_rate)
                self.position = min(max(0, new_pos), len(self.audio_data))

    def set_pitch(self, rate: float):
        self.playback_rate = max(0.1, min(3.0, rate))

    def set_volume(self, volume: float):
        self.volume = max(0.0, min(1.0, volume))

    def set_eq(self, low: float, mid: float, high: float):
        self.eq['low'] = max(0.0, min(2.0, low))
        self.eq['mid'] = max(0.0, min(2.0, mid))
        self.eq['high'] = max(0.0, min(2.0, high))
        
    def set_filter(self, val: float):
        with self.lock:
            self.filter_val = max(0.0, min(100.0, val))
            self._update_main_filter()
            
    def set_fx(self, delay: float = None, dist: float = None):
        with self.lock:
            if delay is not None:
                self.fx_delay_val = max(0.0, min(1.0, delay))
            if dist is not None:
                self.fx_dist_val = max(0.0, min(1.0, dist))

    def set_loop(self, start_sec: float = None, end_sec: float = None, active: bool = None):
        with self.lock:
            if start_sec is not None:
                self.loop_start = int(start_sec * self.sample_rate)
            if end_sec is not None:
                self.loop_end = int(end_sec * self.sample_rate)
            if active is not None:
                self.loop_active = active

    def _fetch_chunk(self, required_frames: int):
        # Handles looping and end of track
        out_chunk = np.zeros((required_frames, self.channels), dtype=np.float32)
        frames_read = 0
        
        while frames_read < required_frames:
            if self.position >= len(self.audio_data):
                self.is_playing = False
                break
                
            read_size = required_frames - frames_read
            
            if self.loop_active and self.loop_end is not None and self.loop_start is not None:
                # If we hit loop end
                if self.position >= self.loop_end:
                    self.position = self.loop_start
                # Don't read past loop end in this iteration
                read_size = min(read_size, self.loop_end - self.position)
                
            read_size = min(read_size, len(self.audio_data) - self.position)
            end_pos = self.position + read_size
            
            out_chunk[frames_read:frames_read+read_size] = self.audio_data[self.position:end_pos]
            self.position = end_pos
            frames_read += read_size
            
            if not self.loop_active and self.position >= len(self.audio_data):
                self.is_playing = False
                break
                
        return out_chunk[:frames_read] # Return only what we managed to read

    def process(self, frames: int) -> np.ndarray:
        out = np.zeros((frames, self.channels), dtype=np.float32)
        self.rms = 0.0
        
        with self.lock:
            if not self.is_playing or self.audio_data is None:
                return out

            # 1. Pitch / Resample
            required_frames = int(frames * self.playback_rate)
            if required_frames == 0:
                return out
                
            chunk = self._fetch_chunk(required_frames)
            
            if len(chunk) == 0:
                return out
                
            if self.playback_rate != 1.0 and len(chunk) > 1:
                # scipy.signal.resample does FFT resampling.
                # Must specify num samples = frames (or proportional if chunk is smaller than required)
                target_frames = int(len(chunk) / self.playback_rate)
                chunk = signal.resample(chunk, target_frames, axis=0)

        # Pad if chunk is smaller than frames (e.g., end of track)
        if len(chunk) < frames:
            padded = np.zeros((frames, self.channels), dtype=np.float32)
            padded[:len(chunk)] = chunk
            chunk = padded
        elif len(chunk) > frames:
            chunk = chunk[:frames]

        # 2. 3-Band EQ using sosfilt
        if self.eq['low'] != 1.0 or self.eq['mid'] != 1.0 or self.eq['high'] != 1.0:
            eq_out = np.zeros_like(chunk)
            for c in range(self.channels):
                low_b, self.zi_low[c] = signal.sosfilt(self.sos_low, chunk[:, c], zi=self.zi_low[c])
                mid_b, self.zi_mid[c] = signal.sosfilt(self.sos_mid, chunk[:, c], zi=self.zi_mid[c])
                high_b, self.zi_high[c] = signal.sosfilt(self.sos_high, chunk[:, c], zi=self.zi_high[c])
                eq_out[:, c] = (low_b * self.eq['low']) + (mid_b * self.eq['mid']) + (high_b * self.eq['high'])
            chunk = eq_out

        # 3. Main Filter
        if self.sos_main_filter is not None:
            for c in range(self.channels):
                chunk[:, c], self.zi_main_filter[c] = signal.sosfilt(self.sos_main_filter, chunk[:, c], zi=self.zi_main_filter[c])

        # 4. FX: Distortion
        if self.fx_dist_val > 0.0:
            # Overdrive algorithm using tanh. Gain goes from 1.0x to 6.0x
            gain = 1.0 + (self.fx_dist_val * 5.0)
            chunk = np.tanh(chunk * gain)

        # 5. FX: Delay
        if self.fx_delay_val > 0.0:
            amount = self.fx_delay_val
            # Fixed delay time of 500ms
            delay_frames = int(0.5 * self.sample_rate)
            
            # Read oldest frames from the delay_buffer
            delayed_chunk = self.delay_buffer[:frames]
            
            # Shift buffer left and append new chunk (with feedback)
            self.delay_buffer = np.roll(self.delay_buffer, -frames, axis=0)
            feedback = chunk + (delayed_chunk * 0.4) # 40% feedback
            
            # Pad or truncate feedback to fit
            if len(feedback) < frames:
                pad = np.zeros((frames, self.channels), dtype=np.float32)
                pad[:len(feedback)] = feedback
                feedback = pad
            elif len(feedback) > frames:
                feedback = feedback[:frames]
                
            self.delay_buffer[-frames:] = feedback
            
            # Mix wet and dry
            chunk = (chunk * (1.0 - amount*0.5)) + (delayed_chunk * amount)

        else:
            # Keep rolling the buffer so it's ready when delay is turned on
            self.delay_buffer = np.roll(self.delay_buffer, -frames, axis=0)
            pad = np.zeros((frames, self.channels), dtype=np.float32)
            pad[:len(chunk)] = chunk
            self.delay_buffer[-frames:] = pad

        # 6. Volume
        chunk *= self.volume
        
        # 7. Compute RMS
        # mean of squares across frames and channels
        self.rms = np.sqrt(np.mean(chunk**2))
        
        return chunk
