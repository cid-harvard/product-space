import * as React from 'react';
import styled from 'styled-components';
import {
  DetailOverlayContainer,
} from '../RootGrid';
import {
  DisplayValueStatus,
  ITooltipInfo,
} from '../Utils';

const escapeKeyCode = 27;

// Convert from an array of `IRow` to React elements, accounting for all the
// possible types of values:
export const getRows = (rows: ITooltipInfo[], Container: React.ComponentClass) => {
  const rowElems: Array<JSX.Element[] | null> = rows.map(({label, value}) => {

    let result: JSX.Element[] | null;
    if (typeof value === 'string' || typeof value === 'number') {
      result = [
        <Container key='label'>{label}</Container>,
        <Container key='value'>{value}</Container>,
      ];
    } else {
      if (value.status === DisplayValueStatus.Show ||
          value.status === DisplayValueStatus.ShowNotApplicable ||
          value.status === DisplayValueStatus.ShowNotAvailable) {

        let displayedValue: string | number;
        if (value.status === DisplayValueStatus.Show) {
          displayedValue = value.value;
        } else if (value.status === DisplayValueStatus.ShowNotApplicable) {
          displayedValue = 'Not Applicable';
        } else {
          displayedValue = 'Not Available';
        }

        result = [
          <Container key='label'>{label}</Container>,
          <Container key='value'>{displayedValue}</Container>,
        ];
      } else {
        result = null;
      }
    }
    return result;
  });
  return rowElems;
};

// `position: relative` is always needed so that the overlay appears in front of
// the country/product/partner dropdowns:
const Root = styled(DetailOverlayContainer)`
  position: relative;
  background-color: white;
  border-width: 2px;
  border-style: solid;
  border-top-width: 7px;
  font-weight: 300;
`;

// The sole purpose of having this extra container is to make the "close" button
// not scroll with the content of the detail overlay:
const ContentOuterContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow-y: auto;
`;

const ContentInnerContainer = styled.div`
  width: 73.4%;
  margin: 0 auto;
  padding-top: 3.5vh;
`;

const closeButtonSize = '1.1rem';
const CloseButton = styled.div`
  width: ${closeButtonSize};
  height: ${closeButtonSize};
  top: 2.8%;
  left: 94%;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: translateX(-50%) translateY(-50%);
  cursor: pointer;
  color: #bbb;
  position: absolute;
`;

const Title = styled.div`
  font-weight: 300;
  font-size: 0.95rem;
`;

const Table = styled.div`
  display: grid;
  grid-template-columns: minmax(min-content, 2fr) 1fr;
  grid-auto-rows: minmax(2rem, max-content);
  font-size: 0.8rem;
  margin: 1rem 0;
`;

const CustomContent = styled.div`
  font-size: 0.8rem;
`;

const cellBorderColor = '#ddd';

const TableItem = styled.div`
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${cellBorderColor};
  padding: 0.5rem 0;

  &:nth-child(2n + 1) {
    justify-content: flex-start;
  }

  &:nth-child(2n) {
    justify-content: flex-end;
    font-weight: 700;
  }
`;

export interface IProps {
  rows: ITooltipInfo[];
  color: string;
  title: string;
  hideOverlay: () => void;
  rememberEl?: (el: HTMLElement | null) => void;
}

export default class extends React.PureComponent<IProps, {}> {
  private rememberEl = (el: HTMLElement | null) => {
    const {rememberEl} = this.props;
    if (rememberEl !== undefined) {
      rememberEl(el);
    }
  }

  componentDidMount() {
    document.addEventListener('keyup', this.listenToKeyEvents);
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.listenToKeyEvents);
  }

  private listenToKeyEvents = ({keyCode}: KeyboardEvent) => {
    if (keyCode === escapeKeyCode) {
      this.props.hideOverlay();
    }
  }

  private onCloseButtonClick = () => this.props.hideOverlay();

  render() {
    const {color, rows, title} = this.props;
    const style = {
      borderColor: color,
    };
    const rowElems = getRows(rows, TableItem);
    return (
      <Root style={style} innerRef={this.rememberEl}>
        <ContentOuterContainer>
          <ContentInnerContainer>
            <Title>{title}</Title>
            <Table>{rowElems}</Table>
            <CustomContent>
              {this.props.children}
            </CustomContent>
          </ContentInnerContainer>
        </ContentOuterContainer>
        <CloseButton onClick={this.onCloseButtonClick}>X</CloseButton>
      </Root>
    );
  }
}
