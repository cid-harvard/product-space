import * as _ from 'lodash';
import * as React from 'react';
import {
  ConnectDropTarget,
  DropTarget,
  DropTargetCollector,
  DropTargetConnector,
  DropTargetMonitor,
  DropTargetSpec,
} from 'react-dnd';
import {
  NativeTypes,
} from 'react-dnd-html5-backend';
import styled, {
  css,
} from 'styled-components';
import getFileContent from '../getFileContent';
import {
  assertNever,
  DataStatus,
} from '../Utils';

const textStyle = css`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Input = styled.input`
  display: none;
`;
const Root = styled.label`
  ${textStyle}
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
  height: 100%;
  cursor: pointer;

  &:hover {
    border: 1px solid blue;
  }
`;

const DropPrompt = styled.div`
  ${textStyle}
  height: 100%;
  width: 100%;
  border: 1px solid blue;
`;

const Prompt = styled.div`
  flex-direction: column;
  flex: 4;
  line-height: 1.5;
`;

const PromptOuterListItem = styled.li`
  list-style-type: disc;
`;

const PromptInnerListItem = styled.li`
  cursor: pointer;
  list-style-type: square;
  margin-left: 2rem;
  border: 1px solid transparent;

  &:hover {
    color: red;
    border: 1px solid red;
  }
`;

const Status = styled.div`
  ${textStyle}
  flex: 1;
`;

interface IGetItemResult {
  files: FileList;
}

const getFileInfo = async (monitor: DropTargetMonitor) => {
  const {files} = monitor.getItem() as IGetItemResult;
  const firstFile = files[0];
  const content = await getFileContent(firstFile);
  const fileName = firstFile.name;
  return {content, fileName};
};

const specs: DropTargetSpec<IOwnProps> = {
  drop(props: IOwnProps, monitor: DropTargetMonitor) {
    getFileInfo(monitor).then(
      ({content, fileName}) => props.updateUserProvidedData(content, fileName),
    ).catch(error => console.warn(error));
  },
};

const collect: DropTargetCollector = (
    connect: DropTargetConnector, monitor: DropTargetMonitor): IPropsFromDnD => {

  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
  };
};

export type DropTargetStatus =
  {status: DataStatus.NoInput} |
  {status: DataStatus.InvalidInput, name: string} |
  {status: DataStatus.ValidInput, name: string};

export interface IBuiltInDataSource {
  name: string;
  onSelect: () => void;
}

type IDisjointProps = {
  allowBuiltInData: false;
} | {
  allowBuiltInData: true;
  builtInDataSources: IBuiltInDataSource[];
};

type ISharedProps = {
  updateUserProvidedData: (content: string, fileName: string) => void;
  label: string;
  status: DropTargetStatus
};

type IOwnProps = ISharedProps & IDisjointProps;

interface IPropsFromDnD {
  connectDropTarget: ConnectDropTarget;
  isOver: boolean;
  canDrop: boolean;
}

type IProps = IOwnProps & IPropsFromDnD;

class DataInput extends React.Component<IProps> {
  private fileInputId: string = _.uniqueId('data-input-');

  private onInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files !== null) {
      const firstFile = files[0];
      const content = await getFileContent(firstFile);
      const fileName = firstFile.name;
      this.props.updateUserProvidedData(content, fileName);
    }
  }
  render() {
    const props = this.props;
    const {connectDropTarget, status, label, isOver, canDrop} = props;

    const active = canDrop && isOver;

    const style: React.CSSProperties = {
      gridRow: 1,
      height: '100%',
    };

    let content: JSX.Element;
    if (active === true) {
      content = (
        <div style={style}>
          <DropPrompt>Drop file containing {label} dataset in this box</DropPrompt>
        </div>
      );
    } else {
      let statusElem: JSX.Element | null;
      switch (status.status) {
        case DataStatus.NoInput:
          statusElem = (
            <Status>Status: No data currently selected</Status>
          );
          break;
        case DataStatus.InvalidInput:
          statusElem = (
            <Status>Status: Selected {status.name} contains invalid data</Status>
          );
          break;
        case DataStatus.ValidInput: {
          statusElem = (
            <Status>Status: Selected {status.name}</Status>
          );
          break;
        }
        default:
          statusElem = assertNever(status);
      }

      let builtInPrompt: JSX.Element | null;
      if (props.allowBuiltInData === true) {
        const elems = props.builtInDataSources.map(({name, onSelect}, index) => {
          const onClick = (e: React.MouseEvent<HTMLLIElement>) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect();
          };
          return (
            <PromptInnerListItem onClick={onClick} key={`data-input-${index}`}>
              {name}
            </PromptInnerListItem>
          );
        });
        builtInPrompt = (
          <PromptOuterListItem>Click on one of the following built-in datasets:
            <ul>{elems}</ul>
          </PromptOuterListItem>
        );
      } else {
        builtInPrompt = null;
      }

      const prompt = (
        <Prompt>
          <div>Select {label} dataset in one of the following ways:</div>
          <ul>
            <PromptOuterListItem>Click anywhere in this box to manually select a file</PromptOuterListItem>
            <PromptOuterListItem>Drag and drop a file into this box</PromptOuterListItem>
            {builtInPrompt}
          </ul>
        </Prompt>
      );

      content = (
        <div style={style}>
          <Input type='file' id={this.fileInputId} onChange={this.onInputChange}/>
          <Root htmlFor={this.fileInputId}>
            {prompt}
            {statusElem}
          </Root>
        </div>
      );
    }

    return connectDropTarget(content);
  }

}

const output = DropTarget(NativeTypes.FILE, specs, collect)(DataInput as any);

export default output;
