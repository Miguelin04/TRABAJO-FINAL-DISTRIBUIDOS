import urllib.request
import time
from datetime import datetime
from domain.node_state import Node

class HeartbeatService:
    def __init__(self, nodes, db_repository):
        self.nodes = [Node(n["id"], n["url"]) for n in nodes]
        self.db_repository = db_repository
        self.active_nodes = []
        self._round_robin_index = 0
        
        # Inicializar DB con todos en inactivo
        for node in self.nodes:
            self.db_repository.update_node_state(node.id, node.state)

    def start_polling(self):
        while True:
            temp_active = []
            for node in self.nodes:
                try:
                    # El Heartbeat consulta el endpoint /health
                    req = urllib.request.Request(f"{node.url}/health")
                    with urllib.request.urlopen(req, timeout=2) as response:
                        if response.getcode() == 200:
                            if not node.is_active():
                                node.mark_active()
                                self.db_repository.update_node_state(node.id, node.state)
                                print(f"[{datetime.now()}] {node.id} ({node.url}) está ACTIVO")
                            temp_active.append(node)
                except Exception:
                    if node.is_active():
                        node.mark_inactive()
                        self.db_repository.update_node_state(node.id, node.state)
                        print(f"[{datetime.now()}] {node.id} ({node.url}) está INACTIVO")
            
            self.active_nodes = temp_active
            time.sleep(5)

    def get_next_node(self):
        if not self.active_nodes:
            return None
            
        # Round Robin logic
        node = self.active_nodes[self._round_robin_index % len(self.active_nodes)]
        self._round_robin_index += 1
        return node
