import path from "path";
import { Config } from "./types";

const defaults: Config = {
  tether: {
    host: "localhost",
  },
  agentType: "lidarConsolidation",
  loglevel: "info",
  numLidars: 1,
  lidarConfigPath: path.resolve(
    __dirname,
    "..",
    "..",
    "dist",
    "consolidationConfig.json"
  ),
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
    numScansrequired: 16,
    minThresholdMargin: 10,
  },
};

export default defaults;
