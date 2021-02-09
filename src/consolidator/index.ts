import { TrackedPoint2D } from "tether-agent";
import { ScanData } from "./types";

export default class Consolidator {
  private scans: ScanData[] = [];

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
        size: 100,
        position: {
          x: 250,
          y: 250
        }
      }, {
        id: 1,
        size: 200,
        position: {
          x: 500,
          y: 500
        }
      }, {
        id: 2,
        size: 50,
        position: {
          x: 800,
          y: 100
        }
      }
    ];
  }
}