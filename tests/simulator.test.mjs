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
test('AVR executes real blink firmware and drives the wired LED',async()=>{const{frames,lines}=await simulate('blink',2.2);assert.ok(lines.includes('Hello, VOLT!'));assert.ok(lines.includes('LED: ON'));assert.ok(lines.includes('LED: OFF'));assert.ok(frames.some(f=>f.outputs.led1.brightness>.9));assert.ok(frames.some(f=>f.seconds>1.1&&f.outputs.led1.brightness<.1));});
test('disconnecting LED cathode prevents illumination',async()=>{const{frames}=await simulate('blink',.3,p=>p.wires=p.wires.filter(w=>w.from!=='led1:C'));assert.ok(frames.every(f=>f.outputs.led1.brightness===0));});
test('INPUT_PULLUP button changes digitalRead and external LED',async()=>{const{frames,lines}=await simulate('button',.4);assert.ok(lines.includes('PRESSED'));assert.ok(frames.some(f=>f.outputs.led1.brightness>.9));});
test('analogRead uses connected potentiometer voltage',async()=>{const{lines}=await simulate('pot',.8);assert.ok(lines.some(l=>/A0: 51[12]/.test(l)),JSON.stringify(lines));});
test('PWM duty cycle produces intermediate brightness',async()=>{const{frames}=await simulate('fade',1.2);assert.ok(frames.some(f=>f.outputs.led1.brightness>.15&&f.outputs.led1.brightness<.8));});
test('servo pulses decode to a changing angle',async()=>{const{frames}=await simulate('servo',1);assert.ok(frames.at(-1).outputs.sv.angle>40);});
test('tone is decoded into the requested frequencies',async()=>{const{frames}=await simulate('tone',.7);assert.ok(frames.some(f=>Math.abs(f.outputs.bz.frequency-523)<8));assert.ok(frames.some(f=>Math.abs(f.outputs.bz.frequency-784)<8));});
