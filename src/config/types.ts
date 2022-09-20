import { IClientOptions } from "@randomstudio/tether";
export interface PerspectiveTransformConfig {
  /** If true, drop tracking points outside range [0-margin,1+margin] */
  ignoreOutside: boolean;
  ignoreOutsideMargin: number;
}

export interface Config {
  /** Message Broker connection override settings */
  tether: IClientOptions;
  agentType: string;
  loglevel: string;
  lidarConfigPath: string;
  autoBroadcastConfig: {
    onStartup: boolean;
    delay: number;
  };
  preprocess: {
    /** If defined, ignore samples closer than this for CLUSTERING  */
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
