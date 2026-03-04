import { WebSocket } from 'ws';

let deviceWS: WebSocket | null = null;
let sessionStart = Date.now();
let reconnectTimeout: NodeJS.Timeout | null = null;
let streaming = true;
let clients: Set<WebSocket> = new Set();

// Connect to FSR device WebSocket
function connectToDevice() {
  if (deviceWS && deviceWS.readyState === WebSocket.OPEN) return;

  try {
    deviceWS = new WebSocket('ws://192.168.0.54:82/');

    deviceWS.on('open', () => {
      sessionStart = Date.now();
      console.log('Connected to FSR device at ws://192.168.0.54:82/');
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    });

    deviceWS.on('message', (buffer: Buffer) => {
      if (!streaming) return;

      try {
        const raw = JSON.parse(buffer.toString());
        console.log('Received from FSR device:', raw);

        if (typeof raw.force === 'number') {
          const msg = {
            t: Date.now() - sessionStart,
            force: raw.force,
            voltage: raw.voltage || null,
            sensorValue: raw.sensorValue || null
          };

          // Broadcast to all connected frontend clients
          clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              try {
                client.send(JSON.stringify(msg));
              } catch (err: any) {
                console.warn('Failed to send to client:', err.message);
              }
            }
          });
        }
      } catch (err: any) {
        console.warn('Failed to parse device message:', err.message);
      }
    });

    deviceWS.on('close', () => {
      console.log('FSR device connection closed, attempting reconnect...');
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      reconnectTimeout = setTimeout(connectToDevice, 2000);
    });

    deviceWS.on('error', (err: Error) => {
      console.warn('FSR device connection error:', err.message);
      try { deviceWS?.close(); } catch { }
    });

  } catch (err: any) {
    console.error('Failed to create FSR device connection:', err.message);
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    reconnectTimeout = setTimeout(connectToDevice, 5000);
  }
}

export function addClient(client: WebSocket) {
  clients.add(client);
  console.log('Frontend client connected. Total clients:', clients.size);

  // Send initial status
  try {
    client.send(JSON.stringify({ status: 'connected' }));
  } catch { }

  client.on('close', () => {
    clients.delete(client);
    console.log('Frontend client disconnected. Total clients:', clients.size);
  });

  client.on('error', (err: Error) => {
    console.warn('Frontend client error:', err.message);
    clients.delete(client);
  });

  // Start device connection if not already connected
  if (!deviceWS || deviceWS.readyState !== WebSocket.OPEN) {
    connectToDevice();
  }
}

export function stopStream() {
  streaming = false;
  if (deviceWS) {
    try { deviceWS.close(); } catch { }
  }
}

export function resumeStream() {
  streaming = true;
  if (!deviceWS || deviceWS.readyState !== WebSocket.OPEN) {
    connectToDevice();
  }
}

// Initialize on module load
connectToDevice();
