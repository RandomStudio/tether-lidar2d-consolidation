import path from "path";
import { Config } from "./types";

const defaults: Config = {
  tether: {},
  agentType: "lidarConsolidation",
  loglevel: "info",
  numLidars: 1,
  lidarConfigPath: path.resolve(__dirname, "..", "..", "dist", "lidars.json"),
  maxNeighbourDistance: 250,
  minNeighbours: 3,
};

export default defaults;
