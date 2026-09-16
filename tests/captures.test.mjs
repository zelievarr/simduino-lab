import test from 'node:test';
import assert from 'node:assert/strict';
import {captureFilename,tokenizeCodeLine} from '../src/captures.js';

test('capture filenames are safe and identify the exported pane', () => {
  assert.equal(captureFilename('Лаба №1 / LED', 'scheme'), 'Лаба 1  LED-scheme.png');
  assert.equal(captureFilename('Blink', 'code'), 'Blink-code.png');
});

test('code image tokenizer keeps text and highlights comments', () => {
  const line = 'int value = 13; // LED pin';
  const tokens = tokenizeCodeLine(line);
  assert.equal(tokens.map(token => token.text).join(''), line);
  assert.equal(tokens.at(-1).color, '#78877f');
});
