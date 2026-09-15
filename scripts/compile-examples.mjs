import {examples} from '../src/examples.js';
import {compile} from '../server.mjs';
import {writeFile} from 'node:fs/promises';
const output={};
for(const ex of examples){output[ex.id]=await compile(ex.code);console.log(`Compiled ${ex.id}`);}
await writeFile('dist/firmware.json',JSON.stringify(output));
