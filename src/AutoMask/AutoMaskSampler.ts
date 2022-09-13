import { logger } from "..";
import { AnglesWithThresholds, ScanSample } from "../consolidator/types";

class AutoMaskSampler {
  private serial: string;
  private thresholdMargin: number;
  private anglesWithThresholds: AnglesWithThresholds;
  private scansRemaining: number;

  constructor(
    serial: string,
    requiredScanCount: number,
    thresholdMargin: number
  ) {
    this.serial = serial;
    this.scansRemaining = requiredScanCount;
    this.thresholdMargin = thresholdMargin;
    this.anglesWithThresholds = {};
  }

  public addSamples(samples: ScanSample[]): boolean {
    this.scansRemaining--;

    if (this.scansRemaining > 0) {
      samples.forEach((sample) => {
        const [angle, distance, _quality] = sample;

        const distanceMinusThreshold = distance - this.thresholdMargin;

        if (distance > 0 && distanceMinusThreshold > 0) {
          this.anglesWithThresholds[angle.toString()] = distanceMinusThreshold;
        }
      });
      logger.debug(
        "Added",
        samples.length,
        "samples for AutoMaskSampler for",
        this.serial
      );
      return false;
    } else {
      logger.debug(
        "AudoMaskSampler for",
        this.serial,
        "completed required scans"
      );
      return true;
    }
  }

  public getSerial = () => this.serial;

  public getThresholds = () => this.anglesWithThresholds;

  public getCompleted = () => !(this.scansRemaining > 0);
}

export default AutoMaskSampler;
