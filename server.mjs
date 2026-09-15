import http from 'node:http';
import path from 'node:path';
import {readFile,writeFile,mkdir,mkdtemp,rm,stat} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const exec=promisify(execFile),root=path.dirname(fileURLToPath(import.meta.url));
const cli=process.env.ARDUINO_CLI||path.join(root,'.tools/arduino-cli');
const config=process.env.ARDUINO_CONFIG||path.join(root,'.tools/arduino-cli.yaml');
const cache=new Map();let active=0;
export async function compile(code){
 if(typeof code!=='string'||code.length>100000)throw Error('Скетч должен быть текстом до 100 КБ.');
 const normalized=code.replace(/\\\r?\n/g,'').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'');
 for(const match of normalized.matchAll(/^\s*#\s*(include\w*|import)\b([^\n]*)/gm)){
  if(match[1]!=='include'||!/^\s*[<"](?:Arduino|Servo|Wire|SPI|EEPROM|LiquidCrystal|SoftwareSerial|stdint|math|string|stdlib)\.h[>"]\s*$/.test(match[2]))throw Error('Эта библиотека не установлена. Доступны Arduino.h, Wire.h, SPI.h, EEPROM.h, LiquidCrystal.h, SoftwareSerial.h и стандартные заголовки C.');
 }
 const key=createHash('sha256').update(code).digest('hex');if(cache.has(key))return cache.get(key);
 if(active>=4)throw Error('Компьютер занят четырьмя сборками. Повторите запуск через несколько секунд.');
 active++;await mkdir(path.join(root,'.build'),{recursive:true});const dir=await mkdtemp(path.join(root,'.build/sketch-'));
 try{
  const sketch=path.join(dir,'sketch');await mkdir(sketch);await writeFile(path.join(sketch,'sketch.ino'),code);
  const {stdout}=await exec(cli,['compile','--config-file',config,'--fqbn','arduino:avr:uno','--output-dir',path.join(dir,'out'),sketch],{timeout:60000,maxBuffer:1024*1024,env:{...process.env,TMPDIR:dir}});
  const hex=await readFile(path.join(dir,'out/sketch.ino.hex'),'utf8');const result={hex,stdout};if(cache.size>=100)cache.delete(cache.keys().next().value);cache.set(key,result);return result;
 }catch(error){throw Error(error.stderr||error.message);}finally{active--;await rm(dir,{recursive:true,force:true});}
}
export function startServer(){
 const server=http.createServer(async(req,res)=>{
  const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
  try{
   const url=new URL(req.url,'http://localhost');
   if(url.pathname==='/api/health')return json(200,{compiler:true,board:'arduino:avr:uno'});
   if(url.pathname==='/api/compile'&&req.method==='POST'){
    if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return json(403,{error:'Запускайте код на странице этого сервера.'});
    if(!req.headers['content-type']?.startsWith('application/json'))return json(415,{error:'Ожидается JSON.'});
    let body='';for await(const chunk of req){body+=chunk;if(body.length>110000)return json(413,{error:'Скетч слишком большой.'});}
    const input=JSON.parse(body);try{return json(200,await compile(input.code));}catch(e){return json(422,{error:e.message.replaceAll(root,'[VOLT]')});}
   }
   if(req.method!=='GET'&&req.method!=='HEAD')return json(405,{error:'Метод не поддерживается.'});
   const filename=path.resolve(root,'dist','.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
   if(!filename.startsWith(path.join(root,'dist')+path.sep))return json(403,{error:'Недоступный путь.'});
   const data=await readFile(filename);const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8'};
   res.writeHead(200,{'Content-Type':types[path.extname(filename)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:data);
  }catch(e){json(e.code==='ENOENT'?404:500,{error:e.code==='ENOENT'?'Файл не найден.':'Не удалось обработать запрос.'});}
 });
 server.listen(Number(process.env.PORT)||4173,process.env.HOST||'127.0.0.1',()=>console.log(`VOLT ready at http://${process.env.HOST||'127.0.0.1'}:${Number(process.env.PORT)||4173}`));return server;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))startServer();
