import {clampTMP36Temperature} from './tmp36-model.js';

class TMP36Element extends HTMLElement{
 constructor(){
  super();this._value=25;this.pinInfo=[{name:'VCC',x:12,y:66,signals:[]},{name:'OUT',x:32,y:66,signals:[]},{name:'GND',x:52,y:66,signals:[]}];
  const root=this.attachShadow({mode:'open'});root.innerHTML=`<style>
   :host{display:inline-block;width:64px;height:142px;color:#dfe7e3;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;user-select:none}
   .sensor{position:relative;width:64px;height:72px}
   .body{position:absolute;left:9px;top:2px;width:46px;height:49px;border-radius:24px 24px 8px 8px;background:linear-gradient(110deg,#374148,#171d21 58%,#0d1114);border:1px solid #66737a;box-shadow:inset 5px 0 9px #ffffff12,0 6px 10px #0007}
   .body:after{content:'';position:absolute;left:7px;top:6px;width:9px;height:25px;border-radius:50%;background:linear-gradient(90deg,#ffffff20,transparent)}
   .name{position:absolute;inset:19px 0 auto;text-align:center;font-size:9px;font-weight:800;letter-spacing:.4px;color:#e8ecea}.reading{position:absolute;inset:31px 0 auto;text-align:center;font-size:8px;color:#9fd6b0}
   .leg{position:absolute;top:50px;width:2px;height:18px;background:linear-gradient(90deg,#859090,#d7dddd,#6e797a);border-radius:1px}.vcc{left:11px;transform:rotate(5deg);transform-origin:top}.out{left:31px}.gnd{left:51px;transform:rotate(-5deg);transform-origin:top}
   .pins{position:absolute;top:68px;left:0;right:0;display:flex;justify-content:space-between;padding:0 2px;color:#7f918b;font-size:7px}.pins span{width:20px;text-align:center}
   input{position:absolute;left:-20px;top:104px;width:104px;height:26px;margin:0;accent-color:#d1f76b;cursor:pointer;touch-action:none}
  </style><div class="sensor"><div class="body"><span class="name">TMP36</span><span class="reading">25 °C</span></div><i class="leg vcc"></i><i class="leg out"></i><i class="leg gnd"></i><div class="pins"><span>+Vs</span><span>OUT</span><span>GND</span></div><input aria-label="Температура TMP36" type="range" min="-40" max="125" value="25"></div>`;
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
