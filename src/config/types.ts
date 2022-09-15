import { IClientOptions } from "@randomstudio/tether";
export interface Config {
  tether: IClientOptions;
  agentType: string;
  loglevel: string;
  numLidars: number;
  lidarConfigPath: string;
  autoBroadcastConfig: {
    onStartup: boolean;
    delay: number;
  };
  clustering: {
    neighbourhoodRadius: number;
    minNeighbours: number;
    maxClusterSize?: number;
  };
  perspectiveTransform: {
    ignoreOutside: boolean;
    ignoreOutsideMargin: number;
  };
  autoMask: {
    numScansrequired: number;
    minThresholdMargin: number;
  };
}
