import {clampTMP36Temperature} from './tmp36-model.js';

class TMP36Element extends HTMLElement{
 constructor(){
  super();this._value=25;this.pinInfo=[{name:'VCC',x:12,y:66,signals:[]},{name:'OUT',x:32,y:66,signals:[]},{name:'GND',x:52,y:66,signals:[]}];
  const root=this.attachShadow({mode:'open'});root.innerHTML=`<style>
   :host{display:inline-block;width:64px;height:142px;color:#dfe7e3;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;user-select:none}
   .sensor{position:relative;width:64px;height:72px}
   input{position:absolute;left:-20px;top:104px;width:104px;height:26px;margin:0;accent-color:#d1f76b;cursor:pointer;touch-action:none}
  </style><div class="sensor"><svg width="64" height="142" viewBox="0 0 64 142" style="display:block">
  <path d="M12 48v18m20-18v18m20-18v18" stroke="#bac4c3" stroke-width="2"/>
  <path d="M9 43V25a23 23 0 0 1 46 0v18q0 8-8 8H17q-8 0-8-8Z" fill="#232d31" stroke="#839295"/>
  <g text-anchor="middle" font-family="monospace"><text x="32" y="29" fill="#e8ecea" font-size="9" font-weight="800">TMP36</text>
  <text class="reading" x="32" y="41" fill="#9fd6b0" font-size="8">25 °C</text>
  <text y="77" font-size="7" fill="#a1b1aa"><tspan x="12">+Vs</tspan><tspan x="32">OUT</tspan><tspan x="52">GND</tspan></text></g></svg><input aria-label="Температура TMP36" type="range" min="-40" max="125" value="25"></div>`;
  this._range=root.querySelector('input');this._reading=root.querySelector('.reading');
  this._range.addEventListener('pointerdown',event=>event.stopPropagation());
  this._range.addEventListener('input',()=>{this._value=Number(this._range.value);this._paint();this.dispatchEvent(new InputEvent('input',{bubbles:true,composed:true}));});
  this.updateComplete=Promise.resolve();
 }
 get value(){return this._value;}
 set value(next){this._value=clampTMP36Temperature(next);if(this._range){this._range.value=String(this._value);this._paint();}}
 _paint(){this._reading.textContent=`${this._value} °C`;}
}

if(!customElements.get('wokwi-tmp36'))customElements.define('wokwi-tmp36',TMP36Element);
