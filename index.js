const {
  NCTX_ERR_INVALID_SETTER,
  NCTX_ERR_INVALID_CONTEXT_ARGUMENT,
  NCTX_ERR_DEC_ALREADY_PRESENT
} = require('./errors')

const kIsNanocontext = Symbol('nanocontext.isnanocontext')
const kRoot = Symbol('nanocontext.root')
const kParent = Symbol('nanocontext.parent')
const kDecorate = Symbol('nanocontext.decorate')
const kSnapshot = Symbol('nanocontext.snapshot')
const kState = Symbol('nanocontext.state')
const kSetState = Symbol('nanocontext.setstate')

const deepFreeze = (obj, parent) => {
  if (!obj || typeof obj !== 'object') {
    return obj
  }

  return new Proxy(obj, {
    get (_, prop) {
      return deepFreeze(Reflect.get(...arguments), `${parent}.${prop.toString()}`)
    },
    set (_, prop) {
      throw new NCTX_ERR_INVALID_SETTER(`${parent}.${prop.toString()}`)
    }
  })
}

class Nanocontext {
  constructor (ctx, opts = {}) {
    if (typeof ctx !== 'object') throw new NCTX_ERR_INVALID_CONTEXT_ARGUMENT(ctx)

    const { onstatechange = () => {}, builtInMethods = true } = opts

    this.opts = opts
    this.builtInMethods = builtInMethods
    this.onstatechange = onstatechange
    this.decorators = new Map()
    this.state = deepFreeze({}, 'state')

    this.decorate = this.decorate.bind(this)
    this.snapshot = this.snapshot.bind(this)
    this.setState = this.setState.bind(this)
    this.publicMethods = ['root', 'parent', 'state', 'decorate', 'snapshot', 'setState']

    this.target = new Proxy(ctx, this)

    if (ctx[kIsNanocontext]) {
      this.root = ctx[kRoot]
      this.parent = ctx
    } else {
      this.root = this.target
      this.parent = null
    }

    return this.target
  }

  get (_, prop) {
    if (this.decorators.has(prop)) return this.decorators.get(prop)

    switch (prop) {
      case kIsNanocontext: return true
      case kRoot: return Reflect.get(this, 'root')
      case kParent: return Reflect.get(this, 'parent')
      case kDecorate: return Reflect.get(this, 'decorate')
      case kSnapshot: return Reflect.get(this, 'snapshot')
      case kState: return Reflect.get(this, 'state')
      case kSetState: return Reflect.get(this, 'setState')
    }

    if (this.builtInMethods && this.publicMethods.includes(prop)) {
      return Reflect.get(this, prop)
    }

    return Reflect.get(...arguments)
  }

  set (_, prop) {
    if (this.decorators.has(prop)) {
      throw new NCTX_ERR_INVALID_SETTER(`decorator.${prop}`)
    }

    return Reflect.set(...arguments)
  }

  decorate (name, decorator) {
    if (this.decorators.has(name)) {
      throw new NCTX_ERR_DEC_ALREADY_PRESENT(name)
    }

    if (typeof decorator === 'function') {
      decorator.bind(this.target)
    }

    this.decorators.set(name, decorator)
  }

  setState (state, reason) {
    this.state = deepFreeze(Object.assign({}, this.state, state), 'state')
    this.onstatechange(this.state, reason)
    return this.state
  }

  snapshot (opts) {
    return new Nanocontext(this.target, opts || this.opts)
  }
}

function nanocontext (...args) {
  return new Nanocontext(...args)
}

nanocontext.Nanocontext = Nanocontext
nanocontext.getRoot = ctx => ctx[kRoot]
nanocontext.getParent = ctx => ctx[kParent]
nanocontext.decorate = (ctx, name, decorator) => ctx[kDecorate](name, decorator)
nanocontext.getSnapshot = (ctx, opts = {}) => ctx[kSnapshot](opts)
nanocontext.getState = ctx => ctx[kState]
nanocontext.setState = (ctx, state, reason) => ctx[kSetState](state, reason)

module.exports = nanocontext
