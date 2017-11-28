import {
  ITooltipInfo,
} from '../Utils';

export interface INodeBase {
  id: string;
  shortLabel: string;
  longLabel: string;
  active: boolean;
  defaultColor: string;
  radius: number;
  x: number;
  y: number;
  detailTooltipInfo: ITooltipInfo[];
}

export type RelatedNodesMap = Map<string, string[]>;

export interface IProcessedNode extends INodeBase {
  connections: INodeBase[];
}

export interface IProcessedEdge<T> {
  nodes: [T, T];
}

export interface IMergedData {
  nodes: IProcessedNode[];
  edges: Array<IProcessedEdge<IProcessedNode>>;
  relatedNodesMap: RelatedNodesMap;
  tooltipMap: Map<string, IProcessedNode>;
  // total: number;
}

export const enum MergeStatus {
  NoData = 'NoData',
  Fail = 'Fail',
  Success = 'Success',
}

export const enum MergeErrorCode {
  InvalidData = 'InvalidData',
  // If the number of values per node set in the UI does not match the number of
  // values per node found in the data e.g. user requested world trade and
  // country trade but in the data, only world trade is provided:
  NumValuesPerNodeNotMatchWithData = 'NumValuesPerNodeNotMatch',
}

export type IMergeStatus = {
  status: MergeStatus.NoData,
} | {
  status: MergeStatus.Fail,
  reason: MergeErrorCode[];
} | {
  status: MergeStatus.Success,
  value: IMergedData;
};
