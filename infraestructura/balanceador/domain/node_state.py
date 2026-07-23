class NodeState:
    ACTIVE = "ACTIVO"
    INACTIVE = "INACTIVO"

class Node:
    def __init__(self, id, url):
        self.id = id
        self.url = url
        self.state = NodeState.INACTIVE
    
    def mark_active(self):
        self.state = NodeState.ACTIVE
    
    def mark_inactive(self):
        self.state = NodeState.INACTIVE
        
    def is_active(self):
        return self.state == NodeState.ACTIVE
