import { EventEmitter } from 'events';

export const SocketState = Object.freeze({
  CONNECTING: 'connecting',
  OPEN: 'open',
  DISCONNECTING: 'disconnecting',
  CLOSED: 'closed'
});

export const WebSocketMessageType = Object.freeze({
  SOCKET_STATE_CHANGE: 'wsStateChange',
  LIDAR_UPDATE: 'lidarUpdate',
  TRANSFORMED_LIDAR_UPDATE: 'transformedLidarUpdate',
  CONSOLIDATION_UPDATE: 'consolidationUpdate',
});

export default class WebSocketManager extends EventEmitter {
  constructor(host, port) {
    super();
    this.host = host;
    this.port = port;
    this.isConnected = false;
    this.doReconnectOnClose = false;
    this.client = null;
    this.reconnectionTimeout = null;
    this.pendingMessages = [];
    this.sendInterval = null;
  }

  get isClientConnected() {
    return this.isConnected;
  }

  connect = () => {
    if (!this.client) {
      console.log('Connecting WebSocket client');
      this.emit(WebSocketMessageType.SOCKET_STATE_CHANGE, SocketState.CONNECTING);
      this.client = new WebSocket(`ws://${this.host}:${this.port}`);
      this.client.addEventListener('open', this.onWebSocketOpen);
      this.client.addEventListener('message', this.onWebSocketMessage);
      this.client.addEventListener('close', this.onWebSocketClose);
      this.doReconnectOnClose = true;
      this.reconnectionTimeout = setTimeout(this.onWebSocketClose, 5000);
    }
  }

  disconnect = () => {
    console.log('Disconnecting WebSocket client');
    this.doReconnectOnClose = false;
    this.emit(WebSocketMessageType.SOCKET_STATE_CHANGE, SocketState.DISCONNECTING);
    if (this.client) {
      this.client.close();
    }
  }

  onWebSocketOpen = () => {
    console.log('Client connected');
    clearTimeout(this.reconnectionTimeout);
    this.isConnected = true;
    this.emit(WebSocketMessageType.SOCKET_STATE_CHANGE, SocketState.OPEN);
    // Start periodic message sending
    this.sendInterval = setInterval(this.sendPendingMessages, 100);
  }

  onWebSocketMessage = (message) => {
    const parsed = JSON.parse(message.data);
    const { type } = parsed;
    switch (type) {
      case WebSocketMessageType.LIDAR_UPDATE: {
        const { serial, samples } = parsed;
        this.emit(WebSocketMessageType.LIDAR_UPDATE, serial, samples);
      }
        break;
      case WebSocketMessageType.TRANSFORMED_LIDAR_UPDATE: {
        const { serial, samples } = parsed;
        this.emit(WebSocketMessageType.TRANSFORMED_LIDAR_UPDATE, serial, samples);
      }
        break;
      case WebSocketMessageType.CONSOLIDATION_UPDATE: {
        const { points } = parsed;
        this.emit(WebSocketMessageType.CONSOLIDATION_UPDATE, points);
      }
        break;
      default:
        console.log(
          `Received websocket message of unknown type "${type}":`,
          message
        );
    }
  }

  onWebSocketClose = () => {
    console.log('WebSocket connection closed');
    clearTimeout(this.reconnectionTimeout);
    clearInterval(this.sendInterval);
    this.isConnected = false;
    if (this.client) {
      this.client.removeEventListener('message', this.onWebSocketMessage);
      this.client.removeEventListener('close', this.onWebSocketClose);
      this.client = null;
    }
    this.emit(WebSocketMessageType.SOCKET_STATE_CHANGE, SocketState.CLOSED);
    if (this.doReconnectOnClose) {
      console.log('Attempting reconnect');
      this.connect();
    }
  }
}
