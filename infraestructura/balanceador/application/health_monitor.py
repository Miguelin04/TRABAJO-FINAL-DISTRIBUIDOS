import threading
import time

class HealthMonitor:
    """Arquitectura Multihilo (Heartbeat) conservada del prototipo."""
    
    def __init__(self, load_balancer, db_repository, interval=2):
        self.balancer = load_balancer
        self.db = db_repository
        self.interval = interval

    def health_checker_loop(self):
        """Bucle infinito que lanza hilos para sondear los nodos."""
        while True:
            # Hacemos una instantánea de los servidores para no bloquear el balanceador
            with self.balancer.lock:
                servers_snapshot = list(self.balancer.servers)
                
            threads = []
            results = {}

            # Definimos el worker para el hilo
            def worker(srv):
                # El health_check retorna True si el estado cambió
                changed = srv.check_health()
                if changed:
                    results[srv] = True

            # Disparamos el chequeo concurrente
            for s in servers_snapshot:
                t = threading.Thread(target=worker, args=(s,), daemon=True)
                t.start()
                threads.append(t)
                
            for t in threads:
                t.join(timeout=4) # HEALTH_TIMEOUT + 1
                
            # Si hubo cambios, los registramos usando el repositorio de SQLite
            # Aislando la persistencia de la lógica de red
            for srv, changed in results.items():
                if changed:
                    self.db.update_node_state(srv.id, srv.status, srv.url)

            time.sleep(self.interval)

    def start(self):
        """Despliega el hilo de fondo (daemon) que corre el checker."""
        t = threading.Thread(target=self.health_checker_loop, daemon=True)
        t.start()
