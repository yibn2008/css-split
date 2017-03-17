# css-split

[![Build Status](https://travis-ci.org/yibn2008/css-split.svg?branch=master)](https://travis-ci.org/yibn2008/css-split)
[![Coverage Status](https://coveralls.io/repos/github/yibn2008/css-split/badge.svg)](https://coveralls.io/github/yibn2008/css-split)

High performance css split package, support split css into different parts by selectors number.

features:

- 10+ times faster than `postcss` css split
- split css into parts
- count css selectors number

## Performance

Execute `npm run perf` to run performance test:

```text
> css-split@1.1.0 perf /Users/zoujie.wzj/git/css-split
> node perf/index.js

******************* START POSTCSS CSS SPLIT *******************
> write css-split/perf/output/part0-postcss-split.css: 123290 Byte (1000)
> write css-split/perf/output/part1-postcss-split.css: 91555 Byte (991)
> write css-split/perf/output/part2-postcss-split.css: 105142 Byte (1000)
> write css-split/perf/output/part3-postcss-split.css: 105242 Byte (1000)
> write css-split/perf/output/part4-postcss-split.css: 107561 Byte (988)

postcss-split: 1016.641ms

******************* START FAST CSS SPLIT *******************
> write css-split/perf/output/part0-css-split.css: 123226 Byte (1000)
> write css-split/perf/output/part1-css-split.css: 91619 Byte (992)
> write css-split/perf/output/part2-css-split.css: 105142 Byte (1000)
> write css-split/perf/output/part3-css-split.css: 105242 Byte (1000)
> write css-split/perf/output/part4-css-split.css: 107561 Byte (988)

fast-css-split: 35.537ms
```

## Usage

Split css by selectors number:

```js
const split = require('css-split')

const css = `
// some css content
@charset "UTF-8";
.ui-warp .ui-title-warp {
  margin: 20px 0 10px;
}

.ui-warp .ui-title-cont,
.ui-warp .ui-title-cont x {
  font-size: 20px;
}

.ui-warp .ui-title-cont a {
  font-size: 14px;
  margin-left: 10px;
}

.ui-warp .ui-task-desc .add-row-btn {
  margin-left: 10px;
}

//......
`

let parts = split(css, 2)
for (let part of parts) {
  console.log('count:', part.count) // selectors number
  console.log(part.content) // split content
}
```

Also you can count selectors number of css:

```js
const split = require('css-split')

const css = `
// some css content
@charset "UTF-8";
.ui-warp .ui-title-warp {
  margin: 20px 0 10px;
}

.ui-warp .ui-title-cont,
.ui-warp .ui-title-cont x {
  font-size: 20px;
}
`
// count = 3
let count = split.count(css)
```

## API

### `split(content, size)`

- `content`, *{String}*, css content
- `size`, *{Number}*, selectors number to split

split `content` by `size`, and return the parts `Array`:

```js
[{
  id: 0,
  count: 111,
  from: 0,
  to: 1212,
  content: 'split css rules ...'
}, ...]
```

### `split.count(content)`

- `content`, *{String}*, css content

count all the selectors number of `content`, and return a `Number`

## LICENSE

MIT
