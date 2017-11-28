import * as React from 'react';
const styles = require('./node.css');
import classnames from 'classnames';
import {
  getFillAndStroke,
} from './Utils';

const hoverDelayDuration = 80; // in ms;

interface IProps {
  id: string;
  cx: number;
  cy: number;
  color: string;
  r: number;
  onMouseEnter: (id: string) => void;
  onMouseLeave: (id: string) => void;
  onClick: (id: string) => void;
  active: boolean;
  isInteractive: boolean;
  // `isHighlighted` is `true` when this node is either selected or highlighted:
  isHighlighted: boolean;
  // This is `true` if this node is highlighted because it's related to a node
  // that's either hovered or selected:
  isShownAsRelatedToHovered: boolean;
  isShownAsRelatedToSelected: boolean;
}

export default class extends React.PureComponent<IProps, {}> {
  private hoverDelayTimer: number | undefined;
  private onMouseEnter = () => {
    this.hoverDelayTimer = window.setTimeout(() => {
      const {id, onMouseEnter} = this.props;
      onMouseEnter(id);
      this.hoverDelayTimer = undefined;
    }, hoverDelayDuration);
  }
  private onMouseLeave = () => {
    if (this.hoverDelayTimer === undefined) {
      const {id, onMouseLeave} = this.props;
      onMouseLeave(id);
    } else {
      clearTimeout(this.hoverDelayTimer);
    }
  }
  private onClick = (e: React.MouseEvent<any>) => {
    e.stopPropagation();
    const {id, onClick} = this.props;
    onClick(id);

  }
  private onDoubleClick = (e: React.MouseEvent<any>) => {
    e.stopPropagation();
  }
  render() {
    const {
      cx, cy, r, active, color, isInteractive, isHighlighted,
      isShownAsRelatedToHovered, isShownAsRelatedToSelected,
    } = this.props;
    const {fill, stroke} = getFillAndStroke(active, color);
    const className = classnames({
      [styles.node]: isInteractive,
      [styles.active]: isInteractive && isHighlighted,
      [styles.relatedToHovered]: isShownAsRelatedToHovered,
      [styles.relatedToSelected]: isShownAsRelatedToSelected,
    });
    return (
      <circle
        {...{cx, cy, fill, r, stroke, className}}
        vectorEffect='non-scaling-stroke'
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onDoubleClick={this.onDoubleClick}
        onClick={this.onClick}/>
    );
  }
}
