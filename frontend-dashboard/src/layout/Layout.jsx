import React, { useState, useEffect } from 'react';

export default function Layout({ children, currentView, setView }) {
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [isLightMode]);

  return (
    <div className="min-h-screen bg-netflix-darker text-netflix-light flex flex-col transition-colors duration-300">
      {/* Navbar */}
      <header className="bg-netflix-dark border-b border-gray-800 p-4 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-netflix-red rounded font-bold flex items-center justify-center text-white">
              N
            </div>
            <h1 className="text-xl font-bold tracking-wider">SISTEMAS DISTRIBUIDOS</h1>
          </div>
          
          <nav className="flex items-center gap-4">
            <button 
              onClick={() => setView('monitoring')}
              className={`px-4 py-2 rounded transition-colors ${currentView === 'monitoring' ? 'bg-netflix-red text-white font-semibold' : 'hover:bg-gray-800'}`}
            >
              Monitoreo
            </button>
            <button 
              onClick={() => setView('testing')}
              className={`px-4 py-2 rounded transition-colors ${currentView === 'testing' ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-gray-800'}`}
            >
              Red Social (Simulación)
            </button>
            <button 
              onClick={() => setIsLightMode(!isLightMode)}
              className="ml-4 p-2 rounded-full hover:bg-gray-800 transition-colors flex items-center justify-center"
              title="Cambiar Tema"
            >
              {isLightMode ? '🌙' : '☀️'}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
