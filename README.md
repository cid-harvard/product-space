## Installation
To use this tool, follow these steps:
- [Download and install nodejs](https://nodejs.org/en/download/).
- Run `npm install -g @cid-harvard/product-space`.
- To launch the tool, run `product-space` from the command line.

## Data format:

### Network layout:

This dataset specifies the position of the nodes and how they are connected via edges. It should be a JSON file containing an array of `edges` and `nodes`.

```typescript
interface ILayoutData {
  nodes: INode[];
  edges: IEdge[];
}
```
Each node has the following shape:

```typescript
interface INode {
  id: string;
  x: number;
  y: number;
}
```

Each edge has the following shape:

```typescript
interface IEdge {
  source: string;
  target: string;
}
```

[Click here](src/data/testLayoutSmall.json) for a sample.

### Metadata:

This dataset describes the information associated with each node: name and color. It should be a JSON file containing an array of elements, each of which has this shape:

```typescript
interface IMetadatum {
  id: string;
  shortLabel: string;
  longLabel?: string;
  color: string;
}
```

- The `id` must match the IDs contained in the network file.
-`longLabel` is optional.

[Click here](src/data/testMetadataSmall.json) for a sample.

### Main data
This dataset contains the actual data to be displayed (e.g. trade value for each product).
It should be a JSON file containing an array of elements, each of which has this shape:

```typescript
interface IDatum {
  id: string;
  values: number[];
  active: boolean;
}
```
- The `id` must match the IDs contained in the network file.
- `active` is used to grey out nodes e.g. when the RCA is less than 1.
- `values` is an array that contains the sizing information for each node, typically trade value.
It can have zero, one or many elements depending on how many sizing options the user wants.
Note that if the user has picked a non-zero number from the dropdown, say `n`, the `values` array for each node must contain at least `n` elements. Otherwise the network won't show up.

[Click here](src/data/testDataSmall.json) for a sample with 2 values per node (e.g. one for world trade and the other country trade).
