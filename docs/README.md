# Práctica 16: Arquitectura de Microservicios y "Circuit Breaker" (Caso Netflix)

Este proyecto simula la arquitectura tolerante a fallos de Netflix, enfocada específicamente en el **Servicio de Pagos**. 
Contiene una infraestructura en Python (Orquestador + Balanceador) y microservicios backend desarrollados en Java (Spring Boot) bajo un patrón arquitectónico MVC.

## 🚀 Arquitectura

El flujo de una petición es el siguiente:
`Cliente -> Orquestador (con Circuit Breaker) -> Balanceador de Carga -> Microservicios de Pagos (Spring Boot)`

## 📁 Estructura del Proyecto

* **`infraestructura-python/`**: Contiene los scripts que controlan el tráfico y la tolerancia a fallos.
  * `balanceador.py`: Reparte el tráfico entre las 5 computadoras (Round Robin) y verifica la salud de los nodos (Heartbeat).
  * `orquestador.py`: Contiene la lógica del **Circuit Breaker**. Si los nodos se caen, abre el circuito y responde con un mensaje de emergencia sin colapsar la red.
* **`servicio-pagos/`**: Código fuente en Java (Spring Boot) del microservicio backend.
  * Utiliza un patrón **MVC** organizado en Modelos (`Pago.java`), Servicios (`PagoService.java`) y Controladores (`PagosController.java`).

---

## 👥 Roles y Responsabilidades del Grupo (5 Integrantes)

Para la presentación de esta práctica, el equipo conectará sus **5 computadoras a un mismo Switch**. A continuación se detalla qué debe hacer cada miembro:

### 💻 Integrantes 1, 2, 3 y 4 (Nodos Backend de Spring Boot)
Ustedes actuarán como servidores de la granja de Netflix procesando pagos.
1. **Preparación:** Abran la carpeta `servicio-pagos` en su editor de código preferido (Eclipse, IntelliJ, VS Code).
2. **Ejecución:** Levanten la aplicación de Spring Boot (`PagosApplication.java`). La consola mostrará que se ha levantado en el puerto `9001`.
3. **Red:** Asegúrense de que el Firewall de Windows permita el tráfico entrante al puerto 9001 en redes privadas.
4. **Demostración:** Durante la prueba del Circuit Breaker, el profesor les pedirá que "apaguen" sus servidores. Ustedes deberán detener la ejecución de Spring Boot en sus computadoras (Ctrl+C en la terminal).

### 🖥️ Integrante 5 (Servidor Principal / Orquestador)
Tú manejarás el tráfico central y probarás la arquitectura.
1. **Recolección de IPs:** Pregúntale a los integrantes 1, 2, 3 y 4 cuál es su dirección IP IPv4 dentro de la red del Switch (ej. `192.168.1.x`). Averigua también la tuya.
2. **Configuración:** Abre el archivo `infraestructura-python/balanceador.py`. En la línea 15 (`NODOS = [...]`), reemplaza las IPs genéricas por las IPs reales de las 5 computadoras del grupo.
3. **Levantar el Backend local:** Como tú también eres el 5to integrante, levanta el proyecto de Spring Boot (`servicio-pagos`) en tu computadora al igual que el resto.
4. **Levantar la Infraestructura:** Abre dos terminales en la carpeta `infraestructura-python`:
   * En la Terminal 1 ejecuta: `python balanceador.py`
   * En la Terminal 2 ejecuta: `python orquestador.py`
5. **Demostración:** Abre tu navegador y entra a `http://localhost:8000/`. Recarga la página varias veces y muéstrale al profesor cómo la IP de procesamiento va cambiando (el tráfico se balancea entre las 5 computadoras). 
   * Luego, diles a todos que apaguen sus Spring Boot. Vuelve a recargar, y muéstrale al profesor cómo el Orquestador arroja automáticamente el "Fallback" (Servicio no disponible) protegiendo el sistema.

---
**Éxitos en su Práctica 16 - Equipo de Computación.**
