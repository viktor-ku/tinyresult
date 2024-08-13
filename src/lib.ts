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

export type OptionSome<T> = readonly [T, true, typeof C_OPTION_SOME]
export type OptionNone = readonly [null, false, typeof C_OPTION_NONE]
export type Option<T> = OptionSome<T> | OptionNone

const C_NONE = [null, false, C_OPTION_NONE] as const

export function Some<T>(value: T): OptionSome<T> {
  return [value, true, C_OPTION_SOME]
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

export function unwrap<T, E = unknown>(it: Result<T, E> | Option<T>): T {
  const tag = it[C_TAG_INDEX]

  if (tag === C_RESULT_OK || tag === C_OPTION_SOME) {
    return it[0]
  }

  if (tag === C_OPTION_NONE) {
    throw new Error("Could not unwrap() None")
  }

  const e = it[1]

  // TODO: throw in a various weird ways
  //

  throw e
}

export function expect<T, E = unknown>(
  it: Result<T, E> | Option<T>,
  error: string | Error
): T {
  const tag = it[C_TAG_INDEX]

  if (tag === C_RESULT_OK || tag === C_OPTION_SOME) {
    return it[0]
  }

  const is_error = error instanceof Error

  if (tag === C_OPTION_NONE) {
    throw is_error ? error : new Error(error)
  }

  const it_error = it[1]

  if (is_error && it_error) {
    error.cause = it_error
  }

  throw is_error ? error : new Error(error, { cause: it_error ?? undefined })
}

export function unwrapOr<T, E = unknown>(
  it: Result<T, E> | Option<T>,
  fallback: T
): T {
  try {
    return unwrap(it)
  } catch {
    return fallback
  }
}

export function unwrapOrElse<T, E = unknown>(
  it: Result<T, E> | Option<T>,
  fallback: (it: ResultErr<E> | OptionNone) => T
): T {
  try {
    return unwrap(it)
  } catch {
    return fallback(it as ResultErr<E> | OptionNone)
  }
}
