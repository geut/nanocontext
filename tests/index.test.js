import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { nanocontext, getRoot, getParent, getClone } from '../src/index.js'

const source = { name: 'alice', age: () => 25 }
let ctxRoot = null
let ctxChild = null

test('ctxRoot creation, should be equal as original ctx', () => {
  ctxRoot = nanocontext(source)
  assert.equal(ctxRoot, source)
  assert.is(ctxRoot.name, 'alice')
  assert.is(ctxRoot.age(), 25)
  assert.is(ctxRoot.root, ctxRoot)
})

test('snapshot, ctxChild creation from ctxRoot', () => {
  ctxChild = ctxRoot.clone()
  assert.equal(ctxChild, source)
  assert.is(ctxChild.name, 'alice')
  assert.is(ctxChild.age(), 25)
  assert.is(ctxChild.root, ctxRoot)
  assert.is(ctxChild.parent, ctxRoot)
})

test('set props and functions', () => {
  ctxRoot.hello = () => 'hello root'
  assert.is(ctxRoot.hello(), 'hello root')
  assert.is(ctxChild.hello(), 'hello root')

  ctxChild.hello = () => 'hello child'
  assert.is(ctxRoot.hello(), 'hello root')
  assert.is(ctxChild.hello(), 'hello child')
})

test('merge two context', () => {
  const ctx1 = nanocontext({
    name: 'bob'
  })

  const ctx2 = nanocontext({
    age: 4
  }, { parent: ctx1 })

  assert.is(ctx2.name, 'bob')
  assert.is(ctx2.age, 4)
  assert.is(ctx2.parent, ctx1)
  assert.is(ctx2.root, ctx1)
})

test('public functions [builtInMethods = false]', () => {
  const ctxRoot = nanocontext(source, { builtInMethods: false })
  assert.is(getRoot(ctxRoot), ctxRoot)

  const ctxChild = getClone(ctxRoot)
  assert.equal(ctxChild, source)
  assert.is(getRoot(ctxChild), ctxRoot)
  assert.is(getParent(ctxChild), ctxRoot)
})

test.run()
