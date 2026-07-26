import os
import urllib.request
import urllib.error
import time
import json
import concurrent.futures
import threading
from datetime import datetime

class MetricsStore:
    def __init__(self):
        self.total_likes = 0
        self.successful_writes = 0
        self.successful_reads = 0
        self.read_repairs = 0
        self.last_write_wins_executed = 0
        self.latencies = []
        self.node_latencies = {} # {nodeId: [latencies]}
        self.lock = threading.Lock()
        
    def add_write(self, latency, nodes_involved):
        with self.lock:
            self.total_likes += 1
            self.successful_writes += 1
            self.latencies.append(latency)
            
    def add_read(self, latency):
        with self.lock:
            self.successful_reads += 1
            self.latencies.append(latency)
            
    def add_read_repair(self):
        with self.lock:
            self.read_repairs += 1
            
    def add_lww(self):
        with self.lock:
            self.last_write_wins_executed += 1
            
    def update_node_latency(self, node_id, latency):
        with self.lock:
            if node_id not in self.node_latencies:
                self.node_latencies[node_id] = []
            self.node_latencies[node_id].append(latency)
            
    def get_stats(self):
        with self.lock:
            avg_latency = sum(self.latencies) / len(self.latencies) if self.latencies else 0
            leader = "N/A"
            slowest = "N/A"
            if self.node_latencies:
                avgs = {k: sum(v)/len(v) for k,v in self.node_latencies.items() if v}
                if avgs:
                    leader = min(avgs, key=avgs.get)
                    slowest = max(avgs, key=avgs.get)
                    
            return {
                "total_likes": self.total_likes,
                "successful_writes": self.successful_writes,
                "successful_reads": self.successful_reads,
                "read_repairs": self.read_repairs,
                "last_write_wins_executed": self.last_write_wins_executed,
                "leader_node_heuristic": leader,
                "slowest_node": slowest,
                "avg_latency_ms": round(avg_latency, 2)
            }

class QuorumManager:
    N = 3
    W = 2
    R = 2
    BALANCEADOR_URL = os.getenv("LOAD_BALANCER_URL", "http://balanceador:8080/") + "nodes/status"

    def __init__(self):
        self.metrics = MetricsStore()

    def get_active_nodes(self):
        # Obtiene estado de los nodos desde el Balanceador (desacoplamiento total de SQLite)
        try:
            req = urllib.request.Request(self.BALANCEADOR_URL)
            with urllib.request.urlopen(req, timeout=3) as response:
                data = json.loads(response.read().decode())
                # Filtrar solo nodos ACTIVOS y omitir al nodo 4 (que actúa como Standby según requerimiento oficial)
                active_nodes = []
                for n in data.get("nodes", []):
                    if n.get("status") == "ACTIVO" and "servicio-pagos-4" not in n.get("id"):
                        active_nodes.append(n)
                # Tomamos como máximo N=3
                return active_nodes[:self.N]
        except Exception as e:
            print(f"Error consultando Balanceador: {e}")
            return []
            
    def get_all_nodes(self):
        # Utilizado por /status del orquestador para monitorización visual de todo el cluster
        try:
            req = urllib.request.Request(self.BALANCEADOR_URL)
            with urllib.request.urlopen(req, timeout=3) as response:
                data = json.loads(response.read().decode())
                return data.get("nodes", [])
        except Exception:
            return []

    def _send_post(self, url, payload):
        start = time.time()
        try:
            req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
            with urllib.request.urlopen(req, timeout=3) as response:
                latency = (time.time() - start) * 1000
                data = json.loads(response.read().decode())
                if "postState" in data:
                    node_id = data["postState"].get("nodeId", "unknown")
                    self.metrics.update_node_latency(node_id, latency)
                return {"status": response.getcode(), "data": data}
        except Exception as e:
            print(f"Error _send_post {url}: {e}")
            return None

    def _send_get(self, url):
        start = time.time()
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=3) as response:
                latency = (time.time() - start) * 1000
                data = json.loads(response.read().decode())
                if "postState" in data:
                    node_id = data["postState"].get("nodeId", "unknown")
                    self.metrics.update_node_latency(node_id, latency)
                return {"status": response.getcode(), "data": data}
        except Exception as e:
            print(f"Error _send_get {url}: {e}")
            return None

    def execute_write_quorum(self, post_id):
        nodes = self.get_active_nodes()
        if len(nodes) < self.W:
            raise Exception(f"Quorum fallido: Solo hay {len(nodes)} nodos activos. Se requiere W={self.W}.")

        timestamp = int(time.time() * 1000)
        version = int(time.time())
        payload = {"timestamp": timestamp, "version": version}

        success_responses = []
        start_time = time.time()
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.N) as executor:
            futures = {executor.submit(self._send_post, f"{node['url']}/api/posts/{post_id}/like", payload): node for node in nodes}
            for future in concurrent.futures.as_completed(futures):
                res = future.result()
                if res and res["status"] == 200:
                    success_responses.append(res)
                    if len(success_responses) >= self.W:
                        # Cortocircuito: Ya alcanzamos W, no es estrictamente necesario esperar al tercero para confirmar al cliente.
                        break
        
        if len(success_responses) >= self.W:
            latency = (time.time() - start_time) * 1000
            self.metrics.add_write(latency, len(success_responses))
            return success_responses[0]["data"]
        else:
            raise Exception("Falló alcanzar Quorum W=2")

    def execute_read_quorum(self, post_id):
        nodes = self.get_active_nodes()
        if len(nodes) < self.R:
            raise Exception(f"Quorum fallido: Solo hay {len(nodes)} nodos activos. Se requiere R={self.R}.")

        responses = []
        start_time = time.time()
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.N) as executor:
            futures = {executor.submit(self._send_get, f"{node['url']}/api/posts/{post_id}"): node for node in nodes}
            for future in concurrent.futures.as_completed(futures):
                res = future.result()
                if res and res["status"] == 200:
                    responses.append(res)
                    if len(responses) >= self.N: 
                        break # Esperamos a todos los que puedan responder para resolver LWW correctamente
        
        if len(responses) < self.R:
            raise Exception("Falló alcanzar Quorum R=2")
            
        latency = (time.time() - start_time) * 1000
        self.metrics.add_read(latency)

        # LAST WRITE WINS (LWW)
        latest_state = None
        for r in responses:
            state = r["data"].get("postState")
            if not state: continue
            if not latest_state:
                latest_state = state
            else:
                if state["timestamp"] > latest_state["timestamp"] or (state["timestamp"] == latest_state["timestamp"] and state["version"] > latest_state["version"]):
                    latest_state = state
                    self.metrics.add_lww()

        if not latest_state:
            latest_state = {"postId": post_id, "likes": 0, "timestamp": 0, "version": 0, "nodeId": "none"}

        # READ REPAIR asíncrono
        outdated_nodes = []
        for r in responses:
            state = r["data"].get("postState")
            if state and (state["timestamp"] < latest_state["timestamp"]):
                node_url = None
                node_id = state.get("nodeId")
                for n in nodes:
                    if node_id and node_id in n["id"]:
                        node_url = n["url"]
                        break
                if node_url:
                    outdated_nodes.append(node_url)
        
        if outdated_nodes:
            self.metrics.add_read_repair()
            def repair_task(nodes_to_repair, state_to_sync):
                for n_url in nodes_to_repair:
                    print(f"[{datetime.now()}] Ejecutando Read Repair en {n_url}")
                    self._send_post(f"{n_url}/api/posts/{state_to_sync['postId']}/sync", state_to_sync)
            threading.Thread(target=repair_task, args=(outdated_nodes, latest_state)).start()

        return {"status": "EXITO", "postState": latest_state, "mensaje": "Lectura resuelta (LWW)"}
