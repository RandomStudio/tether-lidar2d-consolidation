import { LogLevel } from "tether-agent";

export interface LocalConfig {
  loglevel: LogLevel;
  numLidars: number;
  lidarConfigPath: string;
  host: string;
  httpPort: number;
  wsPort: number;
}