export interface Point2D {
  x: number;
  y: number;
}

export interface AnglesWithThresholds {
  [angle: number]: number;
}
// export type AnglesWithThresholds = Map<number, number>;

export interface LidarDeviceConfig {
  serial: string;
  name: string;
  rotation: number;
  x: number;
  y: number;
  color: string;
  scanMaskThresholds?: AnglesWithThresholds;
  /** If nonzero, ignore samples closer than this for CLUSTERING  */
  minDistanceThreshold: number;
  flipCoords?: [number, number];
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

export interface ConsolidatorConfig {
  devices: LidarDeviceConfig[];
  regionOfInterest?: CornerPoint[];
}

export interface ScanData {
  samples: ScanSample[];
  transformedSamples: Point2D[];
}

export type ScanSample = [number, number, number]; // [0] = angle, [1] = distance, [2?] = quality

export type ScanMessage = ScanSample[];

export interface RequestAutoMaskMessage {
  type: "new" | "clear";
}

export interface TrackedPoint2D {
  id: number;
  size?: number;
  x: number;
  y: number;
}

export interface ExcludeRegion extends TrackedPoint2D {
  size: number;
}
