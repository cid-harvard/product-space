import * as React from 'react';
import styled from 'styled-components';

const Input = styled.input`
  display: none;
`;
const borderStyle = '1px solid #999';

const borderRadius = '5px';
const Label = styled.label`
  padding: 0.5rem;
  border-bottom: ${borderStyle};
  border-top: ${borderStyle};
  border-right: ${borderStyle};
  font-size: 0.8rem;
  display: flex;
  justify-content: center;
  align-items: center;

  &:first-of-type {
    border-left: ${borderStyle};
    border-top-left-radius: ${borderRadius};
    border-bottom-left-radius: ${borderRadius};
  }

  &:last-of-type {
    border-top-right-radius: ${borderRadius};
    border-bottom-right-radius: ${borderRadius};
  }
`;
const UnselectedLabel = styled(Label)`
  cursor: pointer;
`;
const SelectedLabel = styled(Label)`
  background-color: #eeeeef;
  cursor: default;
  font-weight: 600;
`;

function isSelected<T>(selected: T, assigned: T) {
  return (selected === assigned);
}

interface IProps {
  selected: number;
  assigned: number;
  label: string;
  onClick: (value: number) => void;
}

export default class extends React.PureComponent<IProps> {
  private onClick = () => {
    const {selected, assigned, onClick} = this.props;
    if (!isSelected(selected, assigned)) {
      onClick(assigned);
    }
  }
  render() {
    const {selected, assigned, label} = this.props;
    const isThisSelected = isSelected(selected, assigned);
    const Component = isThisSelected ? SelectedLabel : UnselectedLabel;
    return (
      <Component>
        <Input type='radio' value={assigned} checked={isThisSelected} onChange={this.onClick}/>
        {label}
      </Component>
    );
  }
}
