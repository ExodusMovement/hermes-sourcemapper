const test = require("node:test");
const assert = require("node:assert");
const filterFunc = require("../filter-func");

test("cleanupFunc", () => {
  const result1 = filterFunc("someFunction");
  const result2 = filterFunc("react-native/Core/JSTimers.js");
  const result3 = filterFunc(
    "_next(~/work/exodus-mobile-new/src/node_modules/@babel/runtime/helpers/asyncToGenerator.js:25:27)",
  );
  assert.strictEqual(result1, true);
  assert.strictEqual(result2, false);
  assert.strictEqual(result3, false);
});
