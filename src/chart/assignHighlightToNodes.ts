import {
  IProcessedNode,
  RelatedNodesMap,
} from '../mergeData/Utils';
import {
  IDisplayNode,
} from './Chart';
import {
  getHighlightSets,
} from './Utils';

const assign = (
    relatedNodesMap: RelatedNodesMap,
    withoutHighlight: IProcessedNode[],
    highlightedProduct: string | undefined,
    selectedProducts: string[],
    hoveredProduct: string | undefined): IDisplayNode[] => {

  const {
    relatedToHighlightedOrSelected,
    relatedToHovered,
    selectedAndHighlighted,
  } = getHighlightSets(
    relatedNodesMap, highlightedProduct, selectedProducts, hoveredProduct,
  );
  const result: IDisplayNode[] = withoutHighlight.map(node => {
    const {id} = node;
    return {
      ...node,
      isHighlighted: selectedAndHighlighted.has(id),
      isShownAsRelatedToHovered: relatedToHovered.has(id),
      isShownAsRelatedToSelected: relatedToHighlightedOrSelected.has(id),
    };
  });
  return result;
};

export default assign;
