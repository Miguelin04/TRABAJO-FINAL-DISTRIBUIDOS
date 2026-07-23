# Guía Paso a Paso para la Defensa de la Práctica 16

Este es tu "Playbook" (guion) para demostrar la arquitectura distribuida al docente de forma fluida, lógica y convincente en menos de 10 minutos. Sigue estos pasos exactos durante tu exposición.

## Paso 1: Preparación en Frío (Antes de compartir pantalla)
1. Abre **Docker Desktop** y asegúrate de que esté corriendo (icono en verde).
2. Abre la terminal en la raíz del proyecto (`APE 16 - Distribuidos`).
3. Ejecuta el comando para compilar y levantar todo el ecosistema:
   ```powershell
   docker compose up --build -d
   ```
4. Espera 1 minuto y ejecuta `docker compose ps` para asegurar que los 7 contenedores digan `(healthy)`.
5. Abre el **React Dashboard** en tu navegador: `http://localhost:5173`.
6. Abre una herramienta como Postman, cURL o una pestaña extra del navegador para apuntar directamente al Orquestador: `http://localhost:8000`.

---

## Paso 2: Introducción y Arquitectura (2 minutos)
* **Acción:** Muestra el documento `docs/informe_evolucion.md` o el diagrama de arquitectura.
* **Discurso Sugerido:** 
  > "Profesor, partimos del balanceador prototipo entregado en la Práctica 15. Conservamos la estructura orientada a objetos (BackendServer) y la concurrencia (Health Checker), pero migramos a librerías estándar como se solicitó. Luego lo escalamos a 4 microservicios Spring Boot, añadimos persistencia SQLite aislada en un Repository, un Orquestador con Circuit Breaker en el frente, y un Dashboard de observabilidad en React."

---

## Paso 3: Demostración de Escenario Normal (1 minuto)
* **Acción:** Ve al **React Dashboard**. Muestra que los 4 nodos están en `VERDE` (Activos).
* **Acción:** Haz clic en el botón "Procesar Pago" unas 6 veces seguidas.
* **Discurso Sugerido:**
  > "Aquí vemos el clúster sano. Al disparar peticiones al Orquestador, el tráfico atraviesa el Circuit Breaker que está en CLOSED (sano), llega al Load Balancer, y este distribuye el tráfico utilizando un algoritmo puro de Round Robin entre nuestros 4 contenedores Java. Miren cómo cambia el identificador del nodo que responde."

---

## Paso 4: Tolerancia Parcial - Apagado de un Nodo (2 minutos)
* **Acción:** Abre la terminal y detén **uno** de los microservicios. 
  ```powershell
  docker compose stop servicio-pagos-2
  ```
* **Acción:** Vuelve inmediatamente al Dashboard y pide al profesor que observe. En menos de 5 segundos, el nodo 2 pasará a color `ROJO` (Inactivo).
* **Acción:** Presiona "Procesar Pago" varias veces.
* **Discurso Sugerido:**
  > "Acabo de simular la caída del servidor 2. El hilo asíncrono del Health Checker detectó que ya no hay respuesta HTTP y cambió su estado en memoria, guardando instantáneamente este cambio en la tabla `estado_nodos` de SQLite. Al volver a lanzar peticiones, noten que el Balanceador es lo suficientemente inteligente para excluir al nodo 2 del Round Robin, manteniendo el sistema 100% operativo sin afectar al usuario final."

---

## Paso 5: Caída Crítica - El Circuit Breaker (3 minutos)
* **Acción:** En la terminal, apaga abruptamente los 3 microservicios restantes.
  ```powershell
  docker compose stop servicio-pagos-1 servicio-pagos-3 servicio-pagos-4
  ```
* **Acción:** Ve al Dashboard. Todo el clúster está en `ROJO`. 
* **Acción:** Haz clic en "Procesar Pago" rápidamente. La primera fallará. La segunda fallará. ¡La tercera cambiará el estado del Circuit Breaker a `OPEN` (Rojo)!
* **Discurso Sugerido:**
  > "Al caer todos los backends, el Load Balancer no tiene a quién enviar tráfico. Las primeras peticiones fracasan (Timeout). Pero al acumular fallos consecutivos, nuestro Orquestador abre el circuito (Estado OPEN). A partir de este milisegundo, cualquier petición entrante es rechazada inmediatamente con un HTTP 503 (Fallback), protegiendo la red y el balanceador de saturarse intentando conectarse a un clúster muerto."

---

## Paso 6: Recuperación Automática (2 minutos)
* **Acción:** En la terminal, vuelve a encender los microservicios.
  ```powershell
  docker compose start servicio-pagos-1 servicio-pagos-2 servicio-pagos-3 servicio-pagos-4
  ```
* **Acción:** Vuelve al Dashboard. Verás cómo, pasados unos 10 segundos, el Circuit Breaker intenta una petición de prueba pasando a estado `HALF_OPEN` (Amarillo). Al ser exitosa, vuelve a `CLOSED` (Verde). Los nodos vuelven a estar activos.
* **Discurso Sugerido:**
  > "Y aquí la magia de los sistemas autónomos: al restaurar los servidores, el Health Checker los vuelve a detectar sanos. Tras su tiempo de gracia, el Circuit Breaker pasa a Half-Open, deja pasar un mensaje de prueba, y al ver que los nodos ya responden, cierra el circuito volviendo a la normalidad. Toda esta historia ha quedado registrada en la tabla `circuit_log` y `estado_nodos` en nuestra base SQLite para auditorías."

---

## Tips para el éxito:
- **No apagues el Orquestador ni el Balanceador.** El objetivo es mostrar cómo los "Frontales" manejan las caídas de los "Backends" (Los microservicios).
- Si te piden ver la base de datos `nodos.db`, recuerda que puedes usar un visor como *DB Browser for SQLite* sobre el archivo físico ubicado en `database/nodos.db`.
