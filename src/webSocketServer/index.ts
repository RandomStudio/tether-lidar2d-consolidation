import { EventEmitter } from "events";
import { Server } from "ws";
import { getLogger } from "log4js";
import { MeasurementSample } from "../messageClasses/RPLidar_pb";
import { TrackedPoint2D } from "tether-agent";

const logger = getLogger("lidar-consolidation-agent");

export const WebSocketMessageType = Object.freeze({
  LIDAR_UPDATE: "lidarUpdate",
  CONSOLIDATION_UPDATE: "consolidationUpdate",
});

export type LidarScanMessage = {
  type: string;
  serial: number;
  samples: MeasurementSample.AsObject[];
};

export type ConsolidationMessage = {
  type: string;
  points: TrackedPoint2D.AsObject[];
};

export type BroadcastMessage = LidarScanMessage | ConsolidationMessage;

export default class WebSocketServer extends EventEmitter {
  private isRunning: Boolean = false;
  private server: Server;
  private pendingBroadcastMessages: BroadcastMessage[] = [];
  private broadcastInterval: NodeJS.Timeout;

  start = (port: number) => {
    if (!this.isRunning) {
      this.server = new Server({ port });
      this.isRunning = true;
      logger.info(`WebSocket server started on port ${port}`);
      this.broadcastInterval = setInterval(this.sendPendingBroadcastMessages, 100);
    }
  }

  stop = (): Promise<void> => (
    new Promise((resolve, reject) => {
      if (this.isRunning) {
        this.isRunning = false;
        clearInterval(this.broadcastInterval);
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

  /**
   * Send a WebSocket message to all connected clients. Broadcast rates are managed
   * by sending at an interval. Any new messages added during the interval time will
   * replace corresponding messages currently in the queue.
   * @param message 
   */
  broadcast = (message: BroadcastMessage) => {
    switch (message.type) {
      case WebSocketMessageType.LIDAR_UPDATE: {
        const src: LidarScanMessage = message as LidarScanMessage;
        // Lidar update messages are identified by serial
        const overridable = this.pendingBroadcastMessages.find(m => (
          m.type === message.type
          && (m as LidarScanMessage).serial === src.serial
        ));
        if (overridable) {
          this.replaceMessage(overridable, message);
        } else {
          this.pendingBroadcastMessages.push(message);
        }
      }
      break;
      case WebSocketMessageType.CONSOLIDATION_UPDATE: {
        // Consolidation messages are sent once per interval
        const overridable = this.pendingBroadcastMessages.find(m => (
          m.type === message.type
        ));
        if (overridable) {
          this.replaceMessage(overridable, message);
        } else {
          this.pendingBroadcastMessages.push(message);
        }
      }
      break;
      default:
        logger.warn(`Attempting broadcast of unknown message type "${message.type}"`);
    }
  }

  replaceMessage = (target: BroadcastMessage, replacement: BroadcastMessage) => {
    this.pendingBroadcastMessages = [
      ...this.pendingBroadcastMessages.filter(m => m !== target),
      replacement
    ];
  }

  sendPendingBroadcastMessages = () => {
    while (this.pendingBroadcastMessages.length) {
      const message = this.pendingBroadcastMessages.shift();
      const json = JSON.stringify(message);
      logger.debug("Broadcasting message:", json);
      this.server.clients.forEach(client => {
        client.send(json);
      });
    }
  }
}