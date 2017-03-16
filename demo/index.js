'use strict'

const fs = require('fs')
const path = require('path')
const split = require('..')

let code = fs.readFileSync(path.join(__dirname, 'demo.css'), 'utf8')
let parts = split(code, 5)

parts.forEach(part => {
  console.log('> part count:', part.count)
  console.log('----------------------------')
  console.log(part.content)
  console.log('----------------------------')
})
