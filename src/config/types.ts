import { LogLevel } from "tether-agent";

export interface LocalConfig {
  loglevel: LogLevel;
  lidarConfigPath: string;
  host: string;
  httpPort: number;
  wsPort: number;
  maxNeighbourDistance: number;
  minNeighbours: number;
}