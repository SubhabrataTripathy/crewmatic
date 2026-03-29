type EventHandler = (data: any) => void;

class CrewmaticWS {
  private ws: WebSocket | null = null;
  private listeners = new Map<string, Set<EventHandler>>();
  private reconnectTimer: number | null = null;
  private url = 'ws://localhost:3001/ws';

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('🔌 Connected to Crewmatic server');
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const handlers = this.listeners.get(message.type);
        if (handlers) {
          for (const handler of handlers) {
            handler(message.data);
          }
        }
        // Also emit to wildcard listeners
        const wildcardHandlers = this.listeners.get('*');
        if (wildcardHandlers) {
          for (const handler of wildcardHandlers) {
            handler(message);
          }
        }
      } catch (e) {
        console.error('WS parse error:', e);
      }
    };

    this.ws.onclose = () => {
      console.log('🔌 Disconnected from server, reconnecting in 3s...');
      this.reconnectTimer = window.setTimeout(() => this.connect(), 3000);
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  on(event: string, handler: EventHandler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => this.listeners.get(event)?.delete(handler);
  }

  off(event: string, handler: EventHandler) {
    this.listeners.get(event)?.delete(handler);
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }
}

export const ws = new CrewmaticWS();
