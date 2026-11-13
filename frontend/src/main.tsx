import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AdaptiveCursor from './components/ui/adaptive-cursor'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <>
      <App />
      <AdaptiveCursor />
    </>
  </React.StrictMode>,
)
