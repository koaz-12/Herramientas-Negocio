import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Utility to check storage if needed (run window.checkStorage() in console)
if (typeof window !== 'undefined') {
  window.checkStorage = () => {
    const keys = Object.keys(localStorage);
    console.log("LocalStorage Keys:", keys);
    keys.forEach(k => {
      try {
        const data = localStorage.getItem(k);
        console.log(`Key: ${k}`, JSON.parse(data));
      } catch {
        console.log(`Key: ${k} (Non-JSON or error)`);
      }
    });
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
