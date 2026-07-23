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
            CREATE TABLE IF NOT EXISTS estado_nodos (
                nodo_id TEXT PRIMARY KEY,
                estado TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        conn.close()

    def update_node_state(self, node_id, estado):
        conn = sqlite3.connect(self.db_path, timeout=15.0)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO estado_nodos (nodo_id, estado, timestamp)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(nodo_id) DO UPDATE SET 
                estado=excluded.estado,
                timestamp=CURRENT_TIMESTAMP
        ''', (node_id, estado))
        conn.commit()
        conn.close()
