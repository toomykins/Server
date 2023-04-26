export default class Script {
    sourceInfo = {
        name: null
    };
    opcodes = [];
    intLocals = 0;
    stringLocals = 0;
    intArgs = 0;
    stringArgs = 0;
    intOperands = new Int32Array();
    stringOperands = [];
    switchTables = [];

    get name() {
        return this.sourceInfo.name;
    }

    set name(value) {
        this.sourceInfo.name = value;
    }

    alloc() {
        this.opcodes = [];
        this.intOperands = [];
        this.stringOperands = [];
    }
}
