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
  this.timeout(20000)

  it('should able to split css', function * () {
    let files = [
      // name, size
      'next.css',
      'next.min.css',
      'simple.css'
    ]

    for (let name of files) {
      // split next.css
      let size = 1000
      let all = fs.readFileSync(path.join(fixturesDir, name), 'utf8').trim()
      let parts = split(all, size)
      let contents = []

      for (let part of parts) {
        // able to parse, means syntax is correct
        let count = (yield postcss([plugin()]).process(part.content)).count
        assert.equal(part.id, contents.length)
        assert(part.to > part.from)
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

  it('should able to split broken css', function () {
    let content = fs.readFileSync(path.join(fixturesDir, 'broken.css'), 'utf8')
    assert.equal(split(content, 1).length, 3)
  })
})
