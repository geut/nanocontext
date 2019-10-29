# nanocontext

[![Build Status](https://travis-ci.com/geut/nanocontext.svg?branch=master)](https://travis-ci.com/geut/nanocontext)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> Small module to create a stateful context tree object to extend through decorators.

It provides a way to build a context object that you can share, extend and be sure that only the root can modify it.

Features:
- Creates light secure copies of the root context to share.
- Create inheritable decorators.
- Provides a secure state for each context.

## <a name="install"></a> Install

```
$ npm install nanocontext
```

## <a name="usage"></a> Usage

```javascript
const nanocontext = require('nanocontext')

const ctxRoot = nanocontext({ name: 'alice' })

ctxRoot.decorate('hello', () => 'hello from root')

console.log(ctxRoot.hello()) // hello from root

const ctxChild = ctxRoot.snapshot()

console.log(ctxChild.hello()) // hello from root (by inheritance)

ctxChild.decorate('hello', () => 'hello from child')

console.log(ctxRoot.hello()) // hello from root (it doesn't change)

console.log(ctxChild.hello()) // hello from child
```

## API

#### `const ctx = nanocontext(init, options)`

It creates a new nanocontext instance based on an initial object.

Options can be:

- `builtInMethods = true`: Defines a set of built-in methods to work with the context. You can disabled and access to these methods from generic functions.
- `onstatechange`: Execute a function when the state of a context change.
- `freeze = true`: Defines if the context properties are freeze. This option applies only for the child context.
- `state = {}`: Default state for the current context.

#### `ctx.root`

Return the root context.

Alternative: `getRoot(ctx)`

#### `ctx.parent`

Return the parent context.

Alternative: `getParent(ctx)`

#### `ctx.snapshot(options = {})`

Return a new context inherit from `ctx`.

```javascript
const child = ctx.snapshot()
```

Alternative: `getSnapshot(ctx)`

#### `ctx.decorate(name, any) -> ctx`

Secure decoration of a context without override the parent context.

```javascript
ctx.decorate('name', 'alice')
ctx.decorate('foo', () => 'foo')
console.log(ctx.name) // alice
console.log(ctx.foo()) // foo
```

Alternative: `decorate(ctx, name, any) -> ctx`

#### `ctx.setState(newState) -> state`

Set new a context state. This state cannot be modify it directly, it always need to be modified through this method.

Alternative: `setState(ctx, newState) -> state`

## <a name="issues"></a> Issues

:bug: If you found an issue we encourage you to report it on [github](https://github.com/geut/nanocontext/issues). Please specify your OS and the actions to reproduce it.

## <a name="contribute"></a> Contributing

:busts_in_silhouette: Ideas and contributions to the project are welcome. You must follow this [guideline](https://github.com/geut/nanocontext/blob/master/CONTRIBUTING.md).

## License

MIT © A [**GEUT**](http://geutstudio.com/) project
