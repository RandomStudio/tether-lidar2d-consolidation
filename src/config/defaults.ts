import path from "path";
import { Config } from "./types";

const defaults: Config = {
  tether: {
    host: "localhost",
  },
  agentType: "lidarConsolidation",
  loglevel: "info",
  numLidars: 1,
  lidarConfigPath: path.resolve(__dirname, "..", "..", "dist", "lidars.json"),
  clustering: {
    neighbourhoodRadius: 200,
    minNeighbours: 3,
    maxClusterSize: 2500,
  },
};

export default defaults;
