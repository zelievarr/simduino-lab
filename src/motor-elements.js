import {bridgePins,bridgeTypes,breadboardColumns} from './motor-model.js';
const definitions={
 'dc-motor':{w:138,h:92,p:[['+',0,25],['-',0,68]],art:'<rect x="12" y="6" width="120" height="80" rx="14" fill="#35434a" stroke="#84999e"/><circle cx="50" cy="46" r="29" fill="#192023" stroke="#788c93"/><g class="rotor"><circle cx="50" cy="46" r="18" fill="#a8bac0"/><path d="M50 30v13m16 3H53M50 62V49M34 46h13" stroke="#465c63" stroke-width="4"/></g><text x="103" y="38">DC</text><text class="speed" x="103" y="59">0%</text>'},
 battery9:{w:76,h:115,p:[['V+',20,0],['GND',55,0]],art:'<rect x="6" y="13" width="64" height="97" rx="8" fill="#242a2d" stroke="#9d866e"/><path d="M7 22Q7 14 15 14H61Q69 14 69 22V50H7Z" fill="#aa6438"/><text x="20" y="32">+</text><text x="55" y="32">−</text><text x="38" y="75" style="font-size:21px">9 V</text>'},
 npn:{w:92,h:89,p:[['C',18,89],['B',46,89],['E',74,89]],art:'<path d="M12 62V35a34 32 0 0 1 68 0v27Z" fill="#252d31" stroke="#9ba8ad"/><text x="46" y="40">NPN</text><text x="18" y="57">C</text><text x="46" y="57">B</text><text x="74" y="57">E</text>'},
 diode:{w:104,h:32,p:[['A',0,16],['K',104,16]],art:'<rect x="16" y="5" width="72" height="22" rx="6" fill="#191d20" stroke="#747e84"/><path d="M77 6v20" stroke="#cbd2d4" stroke-width="5"/><text x="48" y="20">1N4004</text>'},
 capacitor:{w:62,h:75,p:[['1',17,75],['2',45,75]],art:'<ellipse cx="31" cy="29" rx="26" ry="24" fill="#c78b32" stroke="#f6c16f"/><text x="31" y="33">1 µF</text>'}
};
for(const type of bridgeTypes)definitions[type]={w:206,h:194,p:bridgePins.map((pin,i)=>[pin,i<8?0:206,20+(i<8?i:15-i)*22]),art:`<rect x="17" y="3" width="172" height="188" rx="8" fill="#263035" stroke="#a2aeb2"/><path d="M94 3a9 9 0 0 0 18 0" fill="none" stroke="#a2aeb2"/><circle cx="27" cy="12" r="3" fill="#c3d1d5"/><text x="103" y="91">${type.toUpperCase()}</text><text x="103" y="108">H-BRIDGE</text>${bridgePins.map((pin,i)=>`<text x="${i<8?25:181}" y="${24+(i<8?i:15-i)*22}" style="text-anchor:${i<8?'start':'end'};font-size:9px">${i+1} ${pin.split('.')[0]}</text>`).join('')}`};
const boardPins=[];
for(let i=1;i<=breadboardColumns;i++){
 const x=24+(i-1)*20;
 ['+1','-1',...'ABCDE',...'FGHIJ','+2','-2'].forEach((row,j)=>boardPins.push([row.length>1?row+'.'+i:row+i,x,[22,42,75,95,115,135,155,193,213,233,253,273,307,327][j]]));
}
definitions.breadboard={w:628,h:349,p:boardPins,art:`<rect x="1" y="1" width="626" height="347" rx="12" fill="#dddcd0" stroke="#a9a59b"/><rect x="2" y="166" width="624" height="16" fill="#aaa99f"/>${[12,32,297,317].map((y,i)=>`<path d="M12 ${y}H616" stroke="${i%2?'#4e74b1':'#cf5058'}"/>`).join('')}${boardPins.map(([,x,y])=>`<rect x="${x-3.5}" y="${y-3.5}" width="7" height="7" rx="1.5" fill="#404442"/>`).join('')}${Array.from({length:30},(_,i)=>`<text x="${24+i*20}" y="62" style="fill:#65675e;font-size:7px">${i+1}</text>`).join('')}`};
for(const [type,{w,h,p,art}] of Object.entries(definitions)){
 customElements.define('wokwi-sim-'+type,class extends HTMLElement{
  constructor(){
   super();this.pinInfo=p.map(([name,x,y])=>({name,x,y,signals:[]}));
   const leads=type==='breadboard'?'':p.map(([,x,y])=>`<line x1="${x}" y1="${y}" x2="${x===0?18:x===w?w-18:x}" y2="${y===0?18:y===h?(type==='npn'?60:47):y}" stroke="#bcc8c9" stroke-width="3"/>`).join('');
   this.attachShadow({mode:'open'}).innerHTML=`<style>:host{display:inline-block;width:${w}px;height:${h}px} svg{display:block;overflow:visible}text{fill:#e1eee8;text-anchor:middle;font:700 11px ui-monospace,monospace}.rotor{transform-origin:50px 46px}</style><svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${leads}${art}</svg>`;
   this.updateComplete=Promise.resolve();
  }
  set motorSpeed(value){
   const rotor=this.shadowRoot.querySelector('.rotor'),label=this.shadowRoot.querySelector('.speed');
   if(!rotor||!label)return;
   label.textContent=Math.abs(value)<.005?'0%':(value<0?'−':'+')+Math.round(Math.abs(value)*100)+'%';
   if(Math.abs(value)<.005){this.spin?.cancel();this.spin=null;return;}
   this.spin??=rotor.animate([{transform:'rotate(0deg)'},{transform:'rotate(360deg)'}],{duration:450,iterations:Infinity});
   this.spin.updatePlaybackRate(value);
  }
 });
}
