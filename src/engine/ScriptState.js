export default class ScriptState {
    static RUNNING = 0;
    static SUSPENDED = 1;
    static FINISHED = 2;
    static ABORTED = 3;

    static DEFAULT_STACK_SIZE = 16;
    static MAX_STACK_SIZE = 1024;

    script = null;
    onComplete = null;
    pc = -1; // program counter
    opcount = 0;
    execution = ScriptState.RUNNING;
    callStack = [];
    fp = 0; // frame pointer
    intLocals = [];
    stringLocals = [];
    intStack = [];
    isp = 0; // int stack pointer
    stringStack = [];
    ssp = 0; // string stack pointer

    get opcodes() {
        return this.script.opcodes;
    }

    popInt() {
        return this.intStack[--this.isp];
    }

    popString() {
        return this.stringStack[--this.ssp];
    }

    pushInt(value) {
        this.intStack[this.isp++] = value;
    }

    pushString(value) {
        this.stringStack[this.ssp++] = value;
    }

    setup(script) {
        this.script = script;
        this.intLocals = [];
        this.stringLocals = [];
    }

    reset() {
        this.script = null;
        this.onComplete = null;
        this.pc = -1;
        this.opcount = 0;
        this.execution = ScriptState.RUNNING;
        this.callStack = [];
        this.fp = 0;
        this.intLocals = [];
        this.stringLocals = [];
        this.intStack = [];
        this.stringStack = [];
        this.isp = 0;
        this.ssp = 0;
    }

    close() {
        this.callStack = [];
        this.fp = 0;
        // this.reset();
    }
}
