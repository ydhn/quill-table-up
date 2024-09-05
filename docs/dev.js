(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('quill')) :
    typeof define === 'function' && define.amd ? define(['exports', 'quill'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.TableUp = {}, global.Quill));
})(this, (function (exports, Quill) { 'use strict';

    const createInputItem = (label, options) => {
        options.type || (options.type = 'text');
        options.value || (options.value = '');
        const inputItem = document.createElement('div');
        inputItem.classList.add('input__item');
        if (label) {
            const inputLabel = document.createElement('span');
            inputLabel.classList.add('input__label');
            inputLabel.textContent = label;
            inputItem.appendChild(inputLabel);
        }
        const inputInput = document.createElement('div');
        inputInput.classList.add('input__input');
        const input = document.createElement('input');
        for (const key in options) {
            input.setAttribute(key, options[key]);
        }
        if (options.max || options.min) {
            input.addEventListener('blur', () => {
                if (options.max && options.max <= Number(input.value)) {
                    input.value = String(options.max);
                }
                if (options.min && options.min >= Number(input.value)) {
                    input.value = String(options.min);
                }
            });
        }
        inputInput.appendChild(input);
        inputItem.appendChild(inputInput);
        input.addEventListener('focus', () => {
            inputInput.classList.add('focus');
        });
        input.addEventListener('blur', () => {
            inputInput.classList.remove('focus');
        });
        const errorTip = (msg) => {
            let errorTip;
            if (inputInput.classList.contains('error')) {
                errorTip = inputInput.querySelector('.input__error-tip');
            }
            else {
                errorTip = document.createElement('span');
                errorTip.classList.add('input__error-tip');
                inputInput.appendChild(errorTip);
            }
            errorTip.textContent = msg;
            inputInput.classList.add('error');
            const removeError = () => {
                inputInput.classList.remove('error');
                errorTip.remove();
            };
            return { removeError };
        };
        return { item: inputItem, input, errorTip };
    };
    let zindex = 8000;
    const createDialog = ({ child, target = document.body, beforeClose = () => { } } = {}) => {
        const appendTo = target;
        const dialog = document.createElement('div');
        dialog.classList.add('dialog');
        dialog.style.zIndex = String(zindex);
        const overlay = document.createElement('div');
        overlay.classList.add('dialog__overlay');
        dialog.appendChild(overlay);
        if (child) {
            const content = document.createElement('div');
            content.classList.add('dialog__content');
            content.appendChild(child);
            overlay.appendChild(content);
            content.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
        const originOverflow = getComputedStyle(appendTo).overflow;
        appendTo.style.overflow = 'hidden';
        appendTo.appendChild(dialog);
        const close = () => {
            beforeClose();
            dialog.remove();
            appendTo.style.overflow = originOverflow;
        };
        dialog.addEventListener('click', close);
        zindex += 1;
        return { dialog, close };
    };
    const showTableCreator = async (options = {}) => {
        const box = document.createElement('div');
        box.classList.add('table-creator');
        const inputContent = document.createElement('div');
        inputContent.classList.add('table-creator__input');
        const { item: rowItem, input: rowInput, errorTip: rowErrorTip, } = createInputItem(options.rowText || '行数', { type: 'number', value: String(options.row || ''), max: 99 });
        const { item: colItem, input: colInput, errorTip: colErrorTip, } = createInputItem(options.colText || '列数', { type: 'number', value: String(options.col || ''), max: 99 });
        inputContent.appendChild(rowItem);
        inputContent.appendChild(colItem);
        box.appendChild(inputContent);
        const control = document.createElement('div');
        control.classList.add('table-creator__control');
        const confirmBtn = document.createElement('button');
        confirmBtn.classList.add('table-creator__btn', 'confirm');
        confirmBtn.textContent = options.confirmText || 'Confirm';
        const cancelBtn = document.createElement('button');
        cancelBtn.classList.add('table-creator__btn', 'cancel');
        cancelBtn.textContent = options.cancelText || 'Cancel';
        control.appendChild(confirmBtn);
        control.appendChild(cancelBtn);
        box.appendChild(control);
        return new Promise((resolve, reject) => {
            const { close } = createDialog({ child: box, beforeClose: reject });
            confirmBtn.addEventListener('click', async () => {
                const row = Number(rowInput.value);
                const col = Number(colInput.value);
                if (Number.isNaN(row) || row <= 0) {
                    return rowErrorTip(options.notPositiveNumberError || '请输入正整数');
                }
                if (Number.isNaN(col) || col <= 0) {
                    return colErrorTip(options.notPositiveNumberError || '请输入正整数');
                }
                resolve({ row, col });
                close();
            });
            cancelBtn.addEventListener('click', () => {
                close();
            });
        });
    };
    const createSelectBox = (options = {}) => {
        const selectDom = document.createElement('div');
        selectDom.classList.add('select-box');
        const selectBlock = document.createElement('div');
        selectBlock.classList.add('select-box__block');
        for (let r = 0; r < (options.row || 8); r++) {
            for (let c = 0; c < (options.col || 8); c++) {
                const selectItem = document.createElement('div');
                selectItem.classList.add('select-box__item');
                selectItem.dataset.row = String(r + 1);
                selectItem.dataset.col = String(c + 1);
                selectBlock.appendChild(selectItem);
            }
        }
        const updateSelectBlockItems = () => {
            const { row, col } = selectDom.dataset;
            for (const item of Array.from(selectBlock.querySelectorAll('.active'))) {
                item.classList.remove('active');
            }
            if (!row || !col)
                return;
            const childs = Array.from(selectBlock.children);
            for (let i = 0; i < childs.length; i++) {
                const { row: childRow, col: childCol } = childs[i].dataset;
                if (childRow > row && childCol > col) {
                    return;
                }
                if (childRow <= row && childCol <= col) {
                    childs[i].classList.add('active');
                }
                else {
                    childs[i].classList.remove('active');
                }
            }
        };
        selectBlock.addEventListener('mousemove', (e) => {
            if (!e.target)
                return;
            const { row, col } = e.target.dataset;
            if (!row || !col)
                return;
            selectDom.dataset.row = row;
            selectDom.dataset.col = col;
            updateSelectBlockItems();
        });
        selectBlock.addEventListener('mouseleave', () => {
            selectDom.removeAttribute('data-row');
            selectDom.removeAttribute('data-col');
            updateSelectBlockItems();
        });
        selectBlock.addEventListener('click', () => {
            const { row, col } = selectDom.dataset;
            if (!row || !col)
                return;
            options.onSelect && options.onSelect(Number(row), Number(col));
        });
        selectDom.appendChild(selectBlock);
        if (options.isCustom) {
            const texts = options.texts || {};
            const selectCustom = document.createElement('div');
            selectCustom.classList.add('select-box__custom');
            selectCustom.textContent = texts.customBtnText || '自定义行列数';
            selectCustom.addEventListener('click', async () => {
                const res = await showTableCreator(texts);
                if (res) {
                    options.onSelect && options.onSelect(res.row, res.col);
                }
            });
            selectDom.appendChild(selectCustom);
        }
        return selectDom;
    };
    const createToolTip = (target, options = {}) => {
        const { msg = '', delay = 0 } = options;
        const wrapper = document.createElement('div');
        wrapper.classList.add('tool-tip');
        wrapper.appendChild(target);
        if (msg) {
            const tip = document.createElement('div');
            tip.classList.add('tool-tip__text');
            tip.classList.add('hidden');
            tip.textContent = msg;
            wrapper.appendChild(tip);
            let timer;
            wrapper.addEventListener('mouseenter', () => {
                if (timer)
                    clearTimeout(timer);
                timer = setTimeout(() => {
                    tip.classList.add('block');
                    tip.classList.remove('hidden');
                    tip.classList.remove('right-out');
                    tip.classList.remove('left-out');
                    setTimeout(() => {
                        const rect = tip.getBoundingClientRect();
                        if (rect.right > window.innerWidth) {
                            tip.classList.add('right-out');
                        }
                        else {
                            tip.classList.remove('right-out');
                        }
                        if (rect.left < 0) {
                            tip.classList.add('left-out');
                        }
                        else {
                            tip.classList.remove('left-out');
                        }
                    }, 0);
                }, delay);
            });
            wrapper.addEventListener('mouseleave', () => {
                if (timer)
                    clearTimeout(timer);
                timer = setTimeout(() => {
                    tip.classList.add('hidden');
                    tip.addEventListener('transitionend', () => {
                        tip.classList.remove('block');
                    }, { once: true });
                    timer = null;
                }, delay);
            });
        }
        return wrapper;
    };

    // eslint-disable-next-line ts/ban-types
    const isFunction = (val) => typeof val === 'function';
    const isArray = Array.isArray;
    const randomId = () => Math.random().toString(36).slice(2);
    const debounce = (fn, delay) => {
        let timestamp;
        return function (...args) {
            if (timestamp) {
                clearTimeout(timestamp);
            }
            timestamp = setTimeout(() => {
                fn.apply(this, args);
            }, delay);
        };
    };
    function isRectanglesIntersect(a, b, tolerance = 4) {
        const { x: minAx, y: minAy, x1: maxAx, y1: maxAy } = a;
        const { x: minBx, y: minBy, x1: maxBx, y1: maxBy } = b;
        const notOverlapX = maxAx <= minBx + tolerance || minAx + tolerance >= maxBx;
        const notOverlapY = maxAy <= minBy + tolerance || minAy + tolerance >= maxBy;
        return !(notOverlapX || notOverlapY);
    }
    function getRelativeRect(targetRect, container) {
        const containerRect = container.getBoundingClientRect();
        return {
            x: targetRect.x - containerRect.x - container.scrollLeft,
            y: targetRect.y - containerRect.y - container.scrollTop,
            x1: targetRect.x - containerRect.x - container.scrollLeft + targetRect.width,
            y1: targetRect.y - containerRect.y - container.scrollTop + targetRect.height,
            width: targetRect.width,
            height: targetRect.height,
        };
    }
    function findParentBlot(blot, targetBlotName) {
        let target = blot.parent;
        while (target && target.statics.blotName !== targetBlotName && target !== blot.scroll) {
            target = target.parent;
        }
        if (target === blot.scroll) {
            throw new Error(`${blot.statics.blotName} must be a child of ${targetBlotName}`);
        }
        return target;
    }

    const blotName = {
        container: 'container',
        tableWrapper: 'table-up-wrapper',
        tableMain: 'table-up-main',
        tableColgroup: 'table-up-colgroup',
        tableCol: 'table-up-col',
        tableBody: 'table-up-body',
        tableRow: 'table-up-row',
        tableCell: 'table-up-cell',
        tableCellInner: 'table-up-cell-inner',
    };
    const tabbleToolName = 'table-up-main';
    const tableColMinWidthPre = 3;
    const tableColMinWidthPx = 26;
    const tableRowMinWidthPx = 36;

    const Parchment$1 = Quill.import('parchment');
    const Container = Quill.import('blots/container');
    const Block$2 = Quill.import('blots/block');
    const BlockEmbed$1 = Quill.import('blots/block/embed');
    class ContainerFormat extends Container {
        static blotName = blotName.container;
        static tagName = 'container';
        static scope = Parchment$1.Scope.BLOCK_BLOT;
        static allowedChildren = [Block$2, BlockEmbed$1, Container];
        static requiredContainer;
        static defaultChild;
        clearDeltaCache() {
            // eslint-disable-next-line unicorn/no-array-for-each
            this.children.forEach((child) => {
                child.cache = {};
            });
        }
        insertBefore(blot, ref) {
            // when block line remove will merge format. but in TableCellInner will get TableCellInner format
            // that will insert a new TableCellInner line but not a Block line
            // detail to see Quill module -> Keyboard -> handleBackspace
            if (blot.statics.blotName === this.statics.blotName && blot.children.length > 0) {
                super.insertBefore(blot.children.head, ref);
            }
            else {
                super.insertBefore(blot, ref);
            }
        }
    }

    class TableWrapperFormat extends ContainerFormat {
        static blotName = blotName.tableWrapper;
        static tagName = 'p';
        static className = 'ql-table-wrapper';
        static create(value) {
            const node = super.create();
            node.dataset.tableId = value;
            node.addEventListener('dragstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, true);
            // 不允许拖拽进 table
            node.addEventListener('drop', (e) => {
                e.preventDefault();
            });
            // 修改拖拽进入时的鼠标样式
            node.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'none';
            });
            return node;
        }
        get tableId() {
            return this.domNode.dataset.tableId;
        }
        insertBefore(blot, ref) {
            if (blot.statics.blotName === this.statics.blotName) {
                super.insertBefore(blot.children.head, ref);
            }
            else if (this.statics.allowedChildren.some((child) => child.blotName === blot.statics.blotName)) {
                super.insertBefore(blot, ref);
            }
            else {
                // 非允许子 blot, ref 为 null 是插入头, 否则插入尾
                if (ref) {
                    this.prev ? this.prev.insertBefore(blot, null) : this.parent.insertBefore(blot, this);
                }
                else {
                    this.next ? this.next.insertBefore(blot, ref) : this.parent.appendChild(blot);
                }
            }
        }
        checkMerge() {
            const next = this.next;
            return (next !== null
                && next.statics.blotName === this.statics.blotName
                && next.domNode.tagName === this.domNode.tagName
                && next.domNode.dataset.tableId === this.tableId);
        }
        deleteAt(index, length) {
            super.deleteAt(index, length);
            // 删除 table 时隐藏当前 table 的 tooltip
            document.querySelector(`.ql-table-tooltip[data-table-id="${this.tableId}"]`)?.classList?.add('ql-hidden');
        }
    }

    const Block$1 = Quill.import('blots/block');
    const BlockEmbed = Quill.import('blots/block/embed');
    class TableCellInnerFormat extends ContainerFormat {
        static blotName = blotName.tableCellInner;
        static tagName = 'p';
        static className = 'ql-table-cell-inner';
        static defaultChild = Block$1;
        static create(value) {
            const { tableId, rowId, colId, rowspan, colspan, backgroundColor, height } = value;
            const node = super.create();
            node.dataset.tableId = tableId;
            node.dataset.rowId = rowId;
            node.dataset.colId = colId;
            node.dataset.rowspan = String(rowspan || 1);
            node.dataset.colspan = String(colspan || 1);
            height && height > 0 && (node.dataset.height = String(height));
            backgroundColor && (node.dataset.backgroundColor = backgroundColor);
            return node;
        }
        // this issue also effect TableColFormat
        // make sure cell have at least one length. Otherwise will get wrong insert index when table inserting
        // when inserting cell not have defaultChild. that mean TableCellInnerFormat.length() === 0
        // quill2.x deleted replace method. if not want rewrite method length. need to rewrite method Block.repalceWith
        // rewrite: when replacement instanceof ParentBlot. change moveChildren to wrap
        // but length() >= 1 maybe have some bugs. if have bug. change Container to Block
        length() {
            return super.length() + 1;
        }
        attributesList = new Set(['table-id', 'row-id', 'col-id', 'rowspan', 'colspan', 'background-color', 'height']);
        setFormatValue(name, value) {
            if (!this.attributesList.has(name))
                return;
            const attrName = `data-${name}`;
            if (value) {
                this.domNode.setAttribute(attrName, value);
            }
            else {
                this.domNode.removeAttribute(attrName);
            }
            this.clearDeltaCache();
        }
        get tableId() {
            return this.domNode.dataset.tableId;
        }
        get rowId() {
            return this.domNode.dataset.rowId;
        }
        set rowId(value) {
            this.parent && (this.parent.rowId = value);
            this.setFormatValue('row-id', value);
        }
        get colId() {
            return this.domNode.dataset.colId;
        }
        set colId(value) {
            this.parent && (this.parent.colId = value);
            this.setFormatValue('col-id', value);
        }
        get rowspan() {
            return Number(this.domNode.dataset.rowspan);
        }
        set rowspan(value) {
            this.parent && (this.parent.rowspan = value);
            this.setFormatValue('rowspan', value);
        }
        get colspan() {
            return Number(this.domNode.dataset.colspan);
        }
        set colspan(value) {
            this.parent && (this.parent.colspan = value);
            this.setFormatValue('colspan', value);
        }
        get backgroundColor() {
            return this.domNode.dataset.backgroundColor || '';
        }
        set backgroundColor(value) {
            this.parent && (this.parent.backgroundColor = value);
            this.setFormatValue('background-color', value);
        }
        get height() {
            return Number(this.domNode.dataset.height) || 0;
        }
        set height(value) {
            this.parent && (this.parent.height = Number(value));
            this.setFormatValue('height', value);
        }
        getColumnIndex() {
            const table = findParentBlot(this, blotName.tableMain);
            return table.getColIds().indexOf(this.colId);
        }
        formatAt(index, length, name, value) {
            if (this.children.length === 0) {
                this.appendChild(this.scroll.create(this.statics.defaultChild.blotName));
            }
            super.formatAt(index, length, name, value);
        }
        formats() {
            const { tableId, rowId, colId, rowspan, colspan, backgroundColor, height } = this;
            const value = {
                tableId,
                rowId,
                colId,
                rowspan,
                colspan,
                height,
            };
            backgroundColor && (value.backgroundColor = backgroundColor);
            return {
                [this.statics.blotName]: value,
            };
        }
        optimize(context) {
            const parent = this.parent;
            const { tableId, colId, rowId, rowspan, colspan, backgroundColor, height } = this;
            // handle BlockEmbed to insert tableCellInner when setContents
            if (this.prev && this.prev instanceof BlockEmbed) {
                const afterBlock = this.scroll.create('block');
                this.appendChild(this.prev);
                this.appendChild(afterBlock);
            }
            if (parent !== null && parent.statics.blotName !== blotName.tableCell) {
                // insert a mark blot to make sure table insert index
                const marker = this.scroll.create('block');
                parent.insertBefore(marker, this.next);
                const tableWrapper = this.scroll.create(blotName.tableWrapper, tableId);
                const table = this.scroll.create(blotName.tableMain, tableId);
                const tableBody = this.scroll.create(blotName.tableBody);
                const tr = this.scroll.create(blotName.tableRow, rowId);
                const td = this.scroll.create(blotName.tableCell, {
                    tableId,
                    rowId,
                    colId,
                    rowspan,
                    colspan,
                    backgroundColor,
                    height,
                });
                td.appendChild(this);
                tr.appendChild(td);
                tableBody.appendChild(tr);
                table.appendChild(tableBody);
                tableWrapper.appendChild(table);
                marker.replaceWith(tableWrapper);
            }
            super.optimize(context);
        }
    }

    class TableRowFormat extends ContainerFormat {
        static blotName = blotName.tableRow;
        static tagName = 'tr';
        static className = 'ql-table-row';
        static create(value) {
            const node = super.create();
            node.dataset.rowId = value;
            return node;
        }
        checkMerge() {
            const next = this.next;
            return (next !== null
                && next.statics.blotName === this.statics.blotName
                && next.domNode.dataset.rowId === this.rowId);
        }
        get rowId() {
            return this.domNode.dataset.rowId;
        }
        setHeight(value) {
            this.foreachCellInner((cellInner) => {
                cellInner.height = value;
            });
        }
        // insert cell at index
        // return the minus skip column number
        // [2, 3]. means next line should skip 2 columns. next next line skip 3 columns
        insertCell(targetIndex, value) {
            const skip = [];
            const next = this.children.iterator();
            let index = 0;
            let cur;
            while ((cur = next())) {
                index += cur.colspan;
                if (index > targetIndex)
                    break;
                if (cur.rowspan !== 1) {
                    for (let i = 0; i < cur.rowspan - 1; i++) {
                        skip[i] = (skip[i] || 0) + cur.colspan;
                    }
                }
            }
            if (cur && index - cur.colspan < targetIndex) {
                const tableCell = cur.getCellInner();
                tableCell.colspan += 1;
                if (cur.rowspan !== 1) {
                    skip.skipRowNum = cur.rowspan - 1;
                }
            }
            else {
                const tableCell = this.scroll.create(blotName.tableCell, value);
                const tableCellInner = this.scroll.create(blotName.tableCellInner, value);
                const block = this.scroll.create('block');
                block.appendChild(this.scroll.create('break'));
                tableCellInner.appendChild(block);
                tableCell.appendChild(tableCellInner);
                this.insertBefore(tableCell, cur);
            }
            return skip;
        }
        getCellByColumIndex(stopIndex) {
            const skip = [];
            let cur = null;
            let cellEndIndex = 0;
            if (stopIndex < 0)
                return [cur, cellEndIndex, skip];
            const next = this.children.iterator();
            while ((cur = next())) {
                cellEndIndex += cur.colspan;
                if (cur.rowspan !== 1) {
                    for (let i = 0; i < cur.rowspan - 1; i++) {
                        skip[i] = (skip[i] || 0) + cur.colspan;
                    }
                }
                if (cellEndIndex > stopIndex)
                    break;
            }
            return [cur, cellEndIndex, skip];
        }
        removeCell(targetIndex) {
            if (targetIndex < 0)
                return [];
            const columnIndexData = this.getCellByColumIndex(targetIndex);
            const [cur, index] = columnIndexData;
            const skip = columnIndexData[2];
            if (!cur)
                return skip;
            if (index - cur.colspan < targetIndex || cur.colspan > 1) {
                const [tableCell] = cur.descendants(TableCellInnerFormat);
                if (cur.colspan !== 1 && targetIndex === index - cur.colspan) {
                    // if delete index is cell start index. update cell colId to next colId
                    const tableBlot = findParentBlot(this, blotName.tableMain);
                    const colIds = tableBlot.getColIds();
                    tableCell.colId = colIds[colIds.indexOf(tableCell.colId) + 1];
                }
                if (cur.rowspan !== 1) {
                    skip.skipRowNum = cur.rowspan - 1;
                }
                tableCell.colspan -= 1;
            }
            else {
                cur.remove();
            }
            return skip;
        }
        foreachCellInner(func) {
            const next = this.children.iterator();
            let i = 0;
            let cur;
            while ((cur = next())) {
                const [tableCell] = cur.descendants(TableCellInnerFormat);
                if (func(tableCell, i++))
                    break;
            }
        }
    }

    const Block = Quill.import('blots/block');
    // const BlockEmbed = Quill.import('blots/block/embed') as TypeParchment.BlotConstructor;
    // if can make sure user won't focus in col. use BlockEmbed is better
    class TableColFormat extends ContainerFormat {
        scroll;
        domNode;
        static blotName = blotName.tableCol;
        static tagName = 'col';
        static defaultChild = Block;
        length() {
            return 1;
        }
        static create(value) {
            const { width, tableId, colId, full } = value;
            const node = super.create();
            node.setAttribute('width', `${Number.parseFloat(width)}${full ? '%' : 'px'}`);
            full && (node.dataset.full = String(full));
            node.dataset.tableId = tableId;
            node.dataset.colId = colId;
            node.setAttribute('contenteditable', 'false');
            return node;
        }
        constructor(scroll, domNode) {
            super(scroll, domNode);
            this.scroll = scroll;
            this.domNode = domNode;
        }
        get width() {
            const width = this.domNode.getAttribute('width');
            return Number.parseFloat(width);
        }
        set width(value) {
            const width = Number.parseFloat(value);
            this.domNode.setAttribute('width', `${width}${this.full ? '%' : 'px'}`);
            this.clearDeltaCache();
        }
        get tableId() {
            return this.domNode.dataset.tableId;
        }
        get colId() {
            return this.domNode.dataset.colId;
        }
        get full() {
            return Object.hasOwn(this.domNode.dataset, 'full');
        }
        formats() {
            const { tableId, colId, width, full } = this;
            return {
                [this.statics.blotName]: {
                    tableId,
                    colId,
                    width,
                    full,
                },
            };
        }
        checkMerge() {
            const next = this.next;
            const { tableId, colId } = this;
            return (next !== null
                && next.statics.blotName === this.statics.blotName
                && next.domNode.dataset.tableId === tableId
                && next.domNode.dataset.colId === colId);
        }
        optimize(context) {
            const parent = this.parent;
            if (parent != null && parent.statics.blotName !== blotName.tableColgroup) {
                const marker = this.scroll.create('block');
                this.parent.insertBefore(marker, this.next);
                const tableWrapper = this.scroll.create(blotName.tableWrapper, this.tableId);
                const table = this.scroll.create(blotName.tableMain, this.tableId);
                this.full && (table.full = true);
                const tableColgroup = this.scroll.create(blotName.tableColgroup);
                tableColgroup.appendChild(this);
                table.appendChild(tableColgroup);
                tableWrapper.appendChild(table);
                marker.replaceWith(tableWrapper);
            }
            super.optimize(context);
        }
    }

    class TableMainFormat extends ContainerFormat {
        static blotName = blotName.tableMain;
        static tagName = 'table';
        constructor(scroll, domNode) {
            super(scroll, domNode);
            setTimeout(() => {
                this.colWidthFillTable();
            }, 0);
        }
        static create(value) {
            const node = super.create();
            node.dataset.tableId = value;
            node.classList.add('ql-table');
            node.setAttribute('cellpadding', '0');
            node.setAttribute('cellspacing', '0');
            return node;
        }
        colWidthFillTable() {
            if (this.full)
                return;
            const cols = this.getCols();
            if (!cols)
                return;
            const colsWidth = cols.reduce((sum, col) => col.width + sum, 0);
            if (colsWidth === 0 || Number.isNaN(colsWidth) || this.full)
                return null;
            this.domNode.style.width = `${colsWidth}px`;
            return colsWidth;
        }
        get tableId() {
            return this.domNode.dataset.tableId;
        }
        get full() {
            return Object.hasOwn(this.domNode.dataset, 'full');
        }
        set full(value) {
            this.domNode[value ? 'setAttribute' : 'removeAttribute']('data-full', '');
        }
        getRows() {
            return this.descendants(TableRowFormat);
        }
        getRowIds() {
            return this.getRows().map(d => d.rowId);
        }
        getCols() {
            return this.descendants(TableColFormat);
        }
        getColIds() {
            return this.getCols().map(d => d.colId);
        }
        checkMerge() {
            const next = this.next;
            return (next !== null
                && next.statics.blotName === this.statics.blotName
                && next.domNode.tagName === this.domNode.tagName
                && next.domNode.dataset.tableId === this.tableId);
        }
    }

    class TableColgroupFormat extends ContainerFormat {
        static blotName = blotName.tableColgroup;
        static tagName = 'colgroup';
        deleteAt(index, length) {
            if (index === 0 && length === this.length()) {
                return this.parent.remove();
            }
            super.deleteAt(index, length);
        }
        findCol(index) {
            const next = this.children.iterator();
            let i = 0;
            let cur;
            while ((cur = next())) {
                if (i === index) {
                    break;
                }
                i++;
            }
            return cur;
        }
        insertColByIndex(index, value) {
            const table = this.parent;
            if (!(table instanceof TableMainFormat)) {
                throw new TypeError('TableColgroupFormat should be child of TableFormat');
            }
            const col = this.findCol(index);
            const tableCellInner = this.scroll.create(blotName.tableCol, value);
            if (table.full) {
                // TODO: first minus column should be near by
                const next = this.children.iterator();
                let cur;
                while ((cur = next())) {
                    if (cur.width - tableCellInner.width >= tableColMinWidthPre) {
                        cur.width -= tableCellInner.width;
                        break;
                    }
                }
            }
            this.insertBefore(tableCellInner, col);
        }
        removeColByIndex(index) {
            const table = this.parent;
            if (!(table instanceof TableMainFormat)) {
                throw new TypeError('TableColgroupFormat should be child of TableMainFormat');
            }
            const col = this.findCol(index);
            if (col) {
                if (col.next) {
                    col.next.width += col.width;
                }
                else if (col.prev) {
                    col.prev.width += col.width;
                }
                col.remove();
            }
        }
    }

    class TableBodyFormat extends ContainerFormat {
        static blotName = blotName.tableBody;
        static tagName = 'tbody';
        checkMerge() {
            const next = this.next;
            return (next !== null
                && next.statics.blotName === this.statics.blotName);
        }
        deleteAt(index, length) {
            if (index === 0 && length === this.length()) {
                return this.parent.remove();
            }
            this.children.forEachAt(index, length, (child, offset, length) => {
                child.deleteAt(offset, length);
            });
        }
        // insert row at index
        insertRow(targetIndex) {
            const tableBlot = findParentBlot(this, blotName.tableMain);
            if (!tableBlot)
                return;
            // get all column id. exclude the columns of the target index row with rowspan
            const colIds = tableBlot.getColIds();
            const rows = this.descendants(TableRowFormat);
            const insertColIds = new Set(colIds);
            let index = 0;
            for (const row of rows) {
                if (index === targetIndex)
                    break;
                row.foreachCellInner((cell) => {
                    if (index + cell.rowspan > targetIndex) {
                        cell.rowspan += 1;
                        insertColIds.delete(cell.colId);
                        // colspan cell need remove all includes colId
                        if (cell.colspan !== 1) {
                            const colIndex = colIds.indexOf(cell.colId);
                            for (let i = 0; i < cell.colspan - 1; i++) {
                                insertColIds.delete(colIds[colIndex + i + 1]);
                            }
                        }
                    }
                });
                index += 1;
            }
            // append new row
            const rowId = randomId();
            const tr = this.scroll.create(blotName.tableRow, rowId);
            for (const colId of insertColIds) {
                const td = this.scroll.create(blotName.tableCell, {
                    rowId,
                    colId,
                    rowspan: 1,
                    colspan: 1,
                });
                const tdInner = this.scroll.create(blotName.tableCellInner, {
                    tableId: tableBlot.tableId,
                    rowId,
                    colId,
                    rowspan: 1,
                    colspan: 1,
                });
                const block = this.scroll.create('block');
                block.appendChild(this.scroll.create('break'));
                tdInner.appendChild(block);
                td.appendChild(tdInner);
                tr.appendChild(td);
            }
            this.insertBefore(tr, rows[targetIndex] || null);
        }
    }

    class TableCellFormat extends ContainerFormat {
        static blotName = blotName.tableCell;
        static tagName = 'td';
        static className = 'ql-table-cell';
        __rect;
        static create(value) {
            const { tableId, rowId, colId, rowspan, colspan, backgroundColor, height } = value;
            const node = super.create();
            node.dataset.tableId = tableId;
            node.dataset.rowId = rowId;
            node.dataset.colId = colId;
            node.setAttribute('rowspan', String(rowspan || 1));
            node.setAttribute('colspan', String(colspan || 1));
            backgroundColor && (node.style.backgroundColor = backgroundColor);
            height && (node.setAttribute('height', String(height)));
            return node;
        }
        get tableId() {
            return this.domNode.dataset.tableId;
        }
        get rowId() {
            return this.domNode.dataset.rowId;
        }
        set rowId(value) {
            this.domNode.dataset.rowId = value;
        }
        get colId() {
            return this.domNode.dataset.colId;
        }
        set colId(value) {
            this.domNode.dataset.colId = value;
        }
        get rowspan() {
            return Number(this.domNode.getAttribute('rowspan'));
        }
        set rowspan(value) {
            this.domNode.setAttribute('rowspan', String(value));
        }
        get colspan() {
            return Number(this.domNode.getAttribute('colspan'));
        }
        set colspan(value) {
            this.domNode.setAttribute('colspan', String(value));
        }
        get backgroundColor() {
            return this.domNode.dataset.backgroundColor || '';
        }
        set backgroundColor(value) {
            Object.assign(this.domNode.style, {
                backgroundColor: value,
            });
        }
        get height() {
            return Number(this.domNode.getAttribute('height')) || 0;
        }
        set height(value) {
            if (value > 0) {
                this.domNode.setAttribute('height', String(value));
            }
        }
        getCellInner() {
            return this.descendants(TableCellInnerFormat)[0];
        }
        checkMerge() {
            const { colId, rowId } = this.domNode.dataset;
            const next = this.next;
            return (next !== null
                && next.statics.blotName === this.statics.blotName
                && next.domNode.dataset.rowId === rowId
                && next.domNode.dataset.colId === colId);
        }
        optimize(context) {
            const { tableId, colId, rowId, colspan, rowspan, height, backgroundColor } = this;
            // td need only child tableCellInner. but for MutationObserver. tableCell need allow break
            // make sure tableCellInner is only child
            const cellInner = this.getCellInner();
            if (!cellInner) {
                // eslint-disable-next-line unicorn/no-array-for-each
                this.children.forEach((child) => {
                    child.remove();
                });
                const tableCellInner = this.scroll.create(blotName.tableCellInner, {
                    tableId,
                    rowId,
                    colId,
                    colspan: colspan || 1,
                    rowspan: rowspan || 1,
                    height,
                    backgroundColor,
                });
                const block = this.scroll.create('block');
                block.appendChild(this.scroll.create('break'));
                tableCellInner.appendChild(block);
                this.appendChild(tableCellInner);
            }
            super.optimize(context);
        }
        deleteAt(index, length) {
            if (index === 0 && length === this.length()) {
                const cell = (this.next || this.prev);
                const cellInner = cell && cell.getCellInner();
                if (cellInner) {
                    cellInner.colspan += this.colspan;
                }
                return this.remove();
            }
            this.children.forEachAt(index, length, (child, offset, length) => {
                child.deleteAt(offset, length);
            });
        }
    }

    const Parchment = Quill.import('parchment');
    const ScrollBlot = Quill.import('blots/scroll');
    class ScrollOverride extends ScrollBlot {
        createBlock(attributes, refBlot) {
            let createBlotName;
            let formats = {};
            // if attributes have not only one block blot. will save last. that will conflict with list/header in tableCellInner
            for (const [key, value] of Object.entries(attributes)) {
                const isBlockBlot = this.query(key, Parchment.Scope.BLOCK & Parchment.Scope.BLOT) != null;
                if (isBlockBlot) {
                    createBlotName = key;
                }
                else {
                    formats[key] = value;
                }
            }
            // only add this judgement to merge block blot at table cell
            if (createBlotName === blotName.tableCellInner) {
                formats = { ...attributes };
                delete formats[createBlotName];
            }
            const block = this.create(createBlotName || this.statics.defaultChild.blotName, createBlotName ? attributes[createBlotName] : undefined);
            this.insertBefore(block, refBlot || undefined);
            const length = block.length();
            for (const [key, value] of Object.entries(formats)) {
                block.formatAt(0, length, key, value);
            }
            return block;
        }
    }

    var MergeCell = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1em\" height=\"1em\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" d=\"M5 10H3V4h8v2H5zm14 8h-6v2h8v-6h-2zM5 18v-4H3v6h8v-2zM21 4h-8v2h6v4h2zM8 13v2l3-3l-3-3v2H3v2zm8-2V9l-3 3l3 3v-2h5v-2z\"/></svg>";

    var SplitCell = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1em\" height=\"1em\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" d=\"M19 14h2v6H3v-6h2v4h14zM3 4v6h2V6h14v4h2V4zm8 7v2H8v2l-3-3l3-3v2zm5 0V9l3 3l-3 3v-2h-3v-2z\"/></svg>";

    var InsertTop = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1em\" height=\"1em\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" d=\"M4 3h14a2 2 0 0 1 2 2v7.08a6 6 0 0 0-4.32.92H12v4h1.08c-.11.68-.11 1.35 0 2H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2m0 4v4h6V7zm8 0v4h6V7zm-8 6v4h6v-4zm17.94 4.5h-2v4h-2v-4h-2l3-3z\"/></svg>";

    var InsertBottom = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1em\" height=\"1em\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" d=\"M4 3h14a2 2 0 0 1 2 2v7.08a6 6 0 0 0-4.32.92H12v4h1.08c-.11.68-.11 1.35 0 2H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2m0 4v4h6V7zm8 0v4h6V7zm-8 6v4h6v-4zm11.94 5.5h2v-4h2v4h2l-3 3z\"/></svg>";

    var InsertLeft = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1em\" height=\"1em\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" d=\"M4 3h14a2 2 0 0 1 2 2v7.08a6 6 0 0 0-4.32.92H12v4h1.08c-.11.68-.11 1.35 0 2H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2m0 4v4h6V7zm8 0v4h6V7zm-8 6v4h6v-4zm14.44 2v2h4v2h-4v2l-3-3z\"/></svg>";

    var InsertRight = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1em\" height=\"1em\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" d=\"M4 3h14a2 2 0 0 1 2 2v7.08a6 6 0 0 0-4.32.92H12v4h1.08c-.11.68-.11 1.35 0 2H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2m0 4v4h6V7zm8 0v4h6V7zm-8 6v4h6v-4zm15.44 8v-2h-4v-2h4v-2l3 3z\"/></svg>";

    var RemoveRow = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1em\" height=\"1em\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" d=\"M9.41 13L12 15.59L14.59 13L16 14.41L13.41 17L16 19.59L14.59 21L12 18.41L9.41 21L8 19.59L10.59 17L8 14.41zM22 9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2zM4 9h4V6H4zm6 0h4V6h-4zm6 0h4V6h-4z\"/></svg>";

    var RemoveColumn = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1em\" height=\"1em\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" d=\"M4 2h7a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m0 8v4h7v-4zm0 6v4h7v-4zM4 4v4h7V4zm13.59 8L15 9.41L16.41 8L19 10.59L21.59 8L23 9.41L20.41 12L23 14.59L21.59 16L19 13.41L16.41 16L15 14.59z\"/></svg>";

    var RemoveTable = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1em\" height=\"1em\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" d=\"m15.46 15.88l1.42-1.42L19 16.59l2.12-2.13l1.42 1.42L20.41 18l2.13 2.12l-1.42 1.42L19 19.41l-2.12 2.13l-1.42-1.42L17.59 18zM4 3h14a2 2 0 0 1 2 2v7.08a6 6 0 0 0-4.32.92H12v4h1.08c-.11.68-.11 1.35 0 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m0 4v4h6V7zm8 0v4h6V7zm-8 6v4h6v-4z\"/></svg>";

    var Color = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1em\" height=\"1em\" viewBox=\"0 0 24 24\"><path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"m11 7l6 6M4 16L15.7 4.3a1 1 0 0 1 1.4 0l2.6 2.6a1 1 0 0 1 0 1.4L8 20H4z\"/></svg>";

    const usedColors = new Set();
    const parseNum = (num) => {
        const n = Number.parseFloat(num);
        return Number.isNaN(n) ? 0 : n;
    };
    const defaultTools = [
        {
            name: 'InsertTop',
            icon: InsertTop,
            tip: '向上插入一行',
            handle: (tableModule) => {
                tableModule.appendRow(false);
                tableModule.hideTableTools();
            },
        },
        {
            name: 'InsertRight',
            icon: InsertRight,
            tip: '向右插入一列',
            handle: (tableModule) => {
                tableModule.appendCol(true);
                tableModule.hideTableTools();
            },
        },
        {
            name: 'InsertBottom',
            icon: InsertBottom,
            tip: '向下插入一行',
            handle: (tableModule) => {
                tableModule.appendRow(true);
                tableModule.hideTableTools();
            },
        },
        {
            name: 'InsertLeft',
            icon: InsertLeft,
            tip: '向左插入一列',
            handle: (tableModule) => {
                tableModule.appendCol(false);
                tableModule.hideTableTools();
            },
        },
        {
            name: 'break',
        },
        {
            name: 'MergeCell',
            icon: MergeCell,
            tip: '合并单元格',
            handle: (tableModule) => {
                tableModule.mergeCells();
                tableModule.hideTableTools();
            },
        },
        {
            name: 'SplitCell',
            icon: SplitCell,
            tip: '拆分单元格',
            handle: (tableModule) => {
                tableModule.splitCell();
                tableModule.hideTableTools();
            },
        },
        {
            name: 'break',
        },
        {
            name: 'DeleteRow',
            icon: RemoveRow,
            tip: '删除当前行',
            handle: (tableModule) => {
                tableModule.removeRow();
                tableModule.hideTableTools();
            },
        },
        {
            name: 'DeleteColumn',
            icon: RemoveColumn,
            tip: '删除当前列',
            handle: (tableModule) => {
                tableModule.removeCol();
                tableModule.hideTableTools();
            },
        },
        {
            name: 'DeleteTable',
            icon: RemoveTable,
            tip: '删除当前表格',
            handle: (tableModule) => {
                tableModule.deleteTable();
            },
        },
        {
            name: 'break',
        },
        {
            name: 'BackgroundColor',
            icon: Color,
            isColorChoose: true,
            tip: '设置背景颜色',
            handle: (tableModule, selectedTds, color) => {
                tableModule.setBackgroundColor(selectedTds, color);
            },
        },
    ];
    class TableMenu {
        tableModule;
        quill;
        options;
        menu;
        selectedTds = [];
        updateUsedColor;
        constructor(tableModule, quill, options) {
            this.tableModule = tableModule;
            this.quill = quill;
            this.options = this.resolveOptions(options);
            try {
                const storageValue = localStorage.getItem(this.options.localstorageKey) || '[]';
                let colorValue = JSON.parse(storageValue);
                if (!isArray(colorValue)) {
                    colorValue = [];
                }
                colorValue.map((c) => usedColors.add(c));
            }
            catch { }
            this.updateUsedColor = debounce((menuItem, color) => {
                if (color) {
                    usedColors.add(color);
                }
                if (usedColors.size > 10) {
                    const saveColors = Array.from(usedColors).slice(-10);
                    usedColors.clear();
                    saveColors.map(v => usedColors.add(v));
                }
                localStorage.setItem(this.options.localstorageKey, JSON.stringify(Array.from(usedColors)));
                const usedColorWrapper = menuItem.querySelector('.table-color-used');
                if (!usedColorWrapper)
                    return;
                usedColorWrapper.innerHTML = '';
                for (const recordColor of usedColors) {
                    const colorItem = document.createElement('div');
                    colorItem.classList.add('table-color-used-item');
                    colorItem.style.backgroundColor = recordColor;
                    usedColorWrapper.appendChild(colorItem);
                }
            }, 1000);
            this.menu = this.buildTools();
        }
        resolveOptions(options) {
            return Object.assign({
                tipText: true,
                tipTexts: {},
                tools: defaultTools,
                localstorageKey: '__table-bg-used-color',
            }, options);
        }
        ;
        buildTools() {
            const toolBox = this.quill.addContainer('ql-table-selection-tool');
            for (const tool of this.options.tools) {
                const { name, icon, handle, isColorChoose, tip = '' } = tool;
                let item = document.createElement(isColorChoose ? 'label' : 'span');
                item.classList.add('ql-table-selection-item');
                if (name === 'break') {
                    item.classList.add('break');
                }
                else {
                    item.classList.add('icon');
                    if (isFunction(icon)) {
                        item.appendChild(icon(this.tableModule));
                    }
                    else {
                        item.innerHTML = icon;
                    }
                    // color choose handler will trigger when the color input event
                    if (isColorChoose) {
                        const input = document.createElement('input');
                        input.type = 'color';
                        Object.assign(input.style, {
                            width: 0,
                            height: 0,
                            padding: 0,
                            border: 0,
                            outline: 'none',
                            opacity: 0,
                        });
                        const usedColorWrap = document.createElement('div');
                        usedColorWrap.classList.add('table-color-used');
                        item.appendChild(usedColorWrap);
                        for (const recordColor of usedColors) {
                            const colorItem = document.createElement('div');
                            colorItem.classList.add('table-color-used-item');
                            colorItem.style.backgroundColor = recordColor;
                            usedColorWrap.appendChild(colorItem);
                        }
                        item.addEventListener('mouseenter', () => {
                            if (usedColors.size === 0)
                                return;
                            Object.assign(usedColorWrap.style, {
                                display: 'flex',
                            });
                            usedColorWrap.classList.remove('left-out');
                            usedColorWrap.classList.remove('right-out');
                            const rect = usedColorWrap.getBoundingClientRect();
                            if (rect.right > window.innerWidth) {
                                usedColorWrap.classList.add('right-out');
                            }
                            else {
                                usedColorWrap.classList.remove('right-out');
                            }
                            if (rect.left < 0) {
                                usedColorWrap.classList.add('left-out');
                            }
                            else {
                                usedColorWrap.classList.remove('left-out');
                            }
                        });
                        item.addEventListener('mouseleave', () => {
                            Object.assign(usedColorWrap.style, {
                                display: 'none',
                            });
                        });
                        usedColorWrap.addEventListener('click', (e) => {
                            e.preventDefault();
                            const item = e.target;
                            if (item && item.style.backgroundColor && this.selectedTds.length > 0) {
                                this.tableModule.setBackgroundColor(this.selectedTds, item.style.backgroundColor);
                            }
                        });
                        if (isFunction(handle)) {
                            item.addEventListener('click', e => e.stopPropagation());
                            input.addEventListener('input', () => {
                                handle(this.tableModule, this.selectedTds, input.value);
                                this.updateUsedColor(item, input.value);
                            }, false);
                        }
                        item.appendChild(input);
                    }
                    else {
                        isFunction(handle) && item.addEventListener('click', (e) => {
                            this.quill.focus();
                            handle(this.tableModule, this.selectedTds, e);
                        }, false);
                    }
                    const tipText = this.options.tipTexts[name] || tip;
                    if (tipText && tip) {
                        item = createToolTip(item, { msg: tipText, delay: 150 });
                    }
                }
                toolBox.appendChild(item);
            }
            return toolBox;
        }
        ;
        hideTools() {
            this.menu && Object.assign(this.menu.style, { display: 'none' });
        }
        updateTools() {
            if (!this.menu || !this.tableModule.tableSelection || !this.tableModule.tableSelection.boundary)
                return;
            const { boundary, selectedTds } = this.tableModule.tableSelection;
            this.selectedTds = selectedTds;
            Object.assign(this.menu.style, {
                display: 'flex',
                left: `${boundary.x + (boundary.width / 2) - 1}px`,
                top: `${boundary.y + boundary.height}px`,
                transform: `translate(-50%, 20%)`,
            });
            // limit menu in viewport
            const { paddingLeft, paddingRight } = getComputedStyle(this.quill.root);
            const menuRect = this.menu.getBoundingClientRect();
            const rootRect = this.quill.root.getBoundingClientRect();
            if (menuRect.right > rootRect.right - parseNum(paddingRight)) {
                Object.assign(this.menu.style, {
                    left: `${rootRect.right - rootRect.left - menuRect.width - parseNum(paddingRight) - 1}px`,
                    transform: `translate(0%, 20%)`,
                });
            }
            else if (menuRect.left < parseNum(paddingLeft)) {
                Object.assign(this.menu.style, {
                    left: `${parseNum(paddingLeft) + 1}px`,
                    transform: `translate(0%, 20%)`,
                });
            }
        }
        destroy() {
            if (!this.menu)
                return;
            this.menu.remove();
            this.menu = null;
        }
    }

    const ERROR_LIMIT = 2;
    class TableSelection {
        tableModule;
        table;
        quill;
        options;
        boundary = null;
        startScrollX = 0;
        selectedTds = [];
        cellSelect;
        dragging = false;
        scrollHandler = [];
        selectingHandler = this.mouseDownHandler.bind(this);
        tableMenu;
        constructor(tableModule, table, quill, options = {}) {
            this.tableModule = tableModule;
            this.table = table;
            this.quill = quill;
            this.options = this.resolveOptions(options);
            this.cellSelect = this.quill.addContainer('ql-table-selection_line');
            this.helpLinesInitial();
            const resizeObserver = new ResizeObserver(() => {
                this.hideSelection();
            });
            resizeObserver.observe(this.table);
            this.quill.root.addEventListener('mousedown', this.selectingHandler, false);
            this.tableMenu = new TableMenu(this.tableModule, quill, this.options.tableMenu);
        }
        resolveOptions(options) {
            return Object.assign({
                selectColor: '#0589f3',
                tableMenu: {},
            }, options);
        }
        ;
        addScrollEvent(dom, handle) {
            dom.addEventListener('scroll', handle);
            this.scrollHandler.push([dom, handle]);
        }
        clearScrollEvent() {
            for (let i = 0; i < this.scrollHandler.length; i++) {
                const [dom, handle] = this.scrollHandler[i];
                dom.removeEventListener('scroll', handle);
            }
            this.scrollHandler = [];
        }
        helpLinesInitial() {
            Object.assign(this.cellSelect.style, {
                'border-color': this.options.selectColor,
            });
        }
        computeSelectedTds(startPoint, endPoint) {
            // Use TableCell to calculation selected range, because TableCellInner is scrollable, the width will effect calculate
            const tableMain = Quill.find(this.table);
            if (!tableMain)
                return [];
            const tableCells = new Set(tableMain.descendants(TableCellFormat));
            // set boundary to initially mouse move rectangle
            let boundary = {
                x: Math.min(endPoint.x, startPoint.x),
                y: Math.min(endPoint.y, startPoint.y),
                x1: Math.max(endPoint.x, startPoint.x),
                y1: Math.max(endPoint.y, startPoint.y),
            };
            const selectedCells = new Set();
            let findEnd = true;
            // loop all cells to find correct boundary
            while (findEnd) {
                findEnd = false;
                for (const cell of tableCells) {
                    if (!cell.__rect) {
                        cell.__rect = cell.domNode.getBoundingClientRect();
                    }
                    // Determine whether the cell intersects with the current boundary
                    const { x, y, right, bottom } = cell.__rect;
                    if (isRectanglesIntersect(boundary, { x, y, x1: right, y1: bottom }, ERROR_LIMIT)) {
                        // add cell to selected
                        selectedCells.add(cell);
                        tableCells.delete(cell);
                        // update boundary
                        boundary = {
                            x: Math.min(boundary.x, x),
                            y: Math.min(boundary.y, y),
                            x1: Math.max(boundary.x1, right),
                            y1: Math.max(boundary.y1, bottom),
                        };
                        // recalculate boundary last cells
                        findEnd = true;
                        break;
                    }
                }
            }
            for (const cell of [...selectedCells, ...tableCells]) {
                delete cell.__rect;
            }
            // save result boundary relative to the editor
            this.boundary = getRelativeRect({
                ...boundary,
                width: boundary.x1 - boundary.x,
                height: boundary.y1 - boundary.y,
            }, this.quill.root.parentNode);
            return Array.from(selectedCells).map(cell => cell.getCellInner());
        }
        mouseDownHandler(mousedownEvent) {
            const { button, target, clientX, clientY } = mousedownEvent;
            const closestTable = target.closest('.ql-table');
            if (button !== 0 || !closestTable)
                return;
            const startTableId = closestTable.dataset.tableId;
            const startPoint = { x: clientX, y: clientY };
            this.startScrollX = this.table.parentNode.scrollLeft;
            this.selectedTds = this.computeSelectedTds(startPoint, startPoint);
            this.showSelection();
            const mouseMoveHandler = (mousemoveEvent) => {
                const { button, target, clientX, clientY } = mousemoveEvent;
                if (this.selectedTds.length > 1) {
                    mousemoveEvent.preventDefault();
                }
                const closestTable = target.closest('.ql-table');
                if (button !== 0
                    || !closestTable
                    || closestTable.dataset.tableId !== startTableId) {
                    return;
                }
                this.dragging = true;
                const movePoint = { x: clientX, y: clientY };
                this.selectedTds = this.computeSelectedTds(startPoint, movePoint);
                this.updateSelection();
            };
            const mouseUpHandler = () => {
                document.body.removeEventListener('mousemove', mouseMoveHandler, false);
                document.body.removeEventListener('mouseup', mouseUpHandler, false);
                this.dragging = false;
            };
            document.body.addEventListener('mousemove', mouseMoveHandler, false);
            document.body.addEventListener('mouseup', mouseUpHandler, false);
        }
        updateSelection() {
            if (this.selectedTds.length === 0 || !this.boundary)
                return;
            const tableViewScrollLeft = this.table.parentNode.scrollLeft;
            const scrollTop = this.quill.root.parentNode.scrollTop;
            Object.assign(this.cellSelect.style, {
                left: `${this.boundary.x + (this.startScrollX - tableViewScrollLeft) - 1}px`,
                top: `${scrollTop * 2 + this.boundary.y}px`,
                width: `${this.boundary.width + 1}px`,
                height: `${this.boundary.height + 1}px`,
            });
            this.tableMenu.updateTools();
        }
        showSelection() {
            this.clearScrollEvent();
            Object.assign(this.cellSelect.style, { display: 'block' });
            this.updateSelection();
            this.addScrollEvent(this.table.parentNode, () => {
                this.updateSelection();
            });
        }
        hideSelection() {
            this.boundary = null;
            this.selectedTds = [];
            this.cellSelect && Object.assign(this.cellSelect.style, { display: 'none' });
            this.tableMenu.hideTools();
            this.clearScrollEvent();
        }
        destroy() {
            this.hideSelection();
            this.tableMenu.destroy();
            this.cellSelect.remove();
            this.clearScrollEvent();
            this.quill.root.removeEventListener('mousedown', this.selectingHandler, false);
            return null;
        }
    }

    class TableResize {
        tableModule;
        table;
        quill;
        options;
        root;
        tableMain;
        tableWrapper;
        resizeObserver;
        tableCols = [];
        tableRows = [];
        rowHeadWrapper = null;
        colHeadWrapper = null;
        scrollHandler = [];
        constructor(tableModule, table, quill, options) {
            this.tableModule = tableModule;
            this.table = table;
            this.quill = quill;
            this.options = this.resolveOptions(options);
            this.tableMain = Quill.find(this.table);
            if (!this.tableMain)
                return;
            this.tableWrapper = this.tableMain.parent;
            if (!this.tableWrapper)
                return;
            this.root = this.quill.addContainer('ql-table-resizer');
            this.resizeObserver = new ResizeObserver(() => {
                this.showTool();
            });
            this.resizeObserver.observe(this.table);
        }
        resolveOptions(options) {
            return Object.assign({
                size: 12,
            }, options);
        }
        addScrollEvent(dom, handle) {
            dom.addEventListener('scroll', handle);
            this.scrollHandler.push([dom, handle]);
        }
        bindColDragEvent() {
            let tipColBreak = null;
            let curColIndex = -1;
            const tableColHeads = Array.from(this.root.getElementsByClassName('ql-table-col-header'));
            const tableColHeadSeparators = Array.from(this.root.getElementsByClassName('ql-table-col-separator'));
            const appendTo = document.body;
            const handleMousemove = (e) => {
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
                tipColBreak.style.left = `${resX}px`;
                tipColBreak.dataset.w = String(resX - rect.x);
            };
            const handleMouseup = () => {
                const w = Number.parseInt(tipColBreak.dataset.w);
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
                    this.tableMain.domNode.style.width = `${Number.parseFloat(this.tableMain.domNode.style.width)
                    - Number.parseFloat(tableColHeads[curColIndex].style.width)
                    + w}px`;
                    tableColHeads[curColIndex].style.width = `${w}px`;
                    this.tableCols[curColIndex].width = `${w}px`;
                    this.colHeadWrapper.style.width = `${this.tableMain.colWidthFillTable()}px`;
                }
                appendTo.removeChild(tipColBreak);
                tipColBreak = null;
                curColIndex = -1;
                document.removeEventListener('mouseup', handleMouseup);
                document.removeEventListener('mousemove', handleMousemove);
            };
            const handleMousedown = (i, e) => {
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
                if (tipColBreak)
                    appendTo.removeChild(tipColBreak);
                tipColBreak = divDom;
            };
            this.addScrollEvent(this.tableWrapper.domNode, () => {
                this.colHeadWrapper.scrollLeft = this.tableWrapper.domNode.scrollLeft;
            });
            for (const [i, el] of tableColHeadSeparators.entries()) {
                el.addEventListener('mousedown', handleMousedown.bind(this, i));
                // prevent drag
                el.addEventListener('dragstart', (e) => {
                    e.preventDefault();
                });
            }
        }
        bindRowDragEvent() {
            let tipRowBreak = null;
            let curRowIndex = -1;
            const tableRowHeads = Array.from(this.root.getElementsByClassName('ql-table-row-header'));
            const tableRowHeadSeparators = Array.from(this.root.getElementsByClassName('ql-table-row-separator'));
            const appendTo = document.body;
            const handleMousemove = (e) => {
                const rect = tableRowHeads[curRowIndex].getBoundingClientRect();
                let resY = e.clientY;
                if (resY - rect.y < tableRowMinWidthPx) {
                    resY = rect.y + tableRowMinWidthPx;
                }
                tipRowBreak.style.top = `${resY}px`;
                tipRowBreak.dataset.w = String(resY - rect.y);
            };
            const handleMouseup = () => {
                const w = Number.parseInt(tipRowBreak.dataset.w);
                tableRowHeads[curRowIndex].style.height = `${w}px`;
                this.tableRows[curRowIndex].setHeight(w);
                const tableWrapperRect = this.tableWrapper.domNode.getBoundingClientRect();
                this.rowHeadWrapper.style.height = `${tableWrapperRect.height}px`;
                appendTo.removeChild(tipRowBreak);
                tipRowBreak = null;
                curRowIndex = -1;
                document.removeEventListener('mouseup', handleMouseup);
                document.removeEventListener('mousemove', handleMousemove);
            };
            const handleMousedown = (i, e) => {
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
                if (tipRowBreak)
                    appendTo.removeChild(tipRowBreak);
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
            const tableMain = Quill.find(this.table);
            if (!tableMain)
                return;
            this.tableCols = this.tableMain.getCols();
            this.tableRows = this.tableMain.getRows();
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

    const Delta = Quill.import('delta');
    const Break = Quill.import('blots/break');
    const icons = Quill.import('ui/icons');
    const createCell = (scroll, { tableId, rowId, colId }) => {
        const value = {
            tableId,
            rowId,
            colId,
            colspan: 1,
            rowspan: 1,
        };
        const tableCell = scroll.create(blotName.tableCell, value);
        const tableCellInner = scroll.create(blotName.tableCellInner, value);
        const block = scroll.create('block');
        block.appendChild(scroll.create('break'));
        tableCellInner.appendChild(block);
        tableCell.appendChild(tableCellInner);
        return tableCell;
    };
    // Blots that cannot be inserted into a table
    const tableCantInsert = [blotName.tableCell, 'code-block'];
    const isForbidInTableBlot = (blot) => tableCantInsert.includes(blot.statics.blotName);
    const isForbidInTable = (current) => current && current.parent
        ? isForbidInTableBlot(current.parent)
            ? true
            : isForbidInTable(current.parent)
        : false;
    class TableUp {
        static keyboradHandler = {
            'forbid remove table by backspace': {
                key: 'Backspace',
                collapsed: true,
                offset: 0,
                handler(range, context) {
                    const line = this.quill.getLine(range.index);
                    const blot = line[0];
                    if (blot.prev instanceof TableWrapperFormat) {
                        blot.prev.remove();
                        return true;
                    }
                    if (context.format[blotName.tableCellInner]) {
                        const offset = blot.offset(findParentBlot(blot, blotName.tableCellInner));
                        if (offset === 0) {
                            return false;
                        }
                    }
                    return true;
                },
            },
            'forbid remove table by delete': {
                key: 'Delete',
                collapsed: true,
                handler(range, context) {
                    const line = this.quill.getLine(range.index);
                    const blot = line[0];
                    const offsetInline = line[1];
                    if (blot.next instanceof TableWrapperFormat && offsetInline === blot.length() - 1)
                        return false;
                    if (context.format[blotName.tableCellInner]) {
                        const tableInnerBlot = findParentBlot(blot, blotName.tableCellInner);
                        if (blot === tableInnerBlot.children.tail && offsetInline === blot.length() - 1) {
                            return false;
                        }
                    }
                    return true;
                },
            },
        };
        static register() {
            TableWrapperFormat.allowedChildren = [TableMainFormat];
            TableMainFormat.allowedChildren = [TableBodyFormat, TableColgroupFormat];
            TableMainFormat.requiredContainer = TableWrapperFormat;
            TableColgroupFormat.allowedChildren = [TableColFormat];
            TableColgroupFormat.requiredContainer = TableMainFormat;
            TableBodyFormat.allowedChildren = [TableRowFormat];
            TableBodyFormat.requiredContainer = TableMainFormat;
            TableRowFormat.allowedChildren = [TableCellFormat];
            TableCellFormat.requiredContainer = TableBodyFormat;
            TableCellFormat.allowedChildren = [TableCellInnerFormat, Break];
            TableCellFormat.requiredContainer = TableRowFormat;
            TableCellInnerFormat.requiredContainer = TableCellFormat;
            Quill.register({
                'blots/scroll': ScrollOverride,
                [`formats/${blotName.tableCell}`]: TableCellFormat,
                [`formats/${blotName.tableCellInner}`]: TableCellInnerFormat,
                [`formats/${blotName.tableRow}`]: TableRowFormat,
                [`formats/${blotName.tableBody}`]: TableBodyFormat,
                [`formats/${blotName.tableCol}`]: TableColFormat,
                [`formats/${blotName.tableColgroup}`]: TableColgroupFormat,
                [`formats/${blotName.tableMain}`]: TableMainFormat,
                [`formats/${blotName.tableWrapper}`]: TableWrapperFormat,
            }, true);
        }
        quill;
        options;
        fixTableByLisenter = debounce(this.balanceTables, 100);
        selector;
        picker;
        range;
        table;
        tableSelection;
        tableResizer;
        constructor(quill, options) {
            this.quill = quill;
            this.options = this.resolveOptions(options || {});
            const toolbar = this.quill.getModule('toolbar');
            if (toolbar) {
                const [, select] = (toolbar.controls || []).find(([name]) => name === tabbleToolName) || [];
                if (select && select.tagName.toLocaleLowerCase() === 'select') {
                    this.picker = this.quill.theme.pickers.find(picker => picker.select === select);
                    if (!this.picker)
                        return;
                    this.picker.label.innerHTML = icons.table;
                    this.buildCustomSelect(this.options.customSelect);
                    this.picker.label.addEventListener('mousedown', this.handleInViewport);
                }
            }
            this.quill.root.addEventListener('click', (evt) => {
                const path = evt.composedPath();
                if (!path || path.length <= 0)
                    return;
                const tableNode = path.find(node => node.tagName && node.tagName.toUpperCase() === 'TABLE' && node.classList.contains('ql-table'));
                if (tableNode) {
                    if (this.table === tableNode)
                        return;
                    if (this.table)
                        this.hideTableTools();
                    this.showTableTools(tableNode, quill);
                }
                else if (this.table) {
                    this.hideTableTools();
                }
            }, false);
            this.quill.root.addEventListener('scroll', () => {
                this.hideTableTools();
            });
            this.quill.on(Quill.events.EDITOR_CHANGE, (event, range) => {
                if (event === Quill.events.SELECTION_CHANGE && range) {
                    const [blot] = this.quill.getLine(range.index);
                    try {
                        findParentBlot(blot, blotName.tableMain);
                        return;
                    }
                    catch { }
                    this.hideTableTools();
                }
            });
            this.listenBalanceCells();
        }
        resolveOptions(options) {
            return Object.assign({
                isCustom: true,
                texts: this.resolveTexts(options.texts || {}),
                full: true,
            }, options);
        }
        ;
        resolveTexts(options) {
            return Object.assign({
                customBtn: '自定义行列数',
                confirmText: '确认',
                cancelText: '取消',
                rowText: '行数',
                colText: '列数',
                notPositiveNumberError: '请输入正整数',
            }, options);
        }
        ;
        showTableTools(table, quill) {
            if (table) {
                this.table = table;
                this.tableSelection = new TableSelection(this, table, quill, this.options.selection || {});
                this.tableResizer = new TableResize(this, table, quill, this.options.resizer || {});
            }
        }
        hideTableTools() {
            this.tableSelection && this.tableSelection.destroy();
            this.tableSelection = undefined;
            this.tableResizer && this.tableResizer.destroy();
            this.tableResizer = undefined;
            this.table = undefined;
        }
        async buildCustomSelect(customSelect) {
            if (!this.picker)
                return;
            const dom = document.createElement('div');
            dom.classList.add('ql-custom-select');
            this.selector = customSelect && isFunction(customSelect)
                ? await customSelect(this)
                : createSelectBox({
                    onSelect: (row, col) => {
                        this.insertTable(row, col);
                        if (this.picker) {
                            this.picker.close();
                        }
                    },
                    isCustom: this.options.isCustom,
                    texts: this.options.texts,
                });
            dom.appendChild(this.selector);
            this.picker.options.appendChild(dom);
        }
        ;
        handleInViewport = () => {
            if (!this.selector || !this.picker)
                return;
            const selectRect = this.selector.getBoundingClientRect();
            if (selectRect.right >= window.innerWidth) {
                const labelRect = this.picker.label.getBoundingClientRect();
                Object.assign(this.picker.options.style, { transform: `translateX(calc(-100% + ${labelRect.width}px))` });
            }
            else {
                Object.assign(this.picker.options.style, { transform: undefined });
            }
        };
        insertTable(rows, columns) {
            if (rows >= 30 || columns >= 30) {
                throw new Error('Both rows and columns must be less than 30.');
            }
            this.quill.focus();
            this.range = this.quill.getSelection();
            const range = this.range;
            if (range == null)
                return;
            const [currentBlot] = this.quill.getLeaf(range.index);
            if (!currentBlot)
                return;
            if (isForbidInTable(currentBlot)) {
                throw new Error(`Not supported ${currentBlot.statics.blotName} insert into table.`);
            }
            const rootStyle = getComputedStyle(this.quill.root);
            const paddingLeft = Number.parseInt(rootStyle.paddingLeft);
            const paddingRight = Number.parseInt(rootStyle.paddingRight);
            const width = Number.parseInt(rootStyle.width) - paddingLeft - paddingRight;
            let delta = new Delta().retain(range.index).insert('\n');
            const tableId = randomId();
            const colIds = new Array(columns).fill(0).map(() => randomId());
            // insert delta data to create table
            delta = new Array(columns).fill('\n').reduce((memo, text, i) => {
                memo.insert(text, {
                    [blotName.tableCol]: {
                        width: !this.options.full ? `${Math.floor(width / columns)}px` : `${(1 / columns) * 100}%`,
                        tableId,
                        colId: colIds[i],
                        full: this.options.full,
                    },
                });
                return memo;
            }, delta);
            delta = new Array(rows).fill(0).reduce((memo) => {
                const rowId = randomId();
                return new Array(columns).fill('\n').reduce((memo, text, i) => {
                    memo.insert(text, {
                        [blotName.tableCellInner]: {
                            tableId,
                            rowId,
                            colId: colIds[i],
                            rowspan: 1,
                            colspan: 1,
                        },
                    });
                    return memo;
                }, memo);
            }, delta);
            this.quill.updateContents(delta, Quill.sources.USER);
            this.quill.setSelection(range.index + columns + columns * rows + 1, Quill.sources.SILENT);
            this.quill.focus();
        }
        // handle unusual delete cell
        fixUnusuaDeletelTable(tableBlot) {
            // calculate all cells
            const trBlots = tableBlot.getRows();
            const tableColIds = tableBlot.getColIds();
            if (trBlots.length === 0 || tableColIds.length === 0) {
                return tableBlot.remove();
            }
            // append by col
            const cellSpanMap = new Array(trBlots.length).fill(0).map(() => new Array(tableColIds.length).fill(false));
            const tableId = tableBlot.tableId;
            for (const [indexTr, tr] of trBlots.entries()) {
                let indexTd = 0;
                let indexCol = 0;
                const curCellSpan = cellSpanMap[indexTr];
                const tds = tr.descendants(TableCellFormat);
                // loop every row and column
                while (indexCol < tableColIds.length) {
                    // skip when rowspan or colspan
                    if (curCellSpan[indexCol]) {
                        indexCol += 1;
                        continue;
                    }
                    const curTd = tds[indexTd];
                    // if colId does not match. insert a new one
                    if (!curTd || curTd.colId !== tableColIds[indexCol]) {
                        tr.insertBefore(createCell(this.quill.scroll, {
                            tableId,
                            colId: tableColIds[indexCol],
                            rowId: tr.rowId,
                        }), curTd);
                    }
                    else {
                        if (indexTr + curTd.rowspan - 1 >= trBlots.length) {
                            curTd.getCellInner().rowspan = trBlots.length - indexTr;
                        }
                        const { colspan, rowspan } = curTd;
                        // skip next column cell
                        if (colspan > 1) {
                            for (let c = 1; c < colspan; c++) {
                                curCellSpan[indexCol + c] = true;
                            }
                        }
                        // skip next rowspan cell
                        if (rowspan > 1) {
                            for (let r = indexTr + 1; r < indexTr + rowspan; r++) {
                                for (let c = 0; c < colspan; c++) {
                                    cellSpanMap[r][indexCol + c] = true;
                                }
                            }
                        }
                        indexTd += 1;
                    }
                    indexCol += 1;
                }
                // if td not match all exist td. Indicates that a cell has been inserted
                if (indexTd < tds.length) {
                    for (let i = indexTd; i < tds.length; i++) {
                        tds[i].remove();
                    }
                }
            }
        }
        balanceTables() {
            for (const tableBlot of this.quill.scroll.descendants(TableMainFormat)) {
                this.fixUnusuaDeletelTable(tableBlot);
            }
        }
        listenBalanceCells() {
            this.quill.on(Quill.events.SCROLL_OPTIMIZE, (mutations) => {
                mutations.some((mutation) => {
                    if (
                    // TODO: if need add ['COL', 'COLGROUP']
                    ['TD', 'TR', 'TBODY', 'TABLE'].includes(mutation.target.tagName)) {
                        this.fixTableByLisenter();
                        return true;
                    }
                    return false;
                });
            });
        }
        setBackgroundColor(selectedTds, color) {
            if (selectedTds.length === 0)
                return;
            for (const td of selectedTds) {
                td.backgroundColor = color;
            }
        }
        deleteTable() {
            if (!this.tableSelection || this.tableSelection.selectedTds.length === 0)
                return;
            const selectedTds = this.tableSelection.selectedTds;
            const tableBlot = findParentBlot(selectedTds[0], blotName.tableMain);
            tableBlot && tableBlot.remove();
            this.hideTableTools();
        }
        appendRow(isDown) {
            if (!this.tableSelection)
                return;
            const selectedTds = this.tableSelection.selectedTds;
            if (selectedTds.length <= 0)
                return;
            // find baseTd and baseTr
            const baseTd = selectedTds[isDown ? selectedTds.length - 1 : 0];
            const tableBlot = findParentBlot(baseTd, blotName.tableMain);
            const [tableBodyBlot] = tableBlot.descendants(TableBodyFormat);
            if (!tableBodyBlot)
                return;
            const baseTdParentTr = findParentBlot(baseTd, blotName.tableRow);
            const tableTrs = tableBlot.getRows();
            const i = tableTrs.indexOf(baseTdParentTr);
            const insertRowIndex = i + (isDown ? baseTd.rowspan : 0);
            tableBodyBlot.insertRow(insertRowIndex);
        }
        appendCol(isRight) {
            if (!this.tableSelection)
                return;
            const selectedTds = this.tableSelection.selectedTds;
            if (selectedTds.length <= 0)
                return;
            // find insert column index in row
            const [baseTd] = selectedTds.reduce((pre, cur) => {
                const columnIndex = cur.getColumnIndex();
                if (!isRight && columnIndex <= pre[1]) {
                    pre = [cur, columnIndex];
                }
                else if (isRight && columnIndex >= pre[1]) {
                    pre = [cur, columnIndex];
                }
                return pre;
            }, [selectedTds[0], selectedTds[0].getColumnIndex()]);
            const columnIndex = baseTd.getColumnIndex() + (isRight ? baseTd.colspan : 0);
            const tableBlot = findParentBlot(baseTd, blotName.tableMain);
            const tableId = tableBlot.tableId;
            const newColId = randomId();
            const [colgroup] = tableBlot.descendants(TableColgroupFormat);
            if (colgroup) {
                colgroup.insertColByIndex(columnIndex, {
                    tableId,
                    colId: newColId,
                    width: tableBlot.full ? '6%' : '160px',
                    full: tableBlot.full,
                });
            }
            // loop tr and insert cell at index
            // if index is inner cell, skip next `rowspan` line
            // if there are cells both have column span and row span before index cell, minus `colspan` cell for next line
            const trs = tableBlot.descendants(TableRowFormat);
            const spanCols = [];
            let skipRowNum = 0;
            for (const tr of Object.values(trs)) {
                const spanCol = spanCols.shift() || 0;
                if (skipRowNum > 0) {
                    skipRowNum -= 1;
                    continue;
                }
                const nextSpanCols = tr.insertCell(columnIndex - spanCol, {
                    tableId,
                    rowId: tr.rowId,
                    colId: newColId,
                    rowspan: 1,
                    colspan: 1,
                });
                if (nextSpanCols.skipRowNum) {
                    skipRowNum += nextSpanCols.skipRowNum;
                }
                for (const [i, n] of nextSpanCols.entries()) {
                    spanCols[i] = (spanCols[i] || 0) + n;
                }
            }
        }
        /**
         * after insert or remove cell. handle cell colspan and rowspan merge
         */
        fixTableByRemove(tableBlot) {
            // calculate all cells
            // maybe will get empty tr
            const trBlots = tableBlot.getRows();
            const tableCols = tableBlot.getCols();
            const colIdMap = tableCols.reduce((idMap, col) => {
                idMap[col.colId] = 0;
                return idMap;
            }, {});
            // merge rowspan
            const reverseTrBlots = [...trBlots].reverse();
            const removeTr = [];
            for (const [index, tr] of reverseTrBlots.entries()) {
                const i = trBlots.length - index - 1;
                if (tr.children.length <= 0) {
                    removeTr.push(i);
                }
                else {
                    // if have td rowspan across empty tr. minus rowspan
                    tr.foreachCellInner((td) => {
                        const sum = removeTr.reduce((sum, val) => td.rowspan + i > val ? sum + 1 : sum, 0);
                        td.rowspan -= sum;
                        // count exist col
                        colIdMap[td.colId] += 1;
                    });
                }
            }
            // merge colspan
            let index = 0;
            for (const count of Object.values(colIdMap)) {
                if (count === 0) {
                    const spanCols = [];
                    let skipRowNum = 0;
                    for (const tr of Object.values(trBlots)) {
                        const spanCol = spanCols.shift() || 0;
                        let nextSpanCols = [];
                        if (skipRowNum > 0) {
                            nextSpanCols = tr.getCellByColumIndex(index - spanCol)[2];
                            skipRowNum -= 1;
                        }
                        else {
                            nextSpanCols = tr.removeCell(index - spanCol);
                            if (nextSpanCols.skipRowNum) {
                                skipRowNum += nextSpanCols.skipRowNum;
                            }
                        }
                        for (const [i, n] of nextSpanCols.entries()) {
                            spanCols[i] = (spanCols[i] || 0) + n;
                        }
                    }
                }
                else {
                    index += 1;
                }
            }
            // remove col
            for (const col of tableCols) {
                if (colIdMap[col.colId] === 0) {
                    if (col.prev) {
                        col.prev.width += col.width;
                    }
                    else if (col.next) {
                        col.next.width += col.width;
                    }
                    col.remove();
                }
            }
        }
        removeRow() {
            if (!this.tableSelection)
                return;
            const selectedTds = this.tableSelection.selectedTds;
            if (selectedTds.length <= 0)
                return;
            const baseTd = selectedTds[0];
            const tableBlot = findParentBlot(baseTd, blotName.tableMain);
            const trs = tableBlot.getRows();
            let endTrIndex = trs.length;
            let nextTrIndex = -1;
            for (const td of selectedTds) {
                const tr = findParentBlot(td, blotName.tableRow);
                const index = trs.indexOf(tr);
                if (index < endTrIndex) {
                    endTrIndex = index;
                }
                if (index + td.rowspan > nextTrIndex) {
                    nextTrIndex = index + td.rowspan;
                }
            }
            const patchTds = {};
            for (let i = endTrIndex; i < Math.min(trs.length, nextTrIndex); i++) {
                const tr = trs[i];
                tr.foreachCellInner((td) => {
                    // find cells in rowspan that exceed the deletion range
                    if (td.rowspan + i > nextTrIndex) {
                        patchTds[td.colId] = {
                            rowspan: td.rowspan + i - nextTrIndex,
                            colspan: td.colspan,
                            colIndex: td.getColumnIndex(),
                        };
                    }
                    // only remove td. empty tr to calculate colspan and rowspan
                    td.parent.remove();
                });
            }
            if (trs[nextTrIndex]) {
                const nextTr = trs[nextTrIndex];
                const tableId = tableBlot.tableId;
                // insert cell in nextTr to patch exceed cell
                for (const [colId, { colIndex, colspan, rowspan }] of Object.entries(patchTds)) {
                    nextTr.insertCell(colIndex, {
                        tableId,
                        rowId: nextTr.rowId,
                        colId,
                        colspan,
                        rowspan,
                    });
                }
            }
            this.fixTableByRemove(tableBlot);
        }
        removeCol() {
            if (!this.tableSelection)
                return;
            const selectedTds = this.tableSelection.selectedTds;
            if (selectedTds.length <= 0)
                return;
            const baseTd = selectedTds[0];
            const tableBlot = findParentBlot(baseTd, blotName.tableMain);
            const colspanMap = {};
            for (const td of selectedTds) {
                if (!colspanMap[td.rowId])
                    colspanMap[td.rowId] = 0;
                colspanMap[td.rowId] += td.colspan;
            }
            const colspanCount = Math.max(...Object.values(colspanMap));
            const columnIndex = baseTd.getColumnIndex();
            const trs = tableBlot.descendants(TableRowFormat);
            for (let i = 0; i < colspanCount; i++) {
                const spanCols = [];
                let skipRowNum = 0;
                for (const tr of Object.values(trs)) {
                    const spanCol = spanCols.shift() || 0;
                    if (skipRowNum > 0) {
                        skipRowNum -= 1;
                        continue;
                    }
                    const nextSpanCols = tr.removeCell(columnIndex - spanCol);
                    if (nextSpanCols.skipRowNum) {
                        skipRowNum += nextSpanCols.skipRowNum;
                    }
                    for (const [i, n] of nextSpanCols.entries()) {
                        spanCols[i] = (spanCols[i] || 0) + n;
                    }
                }
            }
            // delete col need after remove cell. remove cell need all column id
            // manual delete col. use fixTableByRemove to delete col will delete extra cells
            const [colgroup] = tableBlot.descendants(TableColgroupFormat);
            if (colgroup) {
                for (let i = 0; i < colspanCount; i++) {
                    colgroup.removeColByIndex(columnIndex);
                }
            }
            this.fixTableByRemove(tableBlot);
        }
        mergeCells() {
            if (!this.tableSelection)
                return;
            const selectedTds = this.tableSelection.selectedTds;
            if (selectedTds.length <= 1)
                return;
            const counts = selectedTds.reduce((pre, selectTd, index) => {
                // count column span
                const colId = selectTd.colId;
                if (!pre[0][colId])
                    pre[0][colId] = 0;
                pre[0][colId] += selectTd.rowspan;
                // count row span
                const rowId = selectTd.rowId;
                if (!pre[1][rowId])
                    pre[1][rowId] = 0;
                pre[1][rowId] += selectTd.colspan;
                // merge select cell
                if (index !== 0) {
                    selectTd.moveChildren(pre[2]);
                    selectTd.parent.remove();
                }
                return pre;
            }, [{}, {}, selectedTds[0]]);
            const rowCount = Math.max(...Object.values(counts[0]));
            const colCount = Math.max(...Object.values(counts[1]));
            const baseTd = counts[2];
            baseTd.colspan = colCount;
            baseTd.rowspan = rowCount;
            const tableBlot = findParentBlot(baseTd, blotName.tableMain);
            this.fixTableByRemove(tableBlot);
        }
        splitCell() {
            if (!this.tableSelection)
                return;
            const selectedTds = this.tableSelection.selectedTds;
            if (selectedTds.length !== 1)
                return;
            const baseTd = selectedTds[0];
            if (baseTd.colspan === 1 && baseTd.rowspan === 1)
                return;
            const baseTr = findParentBlot(baseTd, blotName.tableRow);
            const tableBlot = findParentBlot(baseTd, blotName.tableMain);
            const tableId = tableBlot.tableId;
            const colIndex = baseTd.getColumnIndex();
            const colIds = tableBlot.getColIds().slice(colIndex, colIndex + baseTd.colspan).reverse();
            let curTr = baseTr;
            let rowspan = baseTd.rowspan;
            // reset span first. insertCell need colspan to judge insert position
            baseTd.colspan = 1;
            baseTd.rowspan = 1;
            while (curTr && rowspan > 0) {
                for (const id of colIds) {
                    // keep baseTd. baseTr should insert at baseTd's column index + 1
                    if (curTr === baseTr && id === baseTd.colId)
                        continue;
                    curTr.insertCell(colIndex + (curTr === baseTr ? 1 : 0), {
                        tableId,
                        rowId: curTr.rowId,
                        colId: id,
                        rowspan: 1,
                        colspan: 1,
                    });
                }
                rowspan -= 1;
                curTr = curTr.next;
            }
        }
    }

    exports.ContainerFormat = ContainerFormat;
    exports.ScrollOverride = ScrollOverride;
    exports.TableBodyFormat = TableBodyFormat;
    exports.TableCellFormat = TableCellFormat;
    exports.TableCellInnerFormat = TableCellInnerFormat;
    exports.TableColFormat = TableColFormat;
    exports.TableColgroupFormat = TableColgroupFormat;
    exports.TableMainFormat = TableMainFormat;
    exports.TableMenu = TableMenu;
    exports.TableResize = TableResize;
    exports.TableRowFormat = TableRowFormat;
    exports.TableSelection = TableSelection;
    exports.TableUp = TableUp;
    exports.TableWrapperFormat = TableWrapperFormat;
    exports.default = TableUp;
    exports.isForbidInTable = isForbidInTable;
    exports.isForbidInTableBlot = isForbidInTableBlot;
    exports.tableCantInsert = tableCantInsert;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=dev.js.map
