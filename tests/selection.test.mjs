import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeRect,rectsIntersect,clampGroupDelta} from '../src/selection.js';

test('marquee rectangle works in every drag direction',()=>{
 assert.deepEqual(normalizeRect(90,80,10,20),{left:10,top:20,right:90,bottom:80,width:80,height:60});
 assert.equal(rectsIntersect({left:10,top:10,right:50,bottom:50},{left:40,top:40,right:80,bottom:80}),true);
 assert.equal(rectsIntersect({left:10,top:10,right:20,bottom:20},{left:30,top:30,right:40,bottom:40}),false);
});

test('group movement keeps every selected part inside the workspace',()=>{
 const parts=[{x:20,y:30},{x:1700,y:1100}];
 assert.deepEqual(clampGroupDelta(parts,300,300),{x:100,y:100});
 assert.deepEqual(clampGroupDelta(parts,-100,-100),{x:-20,y:-30});
});
