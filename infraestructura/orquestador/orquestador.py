import http.server
import time
import json
import sqlite3
import os
from datetime import datetime

# Importamos nuestro nuevo módulo de Quórum
from quorum_manager import QuorumManager

# Configuración
PORT = 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_NAME = os.path.join(BASE_DIR, '..', '..', 'database', 'nodos.db')

# Inicializar Base de Datos de Log de Circuit Breaker (misma DB que el balanceador para consolidar historial)
def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS circuit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            estado TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def log_circuit_state(estado):
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute('INSERT INTO circuit_log (estado) VALUES (?)', (estado,))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error guardando estado CB: {e}")

class CircuitBreaker:
    def __init__(self, failure_threshold=3, recovery_timeout=10):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.state = "CLOSED"
        self.last_failure_time = None

    def change_state(self, new_state):
        if self.state != new_state:
            self.state = new_state
            print(f"[{datetime.now()}] Cambio de estado del Circuit Breaker: {new_state}")
            log_circuit_state(self.state)

    def call(self, request_func, *args, **kwargs):
        if self.state == "OPEN":
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.change_state("HALF_OPEN")
            else:
                raise Exception("Circuit Breaker OPEN")

        try:
            response = request_func(*args, **kwargs)
            if self.state == "HALF_OPEN":
                self.change_state("CLOSED")
                self.failure_count = 0
            return response

        except Exception as e:
            self.last_failure_time = time.time()
            self.failure_count += 1
            print(f"Error en la petición protegida: {e}. Fallos: {self.failure_count}")

            if self.state == "HALF_OPEN":
                self.change_state("OPEN")
            elif self.state == "CLOSED":
                if self.failure_count >= self.failure_threshold:
                    self.change_state("OPEN")
            raise e

cb = CircuitBreaker()
quorum = QuorumManager()

class OrquestadorHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
        
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == "/status":
            self.handle_status()
        elif self.path == "/health":
            self.send_json(200, {"status": "UP"})
        elif self.path.startswith("/api/posts/"):
            post_id = self.path.split("/")[-1]
            try:
                # El orquestador delega la lógica y CircuitBreaker la envuelve
                res = cb.call(quorum.execute_read_quorum, post_id)
                self.send_json(200, res)
            except Exception as e:
                self.send_json(503, {"error": str(e), "circuit_state": cb.state})
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == "/api/like":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            body = json.loads(post_data.decode('utf-8'))
            post_id = body.get("postId", "global-post")
            
            try:
                # El orquestador delega la lógica y CircuitBreaker la envuelve
                res = cb.call(quorum.execute_write_quorum, post_id)
                self.send_json(200, {"success": True, "quorum_reached": True, "data": res})
            except Exception as e:
                self.send_json(503, {"success": False, "error": str(e), "circuit_state": cb.state})
        else:
            self.send_response(404)
            self.end_headers()

    def handle_status(self):
        # Obtener historial de Eventos (CB) de la SQLite compartida
        historial = []
        try:
            conn = sqlite3.connect(DB_NAME)
            cursor = conn.cursor()
            cursor.execute("SELECT id, estado, timestamp FROM circuit_log ORDER BY id DESC LIMIT 10")
            for row in cursor.fetchall():
                historial.append({"id": row[0], "estado": row[1], "timestamp": row[2]})
            conn.close()
        except Exception:
            pass

        # Obtener todos los nodos (desde el Balanceador, a través del quorum manager)
        all_nodes = quorum.get_all_nodes()

        response = {
            "circuit_breaker": cb.state,
            "historial_circuit_breaker": historial,
            "heartbeat": "ACTIVE" if all_nodes else "UNKNOWN",
            "nodes": all_nodes,
            "metrics": quorum.metrics.get_stats(),
            "quorum_stats": {
                "N": quorum.N,
                "W": quorum.W,
                "R": quorum.R
            }
        }
        self.send_json(200, response)

    def send_json(self, status_code, data):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

def run():
    init_db()
    server_address = ('', PORT)
    httpd = http.server.HTTPServer(server_address, OrquestadorHandler)
    print(f"Orquestador (Coordinador Quorum N={quorum.N}, W={quorum.W}, R={quorum.R}) iniciado en puerto {PORT}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    print("Orquestador detenido.")

if __name__ == '__main__':
    run()
