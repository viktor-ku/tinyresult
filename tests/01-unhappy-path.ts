import test from "node:test"
import assert from "node:assert/strict"
import {
  Err,
  isErr,
  isNone,
  isOk,
  isSome,
  None,
  Ok,
  Some,
  unwrap,
  unwrapOr,
} from "../src/lib.ts"

const subjects = [
  "",
  "yes",
  "true",
  "false",
  true,
  false,
  -42,
  0,
  42,
  0n,
  1n,
  Infinity,
  -Infinity,
  NaN,
  null,
  undefined,
  class {},
  function () {},
  Symbol("yey"),
  new Error("m"),
  [1, 2, 3],
  { one: 1 },
  Object.create(null),
]

test("01-unhappy-path", async t => {
  await t.test("unwrap", () => {
    subjects.forEach(it => {
      assert.throws(() => {
        unwrap(Err(it as any))
      })
      assert.throws(() => {
        unwrap(None())
      })
    })
  })

  await t.test("unwrapOr", () => {
    subjects.forEach(it => {
      assert.strictEqual(unwrapOr(Err(it as any), 99), 99)
      assert.strictEqual(unwrapOr(None(), 99), 99)
    })
  })

  await t.test("isOk", () => {
    subjects.forEach(it => {
      assert.ok(!isOk(Err(it as any)))
    })
  })

  await t.test("isErr", () => {
    subjects.forEach(it => {
      assert.ok(!isErr(Ok(it as any)))
    })
  })

  await t.test("isSome", () => {
    assert.ok(!isSome(None()))
  })

  await t.test("isNone", () => {
    subjects.forEach(it => {
      assert.ok(!isNone(Some(it as any)))
    })
  })
})
