import { build } from 'esbuild';
import { mkdir, copyFile, readFile, writeFile, readdir } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
await build({ entryPoints: ['src/app.js','src/simulator.js'], bundle: true, format:'esm', outdir:'dist', minify:true, sourcemap:true, target:['es2022'] });
for (const f of ['index.html','style.css','favicon.svg']) await copyFile(`src/${f}`, `dist/${f}`);
await mkdir('dist/reactions',{recursive:true});
for(const f of await readdir('src/reactions'))if(f.endsWith('.png'))await copyFile(`src/reactions/${f}`,`dist/reactions/${f}`);
const notices=[];
for(const dir of await readdir('node_modules/.pnpm',{withFileTypes:true})){
 if(!dir.isDirectory()||dir.name==='node_modules'||dir.name.startsWith('@esbuild')||dir.name.startsWith('esbuild'))continue;
 const base=`node_modules/.pnpm/${dir.name}/node_modules`;
 for(const child of await readdir(base,{withFileTypes:true})){
  if(!child.isDirectory())continue;
  const packages=child.name.startsWith('@')?(await readdir(`${base}/${child.name}`,{withFileTypes:true})).filter(c=>c.isDirectory()).map(c=>`${child.name}/${c.name}`):[child.name];
  for(const p of packages){for(const license of ['LICENSE','LICENSE.md','LICENSE.txt','LICENSE-MIT']){try{notices.push(`${p}\n${await readFile(`${base}/${p}/${license}`,'utf8')}`);break;}catch{}}}
 }
}
await writeFile('dist/THIRD-PARTY-LICENSES.txt', notices.join('\n\n'));
console.log('SIMduino lab built → dist/');
