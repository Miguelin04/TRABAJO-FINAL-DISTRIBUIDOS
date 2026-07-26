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

  const toggleNode = async (id, currentStatus) => {
    try {
      await fetch('http://localhost:8080/api/simulate-crash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, crash: currentStatus === 'ACTIVO' })
      });
      // La próxima iteración del polling actualizará la UI
    } catch (e) {
      console.error("Error toggling node", e);
    }
  };

  if (!data) return <div className="text-center mt-10 text-slate-400">Cargando datos del Orquestador...</div>;

  const cbState = data.circuit_breaker || "CLOSED";
  const cbColor = cbState === "CLOSED" ? "text-green-500" : cbState === "HALF_OPEN" ? "text-yellow-500" : "text-red-500";
  const cbIconBg = cbState === "CLOSED" ? "bg-green-500/20 text-green-500" : cbState === "HALF_OPEN" ? "bg-yellow-500/20 text-yellow-500" : "bg-red-500/20 text-red-500";
  const cbSub = cbState === "CLOSED" ? "Operación normal" : cbState === "HALF_OPEN" ? "Prueba de red" : "Protegiendo la red";
  const cbSubBg = cbState === "CLOSED" ? "bg-green-900/30 text-green-400" : cbState === "HALF_OPEN" ? "bg-yellow-900/30 text-yellow-400" : "bg-red-900/30 text-red-400";
  
  const nodos = data.nodes || [];
  const activos = nodos.filter(n => n.status === "ACTIVO").length;
  const totalNodos = 3;
  const availPercent = Math.round((activos/totalNodos)*100) || 0;
  
  const metrics = data.metrics || {};
  const quorum = data.quorum_stats || { N:3, W:2, R:2 };
  
  const totalRequests = (metrics.successful_writes || 0) + (metrics.successful_reads || 0) + (metrics.read_repairs || 0);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Título */}
      <div className="border-l-4 border-red-600 pl-4 py-1">
        <h2 className="text-xl font-bold text-white tracking-wide">Observabilidad y Métricas Avanzadas</h2>
        <p className="text-sm text-slate-400">Vista en tiempo real del sistema distribuido</p>
      </div>
      
      {/* 1. Tarjetas KPI (Top Row) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CB */}
        <div className="bg-[#121620] border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${cbIconBg}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.956 11.956 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 uppercase">Circuit Breaker</span>
            <span className={`text-xl font-bold ${cbColor}`}>{cbState}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-sm mt-1 w-max ${cbSubBg}`}>{cbSub}</span>
          </div>
        </div>
        
        {/* Nodos */}
        <div className="bg-[#121620] border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 uppercase">Nodos Vivos (Heartbeat)</span>
            <span className="text-xl font-bold text-white">{activos} / {totalNodos}</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-sm mt-1 w-max">{availPercent}% disponibles</span>
          </div>
        </div>

        {/* Quorum */}
        <div className="bg-[#121620] border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 uppercase">Quórum Configurado</span>
            <span className="text-xl font-bold text-blue-400">N={quorum.N}, W={quorum.W}, R={quorum.R}</span>
            <span className="text-[10px] bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-sm mt-1 w-max">Tolerancia a 1 fallo</span>
          </div>
        </div>

        {/* Latency */}
        <div className="bg-[#121620] border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 uppercase">Latencia Promedio</span>
            <span className="text-xl font-bold text-green-400">{metrics.avg_latency_ms} ms</span>
            <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded-sm mt-1 w-max">Excelente</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Columna Izquierda: Métricas */}
        <div className="space-y-4 lg:col-span-1">
          {/* Rendimiento */}
          <div className="bg-[#121620] p-5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path></svg>
              <h3 className="font-bold text-white text-sm">Rendimiento (Quórum)</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Escrituras (W=2) Exitosas</span>
                <span className="font-bold text-blue-400">{metrics.successful_writes}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Lecturas (R=2) Exitosas</span>
                <span className="font-bold text-blue-400">{metrics.successful_reads}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total de Likes Globales</span>
                <span className="font-bold text-white">{metrics.total_likes}</span>
              </div>
            </div>
          </div>

          {/* Resolución Conflictos */}
          <div className="bg-[#121620] p-5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.956 11.956 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              <h3 className="font-bold text-white text-sm">Resolución de Conflictos</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Read Repairs Ejecutados</span>
                <span className="font-bold text-yellow-500">{metrics.read_repairs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Write Wins Aplicados</span>
                <span className="font-bold text-yellow-500">{metrics.last_write_wins_executed}</span>
              </div>
            </div>
          </div>

          {/* Heurística */}
          <div className="bg-[#121620] p-5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
              <h3 className="font-bold text-white text-sm">Heurística de Red</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Nodo más rápido (Líder)</span>
                <span className="font-mono text-green-400">{metrics.leader_node_heuristic || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nodo más lento</span>
                <span className="font-mono text-red-400">{metrics.slowest_node || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Generales */}
          <div className="bg-[#121620] p-5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path></svg>
              <h3 className="font-bold text-white text-sm">Métricas Generales</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Total Peticiones</span>
                <span className="font-bold text-blue-400">{totalRequests}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Peticiones Exitosas</span>
                <span className="font-bold text-green-400">{totalRequests}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Peticiones Fallidas</span>
                <span className="font-bold text-red-500">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Disponibilidad Global</span>
                <span className="font-bold text-yellow-500">{availPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Topología y Control */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Topología Visual */}
          <div className="bg-[#121620] border border-slate-800 rounded-xl p-6 relative">
            <div className="text-center mb-6">
              <h3 className="text-white font-bold text-lg">Topología de Red</h3>
              <p className="text-xs text-slate-400">Vista estructural de la arquitectura distribuida</p>
            </div>
            
            {/* Leyenda Absoluta */}
            <div className="hidden lg:block absolute top-6 right-6 border border-slate-800 bg-[#0b0e14]/80 p-3 rounded-lg backdrop-blur text-[10px]">
              <div className="font-bold text-white mb-2">Leyenda</div>
              <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span><span className="text-slate-300">Coordinador (Quórum)</span></div>
              <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span><span className="text-slate-300">Balanceador (Heartbeat/RR)</span></div>
              <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-green-500"></span><span className="text-slate-300">Nodos Activos (Quórum N=3)</span></div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-500"></span><span className="text-slate-300">Nodo Standby (No participa)</span></div>
            </div>

            {/* Árbol */}
            <div className="flex flex-col items-center">
              {/* Orquestador */}
              <div className="border border-purple-500/50 bg-purple-900/10 px-6 py-3 rounded-lg flex items-center gap-3 shadow-[0_0_15px_rgba(168,85,247,0.1)] z-10">
                <div className="text-2xl">🧠</div>
                <div className="text-left">
                  <div className="font-bold text-purple-300 text-sm">ORQUESTADOR (COORDINADOR)</div>
                  <div className="text-xs text-slate-400">Puerto 8000</div>
                </div>
              </div>

              {/* Conector */}
              <div className="w-px h-8 bg-slate-600"></div>
              <div className="text-slate-500 text-xs mt-[-16px] bg-[#121620] px-1 z-10">↓</div>

              {/* Balanceador */}
              <div className="border border-blue-500/50 bg-blue-900/10 px-6 py-2 rounded-lg flex items-center gap-3 z-10">
                <div className="text-2xl">⚖️</div>
                <div className="text-left">
                  <div className="font-bold text-blue-300 text-sm">BALANCEADOR</div>
                  <div className="text-xs text-slate-400">Puerto 8080</div>
                </div>
              </div>

              {/* Ramas */}
              <div className="w-px h-6 bg-slate-600 mt-2"></div>
              <div className="w-[60%] lg:w-[45%] h-px bg-slate-600 relative">
                <div className="absolute -left-[1px] top-0 w-px h-6 bg-slate-600 border-l border-dashed"></div>
                <div className="absolute left-[50%] top-0 w-px h-6 bg-slate-600 border-l border-dashed"></div>
                <div className="absolute -right-[1px] top-0 w-px h-6 bg-slate-600 border-l border-dashed"></div>
              </div>

              {/* Nodos Visuales Compactos */}
              <div className="flex w-[70%] lg:w-[55%] justify-between mt-6">
                {[1, 2, 3].map(id => {
                  const nodeData = nodos.find(n => n.id === `Integrante${id}`);
                  const isActive = nodeData ? nodeData.status === "ACTIVO" : false;
                  const ip = `192.168.1.1${id}`;
                  const port = 9000 + id;
                  return (
                    <div key={id} className={`border ${isActive ? 'border-green-500/30 bg-[#0b0e14]' : 'border-red-500/30 bg-red-950/20'} px-4 py-2 rounded-lg text-center shadow-lg transition-colors`}>
                      <div className="font-bold text-white text-xs mb-1">INTEGRANTE {id}</div>
                      <div className="text-[10px] text-slate-400">Puerto {port}</div>
                      <div className="text-[10px] text-slate-400 mb-2">{ip}</div>
                      <div className="text-sm">{isActive ? '🟢' : '🔴'}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Cards Estado de los Nodos */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-blue-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              </div>
              <div>
                <h3 className="font-bold text-white">Estado de los Nodos</h3>
                <p className="text-xs text-slate-400">Información detallada de cada nodo de la red</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(id => {
                const isStandby = id === 4;
                const nodeData = nodos.find(n => n.id === `Integrante${id}`);
                const isActive = nodeData ? nodeData.status === "ACTIVO" : false;
                
                const titleStr = isStandby ? `Nodo ${id} — reserva (standby)` : `Nodo ${id} — integrante${id}`;
                const ipStr = `192.168.1.1${id}`;
                const portStr = 9000 + id;
                const statusStr = isStandby ? "STANDBY" : (isActive ? "ACTIVO" : "INACTIVO");
                const statusColor = isStandby ? "text-slate-500" : (isActive ? "text-green-500" : "text-red-500");
                const badgeColor = isStandby ? "bg-slate-700/50 text-slate-300" : (isActive ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500");
                const roleStr = isStandby ? "NO PARTICIPA" : "PARTICIPA (W=2, R=2)";
                const latStr = isStandby ? "18 ms" : (isActive ? `${10 + id * 2} ms` : "N/A");
                const latColor = isStandby ? "text-yellow-500" : (isActive ? "text-green-500" : "text-slate-500");
                
                return (
                  <div key={id} className={`bg-[#121620] border ${isStandby ? 'border-slate-800 opacity-70' : 'border-slate-700'} p-4 rounded-xl flex flex-col justify-between`}>
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] text-white font-semibold truncate mr-2">{titleStr}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${badgeColor}`}>{statusStr}</span>
                      </div>
                      
                      <div className="space-y-2 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400 flex items-center gap-1"><span className="w-2.5 h-2.5 opacity-50">🌐</span> IP</span>
                          <span className="text-blue-400">{ipStr}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 flex items-center gap-1"><span className="w-2.5 h-2.5 opacity-50">🔌</span> Puerto</span>
                          <span className="text-slate-300">{portStr}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 flex items-center gap-1"><span className="w-2.5 h-2.5 opacity-50">⚡</span> Estado</span>
                          <span className={`font-bold ${statusColor}`}>{statusStr}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-800 pt-2 mt-2">
                          <span className="text-slate-400 flex items-center gap-1"><span className="w-2.5 h-2.5 opacity-50">⚙️</span> Rol en Quórum</span>
                        </div>
                        <div className="text-right text-slate-300 mb-2">{roleStr}</div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 flex items-center gap-1"><span className="w-2.5 h-2.5 opacity-50">⏱️</span> Latencia</span>
                          <span className={`font-bold ${latColor}`}>{latStr}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[9px] text-slate-500">📺 Simulador</span>
                      {isStandby ? (
                        <button className="text-[10px] bg-slate-800 text-slate-400 px-3 py-1 rounded cursor-not-allowed">Standby</button>
                      ) : (
                        <button 
                          onClick={() => toggleNode(`Integrante${id}`, statusStr)}
                          className={`text-[10px] px-3 py-1 rounded font-bold transition-colors ${isActive ? 'bg-red-900/40 text-red-400 hover:bg-red-900/60' : 'bg-green-900/40 text-green-400 hover:bg-green-900/60'}`}
                        >
                          {isActive ? 'Apagar Nodo' : 'Encender Nodo'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Timeline CB */}
          <div className="bg-[#121620] border border-slate-800 rounded-xl p-0 overflow-hidden shadow-lg">
             <div className="px-5 py-3 border-b border-slate-800 bg-[#0b0e14]">
               <h3 className="font-bold text-white text-sm">Timeline del Circuit Breaker</h3>
             </div>
             
             <div className="max-h-64 overflow-y-auto bg-[#0b0e14]">
                 {(!data.historial_circuit_breaker || data.historial_circuit_breaker.length === 0) ? (
                     <div className="p-6 text-center">
                        <p className="text-slate-500 text-sm italic">No hay eventos registrados en el log SQLite aún.</p>
                     </div>
                 ) : (
                     <div className="flex flex-col">
                         {data.historial_circuit_breaker.map((h, i) => {
                             let color = "text-green-500";
                             let borderColor = "border-l-green-500";
                             let icon = "🔒";
                             let explanation = "Operación Normal. Las peticiones fluyen hacia el Quórum sin restricciones.";
                             
                             if (h.estado === 'OPEN') {
                                 color = "text-red-500";
                                 borderColor = "border-l-red-500";
                                 icon = "❌";
                                 explanation = "Fallo de Quórum detectado. El circuito se ABRE para proteger la red. Peticiones bloqueadas.";
                             } else if (h.estado === 'HALF_OPEN') {
                                 color = "text-yellow-500";
                                 borderColor = "border-l-yellow-500";
                                 icon = "⚠️";
                                 explanation = "Tiempo de espera concluido. El circuito permite una petición de prueba para verificar recuperación.";
                             }

                             return (
                                 <div key={i} className={`flex items-start justify-between p-4 border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors border-l-4 ${borderColor}`}>
                                    <div className="flex items-start gap-3">
                                      <span className="text-sm mt-0.5">{icon}</span>
                                      <div>
                                        <div className={`font-bold text-xs mb-1 ${color}`}>{h.estado}</div>
                                        <div className="text-[11px] text-slate-400">{explanation}</div>
                                      </div>
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono pt-0.5 whitespace-nowrap ml-4">
                                      {h.timestamp}
                                    </div>
                                 </div>
                             );
                         })}
                     </div>
                 )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
