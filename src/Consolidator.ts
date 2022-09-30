import Clustering from "density-clustering";
import store from "./redux";

import { logger } from ".";
import {
  AnglesWithThresholds,
  Point2D,
  ScanData,
  ScanSample,
  TrackedPoint2D,
} from "./types";

export default class Consolidator {
  private dbscan: Clustering.DBSCAN;
  private scans: Map<string, ScanData> = new Map<string, ScanData>();

  constructor() {
    this.dbscan = new Clustering.DBSCAN();
  }

  public getScanData = (): Map<string, ScanData> => {
    return this.scans;
  };

  public getScanDataForSerial(serial: string): ScanData {
    return this.scans.get(serial);
  }

  public getCombinedTransformedPoints = (): Point2D[] => {
    let combined: Point2D[] = [];
    const { devices } = store.getState().config;
    for (const [serial, scan] of this.scans) {
      const lidar = devices.find((l) => l.serial === serial);
      if (lidar && scan.transformedSamples) {
        combined = [...combined, ...scan.transformedSamples];
      }
    }
    return combined;
  };

  /**
   * Add scan data, replacing preexisting data with the same lidar serial, if any
   * @param scanData
   */
  public setScanData = (
    serial: string,
    samples: ScanSample[],
    minDistance: number,
    scanMaskThresholds?: AnglesWithThresholds
  ) => {
    // only add scan data for known lidars
    const lidar = store
      .getState()
      .config.devices.find((l) => l.serial === serial);
    if (lidar) {
      // apply transformation from lidar settings
      const transformedSamples = this.transformScanSamples(
        samples,
        lidar.rotation,
        lidar.x,
        lidar.y,
        minDistance,
        scanMaskThresholds
      );
      logger.trace(
        `Created ${transformedSamples.length} transformed samples from scan of size ${samples.length}`
      );
      this.scans.set(serial, { samples, transformedSamples });
    } else {
      logger.warn(
        `Scan data supplied for lidar with unrecognized serial ${serial}`
      );
    }
  };

  public findPoints = (
    points: Point2D[],
    neighbourhoodRadius: number,
    minNeighbours: number,
    maxClusterSize?: number
  ): TrackedPoint2D[] => {
    // analyze scan samples to form clusters
    const clusters = this.dbscan.run(
      points.map((s) => [s.x, s.y]),
      neighbourhoodRadius,
      minNeighbours
    );
    logger.trace(
      `Found ${clusters.length} clusters in ${points.length} sampled points`
    );

    // translate clusters into consolidated points
    const clusterPoints = clusters.map((cluster, index) => {
      // filter out the samples that belong in this cluster
      const relevantSamples = points.reduce(
        (filtered, scan, i) =>
          cluster.indexOf(i) > -1 ? [...filtered, scan] : filtered,
        []
      );
      // consolidate the set of samples in the cluster into a tracked point
      return this.consolidateCluster(index, relevantSamples);
    });

    return maxClusterSize !== undefined
      ? clusterPoints.filter((p) => p.size < maxClusterSize)
      : clusterPoints;
  };

  /**
   * Apply transformations (rotation + translation) to a set of samples
   * @param samples
   * @param rotation
   * @param x
   * @param y
   */
  private transformScanSamples = (
    samples: ScanSample[],
    rotation: number,
    x: number,
    y: number,
    minDistance: number,
    scanMaskThresholds?: AnglesWithThresholds
  ): Point2D[] =>
    samples
      .filter((s) => s[2] === undefined || s[2] > 0) // s[2] is quality, which may not be defined
      .filter((s) => s[1] > 0) // s[1] is distance
      .filter((s) => s[1] >= minDistance)
      .filter((s) => {
        if (scanMaskThresholds === undefined) {
          return true;
        } else {
          const [angle, distance] = s;
          const thresholdDistance = scanMaskThresholds[angle.toString()];
          if (!thresholdDistance) {
            return true;
          } else {
            const accept = distance < thresholdDistance;
            if (!accept) {
              logger.trace(
                "reject",
                { angle, distance },
                "due to threshold",
                scanMaskThresholds[angle.toString()],
                "at angle",
                angle
              );
            }
            return accept;
          }
        }
      })
      .map((s) => {
        const [angle, distance] = s;
        return {
          x: x + Math.cos(Math.PI * ((angle + rotation) / 180)) * distance,
          y: y + Math.sin(Math.PI * ((angle + rotation) / 180)) * distance,
        };
      });

  /**
   * Consolidate a set of points from a cluster into a single tracked point
   * @param scans
   * @param indices
   */
  private consolidateCluster = (
    id: number,
    points: Point2D[]
  ): TrackedPoint2D => {
    // get the bounding box for the samples in this cluster
    const combined = points.reduce(
      ({ minX, maxX, minY, maxY }, point) => ({
        minX: minX === null ? point.x : Math.min(minX, point.x),
        maxX: maxY === null ? point.x : Math.max(maxX, point.x),
        minY: minY === null ? point.y : Math.min(minY, point.y),
        maxY: maxY === null ? point.y : Math.max(maxY, point.y),
      }),
      {
        minX: null,
        maxX: null,
        minY: null,
        maxY: null,
      }
    );

    // return the average position of the clustered samples, and the diameter of the bounding box
    return {
      id,
      size: Math.max(
        combined.maxX - combined.minX,
        combined.maxY - combined.minY
      ),
      x: combined.minX + 0.5 * (combined.maxX - combined.minX),
      y: combined.minY + 0.5 * (combined.maxY - combined.minY),
    };
  };
}
