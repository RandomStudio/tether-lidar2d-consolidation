import { LidarConfig } from "../consolidator/types";

export interface StoreState {
  lidarConfigPath: string;
  lidars: LidarConfig[];
}
