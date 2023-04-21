const { readFileSync, writeFileSync } = require("fs")

const file = (process.argv[2])

const rom = [...readFileSync(file)]

writeFileSync('output.js', `
window.rom = [${rom.join(',')}];
`)