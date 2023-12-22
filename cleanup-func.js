const BLACKLIST = ['JSTimers.js', 'flux/middleware', 'redux-async-action', 'MessageQueue.js', 'react-redux/lib/utils', 'functionPrototypeApply', 'generatorPrototypeNext', 'asyncGeneratorStep', 'tryCallOne', '_next(', 'Promise(', 'tryCallTwo', 'metro-runtime/src/polyfills/require', 'scheduler/cjs/scheduler.development', 'implementations/ReactNativeRenderer', '@babel/runtime/helpers']

const cleanupFunc = funcName => BLACKLIST.some(testString => funcName.includes(testString)) ? '-' : funcName

module.exports = cleanupFunc
