import { useState } from 'react'
import Layout from './layout/Layout'
import MonitoringPage from './pages/MonitoringPage'
import TestingPage from './pages/TestingPage'

function App() {
  const [currentView, setView] = useState('monitoring')

  return (
    <Layout currentView={currentView} setView={setView}>
      {currentView === 'monitoring' ? <MonitoringPage /> : <TestingPage />}
    </Layout>
  )
}

export default App
