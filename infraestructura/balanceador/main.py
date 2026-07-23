import os
from config.settings import Settings
from domain.server import BackendServer
from domain.balancer import LoadBalancer
from application.health_monitor import HealthMonitor
from infrastructure.sqlite_repository import DbRepository
from infrastructure.http_server import BalancerHandler
from http.server import ThreadingHTTPServer

def run_balancer():
    print(f"Cargando configuración desde: {Settings.CONFIG_PATH}")
    nodes_config = Settings.load_nodes()
    
    # Inicializar Base de Datos
    db = DbRepository()
    
    # Inicializar Balanceador (OOP)
    balancer = LoadBalancer()
    
    # Registrar servidores a partir de la configuración
    for node in nodes_config:
        server = BackendServer(node['id'], node['url'])
        balancer.add_server(server)
        # Inicializar en SQLite como inactivo hasta que el health check lo vea vivo
        db.update_node_state(server.id, 'INACTIVO')

    # Inicializar Health Monitor (Multihilo) y aislar la persistencia
    monitor = HealthMonitor(balancer, db)
    monitor.start()

    # Inyectar el balanceador en el Handler
    BalancerHandler.load_balancer = balancer

    # Iniciar servidor HTTP
    server_address = ('', Settings.PORT)
    httpd = ThreadingHTTPServer(server_address, BalancerHandler)
    print(f"Balanceador Round Robin (Evolucionado) escuchando en puerto {Settings.PORT}...")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()

if __name__ == '__main__':
    run_balancer()
