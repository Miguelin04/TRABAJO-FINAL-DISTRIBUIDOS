import React, { useState, useEffect } from 'react';

export default function Layout({ children, currentView, setView }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    // Para el footer
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('es-ES', { hour12: false }));
    };
    updateTime();
    const intv = setInterval(updateTime, 1000);
    return () => clearInterval(intv);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-200 flex flex-col font-sans">
      {/* Navbar Superior */}
      <header className="bg-[#0b0e14] border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          
          {/* Logo y Título */}
          <div className="flex items-center gap-4">
            <div className="text-red-600">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.5 22h4.5l6-9.5V22h4.5V2h-4.5l-6 9.5V2H2.5v20z"/>
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <h1 className="text-lg font-bold tracking-wide text-white">SISTEMAS DISTRIBUIDOS</h1>
              <span className="text-xs text-slate-400">Red Social Global (Simulación)</span>
            </div>
          </div>
          
          {/* Tabs de Navegación */}
          <nav className="hidden lg:flex items-center gap-6">
            <button 
              onClick={() => setView('monitoring')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm ${currentView === 'monitoring' ? 'border border-red-900/50 bg-red-950/20 text-red-500 font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              Monitoreo
            </button>
            <button 
              onClick={() => setView('testing')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm ${currentView === 'testing' ? 'border border-blue-900/50 bg-blue-950/20 text-blue-400 font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              Red Social
            </button>
          </nav>

          {/* Estado Derecho */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
              Polling activo (2s)
            </div>
            <button className="text-slate-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 bg-[#0b0e14]">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#0b0e14] border-t border-slate-800 text-slate-500 text-xs py-3 px-6 flex justify-between items-center">
        <div>Sistemas Distribuidos - Trabajo Final | <span className="font-semibold text-slate-400">Universidad Nacional de Loja</span></div>
        <div className="px-3 py-1 border border-blue-900/50 bg-blue-900/10 text-blue-400 rounded-md">
          N=3, W=2, R=2
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          Última actualización: {time}
        </div>
      </footer>
    </div>
  );
}
