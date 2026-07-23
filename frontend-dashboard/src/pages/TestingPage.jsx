import React, { useState } from 'react';
import { procesarPago } from '../services/api';

export default function TestingPage() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    const result = await procesarPago();
    setResponse(result);
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold border-l-4 border-netflix-red pl-3">
        Panel de Pruebas Manuales
      </h2>
      
      <div className="bg-netflix-dark p-6 rounded-lg border border-gray-800">
        <p className="text-netflix-gray mb-6">
          Utiliza este panel para enviar peticiones REST al Orquestador (`GET /`). 
          El Orquestador delegará la petición al Balanceador, quien a su vez elegirá un microservicio Spring Boot (Round Robin).
        </p>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handlePayment}
            disabled={loading}
            className={`bg-netflix-red hover:bg-red-700 text-white font-bold py-3 px-8 rounded shadow-lg transition-transform active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Procesando...' : 'Procesar Pago'}
          </button>
          {response && (
            <div className={`px-4 py-2 rounded font-bold ${response.status === 200 ? 'bg-green-900/30 text-green-500' : 'bg-red-900/30 text-red-500'}`}>
              HTTP {response.status}
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#0a0a0a] p-4 rounded-lg border border-gray-800 font-mono text-sm overflow-x-auto min-h-[300px] relative">
        <div className="absolute top-4 right-4 text-xs text-netflix-gray">Respuesta JSON</div>
        {response ? (
          <pre className="text-green-400 whitespace-pre-wrap mt-6">
            {JSON.stringify(response.data, null, 2)}
          </pre>
        ) : (
          <div className="text-gray-600 mt-6">// Haz clic en el botón superior para realizar una petición...</div>
        )}
      </div>
    </div>
  );
}
