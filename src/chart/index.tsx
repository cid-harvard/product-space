import * as _ from 'lodash';
import * as React from 'react';
import {
  IProcessedEdge,
  IProcessedNode,
  RelatedNodesMap,
} from '../mergeData/Utils';
import {
  GraphContainer,
} from '../RootGrid';
import Chart from './Chart';
import DetailOverlay from './DetailOverlay';
import Connections, {
  IConnection,
} from './DetailOverlayConnections';
import {
  getIdentityTransformMatrix,
  ITransformationMatrix,
} from './panZoom';
import TooltipsContainer from './TooltipsContainer';

interface IProps {
  nodes: IProcessedNode[];
  edges: Array<IProcessedEdge<IProcessedNode>>;
  relatedNodesMap: RelatedNodesMap;
  tooltipsMap: Map<string, IProcessedNode>;
  width: number | undefined;
  height: number | undefined;
  top: number | undefined;
  left: number | undefined;
  saveChartRootEl: (el: HTMLElement | null) => void;
  saveChartContainerEl: (el: HTMLElement | null) => void;
}

interface IState {
  transformationMatrix: ITransformationMatrix;
  hovered: string | undefined;
  selected: string[];
  highlighted: string | undefined;
  detailed: string | undefined;
}

export default class extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      transformationMatrix: getIdentityTransformMatrix(),
      hovered: undefined,
      selected: [],
      highlighted: undefined,
      detailed: undefined,
    };
  }
  private updateTransformationMatrix =
    (transformationMatrix: ITransformationMatrix) =>
      this.setState((prevState: IState) => ({...prevState, transformationMatrix}))

  private setHover = (hovered: string) => this.setState(
    (prevState: IState) => ({...prevState, hovered}),
  )

  private unsetHover = () => this.setState(
    (prevState: IState) => ({...prevState, hovered: undefined}),
  )

  private onNodeClick = (newId: string) => this.setState(
    (prevState: IState) => {
      const {selected} = prevState;
      const isNewIdPartOfSelection = selected.includes(newId);

      // If clicked node is part of selection, remove it. Otherwise, add it to
      // selection:
      const newSelected = isNewIdPartOfSelection ?
                            selected.filter(id => id !== newId) :
                            [...selected, newId];
      const newState: IState = {
        ...prevState,
        selected: newSelected,
        detailed: newId,
      };
      return newState;
    },
  )

  private resetAllMouseInteractiveElements = () => this.setState(
    (prevState: IState) => ({
      ...prevState,
      hovered: undefined,
      highlighted: undefined,
      selected: [],
      detailed: undefined,
    }),
  )

  private hideDetailOverlay = () => this.setState(
    (prevState: IState) => ({...prevState, detailed: undefined}),
  )

  render() {
    const {
      nodes, relatedNodesMap, edges,
      saveChartRootEl, saveChartContainerEl,
      width, height, top, left, tooltipsMap,
    } = this.props;
    const {
      selected, highlighted, hovered, transformationMatrix, detailed,
    } = this.state;

    let chartElem: JSX.Element | null;
    if (width === undefined || height === undefined ||
        top === undefined || left === undefined) {

      chartElem = null;
    } else {
      chartElem = (
        <Chart
          nodeList={nodes}
          edgeList={edges}
          isInteractive={true}
          updateTransformationMatrix={this.updateTransformationMatrix}
          onMouseEnter={this.setHover}
          onMouseLeave={this.unsetHover}
          onNodeClick={this.onNodeClick}
          onDoubleClick={this.resetAllMouseInteractiveElements}
          selectedProducts={selected}
          highlightedProduct={highlighted}
          hoveredProduct={hovered}
          relatedNodesMap={relatedNodesMap}
          edgeStrokeWidth={0.5}
          saveRootEl={saveChartRootEl}
          svgWidth={width}
          svgHeight={height}
          topOffset={top}
          leftOffset={left}
          />
      );
    }

    let tooltips: JSX.Element | null;
    if (width === undefined || height === undefined ||
        top === undefined || left === undefined) {
      tooltips = null;
    } else if (selected === undefined && highlighted === undefined && hovered === undefined) {
      tooltips = null;
    } else {
      tooltips = (
        <TooltipsContainer
          key='tooltips'
          tooltipMap={tooltipsMap}
          hoveredProduct={hovered}
          highlightedProduct={highlighted}
          selectedProducts={selected}
          chartContainerWidth={width}
          chartContainerHeight={height}
          transformationMatrix={transformationMatrix}
        />
      );
    }

    let detailOverlay: JSX.Element | null;
    if (detailed !== undefined) {
      const retrieved = tooltipsMap.get(detailed);
      if (retrieved === undefined) {
        detailOverlay = null;
      } else {
        const {detailTooltipInfo, defaultColor, longLabel, connections} = retrieved;
        const connectionInfo: IConnection[] = connections.map(
          connection => ({color: connection.defaultColor, label: connection.longLabel, id: connection.id}),
        );
        detailOverlay = (
          <DetailOverlay
            key='detail-overlay'
            rows={detailTooltipInfo}
            color={defaultColor}
            title={longLabel}
            hideOverlay={this.hideDetailOverlay}
            rememberEl={_.noop}>
            <Connections connections={connectionInfo} title='Connections'/>
          </DetailOverlay>
        );
      }
    } else {
      detailOverlay = null;
    }

    return [
      (
        <GraphContainer key='graph' innerRef={saveChartContainerEl}>
          {chartElem}
        </GraphContainer>
      ),
      tooltips,
      detailOverlay,
    ];
  }
}
