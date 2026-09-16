import test from 'node:test';
import assert from 'node:assert/strict';
import {automaticWireColor,endpointRole,migrateLegacyWireColors,SIGNAL_WIRE_COLORS} from '../src/wire-colors.js';

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

test('legacy example colours migrate without changing manual signal colours',()=>{
 const project={wires:[{from:'uno:GND.1',to:'led:C',color:'#829399'},{from:'uno:5V',to:'pot:VCC',color:'#ef7575'},{from:'uno:13',to:'led:A',color:'#ef7575'}]};
 migrateLegacyWireColors(project);
 assert.deepEqual(project.wires.map(w=>w.color),['#111111','#ef4f55','#ef7575']);
});
