import {
  DataStatus,
  IDataStatus,
  IDatum,
  ILayoutData,
  IMetadatum,
} from '../Utils';
import merge from './merge';
import {
  IMergeStatus,
  MergeErrorCode,
  MergeStatus,
} from './Utils';

interface IInput {
  layoutDataStatus: IDataStatus<ILayoutData>;
  metadataStatus: IDataStatus<IMetadatum[]>;
  mainDataStatus: IDataStatus<IDatum[]>;
  numValuesPerNode: number;
  selectedNodeSizing: number | undefined;
  width: number;
  height: number;
  nodeSizingLabels: string[];
}

const process = (input: IInput): IMergeStatus => {

  const {
    layoutDataStatus,
    metadataStatus,
    mainDataStatus,
    numValuesPerNode,
    selectedNodeSizing,
    width, height, nodeSizingLabels,
  } = input;
  let result: IMergeStatus;
  if (layoutDataStatus.status === DataStatus.NoInput ||
      metadataStatus.status === DataStatus.NoInput ||
      mainDataStatus.status === DataStatus.NoInput) {

    result = {status: MergeStatus.NoData};
  } else if (layoutDataStatus.status === DataStatus.InvalidInput ||
              metadataStatus.status === DataStatus.InvalidInput ||
              mainDataStatus.status === DataStatus.InvalidInput) {

    result = {
      status: MergeStatus.Fail,
      reason: [MergeErrorCode.InvalidData],
    };
  } else {
    const {value: layoutData} = layoutDataStatus;
    const {value: metadata} = metadataStatus;
    const {value: mainData} = mainDataStatus;

    // TODO: Check if all nodes have associated data:

    // Validate data
    const allValues = mainData.data.map(({values}) => values);
    if (allValues.some(array => array.length < numValuesPerNode)) {
      // Check that each node has at least as many fields as `numValuesPerNode` setting:
      result = {
        status: MergeStatus.Fail,
        reason: [MergeErrorCode.NumValuesPerNodeNotMatchWithData],
      };
    } else {
      try {
        const merged = merge(
          layoutData.data, metadata.data, mainData.data,
          width, height, selectedNodeSizing, nodeSizingLabels, numValuesPerNode,
        );
        result = {
          status: MergeStatus.Success,
          value: merged,
        };
      } catch (e) {
        console.warn(e);
        result = {
          status: MergeStatus.Fail,
          reason: [MergeErrorCode.ProcessingError],
        };
      }
    }
  }
  return result;
};

export default process;
