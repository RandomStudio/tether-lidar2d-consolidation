import { IClientOptions } from "@randomstudio/tether";
export interface PerspectiveTransformConfig {
  /** If true, drop tracking points outside range [0-margin,1+margin] */
  ignoreOutside: boolean;
  ignoreOutsideMargin: number;
}

/**
 * Agent config; separate from LIDAR device config
 */
export interface Config {
  /** Message Broker connection override settings */
  tether: IClientOptions;
  agentType: string;
  loglevel: string;
  /** Where to load LIDAR device config */
  lidarConfigPath: string;
  autoBroadcastConfig: {
    /** If enabled, (re)broadcast the "state" (saved config) on start */
    onStartup: boolean;
    /** Wait, in milliseconds, before sending on startup */
    delay: number;
  };
  defaultMinDistanceThreshold: number;
  clustering: {
    /** Max distance in mm to a point which can be included in a cluster */
    neighbourhoodRadius: number;
    /** Min points count that constitutes a valid cluster */
    minNeighbours: number;
    /** If defined, exclude clusters above this size, in radius */
    maxClusterSize?: number;
  };
  perspectiveTransform: PerspectiveTransformConfig;
  autoMask: {
    numScansrequired: number;
    minThresholdMargin: number;
  };
}
