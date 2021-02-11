import rc from "rc";
import parseConfig from "parse-strings-in-object";
import { getLogger } from "log4js";
import convert from "color-convert";

import { TetherAgent, BaseAgentConfig, TrackedPoints2D, TrackedPoint2D, Vector2D } from "tether-agent";
import Plug from "tether-agent/dist/Plug";
import { MessageProperties } from "amqplib";

import { Scan } from "./messageClasses/RPLidar_pb";

import { LocalConfig } from "./config/types";
import defaults from "./config/agent-config";
import localDefaults from "./config/local-config";

import store from "./redux";
import FileIO from "./file-io";
import { addLidar, initStore } from "./redux/actions";
import { StoreState } from "./redux/types";
import Consolidator from "./consolidator";

import HTTPServer from "./httpServer";
import WebSocketServer, { WebSocketMessageType } from "./webSocketServer";
import { defaultState } from "./redux/reducers";

const agentDefaults: BaseAgentConfig = parseConfig(rc("LidarConsolidationAgent", defaults));
const localConfig: LocalConfig = parseConfig(rc("LidarConsolidationAgent", localDefaults));

const logger = getLogger("lidar-consolidation-agent");
logger.level = localConfig.loglevel;

class LidarConsolidationAgent extends TetherAgent {
  private consolidator: Consolidator;
  private outPlug: Plug<TrackedPoints2D>;
  private uiServer: HTTPServer;
  private wsServer: WebSocketServer;

  constructor() {
    super(agentDefaults);

    logger.debug("Tether agent launched with config", localConfig);

    this.registerMessageClass("RPLidar.proto:rplidar.Scan", Scan);

    this.consolidator = new Consolidator();
    this.start();
  }

  start = async () => {
    // load lidar transformations from external file
    await FileIO.load(localConfig.lidarConfigPath)
      .then(config => {
        logger.info("Loaded config:", config);
        store.dispatch(initStore({
          httpPort: localConfig.httpPort,
          wsPort: localConfig.wsPort,
          lidars: config
        } as StoreState));
      })
      .catch(err => {
        logger.error(`Could not load config file, saving default config to new file.`);
        store.dispatch(initStore(defaultState));
        const { lidars } = store.getState();
        FileIO.save(lidars, localConfig.lidarConfigPath);
      });

    this.registerMessageHandler("Scan", (message: Scan, properties: MessageProperties) => {
      this.onScanReceived(message, properties);
    });

    this.getActivatedPlug("Points").then(plug => {
      this.outPlug = plug;
    });

    this.uiServer = new HTTPServer();
    this.uiServer.start(localConfig.httpPort);

    this.wsServer = new WebSocketServer();
    this.wsServer.start(localConfig.wsPort);
  }

  private onScanReceived = (message: Scan, properties: MessageProperties) => {
    const { headers } = properties;
    const { agentInstanceId: serial } = headers; // this is populated with the serial number of the sensor

    // make sure that each connected lidar is registered in the config file
    const lidarConfig = store.getState().lidars.find(l => l.serial === serial);
    if (!lidarConfig) {
      logger.info(`Found unregistered lidar agent with serial ${serial}. Adding new config.`);
      // register new lidar with its serial number
      store.dispatch(addLidar({
        serial,
        rotation: 0,
        x: 0,
        y: 0,
        color: convert.hsv.rgb(Math.round(Math.random() * 360), 100, 100) // assign random color
      }));
      const { lidars } = store.getState();
      FileIO.save(lidars, localConfig.lidarConfigPath);
    }

    // retrieve lidar samples from the message
    const samples = message.getSamlesList().map(s => s.toObject());
    logger.debug(`${samples.length} scan samples received from lidar with serial ${serial}`);

    // determine positions of "non-background" objects based on received lidar points
    this.consolidator.setScanData({
      lidarSerial: serial,
      samples
    });

    // send lidar samples to connected UI instances
    this.wsServer.broadcast({
      type: WebSocketMessageType.LIDAR_UPDATE,
      serial,
      samples
    });
    
    const points = this.consolidator.findPoints(
      this.consolidator.getCombinedTransformedSamples(),
      localConfig.maxNeighbourDistance,
      localConfig.minNeighbours
    );
    
    // broadcast consolidated points to connected UI instances
    this.wsServer.broadcast({
      type: WebSocketMessageType.CONSOLIDATION_UPDATE,
      points
    });

    // send out consolidated points to Tether agents
    if (this.outPlug) {
      const msg = this.outPlug.getMessageInstance();
      msg.setPointsList(points.map(p => {
        const point = new TrackedPoint2D();
        point.setId(p.id)
        point.setSize(p.size);
        const pos = new Vector2D();
        pos.setX(p.position.x);
        pos.setY(p.position.y);
        point.setPosition(pos);
        return point;
      }));
      this.outPlug.sendMessage(msg);
    }
  }

  protected async onShutdown(code: string) {
    // perform cleanup actions
    this.outPlug = null;
    await this.uiServer.stop();
    return this.wsServer.stop();
  }
}

// Instantiate
new LidarConsolidationAgent();
