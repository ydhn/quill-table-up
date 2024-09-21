import type { TableCellInnerFormat, TableUp } from '..';

export interface ToolOption {
  name: string;
  icon: string | ((tableModule: TableUp) => HTMLElement);
  tip?: string;
  isColorChoose?: boolean;
  handle: (tableModule: TableUp, selectedTds: TableCellInnerFormat[], e: Event | string) => void;
}
export interface ToolOptionBreak {
  name: 'break';
}
export type Tool = ToolOption | ToolOptionBreak;

export interface TableMenuOptions {
  tipText: boolean;
  tipTexts: Record<string, string>;
  tools: Tool[];
  contextmenu: boolean;
  localstorageKey: string;
};
export interface TableSelectionOptions {
  selectColor: string;
  tableMenu: TableMenuOptions;
}
export interface TableTextOptions {
  customBtnText?: string;
  confirmText?: string;
  cancelText?: string;
  rowText?: string;
  colText?: string;
  notPositiveNumberError?: string;
}
export interface TableResizeOptions {
  size: number;
}
// eslint-disable-next-line ts/no-empty-object-type
export interface TableResizeLineOptions {
}
export interface TableUpOptions {
  customSelect?: (tableModule: TableUp) => HTMLElement;
  full: boolean;
  customBtn: boolean;
  texts: TableTextOptions;
  selection?: TableSelectionOptions;
  resizer?: TableResizeOptions ;
  resizeLine?: TableResizeLineOptions;
}
export interface TableColValue {
  tableId: string;
  colId: string;
  width: string;
  full: boolean;
};
export interface TableCellValue {
  tableId: string;
  rowId: string;
  colId: string;
  rowspan: number;
  colspan: number;
  backgroundColor?: string;
  height?: number;
};
export interface TableRowValue {
  tableId: string;
  rowId: string;
}
export interface TableValue {
  tableId: string;
  full: boolean;
};

export interface RelactiveRect {
  x: number;
  y: number;
  x1: number;
  y1: number;
  width: number;
  height: number;
}

export type Constructor<T = any, U extends Array<any> = any[]> = new (...args: U) => T;
