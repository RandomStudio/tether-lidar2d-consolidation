import { MeasurementSample } from "../messageClasses/RPLidar_pb";

export interface ScanData {
  lidarSerial: string;
  samples: MeasurementSample.AsObject[];
}