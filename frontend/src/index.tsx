import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import Router from '@/router'
import '@/index.css'

const container = document.getElementById('root') as HTMLDivElement
const root = createRoot(container)

root.render(
  <StrictMode>
    <BrowserRouter basename="/">
      <Router />
    </BrowserRouter>
  </StrictMode>
)
