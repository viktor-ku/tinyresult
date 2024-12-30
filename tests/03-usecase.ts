import test from "node:test"
import assert from "node:assert/strict"
import { Err, None, Ok, type Result, Some, type Option } from "../src/lib.ts"

const env = {
  NODE_ENV: "development",
  DATABASE_URL: "<url>",
}

function readEnv(key: string): Option<string> {
  const hasKey = Object.prototype.hasOwnProperty.call(env, key) as boolean

  if (!hasKey) {
    return None()
  }

  const value = env[key]

  if (typeof value === "string") {
    return Some(value)
  }

  return None()
}

type dbFail = { code: "DB_UNAVAILABLE"; e: Error } | { code: "NO_DATABASE_URL" }

function noop(..._args: any[]) {}

async function findLimit(): Promise<Result<number, dbFail>> {
  const [url, noUrl] = readEnv("DATABASE_URL")

  if (noUrl) {
    return Err({ code: "NO_DATABASE_URL" })
  }

  noop(url)

  // here we don't use `noEnv` because we are able to directly
  // compare `env` with other string literals -- you only need
  // to use the second value in that array if you want to see
  // if it's a truthy value that you are getting back
  const [env] = readEnv("NODE_ENV")

  // select limit from limits
  if (env === "development") {
    return Ok(100)
  } else if (env === "production") {
    return Ok(1000)
  }

  return Err({ code: "DB_UNAVAILABLE", e: new Error("Could not reach it") })
}

type jobFail = dbFail | { code: "COMPUTATION_ERROR" }

async function job(input: number): Promise<Result<number[], jobFail>> {
  const [limit, limitErr] = await findLimit()

  if (limitErr) {
    return Err(limitErr)
  }

  if (input > limit) {
    return Ok(Array(5).fill(limit))
  } else if (input <= limit && input >= 0) {
    return Ok(Array(5).fill(input))
  }

  return Err({ code: "COMPUTATION_ERROR" })
}

test("03-usecase", async t => {
  await t.test("should handle with a positive result", async () => {
    const input = 42
    const [res, err] = await job(input)

    if (err) {
      if (err.code === "COMPUTATION_ERROR") {
        // handle
      }
      if (err.code === "NO_DATABASE_URL") {
        // handle
      }
      if (err.code === "DB_UNAVAILABLE") {
        // handle
      }
      return
    }

    assert.deepStrictEqual(res, [input, input, input, input, input])
  })

  await t.test("should handle with a negative result", async () => {
    const input = -1
    const [_res, err] = await job(input)

    if (err) {
      if (err.code === "COMPUTATION_ERROR") {
        // handle
        assert.ok(input < 0)
      }
      if (err.code === "NO_DATABASE_URL") {
        // handle
      }
      if (err.code === "DB_UNAVAILABLE") {
        // handle
      }
      return
    }

    assert.fail("Should never reach here because our input is invalid")
  })
})
