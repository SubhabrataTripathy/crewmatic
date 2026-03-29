import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

let wss: WebSocketServer;
const clients = new Set<WebSocket>();

export function initWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: '/ws' });
  
  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log(`🔌 WebSocket client connected (${clients.size} total)`);
    
    // Send welcome message
    ws.send(JSON.stringify({ type: 'connected', data: { message: 'Connected to Crewmatic', clients: clients.size } }));
    
    ws.on('close', () => {
      clients.delete(ws);
      console.log(`🔌 WebSocket client disconnected (${clients.size} total)`);
    });

    ws.on('error', (err) => {
      console.error('WebSocket error:', err.message);
      clients.delete(ws);
    });
  });

  console.log('🔌 WebSocket server initialized on /ws');
}

export function broadcast(message: { type: string; data: any }) {
  const payload = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

export function getClientCount() {
  return clients.size;
}
