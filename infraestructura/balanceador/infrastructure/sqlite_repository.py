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
                url TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        # Migración: añadir columna url si no existe (compatibilidad con BD antigua)
        try:
            cursor.execute("ALTER TABLE estado_nodos ADD COLUMN url TEXT")
        except Exception:
            pass
        conn.commit()
        conn.close()

    def update_node_state(self, node_id, estado, url=None):
        conn = sqlite3.connect(self.db_path, timeout=15.0)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO estado_nodos (nodo_id, estado, url, timestamp)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(nodo_id) DO UPDATE SET 
                estado=excluded.estado,
                url=excluded.url,
                timestamp=CURRENT_TIMESTAMP
        ''', (node_id, estado, url))
        conn.commit()
        conn.close()
