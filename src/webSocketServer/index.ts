import { EventEmitter } from "events";
import { Server } from "ws";

export const WebSocketMessageType = Object.freeze({
  LIDAR_UPDATE: "lidarUpdate",
  CONSOLIDATION_UPDATE: "consolidationUpdate",
});

export default class WebSocketServer extends EventEmitter {
  private isRunning: Boolean = false;
  private server: Server;

  constructor() {
    super();
  }

  start = (port: number) => {
    if (!this.isRunning) {
      this.server = new Server({ port });
      this.isRunning = true;
      console.log(`WebSocket server started on port ${port}`);
    }
  }

  stop = (): Promise<void> => (
    new Promise((resolve, reject) => {
      if (this.isRunning) {
        this.isRunning = false;
        this.server.close(err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    })
  );

  broadcast = (data: any) => {
    this.server.clients.forEach(client => {
      client.send(JSON.stringify(data))
    });
  }
}