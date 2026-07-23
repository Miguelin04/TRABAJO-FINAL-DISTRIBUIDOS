# Informe Técnico de Evolución: Práctica 15 a 16

## 1. Justificación Arquitectónica

El proyecto final entregado para la **Práctica 16** representa una **evolución incremental** del prototipo inicial proporcionado en la **Práctica 15** (Balanceador de Carga). 

El objetivo de diseño ha sido **reutilizar los paradigmas orientados a objetos y de concurrencia** de la implementación original, adaptándolos estrictamente a los requerimientos de evaluación del Syllabus oficial. No se trata de un código nuevo, sino de una arquitectura distribuida compatible con las restricciones de ambas prácticas.

## 2. Elementos Reutilizados de la Arquitectura Original

Tras analizar el código base proporcionado, se han conservado e integrado los siguientes componentes clave:

- **Estructura de Dominio (`BackendServer`)**: Se ha mantenido la clase original encargada de encapsular el estado de cada nodo, evitando variables globales. Esta separación facilita la extensión y permite controlar: `active_connections`, `total_requests`, `consecutive_failures` y `latency`. La comunicación interna se adaptó al estándar nativo.
- **Mecanismo Periódico de Supervisión de Salud (Health Checker)**: El mecanismo de verificación periódica del estado de los nodos conserva la filosofía del heartbeat lógico, donde el balanceador consulta continuamente la disponibilidad de cada servicio mediante comprobaciones independientes. Se mantiene la arquitectura `health_checker_loop` que levanta hilos por nodo y gestiona la seguridad concurrente mediante `threading.Lock`.
- **Evolución del Balanceador (`LoadBalancer`)**: La clase original `AILoadBalancer` ha evolucionado hacia `LoadBalancer`. Se mantiene la interfaz pública de selección (`select_backend()`), pero refactorizando la estrategia interna de decisión.

## 3. Elementos Descartados (Y Justificación Académica)

Se han descartado aquellos componentes del prototipo que contradecían los lineamientos de las guías:

- **Sustitución de Flask y Requests por módulos estándar**: Flask y Requests fueron descartados en la implementación del balanceador Python debido a que la restricción académica exige el uso de la biblioteca estándar de Python para esta capa. La arquitectura general incorpora posteriormente microservicios Spring Boot como servicios independientes externos al balanceador. La capa HTTP del balanceador fue implementada utilizando `ThreadingHTTPServer` y la capa de red con `urllib`. El concepto permanece, solo cambia la tecnología subyacente.
- **Reemplazo de Ollama/IA por Round Robin**: El balanceador abandona la decisión predictiva (`_ai_decision()`) debido a que introduce una variable no determinista, dificultando la evaluación experimental y la reproducibilidad de resultados. Se refactorizó hacia la estrategia matemática `_round_robin_selection()`.
- **Persistencia Desacoplada**: En lugar de guardar métricas volátiles en RAM, la persistencia se delegó a `SQLite`. Para evitar el acoplamiento y bloqueos, la escritura en base de datos ya no ocurre directamente dentro del hilo de monitoreo, sino que se canaliza mediante un patrón de repositorio aislado (`sqlite_repository.py`).

## 4. Evolución de la Arquitectura (Práctica 16)

El Orquestador implementa el patrón **Circuit Breaker**, evitando que las solicitudes continúen hacia nodos con fallos consecutivos y permitiendo la recuperación automática cuando los Health Checks determinan disponibilidad nuevamente. Esto se integra limpiamente con la tolerancia a fallos del balanceador.

La arquitectura de observabilidad e integración final queda conformada de la siguiente manera:

```text
                 React Dashboard
                       |
                       | (Polling)
                 REST API (BFF)
                       |
                 Orquestador (Circuit Breaker)
                       |
              Python Load Balancer (Round Robin)
                       |
          +------------+------------+
          |                         |
   SQLite Repository        +-------+-------+-------+
          |                 |       |       |       |
       SQLite            Spring  Spring  Spring  Spring
  (logs y estados)       Boot 1  Boot 2  Boot 3  Boot 4
```

## 5. Tabla de Transformación (Síntesis)

| Componente Original (Práctica 15) | Evolución Final (Práctica 16) |
| :--- | :--- |
| Flask (API del prototipo Python) | `ThreadingHTTPServer` (balanceador Python) + Microservicios Spring Boot |
| Requests HTTP | `urllib` nativo |
| Ollama (IA) | Round Robin Determinista |
| Métricas en RAM | `SQLite` persistente |
| Nodos Simulados Python | Microservicios Java Reales |
| Balanceador Básico | Orquestador con Circuit Breaker |
| Observabilidad en Terminal | React Dashboard |

## 6. Escenario de Validación de Tolerancia a Fallos

Esta matriz define los escenarios esperados durante la fase de evaluación experimental del sistema:

| Escenario | Resultado esperado |
| :--- | :--- |
| Todos los nodos disponibles | Distribución Round Robin normal. |
| Detención de un microservicio | El Health Checker detecta el fallo y actualiza la latencia. |
| Fallos consecutivos superan umbral | El Circuit Breaker abre el circuito (OPEN), evitando que nuevas solicitudes sean direccionadas hacia el nodo degradado mientras permanece fuera del pool activo del balanceador. |
| Recuperación del servicio | El nodo vuelve al pool disponible; el Circuit Breaker pasa a HALF_OPEN y luego a CLOSED. |
| Cambio de estado | El registro de las transiciones es persistido inmediatamente después de detectar el cambio de estado mediante el repositorio SQLite. |
| Observabilidad en tiempo real | El cambio de estado se refleja automáticamente en el Dashboard React (polling). |

> **Nota sobre los estados del Circuit Breaker durante la defensa:**
> - **CLOSED**: Solicitudes permitidas normalmente.
> - **OPEN**: Solicitudes bloqueadas temporalmente.
> - **HALF_OPEN**: Pruebas controladas de recuperación.
