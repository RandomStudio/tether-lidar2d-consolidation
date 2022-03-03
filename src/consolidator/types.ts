import { ScanSample } from "..";

export interface Point2D {
  x: number;
  y: number;
}

export interface LidarConfig {
  serial: string;
  name: string;
  rotation: number;
  x: number;
  y: number;
  color: number[];
}

export interface ScanData {
  samples: ScanSample[];
  transformedSamples: Point2D[];
}
