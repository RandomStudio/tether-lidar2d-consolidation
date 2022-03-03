import { CornerPoint, TrackedPoint2D } from "../consolidator/types";
import PerspT from "perspective-transform";
import defaults from "../config/defaults";

import { logger } from "../";

export default class PerspectiveTransformer {
  private srcCorners?: number[];

  constructor() {}

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

        const {
          ignoreOutside,
          ignoreOutsideMargin,
        } = defaults.perspectiveTransform;
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
}
