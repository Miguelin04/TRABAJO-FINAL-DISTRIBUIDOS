import time

class CircuitState:
    CLOSED = "CLOSED"
    OPEN = "OPEN"
    HALF_OPEN = "HALF_OPEN"

class CircuitBreaker:
    def __init__(self, max_failures=3, reset_timeout=10):
        self.state = CircuitState.CLOSED
        self.failures = 0
        self.max_failures = max_failures
        self.reset_timeout = reset_timeout
        self.last_failure_time = None

    def record_failure(self):
        self.failures += 1
        if self.failures >= self.max_failures:
            self.state = CircuitState.OPEN
            self.last_failure_time = time.time()
        return self.state

    def record_success(self):
        self.failures = 0
        self.state = CircuitState.CLOSED
        return self.state

    def try_reset(self):
        if self.state == CircuitState.OPEN:
            if time.time() - self.last_failure_time >= self.reset_timeout:
                self.state = CircuitState.HALF_OPEN
        return self.state

    def get_state(self):
        return self.state
