import threading

class LoadBalancer:
    """Balanceador de carga evolucionado del AILoadBalancer original."""
    
    def __init__(self):
        self.servers = []
        self.lock = threading.Lock()
        self.last_used_index = -1

    def add_server(self, server):
        with self.lock:
            self.servers.append(server)

    def _round_robin_selection(self, available_servers):
        """Selecciona el siguiente nodo activo mediante Round Robin matemático."""
        self.last_used_index = (self.last_used_index + 1) % len(available_servers)
        return available_servers[self.last_used_index]

    def select_backend(self):
        """Devuelve el mejor servidor disponible."""
        with self.lock:
            snapshot = list(self.servers)
            
        # Filtramos los que están ACTIVOS
        active = [s for s in snapshot if s.status == 'ACTIVO']
        
        if not active:
            return None, "Todos los nodos están inactivos"
            
        # Sustituimos _ai_decision() por _round_robin_selection()
        chosen = self._round_robin_selection(active)
        return chosen, f"Seleccionado mediante Round Robin"

    def get_stats(self):
        """Retorna estadísticas globales para el Dashboard (opcional)."""
        with self.lock:
            snapshot = list(self.servers)
            
        return {
            "nodos": [
                {
                    "id": s.id,
                    "estado": s.status,
                    "latencia": s.latency,
                    "conexiones_activas": s.active_connections,
                    "exitos": s.successful,
                    "fallos": s.failed
                } for s in snapshot
            ]
        }
