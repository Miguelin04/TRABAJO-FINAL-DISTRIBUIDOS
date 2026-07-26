from http.server import BaseHTTPRequestHandler
import json

class BalancerHandler(BaseHTTPRequestHandler):
    
    # Inyectamos el balancer a nivel de clase desde main.py
    load_balancer = None
    
    def _send_json_response(self, code, payload):
        self.send_response(code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        if self.path == '/health':
            self._send_json_response(200, {"status": "UP"})
            return
            
        if self.path == '/nodes/status':
            # Reutiliza el estado en memoria mantenido por el Heartbeat de la Práctica 16
            nodes_status = []
            if self.load_balancer and self.load_balancer.servers:
                for srv in self.load_balancer.servers:
                    nodes_status.append({
                        "id": srv.id,
                        "url": srv.address,
                        "status": "ACTIVO" if srv.status == 'ACTIVO' else "INACTIVO"
                    })
            self._send_json_response(200, {"nodes": nodes_status})
            return

        self._proxy_request("GET")

    def do_POST(self):
        if self.path == '/api/simulate-crash':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            try:
                data = json.loads(body)
                node_id = data.get('id')
                crash = data.get('crash', True)
                for srv in self.load_balancer.servers:
                    if srv.id == node_id:
                        srv.simulated_crash = crash
                        if not crash:
                            srv._consecutive_failures = 0
                self._send_json_response(200, {"status": "success"})
            except Exception as e:
                self._send_json_response(400, {"error": str(e)})
            return
            
        self._proxy_request("POST")

    def _proxy_request(self, method):
        chosen_server, reason = self.load_balancer.select_backend()
        
        if not chosen_server:
            self._send_json_response(503, {"error": reason})
            return

        # Leer body si existe
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length) if content_length > 0 else None
        
        # Enviar petición al nodo seleccionado mediante el método OOP del servidor
        status, response_data, _ = chosen_server.proxy_request(
            method=method,
            path=self.path,
            headers=dict(self.headers),
            body=body
        )
        
        # Devolver la respuesta al cliente
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(response_data)

