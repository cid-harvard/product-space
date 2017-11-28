import * as React from 'react';
import styled from 'styled-components';
import Choice from './Choice';

export const Container = styled.div`
  display: flex;
  align-items: center;
`;
const ChoicesContainer = styled.div`
  display: flex;
  position: relative;
`;
export const Label = styled.div`
  margin-right: 5%;
  flex-shrink: 0;
  font-size: 0.8rem;
  font-weight: 300;
`;
export interface IChoice {
  value: number;
  label: string;

}
// Most of the time, the `DisplayValue` is the same as the `SentValue` but in
// some cases, they are different e.g. the stack graph's population/inflation
// adjustment selector where that selector had to do some mapping betweeen
// `DisplayValue` and `SentValue`:
export interface IProps {
  choices: IChoice[];
  selected: number;
  onClick: (value: number) => void;
  mainLabel: string;
  // If more styling is desired, custom `styled-components` can be passed in here.
  // They should directly extend the `Container` and the `Label` component:
  containerComponent?: typeof Container;
  labelComponent?: typeof Label;
}
export default class extends React.PureComponent<IProps> {

  constructor(props: IProps) {
    super(props);
    this.state = {
      showTooltip: false,
    };
  }

  render() {
    const {
      choices, selected, onClick, mainLabel,
      containerComponent, labelComponent,
    } = this.props;

    // TODO: remove type casting:
    const choiceElems = choices.map(({value, label}) => (
      <Choice {...{selected, label}} assigned={value} key={value} onClick={onClick}/>
    ));
    const ContainerComponent = (containerComponent === undefined) ? Container : containerComponent;
    const LabelComponent = (labelComponent === undefined) ? Label : labelComponent;
    return (
      <ContainerComponent>
        <LabelComponent>{mainLabel}</LabelComponent>
        <ChoicesContainer>
          {choiceElems}
        </ChoicesContainer>
      </ContainerComponent>
    );
  }
}
