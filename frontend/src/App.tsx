import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import SignIn from './pages/SignIn'

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
        <SignIn
          onBack={() => setPage('landing')}
          onSuccess={() => setPage('dashboard')}
        />
      )}
    </div>
  )
}

export default App