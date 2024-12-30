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

test("00-happy-path", async t => {
  await t.test("unwrap", () => {
    subjects.forEach(it => {
      assert.strictEqual(unwrap(Ok(it as any)), it)
      assert.strictEqual(unwrap(Some(it as any)), it)
    })
  })

  await t.test("unwrapOr", () => {
    subjects.forEach(it => {
      assert.strictEqual(unwrapOr(Ok(it as any), 99), it)
      assert.strictEqual(unwrapOr(Some(it as any), 99), it)
    })
  })

  await t.test("isOk", () => {
    subjects.forEach(it => {
      assert.ok(isOk(Ok(it as any)))
    })
  })

  await t.test("isErr", () => {
    subjects.forEach(it => {
      assert.ok(isErr(Err(it as any)))
    })
  })

  await t.test("isSome", () => {
    subjects.forEach(it => {
      assert.ok(isSome(Some(it as any)))
    })
  })

  await t.test("isNone", () => {
    assert.ok(isNone(None()))
  })
})
