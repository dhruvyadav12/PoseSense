import { useState } from 'react'
import LandingPage from './pages/LandingPage.tsx'
import Dashboard from './pages/Dashboard.tsx'

function App() {
  const [page, setPage] = useState<'landing' | 'dashboard'>('landing')

  return (
    <div className="min-h-screen bg-bg">
      {page === 'landing' ? (
        <LandingPage onLaunch={() => setPage('dashboard')} />
      ) : (
        <Dashboard onBack={() => setPage('landing')} />
      )}
    </div>
  )
}

export default App