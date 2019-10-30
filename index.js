/**
 * @typedef {object} NanocontextOptions
 * @property {function} [onstatechange] - Execute a function when the state of a context change.
 * @property {boolean} [builtInMethods=true] - Defines a set of built-in methods to work with the context. You can disabled and access to these methods from generic functions.
 * @property {boolean} [freeze=true] - Defines if the context properties are freeze. This option applies only for the child context.
 * @property {object} [state={}] - Default state for the current context.
 */

const {
  NCTX_ERR_INVALID_SETTER,
  NCTX_ERR_INVALID_CONTEXT_ARGUMENT,
  NCTX_ERR_DEC_ALREADY_PRESENT,
  NCTX_ERR_INVALID_STATE
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

/**
 * Nanocontext
 *
 */
class Nanocontext {
  /**
   * @param {object} ctx - Initial context.
   * @param {NanocontextOptions} [opts] - Options.
   */
  constructor (ctx, opts = {}) {
    if (typeof ctx !== 'object') throw new NCTX_ERR_INVALID_CONTEXT_ARGUMENT(ctx)

    const { onstatechange = () => {}, builtInMethods = true, freeze = true, state = {} } = opts

    this._opts = opts
    this._onstatechange = onstatechange
    this._builtInMethods = builtInMethods
    this._freeze = freeze
    this._decorators = new Map()
    this._publicMethods = ['root', 'parent', 'state', 'decorate', 'snapshot', 'setState']

    /**
     * Context state.
     * @type {object}
     */
    this.state = typeof state === 'object' ? deepFreeze(state, 'state') : new NCTX_ERR_INVALID_STATE(state)

    /**
     * Get the root context.
     * @type {object}
     */
    this.root = null

    /**
     * Get the parent context.
     * @type {object}
     */
    this.parent = null

    this.decorate = this.decorate.bind(this)
    this.snapshot = this.snapshot.bind(this)
    this.setState = this.setState.bind(this)

    this._target = new Proxy(ctx, this)

    if (ctx[kIsNanocontext]) {
      this.root = ctx[kRoot]
      this.parent = ctx
    } else {
      this.root = this._target
    }

    return this._target
  }

  get (_, prop) {
    if (this._decorators.has(prop)) return this._decorators.get(prop)

    switch (prop) {
      case kIsNanocontext: return true
      case kRoot: return Reflect.get(this, 'root')
      case kParent: return Reflect.get(this, 'parent')
      case kDecorate: return Reflect.get(this, 'decorate')
      case kSnapshot: return Reflect.get(this, 'snapshot')
      case kState: return Reflect.get(this, 'state')
      case kSetState: return Reflect.get(this, 'setState')
    }

    if (this._builtInMethods && this._publicMethods.includes(prop)) {
      return Reflect.get(this, prop)
    }

    const getter = Reflect.get(...arguments)

    if (this._freeze && this.parent) {
      return deepFreeze(getter, `ctx.${prop.toString()}`)
    }

    return getter
  }

  set (_, prop) {
    if (this._decorators.has(prop)) {
      throw new NCTX_ERR_INVALID_SETTER(`decorator.${prop}`)
    }

    // Only the root can modify the ctx directly.
    if ((this._freeze && this.parent) || (this._builtInMethods && this._publicMethods.includes(prop))) {
      throw new NCTX_ERR_INVALID_SETTER(`ctx.${prop.toString()}`)
    }

    return Reflect.set(...arguments)
  }

  /**
   * Secure decoration of a context without override the parent context.
   *
   * @param {string} name - Decorator name.
   * @param {*} decorator - Any type to decorate the context.
   * @returns {Nanocontext}
   */
  decorate (name, decorator) {
    if (this._decorators.has(name)) {
      throw new NCTX_ERR_DEC_ALREADY_PRESENT(name)
    }

    if (typeof decorator === 'function') {
      decorator.bind(this._target)
    }

    this._decorators.set(name, decorator)

    return this
  }

  /**
   * Set a new a context state.
   * This state cannot be modify it directly, it always need to be modified through this method.
   *
   * @param {*} state - New state.
   * @param {string} [reason] - Optional message explaining the need of change the state.
   * @returns {State}
   */
  setState (state, reason) {
    if (typeof state !== 'object') throw new NCTX_ERR_INVALID_STATE(state)
    this.state = deepFreeze(Object.assign({}, this.state, state), 'state')
    this._onstatechange(this.state, reason)
    return this.state
  }

  /**
   * Generates a new context inherit from the current context.
   *
   * @param {NanocontextOptions} [opts] - Nanocontext options.
   * @returns {Nanocontext}
   */
  snapshot (opts) {
    return new Nanocontext(this._target, opts || this._opts)
  }
}

/**
 * Creates a nanocontext.
 * @param {object} ctx Initial context.
 * @param {NanocontextOptions} [opts] Options.
 */
function nanocontext (ctx, opts) {
  return new Nanocontext(ctx, opts)
}

/**
 * @param {Nanocontext} ctx
 * @returns {Nanocontext}
 */
const getRoot = ctx => ctx[kRoot]

/**
 * @param {Nanocontext} ctx
 * @returns {Nanocontext}
 */
const getParent = ctx => ctx[kParent]

/**
 * @param {Nanocontext} ctx
 * @param {string} name
 * @param {*} decorator
 * @returns {Nanocontext}
 */
const decorate = (ctx, name, decorator) => ctx[kDecorate](name, decorator)

/**
 * @param {Nanocontext} ctx
 * @param {NanocontextOptions} [opts]
 * @returns {Nanocontext}
 */
const getSnapshot = (ctx, opts = {}) => ctx[kSnapshot](opts)

/**
 * @param {Nanocontext} ctx
 * @returns {State}
 */
const getState = ctx => ctx[kState]

/**
 * @param {Nanocontext} ctx
 * @param {*} state
 * @param {string} [reason]
 * @returns {State}
 */
const setState = (ctx, state, reason) => ctx[kSetState](state, reason)

module.exports = Object.assign(nanocontext, {
  Nanocontext,
  getRoot,
  getParent,
  decorate,
  getSnapshot,
  getState,
  setState
})
