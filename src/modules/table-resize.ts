import Quill from 'quill';
import type { Parchment as TypeParchment } from 'quill';
import { getRelativeRect, tableColMinWidthPre, tableColMinWidthPx, tableRowMinWidthPx } from '../utils';
import type { TableResizeOptions } from '../utils';
import type TableUp from '..';
import type { TableColFormat, TableMainFormat, TableRowFormat } from '..';

export class TableResize {
  options: TableResizeOptions;
  root!: HTMLElement;
  tableMain: TableMainFormat;
  tableWrapper!: TypeParchment.Parent;
  resizeObserver!: ResizeObserver;
  tableCols: TableColFormat[] = [];
  tableRows: TableRowFormat[] = [];
  rowHeadWrapper: HTMLElement | null = null;
  colHeadWrapper: HTMLElement | null = null;
  scrollHandler: [HTMLElement, (e: Event) => void][] = [];

  constructor(public tableModule: TableUp, public table: HTMLElement, public quill: Quill, options: Partial<TableResizeOptions>) {
    this.options = this.resolveOptions(options);
    this.tableMain = Quill.find(this.table) as TableMainFormat;

    if (!this.tableMain) return;
    this.tableWrapper = this.tableMain.parent;
    if (!this.tableWrapper) return;

    this.tableCols = this.tableMain.getCols();
    this.tableRows = this.tableMain.getRows();
    this.root = this.quill.addContainer('ql-table-resizer');

    this.resizeObserver = new ResizeObserver(() => {
      this.showTool();
    });
    this.resizeObserver.observe(this.table);
  }

  resolveOptions(options: Partial<TableResizeOptions>) {
    return Object.assign({
      size: 12,
    }, options);
  }

  addScrollEvent(dom: HTMLElement, handle: (e: Event) => void) {
    dom.addEventListener('scroll', handle);
    this.scrollHandler.push([dom, handle]);
  }

  bindColDragEvent() {
    let tipColBreak: HTMLElement | null = null;
    let curColIndex = -1;
    const tableColHeads = Array.from(this.root.getElementsByClassName('ql-table-col-header')) as HTMLElement[];
    const tableColHeadSeparators = Array.from(this.root.getElementsByClassName('ql-table-col-separator')) as HTMLElement[];
    const appendTo = document.body;
    const handleMousemove = (e: MouseEvent) => {
      const rect = tableColHeads[curColIndex].getBoundingClientRect();
      const tableWidth = this.tableMain.domNode.getBoundingClientRect().width;
      let resX = e.clientX;

      if (this.tableMain.full) {
        // max width = current col.width + next col.width
        // if current col is last. max width = current col.width
        const minWidth = (tableColMinWidthPre / 100) * tableWidth;
        const maxRange = resX > rect.right
          ? tableColHeads[curColIndex + 1]
            ? tableColHeads[curColIndex + 1].getBoundingClientRect().right - minWidth
            : rect.right - minWidth
          : Infinity;
        const minRange = rect.x + minWidth;

        resX = Math.min(Math.max(resX, minRange), maxRange);
      }
      else {
        if (resX - rect.x < tableColMinWidthPx) {
          resX = rect.x + tableColMinWidthPx;
        }
      }
      tipColBreak!.style.left = `${resX}px`;
      tipColBreak!.dataset.w = String(resX - rect.x);
    };
    const handleMouseup = () => {
      const w = Number.parseInt(tipColBreak!.dataset.w!);
      if (this.tableMain.full) {
        let pre = (w / this.tableMain.domNode.getBoundingClientRect().width) * 100;
        const oldWidthPre = this.tableCols[curColIndex].width;
        if (pre < oldWidthPre) {
          // minus
          // if not the last col. add the reduced amount to the next col
          // if is the last col. add the reduced amount to the pre col
          pre = Math.max(tableColMinWidthPre, pre);
          const last = oldWidthPre - pre;
          if (this.tableCols[curColIndex + 1]) {
            tableColHeads[curColIndex + 1].style.width = `${this.tableCols[curColIndex + 1].width + last}%`;
            this.tableCols[curColIndex + 1].width = `${this.tableCols[curColIndex + 1].width + last}%`;
          }
          else if (this.tableCols[curColIndex - 1]) {
            tableColHeads[curColIndex - 1].style.width = `${this.tableCols[curColIndex - 1].width + last}%`;
            this.tableCols[curColIndex - 1].width = `${this.tableCols[curColIndex - 1].width + last}%`;
          }
          else {
            pre = 100;
          }
          tableColHeads[curColIndex].style.width = `${pre}%`;
          this.tableCols[curColIndex].width = `${pre}%`;
        }
        else {
          // magnify col
          // the last col can't magnify. control last but one minus to magnify last col
          if (this.tableCols[curColIndex + 1]) {
            const totalWidthNextPre = oldWidthPre + this.tableCols[curColIndex + 1].width;
            pre = Math.min(totalWidthNextPre - tableColMinWidthPre, pre);
            this.tableCols[curColIndex].width = `${pre}%`;
            this.tableCols[curColIndex + 1].width = `${totalWidthNextPre - pre}%`;

            tableColHeads[curColIndex].style.width = `${pre}%`;
            tableColHeads[curColIndex + 1].style.width = `${totalWidthNextPre - pre}%`;
          }
        }
      }
      else {
        this.tableMain.domNode.style.width = `${
          Number.parseFloat(this.tableMain.domNode.style.width)
          - Number.parseFloat(tableColHeads[curColIndex].style.width)
          + w
        }px`;
        tableColHeads[curColIndex].style.width = `${w}px`;
        this.tableCols[curColIndex].width = `${w}px`;
        this.colHeadWrapper!.style.width = `${this.tableMain.colWidthFillTable()}px`;
      }

      appendTo.removeChild(tipColBreak!);
      tipColBreak = null;
      curColIndex = -1;
      document.removeEventListener('mouseup', handleMouseup);
      document.removeEventListener('mousemove', handleMousemove);
    };
    const handleMousedown = (i: number, e: MouseEvent) => {
      document.addEventListener('mouseup', handleMouseup);
      document.addEventListener('mousemove', handleMousemove);
      curColIndex = i;

      const divDom = document.createElement('div');
      divDom.classList.add('ql-table-drag-line');
      divDom.classList.add('col');

      // set drag init width
      const fullWidth = this.tableMain.domNode.getBoundingClientRect().width;
      const colWidthAttr = Number.parseFloat(tableColHeads[curColIndex].style.width);
      const width = this.tableMain.full ? colWidthAttr / 100 * fullWidth : colWidthAttr;
      divDom.dataset.w = String(width);

      const tableRect = this.tableWrapper.domNode.getBoundingClientRect();
      Object.assign(divDom.style, {
        top: `${tableRect.y - this.options.size}px`,
        left: `${e.clientX}px`,
        height: `${tableRect.height + this.options.size}px`,
      });
      appendTo.appendChild(divDom);

      if (tipColBreak) appendTo.removeChild(tipColBreak);
      tipColBreak = divDom;
    };

    this.addScrollEvent(
      this.tableWrapper.domNode,
      () => {
        this.colHeadWrapper!.scrollLeft = this.tableWrapper.domNode.scrollLeft;
      },
    );

    for (const [i, el] of tableColHeadSeparators.entries()) {
      el.addEventListener('mousedown', handleMousedown.bind(this, i));
      // prevent drag
      el.addEventListener('dragstart', (e) => {
        e.preventDefault();
      });
    }
  }

  bindRowDragEvent() {
    let tipRowBreak: HTMLElement | null = null;
    let curRowIndex = -1;
    const tableRowHeads = Array.from(this.root.getElementsByClassName('ql-table-row-header')) as HTMLElement[];
    const tableRowHeadSeparators = Array.from(this.root.getElementsByClassName('ql-table-row-separator')) as HTMLElement[];
    const appendTo = document.body;
    const handleMousemove = (e: MouseEvent) => {
      const rect = tableRowHeads[curRowIndex].getBoundingClientRect();
      let resY = e.clientY;
      if (resY - rect.y < tableRowMinWidthPx) {
        resY = rect.y + tableRowMinWidthPx;
      }
      tipRowBreak!.style.top = `${resY}px`;
      tipRowBreak!.dataset.w = String(resY - rect.y);
    };
    const handleMouseup = () => {
      const w = Number.parseInt(tipRowBreak!.dataset.w!);

      tableRowHeads[curRowIndex].style.height = `${w}px`;
      this.tableRows[curRowIndex].setHeight(w);
      const tableWrapperRect = this.tableWrapper.domNode.getBoundingClientRect();
      this.rowHeadWrapper!.style.height = `${tableWrapperRect.height}px`;

      appendTo.removeChild(tipRowBreak!);
      tipRowBreak = null;
      curRowIndex = -1;
      document.removeEventListener('mouseup', handleMouseup);
      document.removeEventListener('mousemove', handleMousemove);
    };
    const handleMousedown = (i: number, e: MouseEvent) => {
      document.addEventListener('mouseup', handleMouseup);
      document.addEventListener('mousemove', handleMousemove);
      curRowIndex = i;

      const divDom = document.createElement('div');
      divDom.classList.add('ql-table-drag-line');
      divDom.classList.add('row');

      // set drag init width
      const height = tableRowHeads[curRowIndex].getBoundingClientRect().height;
      divDom.dataset.w = String(height);

      const tableRect = this.tableWrapper.domNode.getBoundingClientRect();
      Object.assign(divDom.style, {
        top: `${e.clientY}px`,
        left: `${tableRect.x - this.options.size}px`,
        width: `${tableRect.width + this.options.size}px`,
      });
      appendTo.appendChild(divDom);

      if (tipRowBreak) appendTo.removeChild(tipRowBreak);
      tipRowBreak = divDom;
    };

    for (const [i, el] of tableRowHeadSeparators.entries()) {
      el.addEventListener('mousedown', handleMousedown.bind(this, i));
      // prevent drag
      el.addEventListener('dragstart', (e) => {
        e.preventDefault();
      });
    }
  }

  showTool() {
    const tableMain = Quill.find(this.table) as TableMainFormat;
    if (!tableMain) return;
    this.root.innerHTML = '';
    const tableWrapperRect = this.tableWrapper.domNode.getBoundingClientRect();
    const rect = getRelativeRect(tableMain.domNode.getBoundingClientRect(), this.quill.root);
    const tableTop = tableMain.domNode.offsetTop;
    const rootScrollTop = this.quill.root.scrollTop;
    Object.assign(this.root.style, {
      top: `${tableTop - rootScrollTop}px`,
      left: `${rect.x + this.tableWrapper.domNode.scrollLeft}px`,
    });

    let colHeadStr = '';
    for (const col of this.tableCols) {
      let width = col.width + (tableMain.full ? '%' : 'px');
      if (!col.width) {
        width = `${col.domNode.getBoundingClientRect().width}px`;
      }
      colHeadStr += `<div class="ql-table-col-header" style="width: ${width}">
        <div class="ql-table-col-separator" style="height: ${tableWrapperRect.height + this.options.size - 3}px"></div>
      </div>`;
    }
    const colHeadWrapper = document.createElement('div');
    colHeadWrapper.classList.add('ql-table-col-wrapper');
    Object.assign(colHeadWrapper.style, {
      transform: `translateY(-${this.options.size}px)`,
      width: `${tableWrapperRect.width}px`,
      height: `${this.options.size}px`,
    });
    colHeadWrapper.innerHTML = colHeadStr;
    this.root.appendChild(colHeadWrapper);
    colHeadWrapper.scrollLeft = this.tableWrapper.domNode.scrollLeft;
    this.colHeadWrapper = colHeadWrapper;
    this.bindColDragEvent();

    let rowHeadStr = '';
    for (const row of this.tableRows) {
      const height = `${row.domNode.getBoundingClientRect().height}px`;
      rowHeadStr += `<div class="ql-table-row-header" style="height: ${height}">
        <div class="ql-table-row-separator" style="width: ${tableWrapperRect.width + this.options.size - 3}px"></div>
      </div>`;
    }
    const rowHeadWrapper = document.createElement('div');
    rowHeadWrapper.classList.add('ql-table-row-wrapper');
    Object.assign(rowHeadWrapper.style, {
      transform: `translateX(-${this.options.size}px)`,
      width: `${this.options.size}px`,
      height: `${tableWrapperRect.height}px`,
    });
    rowHeadWrapper.innerHTML = rowHeadStr;
    this.root.appendChild(rowHeadWrapper);
    this.rowHeadWrapper = rowHeadWrapper;
    this.bindRowDragEvent();
  }

  hideTool() {
    this.root.classList.add('ql-hidden');
  }

  destroy() {
    this.hideTool();
    this.resizeObserver.disconnect();
    for (const [dom, handle] of this.scrollHandler) {
      dom.removeEventListener('scroll', handle);
    }
    this.root.remove();
  }
}
