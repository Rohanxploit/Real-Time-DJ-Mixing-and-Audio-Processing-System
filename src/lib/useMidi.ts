import { useEffect, useState } from 'react';

type MidiMessageCallback = (status: number, data1: number, data2: number) => void;

export function useMidi(onMessage?: MidiMessageCallback) {
  const [midiConnected, setMidiConnected] = useState(false);
  const [midiName, setMidiName] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.requestMIDIAccess) {
      console.warn('Web MIDI API not supported in this browser.');
      return;
    }

    let midiAccess: any = null;

    const onMIDIMessage = (event: any) => {
      const [status, data1, data2] = event.data;
      if (onMessage) {
        onMessage(status, data1, data2);
      }
    };

    const initMIDI = async () => {
      try {
        midiAccess = await navigator.requestMIDIAccess();
        
        // Setup initial inputs
        const inputs = Array.from(midiAccess.inputs.values());
        if (inputs.length > 0) {
          setMidiConnected(true);
          setMidiName((inputs[0] as any).name || 'MIDI Device');
          inputs.forEach((input: any) => {
            input.onmidimessage = onMIDIMessage;
          });
        }

        // Listen for connections/disconnections
        midiAccess.onstatechange = (e: any) => {
          if (e.port.type === 'input') {
            if (e.port.state === 'connected') {
              setMidiConnected(true);
              setMidiName(e.port.name || 'MIDI Device');
              e.port.onmidimessage = onMIDIMessage;
            } else {
              setMidiConnected(false);
              setMidiName(null);
            }
          }
        };

      } catch (err) {
        console.error('MIDI Access failed', err);
      }
    };

    initMIDI();

    return () => {
      if (midiAccess) {
        midiAccess.inputs.forEach((input: any) => {
          input.onmidimessage = null;
        });
        midiAccess.onstatechange = null;
      }
    };
  }, [onMessage]);

  return { midiConnected, midiName };
}
