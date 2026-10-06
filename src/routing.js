const EPS=.01;
const same=(a,b)=>Math.abs(a.x-b.x)<EPS&&Math.abs(a.y-b.y)<EPS;
const inside=(p,r)=>p.x>r.x+EPS&&p.x<r.x+r.w-EPS&&p.y>r.y+EPS&&p.y<r.y+r.h-EPS;
const between=(value,a,b)=>value>=Math.min(a,b)-EPS&&value<=Math.max(a,b)+EPS;
const endpoint=(p,a,b)=>same(p,a)||same(p,b);
export function wireOverlapPenalty(a,b,segments=[]){
 const horizontal=Math.abs(a.y-b.y)<EPS;let penalty=0;
 for(const [c,d]of segments){
  const otherHorizontal=Math.abs(c.y-d.y)<EPS;
  if(horizontal===otherHorizontal){
   if(horizontal&&Math.abs(a.y-c.y)<EPS){const overlap=Math.min(Math.max(a.x,b.x),Math.max(c.x,d.x))-Math.max(Math.min(a.x,b.x),Math.min(c.x,d.x));if(overlap>EPS)penalty+=24+overlap*.35;}
   if(!horizontal&&Math.abs(a.x-c.x)<EPS){const overlap=Math.min(Math.max(a.y,b.y),Math.max(c.y,d.y))-Math.max(Math.min(a.y,b.y),Math.min(c.y,d.y));if(overlap>EPS)penalty+=24+overlap*.35;}
  }else{
   const cross=horizontal?{x:c.x,y:a.y}:{x:a.x,y:c.y};
   if(between(cross.x,a.x,b.x)&&between(cross.y,a.y,b.y)&&between(cross.x,c.x,d.x)&&between(cross.y,c.y,d.y)&&!endpoint(cross,a,b)&&!endpoint(cross,c,d))penalty+=12;
  }
 }
 return penalty;
}
export function segmentClear(a,b,rects){
 if(Math.abs(a.x-b.x)>EPS&&Math.abs(a.y-b.y)>EPS)return false;
 return !rects.some(r=>Math.abs(a.y-b.y)<EPS
  ?a.y>r.y+EPS&&a.y<r.y+r.h-EPS&&Math.max(a.x,b.x)>r.x+EPS&&Math.min(a.x,b.x)<r.x+r.w-EPS
  :a.x>r.x+EPS&&a.x<r.x+r.w-EPS&&Math.max(a.y,b.y)>r.y+EPS&&Math.min(a.y,b.y)<r.y+r.h-EPS);
}
export function simplify(points){
 const result=[];for(const p of points){if(result.length&&same(result.at(-1),p))continue;
  while(result.length>=2){const a=result.at(-2),b=result.at(-1);if((Math.abs(a.x-b.x)<EPS&&Math.abs(b.x-p.x)<EPS&&(b.y-a.y)*(p.y-b.y)>=0)||(Math.abs(a.y-b.y)<EPS&&Math.abs(b.y-p.y)<EPS&&(b.x-a.x)*(p.x-b.x)>=0))result.pop();else break;}
  result.push({x:p.x,y:p.y});
 }return result;
}
class MinHeap{
 constructor(){this.items=[];}
 push(item){const a=this.items;a.push(item);let i=a.length-1;while(i){const p=(i-1)>>1;if(a[p].f<=item.f)break;a[i]=a[p];i=p;}a[i]=item;}
 pop(){const a=this.items,first=a[0],last=a.pop();if(a.length){let i=0;while(i*2+1<a.length){let c=i*2+1;if(c+1<a.length&&a[c+1].f<a[c].f)c++;if(a[c].f>=last.f)break;a[i]=a[c];i=c;}a[i]=last;}return first;}
 get length(){return this.items.length;}
}
// Orthogonal visibility grid + A*. Distance and turn cost favor short, tidy paths.
export function routeOrthogonal(start,end,rects=[],startAxis=0,occupied=[]){
 if(same(start,end))return [start];
 if(rects.some(r=>inside(start,r)||inside(end,r)))return null;
 const basic=[simplify([start,{x:end.x,y:start.y},end]),simplify([start,{x:start.x,y:end.y},end])];
 const clear=basic.filter(p=>p.every((b,i)=>!i||segmentClear(p[i-1],b,rects)));
 if(clear.length&&!occupied.length){clear.sort((a,b)=>((startAxis&&a.length>1&&((a[1].x===a[0].x?2:1)!==startAxis))?1:0)-((startAxis&&b.length>1&&((b[1].x===b[0].x?2:1)!==startAxis))?1:0));return clear[0];}
 const lane=8,wireXs=occupied.flatMap(([a,b])=>Math.abs(a.x-b.x)<EPS?[a.x-lane,a.x+lane]:[]),wireYs=occupied.flatMap(([a,b])=>Math.abs(a.y-b.y)<EPS?[a.y-lane,a.y+lane]:[]);
 const xs=[...new Set([start.x,end.x,...rects.flatMap(r=>[r.x,r.x+r.w]),...wireXs])].sort((a,b)=>a-b);
 const ys=[...new Set([start.y,end.y,...rects.flatMap(r=>[r.y,r.y+r.h]),...wireYs])].sort((a,b)=>a-b);
 const nx=xs.length,ny=ys.length,sx=xs.indexOf(start.x),sy=ys.indexOf(start.y),ex=xs.indexOf(end.x),ey=ys.indexOf(end.y);
 const count=nx*ny*3,cost=new Float64Array(count).fill(Infinity),previous=new Int32Array(count).fill(-1),closed=new Uint8Array(count),edgeCache=new Map();
 const index=(x,y,axis)=>(y*nx+x)*3+axis;const first=index(sx,sy,startAxis);cost[first]=0;
 const queue=new MinHeap();queue.push({key:first,x:sx,y:sy,axis:startAxis,g:0,f:Math.abs(start.x-end.x)+Math.abs(start.y-end.y)});
 while(queue.length){const current=queue.pop();if(closed[current.key])continue;closed[current.key]=1;
  if(current.x===ex&&current.y===ey){const points=[];for(let key=current.key;key>=0;key=previous[key]){const cell=Math.floor(key/3);points.push({x:xs[cell%nx],y:ys[Math.floor(cell/nx)]});}return simplify(points.reverse());}
  for(const [dx,dy,axis]of [[1,0,1],[-1,0,1],[0,1,2],[0,-1,2]]){
   const x=current.x+dx,y=current.y+dy;if(x<0||y<0||x>=nx||y>=ny)continue;const key=index(x,y,axis);if(closed[key])continue;
   const a={x:xs[current.x],y:ys[current.y]},b={x:xs[x],y:ys[y]},edge=[current.y*nx+current.x,y*nx+x].sort((a,b)=>a-b).join(':');
   if(!edgeCache.has(edge))edgeCache.set(edge,segmentClear(a,b,rects));if(!edgeCache.get(edge))continue;
   const g=current.g+Math.abs(a.x-b.x)+Math.abs(a.y-b.y)+(current.axis&&current.axis!==axis?18:0)+wireOverlapPenalty(a,b,occupied);if(g>=cost[key])continue;
   cost[key]=g;previous[key]=current.key;queue.push({key,x,y,axis,g,f:g+Math.abs(b.x-end.x)+Math.abs(b.y-end.y)});
  }
 }return null;
}
function escapePin(pin,rect,clearance){
 if(!rect)return {...pin,axis:0};
 // A pin's position around the component centre describes the direction in which
 // its physical leg leaves the body. Using the closest box edge made lower LED
 // legs escape sideways, forcing the router to loop over the whole component.
 if(pin.side==='top')return{x:pin.x,y:rect.y-clearance,axis:2};
 if(pin.side==='bottom')return{x:pin.x,y:rect.y+rect.h+clearance,axis:2};
 if(pin.side==='left')return{x:rect.x-clearance,y:pin.y,axis:1};
 if(pin.side==='right')return{x:rect.x+rect.w+clearance,y:pin.y,axis:1};
 const dx=(pin.x-(rect.x+rect.w/2))/Math.max(rect.w/2,1),dy=(pin.y-(rect.y+rect.h/2))/Math.max(rect.h/2,1);
 if(Math.abs(dx)>Math.abs(dy))return{x:dx<0?rect.x-clearance:rect.x+rect.w+clearance,y:pin.y,axis:1};
 return{x:pin.x,y:dy<0?rect.y-clearance:rect.y+rect.h+clearance,axis:2};
}
function fallbackOrthogonal(start,end,rects=[],occupied=[]){
 const margin=24,minX=Math.min(start.x,end.x,...rects.map(r=>r.x))-margin,maxX=Math.max(start.x,end.x,...rects.map(r=>r.x+r.w))+margin,minY=Math.min(start.y,end.y,...rects.map(r=>r.y))-margin,maxY=Math.max(start.y,end.y,...rects.map(r=>r.y+r.h))+margin;
 const candidates=[
  [start,{x:end.x,y:start.y},end],[start,{x:start.x,y:end.y},end],
  [start,{x:minX,y:start.y},{x:minX,y:end.y},end],[start,{x:maxX,y:start.y},{x:maxX,y:end.y},end],
  [start,{x:start.x,y:minY},{x:end.x,y:minY},end],[start,{x:start.x,y:maxY},{x:end.x,y:maxY},end]
 ].map(simplify);
 const score=points=>points.reduce((total,p,i)=>{if(!i)return 0;const a=points[i-1],distance=Math.abs(a.x-p.x)+Math.abs(a.y-p.y),hits=rects.reduce((n,r)=>n+(segmentClear(a,p,[r])?0:1),0);return total+distance+hits*100000+wireOverlapPenalty(a,p,occupied);},0);
 return candidates.sort((a,b)=>score(a)-score(b))[0];
}
function routeAtClearance(start,end,boxes,clearance,occupied){
 const obstacles=boxes.map(r=>({...r,x:r.x-clearance,y:r.y-clearance,w:r.w+clearance*2,h:r.h+clearance*2}));
 const a=escapePin(start,boxes.find(r=>r.id===start.partId),clearance),b=escapePin(end,boxes.find(r=>r.id===end.partId),clearance);
 const result=[start,a],route=routeOrthogonal(a,b,obstacles,a.axis,occupied);if(!route)return null;result.push(...route.slice(1));
 result.push(end);return simplify(result);
}
function routeScore(points,occupied,clearance){
 return points.reduce((total,p,i)=>{if(!i)return 0;const a=points[i-1],turn=i>1&&((points[i-2].x===a.x)!==(a.x===p.x))?18:0;return total+Math.abs(a.x-p.x)+Math.abs(a.y-p.y)+turn+wireOverlapPenalty(a,p,occupied);},0)+(13-clearance)*2;
}
export function routeWire(start,end,boxes=[],occupied=[]){
 if(!start||!end)return null;
 // Compare several clearances. Returning the first roomy route made wires loop
 // around the entire circuit when two otherwise separate parts were close.
 const candidates=[13,7,3,0].map(clearance=>({clearance,route:routeAtClearance(start,end,boxes,clearance,occupied)})).filter(x=>x.route);
 if(candidates.length)return candidates.sort((a,b)=>routeScore(a.route,occupied,a.clearance)-routeScore(b.route,occupied,b.clearance))[0].route;
 // Overlapping parts can make a collision-free route mathematically impossible.
 // Still finish the connection with the least obstructed orthogonal fallback.
 const a=escapePin(start,boxes.find(r=>r.id===start.partId),0),b=escapePin(end,boxes.find(r=>r.id===end.partId),0),result=[start,a];
 result.push(...fallbackOrthogonal(a,b,boxes,occupied).slice(1));
 result.push(end);return simplify(result);
}
export function pointsToPath(points){return points?.length?points.map((p,i)=>`${i?'L':'M'} ${Number(p.x.toFixed(2))} ${Number(p.y.toFixed(2))}`).join(' '):'';}
