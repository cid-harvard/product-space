import {
  TweenLite,
} from 'gsap';
import * as _ from 'lodash';
import * as React from 'react';
import styled from 'styled-components';
import {
  IProcessedEdge,
  IProcessedNode,
  RelatedNodesMap,
} from '../mergeData/Utils';
import {
  secondsPerFrame,
} from '../Utils';
import {
  xDomainWideningFactor,
  yDomainWideningFactor,
} from '../Utils';
import {
  defaultPanZoomButtonAnimationDuration as defaultControlButtonAnimationDuration,
  getRelativeCoord,
  isPanOutsideLimits,
  matrixToSVGTransform,
  mouseDeltaToZoomFactorScale,
} from './zoomPanUtils';

import {
  controlButtonZoomFactor,
  svgBackgroundColor,
} from '../Utils';
import assignHighlightedEdges from './assignHighlightToEdges';
import assignHighlightNodes from './assignHighlightToNodes';
import Edge from './Edge';
import Node from './Node';
import {
  getIdentityTransformMatrix,
  getScaleFactor,
  IPoint,
  ITransformationMatrix,
  updatePanning,
  zoom,
} from './panZoom';

const ZoomPanControlsContainer = styled.div`
  --container-top: 10px;
  --container-right: 10px;
  --button-size: 1.375rem;
  --button-margin-bottom: 5px;

  position: absolute;
  top: var(--container-top);
  right: var(--container-right);

  & button {
    --background-color: white;

    width: var(--button-size);
    height: var(--button-size);
    border: 1px solid rgb(136, 136, 153);
    border-radius: 2px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    color: rgb(136, 136, 153);
    opacity: 0.75;
    margin-bottom: var(--button-margin-bottom);
    font-weight: bold;
    font-size: 1rem;
    background-color: var(--background-color);

    &:hover {
      opacity: 1;
      background-color: var(--background-color);
    }
  }
`;

export interface IDisplayNode extends IProcessedNode {
  isHighlighted: boolean;
  isShownAsRelatedToHovered: boolean;
  isShownAsRelatedToSelected: boolean;
}

export interface IDislayedEdge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  firstNodeId: string;
  secondNodeId: string;
  isShownAsRelatedToHovered: boolean;
  isShownAsRelatedToSelected: boolean;
}

// Only allow zooming 20 "clicks" of zooming in and 3 "clicks" of zooming out:
const maxZoomInIncrements = 20;
const maxZoomOutIncrements = 3;
// Limits for zoom factors for zooming in (max) and zooming out (min);
const maxZoomFactorLimit = controlButtonZoomFactor ** (maxZoomInIncrements + 1);
const minZoomFactorLimit = (1 / controlButtonZoomFactor) ** (maxZoomOutIncrements + 1);

const Root = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${svgBackgroundColor};
  cursor: grab;
  overflow: hidden;
  outline: 1px solid white;
  position: relative;
`;

interface IInteractiveProps {
  isInteractive: true;
  updateTransformationMatrix: (matrix: ITransformationMatrix) => void;
  onMouseEnter: (id: string) => void;
  onMouseLeave: (id: string) => void;
  onNodeClick: (id: string) => void;
  onDoubleClick: () => void;
  selectedProducts: string[];
  highlightedProduct: string | undefined;
  hoveredProduct: string | undefined;
  relatedNodesMap: RelatedNodesMap;
}

interface INonInteractiveProps {
  isInteractive: false;
}

export type IProps = (IInteractiveProps | INonInteractiveProps) & {
  nodeList: IProcessedNode[];
  edgeList: Array<IProcessedEdge<IProcessedNode>>;
  // `stroke-width` for edges. Values should be around 0.5.
  edgeStrokeWidth: number;
  // Pass the root element of this component to the parent for DOM measurement
  // on window resizing:
  saveRootEl: (el: HTMLElement | null) => void;
  // DOM layout info:
  svgWidth: undefined | number;
  svgHeight: undefined | number;
  topOffset: undefined | number;
  leftOffset: undefined | number;
};

export class NewChart extends React.PureComponent<IProps, {}> {
  private svgGroup: SVGElement;
  private rememberSVGGroup = (el: SVGElement | null) => {
    if (el !== null) {
      this.svgGroup = el;
    }
  }
  private passRootElToParent = (el: HTMLElement | null) => this.props.saveRootEl(el);

  // Note: this will cause problem if this chart drawer component is unmounted while the tooltips
  // still need to be shown because in that case, the transformation matrix between this component
  // and that stored in the parent's state may fall out of sync.
  private transformationMatrix: ITransformationMatrix = getIdentityTransformMatrix();

  /* Start of tween-related methods */

  // Need to store mouse position outside the tween function because `throttle`d functions can't take
  // arguments:
  private mouseX: number = 0;
  private mouseY: number = 0;
  private _batchZooms = _.throttle(() => {
    requestAnimationFrame(() => {
      const props = this.props;
      const {topOffset, leftOffset} = props;
      const delta = this.deltaAccumulator;
      this.deltaAccumulator = 0;
      const transformationMatrix = this.transformationMatrix;
      const {x, y} = getRelativeCoord(this.mouseX, this.mouseY, topOffset!, leftOffset!);
      const zoomFactor = mouseDeltaToZoomFactorScale(delta);

      const newMatrix = zoom(transformationMatrix, x, y, zoomFactor);
      const newScaleFactor = getScaleFactor(newMatrix);

      // Constrain zoom to within zoom limits:
      if (newScaleFactor <= maxZoomFactorLimit && newScaleFactor >= minZoomFactorLimit) {
        const newTransform = matrixToSVGTransform(newMatrix);
        this.svgGroup.setAttribute('transform', newTransform);
        this.transformationMatrix = newMatrix;
        if (props.isInteractive) {
          props.updateTransformationMatrix(newMatrix);
        }
      }
    });
  // Run at most once per frame:
  }, secondsPerFrame);

  private deltaAccumulator: number = 0;
  private onWheelTemp = (event: React.WheelEvent<any>) => {
    event.preventDefault();
    event.stopPropagation();
    const {deltaY, clientX, clientY} = event;
    // const timeStamp = Date.now();
    this.mouseX = clientX;
    this.mouseY = clientY;

    this.deltaAccumulator += deltaY;
    this._batchZooms();
  }
  /* End of tween-related methods*/

  /* Start of pan-related methods: */
  private panStart: IPoint | undefined;
  private isPanning: boolean = false;
  private configAtStart: ITransformationMatrix | undefined;
  private configDuringPan: ITransformationMatrix | undefined;

  // These are variables are used to store the latest panning-related mouse event data
  // (because of React's event pooling).
  private panClientX: number | undefined;
  private panClientY: number | undefined;
  private panButtons: number | undefined;

  private onMouseDownPan = (event: React.MouseEvent<any>) => {
    const {clientX, clientY} = event;
    const {leftOffset, topOffset} = this.props;
    const {x, y} = getRelativeCoord(clientX, clientY, topOffset!, leftOffset!);
    this.panStart = {x, y};
    this.isPanning = true;
    const transformationMatrix = this.transformationMatrix;
    this.configDuringPan = transformationMatrix;
    this.configAtStart = transformationMatrix;
  }
  private _stopPan() {
    this.panStart = undefined;
    this.isPanning = false;
    this.configAtStart = undefined;

    // Note: `this.configDuringPan` can be `undefined` here if during a very
    // short pan, the pan is prevented from happening because of pan limit:
    if (this.configDuringPan !== undefined) {
      this.transformationMatrix = this.configDuringPan;
    }
    this.configDuringPan = undefined;
    this.panClientX = undefined;
    this.panClientY = undefined;
    this.panButtons = undefined;
  }
  private onMouseUpPan = () => {
    this._stopPan();
  }
  private onMouseMovePan = ({clientX, clientY, buttons}: React.MouseEvent<any>) => {
    if (this.isPanning) {
      this.panClientX = clientX;
      this.panClientY = clientY;
      this.panButtons = buttons;
      this._batchPans();
    }
  }
  private _batchPans = _.throttle(() => {
    requestAnimationFrame(() => {
      // Need to check `isPanning` because by the time this function is invoked (asynchronously),
      // the pan may already have stopped and relevant variables have already been reset
      // to`unefined`.
      if (this.isPanning) {
        const clientX = this.panClientX!;
        const clientY = this.panClientY!;
        const buttons = this.panButtons!;
        if (buttons === 0) {
          // Stop panning when mouse leaves the SVG area:
          this._stopPan();
        } else {
          const props = this.props;
          const {leftOffset, topOffset, svgHeight, svgWidth} = props;
          if (svgHeight !== undefined && svgWidth !== undefined) {
            const {x, y} = getRelativeCoord(clientX, clientY, topOffset!, leftOffset!);
            const newMatrix = updatePanning(this.configAtStart!, {x, y}, this.panStart!);
            const shouldNotPan = isPanOutsideLimits(
              newMatrix, {width: svgWidth, height: svgHeight},
              xDomainWideningFactor, yDomainWideningFactor,
            );
            // Constrain pan to within limits:
            if (!shouldNotPan) {
              if (props.isInteractive) {
                this.svgGroup.setAttribute('transform', matrixToSVGTransform(newMatrix));
                this.configDuringPan = newMatrix;
                props.updateTransformationMatrix(newMatrix);
              }
            } else {
              this._stopPan();
            }
          }
        }
      }
    });
  }, secondsPerFrame);

  /* End of pan-related methods: */

  /* Start of control buttons-related methods*/

  // We need to let `TweenLite` "touch" the SVG element before tweening because
  // othwerwise, greensock will have trouble reading the existing `transform`
  // attribute and won't be able to perform the tween:
  private prepForGreensock() {
    const transformationMatrix = this.transformationMatrix;
    const currentTransform = matrixToSVGTransform(transformationMatrix);
    TweenLite.set(this.svgGroup, {transform: currentTransform});
  }

  // Indicate whether a tween (initiated by the zoom/pan buttons) are in
  // progress.
  private isTweening: boolean = false;

  private _zoomInOut(zoomFactor: number) {
    const props = this.props;
    const {svgWidth, svgHeight} = props;
    if (svgWidth !== undefined && svgHeight !== undefined && props.isInteractive && this.isTweening !== true) {
      this.isTweening = true;
      this.prepForGreensock();
      const transformationMatrix = this.transformationMatrix;
      const newMatrix = zoom(
        transformationMatrix, svgWidth / 2, svgHeight / 2, zoomFactor,
      );
      const newScaleFactor = getScaleFactor(newMatrix);
      if (newScaleFactor <= maxZoomFactorLimit && newScaleFactor >= minZoomFactorLimit) {
        const newTransform = matrixToSVGTransform(newMatrix);
        TweenLite.to(this.svgGroup, defaultControlButtonAnimationDuration, {
          transform: newTransform,
          onComplete: () => {
            props.updateTransformationMatrix(newMatrix);
            this.transformationMatrix = newMatrix;
            this.isTweening = false;
          },
        });
      } else {
        this.isTweening = false;
      }
    }
  }
  private zoomIn = (e: React.MouseEvent<any>) => {
    e.stopPropagation();
    this._zoomInOut(controlButtonZoomFactor);
  }
  private zoomOut = (e: React.MouseEvent<any>) => {
    e.stopPropagation();
    this._zoomInOut(1 / controlButtonZoomFactor);
  }
  private resetTransformations = (e: React.MouseEvent<any>) => {
    e.stopPropagation();
    const props = this.props;
    if (props.isInteractive && this.isTweening !== true) {
      this.isTweening = true;
      this.prepForGreensock();
      const newMatrix = getIdentityTransformMatrix();
      const newTransform = matrixToSVGTransform(newMatrix);
      TweenLite.to(this.svgGroup, defaultControlButtonAnimationDuration, {
        transform: newTransform,
        onComplete: () => {
          props.updateTransformationMatrix(newMatrix);
          this.transformationMatrix = newMatrix;
          this.isTweening = false;
        },
      });

    }
  }

  private swallowDoubleClick = (e: React.MouseEvent<any>) => e.stopPropagation();

  /* End of control buttons-related methods*/
  render() {
    const props = this.props;
    const {
      svgWidth, svgHeight, isInteractive, edgeStrokeWidth,
    } = props;

    // If this is interactive, assign actual event handler. Otherwise, assign `noop`:
    let onMouseEnter: IInteractiveProps['onMouseEnter'];
    let onMouseLeave: IInteractiveProps['onMouseLeave'];
    let onDoubleClick: IInteractiveProps['onDoubleClick'];
    let onNodeClick: IInteractiveProps['onNodeClick'];
    let onSVGMouseDown: React.EventHandler<React.MouseEvent<any>>;
    let onSVGMouseUp: React.EventHandler<React.MouseEvent<any>>;
    let onSVGMouseMove: React.EventHandler<React.MouseEvent<any>>;
    if (props.isInteractive) {
      ({onMouseEnter, onMouseLeave, onDoubleClick, onNodeClick} = props);
      onSVGMouseDown = this.onMouseDownPan;
      onSVGMouseUp = this.onMouseUpPan;
      onSVGMouseMove = this.onMouseMovePan;
    } else {
      onMouseEnter = _.noop;
      onMouseLeave = _.noop;
      onDoubleClick = _.noop;
      onNodeClick = _.noop;
      onSVGMouseDown = _.noop;
      onSVGMouseDown = _.noop;
      onSVGMouseUp = _.noop;
      onSVGMouseMove = _.noop;
    }

    let selectedProducts: string[], highlightedProduct: string | undefined;
    if (props.isInteractive === true) {
      ({selectedProducts, highlightedProduct} = props);
    } else {
      selectedProducts = [];
      highlightedProduct = undefined;
    }

    if (svgWidth === undefined || svgHeight === undefined) {
      return (
        <Root innerRef={this.passRootElToParent}/>
      );
    } else {
      const {nodeList, edgeList} = props;

      let relatedNodesMap: RelatedNodesMap, hoveredProduct: string | undefined;
      if (props.isInteractive) {
        ({relatedNodesMap, hoveredProduct} = props);
      } else {
        relatedNodesMap = new Map();
        hoveredProduct = undefined;
      }
      const displayNodes = assignHighlightNodes(
        relatedNodesMap, nodeList, highlightedProduct, selectedProducts, hoveredProduct,
      );
      const nodeElems = displayNodes.map(input => {
        const {
          x, y, defaultColor, id, radius, isHighlighted, active,
          isShownAsRelatedToHovered, isShownAsRelatedToSelected,
        } = input;
        return (
          <Node cx={x} cy={y} r={radius} color={defaultColor}
            active={active}
            {...{id, onMouseLeave, onMouseEnter, isInteractive, isHighlighted,
                  isShownAsRelatedToHovered, isShownAsRelatedToSelected}}
            onClick={onNodeClick}
            key={`node-${id}`}/>
        );
      });

      const displayedEdges = assignHighlightedEdges(
        relatedNodesMap, edgeList, highlightedProduct, selectedProducts, hoveredProduct,
      );

      const edgeElems = displayedEdges.map(input => {
        return (
          <Edge {...input} strokeWidth={edgeStrokeWidth} key={`edge-${input.firstNodeId}-${input.secondNodeId}`}/>
        );
      });

      // TODO: possibly disable wheel/scroll event over the control buttons:
      return (
        <Root onWheel={this.onWheelTemp}
          onDoubleClick={onDoubleClick} innerRef={this.passRootElToParent}>

          <svg width={svgWidth} height={svgHeight}
            onMouseDown={onSVGMouseDown}
            onMouseUp={onSVGMouseUp}
            onMouseMove={onSVGMouseMove}>
            <g ref={this.rememberSVGGroup}>
              {edgeElems}
              {nodeElems}
            </g>
          </svg>
          <ZoomPanControlsContainer>
            <button onClick={this.zoomIn} onDoubleClick={this.swallowDoubleClick}>+</button>
            <button onClick={this.zoomOut} onDoubleClick={this.swallowDoubleClick}>-</button>
            <button onClick={this.resetTransformations} onDoubleClick={this.swallowDoubleClick}>↺</button>
          </ZoomPanControlsContainer>
        </Root>
      );
    }
  }
}

export default NewChart;
