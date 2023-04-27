import ScriptProvider from '#engine/ScriptProvider.js';
import ScriptRunner from '#engine/ScriptRunner.js';

let state = ScriptRunner.init(ScriptProvider.getByName('[proc,looptest]'));
ScriptRunner.execute(state);
console.log(state.intStack[0]);
