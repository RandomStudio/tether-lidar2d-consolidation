import { TrackedPoint2D } from "tether-agent";
import { ScanData } from "./types";

export default class Consolidator {
  private scans: ScanData[];

  /**
   * Add scan data, replacing preexisting data with the same lidar serial, if any
   * @param scanData 
   */
  public setScanData = (scanData: ScanData): TrackedPoint2D.AsObject[] => {
    const match = this.scans.findIndex(s => s.lidarSerial === scanData.lidarSerial);
    if (match) {
      this.scans = this.scans.map(s => (
        s.lidarSerial === scanData.lidarSerial
          ? scanData
          : s
      ));
    }
    else {
      this.scans = [
        ...this.scans,
        scanData
      ];
    }

    return this.findPoints();
  }

  private findPoints = (): TrackedPoint2D.AsObject[] => {
    // TODO consolidate data from this.scans into clusters
    return [
      {
        id: 0,
        size: 0.1,
        position: {
          x: 0.25,
          y: 0.25
        }
      }, {
        id: 1,
        size: 0.2,
        position: {
          x: 0.5,
          y: 0.5
        }
      }, {
        id: 2,
        size: 0.05,
        position: {
          x: 0.8,
          y: 0.1
        }
      }
    ];
  }
}