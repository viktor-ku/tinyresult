const C_RESULT_OK = 1
const C_RESULT_ERROR = 2
const C_OPTION_SOME = 3
const C_OPTION_NONE = 4

const C_TAG_INDEX = 2

/**
 * Definition for the good outcome of the Result
 */
export type ResultOk<T> = readonly [T, false, typeof C_RESULT_OK]

/**
 * Definition for the bad outcome of the Result
 */
export type ResultErr<E> = readonly [
  false,
  E,
  typeof C_RESULT_ERROR,
  Error | undefined,
]

/**
 * Definitionn for the Result type
 *
 * Represents either good or bad outcome bearing the respective value with it
 */
export type Result<T, E> = ResultOk<T> | ResultErr<E>

/**
 * Create a Result with the good outcome bearing the value
 *
 */
export function Ok<T>(value: T): ResultOk<T> {
  return [value, false, C_RESULT_OK]
}

/**
 * Create a Result with the bad outcome bearing the value
 *
 * Use this with sync or async functions that could throw or
 * fail. Indicate the reason for it with the value
 */
export function Err<E>(error: E): ResultErr<E> {
  return [false, error, C_RESULT_ERROR, undefined]
}

/**
 * Create a Result with the bad outcome bearing the value wrapped
 * with the original `cause` for the error
 */
Err.Wrap = function ErrWithStackTrace<E>(
  error: E,
  cause?: unknown
): ResultErr<E> {
  return [false, error, C_RESULT_ERROR, new Error("Err", { cause })]
}

/**
 * Verifies a Result to have a good outcome
 */
export function isOk<T, E>(it: Result<T, E>): it is ResultOk<T> {
  return it[C_TAG_INDEX] === C_RESULT_OK
}

/**
 * Verifies a Result to have a bad outcome
 */
export function isErr<T, E>(it: Result<T, E>): it is ResultErr<E> {
  return it[C_TAG_INDEX] === C_RESULT_ERROR
}

/**
 * Type for a fulfilled Option
 */
export type OptionSome<T> = readonly [T, false, typeof C_OPTION_SOME]

/**
 * Type for an empty Option
 */
export type OptionNone = readonly [null, true, typeof C_OPTION_NONE]

/**
 * Type defining an Option
 *
 * Either fulfilled with a value or empty
 */
export type Option<T> = OptionSome<T> | OptionNone

const C_NONE = [null, true, C_OPTION_NONE] as const

/**
 * Create a fulfilled Option bearing the value
 */
export function Some<T>(value: T): OptionSome<T> {
  return [value, false, C_OPTION_SOME]
}

/**
 * Create an empty Option bearing no value
 */
export function None(): OptionNone {
  return C_NONE
}

export function isSome<T>(it: Option<T>): it is OptionSome<T> {
  return it[C_TAG_INDEX] === C_OPTION_SOME
}

export function isNone<T>(it: Option<T>): it is OptionNone {
  return it[C_TAG_INDEX] === C_OPTION_NONE
}

type Fallback<T, E> = (error?: E) => T
type Expected<E> = (error?: E) => Error

/**
 * Dangerously unwraps a Result or an Option, throws an exception
 * in case the thing has a bad outcome `E`. Returns a good outcome
 * item `T` otherwise.
 */
export function unwrap<T, E>(
  it: Result<T, E> | Option<T>,
  expected?: Error | string | Expected<E>
): T {
  const tag = it[C_TAG_INDEX]

  if (tag === C_RESULT_OK || tag === C_OPTION_SOME) {
    return it[0]
  }

  if (tag === C_OPTION_NONE) {
    if (expected instanceof Error) {
      throw expected
    } else if (typeof expected === "string") {
      throw new Error(expected)
    } else if (typeof expected === "function") {
      throw expected()
    }
    throw new Error("Could not unwrap() None")
  }

  const e = it[1]

  if (expected instanceof Error) {
    expected.cause ??= e
    throw expected
  } else if (typeof expected === "string") {
    throw new Error(expected, { cause: e })
  } else if (typeof expected === "function") {
    const throwable = expected(e)
    throwable.cause ??= e
    throw throwable
  }

  throw new Error("Could not unwrap() Result", { cause: e })
}

/**
 * Safely unwraps a Result or an Option.
 *
 * Returns the value `T` in case of a good outcome. Otherwise
 * returns the fallback value either literal or a function return.
 */
export function unwrapOr<T, E>(
  it: Result<T, E> | Option<T>,
  fallback: Fallback<T, E> | T
): T {
  const tag = it[C_TAG_INDEX]

  if (tag === C_RESULT_OK || tag === C_OPTION_SOME) {
    return it[0]
  }

  const f =
    typeof fallback === "function"
      ? (fallback as Fallback<T, E>)
      : () => fallback

  return tag === C_OPTION_NONE ? f() : f(it[1])
}
