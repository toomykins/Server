// script state (maintains serverscript control flow)
export default class ScriptState {
    static RUNNING = 0;
    static SUSPENDED = 1;
    static FINISHED = 2;
    static ABORTED = 3;

    // interpreter state
    script = null;
    execution = ScriptState.RUNNING;

    pc = -1; // program counter
    opcount = 0; // number of opcodes executed

    frames = [];
    fp = 0; // frame pointer

    intStack = [];
    isp = 0; // int stack pointer

    stringStack = [];
    ssp = 0; // string stack pointer

    intLocals = [];
    stringLocals = [];

    // server state
    player = null;
    npc = null;
    obj = null;
    loc = null;

    constructor(script, args = []) {
        this.script = script;

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];

            if (typeof arg === 'number') {
                state.intLocals[i] = arg;
            } else {
                state.stringLocals[i] = arg;
            }
        }
    }

    get intOperand() {
        return this.script.intOperands[this.pc];
    }

    get stringOperand() {
        return this.script.stringOperands[this.pc];
    }

    popInt() {
        return this.intStack[--this.isp];
    }

    pushInt(value) {
        this.intStack[this.isp++] = value;
    }

    popString() {
        return this.stringStack[--this.ssp];
    }

    pushString(value) {
        this.stringStack[this.ssp++] = value;
    }
}
