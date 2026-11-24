// Reference pinouts: Allegro A3141–A3144 datasheet (branded side), Arduino HC-SR04 datasheet, Funduino KY-006 (middle NC).
const definitions={
 a3144:{w:104,h:154,p:[['VCC',24,77],['GND',52,77],['OUT',80,77]],art:'<path d="M24 55v22m28-22v22m28-22v22" stroke="#bcc8c5" stroke-width="3"/><path d="M16 51V17Q16 5 29 5H75Q88 5 88 17V51Z" fill="#273236" stroke="#8a9b9b"/><text x="52" y="30">A3144</text><text class="reading" x="52" y="46" style="font-size:8px">Нет магнита</text><text x="24" y="91">VCC</text><text x="52" y="91">GND</text><text x="80" y="91">OUT</text>',control:'<button type="button" aria-label="Магнит A3144" aria-pressed="false">🧲 Магнит</button>'},
 ultrasonic:{w:202,h:155,p:[['VCC',59,94],['TRIG',87,94],['ECHO',115,94],['GND',143,94]],art:'<rect x="2" y="2" width="198" height="78" rx="8" fill="#246e9e" stroke="#7eabc0"/><circle cx="46" cy="37" r="29" fill="#bac4c6" stroke="#edf5f6" stroke-width="3"/><circle cx="156" cy="37" r="29" fill="#bac4c6" stroke="#edf5f6" stroke-width="3"/><circle cx="46" cy="37" r="22" fill="#414e54"/><circle cx="156" cy="37" r="22" fill="#414e54"/><text x="101" y="17" style="font-size:8px">HC-SR04</text><text class="reading" x="101" y="75">100 см</text><path d="M59 80v14m28-14v14m28-14v14m28-14v14" stroke="#bcc8c5" stroke-width="3"/><g style="font-size:8px"><text x="59" y="107">VCC</text><text x="87" y="107">TRIG</text><text x="115" y="107">ECHO</text><text x="143" y="107">GND</text></g>',control:'<input type="range" aria-label="Расстояние HC-SR04, см" min="2" max="400" step="1" value="100">'},
 'ky-006':{w:102,h:119,p:[['S',23,112],['NC',51,112],['GND',79,112]],art:'<rect x="6" y="3" width="90" height="91" rx="7" fill="#245646" stroke="#7b9f87"/><circle cx="51" cy="40" r="30" fill="#1c2325" stroke="#657678"/><circle cx="51" cy="40" r="6" fill="#080b0c"/><text x="51" y="84">KY-006</text><text x="23" y="102">S</text><text x="51" y="102">NC</text><text x="79" y="102">−</text><path d="M23 104v8m28-8v8m28-8v8" stroke="#bcc8c5" stroke-width="3"/><text class="frequency" x="51" y="64" style="font-size:8px"></text>',control:''}
};
for(const [type,d]of Object.entries(definitions)){
 customElements.define('wokwi-sim-'+type,class extends HTMLElement{
  constructor(){
   super();this._value=type==='ultrasonic'?100:0;this.pinInfo=d.p.map(([name,x,y])=>({name,x,y,signals:[]}));
   this.attachShadow({mode:'open'}).innerHTML=`<style>:host{display:inline-block;width:${d.w}px;height:${d.h}px;user-select:none}svg{display:block;overflow:visible}text{fill:#dbe7e1;text-anchor:middle;font:700 10px ui-monospace,monospace}.control{position:absolute;top:117px;left:0;width:100%;display:flex;justify-content:center}button{background:#283d35;border:1px solid #8da66b;color:#d1f76b;border-radius:8px;padding:7px;cursor:pointer}input{width:170px;height:28px;accent-color:#d1f76b;touch-action:none}.part{position:relative}</style><div class="part"><svg width="${d.w}" height="${d.h}" viewBox="0 0 ${d.w} ${d.h}">${d.art}</svg><div class="control">${d.control}</div></div>`;
   const control=this.shadowRoot.querySelector('button,input');
   control?.addEventListener('pointerdown',e=>e.stopPropagation());
   control?.addEventListener(type==='a3144'?'click':'input',e=>{
    e.stopPropagation();this.value=type==='a3144'?!this._value:Number(control.value);
    this.dispatchEvent(new InputEvent('input',{bubbles:true,composed:true}));
   });
   this.updateComplete=Promise.resolve();
  }
  get value(){return this._value;}
  set value(v){
   this._value=type==='ultrasonic'?Math.max(2,Math.min(400,Number(v)||100)):Number(Boolean(Number(v)));
   const reading=this.shadowRoot.querySelector('.reading'),button=this.shadowRoot.querySelector('button'),range=this.shadowRoot.querySelector('input');
   if(reading)reading.textContent=type==='ultrasonic'?this._value+' см':this._value?'Магнит рядом':'Нет магнита';
   if(button){button.setAttribute('aria-pressed',String(!!this._value));button.textContent=this._value?'🧲 Убрать магнит':'🧲 Магнит';}
   if(range)range.value=this._value;
  }
  set frequency(v){const t=this.shadowRoot.querySelector('.frequency');if(t)t.textContent=v>0?Math.round(v)+' Hz':'';}
 });
}
