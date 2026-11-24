import test from 'node:test';
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {readFile} from 'node:fs/promises';
import {examples,makeProject} from '../src/examples.js';
const firmware=JSON.parse(await readFile(new URL('../dist/firmware.json',import.meta.url)));
async function simulate(id,duration=2,modify){
 const worker=new Worker(new URL('./worker-harness.mjs',import.meta.url));const ex=examples.find(x=>x.id===id);const p=makeProject(ex);modify?.(p);const frames=[],lines=[];
 try{return await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error(`${id}: emulation timed out`)),20000);worker.on('error',reject);worker.on('message',d=>{if(d.type==='error'){clearTimeout(timeout);reject(Error(d.message));}if(d.type==='serial')lines.push(d.line);if(d.type==='frame'){frames.push(d);if(d.seconds>=duration){clearTimeout(timeout);resolve({frames,lines});}}});worker.postMessage({type:'start',project:p,hex:firmware[id].hex,inputs:id==='button'?{btn:1}:{}});});}finally{await worker.terminate();}
}
test('AVR executes real blink firmware and drives the wired LED',async()=>{const{frames,lines}=await simulate('blink',2.2);assert.ok(lines.includes('Hello, SIMduino lab!'));assert.ok(lines.includes('LED: ON'));assert.ok(lines.includes('LED: OFF'));assert.ok(frames.some(f=>f.outputs.led1.brightness>.9));assert.ok(frames.some(f=>f.seconds>1.1&&f.outputs.led1.brightness<.1));});
test('disconnecting LED cathode prevents illumination',async()=>{const{frames}=await simulate('blink',.3,p=>p.wires=p.wires.filter(w=>w.from!=='led1:C'));assert.ok(frames.every(f=>f.outputs.led1.brightness===0));});
test('INPUT_PULLUP button changes digitalRead and external LED',async()=>{const{frames,lines}=await simulate('button',.4);assert.ok(lines.includes('PRESSED'));assert.ok(frames.some(f=>f.outputs.led1.brightness>.9));});
test('analogRead uses connected potentiometer voltage',async()=>{const{lines}=await simulate('pot',.8);assert.ok(lines.some(l=>/A0: 51[12]/.test(l)),JSON.stringify(lines));});
test('TMP36 produces the correct analog voltage for its temperature',async()=>{const{lines}=await simulate('pot',.8,p=>{const sensor=p.parts.find(part=>part.id==='pot1');sensor.type='tmp36';sensor.attrs.value=25;p.wires.forEach(w=>{w.from=w.from.replace('pot1:SIG','pot1:OUT');w.to=w.to.replace('pot1:SIG','pot1:OUT');});});assert.ok(lines.some(l=>/A0: 15[23]/.test(l)),JSON.stringify(lines));});
test('PWM duty cycle produces intermediate brightness',async()=>{const{frames}=await simulate('fade',1.2);assert.ok(frames.some(f=>f.outputs.led1.brightness>.15&&f.outputs.led1.brightness<.8));});
test('servo pulses decode to a changing angle',async()=>{const{frames}=await simulate('servo',1);assert.ok(frames.at(-1).outputs.sv.angle>40);});
test('tone is decoded into the requested frequencies',async()=>{const{frames}=await simulate('tone',.7);assert.ok(frames.some(f=>Math.abs(f.outputs.bz.frequency-523)<8));assert.ok(frames.some(f=>Math.abs(f.outputs.bz.frequency-784)<8));});
test('MUX and cascaded gates carry real Arduino output to an LED',async()=>{
 const{frames}=await simulate('blink',1.3,p=>{
  p.parts.push({id:'mux1',type:'mux',attrs:{}},{id:'not1',type:'not',attrs:{}});
  p.wires=p.wires.filter(w=>w.from!=='uno:13');
  p.wires.push(...[['uno:13','mux1:B'],['uno:GND.1','mux1:A'],['uno:5V','mux1:S'],['mux1:Y','not1:A'],['not1:Y','r1:1']].map(([from,to])=>({from,to})));
 });
 assert.ok(frames.some(f=>f.outputs.mux1.logic===5&&f.outputs.not1.logic===0&&f.outputs.led1.brightness<.1));
 assert.ok(frames.some(f=>f.seconds>1.1&&f.outputs.mux1.logic===0&&f.outputs.not1.logic===5&&f.outputs.led1.brightness>.9));
});
test('logic output drives Arduino digitalRead',async()=>{
 const{lines}=await simulate('button',.4,p=>{
  p.parts.push({id:'gate',type:'and',attrs:{}});
  p.wires=p.wires.filter(w=>!w.from.startsWith('btn:'));
  p.wires.push(...[['uno:5V','gate:A'],['uno:GND.1','gate:B'],['gate:Y','uno:2']].map(([from,to])=>({from,to})));
 });
 assert.ok(lines.includes('PRESSED'));
});
test('PWM drives a 9V motor through NPN and connected breadboard holes',async()=>{
 const {frames}=await simulate('fade',1.9,p=>{
  p.parts.push(...[['motor','dc-motor'],['q','npn'],['bat','battery9'],['board','breadboard']].map(([id,type])=>({id,type,attrs:{}})));
  p.wires=[['uno:9','r1:1'],['r1:2','board:A1'],['board:E1','q:B'],['q:C','motor:-'],['q:E','board:-1.1'],['bat:GND','board:-1.2'],['uno:GND.1','board:-1.3'],['bat:V+','motor:+']].map(([from,to])=>({from,to}));
 });
 assert.ok(frames.some(f=>f.seconds<.15&&f.outputs.motor.motorSpeed<.1));
 assert.ok(frames.some(f=>f.seconds>1.5&&f.outputs.motor.motorSpeed>.6));
});
test('SN754410 drives two motors independently with signed direction',async()=>{
 const {frames}=await simulate('blink',1.3,p=>{
  p.parts.push(...[['m1','dc-motor'],['m2','dc-motor'],['chip','sn754410'],['bat','battery9']].map(([id,type])=>({id,type,attrs:{}})));
  p.wires=[['uno:5V','chip:VCC1'],['bat:V+','chip:VCC2'],['bat:GND','uno:GND.1'],['chip:GND.13','uno:GND.1'],['uno:5V','chip:1,2EN'],['uno:13','chip:3,4EN'],['uno:13','chip:1A'],['uno:GND.1','chip:2A'],['uno:GND.1','chip:3A'],['uno:5V','chip:4A'],['chip:1Y','m1:+'],['chip:2Y','m1:-'],['chip:3Y','m2:+'],['chip:4Y','m2:-']].map(([from,to])=>({from,to}));
 });
 assert.ok(frames.some(f=>f.outputs.m1.motorSpeed===1&&f.outputs.m2.motorSpeed===-1));
 assert.ok(frames.some(f=>f.seconds>1.1&&f.outputs.m1.motorSpeed===0&&f.outputs.m2.motorSpeed===0));
});
test('KY-006 receives tone frequency on S with its middle pin unused',async()=>{
 const {frames}=await simulate('tone',.7,p=>{
  p.parts.find(x=>x.id==='bz').type='ky-006';
  p.wires.forEach(w=>{w.from=w.from.replace('bz:1','bz:GND').replace('bz:2','bz:S');w.to=w.to.replace('bz:1','bz:GND').replace('bz:2','bz:S');});
 });
 assert.ok(frames.some(f=>Math.abs(f.outputs.bz.frequency-523)<8));
 assert.ok(frames.some(f=>Math.abs(f.outputs.bz.frequency-784)<8));
});
for(const magnet of [0,1])test('A3144 open collector with INPUT_PULLUP, magnet '+magnet,async()=>{
 const {lines}=await simulate('button',.3,p=>{
  p.parts=p.parts.filter(x=>x.id!=='btn');p.parts.push({id:'hall',type:'a3144',attrs:{value:magnet}});
  p.wires=p.wires.filter(w=>!w.from.startsWith('btn:'));
  p.wires.push(...[['hall:OUT','uno:2'],['hall:VCC','uno:5V'],['hall:GND','uno:GND.1']].map(([from,to])=>({from,to})));
 });
 assert.ok(lines.includes(magnet?'PRESSED':'RELEASED'),JSON.stringify(lines));
});
test('HC-SR04 creates a timed echo from an AVR trigger and digitalRead sees it',async()=>{
 const instructions=[0xe202,0xb904,0xe002,0xb905,...Array(200).fill(0),0xe000,0xb905,0xb103,0x7001,...Array(5).fill(0x0f00),0xb905,0xcff7];
 const bytes=instructions.flatMap(w=>[w&255,w>>8]);let hex='';
 for(let i=0;i<bytes.length;i+=16){
  const row=[Math.min(16,bytes.length-i),i>>8,i&255,0,...bytes.slice(i,i+16)];
  row.push((-row.reduce((a,b)=>a+b,0))&255);hex+=':'+row.map(v=>v.toString(16).padStart(2,'0')).join('')+'\n';
 }
 hex+=':00000001FF';
 const p={parts:[{id:'uno',type:'uno',attrs:{}},{id:'sensor',type:'ultrasonic',attrs:{value:400}},{id:'led',type:'led',attrs:{}}],wires:[['uno:9','sensor:TRIG'],['sensor:ECHO','uno:8'],['sensor:VCC','uno:5V'],['sensor:GND','uno:GND.1'],['uno:13','led:A'],['led:C','uno:GND.1']].map(([from,to])=>({from,to}))};
 const worker=new Worker(new URL('./worker-harness.mjs',import.meta.url));const frames=[];
 try{
  await new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>reject(Error('echo timeout')),5000);
   worker.on('error',reject);worker.on('message',d=>{if(d.type==='error'){clearTimeout(timeout);reject(Error(d.message));}
    if(d.type==='frame'){frames.push(d);if(d.seconds>.06){clearTimeout(timeout);resolve();}}});
   worker.postMessage({type:'start',project:p,hex});
  });
  assert.ok(frames.some(f=>f.outputs.led.brightness>.8));
  assert.ok(frames.some(f=>f.seconds>.04&&f.outputs.led.brightness===0));
 }finally{await worker.terminate();}
});
