# APE 16 - Sistemas Distribuidos (Caso Netflix)

Este repositorio contiene la arquitectura completa de microservicios con tolerancia a fallos, implementando los patrones **Circuit Breaker**, **Round Robin**, y **Heartbeat**. Todo el código base respeta un esquema estricto de **Clean Architecture**.

## Arquitectura del Sistema

El proyecto está dividido en 4 capas físicas:

1. **Frontend (React + Vite)**: Dashboard moderno de telemetría (Polling activo).
2. **Orquestador (Python)**: Implementa la máquina de estados del Circuit Breaker (CLOSED, HALF_OPEN, OPEN) en memoria RAM y persiste el historial en SQLite. Funciona como puerta de enlace (API Gateway).
3. **Balanceador de Carga (Python)**: Implementa un `Heartbeat` en un hilo secundario que sondea la salud de los nodos (`GET /health`) y balancea la carga utilizando `Round Robin`.
4. **Nodos (Spring Boot - Java 17)**: 4 microservicios independientes que ejecutan la lógica de negocio simulada de Pagos.

## Tecnologías Utilizadas
- **Java 17 / Spring Boot 3.x**: Microservicios de negocio.
- **Python 3.10**: Orquestador, Balanceador, HTTP Server nativo, SQLite3.
- **React 18 / Vite / TailwindCSS**: Dashboard.
- **Docker Compose**: Entorno de desarrollo unificado.

## Estructura de Directorios

```text
/
├── database/                # Archivos SQLite (nodos.db) generados dinámicamente
├── docs/                    # Documentación arquitectónica y Walkthroughs
├── frontend-dashboard/      # Cliente React
├── infraestructura/
│   ├── balanceador/         # Python (Puerto 8080)
│   └── orquestador/         # Python (Puerto 8000)
├── microservicios/          # 4 Nodos Spring Boot (Puertos 9001-9004)
├── scripts/                 # Scripts auxiliares para inicialización masiva
└── docker-compose.yml       # Archivo maestro de contenedores
```

## Ejecución con Docker Compose (Recomendado)

Si tienes Docker instalado, levantar la arquitectura completa toma un solo comando:

```bash
docker-compose up --build
```
> Nota: La primera vez que se ejecute tomará unos minutos descargar las dependencias de Maven y Node.

Una vez iniciados todos los contenedores:
- El **Dashboard** estará disponible en: [http://localhost:5173](http://localhost:5173)
- El **Orquestador** escuchará en: `http://localhost:8000`

## Ejecución Local (Para la Defensa)

Si prefieres levantar los servicios individualmente para demostrar tolerancia a fallos matando los procesos:

1. Levanta los microservicios (`mvn spring-boot:run` en cada carpeta).
2. Levanta el balanceador (`python main.py`).
3. Levanta el orquestador (`python main.py`).
4. Inicia el Frontend (`npm run dev`).

*Puedes consultar el archivo `docs/walkthrough.md` para las instrucciones detalladas de la demostración.*

## Trabajo Colaborativo (Despliegue Físico Distribuido)

Para probar el cluster en red LAN real con los demás integrantes del equipo, sigan estos pasos:

### 1. Servidor Central (Máquina Principal)
La computadora que ejecutará el **Balanceador, el Orquestador y el Frontend** tiene la siguiente IP en la red local:
> **IP del Servidor Central (Miguel): `192.168.1.11`**

### 2. Instrucciones para cada Integrante
Cada integrante deberá levantar **únicamente su microservicio Java asignado** en su propia máquina. Para hacerlo:

1. Ubícate en tu rama correspondiente (`git checkout <tu-rama>`).
2. Abre la terminal, asegúrate de estar conectado a la misma red (el mismo router) que la máquina principal.
3. Navega a la carpeta de tu microservicio (ej. si tienes el nodo 2):
   ```bash
   cd microservicios/servicio-pagos-2
   ```
4. Levanta el servicio con Maven:
   ```bash
   mvn spring-boot:run
   ```
5. Asegúrate de tener tu Firewall (Windows Defender, iptables, etc.) configurado para permitir el tráfico entrante en el puerto de tu servicio (9001, 9002, 9003 o 9004).
6. **Comunícale tu IP a Miguel** (usa `ipconfig` en Windows o `ip a` en Linux) para que él pueda registrar tu máquina en el archivo `nodes_config.json` del Balanceador.

### 3. Visualizar el Dashboard
Cualquier integrante conectado al router puede ver en vivo cómo funciona el sistema entrando desde su navegador a:
> **[http://192.168.1.11:5173](http://192.168.1.11:5173)**
