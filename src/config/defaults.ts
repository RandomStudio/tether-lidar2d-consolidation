import path from "path";
import { Config } from "./types";

const defaults: Config = {
  tether: {
    host: "localhost",
  },
  agentType: "lidarConsolidation",
  loglevel: "info",
  lidarConfigPath: path.resolve(
    __dirname,
    "..",
    "..",
    "dist",
    "consolidationConfig.json"
  ),
  autoBroadcastConfig: {
    onStartup: true,
    delay: 2000,
  },
  preprocess: {
    minDistance: 20,
  },
  clustering: {
    neighbourhoodRadius: 300,
    minNeighbours: 3,
    maxClusterSize: 2500,
  },
  perspectiveTransform: {
    ignoreOutside: true,
    ignoreOutsideMargin: 0.04,
  },
  autoMask: {
    numScansrequired: 45, // at 15Hz, this is 3 seconds
    minThresholdMargin: 50,
  },
};

export default defaults;
