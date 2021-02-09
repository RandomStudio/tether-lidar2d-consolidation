export interface LidarConfig {
  serial: string;
  plugName: string;
  rotation: number;
  x: number;
  y: number;
  color: number[];
}

export interface StoreState {
  host: string;
  httpPort: number;
  wsPort: number;
  lidarConfigPath: string;
  lidars: LidarConfig[];
};