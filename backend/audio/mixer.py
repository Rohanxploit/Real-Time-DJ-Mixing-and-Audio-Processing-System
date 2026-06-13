import numpy as np
import math

class Mixer:
    def __init__(self, deck_a, deck_b):
        self.deck_a = deck_a
        self.deck_b = deck_b
        
        # Mixer state
        self.crossfader = 0.5  # 0.0 (A only) to 1.0 (B only)
        self.master_volume = 0.8
        self.cue_volume = 0.8
        
        # Deck Cue states (PFL - Pre Fader Listen)
        self.cue_a = False
        self.cue_b = False
        
        self.master_rms = 0.0
        self.master_fft = np.zeros(32, dtype=np.float32)

    def set_crossfader(self, value: float):
        self.crossfader = max(0.0, min(1.0, value))

    def set_master_volume(self, value: float):
        self.master_volume = max(0.0, min(1.0, value))

    def set_cue_volume(self, value: float):
        self.cue_volume = max(0.0, min(1.0, value))

    def set_deck_cue(self, deck_id: str, enabled: bool):
        if deck_id.upper() == 'A':
            self.cue_a = enabled
        elif deck_id.upper() == 'B':
            self.cue_b = enabled

    def _equal_power_crossfade(self, x):
        """
        Equal power crossfade curve using sine/cosine.
        x is 0.0 (full A) to 1.0 (full B)
        """
        # map x to [0, pi/2]
        theta = x * (math.pi / 2)
        gain_a = math.cos(theta)
        gain_b = math.sin(theta)
        return gain_a, gain_b

    def process(self, frames: int):
        """
        Process audio for Master and Cue outputs.
        Returns: (master_buffer, cue_buffer)
        """
        # 1. Fetch audio from decks (already includes EQ and Deck Volume)
        # We must process them regardless of crossfader so playback position advances
        buffer_a = self.deck_a.process(frames)
        buffer_b = self.deck_b.process(frames)
        
        # 2. Master Mix
        gain_a, gain_b = self._equal_power_crossfade(self.crossfader)
        
        master_buffer = (buffer_a * gain_a) + (buffer_b * gain_b)
        master_buffer *= self.master_volume
        
        # 3. Cue Mix (Pre-Fader)
        # Cue is usually independent of crossfader and deck volume, but in this 
        # simplified version, deck.process already applies deck volume.
        # We'll just mix whatever has cue enabled.
        cue_buffer = np.zeros_like(master_buffer)
        if self.cue_a:
            cue_buffer += buffer_a
        if self.cue_b:
            cue_buffer += buffer_b
            
        # Normalize cue slightly if both are active to prevent clipping
        if self.cue_a and self.cue_b:
            cue_buffer *= 0.707
            
        cue_buffer *= self.cue_volume
        
        # Calculate master RMS
        if len(master_buffer) > 0:
            self.master_rms = np.sqrt(np.mean(master_buffer**2))
            
            # Calculate FFT (on left channel only for speed)
            left_channel = master_buffer[:, 0]
            fft_full = np.abs(np.fft.rfft(left_channel))
            # Downsample to 32 bins (simple linear grouping)
            bins = 32
            if len(fft_full) >= bins:
                chunk_size = len(fft_full) // bins
                fft_downsampled = np.array([np.mean(fft_full[i*chunk_size:(i+1)*chunk_size]) for i in range(bins)])
                # Normalize and clip
                fft_downsampled = np.clip(fft_downsampled / 20.0, 0.0, 1.0)
                self.master_fft = fft_downsampled
            else:
                self.master_fft = np.zeros(32, dtype=np.float32)
        else:
            self.master_rms = 0.0
            self.master_fft = np.zeros(32, dtype=np.float32)
        
        return master_buffer, cue_buffer
