import * as React from 'react';
import styled from 'styled-components';
import {
  isInRange,
} from '../Utils';
import {
  applyMatrixToPoint,
  ITransformationMatrix,
} from './panZoom';

const tooltipFillColor = 'rgb(25, 25, 70)';
const tooltipBorderColor = 'rgb(180, 180, 180)';

// These are in `vw` units:
const tooltipWidth = 12;
const arrowHeight = tooltipWidth / 15;
const arrowWidth = arrowHeight;

// This is the root element for the highlight tooltip.
// Use a different `z-index` for hover tooltip:
export const Root = styled.div`
  --translation-x: 0;
  --translation-y: 0;

  top: -${arrowHeight}vw;
  left: 1px;
  z-index: 20;
  position: absolute;
  max-width: ${tooltipWidth}vw;
  transform: translateX(calc(-50% + var(--translation-x))) translateY(calc(-100% + var(--translation-y)));
  opacity: 0.75;
  display: flex;
  color: rgba(255, 255, 255, 1);
  background-color: ${tooltipFillColor};
  padding: 8px;
  border-style: dotted;
  border-radius: 2px;
  border-color: ${tooltipBorderColor};
  border-width: 1px;
  will-change: transform;
  pointer-events: none;
  font-size: 0.9rem;
  font-weight: 300;
  line-height: 1.5;

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    border-color: transparent;
    border-bottom: 0;
  }

  &::before {
    bottom: -${arrowHeight}vw;
    left: 50%;
    transform: translateX(-50%);
    border-top-color: ${tooltipBorderColor};
    border-width: ${arrowWidth}vw;
  }

  &::after {
    bottom: calc(-${arrowHeight}vw + 1px);
    left: 50%;
    transform: translateX(-50%);
    border-top-color: ${tooltipFillColor};
    border-width: calc(${arrowWidth}vw - 1px);
  }
`;

const Content = styled.div`
  opacity: 1;
`;

const Name = styled.span`
  &::after {
    content: '|';
    margin-right: 0.2rem;
    margin-left: 0.2rem;
  }
`;

interface IProps {
  svgWidth: number | undefined;
  svgHeight: number | undefined;
  productName: string;
  // vert and horz translations, in pixels:
  xOffset: number;
  yOffset: number;
  transformationMatrix: ITransformationMatrix;
}
export default class extends React.PureComponent<IProps, {}> {

  render() {
    const props = this.props;
    const {
      productName, xOffset, yOffset,
      transformationMatrix,
      svgWidth, svgHeight,
    } = props;
    const {x, y} = applyMatrixToPoint(transformationMatrix, xOffset, yOffset);

    if (svgWidth !== undefined && svgHeight !== undefined &&
        isInRange(x, 0, svgWidth) && isInRange(y, 0, svgHeight)) {

      const style = {
        '--translation-x': `${Math.round(x)}px`,
        '--translation-y': `${Math.round(y)}px`,
      };
      const text = `${productName}`;

      return (
        <Root style={style}>
          <Content>
            <Name>{text}</Name>
          </Content>
        </Root>
      );
    } else {
      return null;
    }

  }
}
