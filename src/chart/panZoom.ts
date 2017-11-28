import {
  ITransformationMatrix,
} from './panZoom';

// Same as calling `matrix.applyToPoint`
// https://dev.opera.com/articles/understanding-the-css-transforms-matrix/#calculatingtransform
export const applyMatrixToPoint = (
  {a, b, c, d, e, f}: ITransformationMatrix,
  x: number,
  y: number): {x: number, y: number} => ({
    x: a * x + c * y + e,
    y: b * x + d * y + f,
  });

const invert = ({a, b, c, d, e, f}: ITransformationMatrix) => {
  const determinant = a * d - b * c;
  if (determinant === 0) {
    throw new Error('Matrix is not invertible');
  }

  return {
    a: d / determinant,
    b: - b / determinant,
    c: -c / determinant,
    d: a / determinant,
    e: (c * f - d * e) / determinant,
    f: - (a * f - b * e) / determinant,
  };
};

const multiply = (
  {a: a1, b: b1, c: c1, d: d1, e: e1, f: f1}: ITransformationMatrix,
  {a: a2, b: b2, c: c2, d: d2, e: e2, f: f2}: ITransformationMatrix): ITransformationMatrix => ({

  a: a1 * a2 + c1 * b2,
  b: b1 * a2 + d1 * b2,
  c: a1 * c2 + c1 * d2,
  d: b1 * c2 + d1 * d2,
  e: a1 * e2 + c1 * f2 + e1,
  f: b1 * e2 + d1 * f2 + f1,
});

const translate = (matrix: ITransformationMatrix, x: number, y: number) => {
  const translateMatrix = {a: 1, b: 0, c: 0, d: 1, e: x, f: y};
  return multiply(matrix, translateMatrix);
};

const scaleU = (matrix: ITransformationMatrix, factor: number) => {
  const scaleMatrix = {a: factor, b: 0, c: 0, d: factor, e: 0, f: 0};
  return multiply(matrix, scaleMatrix);
};

export interface IPoint {
  x: number;
  y: number;
}

export interface ITransformationMatrix {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

export const getIdentityTransformMatrix = (): ITransformationMatrix => ({
  a: 1,
  b: 0,
  c: 0,
  d: 1,
  e: 0,
  f: 0,
});

export function fitSelection(
  // top left corner of the new selection:
  selectionSVGPointX: number,
  selectionSVGPointY: number,
  // width and height of the new selection:
  selectionWidth: number,
  selectionHeight: number,
  width: number,
  height: number): ITransformationMatrix {

  const scaleX = width / selectionWidth;
  const scaleY = height / selectionHeight;

  const scale = Math.min(scaleX, scaleY);

  const scaleMatrix = scaleU(getIdentityTransformMatrix(), scale);
  return translate(scaleMatrix, -selectionSVGPointX, -selectionSVGPointY);
}

// zoom into point (inputX, inputY) with `scaleFactor`.
// `domX` and `domY` are the actual coordinates
// measured relative to the SVG top-left corner.
export function zoom(
  currentMatrix: ITransformationMatrix,
  // center coords of the zoom action:
  domX: number,
  domY: number,
  // and zoom by this much:
  scaleFactor: number): ITransformationMatrix {

  // Note: need to "unstransform" the `relativeCoord`. Otherwise, any visible zoom "target"
  // (any object directly under the cursor) won't stay under the cusor after the zoom:
  const {x, y} = getSVGPoint(currentMatrix, {x: domX, y: domY});

  // Figure out the matrix to multiply with the current transformation matrix:
  const translatedByXY = translate(getIdentityTransformMatrix(), x, y);
  const scaledByFactor = scaleU(translatedByXY, scaleFactor);
  const act = translate(scaledByFactor, -x, -y);

  return multiply(currentMatrix, act);
}

export function getSVGPoint(
  matrix: ITransformationMatrix,
  {x, y}: IPoint): IPoint {

  const inverseMatrix = invert(matrix);
  return applyMatrixToPoint(inverseMatrix, x, y);
}

export function updatePanning(
  config: ITransformationMatrix,
  viewerPoint: IPoint,
  prevEndPoint: IPoint): ITransformationMatrix {

  const start = getSVGPoint(config, prevEndPoint);
  const end = getSVGPoint(config, viewerPoint);

  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  return pan(config, deltaX, deltaY);
}

export function pan(
  currentMatrix: ITransformationMatrix,
  SVGDeltaX: number,
  SVGDeltaY: number): ITransformationMatrix {

  const act = translate(getIdentityTransformMatrix(), SVGDeltaX, SVGDeltaY);
  return multiply(currentMatrix, act);
}

// return the scale factor from a transformation matrix. In this codebase, we
 // always use isometric zoom so the scale factors are the same in both x and y
 // directions.
export const getScaleFactor = ({a}: ITransformationMatrix) => a;
