import os

class Settings:
    PORT = int(os.environ.get("PORT", 8000))
    LOAD_BALANCER_URL = os.environ.get("LOAD_BALANCER_URL", "http://127.0.0.1:8080/")
    DB_PATH = os.environ.get("DB_PATH", "../../database/nodos.db")
