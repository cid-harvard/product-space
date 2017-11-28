import {
  IProcessedEdge,
  IProcessedNode,
  RelatedNodesMap,
} from '../mergeData/Utils';
import {
  IDislayedEdge,
} from './Chart';
import {
  getHighlightSets,
} from './Utils';

const assign = (
    relatedNodesMap: RelatedNodesMap,
    withoutHighlight: Array<IProcessedEdge<IProcessedNode>>,
    highlightedProduct: string | undefined,
    selectedProducts: string[],
    hoveredProduct: string | undefined): IDislayedEdge[] => {

  const {
    relatedToHighlightedOrSelected,
    relatedToHovered,
    selectedAndHighlighted,
  } = getHighlightSets(
    relatedNodesMap, highlightedProduct, selectedProducts, hoveredProduct,
  );

  const result: IDislayedEdge[] = withoutHighlight.map(({nodes}) => {
    const [
      {id: firstNodeId, x: x1, y: y1},
      {id: secondNodeId, x: x2, y: y2},
    ] = nodes;
    const isShownAsRelatedToHovered =
      (relatedToHovered.has(firstNodeId) && secondNodeId === hoveredProduct) ||
      (relatedToHovered.has(secondNodeId) && firstNodeId === hoveredProduct);

    const isShownAsRelatedToSelected =
      (relatedToHighlightedOrSelected.has(firstNodeId) && selectedAndHighlighted.has(secondNodeId)) ||
      (relatedToHighlightedOrSelected.has(secondNodeId) && selectedAndHighlighted.has(firstNodeId));
    return {
      firstNodeId, secondNodeId,
      x1, y1, x2, y2,
      isShownAsRelatedToHovered,
      isShownAsRelatedToSelected,
    };
  });
  return result;
};

export default assign;
