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
  } else {
    count += 1

    if (node.children) {
      count += node.children.reduce((sum, node) => {
        return sum + countSelectors(node)
      }, 0)
    }
  }

  return count
}

function split (code, size) {
  code = code.toString()
  size = size || SPLIT_SIZE
  let nodes = parse(code).nodes
  let length = nodes.length
  let parts = []
  let current = {
    id: 0,
    count: 0,
    content: null,
    from: 0,
    to: 0
  }
  let index = 0

  while (index < length) {
    let node = nodes[index]
    let c = countSelectors(node)
    if (c + current.count <= size) {
      current.to = node.to
      current.count += c
    } else {
      current.content = code.substring(current.from, current.to)
      parts.push(current)
      current = {
        id: current.id + 1,
        count: c,
        from: current.to,
        to: node.to,
        content: null
      }
    }
    index++
  }

  // 如果不足 size 个
  if (!parts.length) {
    current.content = code
    parts.push(current)
  } else if (current.id === parts.length) {
    current.content = code.substring(current.from, current.to)
    parts.push(current)
  }

  return parts
}

function count (code) {
  code = code.toString()
  let nodes = parse(code).nodes
  let sum = 0

  for (let node of nodes) {
    sum += countSelectors(node)
  }

  return sum
}

module.exports = split
module.exports.count = count
