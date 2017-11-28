import * as React from 'react';
import {
  edgeStroke as stroke,
} from './Utils';
const styles = require('./edge.css');
import classnames from 'classnames';

interface IProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  strokeWidth: number;
  isShownAsRelatedToHovered: boolean;
  isShownAsRelatedToSelected: boolean;
}
export default class extends React.PureComponent<IProps, {}> {
  render() {
    const {
      x1, y1, x2, y2, strokeWidth,
      isShownAsRelatedToHovered, isShownAsRelatedToSelected,
    } = this.props;

    const className = classnames({
      [styles.relatedToHovered]: isShownAsRelatedToHovered,
      [styles.relatedToSelected]: isShownAsRelatedToSelected,
    });

    // Make stroke thicker when it's related to a hovered/highlighted/selcted
    // node:
    const displayedStrokeWidth =
      (isShownAsRelatedToHovered || isShownAsRelatedToSelected) ?
      2 :
      strokeWidth;
    return (
      <line
        {...{x1, y1, x2, y2, stroke, className}}
        vectorEffect='non-scaling-stroke'
        strokeWidth={displayedStrokeWidth}/>
    );
  }
}
