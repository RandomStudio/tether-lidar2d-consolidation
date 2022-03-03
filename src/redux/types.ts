import { LidarDeviceConfig } from "../consolidator/types";

export interface StoreState {
  lidarConfigPath: string;
  lidars: LidarDeviceConfig[];
}
