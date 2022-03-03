import rc from "rc";
import parseConfig from "parse-strings-in-object";
import { getLogger } from "log4js";
import convert from "color-convert";

import { TetherAgent, Output, parseAgentID } from "@tether/tether-agent";

import defaults from "./config/defaults";

import store from "./redux";
import FileIO from "./file-io";

import Consolidator from "./consolidator";

import { Config } from "./config/types";
import { decode, encode } from "@msgpack/msgpack";
import {
  LidarConsolidatedConfig,
  ScanMessage,
  ScanSample,
} from "./consolidator/types";
import {
  addDevice,
  loadStore,
  setColor,
  setName,
  setRotation,
  setTranslation,
} from "./redux/rootSlice";

const config: Config = parseConfig(rc("Lidar2DConsolidationAgent", defaults));

export const logger = getLogger("Lidar2DConsolidationAgent");
logger.level = config.loglevel;

const main = async () => {
  const agent = await TetherAgent.create(config.agentType, config.tether);

  const consolidator = new Consolidator();
  // const wsServer: WebSocketServer;

  try {
    // load lidar transformations from external file
    const lidarConsolidatedConfig = await FileIO.load(config.lidarConfigPath);
    logger.info("Loaded config:", lidarConsolidatedConfig);
    store.dispatch(loadStore(lidarConsolidatedConfig));
  } catch (err) {
    logger.warn(
      `Could not load config file, saving default config to new file.`
    );
    // store.dispatch(initStore(defaultState));
    FileIO.save(store.getState().config, config.lidarConfigPath);
  }
  const consolidatedOutput = agent.createOutput("TrackedPoints2D");

  const scansInput = agent.createInput(`scan`);
  scansInput.onMessage((payload, topic) => {
    const message = decode(payload) as ScanMessage;
    const serial = parseAgentID(topic);
    onScanReceived(message, serial, consolidatedOutput, consolidator);
  });

  const requestConfigInput = agent.createInput("requestLidarConfig");
  const requestConfigOutput = agent.createOutput("provideLidarConfig");
  requestConfigInput.onMessage(() => {
    // These messages have empty body
    const config = store.getState().config;
    console.log("config requested; sending", config);
    const m = encode(config);
    // Reply with config saved in state
    requestConfigOutput.publish(m);
  });

  const saveConfigInput = agent.createInput("saveLidarConfig");
  saveConfigInput.onMessage(async (payload) => {
    const lidarConfig = decode(payload) as LidarConsolidatedConfig;
    console.log("Received Lidar config to save:", lidarConfig);

    const { devices } = lidarConfig;
    devices.forEach((d) => {
      const { serial, name, rotation, x, y, color } = d;

      const device = store
        .getState()
        .config.devices.find((l) => l.serial === serial);
      if (device) {
        store.dispatch(setName({ serial, name }));
        store.dispatch(setRotation({ serial, rotation }));
        store.dispatch(setTranslation({ serial, x, y }));
        const [r, g, b] = color;
        store.dispatch(setColor({ serial, r, g, b }));
      } else {
        throw Error("Could not match LIDAR by serial number " + serial);
      }
    });

    // Also save entire config (devices and any regionOfInterest, to disk)
    await FileIO.save(store.getState().config, config.lidarConfigPath);
  });
};

const onScanReceived = (
  samples: ScanSample[],
  serial: string,
  outPlug: Output,
  consolidator: Consolidator
) => {
  // Check if this LIDAR has been added to State
  const existingDevice = store
    .getState()
    .config.devices.find((l) => l.serial === serial);
  if (!existingDevice) {
    logger.info(
      `Found unregistered lidar agent with serial ${serial}. Adding new config.`
    );
    // Register new lidar with its serial number
    store.dispatch(
      addDevice({
        serial,
        name: serial,
        rotation: 0,
        x: 0,
        y: 0,
        color: convert.hsv.rgb(Math.round(Math.random() * 360), 100, 100), // assign random color
      })
    );

    // Also save to disk
    FileIO.save(store.getState().config, config.lidarConfigPath);
  }

  // retrieve lidar samples from the message
  logger.debug(
    `${samples.length} scan samples received from lidar with serial ${serial}`
  );

  // determine positions of "non-background" objects based on received lidar points
  consolidator.setScanData(serial, samples);

  const {
    neighbourhoodRadius,
    minNeighbours,
    maxClusterSize,
  } = config.clustering;

  const points = consolidator.findPoints(
    consolidator.getCombinedTransformedPoints(),
    neighbourhoodRadius,
    minNeighbours,
    maxClusterSize
  );

  const trackedPoints = encode(points);
  outPlug.publish(trackedPoints);
};

main();
