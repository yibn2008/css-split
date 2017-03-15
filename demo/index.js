'use strict'

const fs = require('fs')
const path = require('path')
const parse = require('..').parse

let code = fs.readFileSync(path.join(__dirname, 'index.css'), 'utf8')

console.time('parse')
parse(code)
console.timeEnd('parse')
