import { EventEmitter } from "events";
import path from "path";
import express from "express";
import bodyParser from "body-parser";
import { Server } from "http";
import { createHttpTerminator, HttpTerminator } from "http-terminator";
import { getLogger } from "log4js";

import { router } from './routes';

const logger = getLogger("lidar-consolidation-agent");

export default class HTTPServer extends EventEmitter {
  private expressApp: express.Application;
  private server: Server;
  private httpTerminator: HttpTerminator;
  private isRunning: boolean = false;
  
  constructor() {
    super();

    this.expressApp = express();
    this.expressApp.use(bodyParser.json());
    this.expressApp.use(bodyParser.urlencoded({ extended: true }));
    this.expressApp.use(express.static(path.join(__dirname, "..", "ui")));
    
    this.expressApp.use('/', router);

    this.expressApp.get('*', (request, response) => {
      response.sendFile(path.join(__dirname, "..", "ui", "index.html"));
    });
  }

  start = (port: number) => {
    if (!this.isRunning) {
      logger.info(`Starting HTTP server on port ${port}`);
      this.server = this.expressApp.listen(port);
  
      // wrap server instance in a "terminator", which will keep track of all
      // open connection and notify connected clients when the server is
      // about to shut down
      this.httpTerminator = createHttpTerminator({ 
        gracefulTerminationTimeout: 5000,
        server: this.server
      });

      this.isRunning = true;
    } else {
      logger.warn(`Server is already running`);
    }
  }

  stop = () => {
    if (this.isRunning) {
      logger.info(`Stopping HTTP server`);
      const result = this.httpTerminator.terminate();
      this.server = null;
      this.isRunning = false;
      return result;
    }
  }
}