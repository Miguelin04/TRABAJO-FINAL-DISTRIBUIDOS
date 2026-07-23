import sqlite3
import os
from config.settings import Settings

class DbRepository:
    def __init__(self):
        self.db_path = Settings.DB_PATH
        self._init_db()

    def _init_db(self):
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        conn = sqlite3.connect(self.db_path, timeout=15.0)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS circuit_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                estado TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        # Insert initial CLOSED state if empty
        cursor.execute("SELECT count(*) FROM circuit_log")
        if cursor.fetchone()[0] == 0:
            cursor.execute("INSERT INTO circuit_log (estado) VALUES ('CLOSED')")
        conn.commit()
        conn.close()

    def insert_circuit_state(self, estado):
        conn = sqlite3.connect(self.db_path, timeout=15.0)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO circuit_log (estado) VALUES (?)", (estado,))
        conn.commit()
        conn.close()

    def get_dashboard_data(self):
        """Lee toda la información para el frontend"""
        conn = sqlite3.connect(self.db_path, timeout=15.0)
        cursor = conn.cursor()
        
        # Último estado del circuito
        cursor.execute("SELECT estado, timestamp FROM circuit_log ORDER BY id DESC LIMIT 1")
        circuit_row = cursor.fetchone()
        circuit_estado = circuit_row[0] if circuit_row else "CLOSED"
        
        # Historial del circuito (últimos 10)
        cursor.execute("SELECT id, estado, timestamp FROM circuit_log ORDER BY id DESC LIMIT 10")
        historial_circuit = [{"id": row[0], "estado": row[1], "timestamp": row[2]} for row in cursor.fetchall()]
        
        # Nodos
        nodos = []
        try:
            cursor.execute("SELECT nodo_id, estado, url, timestamp FROM estado_nodos ORDER BY nodo_id ASC")
            for row in cursor.fetchall():
                nodos.append({
                    "id": row[0],
                    "estado": row[1],
                    "url": row[2],
                    "timestamp": row[3]
                })
        except sqlite3.OperationalError:
            pass # Si el balanceador aún no crea la tabla
            
        conn.close()
        
        return {
            "circuit_breaker": {
                "estado_actual": circuit_estado
            },
            "nodos": nodos,
            "historial_circuit_breaker": historial_circuit
        }
