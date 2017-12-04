import {
  scaleLinear,
} from 'd3-scale';
import * as _ from 'lodash';
import {
  formatTradeValue,
} from '../numberFormatters';
import {
  DisplayValueStatus,
  IDatum,
  ILayoutData,
  IMetadatum,
  ITooltipInfo,
  keyByMap,
  xDomainWideningFactor,
  yDomainWideningFactor,
} from '../Utils';
import getRelatedNodesMap from './getRelatedNodesMap';
import {
  IMergedData,
  INodeBase,
  IProcessedEdge,
  IProcessedNode,
} from './Utils';

interface INodeWithMetadatum {
  id: string;
  x: number;
  y: number;
  shortLabel: string;
  longLabel: string;
  defaultColor: string;
}

interface INodeWithSize {
  id: string;
  x: number;
  y: number;
  shortLabel: string;
  longLabel: string;
  defaultColor: string;
  radius: number;
  detailTooltipInfo: ITooltipInfo[];
  active: boolean;
}

// Pick a value out of the `values` array and return a size:
type SizeGetter = (values: number[]) => number;

type IntervalWidener = (lower: number, upper: number) => [number, number];
const getIntervalWidener =
  (factor: number): IntervalWidener =>
    (lower: number, upper: number): [number, number] => {

  const width = upper - lower;
  const additionalLength = width * (factor - 1);
  const newLower = lower - additionalLength / 2;
  const newUpper = upper + additionalLength / 2;
  return [newLower, newUpper];
};

const widenXInterval = getIntervalWidener(xDomainWideningFactor);
const widenYInterval = getIntervalWidener(yDomainWideningFactor);

const merge = (
    {nodes, edges}: ILayoutData,
    metadata: IMetadatum[],
    mainData: IDatum[],
    width: number,
    height: number,
    selectedNodeSizing: number | undefined,
    nodeSizingLabels: string[],
    numValuesPerNode: number,
    maxNodeRadius: number,
    minNodeRadius: number,
  ): IMergedData => {

  const metadataMap = keyByMap<string, IMetadatum>(({id}) => id)(metadata);
  const dataMap = keyByMap<string, IDatum>(({id}) => id)(mainData);

  const allX = nodes.map(({x}) => x);
  const allY = nodes.map(({y}) => y);
  const xPositionScale = scaleLinear<number, number>()
                    .domain(widenXInterval(_.min(allX)!, _.max(allX)!))
                    .range([0, width]);
  const yPositionScale = scaleLinear<number, number>()
                    .domain(widenYInterval(_.min(allY)!, _.max(allY)!))
                    .range([0, height]);

  const nodesWithMetadata: INodeWithMetadatum[] = nodes.map(({id, x, y}) => {
    const scaledX = xPositionScale(x);
    const scaledY = yPositionScale(y);
    const retrievedMetadatum = metadataMap.get(id)!;
    const {shortLabel, color, longLabel} = retrievedMetadatum;

    const output: INodeWithMetadatum = {
      id, shortLabel,
      defaultColor: color,
      longLabel: (longLabel === undefined) ? shortLabel : longLabel,
      x: scaledX,
      y: scaledY,
    };
    return output;
  });

  let getSize: SizeGetter;
  if (selectedNodeSizing === undefined) {
    getSize = () => minNodeRadius;
  } else {
    const valuesToDetermineSize = mainData.map(({values}) => values[selectedNodeSizing]);
    const nodeSizeScale = scaleLinear<number, number>()
                      .domain([_.min(valuesToDetermineSize)!, _.max(valuesToDetermineSize)!])
                      .range([minNodeRadius, maxNodeRadius]);
    getSize = (values: number[]) => nodeSizeScale(values[selectedNodeSizing]);
  }

  const nodesWithSize: INodeWithSize[] = nodesWithMetadata.map(({id, ...rest}) => {
    const {values, active} = dataMap.get(id)!;
    const size = getSize(values);

    const valuesThatAppearInTooltip = values.slice(0, numValuesPerNode);

    const zipped = _.zip(valuesThatAppearInTooltip, nodeSizingLabels as any) as Array<[number, string]>;
    const formattedValues: ITooltipInfo[] = zipped.map(([value, label]) => {
      const displayedValue: ITooltipInfo = {
        label,
        value: {status: DisplayValueStatus.Show, value: formatTradeValue(value)},
      };
      return displayedValue;
    });

    const output: INodeWithSize = {
      ...rest,
      id, active,
      radius: size,
      detailTooltipInfo: formattedValues,

    };
    return output;
  });

  const relatedNodesMap = getRelatedNodesMap(edges);
  const nodesWithSizeMap = keyByMap<string, INodeWithSize>(({id}) => id)(nodesWithSize);

  const unsortedNodes: IProcessedNode[] = nodesWithSize.map(({detailTooltipInfo, id, ...rest}) => {
    const retrievedConnections = relatedNodesMap.get(id);
    let connections: INodeBase[];
    if (retrievedConnections === undefined) {
      connections = [];
    } else {
      connections = retrievedConnections.map(connectionId => nodesWithSizeMap.get(connectionId)!);
    }
    const output: IProcessedNode = {
      ...rest,
      id, detailTooltipInfo, connections,
    };
    return output;
  });

  let finalNodes: IProcessedNode[];
  if (selectedNodeSizing === undefined) {
    finalNodes = unsortedNodes;
  } else {
    finalNodes = _.sortBy(unsortedNodes, ({radius}) => - radius);
  }

  const nodesMap: Map<string, IProcessedNode> = keyByMap<string, IProcessedNode>(({id}) => id)(finalNodes);

  const finalEdges = edges.map(({source, target}) => {
    const sourceNode = nodesMap.get(source)!;
    const targetNode = nodesMap.get(target)!;
    const output: IProcessedEdge<IProcessedNode> = {
      nodes: [sourceNode, targetNode],
    };
    return output;
  });

  const result: IMergedData = {
    nodes: finalNodes,
    edges: finalEdges,
    relatedNodesMap,
    tooltipMap: nodesMap,
  };
  return result;
};

export default merge;
