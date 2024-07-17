!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports,require("quill")):"function"==typeof define&&define.amd?define(["exports","quill"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).TableUp={},e.Quill)}(this,(function(e,t){"use strict";const s=(e,t)=>{t.type||(t.type="text"),t.value||(t.value="");const s=document.createElement("div");if(s.classList.add("input__item"),e){const t=document.createElement("span");t.classList.add("input__label"),t.textContent=e,s.appendChild(t)}const i=document.createElement("div");i.classList.add("input__input");const l=document.createElement("input");for(const e in t)l.setAttribute(e,t[e]);(t.max||t.min)&&l.addEventListener("blur",(()=>{t.max&&t.max<=Number(l.value)&&(l.value=String(t.max)),t.min&&t.min>=Number(l.value)&&(l.value=String(t.min))})),i.appendChild(l),s.appendChild(i),l.addEventListener("focus",(()=>{i.classList.add("focus")})),l.addEventListener("blur",(()=>{i.classList.remove("focus")}));return{item:s,input:l,errorTip:e=>{let t;i.classList.contains("error")?t=i.querySelector(".input__error-tip"):(t=document.createElement("span"),t.classList.add("input__error-tip"),i.appendChild(t)),t.textContent=e,i.classList.add("error");return{removeError:()=>{i.classList.remove("error"),t.remove()}}}}};let i=8e3;const l=async(e={})=>{const t=document.createElement("div");t.classList.add("table-creator");const l=document.createElement("div");l.classList.add("table-creator__input");const{item:o,input:n,errorTip:a}=s(e.rowText||"行数",{type:"number",value:String(e.row||""),max:99}),{item:r,input:c,errorTip:d}=s(e.rowText||"列数",{type:"number",value:String(e.col||""),max:99});l.appendChild(o),l.appendChild(r),t.appendChild(l);const h=document.createElement("div");h.classList.add("table-creator__control");const m=document.createElement("button");m.classList.add("table-creator__btn","confirm"),m.textContent=e.confirmText||"Confirm";const u=document.createElement("button");return u.classList.add("table-creator__btn","cancel"),u.textContent=e.cancelText||"Cancel",h.appendChild(m),h.appendChild(u),t.appendChild(h),new Promise(((e,s)=>{const{close:l}=(({child:e,target:t=document.body,beforeClose:s=()=>{}}={})=>{const l=t,o=document.createElement("div");o.classList.add("dialog"),o.style.zIndex=String(i);const n=document.createElement("div");if(n.classList.add("dialog__overlay"),o.appendChild(n),e){const t=document.createElement("div");t.classList.add("dialog__content"),t.appendChild(e),n.appendChild(t),t.addEventListener("click",(e=>{e.stopPropagation()}))}const a=getComputedStyle(l).overflow;l.style.overflow="hidden",l.appendChild(o);const r=()=>{s(),o.remove(),l.style.overflow=a};return o.addEventListener("click",r),i+=1,{dialog:o,close:r}})({child:t,beforeClose:s});m.addEventListener("click",(async()=>{const t=Number(n.value),s=Number(c.value);return Number.isNaN(t)||t<=0?a("Invalid number"):Number.isNaN(s)||s<=0?d("Invalid number"):(e({row:t,col:s}),void l())})),u.addEventListener("click",(()=>{l()}))}))},o=(e,t={})=>{const{msg:s="",delay:i=0}=t,l=document.createElement("div");if(l.classList.add("tool-tip"),l.appendChild(e),s){const e=document.createElement("div");e.classList.add("tool-tip__text"),e.classList.add("hidden"),e.textContent=s,l.appendChild(e);let t=null;l.addEventListener("mouseenter",(()=>{t&&clearTimeout(t),t=setTimeout((()=>{e.classList.remove("hidden")}),i)})),l.addEventListener("mouseleave",(()=>{t&&clearTimeout(t),t=setTimeout((()=>{e.classList.add("hidden"),t=null}),i)}))}return l},n=e=>"function"==typeof e;const a=t.import("formats/table"),r=[{name:"InsertTop",icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M4 3h14a2 2 0 0 1 2 2v7.08a6 6 0 0 0-4.32.92H12v4h1.08c-.11.68-.11 1.35 0 2H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2m0 4v4h6V7zm8 0v4h6V7zm-8 6v4h6v-4zm17.94 4.5h-2v4h-2v-4h-2l3-3z"/></svg>',tip:"向上插入一行",handle:e=>{e.insertRow(0)}},{name:"InsertRight",icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M4 3h14a2 2 0 0 1 2 2v7.08a6 6 0 0 0-4.32.92H12v4h1.08c-.11.68-.11 1.35 0 2H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2m0 4v4h6V7zm8 0v4h6V7zm-8 6v4h6v-4zm15.44 8v-2h-4v-2h4v-2l3 3z"/></svg>',tip:"向右插入一列",handle:e=>{e.insertColumn(1)}},{name:"InsertBottom",icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M4 3h14a2 2 0 0 1 2 2v7.08a6 6 0 0 0-4.32.92H12v4h1.08c-.11.68-.11 1.35 0 2H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2m0 4v4h6V7zm8 0v4h6V7zm-8 6v4h6v-4zm11.94 5.5h2v-4h2v4h2l-3 3z"/></svg>',tip:"向下插入一行",handle:e=>{e.insertRow(1)}},{name:"InsertLeft",icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M4 3h14a2 2 0 0 1 2 2v7.08a6 6 0 0 0-4.32.92H12v4h1.08c-.11.68-.11 1.35 0 2H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2m0 4v4h6V7zm8 0v4h6V7zm-8 6v4h6v-4zm14.44 2v2h4v2h-4v2l-3-3z"/></svg>',tip:"向左插入一列",handle:e=>{e.insertColumn(0)}},{name:"break"},{name:"DeleteRow",icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M9.41 13L12 15.59L14.59 13L16 14.41L13.41 17L16 19.59L14.59 21L12 18.41L9.41 21L8 19.59L10.59 17L8 14.41zM22 9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2zM4 9h4V6H4zm6 0h4V6h-4zm6 0h4V6h-4z"/></svg>',tip:"删除当前行",handle:e=>{e.deleteRow()}},{name:"DeleteColumn",icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M4 2h7a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m0 8v4h7v-4zm0 6v4h7v-4zM4 4v4h7V4zm13.59 8L15 9.41L16.41 8L19 10.59L21.59 8L23 9.41L20.41 12L23 14.59L21.59 16L19 13.41L16.41 16L15 14.59z"/></svg>',tip:"删除当前列",handle:e=>{e.deleteColumn()}},{name:"DeleteTable",icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="m15.46 15.88l1.42-1.42L19 16.59l2.12-2.13l1.42 1.42L20.41 18l2.13 2.12l-1.42 1.42L19 19.41l-2.12 2.13l-1.42-1.42L17.59 18zM4 3h14a2 2 0 0 1 2 2v7.08a6 6 0 0 0-4.32.92H12v4h1.08c-.11.68-.11 1.35 0 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m0 4v4h6V7zm8 0v4h6V7zm-8 6v4h6v-4z"/></svg>',tip:"删除当前表格",handle:e=>{e.deleteTable()}}],c=e=>{const t=Number.parseFloat(e);return Number.isNaN(t)?0:t};class d{tableModule;quill;options;tableBlot=null;selectTd=null;cellSelect;boundary=null;selectTool;constructor(e,s,i={}){this.tableModule=e,this.quill=s,this.options=this.resolveOptions(i),this.cellSelect=this.quill.addContainer("ql-table-selection"),this.selectTool=this.buildTools(),this.quill.root.addEventListener("mousedown",this.destory),this.quill.root.addEventListener("scroll",this.destory),this.quill.on(t.events.EDITOR_CHANGE,((e,s,i,l)=>{if(e===t.events.SELECTION_CHANGE&&s){const[e]=this.quill.scroll.descendant(a,s.index);if(!e)return;this.selectTd=e,this.updateSelectBox()}else this.destory()}))}resolveOptions=e=>Object.assign({selectColor:"#0589f3",tools:r},e);buildTools=()=>{const e=this.quill.addContainer("ql-table-selection-tool");for(const t of this.options.tools){const{name:s,icon:i,handle:l,tip:a=""}=t;let r=document.createElement("span");r.classList.add("ql-table-selection-item"),"break"===s?r.classList.add("break"):(r.classList.add("icon"),r.innerHTML=i,n(l)&&r.addEventListener("click",(()=>{this.quill.focus(),l(this.tableModule)})),a&&(r=o(r,{msg:a,delay:150}))),e.appendChild(r)}return e};remove=()=>{Object.assign(this.cellSelect.style,{display:"none"}),Object.assign(this.selectTool.style,{display:"none"}),this.selectTd=null};destory=()=>{this.remove(),this.tableBlot=null};updateSelectBox=()=>{if(!this.selectTd)return;const e=this.quill.container.getBoundingClientRect();this.boundary=((e,t)=>({x:e.x-t.x,y:e.y-t.y,width:e.width,height:e.height}))(this.selectTd.domNode.getBoundingClientRect(),e),Object.assign(this.cellSelect.style,{"border-color":this.options.selectColor,display:"block",left:this.boundary.x-1+"px",top:this.boundary.y-1+"px",width:`${this.boundary.width+1}px`,height:`${this.boundary.height+1}px`}),Object.assign(this.selectTool.style,{display:"flex",left:this.boundary.x+this.boundary.width/2-1+"px",top:`${this.boundary.y+this.boundary.height}px`,transform:"translate(-50%, 20%)"});const{paddingLeft:t,paddingRight:s}=getComputedStyle(this.quill.root),i=this.selectTool.getBoundingClientRect();i.right>e.right-c(s)?Object.assign(this.selectTool.style,{left:e.right-e.left-i.width-c(s)-1-12+"px",transform:"translate(0%, 100%)"}):i.left<c(t)&&Object.assign(this.selectTool.style,{left:`${c(t)+1+12}px`,transform:"translate(0%, 100%)"})}}const h=t.import("ui/icons"),m=t.import("modules/table");e.default=class extends m{constructor(e,t){super(e,t),this.options=this.resolveOptions(t||{});const s=this.quill.getModule("toolbar"),[,i]=(s.controls||[]).find((([e])=>"table"===e))||[];if(i&&"select"===i.tagName.toLocaleLowerCase()){if(this.picker=this.quill.theme.pickers.find((e=>e.select===i)),!this.picker)return;this.picker.label.innerHTML=h.table,this.buildCustomSelect(this.options.customSelect),this.picker.label.addEventListener("mousedown",this.handleInViewport)}this.selection=new d(this,this.quill,this.options.selection)}handleInViewport=()=>{if(this.selector.getBoundingClientRect().right>=window.innerWidth){const e=this.picker.label.getBoundingClientRect();this.picker.options.style.transform=`translateX(calc(-100% + ${e.width}px))`}else this.picker.options.style.transform=void 0};resolveOptions=e=>Object.assign({isCustom:!0,texts:this.resolveTexts(e.texts||{})},e);resolveTexts=e=>Object.assign({customBtn:"自定义行列数",confirmText:"确认",cancelText:"取消",rowText:"行数",colText:"列数"},e);buildCustomSelect=async e=>{const t=document.createElement("div");t.classList.add("ql-custom-select"),this.selector=e&&n(e)?await e(this):this.createSelect(),t.appendChild(this.selector),this.picker.options.appendChild(t)};createSelect=()=>((e={})=>{const t=document.createElement("div");t.classList.add("select-box");const s=document.createElement("div");s.classList.add("select-box__block");for(let t=0;t<(e.row||8);t++)for(let i=0;i<(e.col||8);i++){const e=document.createElement("div");e.classList.add("select-box__item"),e.dataset.row=String(t+1),e.dataset.col=String(i+1),s.appendChild(e)}const i=()=>{const{row:e,col:i}=t.dataset;for(const e of Array.from(s.querySelectorAll(".active")))e.classList.remove("active");if(!e||!i)return;const l=Array.from(s.children);for(let t=0;t<l.length;t++){const{row:s,col:o}=l[t].dataset;if(s>e&&o>i)return;s<=e&&o<=i?l[t].classList.add("active"):l[t].classList.remove("active")}};if(s.addEventListener("mousemove",(e=>{if(!e.target)return;const{row:s,col:l}=e.target.dataset;s&&l&&(t.dataset.row=s,t.dataset.col=l,i())})),s.addEventListener("mouseleave",(()=>{t.removeAttribute("data-row"),t.removeAttribute("data-col"),i()})),s.addEventListener("click",(()=>{const{row:s,col:i}=t.dataset;s&&i&&e.onSelect&&e.onSelect(Number(s),Number(i))})),t.appendChild(s),e.isCustom){const s=document.createElement("div");s.classList.add("select-box__custom"),s.textContent=e.customText||"自定义行列数",s.addEventListener("click",(async()=>{const t=await l({confirmText:e.confirmText,cancelText:e.cancelText,rowText:e.rowText,colText:e.colText});t&&e.onSelect&&e.onSelect(t.row,t.col)})),t.appendChild(s)}return t})({onSelect:(e,t)=>{this.insertTable(e,t),this.picker.close()},isCustom:this.options.isCustom,customText:this.options.texts.customBtn});insertTable=(e,t)=>{this.quill.focus(),super.insertTable(e,t)}},Object.defineProperty(e,"__esModule",{value:!0})}));
