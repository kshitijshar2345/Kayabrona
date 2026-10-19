import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// This file is the entry point Vite looks for.
// Blank white page = this file is missing or App isn't rendering.
// Make sure index.html has: <div id="root"></div>

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)