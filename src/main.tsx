import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Polyfill Buffer for music-metadata-browser
import { Buffer } from 'buffer';
(window as any).Buffer = (window as any).Buffer || Buffer;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
