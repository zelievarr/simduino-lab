import test from 'node:test';
import assert from 'node:assert/strict';
import {routeOrthogonal,routeWire,segmentClear,pointsToPath} from '../src/routing.js';
test('auto routing avoids a blocking component with orthogonal segments',()=>{const boxes=[{x:40,y:-20,w:30,h:40}],route=routeOrthogonal({x:0,y:0},{x:100,y:0},boxes);assert.ok(route);assert.deepEqual(route[0],{x:0,y:0});assert.deepEqual(route.at(-1),{x:100,y:0});assert.ok(route.every((b,i)=>!i||segmentClear(route[i-1],b,boxes)));assert.equal(route.reduce((n,p,i)=>n+(i?Math.abs(p.x-route[i-1].x)+Math.abs(p.y-route[i-1].y):0),0),140);});
test('routing navigates a staggered set of obstacles',()=>{const boxes=[{x:20,y:-60,w:30,h:100},{x:65,y:0,w:30,h:100},{x:110,y:-50,w:20,h:100}];const route=routeOrthogonal({x:0,y:0},{x:160,y:0},boxes);assert.ok(route);assert.ok(route.every((b,i)=>!i||segmentClear(route[i-1],b,boxes)));});
test('wire leaves a component through the nearest connector edge',()=>{const route=routeWire({x:50,y:5,partId:'uno'},{x:150,y:60,partId:'led'},[{id:'uno',x:0,y:0,w:100,h:100},{id:'led',x:140,y:30,w:20,h:30}]);assert.ok(route);assert.equal(route[1].x,50);assert.ok(route[1].y<0);assert.deepEqual(route.at(-1),{x:150,y:60});});
test('routing still completes when crowded or overlapping parts block the ideal path',()=>assert.ok(routeWire({x:0,y:0},{x:100,y:100},[{id:'block',x:30,y:30,w:40,h:40}])));
test('saved route serializes as straight SVG segments',()=>assert.equal(pointsToPath([{x:1.12345,y:2},{x:10,y:2},{x:10,y:20}]),'M 1.12 2 L 10 2 L 10 20'));
