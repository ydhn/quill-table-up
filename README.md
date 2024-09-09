# quill-table-up

Enhancement of quill table module

[demo](https://zzxming.github.io/quill-table-up/)

- [x] complete UI operation process
- [x] insert/delete row/column/table; merge/split cells
- [x] support insert header/list/video/image/code-block
- [x] control cells width/height/background color
- [x] line break in cells
- [x] not effect on other formats

## Usage

```sh
npm install quill-table-up
```

```js
import Quill from 'quill';
import TableUp from 'quill-table-up';
import 'quill-table-up/index.css';
// If using the default customSelect option. You need to import this css
import 'quill-table-up/table-creator.css';

Quill.register({ [`modules/${TableUp.moduleName}`]: TableUp }, true);
// or
// Quill.register({ 'modules/tableUp': TableUp }, true);

const quill = new Quill('#editor', {
  // ...
  modules: {
    //  ...
    toolbar: [
      // ...
      [ // use picker to enable the customSelect option
        { [TableUp.toolName]: [] }
        // or
        // { 'table-up-main': [] }
      ],
    ],
    [TableUp.moduleName]: {},
    // or
    // tableUp: {},
  },
});
```

## Options

### TableUp Options

| attribute    | description                                                                                                                             | type                                    | default        |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | -------------- |
| full         | if set `true`. width max will be 100%                                                                                                   | `boolean`                               | `true`         |
| customBtn    | display a custom button to custom row and column number add a table                                                                     | `boolean`                               | `false`        |
| texts        | the text used to create the table                                                                                                       | `TableTextOptions`                      | `defaultTexts` |
| customSelect | display a custom select to custom row and column number add a table. the DOM returned by the function will replace the default selector | `(tableModule: TableUp) => HTMLElement` | -              |
| selection    | moduel TableSelection options                                                                                                           | `TableSelection`                        | -              |
| resizer      | moduel TableResize options                                                                                                              | `TableResizeOptions`                    | -              |

<details>
  <summary> default value </summary>

```ts
const defaultTexts = {
  customBtnText: 'Custom',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  rowText: 'Row',
  colText: 'Column',
  notPositiveNumberError: 'Please enter a positive integer',
};
```

</details>

### TableSelection Options

| attribute   | description              | type               | default   |
| ----------- | ------------------------ | ------------------ | --------- |
| selectColor | selector border color    | `string`           | `#0589f3` |
| tableMenu   | module TableMenu options | `TableMenuOptions` | -         |

### TableMenu Options

| attribute       | description                                                                      | type                     | default                 |
| --------------- | -------------------------------------------------------------------------------- | ------------------------ | ----------------------- |
| tipText         | display tip text when hover icon                                                 | `boolean`                | `true`                  |
| tipTexts        | the text to replace tools tip text                                               | `Record<string, string>` | `{}`                    |
| localstorageKey | used color save localstorage key                                                 | `string`                 | `__table-bg-used-color` |
| tools           | display tip text when hover icon                                                 | `Tool[]`                 | `defaultTools`          |
| contextmenu     | table menu will display when selected at least one cell and right click on table | `boolean`                | `false`                 |

<details>
  <summary> types and default value </summary>

```ts
interface ToolOption {
  name: string;
  icon: string | ((tableModule: TableUp) => HTMLElement);
  tip?: string;
  isColorChoose?: boolean;
  handle: (tableModule: TableUp, selectedTds: TableCellInnerFormat[], e: Event | string) => void;
}
interface ToolOptionBreak {
  name: 'break';
}
type Tool = ToolOption | ToolOptionBreak;

const defaultTools = [
  {
    name: 'InsertTop',
    icon: InsertTop,
    tip: 'Insert a row above',
    handle: (tableModule) => {},
  },
  {
    name: 'InsertRight',
    icon: InsertRight,
    tip: 'Insert a column right',
    handle: (tableModule) => {},
  },
  {
    name: 'InsertBottom',
    icon: InsertBottom,
    tip: 'Insert a row below',
    handle: (tableModule) => {},
  },
  {
    name: 'InsertLeft',
    icon: InsertLeft,
    tip: 'Insert a column Left',
    handle: (tableModule) => {},
  },
  {
    name: 'break',
  },
  {

    name: 'MergeCell',
    icon: MergeCell,
    tip: 'Merge Cell',
    handle: (tableModule) => {},
  },
  {

    name: 'SplitCell',
    icon: SplitCell,
    tip: 'Split Cell',
    handle: (tableModule) => {},
  },
  {
    name: 'break',
  },
  {
    name: 'DeleteRow',
    icon: RemoveRow,
    tip: 'Delete Row',
    handle: (tableModule) => {},
  },
  {
    name: 'DeleteColumn',
    icon: RemoveColumn,
    tip: 'Delete Column',
    handle: (tableModule) => {},
  },
  {
    name: 'DeleteTable',
    icon: RemoveTable,
    tip: 'Delete table',
    handle: (tableModule) => {},
  },
  {
    name: 'break',
  },
  {
    name: 'BackgroundColor',
    icon: Color,
    isColorChoose: true,
    tip: 'Set background color',
    handle: (tableModule, selectedTds, color) => {},
  },
];
```

</details>

### TableResizer Options

| attribute | description             | type     | default |
| --------- | ----------------------- | -------- | ------- |
| size      | resizer width or height | `number` | `12`    |

## Overrides

if you need to rewrite quill origin `Block` or `Scroll` blot. you need to import from `quill-table-up`. beacuse module internal rewrite some functions, but those change only effect formats about table.

please read [source code](https://github.com/zzxming/quill-table-up/tree/master/src/formats/overrides) to know those change.

```ts
import { BlockOverride, ScrollOverride } from 'quill-table-up';

class ScrollBlot extends ScrollOverride {
  // ...
}
```
