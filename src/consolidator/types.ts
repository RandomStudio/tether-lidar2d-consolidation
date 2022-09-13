export interface Point2D {
  x: number;
  y: number;
}

export interface LidarDeviceConfig {
  serial: string;
  name: string;
  rotation: number;
  x: number;
  y: number;
  color: number[];
}

export enum CornerIndex {
  topLeft = 0,
  topRight,
  bottomRight,
  bottomLeft,
}

export interface CornerPoint {
  corner: CornerIndex;
  x: number;
  y: number;
}

export interface LidarConsolidatedConfig {
  devices: LidarDeviceConfig[];
  regionOfInterest?: CornerPoint[];
}

export interface ScanData {
  samples: ScanSample[];
  transformedSamples: Point2D[];
}

export type ScanSample = [number, number, number]; // [0] = angle, [1] = distance, [2?] = quality

export type ScanMessage = ScanSample[];

export interface TrackedPoint2D {
  id: number;
  size?: number;
  x: number;
  y: number;
}

export interface ExcludeRegion extends TrackedPoint2D {
  size: number;
}
