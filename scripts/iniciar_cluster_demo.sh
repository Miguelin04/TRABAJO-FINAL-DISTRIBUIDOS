#!/bin/bash

# Script para iniciar todos los servicios del cluster de manera independiente
# en nuevas ventanas de terminal (gnome-terminal). Ideal para la defensa.

echo "🚀 Iniciando el cluster distribuido para la demostración..."

# 1. Iniciar Microservicios Java (Pagos 1 al 4)
for i in {1..4}
do
    echo "Iniciando servicio-pagos-$i..."
    gnome-terminal --title="Nodo Java $i" -- bash -c "cd microservicios/servicio-pagos-$i && mvn spring-boot:run; exec bash"
done

# 2. Iniciar Balanceador (Python)
echo "Iniciando Balanceador (Python)..."
gnome-terminal --title="Balanceador" -- bash -c "cd infraestructura/balanceador && python3 main.py; exec bash"

# 3. Iniciar Orquestador (Python)
echo "Iniciando Orquestador (Python)..."
gnome-terminal --title="Orquestador" -- bash -c "cd infraestructura/orquestador && python3 main.py; exec bash"

# 4. Iniciar Dashboard Frontend (React)
echo "Iniciando Dashboard Frontend..."
gnome-terminal --title="Frontend Dashboard" -- bash -c "cd frontend-dashboard && npm run dev; exec bash"

echo "✅ Todas las terminales han sido abiertas."
echo "👉 Podrás detener (Ctrl+C) cualquier ventana individual para demostrar la tolerancia a fallos."
