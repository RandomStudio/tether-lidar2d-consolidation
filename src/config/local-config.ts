import path from "path";
import { LocalConfig } from "./types";

const localDefaults: LocalConfig = {
  loglevel: "info",
  numLidars: 2,
  lidarConfigPath: path.resolve(__dirname, "..", "..", "dist", "lidars.json"),
  host: "127.0.0.1",
  httpPort: 3000,
  wsPort: 3001
};

export default localDefaults;
