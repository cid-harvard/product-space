import * as _ from 'lodash';
import * as React from 'react';
import styled from 'styled-components';
import {
  DataInputContainer as DataInputContainerBase,
  DataInputToggleContainer,
} from '../RootGrid';
import {
  assertNever,
  DataStatus,
  IDataStatus,
  IDatum,
  ILayoutData,
  IMetadatum,
} from '../Utils';
import DataInput, {
  DropTargetStatus,
  IBuiltInDataSource,
} from './DataInput';
import ValueLabel from './ValueLabel';

const DataInputContainer = styled(DataInputContainerBase)`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 3fr 1fr;
  position: relative;
  background: white;
  border: 1px solid black;
`;

const Toggle = styled(DataInputToggleContainer)`
  cursor: pointer;
  border: 1px solid black;
  height: 30%;
`;

const ValuesConfigContainer = styled.div`
  grid-row: 2;
  grid-column: 1 / 4;
  display: flex;
  align-items: center;
`;

function convertToDropTargetStatus<T>(input: IDataStatus<T>): DropTargetStatus {
  let output: DropTargetStatus;
  switch (input.status) {
    case DataStatus.NoInput:
      output = {status: DataStatus.NoInput};
      break;

    case DataStatus.InvalidInput: {
      output = {status: DataStatus.InvalidInput, name: input.name};
      break;
    }

    case DataStatus.ValidInput: {
      const {value} = input;
      const name = (value.isFromFile === true) ? `file ${value.fileName}` : `built-in dataset ${value.name}`;
      output = {status: DataStatus.ValidInput, name};
      break;
    }

    default:
      output = assertNever(input);
  }
  return output;
}

interface IProps {
  onLayoutDataDrop: (content: string, fileName: string) => void;
  onMetadataDrop: (content: string, fileName: string) => void;
  onMainDataDrop: (content: string, fileName: string) => void;
  layoutBuiltInSources: IBuiltInDataSource[];
  metadataBuiltInSources: IBuiltInDataSource[];
  layoutData: IDataStatus<ILayoutData>;
  metadata: IDataStatus<IMetadatum[]>;
  mainData: IDataStatus<IDatum[]>;
  numValuesPerNode: number;
  updateNumValuesPerNode: (value: number) => void;
  nodeSizingLabels: string[];
  updateLabel: (label: string, index: number) => void;
}

interface IState {
  visible: boolean;
}

export default class extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      visible: true,
    };
  }

  private onSelectChange = (event: React.FormEvent<HTMLSelectElement>) => {
    const parsed = parseInt(event.currentTarget.value, 10);
    this.props.updateNumValuesPerNode(parsed);
  }

  private toggleVisibility = () => this.setState(
    (prevState: IState) => ({...prevState, visible: !prevState.visible}),
  )

  render() {
    const {
      onLayoutDataDrop, onMetadataDrop, onMainDataDrop,
      layoutData, metadata, mainData,
      numValuesPerNode, nodeSizingLabels, updateLabel,
      layoutBuiltInSources, metadataBuiltInSources,
    } = this.props;
    const {visible} = this.state;

    const valueLabels = _.range(numValuesPerNode).map(index => (
      <ValueLabel
        key={`label-${index}`}
        label={nodeSizingLabels[index]}
        index={index}
        updateLabel={updateLabel}
        />
    ));

    const toggleText = visible ? 'Click to hide config' : 'Click to show config';

    let panel: JSX.Element | null;
    if (visible === true) {
      const dropdownId = 'num-values-per-node-dropdown';
      panel = (
      <DataInputContainer key='data-input'>
        <DataInput
          label='Network Layout'
          updateUserProvidedData={onLayoutDataDrop}
          status={convertToDropTargetStatus(layoutData)}
          allowBuiltInData={true}
          builtInDataSources={layoutBuiltInSources}
          />
        <DataInput
          label='Metadata'
          updateUserProvidedData={onMetadataDrop}
          status={convertToDropTargetStatus(metadata)}
          allowBuiltInData={true}
          builtInDataSources={metadataBuiltInSources}
          />
        <DataInput
          label='Main data'
          updateUserProvidedData={onMainDataDrop}
          status={convertToDropTargetStatus(mainData)}
          allowBuiltInData={false}
          />

        <ValuesConfigContainer>
          <label htmlFor={dropdownId}>Select number of values per node and their corresponding names: </label>
          <select value={numValuesPerNode} onChange={this.onSelectChange} id={dropdownId}>
            <option value={0}>0</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
          {valueLabels}
        </ValuesConfigContainer>
      </DataInputContainer>
      );
    } else {
      panel = null;
    }

    return [
      panel,
      <Toggle key='data-input-toggle' onClick={this.toggleVisibility}>{toggleText}</Toggle>,
    ];
  }
}
