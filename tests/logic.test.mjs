import test from 'node:test';
import assert from 'node:assert/strict';
import {logicVoltage,logicPins} from '../src/logic-model.js';
import {byId} from '../src/catalog.js';
test('logic gates implement all binary truth tables',()=>{
 const tables={and:[0,0,0,5],or:[0,5,5,5],xor:[0,5,5,0],nand:[5,5,5,0],nor:[5,0,0,0],xnor:[5,0,0,5]};
 for(const [type,expected]of Object.entries(tables))for(let a=0;a<2;a++)for(let b=0;b<2;b++)assert.equal(logicVoltage(type,p=>({A:a*5,B:b*5})[p]),expected[a*2+b],`${type} ${a} ${b}`);
 assert.equal(logicVoltage('not',()=>0),5);assert.equal(logicVoltage('not',()=>5),0);
});
test('MUX selects exactly the requested input for every combination',()=>{
 for(let a=0;a<2;a++)for(let b=0;b<2;b++)for(let s=0;s<2;s++)assert.equal(logicVoltage('mux',p=>({A:a*5,B:b*5,S:s*5})[p]),(s?b:a)*5);
 assert.deepEqual(logicPins('mux'),['A','B','S','Y']);
 assert.equal(byId.mux.ready,true);
});
test('floating gate inputs default to LOW and accept a 3.3 V HIGH',()=>{
 assert.equal(logicVoltage('or',()=>null),0);
 assert.equal(logicVoltage('and',()=>3.3),5);
});
