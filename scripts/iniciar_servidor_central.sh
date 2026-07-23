#!/bin/bash

echo "🚀 Iniciando los servicios centrales (Balanceador, Orquestador y Frontend)..."

# 1. Iniciar Balanceador (Python)
echo "Iniciando Balanceador (Python)..."
gnome-terminal --title="Balanceador" -- bash -c "cd infraestructura/balanceador && python3 main.py; exec bash"

# 2. Iniciar Orquestador (Python)
echo "Iniciando Orquestador (Python)..."
gnome-terminal --title="Orquestador" -- bash -c "cd infraestructura/orquestador && export LOAD_BALANCER_URL='http://127.0.0.1:8080/' && python3 main.py; exec bash"

# 3. Iniciar Dashboard Frontend (React)
echo "Iniciando Dashboard Frontend..."
gnome-terminal --title="Frontend Dashboard" -- bash -c "cd frontend-dashboard && npm run dev -- --host 0.0.0.0; exec bash"

echo "✅ Servicios centrales iniciados en nuevas ventanas."
