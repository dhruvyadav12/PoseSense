import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'

function App() {
  const [page, setPage] = useState<'landing' | 'dashboard' | 'signin'>('landing')

  return (
    <div className="min-h-screen bg-black">
      {page === 'landing' && (
        <LandingPage
          onLaunch={() => setPage('dashboard')}
          onSignIn={() => setPage('signin')}
        />
      )}
      {page === 'dashboard' && (
        <Dashboard onBack={() => setPage('landing')} />
      )}
      {page === 'signin' && (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white/40 text-sm">Sign In — Coming Soon</div>
          <button onClick={() => setPage('landing')} className="ml-4 text-white text-sm underline">
            Back
          </button>
        </div>
      )}
    </div>
  )
}

export default App