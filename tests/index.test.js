const nanocontext = require('..')

const { getRoot, getParent, getState, setState, decorate, getSnapshot } = nanocontext

const { NCTX_ERR_DEC_ALREADY_PRESENT, NCTX_ERR_INVALID_SETTER } = require('../errors')

describe('full context operations [builtInMethods]', () => {
  const ctx = { name: 'alice', age: () => 25 }
  let ctxRoot, ctxChild

  test('ctxRoot creation, should be equal as original ctx', () => {
    ctxRoot = nanocontext(ctx)
    expect(ctxRoot).toEqual(ctx)
    expect(ctxRoot.name).toBe('alice')
    expect(ctxRoot.age()).toBe(25)
    expect(ctxRoot.root).toBe(ctxRoot)
  })

  test('snapshot, ctxChild creation from ctxRoot', () => {
    ctxChild = ctxRoot.snapshot()
    expect(ctxChild).toEqual(ctx)
    expect(ctxChild.name).toBe('alice')
    expect(ctxChild.age()).toBe(25)
    expect(ctxChild.root).toBe(ctxRoot)
    expect(ctxChild.parent).toBe(ctxRoot)
  })

  test('decorators functions', () => {
    ctxRoot.decorate('hello', () => 'hello root')
    expect(ctxRoot.hello()).toBe('hello root')
    expect(ctxChild.hello()).toBe('hello root')

    ctxChild.decorate('hello', () => 'hello child')
    expect(ctxRoot.hello()).toBe('hello root')
    expect(ctxChild.hello()).toBe('hello child')

    expect(() => ctxChild.decorate('hello', null)).toThrow(NCTX_ERR_DEC_ALREADY_PRESENT)
  })

  test('decorators objects', () => {
    ctxRoot.decorate('bro', { name: 'bob' })
    expect(ctxRoot.bro.name).toBe('bob')
    expect(ctxChild.bro.name).toBe('bob')

    ctxChild.decorate('bro', { name: 'charlie' })
    expect(ctxRoot.bro.name).toBe('bob')
    expect(ctxChild.bro.name).toBe('charlie')

    expect(() => {
      ctxChild.bro = 'modified'
    }).toThrow(NCTX_ERR_INVALID_SETTER)
  })

  test('state', () => {
    const newState = { happy: true, bro: { name: 'bob' } }
    ctxRoot.setState(newState)
    expect(ctxRoot.state).toEqual(newState)
    expect(ctxChild.state).toEqual({})

    expect(() => {
      ctxRoot.state.bro = 'modified'
    }).toThrow(NCTX_ERR_INVALID_SETTER)
    expect(() => {
      ctxRoot.state.bro.name = 'modified'
    }).toThrow(NCTX_ERR_INVALID_SETTER)
  })

  test('access [freeze=true]', () => {
    const human = { name: 'bob', change () { this.name = 'change' } }
    ctxRoot.human = human
    ctxRoot.human.change()
    ctxRoot.human.name = 'alice'
    expect(ctxRoot.human).toEqual(human)
    expect(() => {
      ctxChild.human = 'modified2'
    }).toThrow(NCTX_ERR_INVALID_SETTER)
    expect(() => {
      ctxChild.human.change()
    }).toThrow(NCTX_ERR_INVALID_SETTER)
    expect(() => {
      ctxChild.human.name = 'modified2'
    }).toThrow(NCTX_ERR_INVALID_SETTER)
  })
})

describe('public functions [builtInMethods = false]', () => {
  const ctx = { name: 'alice', age: () => 25 }
  let ctxRoot, ctxChild

  test('getRoot', () => {
    ctxRoot = nanocontext(ctx, { builtInMethods: false })
    expect(getRoot(ctxRoot)).toBe(ctxRoot)
  })

  test('snapshot', () => {
    ctxChild = getSnapshot(ctxRoot)
    expect(ctxChild).toEqual(ctx)
    expect(getRoot(ctxChild)).toBe(ctxRoot)
    expect(getParent(ctxChild)).toBe(ctxRoot)
  })

  test('decorators', () => {
    decorate(ctxRoot, 'hello', () => 'hello root')
    expect(ctxRoot.hello()).toBe('hello root')
    expect(ctxChild.hello()).toBe('hello root')

    decorate(ctxChild, 'hello', () => 'hello child')
    expect(ctxRoot.hello()).toBe('hello root')
    expect(ctxChild.hello()).toBe('hello child')
  })

  test('state', () => {
    const newState = { happy: true, bro: { name: 'bob' } }
    setState(ctxRoot, newState)
    expect(getState(ctxRoot)).toEqual(newState)
    expect(getState(ctxChild)).toEqual({})
  })
})
