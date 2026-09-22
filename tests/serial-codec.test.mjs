import test from 'node:test';
import assert from 'node:assert/strict';
import {createSerialLineDecoder} from '../src/serial-codec.js';

test('decodes UTF-8 text from Arduino Serial output',()=>{
 const lines=[],feed=createSerialLineDecoder(line=>lines.push(line));
 for(const byte of new TextEncoder().encode('Привет, SIMduino!\r\n'))feed(byte);
 assert.deepEqual(lines,['Привет, SIMduino!']);
});

test('keeps separate serial lines',()=>{
 const lines=[],feed=createSerialLineDecoder(line=>lines.push(line));
 for(const byte of new TextEncoder().encode('one\ntwo\n'))feed(byte);
 assert.deepEqual(lines,['one','two']);
});
