import path from "path";
import { Config } from "./types";

const defaults: Config = {
  agentType: "lidar-consolidation-agent",
  loglevel: "info",
  numLidars: 1,
  lidarConfigPath: path.resolve(__dirname, "..", "..", "dist", "lidars.json"),
  host: "127.0.0.1",
  httpPort: 3000,
  wsPort: 3001,
  maxNeighbourDistance: 250,
  minNeighbours: 3,
};

export default defaults;
