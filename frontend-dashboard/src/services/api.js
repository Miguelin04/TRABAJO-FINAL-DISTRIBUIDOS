const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const fetchStatus = async () => {
  try {
    const response = await fetch(`${API_URL}/status`);
    if (!response.ok) throw new Error('Error de red');
    return await response.json();
  } catch (error) {
    console.error("Error al obtener status:", error);
    return null;
  }
};

export const procesarPago = async () => {
  try {
    const response = await fetch(`${API_URL}/`);
    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    console.error("Error al procesar pago:", error);
    return { data: null, status: 500 };
  }
};
