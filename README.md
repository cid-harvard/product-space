A customizable and interactive product space.

[![npm (scoped)](https://img.shields.io/npm/v/@cid-harvard/product-space.svg)](https://www.npmjs.com/package/@cid-harvard/product-space)

## Installation

To use this tool, follow these steps:

* [Download and install nodejs](https://nodejs.org/en/download/).
* Run `npm install -g @cid-harvard/product-space`.
* To launch the tool, run `product-space` from the command line.

## Data format

### Network layout

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

* The `id` must match the IDs contained in the network file.
* `longLabel` is optional.

[Click here](src/data/testMetadataSmall.json) for a sample.

### Main data

This dataset contains the actual data to be displayed (e.g. trade value for each product). It should be a JSON file containing an array of elements, each of which has this shape:

```typescript
interface IRawDatum {
  id: string;
  values?: number | number[];
  active: number | boolean;
}
```

* The `id` must match the IDs contained in the network file.
* `active` is used to grey out nodes e.g. when the RCA is less than 1. The value can be:
  * a `boolean` (`true` or `false` without quotes).
  * a number. This will be internally coerced into boolean values: 0 becomes `false` and non-zeros becomes `true`.
* `values` contains the values (usually trade) associated with each node for node sizing. It can be:

  * an array of numbers. This array can have zero, one or many elements depending on how many sizing options the user wants. Note that if the user has picked a non-zero number from the dropdown, say `n`, the `values` array for each node must contain at least `n` elements. Otherwise the network won't show up.

  * a single number. Internally, the tool converts it into an array of one element.
  * `undefined` or not specified at all (i.e. the key is absent). Internally, the tool converts it into an empty array.

[Click here](src/data/testDataSmall.json) for a sample with 2 values per node (e.g. one for world trade and the other country trade).
