---
title: Pitch Class Sets
package: pcset
description: Compare collections of notes
---

A pitch class set is a no repeated collection (set) of notes without octaves (pitch classes).

Pitch classes are useful to identify musical structures (if two chords are related, for example)

```js
import { Pcset } from "tonal";
```

## Properties

### `Pcset.get`

`get(src: note[] | string | number)`

Given a collection of notes, a pitch class chroma string or a pitch class number, it returns a properties object with the following attributes:

- num: the set number. Each pitch class set can be represented by an unique name between 0 and 4096. Those are the possible combinations of 12 different elements (pitch classes)
- chroma: the set number as binary string
- intervals: the list of intervals **starting from C**
- length: the number of notes

Example:

```js
Pcset.get(["c", "d", "e"]);
// =>
// {
//   num: 2688,
//   chroma: "101010000000",
//   intervals: ["1P", "2M", "3M"],
//   length: 3
// }
```

It is possible to obtain the properties from chroma or set number. All this function calls returns the same object:

```js
Pcset.get(["c", "d", "e"]);
Pcset.get(2688);
Pcset.get("101010000000");
```

Several shorthands (`num`, `chroma`, intervals`) are provided:

```js
Pcset.chroma(["c", "d", "e"]); //=> "101010000000"
Pcset.num(["c", "d", "e"]); //=> 2192

// several set representations are accepted
Pcset.chroma(2192); //=> "101010000000"
Pcset.num("101010000000"); // => 2192
```

Intervals are always calculated from `C`:

```js
Pcset.intervals(["c", "d", "e"]); // => ["1P", "5P", "7M"]
Pcset.intervals(["D", "F", "A"]); // => ["2M", "4P", "6M"]
```

## Notes and intervals

### `Pcset.notes`

`notes(pcset: string | number | string[]) => string[]`

Given a pcset or a list of notes, it returns the sorted pitch class notes:

```js
Pcset.notes(["D3", "A3", "Bb3", "C4", "D4", "E4", "F4", "G4", "A4"]); // => ["C", "D", "E", "F", "G", "A", "Bb"]
Pcset.notes("101011010110"); // => ["C", "D", "E", "F", "G", "A", "Bb"]
```

## Querying

### `Pcset.isIncludedIn`

`isIncludedIn(parent: Set) => (note: string) => boolean`

Test if a note is included in the given set. This function is curried:

```js
const isInCTriad = isIncludedIn(["C", "E", "G"]);
isInCTriad("C4"); // => true
isInCTriad("C#4"); // => false
```

Keep in mind that enharmonics are included:

```js
isInCTriad("Fb"); // => true
```

### `Pcset.isSubsetOf`

`isSubsetOf(parent: Set) => (subset: Set) => boolean`

Test if a set is a subset of another. This function is curried

### `Pcset.isSupersetOf`

`isSupersetOf(subset: Set) => (parent: Set) => boolean`

Test if a set is a superset of another. This function is curried
