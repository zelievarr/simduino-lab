import test from 'node:test';
import assert from 'node:assert/strict';
import {containsProfanity} from '../src/profanity.js';

test('detects Russian and English profanity with endings or masking',()=>{
 for(const sample of ['// блядский код','int pizdec = 1;','// f.u.c.k.i.n.g','Serial.println("shitty");','// s*u*k*a'])assert.equal(containsProfanity(sample),true,sample);
});

test('does not block ordinary Arduino identifiers',()=>{
 for(const sample of ['class Button {};','digitalWrite(LED, HIGH);','int compass = 3;','Serial.println("Hello");'])assert.equal(containsProfanity(sample),false,sample);
});
