import http.server
from config.settings import Settings
from infrastructure.db_repository import DbRepository
from application.circuit_manager import CircuitManager
from infrastructure.http_server import create_orchestrator_handler

def main():
    db_repo = DbRepository()
    circuit_manager = CircuitManager(db_repo)
    
    handler_class = create_orchestrator_handler(circuit_manager)
    server_address = ('0.0.0.0', Settings.PORT)
    httpd = http.server.HTTPServer(server_address, handler_class)
    
    print(f"Orquestador Clean Architecture iniciado en el puerto {Settings.PORT}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("Orquestador detenido.")
    finally:
        httpd.server_close()

if __name__ == '__main__':
    main()
