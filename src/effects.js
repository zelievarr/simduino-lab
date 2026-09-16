const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let errorTimer,shakeTimer,celebrationFrame,celebrationCanvas;

export function dismissError(){
 clearTimeout(errorTimer);clearTimeout(shakeTimer);
 document.querySelector('#compile-error-overlay')?.remove();
 document.querySelector('#app')?.classList.remove('compile-shake');
}

export function showCompileError(message){
 dismissError();stopFireworks();
 const overlay=document.createElement('div');overlay.id='compile-error-overlay';overlay.className='compile-error-overlay';overlay.setAttribute('role','alert');
 const panel=document.createElement('div');panel.className='compile-error-panel';
 const label=document.createElement('span');label.className='error-eyebrow';label.textContent='КОМПИЛЯЦИЯ ПРЕРВАНА';
 const title=document.createElement('strong');title.className='error-title';title.textContent='ОШИБКА';
 const detail=document.createElement('p');detail.textContent=message.split('\n').find(s=>s.includes('error:'))?.replace(/^.*?sketch\.ino:/,'Строка ')||message.slice(0,220);
 const button=document.createElement('button');button.className='button error-return';button.textContent='Вернуться к коду';button.onclick=dismissError;
 panel.append(label,title,detail,button);overlay.append(panel);document.body.append(overlay);
 if(!reduceMotion())document.querySelector('#app')?.classList.add('compile-shake');
 shakeTimer=setTimeout(()=>document.querySelector('#app')?.classList.remove('compile-shake'),650);
 errorTimer=setTimeout(dismissError,5500);
}

export function showProfanityWarning(){
 dismissError();stopFireworks();
 const overlay=document.createElement('div');overlay.id='compile-error-overlay';overlay.className='compile-error-overlay profanity-overlay';overlay.setAttribute('role','alert');
 const panel=document.createElement('div');panel.className='compile-error-panel profanity-panel';
 const label=document.createElement('span');label.className='error-eyebrow';label.textContent='ЗАПУСК ОСТАНОВЛЕН';
 const title=document.createElement('strong');title.className='profanity-title';title.textContent='НЕ НАДО СКВЕРНОСЛОВИТЬ';
 const detail=document.createElement('p');detail.textContent='Исправьте текст в скетче и запустите программу ещё раз.';
 const button=document.createElement('button');button.className='button error-return';button.textContent='Хорошо, исправлю';button.onclick=dismissError;
 panel.append(label,title,detail,button);overlay.append(panel);document.body.append(overlay);
 if(!reduceMotion())document.querySelector('#app')?.classList.add('compile-shake');
 shakeTimer=setTimeout(()=>document.querySelector('#app')?.classList.remove('compile-shake'),750);
 errorTimer=setTimeout(dismissError,8000);
}

export function stopFireworks(){
 cancelAnimationFrame(celebrationFrame);celebrationCanvas?.remove();celebrationCanvas=null;
}

export function launchFireworks(){
 dismissError();stopFireworks();
 const canvas=document.createElement('canvas');canvas.className='compilation-fireworks';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);celebrationCanvas=canvas;
 const ctx=canvas.getContext('2d');if(!ctx){stopFireworks();return;}
 const w=innerWidth,h=innerHeight,dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.scale(dpr,dpr);
 const palette=['#d1f76b','#77dfb3','#8fb7ff','#ffd679','#f6a8d4','#ffffff'];
 // Reduced motion keeps the same celebratory colors without moving particles.
 if(reduceMotion()){
  for(const x of [24,w-24]){const g=ctx.createRadialGradient(x,h*.43,0,x,h*.43,100);g.addColorStop(0,'#d1f76b55');g.addColorStop(1,'#d1f76b00');ctx.fillStyle=g;ctx.fillRect(x-100,h*.43-100,200,200);}
  setTimeout(()=>{if(celebrationCanvas===canvas)stopFireworks();},700);return;
 }
 const particles=[],schedule=[{at:0,left:true,y:.47},{at:80,left:false,y:.47},{at:390,left:true,y:.27},{at:470,left:false,y:.27},{at:800,left:true,y:.61},{at:880,left:false,y:.61}];
 const start=performance.now();let previous=start;
 function burst(left,y){const x=left?Math.min(90,w*.1):w-Math.min(90,w*.1);for(let i=0;i<54;i++){const angle=Math.random()*Math.PI*2,speed=60+Math.random()*205;particles.push({x,y:h*y,vx:Math.cos(angle)*speed+(left?55:-55),vy:Math.sin(angle)*speed-40,life:1.05+Math.random()*.65,max:1.7,color:palette[i%palette.length],size:1+Math.random()*2.3,trail:[]});}}
 function frame(now){const elapsed=now-start,dt=Math.min((now-previous)/1000,.035);previous=now;ctx.clearRect(0,0,w,h);
  while(schedule.length&&elapsed>=schedule[0].at){const event=schedule.shift();burst(event.left,event.y);}
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;if(p.life<=0){particles.splice(i,1);continue;}p.trail.push([p.x,p.y]);if(p.trail.length>5)p.trail.shift();p.vx*=1-dt*.55;p.vy+=110*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
   ctx.globalAlpha=Math.min(1,p.life/.55);ctx.strokeStyle=p.color;ctx.lineWidth=p.size*.5;ctx.beginPath();p.trail.forEach(([x,y],j)=>j?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;if(elapsed>2900||(!particles.length&&!schedule.length)){stopFireworks();return;}celebrationFrame=requestAnimationFrame(frame);
 }celebrationFrame=requestAnimationFrame(frame);
}
document.addEventListener('keydown',event=>{if(event.key==='Escape')dismissError();});
