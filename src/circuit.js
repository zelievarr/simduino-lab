// Connectivity, not an analog SPICE solver. Resistors carry digital signals.
export function buildNets(parts,wires,inputs={}) {
 const parent = new Map();
 const root = k => { if(!parent.has(k))parent.set(k,k);let r=k;while(parent.get(r)!==r)r=parent.get(r);while(k!==r){let n=parent.get(k);parent.set(k,r);k=n;}return r;};
 const join=(a,b)=>parent.set(root(a),root(b));
 for(const w of wires)join(w.from,w.to);
 for(const p of parts){
   const j=(a,b)=>join(`${p.id}:${a}`,`${p.id}:${b}`);
   if(p.type==='uno'){j('GND.1','GND.2');j('GND.1','GND.3');j('A4','A4.2');j('A5','A5.2');}
   if(p.type==='resistor')j('1','2');
   if(p.type==='button'||p.type==='button6'){j('1.l','1.r');j('2.l','2.r');if(inputs[p.id])j('1.l','2.l');}
   if(p.type==='switch')j('2',inputs[p.id]?'3':'1');
 }
 return { root, same:(a,b)=>root(a)===root(b), members:k=>[...parent.keys()].filter(x=>root(x)===root(k)) };
}
export function validateCircuit(project) {
 if(project.parts.filter(p=>p.type==='uno').length!==1)throw Error('Добавьте ровно одну Arduino Uno на схему.');
 const uno=project.parts.find(p=>p.type==='uno').id;
 // Check direct shorts separately: a resistor is not a short circuit.
 const nets=buildNets(project.parts.filter(p=>p.type!=='resistor'),project.wires);
 if(nets.same(`${uno}:5V`,`${uno}:GND.1`)||nets.same(`${uno}:3.3V`,`${uno}:GND.1`))throw Error('Короткое замыкание: питание соединено с GND. Удалите этот провод перед запуском.');
 const warnings=[];
 for(const p of project.parts.filter(p=>p.type==='led')){
  if(!project.wires.some(w=>w.from===`${p.id}:A`||w.to===`${p.id}:A`)||!project.wires.some(w=>w.from===`${p.id}:C`||w.to===`${p.id}:C`))warnings.push(`${p.id}: подключите оба вывода светодиода.`);
  else if(!project.parts.some(r=>r.type==='resistor'&&(nets.same(`${p.id}:A`,`${r.id}:1`)||nets.same(`${p.id}:A`,`${r.id}:2`)||nets.same(`${p.id}:C`,`${r.id}:1`)||nets.same(`${p.id}:C`,`${r.id}:2`))))warnings.push(`${p.id}: в цепи светодиода нет ограничивающего резистора.`);
 }
 return warnings;
}
export function loadHex(hex) {
 const data=new Uint8Array(32768); let base=0,eof=false,count=0;
 for(const line of hex.trim().split(/\r?\n/)){
  if(!/^:[\da-fA-F]+$/.test(line)||line.length%2!==1)throw Error('Некорректный Intel HEX.');
  const bytes=Uint8Array.from(line.slice(1).match(/../g).map(n=>parseInt(n,16)));
  if(bytes.length!==bytes[0]+5||bytes.reduce((a,b)=>a+b,0)%256)throw Error('Неверная контрольная сумма HEX.');
  const size=bytes[0],type=bytes[3],addr=(bytes[1]<<8)|bytes[2];
  if(type===0){if(base+addr+size>data.length)throw Error('Прошивка больше памяти Arduino Uno (32 КБ).');data.set(bytes.slice(4,4+size),base+addr);count+=size;}
  else if(type===1){eof=true;break;}
  else if(type===4){base=((bytes[4]<<8)|bytes[5])*65536;}
  else if(type===2){base=((bytes[4]<<8)|bytes[5])*16;}
 }
 if(!eof||!count)throw Error('HEX не содержит завершённую прошивку.');
 return new Uint16Array(data.buffer);
}
