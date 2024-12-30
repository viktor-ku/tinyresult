const C_RESULT_OK = 1
const C_RESULT_ERROR = 2
const C_OPTION_SOME = 3
const C_OPTION_NONE = 4

const C_TAG_INDEX = 2

export type ResultOk<T> = readonly [T, false, typeof C_RESULT_OK]
export type ResultErr<E> = readonly [
  false,
  E,
  typeof C_RESULT_ERROR,
  Error | undefined,
]
export type Result<T, E> = ResultOk<T> | ResultErr<E>

export function Ok<T>(value: T): ResultOk<T> {
  return [value, false, C_RESULT_OK]
}

export function Err<E>(error: E): ResultErr<E> {
  return [false, error, C_RESULT_ERROR, undefined]
}

Err.Wrap = function ErrWithStackTrace<E>(
  error: E,
  cause?: unknown
): ResultErr<E> {
  return [false, error, C_RESULT_ERROR, new Error("Err", { cause })]
}

export function isOk<T, E>(it: Result<T, E>): it is ResultOk<T> {
  return it[C_TAG_INDEX] === C_RESULT_OK
}

export function isErr<T, E>(it: Result<T, E>): it is ResultErr<E> {
  return it[C_TAG_INDEX] === C_RESULT_ERROR
}

export type OptionSome<T> = readonly [T, false, typeof C_OPTION_SOME]
export type OptionNone = readonly [null, true, typeof C_OPTION_NONE]
export type Option<T> = OptionSome<T> | OptionNone

const C_NONE = [null, true, C_OPTION_NONE] as const

export function Some<T>(value: T): OptionSome<T> {
  return [value, false, C_OPTION_SOME]
}

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
