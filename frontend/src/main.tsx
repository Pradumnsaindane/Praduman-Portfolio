import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ThermodynamicGrid from './components/ui/interactive-thermodynamic-grid'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <>
      <App />
      <ThermodynamicGrid
        className="fixed inset-0 pointer-events-none z-50 mix-blend-screen opacity-85"
        resolution={16}
        coolingFactor={0.96}
      />
    </>
  </React.StrictMode>,
)
