'use strict'

const fs = require('fs')
const path = require('path')
const assert = require('assert')
const postcss = require('postcss')
const split = require('..')

const fixturesDir = path.join(__dirname, 'fixtures')

function countNode (node) {
  if (node.type === 'rule') {
    return node.selectors.length
  }
  if (node.type === 'atrule' && node.nodes) {
    return 1 + node.nodes.reduce((memo, n) => {
      return memo + countNode(n)
    }, 0)
  }
  return 0
}

const plugin = postcss.plugin('postcss-count', () => {
  return (css, result) => {
    result.count = 0

    for (let node of css.nodes) {
      result.count += countNode(node)
    }
  }
})

describe('test css-split', function () {
  it('should able to split css', function * () {
    let files = [
      // name, size
      ['next.css', 1000],
      ['next.min.css', 1000],
      ['broken.css', 5]
    ]

    for (let pair of files) {
      // split next.css
      let name = pair[0]
      let size = pair[1]
      let all = fs.readFileSync(path.join(fixturesDir, name), 'utf8').trim()
      let parts = split(all, size)
      let contents = []

      for (let part of parts) {
        // able to parse, means syntax is correct
        let count = (yield postcss([plugin()]).process(part.content)).count
        assert(part.count <= size, `need ${part.count} <= ${size}}`)
        assert(count <= size, `need ${count} <= ${size}}`)
        contents.push(part.content)
      }

      assert.equal(contents.join(''), all)
    }
  })

  it('should able to count css', function () {
    let content = fs.readFileSync(path.join(fixturesDir, 'next.css'), 'utf8')

    assert.equal(split.count(content), 4980)
  })
})
