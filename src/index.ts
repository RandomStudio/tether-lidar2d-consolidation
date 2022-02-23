import rc from "rc";
import parseConfig from "parse-strings-in-object";
import { getLogger } from "log4js";
import convert from "color-convert";

import { TetherAgent, Input, Output, parseAgentID } from "@tether/tether-agent";

import defaults from "./config/defaults";

import store from "./redux";
import FileIO from "./file-io";
import { addLidar, initStore } from "./redux/actions";
import Consolidator from "./consolidator";

import HTTPServer from "./httpServer";
import WebSocketServer, { WebSocketMessageType } from "./webSocketServer";
import { defaultState } from "./redux/reducers";
import { Config } from "./config/types";
import { decode } from "@msgpack/msgpack";

const config: Config = parseConfig(rc("Lidar2DConsolidationAgent", defaults));

const logger = getLogger("Lidar2DConsolidationAgent");
logger.level = config.loglevel;

interface Scan {
  quality: number;
  angle: number;
  distance: number;
}

type ScanMessage = Scan[];

const main = async () => {
  const agent = await TetherAgent.create(config.agentType);

  const consolidator = new Consolidator();
  // const wsServer: WebSocketServer;

  try {
    // load lidar transformations from external file
    const lidarConfig = await FileIO.load(config.lidarConfigPath);
    logger.info("Loaded config:", lidarConfig);
    store.dispatch(
      initStore({
        lidars: lidarConfig,
        lidarConfigPath: config.lidarConfigPath,
      })
    );
  } catch (err) {
    // TODO: is this an error or expected behaviour? logger.warn, then?
    logger.error(
      `Could not load config file, saving default config to new file.`
    );
    store.dispatch(initStore(defaultState));
    const { lidars } = store.getState();
    FileIO.save(lidars, config.lidarConfigPath);
  }
  const outPlug = agent.createOutput("TrackedPoints2D");

  const plug = agent.createInput(`lidar`);

  plug.onMessage((payload, topic) => {
    const message = decode(payload) as ScanMessage;
    const serial = parseAgentID(topic);
    onScanReceived(message, serial, outPlug, consolidator);
  });
};

const onScanReceived = (
  message: ScanMessage,
  serial: string,
  outPlug: Output,
  consolidator: Consolidator
) => {
  // make sure that each connected lidar is registered in the config file

  // TODO: store needs to have proper typing for state!
  const lidarConfig = store.getState().lidars.find((l) => l.serial === serial);
  if (!lidarConfig) {
    logger.info(
      `Found unregistered lidar agent with serial ${serial}. Adding new config.`
    );
    // register new lidar with its serial number
    store.dispatch(
      addLidar({
        serial,
        name: serial,
        rotation: 0,
        x: 0,
        y: 0,
        color: convert.hsv.rgb(Math.round(Math.random() * 360), 100, 100), // assign random color
      })
    );
    const { lidars } = store.getState();
    FileIO.save(lidars, config.lidarConfigPath);
  }

  // retrieve lidar samples from the message
  logger.debug(
    `${message.length} scan samples received from lidar with serial ${serial}`
  );

  // determine positions of "non-background" objects based on received lidar points
  consolidator.setScanData({
    lidarSerial: serial,
    message,
  });

  // // send lidar samples to connected UI instances
  // this.wsServer.broadcast({
  //   type: WebSocketMessageType.LIDAR_UPDATE,
  //   serial,
  //   samples
  // });

  const points = consolidator.findPoints(
    consolidator.getCombinedTransformedSamples(),
    config.maxNeighbourDistance,
    config.minNeighbours
  );

  // // broadcast consolidated points to connected UI instances
  // this.wsServer.broadcast({
  //   type: WebSocketMessageType.CONSOLIDATION_UPDATE,
  //   points
  // });

  // send out consolidated points to Tether agents
  // const msg = outPlug.getMessageInstance();
  msg.setPointsList(
    points.map((p) => {
      const point = new TrackedPoint2D();
      point.setId(p.id);
      point.setSize(p.size);
      const pos = new Vector2D();
      pos.setX(p.position.x);
      pos.setY(p.position.y);
      point.setPosition(pos);
      return point;
    })
  );
  outPlug.sendMessage(msg);
};

// const  onShutdown= (code: string) =>{
//   // perform cleanup actions
//   this.outPlug = null;
//   await this.uiServer.stop();
//   return this.wsServer.stop();
// }

main();
