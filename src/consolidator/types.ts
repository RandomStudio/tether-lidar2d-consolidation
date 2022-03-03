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

export interface LidarConsolidatedConfig {
  devices: LidarDeviceConfig[];
  regionOfInterest: {
    topLeft: [number, number];
    topRight: [number, number];
    bottomRight: [number, number];
    bottomLeft: [number, number];
  };
}

export interface ScanData {
  samples: ScanSample[];
  transformedSamples: Point2D[];
}

export interface ScanSample {
  quality: number;
  angle: number;
  distance: number;
}

export type ScanMessage = ScanSample[];

export interface TrackedPoint2D {
  id: number;
  size?: number;
  x: number;
  y: number;
}
