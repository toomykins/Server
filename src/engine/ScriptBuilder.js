import Script from '#engine/Script.js';
import ScriptOpcodes from '#engine/ScriptOpcodes.js';

export default class ScriptBuilder {
    intParameterCount = 0;
    stringParameterCount = 0;
    intLocals = 0;
    stringLocals = 0;
    opcodes = [];
    intOperands = [];
    scriptOperands = [];

    static decode(stream) {
        stream.pos = stream.length - 2;

        let trailerLen = stream.g2();
        let trailerPos = stream.length - trailerLen - 12 - 2;

        let script = new Script();

        stream.pos = trailerPos;
        let instructions = stream.g4();
        script.intLocals = stream.g2();
        script.stringLocals = stream.g2();
        script.intArgs = stream.g2();
        script.stringArgs = stream.g2();

        let switches = stream.g1();
        for (let i = 0; i < switches; i++) {
            let count = stream.g2();
            let table = [];

            for (let j = 0; j < count; j++) {
                table.push({ value: stream.g4(), offset: stream.g4() });
            }

            script.switchTables[i] = table;
        }

        stream.pos = 0;
        script.name = stream.gjnstr();
        script.alloc();

        let instr = 0;
        while (trailerPos > stream.pos) {
            let opcode = stream.g2();

            if (opcode === ScriptOpcodes.PUSH_CONSTANT_STRING) {
                script.stringOperands[instr] = stream.gjnstr();
            } else if (opcode < 100 && opcode !== ScriptOpcodes.RETURN && opcode !== ScriptOpcodes.POP_INT_DISCARD && opcode !== ScriptOpcodes.POP_STRING_DISCARD) {
                script.intOperands[instr] = stream.g4();
            } else {
                script.intOperands[instr] = stream.g1();
            }

            script.opcodes[instr++] = opcode;
        }

        return script;
    }
}
