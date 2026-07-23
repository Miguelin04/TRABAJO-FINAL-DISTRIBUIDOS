import threading
import time
import urllib.request
import urllib.error
import json

class BackendServer:
    """Encapsula el estado en memoria de un nodo backend."""
    
    def __init__(self, server_id, address):
        self.id = server_id
        self.address = address
        self.lock = threading.Lock()

        # Estado en memoria
        self.status = 'INACTIVO'
        self.latency = 0
        self.active_connections = 0
        self.total_requests = 0
        self.successful = 0
        self.failed = 0
        self._consecutive_failures = 0
        self._latency_samples = []
        self.simulated_crash = False

    def check_health(self):
        """Realiza el ping al backend usando urllib (biblioteca estándar)."""
        start = time.time()
        url = f"{self.address}/health"
        
        if self.simulated_crash:
            # Si simulamos caída, saltamos directo a la lógica de fallo
            pass
        else:
            try:
                req = urllib.request.Request(url, method="GET")
                with urllib.request.urlopen(req, timeout=1.0) as response:
                    elapsed = (time.time() - start) * 1000
                    if response.status == 200:
                        with self.lock:
                            self._latency_samples.append(elapsed)
                            if len(self._latency_samples) > 10:
                                self._latency_samples.pop(0)
                            self.latency = sum(self._latency_samples) / len(self._latency_samples)
                            self._consecutive_failures = 0
                            
                            changed = (self.status != 'ACTIVO')
                            self.status = 'ACTIVO'
                            return changed
            except Exception:
                pass

        with self.lock:
            self._consecutive_failures += 1
            if self._consecutive_failures >= 1:
                changed = (self.status != 'INACTIVO')
                self.status = 'INACTIVO'
                self.latency = 9999
                return changed
            
        return False

    def proxy_request(self, method, path, headers, body):
        """Reenvía la petición HTTP de negocio al backend usando urllib."""
        if self.simulated_crash:
            with self.lock:
                self.active_connections -= 1
                self.failed += 1
                self._consecutive_failures += 1
                if self._consecutive_failures >= 1:
                    self.status = 'INACTIVO'
            return 502, b'{"error": "Simulated Crash - Nodo apagado"}', {}

        with self.lock:
            self.active_connections += 1
            self.total_requests += 1

        url = f'{self.address}{path}'
        
        # Limpiar headers conflictivos
        clean_headers = {}
        for k, v in headers.items():
            if k.lower() not in ('host', 'content-length'):
                clean_headers[k] = v

        try:
            req = urllib.request.Request(url, data=body, headers=clean_headers, method=method)
            with urllib.request.urlopen(req, timeout=10.0) as response:
                data = response.read()
                status = response.status
                resp_headers = dict(response.headers)
                
                with self.lock:
                    self.active_connections -= 1
                    self.successful += 1
                    self._consecutive_failures = 0
                return status, data, resp_headers
        except urllib.error.HTTPError as e:
            with self.lock:
                self.active_connections -= 1
                self.successful += 1 # Es error HTTP del negocio, pero el nodo respondió
                self._consecutive_failures = 0
            return e.code, e.read(), dict(e.headers)
        except Exception as e:
            with self.lock:
                self.active_connections -= 1
                self.failed += 1
                self._consecutive_failures += 1
                if self._consecutive_failures >= 1:
                    self.status = 'INACTIVO'
            return 502, b'{"error": "Bad Gateway - Nodo fallido durante request"}', {}
