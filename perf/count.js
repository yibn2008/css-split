'use strict'

const fs = require('fs')
const path = require('path')
const co = require('co')
const postcss = require('postcss')

// Get the number of selectors for a given node.
const countSelectors = node => {
  if (node.type === 'rule') {
    return node.selectors.length
  }
  if (node.type === 'atrule' && node.nodes) {
    return 1 + node.nodes.reduce((memo, n) => {
      return memo + countSelectors(n)
    }, 0)
  }
  return 0
}

const plugin = postcss.plugin('count-selector', () => {
  return (css, result) => {
    let count = 0
    for (let node of css.nodes) {
      count += countSelectors(node)
    }

    result.count = count
  }
})

const countFile = function (file) {
  let content = fs.readFileSync(file, 'utf8')
  return postcss([plugin()])
    .process(content)
    .then(result => {
      return result.count
    })
}

co(function * () {
  const outputDir = path.join(__dirname, 'output')
  const entries = fs.readdirSync(outputDir)
  for (let entry of entries) {
    let file = path.join(outputDir, entry)
    let count = yield countFile(file)

    console.log('[count] %s: %s', file, count)
  }
}).catch(err => console.error(err))
