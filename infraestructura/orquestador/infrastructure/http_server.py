import http.server
import json

class OrchestratorHandler(http.server.SimpleHTTPRequestHandler):
    
    def __init__(self, circuit_manager, *args, **kwargs):
        self.circuit_manager = circuit_manager
        super().__init__(*args, **kwargs)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-type")
        self.end_headers()

    def do_GET(self):
        if self.path == '/health':
            self._send_json_response(200, {"status": "UP"})
            return
            
        if self.path == '/':
            result = self.circuit_manager.execute_request()
            self._send_json_response(200, result)
        
        elif self.path == '/status':
            result = self.circuit_manager.get_dashboard_status()
            self._send_json_response(200, result)
            
        else:
            self._send_json_response(404, {"error": "Ruta no encontrada"})

    def do_POST(self):
        if self.path == '/api/simulate-crash':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length > 0 else b'{}'
            try:
                import urllib.request
                req = urllib.request.Request(f"{self.circuit_manager.base_url}api/simulate-crash", data=body, method='POST')
                req.add_header('Content-Type', 'application/json')
                with urllib.request.urlopen(req, timeout=2.0) as response:
                    self._send_json_response(200, {"status": "success"})
            except Exception as e:
                self._send_json_response(500, {"error": str(e)})
            return
            
        self._send_json_response(404, {"error": "Ruta no encontrada"})

    def _send_json_response(self, code, payload):
        self.send_response(code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode('utf-8'))

def create_orchestrator_handler(circuit_manager):
    class CustomHandler(OrchestratorHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(circuit_manager, *args, **kwargs)
    return CustomHandler
