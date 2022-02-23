import { ScanSample } from "..";

export interface Point2D {
  x: number;
  y: number;
}
export interface ScanData {
  // lidarSerial: string;
  // samples: MeasurementSample.AsObject[];
  samples: ScanSample[];
  // transformedSamples?: Vector2D.AsObject[];
  transformedSamples: Point2D[];
}
