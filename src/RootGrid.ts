import styled from 'styled-components';

const gridLines = {
  // rows:
  dataInputTop: 'globalDataInputTop',
  dataInputBottom: 'globalDataInputBottom',
  graphTop: 'globalGraphTop',
  graphBottom: 'globalGraphBottom',
  controlsTop: 'globalControlsTop',
  controlsBottom: 'globalControlsBottom',

  // columns:
  graphLeft: 'globalGraphLeft',
  graphRight: 'globalGraphRight',
  detailOverlayLeft: 'globaDetailLeft',
  detailOverlayRight: 'globalDetailRight',
  pageRight: 'globalPageRight',
};

export const GridRoot = styled.div`
  display: grid;
  grid-template-columns:
    50px
    [${gridLines.graphLeft}] 7fr
    [${gridLines.graphRight}] 1fr
    [${gridLines.detailOverlayLeft}] 3fr
    [${gridLines.detailOverlayRight}] 50px
    [${gridLines.pageRight}];
  grid-template-rows:
    [${gridLines.dataInputTop} ${gridLines.graphTop}] 40fr
    [${gridLines.dataInputBottom}] 80fr
    [${gridLines.graphBottom} ${gridLines.controlsTop}] 10fr
    [${gridLines.controlsBottom}];
`;

export const DataInputContainer = styled.div`
  grid-row: ${gridLines.dataInputTop} / ${gridLines.dataInputBottom};
  grid-column: ${gridLines.graphLeft} / ${gridLines.detailOverlayRight};
`;

export const DataInputToggleContainer = styled.div`
  grid-row: ${gridLines.dataInputTop} / ${gridLines.dataInputBottom};
  grid-column: ${gridLines.detailOverlayRight} / ${gridLines.pageRight};
`;

export const GraphContainer = styled.div`
  grid-row: ${gridLines.graphTop} / ${gridLines.graphBottom};
  grid-column: ${gridLines.graphLeft} / ${gridLines.graphRight};
`;

export const DetailOverlayContainer = styled.div`
  grid-row: ${gridLines.graphTop} / ${gridLines.graphBottom};
  grid-column: ${gridLines.detailOverlayLeft} / ${gridLines.detailOverlayRight};
`;

export const ControlsContainer = styled.div`
  grid-row: ${gridLines.controlsTop} / ${gridLines.controlsBottom};
  grid-column: ${gridLines.graphLeft} / ${gridLines.detailOverlayRight};
`;
