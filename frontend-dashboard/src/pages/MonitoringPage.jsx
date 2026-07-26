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

  if (!data) return <div className="text-center mt-10">Cargando datos del Orquestador...</div>;

  const cbState = data.circuit_breaker || "CLOSED";
  const cbColor = cbState === "CLOSED" ? "text-green-500" : cbState === "HALF_OPEN" ? "text-yellow-500" : "text-red-500";
  
  const nodos = data.nodes || [];
  const activos = nodos.filter(n => n.status === "ACTIVO").length;
  const totalNodos = nodos.length || 4;
  
  const metrics = data.metrics || {};
  const quorum = data.quorum_stats || { N:3, W:2, R:2 };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-l-4 border-blue-500 pl-3">
        <h2 className="text-2xl font-bold">Observabilidad y Métricas Avanzadas</h2>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className={`w-3 h-3 rounded-full animate-pulse ${error ? 'bg-red-500' : 'bg-green-500'}`}></span>
          Polling activo (2s)
        </div>
      </div>
      
      {/* 1. Quick Metrics (Top Row) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 text-white p-4 rounded-lg border border-gray-800 flex flex-col">
          <span className="text-xs text-gray-500 uppercase">Circuit Breaker</span>
          <span className={`text-2xl font-bold ${cbColor}`}>{cbState}</span>
        </div>
        <div className="bg-gray-900 text-white p-4 rounded-lg border border-gray-800 flex flex-col">
          <span className="text-xs text-gray-500 uppercase">Nodos Vivos (Heartbeat)</span>
          <span className="text-2xl font-bold">{activos} / {totalNodos}</span>
        </div>
        <div className="bg-gray-900 text-white p-4 rounded-lg border border-gray-800 flex flex-col">
          <span className="text-xs text-gray-500 uppercase">Quórum Configurado</span>
          <span className="text-xl font-bold text-blue-400">N={quorum.N}, W={quorum.W}, R={quorum.R}</span>
        </div>
        <div className="bg-gray-900 text-white p-4 rounded-lg border border-gray-800 flex flex-col">
          <span className="text-xs text-gray-500 uppercase">Latencia Promedio</span>
          <span className="text-2xl font-bold text-green-400">{metrics.avg_latency_ms} ms</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Métricas Específicas */}
        <div className="space-y-4">
          <div className="bg-gray-900 text-white p-5 rounded-lg border border-gray-800">
            <h3 className="font-bold mb-3 border-b border-gray-700 pb-2">Rendimiento (Quórum)</h3>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">Escrituras (W=2) Exitosas</span>
              <span className="font-bold text-blue-400">{metrics.successful_writes}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">Lecturas (R=2) Exitosas</span>
              <span className="font-bold text-green-400">{metrics.successful_reads}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">Total de Likes Globales</span>
              <span className="font-bold text-white">{metrics.total_likes}</span>
            </div>
          </div>

          <div className="bg-gray-900 text-white p-5 rounded-lg border border-gray-800">
            <h3 className="font-bold mb-3 border-b border-gray-700 pb-2">Resolución de Conflictos</h3>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">Read Repairs Ejecutados</span>
              <span className="font-bold text-yellow-500">{metrics.read_repairs}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">Last Write Wins Aplicados</span>
              <span className="font-bold text-orange-400">{metrics.last_write_wins_executed}</span>
            </div>
          </div>

          <div className="bg-gray-900 text-white p-5 rounded-lg border border-gray-800">
            <h3 className="font-bold mb-3 border-b border-gray-700 pb-2">Heurística de Red</h3>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">Nodo más rápido (Líder)</span>
              <span className="font-mono text-xs text-green-400">{metrics.leader_node_heuristic}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">Nodo más lento</span>
              <span className="font-mono text-xs text-red-400">{metrics.slowest_node}</span>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Topología */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#0f111a] border border-gray-800 rounded-xl p-6 relative shadow-lg h-full">
            <h3 className="text-gray-100 font-bold mb-6 text-center">Topología y Salud de la Red</h3>
            
            {/* Panel de Fallos */}
            <div className="bg-black border border-blue-900/50 p-4 rounded-lg mb-8 text-sm">
              <span className="text-blue-400 font-bold block mb-2">Panel de Simulador de Fallos:</span> Utiliza estos controles para apagar/encender nodos y probar el <span className="italic">Circuit Breaker</span> y el <span className="italic">Read Repair</span> en tiempo real.
              <div className="flex justify-center gap-4 mt-4 flex-wrap">
                 {[1, 2, 3].map(id => (
                    <div key={id} className="flex gap-2">
                        <button onClick={() => fetch('http://localhost:8080/api/simulate-crash', { method: 'POST', body: JSON.stringify({id: `Integrante${id}`, crash: true})})} className="bg-red-900/40 hover:bg-red-800 border border-red-700 text-red-200 px-3 py-1 rounded text-xs transition">Apagar Nodo {id}</button>
                        <button onClick={() => fetch('http://localhost:8080/api/simulate-crash', { method: 'POST', body: JSON.stringify({id: `Integrante${id}`, crash: false})})} className="bg-green-900/40 hover:bg-green-800 border border-green-700 text-green-200 px-3 py-1 rounded text-xs transition">Encender Nodo {id}</button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Topology Diagram */}
            <div className="flex flex-col items-center gap-2 py-2">
               {/* Orquestador */}
               <div className="bg-gray-800 text-white px-8 py-3 rounded border border-gray-700 shadow-md font-bold">
                 Orquestador (Coordinador)
               </div>
               
               <div className="w-1 h-6 bg-gray-700 animate-pulse"></div>

               {/* Balanceador */}
               <div className="bg-blue-900/20 text-blue-300 px-6 py-2 rounded-full border border-blue-800 shadow-md font-bold text-sm">
                 Balanceador de Carga (Provee Status/Heartbeat)
               </div>

               <div className="w-1 h-6 bg-gray-700"></div>
               
               {/* Nodos */}
               <div className="flex gap-4 w-full justify-center flex-wrap mt-2">
                 {nodos.map((n, i) => {
                    const isActive = n.status === "ACTIVO";
                    return (
                      <div key={n.id} className={`border p-4 rounded-lg text-center w-40 transition-colors ${isActive ? 'bg-[#0a0a0a] border-green-500/30' : 'bg-red-900/10 border-red-500/50'}`}>
                        <div className="font-bold mb-1 truncate text-gray-200">{n.id}</div>
                        <div className="text-xs text-gray-500 mb-3">{i === 3 ? '(Standby/Reserva)' : `Principal ${i+1}`}</div>
                        <div className="text-3xl mb-2">{isActive ? '🟢' : '🔴'}</div>
                        <div className={`text-xs font-bold ${isActive ? 'text-green-500' : 'text-red-500'}`}>
                          {n.status}
                        </div>
                      </div>
                    )
                 })}
               </div>
            </div>
            
            {/* Historial Circuit Breaker */}
            <div className="mt-8 pt-6 border-t border-gray-800">
               <h3 className="font-bold mb-4 text-center text-gray-200">Historial del Circuit Breaker</h3>
               <div className="max-h-40 overflow-y-auto bg-black p-4 rounded border border-gray-800">
                   {(data.historial_circuit_breaker || []).map((h, i) => (
                       <div key={i} className="flex justify-between text-xs py-1 border-b border-gray-800/50 last:border-0">
                           <span className="text-gray-500">{h.timestamp}</span>
                           <span className={`font-bold ${h.estado === 'CLOSED' ? 'text-green-500' : h.estado === 'HALF_OPEN' ? 'text-yellow-500' : 'text-red-500'}`}>
                               Estado cambió a: {h.estado}
                           </span>
                       </div>
                   ))}
                   {(!data.historial_circuit_breaker || data.historial_circuit_breaker.length === 0) && (
                       <div className="text-center text-gray-500 italic">No hay eventos registrados en el log SQLite.</div>
                   )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
