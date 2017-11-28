import {
  scaleLog,
} from 'd3-scale';
import {
  applyMatrixToPoint,
  ITransformationMatrix,
} from './panZoom';
// for the pan/zoom control buttons in top-right corner of product space and
// feasibility graph:
export const defaultPanZoomButtonAnimationDuration = 0.2; // seconds

export const matrixToSVGTransform =
  ({a, b, c, d, e, f}: ITransformationMatrix) =>
    `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`;

// Convert from mouse position (obtained from mouse event) into position relative to top-left corner
// of parent:
export const getRelativeCoord =
  (clientX: number, clientY: number, offsetTop: number, offsetLeft: number) => {

    return {
      x: clientX - offsetLeft,
      y: clientY - offsetTop,
    };
  };

/* Start of mapping from mouse wheel to zoom factor */
const maxZoomFactor = 1.2;
const maxZoomDelta = 1000;
// Note: we need 2 separate scales before a single scale
// `scaleLinear().domain([-maxZoomDelta, maxZoomDelta]).range([1/maxZoomFactor, maxZoomFactor])`
// will cause some "cross-sign" mapping problem i.e. negative `deltaY` causes small amount of zooming
// out (instead of zooming in as expected). The reason is that `deltaY` of zero will map to
// a `zoomFactor` slightly greater than 1.
// Note: need to clamp to prevent excessive values of `delta` produced by FF.
const positiveScale = scaleLog<number, number>()
                            .domain([0.000001, maxZoomDelta])
                            .range([1, 1 / maxZoomFactor])
                            .clamp(true);
const negativeScale = scaleLog<number, number>()
                            .domain([-maxZoomDelta, -0.00001])
                            .range([maxZoomFactor, 1])
                            .clamp(true);

  // Map mouse wheel scroll amount to zoom factor:
export const mouseDeltaToZoomFactorScale = (delta: number) => {
    if (delta >= 0) {
      return positiveScale(delta);
    } else {
      return negativeScale(delta);
    }
  };
/* End of mapping from mouse wheel to zoom factor */

interface ICoordBounds {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

interface ISVGSize {
  width: number;
  height: number;
}

// Return the upper-left and lower-right corners of the "true" extent of the
// graph i.e. excluding the padding set by `xWideningFactor` and
// `yWideningFactor`. For example, if the SVG width is 100px and the
// `xWideningFactor` is 1.25 then only 80px (1/1.25 of 100px) is the actual
// content because the other 20px are left padding + right padding:
const getGraphContentBounds = (
  width: number, height: number,
  xWideningFactor: number, yWideningFactor: number): ICoordBounds => {

  const xMarginOnEitherSide = width * (xWideningFactor - 1) / 2;
  const yMarginOnEitherSide = height * (yWideningFactor - 1) / 2;
  return {
    x0: xMarginOnEitherSide,
    x1: width - xMarginOnEitherSide,
    y0: yMarginOnEitherSide,
    y1: height - yMarginOnEitherSide,
  };
};

// Given a `transformationMatrix` and the `width` and `height` of the SVG,
// determine whether the pan will be out of bounds. This is defined to be true
// if one edge of the SVG content is more than halfway across the SVG. For
// example, the condition is true if the right edge of the content (the SVG
// right edge minus the padding) is to the left of the x midpoint of the SVG or
// if the left edge of the content is to the right of the x midpoint.
export const isPanOutsideLimits = (
    transformationMatrix: ITransformationMatrix, {width, height}: ISVGSize,
    xWideningFactor: number, yWideningFactor: number): boolean => {

  const {x0, x1, y0, y1} = getGraphContentBounds(width, height, xWideningFactor, yWideningFactor);
  const {x: transformedX0, y: transformedY0} = applyMatrixToPoint(transformationMatrix, x0, y0);
  const {x: transformedX1, y: transformedY1} = applyMatrixToPoint(transformationMatrix, x1, y1);

  const widthMidPoint = width / 2;
  const heightMidPoint = height / 2;
  return transformedX0 > widthMidPoint || transformedX1 < widthMidPoint ||
          transformedY0 > heightMidPoint || transformedY1 < heightMidPoint;

};
