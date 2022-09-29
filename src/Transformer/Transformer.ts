import { CornerPoint, Point2D, TrackedPoint2D } from "../consolidator/types";
import PerspT from "perspective-transform";

import { logger } from "../";
import { PerspectiveTransformConfig } from "../config/types";

export default class PerspectiveTransformer {
  private config: PerspectiveTransformConfig;
  private srcCorners?: number[];

  constructor(config: PerspectiveTransformConfig) {
    this.config = config;
  }

  setCorners = (srcCorners: CornerPoint[]) => {
    if (srcCorners.length !== 4) {
      throw Error("srcCorners must be exactly 4 corners length");
    }
    logger.debug("attempt to set corners:", srcCorners);
    this.srcCorners = srcCorners
      .slice()
      .sort((a, b) => a.corner - b.corner)
      .reduce((result, corner) => [...result, corner.x, corner.y], []);
    logger.info(
      "Perspective Transformer set corner points OK:",
      this.srcCorners
    );
  };

  isReady = () => this.srcCorners !== undefined;

  transform = (inputPoints: TrackedPoint2D[]) => {
    if (this.srcCorners === undefined) {
      throw Error("no source corners set!");
    }
    return inputPoints
      .map((p) => {
        const w = 1;
        const h = 1;

        const dstCorners = [0, 0, w, 0, w, h, 0, h];

        const perspT = PerspT(this.srcCorners, dstCorners);

        const dstPoint = perspT.transform(p.x, p.y);

        const { ignoreOutside, ignoreOutsideMargin } = this.config;
        if (ignoreOutside) {
          if (
            dstPoint[0] > w + ignoreOutsideMargin ||
            dstPoint[0] < 0 - ignoreOutsideMargin ||
            dstPoint[1] > h + ignoreOutsideMargin ||
            dstPoint[1] < 0 - ignoreOutsideMargin
          ) {
            return null;
          }
        }

        const [x, y] = dstPoint as [number, number];

        return {
          id: p.id,
          x,
          y,
        };
      })
      .filter((p) => p !== null);
  };

  /**
   * Use the top left, top right and bottom right corners to work out the aspect ratio
   * (width/height). We ignore the fact that some of these corner angles may not
   * be right angles.
   */
  getAspectRatio = (): number | null => {
    if (this.srcCorners && this.srcCorners.length === 4) {
      const cArray = this.srcCorners;
      const topLeft: Point2D = { x: cArray[0], y: cArray[1] };
      const topRight: Point2D = { x: cArray[2], y: cArray[3] };
      const bottomRight: Point2D = { x: cArray[4], y: cArray[5] };
      const w = getDistance(topLeft, topRight);
      const h = getDistance(topRight, bottomRight);
      return w / h;
    } else {
      logger.warn(
        "getAspectRatio requested, but source corners are not (yet) valid"
      );
      return null;
    }
  };
}

const getDistance = (a: Point2D, b: Point2D): number =>
  Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
