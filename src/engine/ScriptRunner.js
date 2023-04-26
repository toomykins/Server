import ScriptState from '#engine/ScriptState.js';
import ScriptOpcodes from '#engine/ScriptOpcodes.js';
import ScriptProvider from '#engine/ScriptProvider.js';
import _ from 'lodash';

export default class ScriptRunner {
    static handlers = {
        [ScriptOpcodes.PUSH_CONSTANT_INT]: (state) => {
            state.intStack[state.isp++] = state.script.intOperands[state.pc];
        },

        [ScriptOpcodes.PUSH_CONSTANT_STRING]: (state) => {
            state.stringStack[state.ssp++] = state.script.stringOperands[state.pc];
        },

        [ScriptOpcodes.BRANCH]: (state) => {
            state.pc += state.script.intOperands[state.pc];
        },

        [ScriptOpcodes.BRANCH_NOT]: (state) => {
            state.isp -= 2;

            if (state.intStack[state.isp] != state.intStack[state.isp + 1]) {
                state.pc += state.script.intOperands[state.pc];
            }
        },

        [ScriptOpcodes.BRANCH_EQUALS]: (state) => {
            state.isp -= 2;

            if (state.intStack[state.isp] == state.intStack[state.isp + 1]) {
                state.pc += state.script.intOperands[state.pc];
            }
        },

        [ScriptOpcodes.BRANCH_LESS_THAN]: (state) => {
            state.isp -= 2;

            if (state.intStack[state.isp] < state.intStack[state.isp + 1]) {
                state.pc += state.script.intOperands[state.pc];
            }
        },

        [ScriptOpcodes.BRANCH_GREATER_THAN]: (state) => {
            state.isp -= 2;

            if (state.intStack[state.isp] > state.intStack[state.isp + 1]) {
                state.pc += state.script.intOperands[state.pc];
            }
        },

        [ScriptOpcodes.RETURN]: (state) => {
            if (state.fp === 0) {
                state.execution = ScriptState.FINISHED;
                return;
            }

            let frame = state.callStack[--state.fp];
            state.script = frame.script;
            state.pc = frame.pc;
            state.intLocals = frame.intLocals;
            state.stringLocals = frame.stringLocals;
        },

        [ScriptOpcodes.BRANCH_LESS_THAN_OR_EQUALS]: (state) => {
            state.isp -= 2;

            if (state.intStack[state.isp] <= state.intStack[state.isp + 1]) {
                state.pc += state.script.intOperands[state.pc];
            }
        },

        [ScriptOpcodes.BRANCH_GREATER_THAN_OR_EQUALS]: (state) => {
            state.isp -= 2;

            if (state.intStack[state.isp] >= state.intStack[state.isp + 1]) {
                state.pc += state.script.intOperands[state.pc];
            }
        },

        [ScriptOpcodes.PUSH_INT_LOCAL]: (state) => {
            state.intStack[state.isp++] = state.intLocals[state.script.intOperands[state.pc]];
        },

        [ScriptOpcodes.POP_INT_LOCAL]: (state) => {
            state.intLocals[state.script.intOperands[state.pc]] = state.intStack[--state.isp];
        },

        [ScriptOpcodes.PUSH_STRING_LOCAL]: (state) => {
            state.stringStack[state.ssp++] = state.stringLocals[state.script.stringOperands[state.pc]];
        },

        [ScriptOpcodes.POP_STRING_LOCAL]: (state) => {
            state.stringLocals[state.script.stringOperands[state.pc]] = state.stringStack[--state.ssp];
        },

        [ScriptOpcodes.POP_INT_DISCARD]: (state) => {
            state.isp--;
        },

        [ScriptOpcodes.POP_STRING_DISCARD]: (state) => {
            state.ssp--;
        },

        [ScriptOpcodes.GOSUB_WITH_PARAMS]: (state) => {
            let procId = state.script.intOperands[state.pc];

            let proc = ScriptProvider.get(procId);
            if (!proc) {
                throw new Error('Invalid gosub proc', procId, 'in', state.script.name);
            }

            if (state.fp >= 100) {
                throw new Error('Stack overflow');
            }

            let intLocals = [];
            for (let i = 0; i < proc.intArgs; i++) {
                intLocals[i] = state.intStack[state.isp - proc.intArgs + i];
            }

            let stringLocals = [];
            for (let i = 0; i < proc.stringArgs; i++) {
                stringLocals[i] = state.stringStack[state.ssp - proc.stringArgs + i];
            }

            // console.log(`gosub ${proc.name}`, intLocals, stringLocals);

            state.isp -= state.script.intArgs;
            state.ssp -= state.script.stringArgs;

            let frame = {
                intLocals: state.intLocals,
                stringLocals: state.stringLocals,
                pc: state.pc,
                script: state.script
            };

            state.callStack[state.fp++] = frame;

            state.pc = -1;
            state.script = proc;
            state.intLocals = intLocals;
            state.stringLocals = stringLocals;
            state.script.opcodes = proc.opcodes;
            state.script.intOperands = proc.intOperands;
            state.script.stringOperands = proc.stringOperands;
        },

        [ScriptOpcodes.ADD]: (state) => {
            state.isp -= 2;
            let a = state.intStack[state.isp];
            let b = state.intStack[state.isp + 1];

            if (typeof a === 'undefined' || typeof b === 'undefined') {
                throw new Error(`Bad stack: ${a} ${b} ${state.isp} ${JSON.stringify(state.intStack)}`);
            }

            state.intStack[state.isp++] = a + b;
        },

        [ScriptOpcodes.SUB]: (state) => {
            state.isp -= 2;
            let a = state.intStack[state.isp];
            let b = state.intStack[state.isp + 1];

            if (typeof a === 'undefined' || typeof b === 'undefined') {
                throw new Error(`Bad stack: ${a} ${b} ${state.isp} ${JSON.stringify(state.intStack)}`);
            }

            state.intStack[state.isp++] = a - b;
        },

        [ScriptOpcodes.MULTIPLY]: (state) => {
            state.isp -= 2;
            let a = state.intStack[state.isp];
            let b = state.intStack[state.isp + 1];

            if (typeof a === 'undefined' || typeof b === 'undefined') {
                throw new Error(`Bad stack: ${a} ${b} ${state.isp} ${JSON.stringify(state.intStack)}`);
            }

            state.intStack[state.isp++] = a * b;
        },

        [ScriptOpcodes.DIVIDE]: (state) => {
            state.isp -= 2;
            let a = state.intStack[state.isp];
            let b = state.intStack[state.isp + 1];

            if (typeof a === 'undefined' || typeof b === 'undefined') {
                throw new Error(`Bad stack: ${a} ${b} ${state.isp} ${JSON.stringify(state.intStack)}`);
            }

            state.intStack[state.isp++] = a / b;
        },

        [ScriptOpcodes.RANDOM]: (state) => {
            let a = state.intStack[--state.isp];
            state.intStack[state.isp++] = Math.floor(Math.random() * a);
        },

        [ScriptOpcodes.RANDOMINC]: (state) => {
            let a = state.intStack[--state.isp];
            state.intStack[state.isp++] = Math.floor(Math.random() * (a + 1));
        },

        [ScriptOpcodes.MES]: (state) => {
            state.scope.sendMessage(state.popString());
        },
    };

    execute(script, args = [], scope = null) {
        let state = new ScriptState();
        state.setup(script);
        state.scope = scope;

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];

            if (typeof arg === 'number') {
                state.intLocals[i] = arg;
            } else {
                state.stringLocals[i] = arg;
            }
        }

        try {
            return this.executeInner(state);
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    executeInner(state) {
        while (state.execution === ScriptState.RUNNING) {
            if (state.pc + 1 >= state.script.opcodes.length) {
                state.execution = ScriptState.FINISHED;
                break;
            }

            state.opcount++;
            this.executeOpcode(state.opcodes[++state.pc], state);
        }

        return state;
    }

    executeOpcode(opcode, state) {
        if (!ScriptRunner.handlers[opcode]) {
            throw new Error(`Unhandled opcode: ${opcode}`);
        }

        // console.log(state.script.name, state.pc, ScriptOpcodes[opcode]);
        ScriptRunner.handlers[opcode](state);
    }
}
