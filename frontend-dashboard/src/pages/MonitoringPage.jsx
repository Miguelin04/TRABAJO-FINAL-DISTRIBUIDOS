import React, { useState, useEffect } from 'react';
import { fetchStatus } from '../services/api';

export default function MonitoringPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const result = await fetchStatus();
      if (result) {
        setData(result);
        setError(false);
      } else {
        setError(true);
      }
    };
    
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div className="text-center mt-10">Cargando datos...</div>;

  const cbState = data.circuit_breaker?.estado_actual || "CLOSED";
  const cbColor = cbState === "CLOSED" ? "text-green-500" : cbState === "HALF_OPEN" ? "text-yellow-500" : "text-red-500";
  
  const nodos = data.nodos || [];
  const activos = nodos.filter(n => n.estado === "ACTIVO").length;
  const totalNodos = nodos.length || 3;

  const cbHistory = data.historial_circuit_breaker || [];
  const ultima = data.ultima_peticion;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-l-4 border-netflix-red pl-3">
        <h2 className="text-2xl font-bold">Monitoreo en Tiempo Real</h2>
        <div className="flex items-center gap-2 text-sm text-netflix-gray">
          <span className={`w-3 h-3 rounded-full animate-pulse ${error ? 'bg-red-500' : 'bg-green-500'}`}></span>
          Polling activo (2s)
        </div>
      </div>
      
      {/* 9. Top Row: Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-netflix-dark p-4 rounded-lg border border-gray-800 flex flex-col justify-center">
          <span className="text-sm text-netflix-gray uppercase tracking-wider">Circuit Breaker</span>
          <span className={`text-2xl font-bold ${cbColor}`}>{cbState}</span>
        </div>
        <div className="bg-netflix-dark p-4 rounded-lg border border-gray-800 flex flex-col justify-center">
          <span className="text-sm text-netflix-gray uppercase tracking-wider">Nodos</span>
          <span className="text-2xl font-bold">{activos} / {totalNodos}</span>
        </div>
        <div className="bg-netflix-dark p-4 rounded-lg border border-gray-800 flex flex-col justify-center">
          <span className="text-sm text-netflix-gray uppercase tracking-wider">Último Tiempo Promedio</span>
          <span className="text-2xl font-bold">{ultima ? `${ultima.tiempo_respuesta_ms} ms` : 'N/A'}</span>
        </div>
        <div className="bg-netflix-dark p-4 rounded-lg border border-gray-800 flex flex-col justify-center">
          <span className="text-sm text-netflix-gray uppercase tracking-wider">Database SQLite</span>
          <span className="text-2xl font-bold text-green-500">Conectada ✔</span>
        </div>
      </div>

      {/* Grid Central */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna 1: Tarjetas de Estado (2, 3 y 8) */}
        <div className="space-y-4">
          <div className="bg-netflix-dark p-5 rounded-lg border border-gray-800">
            <h3 className="font-bold mb-3 border-b border-gray-700 pb-2">Circuit Breaker</h3>
            <div className="flex justify-between mb-1">
              <span className="text-netflix-gray">Estado</span>
              <span className={`font-bold ${cbColor}`}>{cbState}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-netflix-gray">Fallos consecutivos</span>
              <span className="font-bold">{data.circuit_breaker?.fallos_acumulados || 0}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-netflix-gray">Timeout configurado</span>
              <span className="font-bold">10 s</span>
            </div>
          </div>

          <div className="bg-netflix-dark p-5 rounded-lg border border-gray-800">
            <h3 className="font-bold mb-3 border-b border-gray-700 pb-2">Balanceador</h3>
            <div className="flex justify-between mb-1">
              <span className="text-netflix-gray">Algoritmo</span>
              <span className="font-bold">Round Robin</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-netflix-gray">Heartbeat</span>
              <span className="font-bold text-green-500">Activo</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-netflix-gray">Nodo seleccionado</span>
              <span className="font-bold">{data.balanceador?.nodo_seleccionado_round_robin || '-'}</span>
            </div>
          </div>

          <div className="bg-netflix-dark p-5 rounded-lg border border-gray-800">
            <h3 className="font-bold mb-3 border-b border-gray-700 pb-2">SQLite (nodos.db)</h3>
            <div className="flex justify-between mb-1">
              <span className="text-netflix-gray">Circuit Logs</span>
              <span className="font-bold">{cbHistory.length} Eventos</span>
            </div>
          </div>
        </div>

        {/* Columna 2: Nodos y Diagrama (4 y 5) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-netflix-dark p-5 rounded-lg border border-gray-800">
             <h3 className="font-bold mb-4 text-center">Topología de Red</h3>
             <div className="flex flex-col items-center gap-4 py-4">
                <div className="bg-gray-800 px-6 py-2 rounded border border-gray-600">Orquestador (Puerto 8000)</div>
                <div className="w-1 h-6 bg-gray-600"></div>
                <div className="bg-gray-800 px-6 py-2 rounded border border-gray-600">Balanceador (Puerto 8080)</div>
                <div className="w-1 h-6 bg-gray-600"></div>
                
                <div className="flex gap-4 w-full justify-center flex-wrap">
                  {nodos.map((n, i) => {
                     const isActive = n.estado === "ACTIVO";
                     const ip = n.url ? n.url.replace('http://', '').split(':')[0] : '??.??.??.??';
                     return (
                       <div key={n.id} className="bg-gray-900 border border-gray-700 p-3 rounded-lg text-center text-sm w-36">
                         <div className="font-bold">{n.id}</div>
                         <div className="text-xs text-netflix-gray my-1">Puerto {9001 + i}</div>
                         <div className="text-xs font-mono text-blue-400">{ip}</div>
                         <div className="mt-2 text-xl">{isActive ? '🟢' : '🔴'}</div>
                       </div>
                     )
                  })}
                </div>
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             {nodos.map((n, i) => {
               const ip = n.url ? n.url.replace('http://', '').split(':')[0] : 'Sin IP';
               return (
                <div key={n.id} className="bg-netflix-dark p-4 rounded-lg border border-gray-800 text-sm">
                   <div className="font-bold mb-2">Nodo {i+1} — {n.id}</div>
                   <div className="flex justify-between"><span className="text-netflix-gray">IP:</span> <span className="font-mono text-blue-400">{ip}</span></div>
                   <div className="flex justify-between"><span className="text-netflix-gray">Puerto:</span> <span>{9001 + i}</span></div>
                   <div className="flex justify-between"><span className="text-netflix-gray">Estado:</span> <span className={n.estado === 'ACTIVO' ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>{n.estado}</span></div>
                </div>
               );
             })}
          </div>
        </div>
      </div>

      {/* Tablas Inferiores (6) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-netflix-dark p-5 rounded-lg border border-gray-800">
          <h3 className="font-bold mb-4 border-b border-gray-700 pb-2">Última Petición Realizada</h3>
          {ultima ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-netflix-gray">Respuesta HTTP:</span> <span className="font-mono">JSON</span></div>
              <div className="flex justify-between"><span className="text-netflix-gray">Tiempo:</span> <span className="font-bold">{ultima.tiempo_respuesta_ms} ms</span></div>
              <div className="mt-4 p-3 bg-black rounded border border-gray-800 text-xs text-green-400 font-mono break-words">
                {ultima.mensaje || "Sin mensaje"}
              </div>
            </div>
          ) : (
             <div className="text-netflix-gray text-sm">Aún no se ha registrado ninguna petición.</div>
          )}
        </div>

        <div className="bg-netflix-dark p-5 rounded-lg border border-gray-800 overflow-hidden">
          <h3 className="font-bold mb-4 border-b border-gray-700 pb-2">Historial Circuit Breaker (Top 10)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-netflix-gray border-b border-gray-800">
                  <th className="pb-2 font-normal">ID</th>
                  <th className="pb-2 font-normal">Estado</th>
                  <th className="pb-2 font-normal">Hora</th>
                </tr>
              </thead>
              <tbody>
                {cbHistory.map((h) => (
                  <tr key={h.id} className="border-b border-gray-800/50">
                    <td className="py-2">{h.id}</td>
                    <td className={`py-2 font-bold ${h.estado === 'CLOSED' ? 'text-green-500' : h.estado === 'HALF_OPEN' ? 'text-yellow-500' : 'text-red-500'}`}>{h.estado}</td>
                    <td className="py-2 text-netflix-gray">{h.timestamp}</td>
                  </tr>
                ))}
                {cbHistory.length === 0 && (
                  <tr><td colSpan="3" className="py-4 text-center text-netflix-gray">Sin eventos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
