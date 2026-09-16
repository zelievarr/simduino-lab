import test from 'node:test';
import assert from 'node:assert/strict';
import {reactionForOutcome} from '../src/reactions.js';

test('first clean launch uses klass reaction',()=>assert.equal(reactionForOutcome(true,0),'klass'));
test('success after an error uses klass reaction',()=>assert.equal(reactionForOutcome(true,1),'klass'));
test('first error uses angry reaction',()=>assert.equal(reactionForOutcome(false,0),'angry'));
test('second consecutive error uses wtf reaction',()=>assert.equal(reactionForOutcome(false,1),'wtf'));
test('later consecutive errors keep the wtf reaction',()=>assert.equal(reactionForOutcome(false,4),'wtf'));
