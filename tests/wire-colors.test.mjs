import test from 'node:test';
import assert from 'node:assert/strict';
import {automaticWireColor,endpointRole,SIGNAL_WIRE_COLORS} from '../src/wire-colors.js';

test('detects ground and 5V power pins',()=>{
 assert.equal(endpointRole('uno:GND.1'),'ground');
 assert.equal(endpointRole('pot:VCC'),'power');
 assert.equal(endpointRole('servo:V+'),'power');
 assert.equal(endpointRole('uno:13'),'signal');
});

test('automatic wire colours prioritize ground, then 5V, then signal palette',()=>{
 assert.equal(automaticWireColor('uno:GND.1','led:C'),'#111111');
 assert.equal(automaticWireColor('uno:5V','pot:VCC'),'#ef4f55');
 assert.equal(automaticWireColor('uno:5V','sensor:GND'),'#111111');
 assert.equal(automaticWireColor('uno:13','led:A',2),SIGNAL_WIRE_COLORS[2]);
});
