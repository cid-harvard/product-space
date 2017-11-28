import * as _ from 'lodash';
import * as React from 'react';
import styled from 'styled-components';

const Connections = styled.div`
  display: grid;
  grid-template-columns: 1fr 22fr;
  grid-gap: 1.3vh 2%;
`;

const IconContainer = styled.div`
  grid-column: 1;
  display: flex;
  align-items: center;
`;

// `height` and `padding-top` are set so that the aspect ratio is 1:
const Icon = styled.div`
  border-radius: 50%;
  width: 100%;
  height: 0;
  padding-top: 100%;
`;

const Label = styled.div`
  grid-column: 2;
  display: flex;
  margin-left: 1vw;
  font-size: 0.8rem;
  line-height: 1.2;
`;

const Title = styled.div`
  font-weight: 600;
  line-height: 1.4;
`;

export interface IConnection {
  color: string;
  label: string;
  id: string;
}

interface IProps {
  connections: IConnection[];
  title: string;
}

export default class extends React.Component<IProps> {
  render() {
    const {connections, title} = this.props;

    const conectionElems = connections.map(({color, label, id}) => {
      const nodeStyle = {
        backgroundColor: color,
      };
      return [
        (
          <IconContainer key={`icon-${id}`}>
            <Icon style={nodeStyle}/>
          </IconContainer>
        ),
        <Label key={`label-${id}`}>{label}</Label>,
      ];
    });

    return (
      <div>
        <Title>{title}</Title>
        <Connections>
          {_.flatten(conectionElems)}
        </Connections>
      </div>
    );
  }
}
