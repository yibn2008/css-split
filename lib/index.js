'use strict'

const debug = require('debug')('css-split')
const format = require('util').format

// @see: https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule
const SHORT_AT_RULES = [
  'namespace',
  'charset',
  'import'
]
const NESTED_AT_RULES = [
  'media',
  'supports',
  'document',
  'page',
  'font-face',
  'keyframes',
  'viewport',
  'counter-style',
  'font-feature-values',
  'swash',
  'ornaments',
  'annotation',
  'stylistic',
  'styleset',
  'character-variant'
]

function skipWhitespace (code, index) {
  let i = index
  let length = code.length

  while (i < length) {
    // whtespace: ASCII code <= 32
    if (code.charCodeAt(i) > 32) {
      break
    }
    i++
  }

  return i
}

function skipComment (code, index) {
  // /*...*/
  //   ^
  index += 2

  let endIdx = code.indexOf('*/', index)
  if (endIdx < 0) {
    endIdx = code.length
    throw new Error(format('unexpected end of comment: from = %s...', code.substring(code, index, index + 10)))
  } else {
    // /*...*/
    //        ^
    endIdx += 2
  }

  return endIdx
}

function skipString (code, index) {
  let delimiter = code[index]
  let length = code.length

  // "..."
  //  ^
  index++

  while (index < length) {
    if (code[index] === delimiter) {
      break
    } else if (code[index] === '\\') {
      // skip any \{x}
      index += 2
    } else {
      index++
    }
  }

  // "..."
  //      ^
  return index + 1
}

function skipAll (code, index) {
  let length = code.length
  while (index < length) {
    let startIndex = index

    if (code[index] === '\'' || code[index] === '"') {
      // skip string literal
      index = skipString(code, index)
    } else if (code[index] === '/' && code[index + 1] === '*') {
      // skip comment
      index = skipComment(code, index)
    } else {
      index = skipWhitespace(code, index)
    }

    // no more move, break
    if (startIndex === index) {
      break
    }
  }
  return index
}

function readAtRule (code, index) {
  let node = {
    type: 'atRule',
    name: '',
    params: '',
    from: index,
    to: index,
    children: []
  }
  let rule = /@([\w-]+)/g
  rule.lastIndex = index
  let result = rule.exec(code)

  if (!result) {
    throw new Error(format('unexpected at rule: %s...', code.substring(code, index, index + 10)))
  }
  node.name = result[1]

  let realname = node.name.replace(/^-\w+-/, '')
  let length = code.length
  let startIndex = index + node.name.length + 1

  index = startIndex
  if (NESTED_AT_RULES.indexOf(realname) >= 0) {
    // search: @xxx ... { { ... } }
    while (index < length) {
      if (code[index] === '{') {
        // meet content start, process content rescurively
        let readed = readNodes(code, index + 1)

        node.params = code.substring(startIndex, index).trim()
        node.children = readed.nodes

        index = readed.to
      } else if (code[index] === '}') {
        // meet terminator
        index++
        break
      } else {
        let skippedIndex = skipAll(code, index)
        if (skippedIndex !== index) {
          index = skippedIndex
        } else {
          index++
        }
      }
    }

    node.to = index
  } else if (SHORT_AT_RULES.indexOf(realname) >= 0) {
    // search: @xxx ...;
    while (index < length) {
      if (code[index] === ';') {
        // meet terminator
        node.params = code.substring(startIndex, index).trim()
        index++
        break
      } else {
        let skippedIndex = skipAll(code, index)
        if (skippedIndex !== index) {
          index = skippedIndex
        } else {
          index++
        }
      }
    }

    node.to = index
  } else {
    throw new Error(`unexpected at rule: @${node.name}`)
  }

  debug('readAtRule(): index = %s, node = %j', index, node)

  return node
}

function readRule (code, index) {
  let node = {
    type: 'rule',   // rule|atRule
    params: '',
    from: index,
    to: index
  }
  let length = code.length
  let startIndex = index

  while (index < length) {
    if (code[index] === '{') {
      // meet start of content
      node.params = code.substring(startIndex, index).substring()
      index++
    } else if (code[index] === '}') {
      // meet terminator
      index++
      break
    } else {
      let skippedIndex = skipAll(code, index)
      if (skippedIndex !== index) {
        index = skippedIndex
      } else {
        index++
      }
    }
  }

  node.to = index

  debug('readRule(): index = %s, node = %j', index, node)

  return node
}

function readNodes (code, index) {
  index = index || 0

  let length = code.length
  let from = index
  let nodes = []

  while (index < length) {
    index = skipAll(code, index)

    // now rest chars will ready to process
    if (code[index] === '}') {
      // meet parent nodes
      break
    } else {
      // no other chars, now we can read rules
      let node
      if (code[index] === '@') {
        node = readAtRule(code, index)
      } else {
        node = readRule(code, index)
      }

      nodes.push(node)
      index = node.to
    }
  }

  return {
    nodes,
    from,
    to: index
  }
}

module.exports = {
  parse: readNodes
}
