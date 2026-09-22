import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareArduinoSource} from '../src/browser-compiler.js';

test('adds Arduino.h to an ino sketch',()=>{
 assert.equal(prepareArduinoSource('void setup() {}'),'#include <Arduino.h>\nvoid setup() {}');
});

test('does not duplicate an existing Arduino.h include',()=>{
 const source='#include <Arduino.h>\nvoid setup() {}';
 assert.equal(prepareArduinoSource(source),source);
});
