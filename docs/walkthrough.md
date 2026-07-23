# Sistema Completado - Práctica de Microservicios

¡La refactorización y construcción de toda la arquitectura ha concluido con éxito! El sistema completo ha sido implementado utilizando **Clean Architecture** y está listo para ser defendido.

## Resumen de Cambios y Arquitectura

1. **Microservicios (Spring Boot - Java)**
   - Desacoplados a Clean Architecture.
   - 4 instancias totalmente independientes (`servicio-pagos-1` al `4`).
   - Mantienen el paquete `com.netflix.pagos`.
   - Incorporan el nuevo endpoint `GET /health` exclusivo para el sondeo de monitoreo.

2. **Balanceador de Carga (Python)**
   - Migrado de un script "spaghetti" monolítico a un modelo de Capas (Dominio, Aplicación, Infraestructura).
   - Ahora lee de forma dinámica la configuración desde un archivo JSON, evitando "hardcodear" las IPs.
   - Aplica su propio `Heartbeat` sondeando la salud del clúster y persiste ese estado en la base de datos centralizada SQLite de forma atómica.

3. **Orquestador Central (Python)**
   - Contiene la lógica pura del `Circuit Breaker` (la matemática para pasar de `CLOSED` a `OPEN` tras 3 fallos) asilada en la capa de Dominio.
   - Registra el historial de bloqueos en SQLite.
   - Funciona como API Gateway y Backend-for-Frontend (BFF), exponiendo un endpoint agregado (`GET /status`) para consumo eficiente.

4. **Dashboard de Monitoreo (React + Vite)**
   - Un Frontend ultra moderno desarrollado sin librerías de terceros (a excepción de Tailwind CSS para el diseño Netflix-Like).
   - Realiza *Short Polling* cada 2 segundos.
   - Presenta el diagrama interactivo de red, las métricas globales, y el historial, demostrando visualmente el funcionamiento interno de la infraestructura distribuida.

## 🚀 Instrucciones Finales (Prueba End-to-End)

Para hacer tu presentación, sigue este estricto orden de despliegue abriendo varias terminales:

### 1. Iniciar Microservicios (Java)
Abre 4 terminales diferentes. En cada una navega a una carpeta y arranca el servicio:
```powershell
cd "microservicios/servicio-pagos-1"
mvn spring-boot:run
```
*(Haz lo mismo para el 2, 3 y 4).*

### 2. Iniciar Balanceador (Python)
Abre una 5ta terminal:
```powershell
cd "infraestructura/balanceador"
python main.py
```

### 3. Iniciar Orquestador (Python)
Abre una 6ta terminal:
```powershell
cd "infraestructura/orquestador"
python main.py
```

### 4. Iniciar Dashboard (Frontend)
Abre una 7ma terminal:
```powershell
cd frontend-dashboard
npm run dev
```

> [!TIP]
> **El Truco de la Demostración:**
> 1. Abre el Dashboard en tu navegador. Ve a la vista de "Pruebas" y presiona varias veces "Procesar Pago". Verás cómo se alternan los nodos 1, 2, 3 y 4 en el JSON.
> 2. Vuelve a la vista de "Monitoreo". Ve a las terminales y **cancela (Ctrl+C)** el servicio-pagos-1 y servicio-pagos-2. 
> 3. En máximo 5 segundos verás en el Dashboard que esos nodos pasan a rojo. 
> 4. Si vas a "Pruebas", el sistema seguirá funcionando pero solo rotará entre el 3 y el 4.
> 5. Finalmente, cancela los 4 servicios Java e intenta procesar el pago: Verás al Circuit Breaker abrirse automáticamente.
