import rc from "rc";
import parseConfig from "parse-strings-in-object";
import { getLogger } from "log4js";
import convert from "color-convert";

import { TetherAgent, Output, parseAgentIdOrGroup } from "@randomstudio/tether";

import defaults from "./config/defaults";

import store from "./redux";
import ConfigFileManager from "./ConfigFileManager";

import Consolidator from "./Consolidator";

import { Config } from "./config/types";
import { decode, encode } from "@msgpack/msgpack";
import {
  ConsolidatorConfig,
  RequestAutoMaskMessage,
  ScanMessage,
  ScanSample,
} from "./types";
import {
  addDevice,
  clearMask,
  clearROI,
  loadStore,
  setColor,
  setMask,
  setMinDistance,
  setName,
  setROI,
  setRotation,
  setTranslation,
} from "./redux/rootSlice";
import PerspectiveTransformer from "./Transformer";
import AutoMaskSampler from "./AutoMaskSampler";

const config: Config = parseConfig(rc("Lidar2DConsolidationAgent", defaults));

export const logger = getLogger("Lidar2DConsolidationAgent");
logger.level = config.loglevel;

logger.debug("Startpup with config", JSON.stringify(config, null, 2));

const broadcastState = (agent: TetherAgent) => {
  const provideConfigOutput = agent.getOutput("provideLidarConfig");
  if (provideConfigOutput) {
    const config = store.getState().config;
    logger.debug("sending config", config);
    const m = encode(config);
    provideConfigOutput.publish(m);
  } else {
    logger.error("broadcastState: Could not find Output provideLidarConfig");
  }
};

const main = async () => {
  const agent = await TetherAgent.create(config.agentType, config.tether);

  const consolidator = new Consolidator();

  try {
    // load lidar transformations from external file
    const lidarConsolidatedConfig = await ConfigFileManager.load(
      config.lidarConfigPath
    );
    logger.info("Loaded config:", lidarConsolidatedConfig);
    store.dispatch(loadStore(lidarConsolidatedConfig));
  } catch (err) {
    logger.warn(
      `Could not load config file, saving default config to new file.`
    );
    await ConfigFileManager.save(
      store.getState().config,
      config.lidarConfigPath
    );
  }

  const clusterOutput = agent.createOutput("clusters");
  const trackingOutput = agent.createOutput("trackedPoints");

  const transformer = new PerspectiveTransformer(config.perspectiveTransform);
  const { regionOfInterest } = store.getState().config;
  if (regionOfInterest !== undefined && regionOfInterest.length === 4) {
    transformer.setCorners(regionOfInterest);
  }

  const requestConfigInput = agent.createInput("requestLidarConfig");

  const provideLidarConfigOutput = agent.createOutput("provideLidarConfig");
  if (config.autoBroadcastConfig.onStartup) {
    setTimeout(() => {
      logger.info("on startup, broadcast Config/State...");
      broadcastState(agent);
    }, config.autoBroadcastConfig.delay);
  }
  requestConfigInput.onMessage(() => {
    // These messages have empty body
    logger.info("client requested config");
    broadcastState(agent);
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
      trackingOutput,
      agent
    );
    // If any AutoMaskSampler instances are active, we'll
    // hand the scan over to the corresponding instances
    // for this Lidar (by serial)
    autoMaskSamplers.forEach((s) => {
      if (s.getCompleted() === false && s.getSerial() === serial) {
        if (s.addSamples(message)) {
          // If returns true, we know that the auto sampling has now completed
          logger.info(
            "AutoMaskSampler for lidar",
            serial,
            "completed; added",
            "Adding",
            Object.keys(s.getThresholds()).length,
            "thresholds"
          );
          logger.debug(JSON.stringify(s.getThresholds()));
          store.dispatch(
            setMask({ serial, anglesWithThresholds: s.getThresholds() })
          );
          // And broadcast the new state
          broadcastState(agent);
        }
      }
    });
  });

  const requestAutoMask = agent.createInput("requestAutoMask");
  requestAutoMask.onMessage(async (payload, topic) => {
    logger.debug("on requestAutoMask message", { topic });
    const m = decode(payload) as RequestAutoMaskMessage;
    const { devices } = store.getState().config;

    switch (m.type) {
      case "new":
        const { numScansrequired, minThresholdMargin } = config.autoMask;
        logger.info(
          `requestAutoMask "new" received; will init AutoMaskSamplers for`,
          devices.length,
          "device(s)"
        );
        logger.debug("Init AutoMaskSamplers with", {
          numScansrequired,
          minThresholdMargin,
        });
        autoMaskSamplers = devices.map(
          (d) =>
            new AutoMaskSampler(d.serial, numScansrequired, minThresholdMargin)
        );
        // New state will be broadcast once automask sampling is completed;
        // (see scansInput.onMessage handler)
        break;
      case "clear":
        logger.info(
          `requestAutoMask "clear" received; will clear AutoMaskSamplers for`,
          devices.length,
          "device(s)"
        );
        autoMaskSamplers = [];
        devices.forEach((d) => {
          store.dispatch(clearMask({ serial: d.serial }));
        });

        // Also save entire config (devices and any regionOfInterest, to disk)
        await ConfigFileManager.save(
          store.getState().config,
          config.lidarConfigPath
        );

        // And new state broadcast
        broadcastState(agent);
        break;

      default:
        logger.error(
          `Unknown "type" property in requestAutoMask message: "${m.type}"`
        );
    }
  });

  const saveConfigInput = agent.createInput("saveLidarConfig");
  saveConfigInput.onMessage(async (payload) => {
    const lidarConfig = decode(payload) as ConsolidatorConfig;
    logger.debug("Received Lidar config to save:", lidarConfig);

    const { devices, regionOfInterest } = lidarConfig;
    logger.info("Received config to save, with", devices.length, "device(s)");

    devices.forEach((d) => {
      const { serial, name, rotation, x, y, color, minDistanceThreshold } = d;

      const device = store
        .getState()
        .config.devices.find((l) => l.serial === serial);
      if (device) {
        store.dispatch(setName({ serial, name }));
        store.dispatch(setRotation({ serial, rotation }));
        store.dispatch(setTranslation({ serial, x, y }));
        store.dispatch(setColor({ serial, color }));
        if (minDistanceThreshold) {
          store.dispatch(
            setMinDistance({ serial, distance: minDistanceThreshold })
          );
        }
      } else {
        throw Error("Could not match LIDAR by serial number " + serial);
      }
    });

    if (regionOfInterest) {
      store.dispatch(setROI(regionOfInterest));
    } else {
      store.dispatch(clearROI());
    }

    if (regionOfInterest) {
      transformer.setCorners(regionOfInterest);
    }

    // Also save entire config (devices and any regionOfInterest, to disk)
    await ConfigFileManager.save(
      store.getState().config,
      config.lidarConfigPath
    );

    // And re-broadcast updated state
    broadcastState(agent);
  });
};

const onScanReceived = (
  samples: ScanSample[],
  serial: string,
  consolidator: Consolidator,
  transformer: PerspectiveTransformer,
  clustersPlug: Output,
  trackingPlug: Output,
  agent: TetherAgent
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
        color:
          "#" + convert.hsv.hex([Math.round(Math.random() * 360), 100, 100]), // assign random color,
        minDistanceThreshold: config.defaultMinDistanceThreshold,
      })
    );

    // Also save to disk
    ConfigFileManager.save(store.getState().config, config.lidarConfigPath)
      .then(() => {
        logger.info("Saved new config to disk OK");
      })
      .catch((e) => {
        logger.error("Error saving new config to disk: ", e);
      });

    // And (re)broadcast state
    broadcastState(agent);
  } else {
    // Retrieve lidar samples from the message
    logger.trace(
      `${samples.length} scan samples received from lidar with serial ${serial}`
    );

    const { scanMaskThresholds } = existingDevice;

    // Add points to consolidated map, from this device scan frame
    consolidator.setScanData(
      serial,
      samples,
      existingDevice.minDistanceThreshold,
      scanMaskThresholds,
      existingDevice.flipCoords
    );

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
  }
};

main();
