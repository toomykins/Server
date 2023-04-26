import Script from '#engine/Script.js';
import ScriptBuilder from '#engine/ScriptBuilder.js';
import ScriptProvider from '#engine/ScriptProvider.js';
import ScriptRunner from '#engine/ScriptRunner.js';
import Packet from '#util/Packet.js';
import fs from 'fs';

// let builder = new ScriptBuilder();
// builder.instruction(ScriptRunner.PUSH_CONSTANT_INT, 1);
// builder.instruction(ScriptRunner.PUSH_CONSTANT_INT, 1);
// builder.instruction(ScriptRunner.ADD);
// builder.instruction(ScriptRunner.PRINTLN);
// let script = builder.build();

ScriptProvider.load('data/scripts');

let runner = new ScriptRunner();
// let script = ScriptProvider.getByName('[proc,gosubtest]');
let script = ScriptProvider.getByName('[proc,looptest]');

console.time(script.name);
let state = runner.execute(script);
console.timeEnd(script.name);

console.log('opcount:', state.opcount);
console.log('result:', state.intStack[state.isp]);
// console.log(state);
