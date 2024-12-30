import test from "node:test"
import assert from "node:assert/strict"
import { Err, None, Ok, type Result, Some, type Option } from "../src/lib.ts"

test("02-intended-path", async t => {
  await t.test("simple showcase how to work with ResultOk", () => {
    const [res, err] = Ok("yes") as Result<string, Error>

    if (err) {
      assert.fail(`Should never fail because we constructed Ok()`)
    }

    // res is a known type of string here now
    assert.strictEqual(res, "yes")
  })

  await t.test("simple showcase how to work with ResultErr", () => {
    const [_res, err] = Err({ code: "UNKNOWN_INPUT", value: -10n }) as Result<
      string,
      | { code: "UNKNOWN_INPUT"; value: bigint }
      | { code: "GENERAL_ERROR"; e: Error }
    >

    if (err) {
      // err is a known type here now
      // and of course you could simplify the if statement
      if (err.code === "UNKNOWN_INPUT") {
        assert.deepStrictEqual(err, { code: "UNKNOWN_INPUT", value: -10n })
      } else {
        assert.fail(`We constructed UKNOWN_INPUT`)
      }
      return // Err(err)
    }

    assert.fail(`Should never succeed because we constructed Err()`)
  })

  await t.test("simple showcase how to work with OptionSome", () => {
    const [val, isNone] = Some([1, 2, 3]) as Option<number[]>

    if (isNone) {
      assert.fail(`We constructed Some()`)
    }

    assert.deepStrictEqual(val, [1, 2, 3])
  })

  await t.test("simple showcase how to work with OptionNone", () => {
    const [_val, isNone] = None() as Option<number[]>

    if (isNone) {
      return // None()
    }

    assert.fail(`We constructed None()`)
  })
})
