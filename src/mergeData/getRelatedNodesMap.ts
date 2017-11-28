import {
  IEdge,
} from '../Utils';
import {
  RelatedNodesMap,
} from './Utils';

const appendNodeToMapKey = (map: Map<string, Set<string>>, key: string, value: string) => {
  if (map.get(key) === undefined) {
    map.set(key, new Set<string>());
  }
  map.get(key)!.add(value);
};

const getRelatedNodes = (edges: IEdge[]): RelatedNodesMap => {

  const intermediateMap: Map<string, Set<string>> = new Map();
  for (const {source, target} of edges) {
    appendNodeToMapKey(intermediateMap, source, target);
    appendNodeToMapKey(intermediateMap, target, source);
  }

  const output = [...intermediateMap.entries()].map(
    ([key, valuesSet]) => ([key, [...valuesSet]] as [string, string[]]),
  );

  return new Map(output);
};

export default getRelatedNodes;
