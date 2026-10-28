const fs = require('node:fs');
const path = require('node:path');
const AdmZip = require('adm-zip');

const here = __dirname;
const parts = ['00', '01', '02', '03', '04'].map((n) =>
  fs.readFileSync(path.join(here, `archive.part${n}.b64`), 'utf8').trim()
);
const archive = Buffer.from(parts.join(''), 'base64');
const output = path.join(here, 'dist');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
new AdmZip(archive).extractAllTo(output, true);
if (!fs.existsSync(path.join(output, 'index.html'))) {
  throw new Error('Orbit archive extraction did not produce dist/index.html');
}
console.log('Orbit static app extracted to dist/.');
