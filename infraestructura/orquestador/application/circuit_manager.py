import urllib.request
import urllib.error
import time
import json
from domain.circuit_breaker import CircuitBreaker, CircuitState
from config.settings import Settings

class CircuitManager:
    def __init__(self, db_repository):
        self.circuit_breaker = CircuitBreaker(max_failures=3, reset_timeout=10)
        self.db_repository = db_repository
        self.last_persisted_state = self.circuit_breaker.get_state()
        self.db_repository.insert_circuit_state(self.last_persisted_state)
        
        # Para el endpoint status (historial de peticiones)
        self.historial_peticiones = []

    def execute_request(self):
        start_time = time.time()
        state = self.circuit_breaker.try_reset()
        
        if state != self.last_persisted_state:
            self.db_repository.insert_circuit_state(state)
            self.last_persisted_state = state
            
        if state == CircuitState.OPEN:
            response = {
                "circuit_state": "OPEN",
                "response": {
                    "status": 503,
                    "data": "Servicio temporalmente no disponible (Fallback activo). El sistema está protegido."
                }
            }
            return response
            
        # Llamada al balanceador
        try:
            req = urllib.request.Request(Settings.LOAD_BALANCER_URL)
            with urllib.request.urlopen(req, timeout=3) as res:
                body = res.read().decode('utf-8')
                data = json.loads(body)
                
                new_state = self.circuit_breaker.record_success()
                if new_state != self.last_persisted_state:
                    self.db_repository.insert_circuit_state(new_state)
                    self.last_persisted_state = new_state
                
                response_time = int((time.time() - start_time) * 1000)
                peticion = {
                    "tiempo_respuesta_ms": response_time,
                    "mensaje": data.get("mensaje", ""),
                    "timestamp": time.strftime('%H:%M:%S')
                }
                self.historial_peticiones.insert(0, peticion)
                self.historial_peticiones = self.historial_peticiones[:5] # Mantener solo las últimas 5
                
                return {
                    "circuit_state": new_state,
                    "response": data
                }
                
        except Exception as e:
            new_state = self.circuit_breaker.record_failure()
            if new_state != self.last_persisted_state:
                self.db_repository.insert_circuit_state(new_state)
                self.last_persisted_state = new_state
                
            return {
                "circuit_state": new_state,
                "response": {
                    "status": 500,
                    "data": f"Error interno en la red: {str(e)}"
                }
            }

    def get_dashboard_status(self):
        data = self.db_repository.get_dashboard_data()
        data["circuit_breaker"]["fallos_acumulados"] = self.circuit_breaker.failures
        data["historial_peticiones"] = self.historial_peticiones
        
        # Determinar estado del balanceador basado en si hay nodos activos
        hay_activos = any(n["estado"] == "ACTIVO" for n in data["nodos"])
        data["balanceador"] = {
            "estado": "ACTIVO" if hay_activos else "INACTIVO",
            "nodo_seleccionado_round_robin": "Ver consola de balanceador"
        }
        return data
