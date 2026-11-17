import {logicTypes} from './logic-model.js';
for(const type of logicTypes){
 class LogicElement extends HTMLElement{
  constructor(){
   super();
   this.pinInfo=[{name:'A',x:0,y:30,signals:[]},...(type==='not'?[]:[{name:'B',x:0,y:66,signals:[]}]),...(type==='mux'?[{name:'S',x:62,y:104,signals:[]}]:[]),{name:'Y',x:124,y:48,signals:[]}];
   this.attachShadow({mode:'open'}).innerHTML=`<style>
    :host{display:inline-block;width:124px;height:104px;font-family:ui-monospace,monospace;color:#dce6e0;user-select:none}
    svg{display:block;overflow:visible}line{stroke:#c3d0c8;stroke-width:3}.state{fill:#56645c}:host([high]) .state{fill:#d1f76b}
   </style><svg width="124" height="104" viewBox="0 0 124 104">
    <line x1="0" y1="30" x2="12" y2="30"/>${type==='not'?'':'<line x1="0" y1="66" x2="12" y2="66"/>'}
    <line x1="112" y1="48" x2="124" y2="48"/>${type==='mux'?'<line x1="62" y1="86" x2="62" y2="104"/>':''}
    <rect x="12" y="10" width="100" height="76" rx="12" fill="#293a31" stroke="#71817a"/>
    <text x="62" y="44" text-anchor="middle" font-size="16" font-weight="800" fill="#d1f76b">${type.toUpperCase()}</text>
    <text x="62" y="60" text-anchor="middle" font-size="8" fill="#abbfb0">${type==='mux'?'S=0: A · S=1: B':'DIGITAL LOGIC'}</text>
    <g font-size="9" fill="#dce6e0"><text x="17" y="33">A</text>${type==='not'?'':'<text x="17" y="69">B</text>'}
    <text x="101" y="51">Y</text>${type==='mux'?'<text x="59" y="81">S</text>':''}</g><circle class="state" cx="93" cy="48" r="3"/>
   </svg>`;
   this.updateComplete=Promise.resolve();
  }
  set output(value){this.toggleAttribute('high',value>=2.5);}
 }
 customElements.define(`wokwi-sim-logic-${type}`,LogicElement);
}
