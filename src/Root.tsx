import * as React from 'react';
import {
  DragDropContext,
  DragDropContextProvider,
} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import styled from 'styled-components';
import Chart from './chart';
import Config from './config';
import {
  IBuiltInDataSource,
} from './config/DataInput';
import mergeData from './mergeData';
import {
  IProcessedEdge,
  IProcessedNode,
  MergeStatus,
  RelatedNodesMap,
} from './mergeData/Utils';
import RadioSelector, {
  Container as BaseRadioSelectorContainer,
  IChoice,
  Label as BaseRadioSelectorLabel,
} from './radioSelector';
import {
  ControlsContainer,
  GridRoot,
} from './RootGrid';
import {
  DataStatus,
  defaultMaxNodeRadius,
  defaultMinNodeRadius,
  IDataStatus,
  IDatum,
  ILayoutData,
  IMetadatum,
  IRawDatum,
} from './Utils';

const hsLayout = require('./data/layout_HS.json');
const sitcLayout = require('./data/layout_SITC.json');
const hsMetadata = require('./data/HS_Metadata.json');
const sitcMetadata = require('./data/SITC_Metadata.json');

const hsLayoutName = 'Standard HS layout';
const sitcLayoutName = 'Standard SITC layout';
const hsMetadataName = 'Standard HS metadata';
const sitcMetadataName = 'Standard SITC metadata';

const parseRawData = (rawData: IRawDatum[]): IDatum[] => {
  return rawData.map(({id, values, active}) => {
    let parsedValues: number[];
    if (values === undefined) {
      parsedValues = [];
    } else if (typeof values === 'number') {
      parsedValues = [values];
    } else {
      parsedValues = values;
    }

    let parsedActive: boolean;
    if (typeof active === 'boolean') {
      parsedActive = active;
    } else {
      parsedActive = !!active;
    }

    const output: IDatum = {
      id,
      values: parsedValues,
      active: parsedActive,
    };

    return output;
  });
};

const selectedNodeSizingSentinelValue = -1;

const Root = styled(GridRoot)`
  width: 100vw;
  height: 100vh;
`;
const NodeSizingContainer = styled(BaseRadioSelectorContainer)`
  width: 25%;
  height: 100%;
`;

export

interface IState {
  layoutData: IDataStatus<ILayoutData>;
  metadata: IDataStatus<IMetadatum[]>;
  mainData: IDataStatus<IDatum[]>;
  // the number of values per node. This is used for node sizing
  // e.g. world trade vs country trade etc.
  numValuesPerNode: number;
  // Out of `numValuesPerNode`, which one should be used to size the node:
  // `undefined` means all nodes have the same size:
  selectedNodeSizing: number | undefined;
  nodeSizingLabels: string[];

  maxNodeRadius: number;
  minNodeRadius: number;

  width: number | undefined;
  height: number | undefined;
  top: number | undefined;
  left: number | undefined;
}

type IProps = {};

class RootComponent extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      layoutData: {status: DataStatus.NoInput},
      metadata: {status: DataStatus.NoInput},
      mainData: {status: DataStatus.NoInput},
      numValuesPerNode: 0,
      selectedNodeSizing: undefined,
      nodeSizingLabels: [],
      width: undefined,
      height: undefined,
      top: undefined,
      left: undefined,
      maxNodeRadius: defaultMaxNodeRadius,
      minNodeRadius: defaultMinNodeRadius,
    };
  }

  componentDidMount() {
    this.measureChartSize();
  }

  private measureChartSize() {
    const chartRootEl = this.chartRootEl;
    const chartContainerEl = this.chartContainerEl;
    if (chartRootEl !== null && chartContainerEl !== null) {
      const {height, width, top, left} = chartContainerEl.getBoundingClientRect();
      this.setState((prevState: IState) => ({ ...prevState, width, height, top, left}));
    }
  }

  private setHSLayout = () => this.setState((prevState: IState): IState => ({
    ...prevState,
    layoutData: {
      status: DataStatus.ValidInput,
      value: {isFromFile: false, data: hsLayout, name: hsLayoutName},
    },
  }))

  private setSITCLayout = () => this.setState((prevState: IState): IState => ({
    ...prevState,
    layoutData: {
      status: DataStatus.ValidInput,
      value: {isFromFile: false, data: sitcLayout, name: sitcLayoutName},
    },
  }))

  private setHSMetadata = () => this.setState((prevState: IState): IState => ({
    ...prevState,
    metadata: {
      status: DataStatus.ValidInput,
      value: {isFromFile: false, data: hsMetadata, name: hsMetadataName},
    },
  }))

  private setSITCMetadata = () => this.setState((prevState: IState): IState => ({
    ...prevState,
    metadata: {
      status: DataStatus.ValidInput,
      value: {isFromFile: false, data: sitcMetadata, name: sitcMetadataName},
    },
  }))

  private onLayoutDataDrop = (content: string, fileName: string) => this.setState(
    (prevState: IState): IState => ({
      ...prevState,
      layoutData: {
        status: DataStatus.ValidInput,
        value: {isFromFile: true, data: JSON.parse(content), fileName},
      },
    }),
  )

  private onMetadataDrop = (content: string, fileName: string) => this.setState(
    (prevState: IState): IState => ({
      ...prevState,
      metadata: {
        status: DataStatus.ValidInput,
        value: {isFromFile: true, data: JSON.parse(content), fileName},
      },
    }),
  )

  private onMainDataDrop = (content: string, fileName: string) => this.setState(
    (prevState: IState): IState => {
      const rawData: IRawDatum[] = JSON.parse(content);
      const parsedData = parseRawData(rawData);
      return {
        ...prevState,
        mainData: {
          status: DataStatus.ValidInput,
          value: {isFromFile: true, data: parsedData, fileName},
        },
      };
    },
  )

  private updateNumValuesPerNode = (numValuesPerNode: number) => this.setState((prevState: IState) => {
    const {
      nodeSizingLabels: oldNodeSizingLabels,
      selectedNodeSizing: oldSelectedNodeSizing,
    } = prevState;

    const newNodeSizingLabels: string[] = [];
    for (let i = 0; i < numValuesPerNode; i += 1) {
      const retrievedCurrentLabel = oldNodeSizingLabels[i];
      const label = (retrievedCurrentLabel === undefined) ? 'Please select a label' : retrievedCurrentLabel;
      newNodeSizingLabels.push(label);
    }

    let newSelectedNodeSizing: number | undefined;
    if (oldSelectedNodeSizing === undefined || numValuesPerNode === 0) {
      newSelectedNodeSizing = undefined;
    } else if (oldSelectedNodeSizing > numValuesPerNode - 1) {
      newSelectedNodeSizing = oldSelectedNodeSizing;
    }

    return {
      ...prevState,
      nodeSizingLabels: newNodeSizingLabels,
      numValuesPerNode,
      selectedNodeSizing: newSelectedNodeSizing,
    };
  })

  private updateValueLabel = (label: string, index: number) => this.setState((prevState: IState) => {
    const {
      nodeSizingLabels: prevNodeSizingLabels,
    } = prevState;
    const nextNodeSizingLabels = [...prevNodeSizingLabels];
    nextNodeSizingLabels[index] = label;
    return {
      ...prevState,
      nodeSizingLabels: nextNodeSizingLabels,
    };
  })

  private setNodeSizing = (inputSelectedNodeSizing: number) => this.setState((prevState: IState) => {
    const newSelectedNodeSizing: number | undefined =
      (inputSelectedNodeSizing === selectedNodeSizingSentinelValue) ?
      undefined :
      inputSelectedNodeSizing;
    return {
      ...prevState,
      selectedNodeSizing: newSelectedNodeSizing,
    };
  })
  private updateMinNodeRadius = (input: number) => this.setState(
    (prevState: IState): IState => {
      const prevMaxNodeRadius = prevState.maxNodeRadius;

      let newMinNodeRadius: number;
      if (Number.isNaN(input)) {
        // Possible to have `NaN` if the number input field is empty:
        newMinNodeRadius = (defaultMinNodeRadius < prevMaxNodeRadius) ? defaultMinNodeRadius : prevMaxNodeRadius;
      } else {
        newMinNodeRadius = (input < prevMaxNodeRadius) ? input : prevMaxNodeRadius;
      }

      return {
        ...prevState,
        minNodeRadius: newMinNodeRadius,
      };
    },
  )

  private updateMaxNodeRadius = (input: number) => this.setState(
    (prevState: IState): IState => {

      const prevMinNodeRadius = prevState.minNodeRadius;

      let newMaxNodeRadius: number;
      if (Number.isNaN(input)) {
        newMaxNodeRadius = (defaultMaxNodeRadius > prevMinNodeRadius) ? defaultMaxNodeRadius : prevMinNodeRadius;
      } else {
        newMaxNodeRadius = (input > prevMinNodeRadius) ? input : prevMinNodeRadius;
      }
      return {
        ...prevState,
        maxNodeRadius: newMaxNodeRadius,
      };
    },
  )

  private chartRootEl: HTMLElement | null;
  private saveChartRootEl = (el: HTMLElement | null) => this.chartRootEl = el;

  private chartContainerEl: HTMLElement | null;
  private saveChartContainerEl = (el: HTMLElement | null) => this.chartContainerEl = el;

  render() {
    const {
      layoutData, metadata, mainData, numValuesPerNode,
      selectedNodeSizing, nodeSizingLabels,
      width, height, top, left,
      maxNodeRadius, minNodeRadius,
    } = this.state;

    let nodes: IProcessedNode[];
    let edges: Array<IProcessedEdge<IProcessedNode>>;
    let relatedNodesMap: RelatedNodesMap;
    let tooltipsMap: Map<string, IProcessedNode>;
    if (width === undefined || height === undefined) {
      nodes = [];
      edges = [];
      relatedNodesMap = new Map();
      tooltipsMap = new Map();
    } else {
      const merged = mergeData({
        layoutDataStatus: layoutData,
        metadataStatus: metadata,
        mainDataStatus: mainData,
        numValuesPerNode, selectedNodeSizing,
        width, height,
        nodeSizingLabels,
        maxNodeRadius, minNodeRadius,
      });

      if (merged.status === MergeStatus.Success) {
        nodes = merged.value.nodes;
        edges = merged.value.edges;
        relatedNodesMap = merged.value.relatedNodesMap;
        tooltipsMap = merged.value.tooltipMap;
      } else {
        nodes = [];
        edges = [];
        relatedNodesMap = new Map();
        tooltipsMap = new Map();
      }
    }

    const noSizingOption: IChoice = {value: selectedNodeSizingSentinelValue, label: 'None'};
    const variableSizingOptions: IChoice[] = nodeSizingLabels.map(
      (label: string, index: number) => ({value: index, label}),
    );
    const nodeSizingOptions: IChoice[] = [noSizingOption, ...variableSizingOptions];
    const nodeSizingSelectedValue =
      (selectedNodeSizing === undefined) ? selectedNodeSizingSentinelValue : selectedNodeSizing;
    const nodeSizingSelector = (
      <RadioSelector
        choices={nodeSizingOptions}
        selected={nodeSizingSelectedValue}
        onClick={this.setNodeSizing}
        mainLabel={'Node Sizing'}
        containerComponent={NodeSizingContainer}
        labelComponent={BaseRadioSelectorLabel}
      />
    );

    const layoutBuiltinSources: IBuiltInDataSource[] = [
      {name: hsLayoutName, onSelect: this.setHSLayout},
      {name: sitcLayoutName, onSelect: this.setSITCLayout},
    ];

    const metadataBuiltinSources: IBuiltInDataSource[] = [
      {name: hsMetadataName, onSelect: this.setHSMetadata},
      {name: sitcMetadataName, onSelect: this.setSITCMetadata},
    ];

    return (
      <DragDropContextProvider backend={HTML5Backend}>
        <Root>
          <Chart
            nodes={nodes} edges={edges}
            tooltipsMap={tooltipsMap}
            relatedNodesMap={relatedNodesMap}
            width={width} height={height}
            top={top} left={left}
            saveChartRootEl={this.saveChartRootEl}
            saveChartContainerEl={this.saveChartContainerEl}/>
          <ControlsContainer>
            {nodeSizingSelector}
          </ControlsContainer>
          <Config
            onLayoutDataDrop={this.onLayoutDataDrop}
            onMetadataDrop={this.onMetadataDrop}
            onMainDataDrop={this.onMainDataDrop}
            layoutBuiltInSources={layoutBuiltinSources}
            metadataBuiltInSources={metadataBuiltinSources}
            layoutData={layoutData}
            metadata={metadata}
            mainData={mainData}
            updateNumValuesPerNode={this.updateNumValuesPerNode}
            numValuesPerNode={numValuesPerNode}
            nodeSizingLabels={nodeSizingLabels}
            updateLabel={this.updateValueLabel}
            minNodeRadius={minNodeRadius}
            maxNodeRadius={maxNodeRadius}
            updateMinNodeRadius={this.updateMinNodeRadius}
            updateMaxNodeRadius={this.updateMaxNodeRadius}
            />
        </Root>
      </DragDropContextProvider>
    );
  }
}

export default DragDropContext<IProps>(HTML5Backend)(RootComponent as React.ComponentClass<IProps>);
