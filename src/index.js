import assert from 'nanocustomassert'

const kIsNanocontext = Symbol('nanocontext.isnanocontext')
const kRoot = Symbol('nanocontext.root')
const kParent = Symbol('nanocontext.parent')
const kClone = Symbol('nanocontext.clone')

const builtin = ['root', 'parent', 'clone']

export function nanocontext (source, opts = {}) {
  let { parent, builtInMethods = true } = opts

  assert(typeof source === 'object')

  let root = null
  let target = null

  if (source[kIsNanocontext]) {
    parent = source
    source = {}
  }

  const clone = (source = target) => nanocontext(source, { builtInMethods, parent: target })

  target = new Proxy(source, {
    get (target, prop) {
      if (builtInMethods) {
        switch (prop) {
          case 'root': return root
          case 'parent': return parent
          case 'clone': return clone
        }
      }

      switch (prop) {
        case kIsNanocontext: return true
        case kRoot: return root
        case kParent: return parent
        case kClone: return clone
      }

      if (Reflect.has(target, prop)) {
        return Reflect.get(target, prop)
      }

      if (parent) {
        return Reflect.get(parent, prop)
      }
    },

    set (target, prop, value) {
      if (builtInMethods && builtin.includes(prop)) {
        throw new Error('cannot change a built-in nanocontext method')
      }

      return Reflect.set(target, prop, value)
    },

    ownKeys (target) {
      const parentKeys = parent ? Reflect.ownKeys(parent) : []
      return Array.from(new Set([...parentKeys, ...Reflect.ownKeys(target)]))
    },

    getOwnPropertyDescriptor (target, prop) {
      if (builtInMethods && builtin.includes(prop)) {
        return { enumerable: true, configurable: true, writable: false }
      }

      if (Reflect.has(target, prop)) {
        return Reflect.getOwnPropertyDescriptor(target, prop)
      }

      if (parent && Reflect.has(parent, prop)) {
        return Reflect.getOwnPropertyDescriptor(parent, prop)
      }
    },

    has (target, prop) {
      if (Reflect.has(target, prop)) return true
      if (parent) return Reflect.has(parent, prop)
      return false
    }
  })

  if (parent) {
    if (parent[kIsNanocontext]) {
      root = parent[kRoot]
    } else {
      root = parent
    }
  } else {
    root = target
  }

  return target
}

/**
 * @param {Nanocontext} ctx
 * @returns {Object}
 */
export const getRoot = ctx => ctx[kRoot]

/**
 * @param {Nanocontext} ctx
 * @returns {Object}
 */
export const getParent = ctx => ctx[kParent]

/**
 * @param {Nanocontext} ctx
 * @param {Object} [source]
 * @returns {Nanocontext}
 */
export const getClone = (ctx, source) => ctx[kClone](source)
