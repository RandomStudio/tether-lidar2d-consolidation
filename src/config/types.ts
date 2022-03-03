import { IClientOptions } from "@tether/tether-agent";

export interface Config {
  tether: IClientOptions;
  agentType: string;
  loglevel: string;
  numLidars: number;
  lidarConfigPath: string;
  clustering: {
    neighbourhoodRadius: number;
    minNeighbours: number;
    maxClusterSize?: number;
  };
  perspectiveTransform: {
    ignoreOutside: boolean;
    ignoreOutsideMargin: number;
  };
}
