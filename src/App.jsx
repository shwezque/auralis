import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import BrandPicker from './pages/BrandPicker'
import Lobby from './pages/Lobby'
import Session from './pages/Session'
import Summary from './pages/Summary'

function AppRoutes() {
  const { selectedBrand, sessionTranscript } = useApp()

  return (
    <Routes>
      {/* S0 — Brand picker */}
      <Route path="/" element={<BrandPicker />} />

      {/* S1 — Lobby: requires brand selection */}
      <Route
        path="/lobby"
        element={selectedBrand ? <Lobby /> : <Navigate to="/" replace />}
      />

      {/* S2 — Session: requires brand selection */}
      <Route
        path="/session"
        element={selectedBrand ? <Session /> : <Navigate to="/" replace />}
      />

      {/* S3 — Summary: requires a transcript */}
      <Route
        path="/summary"
        element={
          sessionTranscript.length > 0
            ? <Summary />
            : <Navigate to="/lobby" replace />
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  )
}
