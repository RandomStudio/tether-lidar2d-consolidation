import { IClientOptions } from "@tether/tether-agent";

export interface Config {
  tether: IClientOptions;
  agentType: string;
  loglevel: string;
  numLidars: number;
  lidarConfigPath: string;
  maxNeighbourDistance: number;
  minNeighbours: number;
}
