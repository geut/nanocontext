# nanocontext

[![Build Status](https://travis-ci.com/geut/nanocontext.svg?branch=main)](https://travis-ci.com/geut/nanocontext)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> Small module to create a stateful context tree object to extend through decorators.

It provides a way to build a context object that you can share, extend and be sure that only the root can modify it.

Features:
- Creates light secure copies of the root context to share.

## <a name="install"></a> Install

```
$ npm install nanocontext
```

## <a name="usage"></a> Usage

```javascript
import { nanocontext } from 'nanocontext'

const ctxRoot = nanocontext({ name: 'alice' })

ctxRoot.hello = () => 'hello from root'

console.log(ctxRoot.hello()) // hello from root

const ctxChild = ctxRoot.clone()

console.log(ctxChild.hello()) // hello from root (by inheritance)

ctxChild.hello = () => 'hello from child'

console.log(ctxRoot.hello()) // hello from root (it doesn't change)

console.log(ctxChild.hello()) // hello from child
```

## API

#### `const ctx = nanocontext(source, options)`

It creates a new nanocontext instance based on an initial object.

- `source = {}`: The initial source context object.

Options can be:

- `builtInMethods = true`: Defines a set of built-in methods to work with the context. You can disabled and access to these methods from generic functions.
- `parent = null`: Parent object to inherit.

#### `ctx.root`

Return the root context.

Alternative: `getRoot(ctx)`

#### `ctx.parent`

Return the parent context.

Alternative: `getParent(ctx)`

#### `ctx.clone(source = ctx)`

Return a new context inherit from the current context (`ctx`) or from a new object.

```javascript
const child = ctx.clone()
```

Alternative: `getClone(ctx, source)`

## <a name="issues"></a> Issues

:bug: If you found an issue we encourage you to report it on [github](https://github.com/geut/nanocontext/issues). Please specify your OS and the actions to reproduce it.

## <a name="contribute"></a> Contributing

:busts_in_silhouette: Ideas and contributions to the project are welcome. You must follow this [guideline](https://github.com/geut/nanocontext/blob/master/CONTRIBUTING.md).

## License

MIT © A [**GEUT**](http://geutstudio.com/) project
