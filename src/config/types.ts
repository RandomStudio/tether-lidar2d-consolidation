import { IClientOptions } from "@randomstudio/tether";
export interface PerspectiveTransformConfig {
  ignoreOutside: boolean;
  ignoreOutsideMargin: number;
}

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
  preprocess: {
    minDistance?: number;
  };
  clustering: {
    neighbourhoodRadius: number;
    minNeighbours: number;
    maxClusterSize?: number;
  };
  perspectiveTransform: PerspectiveTransformConfig;
  autoMask: {
    numScansrequired: number;
    minThresholdMargin: number;
  };
}
