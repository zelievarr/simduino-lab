import {logicTypes} from './logic-model.js';
for(const type of logicTypes){
 class LogicElement extends HTMLElement{
  constructor(){
   super();
   this.pinInfo=[{name:'A',x:0,y:30,signals:[]},...(type==='not'?[]:[{name:'B',x:0,y:66,signals:[]}]),...(type==='mux'?[{name:'S',x:62,y:104,signals:[]}]:[]),{name:'Y',x:124,y:48,signals:[]}];
   this.attachShadow({mode:'open'}).innerHTML=`<style>
    :host{display:inline-block;width:124px;height:104px;font-family:ui-monospace,monospace;color:#dce6e0;user-select:none}
    .chip{position:relative;width:124px;height:104px}.body{position:absolute;inset:10px 12px 18px;border:1px solid #71817a;border-radius:12px;background:linear-gradient(135deg,#35463c,#19251f);box-shadow:0 5px 12px #0005}
    strong{display:block;text-align:center;margin-top:21px;font-size:16px;color:#d1f76b}small{display:block;text-align:center;font-size:8px;color:#9baea1;margin-top:5px}.label{position:absolute;font-size:9px}.a{left:17px;top:24px}.b{left:17px;top:60px}.y{right:17px;top:42px}.s{left:59px;top:71px}
    svg{position:absolute;inset:0;pointer-events:none}line{stroke:#c3d0c8;stroke-width:3}.state{position:absolute;right:31px;top:46px;width:6px;height:6px;border-radius:50%;background:#56645c}:host([high]) .state{background:#d1f76b;box-shadow:0 0 8px #d1f76b}
   </style><div class="chip"><svg width="124" height="104"><line x1="0" y1="30" x2="12" y2="30"/>${type==='not'?'':'<line x1="0" y1="66" x2="12" y2="66"/>'}<line x1="112" y1="48" x2="124" y2="48"/>${type==='mux'?'<line x1="62" y1="86" x2="62" y2="104"/>':''}</svg><div class="body"><strong>${type.toUpperCase()}</strong><small>${type==='mux'?'2 → 1 · S=0: A · S=1: B':'DIGITAL LOGIC'}</small></div><span class="label a">A</span>${type==='not'?'':'<span class="label b">B</span>'}<span class="label y">Y</span>${type==='mux'?'<span class="label s">S</span>':''}<i class="state"></i></div>`;
   this.updateComplete=Promise.resolve();
  }
  set output(value){this.toggleAttribute('high',value>=2.5);}
 }
 customElements.define(`wokwi-sim-logic-${type}`,LogicElement);
}
