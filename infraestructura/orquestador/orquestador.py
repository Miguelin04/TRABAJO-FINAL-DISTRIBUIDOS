import http.server
import socketserver
import urllib.request
import urllib.error
import time
import json
import sqlite3
from datetime import datetime

# Configuración
LOAD_BALANCER_URL = "http://127.0.0.1:8080/"  # URL del balanceador de la práctica 15
PORT = 8000
DB_NAME = "nodos.db"

# Inicializar Base de Datos
def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    # Crear tabla de log del circuit breaker si no existe
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
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('INSERT INTO circuit_log (estado) VALUES (?)', (estado,))
    conn.commit()
    conn.close()
    print(f"[{datetime.now()}] Cambio de estado del Circuit Breaker: {estado}")

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
            log_circuit_state(self.state)

    def call(self, request_func):
        if self.state == "OPEN":
            # Verificar si ha pasado el tiempo de recuperación para pasar a HALF_OPEN
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.change_state("HALF_OPEN")
            else:
                return self.fallback()

        try:
            # Intentar ejecutar la petición
            response = request_func()
            
            # Si fue exitoso y estaba en HALF_OPEN, se cierra el circuito
            if self.state == "HALF_OPEN":
                self.change_state("CLOSED")
                self.failure_count = 0
                
            return response

        except Exception as e:
            # Ocurrió un error en la petición
            self.last_failure_time = time.time()
            self.failure_count += 1
            print(f"Error en la petición: {e}. Fallos: {self.failure_count}")

            if self.state == "HALF_OPEN":
                # Si falla en HALF_OPEN, se abre inmediatamente
                self.change_state("OPEN")
            elif self.state == "CLOSED":
                # Si falla en CLOSED, se incrementan los fallos. Si llega al umbral, se abre.
                if self.failure_count >= self.failure_threshold:
                    self.change_state("OPEN")

            return self.fallback()

    def fallback(self):
        # Respuesta alternativa inmediata sin cargar el sistema
        return {
            "status": 503,
            "data": "Servicio temporalmente no disponible (Fallback activo). El sistema está protegido."
        }

# Instanciar el Circuit Breaker
cb = CircuitBreaker(failure_threshold=3, recovery_timeout=10)

def hacer_peticion_backend():
    # Función que será envuelta por el Circuit Breaker
    req = urllib.request.Request(LOAD_BALANCER_URL)
    with urllib.request.urlopen(req, timeout=2) as response:
        return {
            "status": response.getcode(),
            "data": response.read().decode()
        }

class OrquestadorHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Usar el Circuit Breaker para hacer la petición
        resultado = cb.call(hacer_peticion_backend)
        
        self.send_response(resultado["status"] if resultado["status"] == 200 else 200) # Devolvemos 200 para mostrar el fallback correctamente en web, o 503 según diseño
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        respuesta_json = json.dumps({
            "circuit_state": cb.state,
            "response": resultado["data"]
        })
        self.wfile.write(respuesta_json.encode())

def run(server_class=http.server.HTTPServer, handler_class=OrquestadorHandler):
    init_db()
    # Estado inicial en DB opcional, pero empezamos en CLOSED
    server_address = ('', PORT)
    httpd = server_class(server_address, handler_class)
    print(f"Orquestador iniciado en el puerto {PORT}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    print("Orquestador detenido.")

if __name__ == '__main__':
    run()
