import './App.css'
import { useState } from 'react'
import Navbar from './components/Navbar'
import Weather from './components/Weather'
import MarketPrices from './components/MarketPrices'
import DiseaseDetection from './components/DiseaseDetection'
import AgriAssistant from './components/AgriAssistant'
import SignIn from './components/SignIn'
import HomeWidgets from './components/HomeWidgets'

function App() {
  // default to 'home' in normal use; set to 'weather' during debugging so the Weather
  // component is visible immediately when the app loads.
  const [route, setRoute] = useState('home')
  const [user, setUser] = useState(null) // { name }
  const [showSignIn, setShowSignIn] = useState(false)

  function handleLogin(name){
    setUser({name})
    setShowSignIn(false)
  }

  function handleLogout(){
    setUser(null)
  }

  return (
    <div className="app-root">
      <Navbar 
        route={route} 
        onNavigate={setRoute} 
        isLoggedIn={!!user}
        userName={user?.name}
        onRequestSignIn={()=>setShowSignIn(true)}
        onLogout={handleLogout}
      />
      <main className="app-main">
        {route === 'home' && (
          <div className="home">
            <div className="welcome">
              <h1>AgriMithra</h1>
              <h2>Welcome Farmers</h2>
              <p className="muted">Find weather, market prices, disease detection and an assistant below.</p>
            </div>
            <HomeWidgets />
          </div>
        )}
        {route === 'weather' && <Weather />}
        {route === 'market' && <MarketPrices />}
        {route === 'disease' && <DiseaseDetection />}
        {route === 'assistant' && <AgriAssistant />}
      </main>
      {showSignIn && <SignIn onCancel={()=>setShowSignIn(false)} onConfirm={handleLogin} />}
    </div>
  )
}

export default App
