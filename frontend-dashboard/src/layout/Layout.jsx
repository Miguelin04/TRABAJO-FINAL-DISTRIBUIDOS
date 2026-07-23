import React from 'react';

export default function Layout({ children, currentView, setView }) {
  return (
    <div className="min-h-screen bg-netflix-darker text-netflix-light flex flex-col">
      {/* Navbar */}
      <header className="bg-netflix-dark border-b border-gray-800 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-netflix-red rounded font-bold flex items-center justify-center text-white">
              N
            </div>
            <h1 className="text-xl font-bold tracking-wider">SISTEMAS DISTRIBUIDOS</h1>
          </div>
          
          <nav className="flex gap-4">
            <button 
              onClick={() => setView('monitoring')}
              className={`px-4 py-2 rounded transition-colors ${currentView === 'monitoring' ? 'bg-netflix-red text-white font-semibold' : 'hover:bg-gray-800'}`}
            >
              Monitoreo
            </button>
            <button 
              onClick={() => setView('testing')}
              className={`px-4 py-2 rounded transition-colors ${currentView === 'testing' ? 'bg-netflix-red text-white font-semibold' : 'hover:bg-gray-800'}`}
            >
              Pruebas API
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
