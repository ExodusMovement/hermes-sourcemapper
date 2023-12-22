const test = require('node:test');
const assert = require('node:assert');
const cleanupFunc = require('../cleanup-func')

test('cleanupFunc', () => {
  const result1 = cleanupFunc('someFunction')
  const result2 = cleanupFunc('react-native/Core/JSTimers.js')
  const result3 = cleanupFunc('_next(~/work/exodus-mobile-new/src/node_modules/@babel/runtime/helpers/asyncToGenerator.js:25:27)')
  assert.strictEqual(result1, 'someFunction');
  assert.strictEqual(result2, '-');
  assert.strictEqual(result3, '-');
})
