import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css' //Se importa el CSS de Bootstrap
import 'bootstrap/dist/js/bootstrap.bundle.min.js' //Se importa el JS de Bootstrap

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
