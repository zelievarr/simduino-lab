import test from 'node:test';
import assert from 'node:assert/strict';
import {clampTMP36Temperature,tmp36Voltage} from '../src/tmp36-model.js';

test('TMP36 follows its 10 mV per degree transfer function',()=>{
 assert.ok(Math.abs(tmp36Voltage(-40)-.1)<1e-12);
 assert.equal(tmp36Voltage(0),.5);
 assert.equal(tmp36Voltage(25),.75);
 assert.equal(tmp36Voltage(125),1.75);
});

test('TMP36 temperature stays inside the supported range',()=>{
 assert.equal(clampTMP36Temperature(-100),-40);
 assert.equal(clampTMP36Temperature(200),125);
});
