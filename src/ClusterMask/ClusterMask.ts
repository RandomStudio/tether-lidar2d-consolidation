import { ExcludeRegion, TrackedPoint2D } from "../consolidator/types";

class ClusterMask {
  private excludeRegions: ExcludeRegion[];

  constructor(initExcludeRegions: ExcludeRegion[]) {
    this.excludeRegions = initExcludeRegions;
  }

  isPointWithinExcludedRegion(point: TrackedPoint2D): boolean {
    return (
      this.excludeRegions.find(
        (region) => distance(point, region) <= region.size
      ) !== undefined
    );
  }
}

const distance = (a: TrackedPoint2D, b: TrackedPoint2D): number =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

export default ClusterMask;
