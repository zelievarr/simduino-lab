export function normalizeRect(x1,y1,x2,y2){
 return{left:Math.min(x1,x2),top:Math.min(y1,y2),right:Math.max(x1,x2),bottom:Math.max(y1,y2),width:Math.abs(x2-x1),height:Math.abs(y2-y1)};
}
export function rectsIntersect(a,b){return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;}
export function clampGroupDelta(parts,dx,dy,bounds={left:0,top:0,right:1800,bottom:1200}){
 if(!parts.length)return{x:0,y:0};
 const minX=Math.min(...parts.map(p=>p.x)),minY=Math.min(...parts.map(p=>p.y));
 const maxX=Math.max(...parts.map(p=>p.x)),maxY=Math.max(...parts.map(p=>p.y));
 return{x:Math.max(bounds.left-minX,Math.min(bounds.right-maxX,dx)),y:Math.max(bounds.top-minY,Math.min(bounds.bottom-maxY,dy))};
}
