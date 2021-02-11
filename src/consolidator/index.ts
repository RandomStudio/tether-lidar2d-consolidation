import Clustering from "density-clustering";
import { getLogger } from "log4js";
import { TrackedPoint2D, Vector2D } from "tether-agent";
import { MeasurementSample } from "../messageClasses/RPLidar_pb";
import store from "../redux";
import { ScanData } from "./types";

const logger = getLogger("lidar-consolidation-agent");

export default class Consolidator {
  private dbscan: typeof Clustering.DBSCAN;
  private scans: Map<string, ScanData> = new Map<string, ScanData>();

  constructor() {
    this.dbscan = new Clustering.DBSCAN();
  }

  public getScanData = (serial?: string): Map<string, ScanData> => {
    return this.scans;
  }

  public getScanDataForSerial(serial: string): ScanData {
    return this.scans.get(serial);
  }

  public getCombinedTransformedSamples = () : Vector2D.AsObject[] => {
    let combined: Vector2D.AsObject[] = [];
    const { lidars } = store.getState();
    for (const [serial, scan] of this.scans) {
      const lidar = lidars.find(l => l.serial === serial);
      if (lidar && scan.transformedSamples) {
        combined = [
          ...combined,
          ...scan.transformedSamples
        ];
      }
    }
    return combined;
  }

  /**
   * Add scan data, replacing preexisting data with the same lidar serial, if any
   * @param scanData 
   */
  public setScanData = (scanData: ScanData) => {
    // only add scan data for known lidars
    const lidar = store.getState().lidars.find(l => l.serial === scanData.lidarSerial);
    if (lidar) {
      // apply transformation from lidar settings
      const transformedSamples = this.transformScanSamples(
        scanData.samples,
        lidar.rotation,
        lidar.x,
        lidar.y
      );
      logger.debug(`Created ${transformedSamples.length} transformed samples from scan of size ${scanData.samples.length}`);
      this.scans.set(scanData.lidarSerial, { ...scanData, transformedSamples });
    } else {
      logger.debug(`Scan data supplied for lidar with unrecognized serial ${scanData.lidarSerial}`);
    }
  }

  public findPoints = (samples: Vector2D.AsObject[], maxNeighbourDistance: number, minNeighbours: number): TrackedPoint2D.AsObject[] => {
    // analyze scan samples to form clusters
    const clusters = this.dbscan.run(samples.map(s => [s.x, s.y]), maxNeighbourDistance, minNeighbours);
    logger.debug(`Found ${clusters.length} clusters in ${samples.length} sampled points`);

    // translate clusters into consolidated points
    return clusters.map((cluster, index) => {
      // filter out the samples that belong in this cluster
      const relevantSamples = samples.reduce((filtered, scan, i) => (
        cluster.indexOf(i) > -1
          ? [ ...filtered, scan ]
          : filtered
      ), []);
      // consolidate the set of samples in the cluster into a tracked point
      return this.consolidateCluster(index, relevantSamples)
    });
  }

  /**
   * Apply transformations (rotation + translation) to a set of samples
   * @param samples 
   * @param rotation 
   * @param x 
   * @param y 
   */
  private transformScanSamples = (samples: MeasurementSample.AsObject[], rotation: number, x: number, y: number): Vector2D.AsObject[] => (
    samples.filter(s => s.quality > 0).map(({ angle, distance }) => ({
      x: x + Math.cos(Math.PI * ((angle + rotation) / 180)) * distance,
      y: y + Math.sin(Math.PI * ((angle + rotation) / 180)) * distance,
    }))
  );

  /**
   * Consolidate a set of points from a cluster into a single tracked point
   * @param scans 
   * @param indices 
   */
  private consolidateCluster = (id: number, samples: Vector2D.AsObject[]): TrackedPoint2D.AsObject => {
    // get the bounding box for the samples in this cluster
    const combined = samples.reduce(({ minX, maxX, minY, maxY }, point) => ({
      minX: Math.min(minX, point.x),
      maxX: Math.max(maxX, point.x),
      minY: Math.min(minY, point.y),
      maxY: Math.max(maxY, point.y),
    }), ({
      minX: Number.MAX_VALUE,
      maxX: Number.MIN_VALUE,
      minY: Number.MAX_VALUE,
      maxY: Number.MIN_VALUE,
    }));

    // return the average position of the clustered samples, and the diameter of the bounding box
    return {
      id,
      size: Math.max(combined.maxX - combined.minX, combined.maxY - combined.minY),
      position: {
        x: combined.minX + 0.5 * (combined.maxX - combined.minX),
        y: combined.minY + 0.5 * (combined.maxY - combined.minY),
      }
    }
  }
}