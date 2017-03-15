'use strict'

const parse = require('./parse')

const SPLIT_SIZE = 4000

function countSelectors (node) {
  let count = 0

  if (node.type === 'rule') {
    let idx = 0
    while (idx < node.params.length) {
      let pos = node.params.indexOf(',', idx)
      if (pos >= 0) {
        count++
        idx = pos + 1
      } else {
        break
      }
    }
    count++
  } else if (node.children) {
    count += 1 + node.children.reduce((sum, node) => {
      return sum + countSelectors(node)
    }, 0)
  }

  return count
}

function split (code, size) {
  size = size || SPLIT_SIZE
  let nodes = parse(code).nodes
  let length = nodes.length
  let parts = []
  let current = {
    id: 0,
    count: 0,
    content: null
  }
  let lastSplitIdx = 0
  let index = 0

  while (index < length) {
    let node = nodes[index]
    let c = countSelectors(node)
    if (c + current.count <= size) {
      current.count += c
    } else {
      current.content = code.substring(lastSplitIdx, node.to)
      lastSplitIdx = node.to
      parts.push(current)
      current = {
        id: current.id + 1,
        count: c,
        content: null
      }
    }
    index++
  }

  if (current.id === parts.length) {
    current.content = code.substring(lastSplitIdx)
    parts.push(current)
  }

  if (parts.length) {
    return parts
  } else {
    current.content = code
    return [ current ]
  }
}

module.exports = split
