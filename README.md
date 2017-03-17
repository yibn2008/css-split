# css-split

split css into different parts by selectors number

features:

- split css into parts
- count css selectors number

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

### `count(content)`

- `content`, *{String}*, css content

count all the selectors number of `content`, and return a `Number`

## LICENSE

MIT
