'use strict'

const postcss = require('postcss')

const LENGTH = 4000

// Get the number of selectors for a given node.
const getSelLength = node => {
  if (node.type === 'rule') {
    return node.selectors.length
  }
  if (node.type === 'atrule' && node.nodes) {
    return 1 + node.nodes.reduce((memo, n) => {
      return memo + getSelLength(n)
    }, 0)
  }
  return 0
}

// 分割 css 的插件
const plugin = postcss.plugin('postcss-split-css', options => {
  options = options || {}
  const size = options.size || LENGTH

  return (css, result) => {
    const chunks = []
    let count
    let chunk

    // Create a new chunk that holds current result.
    const nextChunk = () => {
      count = 0
      chunk = css.clone({nodes: []})
      chunks.push(chunk)
    }

    // Walk the nodes. When we overflow the selector count, then start a new
    // chunk. Collect the nodes into the current chunk.
    css.nodes.forEach((n) => {
      const selCount = getSelLength(n)
      // console.log('============', n.name, selCount)
      if (!chunk || count + selCount > size) {
        nextChunk()
      }
      chunk.nodes.push(n)
      count += selCount
    })

    // Output the results.
    result.chunks = chunks.map(c => {
      return c.toResult({})
    })
  }
})

module.exports = function (content, size) {
  return postcss([plugin({ size })])
    .process(content)
    .then(result => {
      return result.chunks.map(chunk => {
        return chunk.css
      })
    })
}
