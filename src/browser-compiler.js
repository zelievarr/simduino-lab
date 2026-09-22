export function prepareArduinoSource(source){
 const text=String(source??'');
 return /^\s*#\s*include\s*[<"]Arduino\.h[>"]/m.test(text)?text:`#include <Arduino.h>\n${text}`;
}

export function compileInBrowser(source,{timeoutMs=120000}={}){
 const compilerUrl=new URL('./avr/worker.js',document.baseURI);
 const assetsBase=new URL('./avr/',document.baseURI).href;
 const compilerWorker=new Worker(compilerUrl,{type:'module'});
 return new Promise((resolve,reject)=>{
  const finish=(callback,value)=>{clearTimeout(timeout);compilerWorker.terminate();callback(value);};
  const timeout=setTimeout(()=>finish(reject,new Error('Компилятор загружается слишком долго. Проверьте соединение и попробуйте ещё раз.')),timeoutMs);
  compilerWorker.addEventListener('message',({data})=>{
   if(data?.ok)finish(resolve,data.result);
   else finish(reject,new Error(data?.error?.message||'Не удалось собрать скетч в браузере.'));
  },{once:true});
  compilerWorker.addEventListener('error',event=>finish(reject,new Error(event.message||'Не удалось запустить компилятор в браузере.')),{once:true});
  compilerWorker.postMessage({id:1,source:prepareArduinoSource(source),sensors:[],assetsBase});
 });
}
