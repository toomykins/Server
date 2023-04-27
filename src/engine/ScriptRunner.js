import ScriptOpcodes from '#engine/ScriptOpcodes.js';
import ScriptState from '#engine/ScriptState.js';
import ScriptProvider from '#engine/ScriptProvider.js';
import World from './World.js';

// script executor
export default class ScriptRunner {
    static handlers = {
        // Language required opcodes

        [ScriptOpcodes.PUSH_CONSTANT_INT]: (state) => {
            state.pushInt(state.intOperand);
        },

        [ScriptOpcodes.PUSH_CONSTANT_STRING]: (state) => {
            state.pushString(state.stringOperand);
        },

        [ScriptOpcodes.BRANCH]: (state) => {
            state.pc += state.intOperand;
        },

        [ScriptOpcodes.BRANCH_NOT]: (state) => {
            let b = state.popInt();
            let a = state.popInt();

            if (a !== b) {
                state.pc += state.intOperand;
            }
        },

        [ScriptOpcodes.BRANCH_EQUALS]: (state) => {
            let b = state.popInt();
            let a = state.popInt();

            if (a === b) {
                state.pc += state.intOperand;
            }
        },

        [ScriptOpcodes.BRANCH_LESS_THAN]: (state) => {
            let b = state.popInt();
            let a = state.popInt();

            if (a < b) {
                state.pc += state.intOperand;
            }
        },

        [ScriptOpcodes.BRANCH_GREATER_THAN]: (state) => {
            let b = state.popInt();
            let a = state.popInt();

            if (a > b) {
                state.pc += state.intOperand;
            }
        },

        [ScriptOpcodes.RETURN]: (state) => {
            if (state.fp === 0) {
                state.execution = ScriptState.FINISHED;
                return;
            }

            let frame = state.frames[--state.fp];
            state.pc = frame.pc;
            state.script = frame.script;
            state.intLocals = frame.intLocals;
            state.stringLocals = frame.stringLocals;
        },

        [ScriptOpcodes.BRANCH_LESS_THAN_OR_EQUALS]: (state) => {
            let b = state.popInt();
            let a = state.popInt();

            if (a <= b) {
                state.pc += state.intOperand;
            }
        },

        [ScriptOpcodes.BRANCH_GREATER_THAN_OR_EQUALS]: (state) => {
            let b = state.popInt();
            let a = state.popInt();

            if (a >= b) {
                state.pc += state.intOperand;
            }
        },

        [ScriptOpcodes.PUSH_INT_LOCAL]: (state) => {
            state.pushInt(state.intLocals[state.intOperand]);
        },

        [ScriptOpcodes.POP_INT_LOCAL]: (state) => {
            state.intLocals[state.intOperand] = state.popInt();
        },

        [ScriptOpcodes.PUSH_STRING_LOCAL]: (state) => {
            state.pushString(state.stringLocals[state.intOperand]);
        },

        [ScriptOpcodes.POP_STRING_LOCAL]: (state) => {
            state.stringLocals[state.intOperand] = state.popString();
        },

        [ScriptOpcodes.JOIN_STRING]: (state) => {
            let count = state.intOperand;

            let strings = [];
            for (let i = 0; i < count; i++) {
                strings.push(state.popString());
            }

            state.pushString(strings.reverse().join(''));
        },

        [ScriptOpcodes.POP_INT_DISCARD]: (state) => {
            state.isp--;
        },

        [ScriptOpcodes.POP_STRING_DISCARD]: (state) => {
            state.ssp--;
        },

        [ScriptOpcodes.GOSUB_WITH_PARAMS]: (state) => {
            let procId = state.intOperand;
            let proc = ScriptProvider.get(procId);
            if (!proc) {
                throw new Error('Invalid gosub proc ' + procId);
            }

            if (state.fp >= 50) {
                throw new Error('Stack overflow');
            }

            // copy stack to locals (passing args)
            let intLocals = [];
            for (let i = 0; i < proc.intArgCount; i++) {
                intLocals[proc.intArgCount - i - 1] = state.popInt();
            }

            let stringLocals = [];
            for (let i = 0; i < proc.stringArgCount; i++) {
                stringLocals[proc.stringArgCount - i - 1] = state.popString();
            }

            // console.log(`gosub ${proc.name}`, intLocals, stringLocals);

            state.frames[state.fp++] = {
                pc: state.pc,
                script: state.script,
                intLocals: state.intLocals,
                stringLocals: state.stringLocals,
            };

            state.pc = -1;
            state.script = proc;
            state.intLocals = intLocals;
            state.stringLocals = stringLocals;
        },

        [ScriptOpcodes.SWITCH]: (state) => {
            let table = state.script.switchTables[state.intOperand];
            let key = state.popInt();
            let result = table[key];
            pc += result;
        },

        // Server opcodes
        [ScriptOpcodes.IF_CHATSELECT]: (state) => {
            World.getPlayer(state.player).showChoices(...state.popString().split('|'));
        },

        [ScriptOpcodes.P_PAUSEBUTTON]: (state) => {
            state.execution = ScriptState.PAUSEBUTTON;
        },

        [ScriptOpcodes.LAST_COMSUBID]: (state) => {
            state.pushInt(World.getPlayer(state.player).lastComSubId);
        },

        [ScriptOpcodes.JUMP]: (state) => {
            let label = state.popString();
            let proc = ScriptProvider.getByName(`[proc,${label}]`);
            if (!proc) {
                throw new Error('Invalid jump label ' + label);
            }

            state.script = proc;
            state.pc = -1;
            state.frames = [];
            state.fp = 0;
            state.intStack = [];
            state.isp = 0;
            state.stringStack = [];
            state.ssp = 0;
            state.intLocals = [];
            state.stringLocals = [];
        },

        [ScriptOpcodes.CHATNPC]: (state) => {
            let text = state.popString();
            let expression = state.popString();
            let npc = World.getNpc(state.npc);
            World.getPlayer(state.player).showNpcMessage(npc.id, expression, ...text.split('|'));
            state.execution = ScriptState.PAUSEBUTTON;
        },

        // Math opcodes

        [ScriptOpcodes.ADD]: (state) => {
            let b = state.popInt();
            let a = state.popInt();
            state.intStack[state.isp++] = a + b;
        },

        [ScriptOpcodes.SUB]: (state) => {
            let b = state.popInt();
            let a = state.popInt();
            state.intStack[state.isp++] = a - b;
        },

        [ScriptOpcodes.MULTIPLY]: (state) => {
            let b = state.popInt();
            let a = state.popInt();
            state.intStack[state.isp++] = a * b;
        },

        [ScriptOpcodes.DIVIDE]: (state) => {
            let b = state.popInt();
            let a = state.popInt();
            state.intStack[state.isp++] = a / b;
        },

        [ScriptOpcodes.RANDOM]: (state) => {
            let a = state.popInt();
            state.intStack[state.isp++] = Math.floor(Math.random() * a);
        },

        [ScriptOpcodes.RANDOMINC]: (state) => {
            let a = state.popInt();
            state.intStack[state.isp++] = Math.floor(Math.random() * (a + 1));
        },
    };

    static init(script, player = null, npc = null, loc = null, obj = null) {
        if (!script) {
            return null;
        }

        let state = new ScriptState(script);
        state.player = player;
        state.npc = npc;
        state.loc = loc;
        state.obj = obj;
        return state;
    }

    static execute(state, benchmark = false) {
        if (!state) {
            return null;
        }

        try {
            while (state.execution === ScriptState.RUNNING) {
                if (state.pc >= state.script.opcodes.length || state.pc < -1) {
                    throw new Error('Invalid program counter: ' + state.pc + ', max expected: ' + state.script.opcodes.length);
                }

                // if we're benchmarking we don't care about the opcount
                if (!benchmark && state.opcount > 500_000) {
                    throw new Error('Too many instructions');
                }

                state.opcount++;
                ScriptRunner.executeInner(state, state.script.opcodes[++state.pc]);
            }
        } catch (err) {
            console.error('script error:', err.message, '\n');
            console.error(`${state.script.info.sourceFilePath}`);

            console.error('stack backtrace:');
            console.error(`\t1: ${state.script.name} - ${state.script.fileName}:${state.script.lineNumber(state.pc)}`);
            for (let i = state.fp; i >= 0; i--) {
                let frame = state.frames[i];
                console.error(`\t${state.fp - i + 2}: ${frame.script.name} - ${frame.script.fileName}:${frame.script.lineNumber(frame.pc)}`);
            }

            state.execution = ScriptState.ABORTED;
        }

        return state;
    }

    static executeInner(state, opcode) {
        if (!ScriptRunner.handlers[opcode]) {
            throw new Error(`Unknown opcode ${opcode}`);
        }

        // console.log(state.script.name, 'line:', state.script.lineNumber(state.pc), ScriptOpcodes[opcode]);
        ScriptRunner.handlers[opcode](state);
    }
}
