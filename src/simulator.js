import {CPU,avrInstruction,AVRIOPort,AVRTimer,AVRUSART,AVRADC,AVREEPROM,EEPROMMemoryBackend,portBConfig,portCConfig,portDConfig,timer0Config,timer1Config,timer2Config,usart0Config,adcConfig} from 'avr8js';
import {loadHex,buildNets} from './circuit.js';
import {createSerialLineDecoder} from './serial-codec.js';
let cpu,ports,adc,serial,project,net,inputs={},paused=false,timer,started,lastCycles=0,rx=[];
let pins=Array(20).fill(0),integrals=Array(20).fill(0),edges=Array(20).fill(0),rise=Array(20).fill(0),width=Array(20).fill(0),period=Array(20).fill(0);
const locate=n=>n<8?[ports.d,n]:n<14?[ports.b,n-8]:[ports.c,n-14];
const pinNumber=name=>/^\d+$/.test(name)?Number(name):/^A[0-5]/.test(name)?14+Number(name[1]):null;
let pinNets=[],partNets={},gnd,vcc,v33;
function rebuild(){
 net=buildNets(project.parts,project.wires,inputs);const uno=project.parts.find(p=>p.type==='uno').id;
 pinNets=Array.from({length:20},(_,i)=>net.root(`${uno}:${i<14?i:'A'+(i-14)}`));
 gnd=net.root(`${uno}:GND.1`);vcc=net.root(`${uno}:5V`);v33=net.root(`${uno}:3.3V`);
 partNets={};for(const p of project.parts)partNets[p.id]=Object.fromEntries(['A','C','R','G','B','COM','1','2','SIG','VCC','V+','GND','PWM'].map(pin=>[pin,net.root(`${p.id}:${pin}`)]));
 applyInputs();
}
function netVoltage(root,averages=null){
 if(root===gnd)return 0;if(root===vcc)return 5;if(root===v33)return 3.3;
 for(let i=0;i<20;i++)if(pinNets[i]===root){const [p,b]=locate(i),s=p.pinState(b);if(s<2)return (averages?averages[i]:pins[i])*5;}
 for(const part of project.parts){if(part.type==='pot'||part.type==='slidepot'){const p=partNets[part.id];if(p.SIG===root&&p.VCC===vcc&&p.GND===gnd)return (inputs[part.id]??part.attrs.value??512)/1023*5;}}
 return null;
}
function applyInputs(){
 if(!adc)return;
 for(let i=0;i<20;i++){const[p,b]=locate(i);if(p.pinState(b)>=2){const v=netVoltage(pinNets[i]);p.setPin(b,v===null?p.pinState(b)===3:v>=2.5);}}
 for(let i=0;i<6;i++)adc.channelValues[i]=netVoltage(pinNets[i+14])??0;
}
function track(base,count,port){
 for(let b=0;b<count;b++){const i=base+b,now=cpu.cycles,next=port.pinState(b)===1?1:0;
  if(pins[i]!==next){integrals[i]+=(now-edges[i])*pins[i];edges[i]=now;pins[i]=next;if(next){period[i]=now-rise[i];rise[i]=now;}else width[i]=now-rise[i];}
 }
 applyInputs();
}
function frame(){
 if(paused)return;
 const target=Math.min(cpu.cycles+160000,Math.max(cpu.cycles+16000,(performance.now()-started)*16000));
 while(cpu.cycles<target){avrInstruction(cpu);cpu.tick();}
 if(rx.length&&!serial.rxBusy)serial.writeByte(rx.shift());
 const total=Math.max(1,cpu.cycles-lastCycles),avg=pins.map((v,i)=>(integrals[i]+(cpu.cycles-edges[i])*v)/total);
 integrals.fill(0);edges.fill(cpu.cycles);lastCycles=cpu.cycles;
 const outputs={};
 for(const part of project.parts){const p=partNets[part.id],volts=k=>netVoltage(p[k],avg);
  if(part.type==='led')outputs[part.id]={brightness:Math.max(0,((volts('A')??0)-(volts('C')??5))/5)};
  if(part.type==='rgb')outputs[part.id]={rgb:['R','G','B'].map(c=>Math.max(0,((volts(c)??0)-(volts('COM')??5))/5))};
  if(part.type==='servo'){const i=pinNets.indexOf(p.PWM);outputs[part.id]={angle:p['V+']===vcc&&p.GND===gnd&&i>=0?Math.max(0,Math.min(180,(width[i]/16-544)/1856*180)):0};}
  if(part.type==='buzzer'){const i=pinNets.indexOf(p['2']);outputs[part.id]={frequency:p['1']===gnd&&i>=0&&period[i]>0&&cpu.cycles-rise[i]<1600000?16000000/period[i]:0};}
 }
 postMessage({type:'frame',outputs,pins:avg,seconds:cpu.cycles/16000000});
 timer=setTimeout(frame,Math.max(0,(cpu.cycles/16000)-(performance.now()-started)));
}
self.onmessage=({data})=>{
 try {
 if(data.type==='start'){
  project=data.project;inputs=data.inputs??{};cpu=new CPU(loadHex(data.hex));
  new AVRTimer(cpu,timer0Config);new AVRTimer(cpu,timer1Config);new AVRTimer(cpu,timer2Config);
  new AVREEPROM(cpu,new EEPROMMemoryBackend(1024));
  ports={b:new AVRIOPort(cpu,portBConfig),c:new AVRIOPort(cpu,portCConfig),d:new AVRIOPort(cpu,portDConfig)};
  adc=new AVRADC(cpu,adcConfig);serial=new AVRUSART(cpu,usart0Config,16000000);
  const decodeSerial=createSerialLineDecoder(line=>postMessage({type:'serial',line}));
  serial.onByteTransmit=decodeSerial;
  ports.b.addListener(()=>track(8,6,ports.b));ports.c.addListener(()=>track(14,6,ports.c));ports.d.addListener(()=>track(0,8,ports.d));
  rebuild();started=performance.now();postMessage({type:'ready'});frame();
 }else if(data.type==='input'){inputs[data.id]=data.value;rebuild();}
 else if(data.type==='pause'){paused=data.value;clearTimeout(timer);if(!paused){started=performance.now()-cpu.cycles/16000;frame();}}
 else if(data.type==='serial'){rx.push(...new TextEncoder().encode(data.text));}
 }catch(error){postMessage({type:'error',message:error.message});clearTimeout(timer);}
};
