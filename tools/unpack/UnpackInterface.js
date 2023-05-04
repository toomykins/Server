import fs from 'fs';
import Jagfile from '#io/Jagfile.js';

console.log('Unpacking interface data...');

const jag = Jagfile.fromFile('dump/interface');
const data = jag.read('data');

data.toFile('dump/interface.raw/data');
