from http.server import BaseHTTPRequestHandler
import json

class BalancerHandler(BaseHTTPRequestHandler):
    
    # Inyectamos el balancer a nivel de clase desde main.py
    load_balancer = None
    
    def _send_json_response(self, code, payload):
        self.send_response(code)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode('utf-8'))

    def do_GET(self):
        if self.path == '/health':
            self._send_json_response(200, {"status": "UP"})
            return
            
        self._proxy_request("GET")

    def do_POST(self):
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

