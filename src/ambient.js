// The ambient light follows actual LED outputs from the AVR worker.
const layer=document.createElement('div');layer.className='led-ambient';layer.setAttribute('aria-hidden','true');document.body.append(layer);
const colorCache=new Map();const parser=document.createElement('canvas').getContext('2d',{willReadFrequently:true});
let previous='',lastUpdate=0;
function colorRGB(color){
 if(colorCache.has(color))return colorCache.get(color);
 if(!parser||!CSS.supports('color',color))return [255,45,45];
 parser.clearRect(0,0,1,1);parser.fillStyle=color;parser.fillRect(0,0,1,1);const result=[...parser.getImageData(0,0,1,1).data].slice(0,3);if(colorCache.size>100)colorCache.clear();colorCache.set(color,result);return result;
}
export function clearAmbient(){layer.style.opacity='0';previous='';lastUpdate=0;}
export function updateAmbient(outputs,parts){
 const now=performance.now();if(now-lastUpdate<40)return;lastUpdate=now;
 let red=0,green=0,blue=0,total=0,peak=0;
 for(const part of parts){const out=outputs[part.id];if(!out)continue;
  if(part.type==='led'&&out.brightness>.005){const rgb=colorRGB(part.attrs.color||'red'),weight=Math.min(1,out.brightness);red+=rgb[0]*weight;green+=rgb[1]*weight;blue+=rgb[2]*weight;total+=weight;peak=Math.max(peak,weight);}
  if(part.type==='rgb'&&out.rgb){const weight=Math.max(...out.rgb);if(weight>.005){red+=out.rgb[0]*255;green+=out.rgb[1]*255;blue+=out.rgb[2]*255;total+=weight;peak=Math.max(peak,weight);}}
 }
 if(!total){if(previous!=='off'){layer.style.opacity='0';previous='off';}return;}
 const channels=[red,green,blue].map(c=>Math.min(255,Math.round(c/total)));
 const opacity=Math.min(.88,.18+Math.sqrt(peak)*.7).toFixed(2),signature=channels.join(' ')+':'+opacity;
 if(signature===previous)return;previous=signature;layer.style.setProperty('--ambient-color',channels.join(' '));layer.style.opacity=opacity;
}
