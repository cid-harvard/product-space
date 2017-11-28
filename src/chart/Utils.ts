import * as _ from 'lodash';
import {
  RelatedNodesMap,
} from '../mergeData/Utils';
import {
  inactiveNodeStrokeColor,
  unexportedNodeBackgroundColor,
} from '../Utils';

export const getFillAndStroke = (active: boolean, color: string) => {
  let fill: string;
  if (active === true) {
    fill = color;
  } else {
    fill = unexportedNodeBackgroundColor;
  }
  return {
    fill,
    // Give inactive node a border at all times but no border for active node
    // (beacuse of they have colorful fill):
    stroke: (active === true) ? 'none' : inactiveNodeStrokeColor,
  };
};

export const edgeStroke = 'rgb(136, 136, 153)';

// Retrieve relate nodes for a given node. Retur empty array if not found.
const getArrayFromMap = (map: RelatedNodesMap, key: string | undefined): string[] => {
  if (key === undefined) {
    return [];
  } else {
    const retrieved = map.get(key)!;
    if (retrieved === undefined) {
      return [];
    } else {
      return retrieved;
    }
  }
};

interface IOutput {
  relatedToHovered: Set<string>;
  relatedToHighlightedOrSelected: Set<string>;
  selectedAndHighlighted: Set<string>;
}
export const getHighlightSets = (
    relatedNodesMap: RelatedNodesMap,
    highlightedProduct: string | undefined,
    selectedProducts: string[],
    hoveredProduct: string | undefined): IOutput => {

  const selectedAndHighlighted = [highlightedProduct, ...selectedProducts].filter(
    value => value !== undefined,
  ) as string[];

  const relatedToHovered: Set<string> = new Set(getArrayFromMap(relatedNodesMap, hoveredProduct));
  const relatedToHighlightedOrSelected = new Set(
    _.flatten(selectedAndHighlighted.map(nodeId => getArrayFromMap(relatedNodesMap, nodeId))),
  );
  return {
    relatedToHovered,
    relatedToHighlightedOrSelected,
    selectedAndHighlighted: new Set(selectedAndHighlighted),
  };
};
