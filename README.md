# Real-Time DJ Mixing and Audio Processing System

## Description
The Real-Time DJ Mixing and Audio Processing System is a comprehensive web-based application that offers professional DJ capabilities directly from your browser. It leverages a high-performance Python FastAPI backend for low-latency audio processing and a responsive React frontend for an intuitive mixing experience.

## Features
- **Dual Deck Control:** Independent playback, pause, seek, and track loading for two decks (Deck A and Deck B).
- **Advanced Audio Processing:**
  - Real-time EQ controls (Low, Mid, High).
  - High-pass and Low-pass Filters.
  - Pitch shifting and playback rate manipulation.
- **Audio Effects (FX):** Built-in delay and distortion effects.
- **Looping & Timeline:** Support for in/out loop points and audio trimming/timeline syncing.
- **Mixer Controls:** Smooth crossfading between decks, independent Master and Cue volume adjustments.
- **Real-Time Visual Feedback:** WebSocket integration provides real-time streaming of deck playback positions, RMS volume metering, and FFT data for dynamic visualizers.
- **Recording:** Record your mix sessions in real-time and download the output as a WAV file.

## Instructions to Run and Test the Project

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [Python 3](https://www.python.org/)

### 1. Setting up and Running the Backend
The backend runs on Python and uses FastAPI along with audio processing libraries. A virtual environment (`venv`) is already included in the project structure.

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd Real-Time-DJ-Mixing-and-Audio-Processing-System/backend
   ```
2. Activate the virtual environment:
   - On Windows:
     ```bash
     ..\venv\Scripts\activate
     ```
   - On Mac/Linux:
     ```bash
     source ../venv/bin/activate
     ```
3. Run the FastAPI server:
   ```bash
   uvicorn main:app --port 8000 --reload
   ```
   The backend will now be running on `http://localhost:8000`.

### 2. Setting up and Running the Frontend
The frontend is built with React and Vite.

1. Open a new terminal and navigate to the project root directory:
   ```bash
   cd Real-Time-DJ-Mixing-and-Audio-Processing-System
   ```
2. Install the required Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be accessible at `http://localhost:5173` (or another port like `5174` if 5173 is in use).

## Assumptions and Additional Technical Details
- **Audio Hardware Access:** The backend uses system-level audio routing (via `sounddevice`). It is assumed that the host machine running the backend has a functional sound card and audio output device.
- **WebSocket Streaming:** Real-time visual updates (like waveforms, RMS, and FFT) are delivered efficiently over WebSockets. This minimizes polling overhead and ensures UI responsiveness even under heavy processing loads.
- **CORS Configuration:** For ease of development, the backend CORS middleware currently allows all origins (`["*"]`). For a production deployment, this should be restricted to the specific frontend domain.
- **Audio Library Dependencies:** The backend relies on libraries like `soundfile` and `pyaudio` / `sounddevice`. If you run into audio driver issues on Windows, you may need to ensure your audio drivers are up to date or use ASIO drivers for lower latency.
