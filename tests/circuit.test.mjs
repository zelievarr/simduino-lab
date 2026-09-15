import test from 'node:test';
import assert from 'node:assert/strict';
import {buildNets,loadHex,validateCircuit} from '../src/circuit.js';
import {examples,makeProject} from '../src/examples.js';
test('all example connections validate',()=>{for(const ex of examples)assert.deepEqual(validateCircuit(makeProject(ex)),[]);});
test('button connects poles only while pressed',()=>{const p=makeProject(examples.find(e=>e.id==='button'));assert.equal(buildNets(p.parts,p.wires).same('uno:2','uno:GND.2'),false);assert.equal(buildNets(p.parts,p.wires,{btn:1}).same('uno:2','uno:GND.2'),true);});
test('direct power short is rejected',()=>{const p=makeProject();p.wires.push({from:'uno:5V',to:'uno:GND.1'});assert.throws(()=>validateCircuit(p),/Короткое/);});
test('resistor conducts but is not treated as a direct short',()=>{const p=makeProject();p.wires=[{from:'uno:5V',to:'r1:1'},{from:'r1:2',to:'uno:GND.1'}];assert.doesNotThrow(()=>validateCircuit(p));assert.equal(buildNets(p.parts,p.wires).same('uno:5V','uno:GND.1'),true);});
test('reject malformed Intel HEX and accept valid bytes',()=>{assert.throws(()=>loadHex(':0100000000FE\n:00000001FF'),/контрольная/);assert.throws(()=>loadHex('not a hex file'));assert.deepEqual([...loadHex(':020000000000FE\n:00000001FF').slice(0,1)],[0]);});
