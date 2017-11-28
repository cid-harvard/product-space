import * as React from 'react';
import styled from 'styled-components';

const Input = styled.input`
  width: 200px;
`;

interface IProps {
  label: string;
  index: number;
  updateLabel: (label: string, index: number) => void;
}

export default class extends React.Component<IProps> {
  private onChange = (event: React.FormEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    const {index, updateLabel} = this.props;
    updateLabel(value, index);
  }
  render() {
    const {label} = this.props;
    return (
      <Input type='text' value={label} onChange={this.onChange}/>
    );
  }
}
