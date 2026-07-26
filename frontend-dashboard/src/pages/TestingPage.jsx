import React, { useState, useEffect } from 'react';
import { likePost, getPost, fetchStatus } from '../services/api';

export default function TestingPage() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [postData, setPostData] = useState({ likes: 0, version: 0, timestamp: 0 });
  const [requestLog, setRequestLog] = useState([]);

  const addLog = (method, endpoint, status, message) => {
    const timestamp = new Date().toLocaleTimeString();
    setRequestLog(prev => [{ timestamp, method, endpoint, status, message }, ...prev].slice(0, 10));
  };

  const handleLike = async () => {
    setLoading(true);
    addLog("POST", "/api/posts/post-123/like", "PENDING", "Enviando Escritura a N=3...");
    const result = await likePost("post-123");
    setResponse(result);
    if (result.status === 200) {
      addLog("POST", "/api/posts/post-123/like", "200 OK", "Quórum W=2 alcanzado exitosamente.");
      fetchPostData();
    } else {
      addLog("POST", "/api/posts/post-123/like", "ERROR", result.error || "Fallo en Quórum/Circuit Breaker");
    }
    setLoading(false);
  };

  const fetchPostData = async () => {
    addLog("GET", "/api/posts/post-123", "PENDING", "Enviando Lectura a N=3...");
    const result = await getPost("post-123");
    if (result.status === 200 && result.data && result.data.postState) {
      setPostData(result.data.postState);
      setResponse(result); // Show the read result too
      addLog("GET", "/api/posts/post-123", "200 OK", `Quórum R=2 alcanzado. ${result.data.mensaje || ''}`);
    } else {
      addLog("GET", "/api/posts/post-123", "ERROR", "Fallo al leer datos del Quórum.");
    }
  };

  useEffect(() => {
    fetchPostData();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold border-l-4 border-blue-500 pl-3">
        Red Social Global (Simulador)
      </h2>
      
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 flex gap-6 items-start">
        {/* Mock Post */}
        <div className="bg-black border border-gray-700 rounded-lg p-5 w-1/2 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">U</div>
                <div>
                    <h3 className="font-bold text-gray-100">Usuario Distribuidos</h3>
                    <p className="text-xs text-gray-500">@distribuidos_unl</p>
                </div>
            </div>
            <p className="text-gray-300 mb-4">
                ¡Implementando un sistema distribuido con Quórum N=3, W=2, R=2, Last Write Wins y Read Repair! 🚀
            </p>
            <div className="bg-gray-800 rounded mb-4 h-32 flex items-center justify-center text-gray-500">
                [Imagen de Arquitectura]
            </div>
            
            <div className="flex items-center gap-2 border-t border-gray-800 pt-3">
                <button 
                  onClick={handleLike}
                  disabled={loading}
                  className={`flex items-center gap-2 text-xl font-bold py-2 px-4 rounded-full transition-transform active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed text-gray-500' : 'text-blue-500 hover:bg-blue-900/30'}`}
                >
                  ❤️ {postData.likes}
                </button>
                <span className="text-xs text-gray-500 ml-auto">
                    Versión: {postData.version} | TS: {postData.timestamp}
                </span>
            </div>
        </div>
        
        {/* Acciones e Info */}
        <div className="w-1/2 flex flex-col justify-center">
            <p className="text-gray-400 mb-6 text-sm">
              Al hacer clic en "Like", el Orquestador lanza 3 hilos (N=3) a los nodos de almacenamiento en memoria. 
              La operación requiere W=2 para ser exitosa. 
              Al recargar o leer, requiere R=2 y aplica Last Write Wins.
            </p>
            <div className="flex gap-4">
                <button 
                    onClick={handleLike}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded shadow-lg transition-transform active:scale-95"
                >
                    {loading ? 'Procesando Quórum...' : 'Escribir (W=2)'}
                </button>
                <button 
                    onClick={fetchPostData}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded shadow-lg transition-transform active:scale-95"
                >
                    Leer (R=2)
                </button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* JSON Response Panel */}
        <div className="bg-[#0a0a0a] p-4 rounded-lg border border-gray-800 font-mono text-sm overflow-x-auto min-h-[300px] relative shadow-inner">
          <div className="absolute top-4 right-4 text-xs text-gray-500">Última Respuesta JSON (Orquestador)</div>
          {response ? (
            <pre className="text-green-400 whitespace-pre-wrap mt-6">
              {JSON.stringify(response.data || response.error, null, 2)}
            </pre>
          ) : (
            <div className="text-gray-600 mt-6">// Esperando operaciones de red...</div>
          )}
        </div>
        
        {/* Request History Log Panel */}
        <div className="bg-black p-4 rounded-lg border border-gray-800 font-mono text-sm overflow-y-auto min-h-[300px] shadow-inner relative">
           <div className="absolute top-4 right-4 text-xs text-gray-500">Historial de Peticiones (Red)</div>
           <div className="mt-8 space-y-2">
              {requestLog.length === 0 ? (
                 <div className="text-gray-600">// Ninguna petición registrada...</div>
              ) : (
                 requestLog.map((log, idx) => (
                    <div key={idx} className="border-b border-gray-800/50 pb-2">
                       <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-500 text-xs">{log.timestamp}</span>
                          <span className={`font-bold px-1 rounded text-xs ${log.method === 'POST' ? 'bg-blue-900/50 text-blue-400' : 'bg-green-900/50 text-green-400'}`}>{log.method}</span>
                          <span className="text-gray-400">{log.endpoint}</span>
                          <span className={`ml-auto font-bold text-xs ${log.status === '200 OK' ? 'text-green-500' : log.status === 'ERROR' ? 'text-red-500' : 'text-yellow-500'}`}>{log.status}</span>
                       </div>
                       <div className="text-gray-400 text-xs pl-16">
                           └─ {log.message}
                       </div>
                    </div>
                 ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
