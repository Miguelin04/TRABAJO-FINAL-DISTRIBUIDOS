import json
import os

class Settings:
    PORT = int(os.environ.get("PORT", 8080))
    DB_PATH = os.environ.get("DB_PATH", "../../database/nodos.db")
    CONFIG_PATH = os.environ.get("NODES_CONFIG_PATH", os.path.join(os.path.dirname(__file__), 'nodes_config.json'))

    @classmethod
    def load_nodes(cls):
        with open(cls.CONFIG_PATH, 'r') as f:
            return json.load(f)
