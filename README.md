# nanocontext

[![Build Status](https://travis-ci.com/geut/nanocontext.svg?branch=master)](https://travis-ci.com/geut/nanocontext)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> Small module to create a context tree object to extend through decorators.

It provides a way to build a context object that you can share and be sure that only the root can modify it.

Features:
- Creates light secure copies of the root context to share.
- Create inheritable decorators.
- Provides a secure state for each context.

## <a name="install"></a> Install

```
$ npm install nanocontext
```

## <a name="usage"></a> Usage

```
const nanocontext = require('nanocontext')

const ctxRoot = nanocontext({ name: 'alice' })

```

## <a name="issues"></a> Issues

:bug: If you found an issue we encourage you to report it on [github](https://github.com/geut/nanocontext/issues). Please specify your OS and the actions to reproduce it.

## <a name="contribute"></a> Contributing

:busts_in_silhouette: Ideas and contributions to the project are welcome. You must follow this [guideline](https://github.com/geut/nanocontext/blob/master/CONTRIBUTING.md).

## License

MIT © A [**GEUT**](http://geutstudio.com/) project
