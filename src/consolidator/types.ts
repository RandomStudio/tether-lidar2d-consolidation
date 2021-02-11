import { Vector2D } from "tether-agent";
import { MeasurementSample } from "../messageClasses/RPLidar_pb";

export interface ScanData {
  lidarSerial: string;
  samples: MeasurementSample.AsObject[];
  transformedSamples?: Vector2D.AsObject[];
}