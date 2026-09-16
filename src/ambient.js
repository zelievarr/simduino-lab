// The ambient light follows actual LED outputs from the AVR worker.
const layer=document.createElement('div');layer.className='led-ambient';layer.setAttribute('aria-hidden','true');
export function mountAmbient(){document.querySelector('#canvas')?.closest('.bench')?.append(layer);}
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
 const sides={left:{rgb:[0,0,0],weight:0},right:{rgb:[0,0,0],weight:0},top:{rgb:[0,0,0],weight:0},bottom:{rgb:[0,0,0],weight:0}};
 const addColor=(rgb,weight,part)=>{
  const x=Math.max(0,Math.min(1,part.x/2000)),y=Math.max(0,Math.min(1,part.y/1400));
  const weights={left:(1-x)**2,right:x**2,top:(1-y)**2,bottom:y**2};
  for(const [side,sideWeight]of Object.entries(weights)){const amount=weight*sideWeight;sides[side].weight+=amount;rgb.forEach((channel,index)=>sides[side].rgb[index]+=channel*amount);}
 };
 for(const part of parts){const out=outputs[part.id];if(!out)continue;
  if(part.type==='led'&&out.brightness>.005){const rgb=colorRGB(part.attrs.color||'red'),weight=Math.min(1,out.brightness);red+=rgb[0]*weight;green+=rgb[1]*weight;blue+=rgb[2]*weight;total+=weight;peak=Math.max(peak,weight);addColor(rgb,weight,part);}
  if(part.type==='rgb'&&out.rgb){const weight=Math.max(...out.rgb);if(weight>.005){const rgb=out.rgb.map(channel=>channel*255);red+=rgb[0];green+=rgb[1];blue+=rgb[2];total+=weight;peak=Math.max(peak,weight);addColor(rgb,weight,part);}}
 }
 if(!total){if(previous!=='off'){layer.style.opacity='0';previous='off';}return;}
 const average=[red,green,blue].map(c=>Math.min(255,Math.round(c/total)));
 const colors=Object.fromEntries(Object.entries(sides).map(([side,value])=>[side,value.weight?value.rgb.map(c=>Math.min(255,Math.round(c/value.weight))):average]));
 const opacity=Math.min(.9,.16+Math.sqrt(peak)*.74).toFixed(2),signature=Object.values(colors).map(color=>color.join(' ')).join(':')+':'+opacity;
 if(signature===previous)return;previous=signature;layer.style.setProperty('--ambient-color',average.join(' '));layer.style.opacity=opacity;
 for(const [side,color]of Object.entries(colors))layer.style.setProperty(`--ambient-${side}`,color.join(' '));
}
