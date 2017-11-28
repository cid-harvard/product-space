import * as _ from 'lodash';
import * as React from 'react';
import styled from 'styled-components';
import {
  IProcessedNode,
} from '../mergeData/Utils';
import {
  GraphContainer,
} from '../RootGrid';
import {
  ITransformationMatrix,
} from './panZoom';
import Tooltip from './Tooltip';

const TooltipContainerElement = styled(GraphContainer)`
  pointer-events: none;
  position: relative;
`;
interface IProps {
  tooltipMap: Map<string, IProcessedNode>;
  hoveredProduct: string | undefined;
  highlightedProduct: string | undefined;
  selectedProducts: string[];
  chartContainerWidth: number | undefined;
  chartContainerHeight: number | undefined;
  transformationMatrix: ITransformationMatrix;
}

export default class extends React.PureComponent<IProps, {}> {
  render() {
    const {
      tooltipMap, hoveredProduct, highlightedProduct, selectedProducts,
      chartContainerHeight, chartContainerWidth, transformationMatrix,
    } = this.props;
    // Note: the tooltips have the following "z-index" order: hover tooltips
    // on top, followed by selection tooltips followed by highlight tooltip on
    // the bottom. We add them to the `tooltipIDs` array in the opposite order
    // (hover first, highlighted last) to accommodate the `uniq` function,
    // which retains the first occurrence:
    let tooltipIDs: string[] = [];
    if (hoveredProduct !== undefined) {
      tooltipIDs = [hoveredProduct];
    }
    tooltipIDs = [...tooltipIDs, ...selectedProducts];
    if (highlightedProduct !== undefined) {
      tooltipIDs = [...tooltipIDs, highlightedProduct];
    }
    const uniqueIDs = _.reverse(_.uniq(tooltipIDs));
    const tooltipElems = uniqueIDs.map(id => {
      const {x, y, shortLabel} = tooltipMap.get(id)!;
      return (
        <Tooltip key={id}
        svgWidth={chartContainerWidth}
        svgHeight={chartContainerHeight}
        transformationMatrix={transformationMatrix}
        productName={shortLabel}
        xOffset={x}
        yOffset={y} />
      );
    });
    return (
      <TooltipContainerElement>
        {tooltipElems}
      </TooltipContainerElement>
    );
  }

}
