
const API_BASE = 'http://127.0.0.1:8000/api';

class ChannelPipeline {
  id: string;

  constructor(id: string) {
    this.id = id;
  }
  
  async setCueEnabled(enabled: boolean) {
    await fetch(`${API_BASE}/mixer/cue/${this.id}?enabled=${enabled}`, { method: 'POST' });
  }

  async setVolume(value: number) {
    await fetch(`${API_BASE}/deck/${this.id}/volume?val=${value}`, { method: 'POST' });
  }
}

const tempCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

export class AudioMixer {
  channelA: ChannelPipeline;
  channelB: ChannelPipeline;
  ctx: any;

  constructor() {
    this.channelA = new ChannelPipeline('A');
    this.channelB = new ChannelPipeline('B');
    this.ctx = {
      currentTime: 0,
      decodeAudioData: async (buf: ArrayBuffer) => {
     
        return tempCtx.decodeAudioData(buf);
      }
    };
    
   
    setInterval(() => { this.ctx.currentTime += 0.05; }, 50);
  }

  resume() {
   
  }

  async setMasterVolume(value: number) {
    await fetch(`${API_BASE}/mixer/volume?master=${value / 100}`, { method: 'POST' });
  }
  
  async setCueVolume(value: number) {
    await fetch(`${API_BASE}/mixer/volume?cue=${value / 100}`, { method: 'POST' });
  }

  async setCrossfader(value: number) {
    await fetch(`${API_BASE}/mixer/crossfader?value=${value / 100}`, { method: 'POST' });
  }
  
  getChannelInput(_channelId: 'A' | 'B') {
   
    return { connect: () => {} };
  }
  
  async setMasterOutputDevice(deviceId: string) {
    await fetch(`${API_BASE}/settings/routing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ master_device_id: deviceId, cue_device_id: 'default' })
    });
  }

  async setCueOutputDevice(deviceId: string) {
     await fetch(`${API_BASE}/settings/routing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ master_device_id: 'default', cue_device_id: deviceId })
    });
  }
}

let mixerInstance: AudioMixer | null = null;

export const getMixer = (): AudioMixer => {
  if (!mixerInstance) {
    mixerInstance = new AudioMixer();
  }
  return mixerInstance;
};


export const loadTrackToBackend = async (deckId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await fetch(`${API_BASE}/deck/${deckId}/load`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.status === 'error') {
      throw new Error(data.message || 'Unknown backend error');
    }
    return data;
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error('Network error: Is the Python backend running on port 8000?');
    }
    throw err;
  }
};

export const playDeck = async (deckId: string) => {
  await fetch(`${API_BASE}/deck/${deckId}/play`, { method: 'POST' });
};

export const pauseDeck = async (deckId: string) => {
  await fetch(`${API_BASE}/deck/${deckId}/pause`, { method: 'POST' });
};

export const seekDeck = async (deckId: string, position: number) => {
  await fetch(`${API_BASE}/deck/${deckId}/seek?position=${position}`, { method: 'POST' });
};

export const setDeckEQ = async (deckId: string, low: number, mid: number, high: number) => {
  await fetch(`${API_BASE}/deck/${deckId}/eq`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      low: low / 50, 
      mid: mid / 50, 
      high: high / 50 
    })
  });
};

export const setDeckFilter = async (deckId: string, val: number) => {
  await fetch(`${API_BASE}/deck/${deckId}/filter?val=${val}`, { method: 'POST' });
};

export const setDeckPitch = async (deckId: string, rate: number) => {
  await fetch(`${API_BASE}/deck/${deckId}/pitch?rate=${rate}`, { method: 'POST' });
};

export const setDeckFX = async (deckId: string, delay: number, dist: number) => {
  await fetch(`${API_BASE}/deck/${deckId}/fx`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delay: delay / 100, dist: dist / 100 })
  });
};

export const setDeckLoop = async (deckId: string, inSec: number | null, outSec: number | null, active: boolean | null) => {
  await fetch(`${API_BASE}/deck/${deckId}/loop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ in_sec: inSec, out_sec: outSec, active })
  });
};

export const startRecording = async () => {
  const res = await fetch(`${API_BASE}/recording/start`, { method: 'POST' });
  return res.json();
};

export const stopRecording = async () => {
  const res = await fetch(`${API_BASE}/recording/stop`, { method: 'POST' });
  return res.json();
};
