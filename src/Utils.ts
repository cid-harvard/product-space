interface INode {
  id: string;
  x: number;
  y: number;
}

export interface IEdge {
  source: string;
  target: string;
}

export interface ILayoutData {
  nodes: INode[];
  edges: IEdge[];
}

export interface IMetadatum {
  id: string;
  shortLabel: string;
  longLabel?: string;
  color: string;
}

export interface IDatum {
  id: string;
  values: number[];
  active: boolean;
}

export enum DataStatus {
  NoInput = 'NoInput',
  InvalidInput = 'InvalidInput',
  ValidInput = 'ValidInput',
}

export type Data<T> = {
  isFromFile: false;
  data: T;
  name: string;
} | {
  isFromFile: true;
  data: T;
  fileName: string;
};

export type IDataStatus<T> = {
  status: DataStatus.NoInput,
} | {
  status: DataStatus.InvalidInput,
  name: string;
} | {
  status: DataStatus.ValidInput,
  value: Data<T>;
};

export interface IDataInput<T> {
  label: string;
  status: IDataStatus<T>;
  parseFromString: (rawContent: string) => T;
}

export const assertNever = (x: never): never => {
  throw new Error('Unexpected object: ' + x);
};

// Like lodash's `keyBy` but the result is a `Map`. Keys are assumed to be unique:
export const keyByMap =
  <Key, Value>(getKey: (value: Value) => Key) => (list: Value[]): Map<Key, Value> => {

  const pairs: Array<[Key, Value]> = list.map(
    value => ([getKey(value), value] as [Key, Value]),
  );
  const map: Map<Key, Value> = new Map(pairs);
  return map;
};

export enum DisplayValueStatus {
  // Value is present and display that value:
  Show = 'Present',
  // Value is not applicable and display "N/A":
  ShowNotApplicable = 'NotApplicable',

  ShowNotAvailable = 'ShowNotAvailable',
  // Do not display value:
  DoNotShow = 'NotPresent',
}

export type DisplayValue = {
  status: DisplayValueStatus.Show,
  value: number | string,
} | {
  status: DisplayValueStatus.DoNotShow,
} | {
  status: DisplayValueStatus.ShowNotApplicable,
} | {
  status: DisplayValueStatus.ShowNotAvailable;
};

export interface ITooltipInfo {
  label: string;
  value: DisplayValue;
}

// Return true if `lower` < `test` < `upper`:
export const isInRange =
(test: number, lower: number, upper: number) => (test >= lower && test <= upper);

export const xDomainWideningFactor = 1.1;
export const yDomainWideningFactor = 1.1;

export const unexportedNodeBackgroundColor = 'rgb(215,215,218)';
export const inactiveNodeStrokeColor = 'rgb(235, 235, 245)';

export const svgBackgroundColor = 'rgb(245,245,245)';

export const controlButtonZoomFactor = 1.1;

export const secondsPerFrame = 16; // 60fps
