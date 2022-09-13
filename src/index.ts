import rc from "rc";
import parseConfig from "parse-strings-in-object";
import { getLogger } from "log4js";
import convert from "color-convert";

import { TetherAgent, Output, parseAgentIdOrGroup } from "@tether/tether-agent";

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
  setMask,
  setName,
  setROI,
  setRotation,
  setTranslation,
} from "./redux/rootSlice";
import PerspectiveTransformer from "./Transformer/Transformer";
import AutoMaskSampler from "./AutoMask/AutoMaskSampler";

const config: Config = parseConfig(rc("Lidar2DConsolidationAgent", defaults));

export const logger = getLogger("Lidar2DConsolidationAgent");
logger.level = config.loglevel;

const main = async () => {
  const agent = await TetherAgent.create(config.agentType, config.tether);

  const consolidator = new Consolidator();

  try {
    // load lidar transformations from external file
    const lidarConsolidatedConfig = await FileIO.load(config.lidarConfigPath);
    logger.info("Loaded config:", lidarConsolidatedConfig);
    store.dispatch(loadStore(lidarConsolidatedConfig));
  } catch (err) {
    logger.warn(
      `Could not load config file, saving default config to new file.`
    );
    FileIO.save(store.getState().config, config.lidarConfigPath);
  }

  const clusterOutput = agent.createOutput("clusters");
  const trackingOutput = agent.createOutput("trackedPoints");

  const transformer = new PerspectiveTransformer();
  const { regionOfInterest } = store.getState().config;
  if (regionOfInterest !== undefined && regionOfInterest.length === 4) {
    transformer.setCorners(regionOfInterest);
  }

  const requestConfigInput = agent.createInput("requestLidarConfig");
  const requestConfigOutput = agent.createOutput("provideLidarConfig");
  requestConfigInput.onMessage(() => {
    // These messages have empty body
    const config = store.getState().config;
    logger.info("client requested config");
    logger.debug("sending", config);
    const m = encode(config);
    // Reply with config saved in state
    requestConfigOutput.publish(m);
  });

  let autoMaskSamplers: AutoMaskSampler[] = [];

  const scansInput = agent.createInput(`scans`);
  scansInput.onMessage((payload, topic) => {
    const message = decode(payload) as ScanMessage;
    const serial = parseAgentIdOrGroup(topic);
    onScanReceived(
      message,
      serial,
      consolidator,
      transformer,
      clusterOutput,
      trackingOutput
    );
    // If any AutoMaskSampler instances are active, we'll
    // hand the scan over to the corresponding instances
    // for this Lidar (by serial)
    autoMaskSamplers.forEach((s) => {
      if (s.getCompleted() === false && s.getSerial() === serial) {
        if (s.addSamples(message)) {
          // If returns true, we know that the auto sampling has now completed
          logger.info("AutoMaskSampler for lidar", serial, "completed");
          logger.debug(JSON.stringify(s.getThresholds()));
          logger.debug(
            "Adding",
            Object.keys(s.getThresholds()).length,
            "thresholds"
          );
          store.dispatch(
            setMask({ serial, anglesWithThresholds: s.getThresholds() })
          );
          // And broadcast the new state
          const config = store.getState().config;
          logger.debug("sending", config);
          const m = encode(config);
          // Reply with config saved in state
          requestConfigOutput.publish(m);
        }
      }
    });
  });

  const requestAutoMask = agent.createInput("requestAutoMask");
  requestAutoMask.onMessage(() => {
    // These message have empty body
    const { devices } = store.getState().config;
    const { numScansrequired, minThresholdMargin } = config.autoMask;
    logger.info(
      "requestAutoMask received; will init AutoMaskSamplers for",
      devices.length,
      "device(s)"
    );
    logger.debug("Init AutoMaskSamplers with", {
      numScansrequired,
      minThresholdMargin,
    });
    autoMaskSamplers = devices.map(
      (d) => new AutoMaskSampler(d.serial, numScansrequired, minThresholdMargin)
    );
  });

  const saveConfigInput = agent.createInput("saveLidarConfig");
  saveConfigInput.onMessage(async (payload) => {
    const lidarConfig = decode(payload) as LidarConsolidatedConfig;
    logger.debug("Received Lidar config to save:", lidarConfig);

    const { devices, regionOfInterest } = lidarConfig;
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

    store.dispatch(setROI(regionOfInterest));

    if (regionOfInterest) {
      transformer.setCorners(regionOfInterest);
    }

    // Also save entire config (devices and any regionOfInterest, to disk)
    await FileIO.save(store.getState().config, config.lidarConfigPath);
  });
};

const onScanReceived = (
  samples: ScanSample[],
  serial: string,
  consolidator: Consolidator,
  transformer: PerspectiveTransformer,
  clustersPlug: Output,
  trackingPlug: Output
) => {
  // Check if this LIDAR has been added to State
  const existingDevice = store
    .getState()
    .config.devices.find((l) => l.serial === serial);
  if (!existingDevice) {
    logger.warn(
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

  // Retrieve lidar samples from the message
  logger.trace(
    `${samples.length} scan samples received from lidar with serial ${serial}`
  );

  const { scanMaskThresholds } = existingDevice;

  // Add points to consolidated map, from this device scan frame
  consolidator.setScanData(serial, samples, scanMaskThresholds);

  const {
    neighbourhoodRadius,
    minNeighbours,
    maxClusterSize,
  } = config.clustering;

  const clustersAsPoints = consolidator.findPoints(
    consolidator.getCombinedTransformedPoints(),
    neighbourhoodRadius,
    minNeighbours,
    maxClusterSize
  );

  /*
    Both "clusters" and "trackingPoints" emitted by the Agent as TrackedPoint2D[]

    The differences are:
    - Clusters always have a size (radius) included
    - Tracking Points are filtered out when they lie outside of the ROI, and their coordinates are normalised within the ROI quad
  */

  const clusterPointsToSend = encode(clustersAsPoints);
  clustersPlug.publish(clusterPointsToSend);

  if (transformer && transformer.isReady()) {
    const trackingPoints = transformer.transform(clustersAsPoints);
    logger.trace({ trackingPoints });
    trackingPlug.publish(encode(trackingPoints));
  }
};

main();
