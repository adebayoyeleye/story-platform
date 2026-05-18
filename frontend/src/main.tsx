// Self-hosted fonts (Tailwind v4 font-family tokens resolve to these).
// Only the weights the design system actually uses — keeps bundle lean.
import "@fontsource/inter/400.css"
import "@fontsource/inter/500.css"
import "@fontsource/inter/600.css"
import "@fontsource/source-serif-4/400.css"
import "@fontsource/source-serif-4/400-italic.css"
import "@fontsource/source-serif-4/600.css"
import "@fontsource/source-serif-4/600-italic.css"

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
