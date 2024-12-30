# tinyresult

> [`@vik/tinyresult`](https://jsr.io/@vik/tinyresult)

- [About](#about)
- [Install](#install)
- [Motivation](#motivation)
- [Rules](#rules)
- [How](#how)

## About

This is not only the package, but a framework defining an opinionated way of
handling errors - anything that `throw`s and typically left to be discovered
in production; or returns
[falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) values to,
what is typically an indication of failure to retrieve.

By the end of this read you will hopefully be convinced to give this one a try
as it's different from other "hey there is yet another `Result` type I have
implemented for typescript, please use it" in a subtle yet impactful way!

Please do write issues or open pull requests if you find any issues or have
suggestions, thanks

## Install

Package is published at [`jsr`](https://jsr.io/@vik/tinyresult) instead of npm
default registry, but worry not, installing it is still as simple as:

```bash
# npm
npx jsr add @vik/tinyresult

# yarn
yarn dlx jsr add @vik/tinyresult

# pnpm
pnpm dlx jsr add @vik/tinyresult

# bun
bunx jsr add @vik/tinyresult

# deno
deno add @vik/tinyresult
```

## Motivation

After seeing JS for 10 years I am sick and tired of this:

```js
function main() {
  // guess if it's going to throw at any point
  const business_value = important_work()
}
```

Every time when I have to get back to JS/TS after working with
[`rust`](https://doc.rust-lang.org/std/result/index.html) or
[`go`](https://go.dev/blog/error-handling-and-go) I feel a certain level
(not unnoticeable) of sadness crippling in... what is it? Ah, that's right:
I don't have understanding of what can (and will) explode in my programs
anymore. This is a sad realisation: error handling in JS/TS is non-existent.
It is drived by datadog (or insert your service of choice) crash discovery or
simply users not being able to access some functionality. Gross!

Our options:

1. Write a thousand tests per line of code (exaggerated, but by how much?)
2. Change something in the way we return _things_ from our functions
3. _2_ but use a library for it
4. Just pinky promise to never throw or return falsy values (yeah, right)

I really-really want to control when some work is allowed to fail, how and when!
I want to decide whether I will handle it here or just simply pass it upstream.
No surprises allowed! This is especially important in a business environment
where code evolves daily without you or me having particularly great control
over it. Today some function `foo()` `throw`s, tomorrow it doesn't and who
knows why is that. However, what is important, is that we always know what to
expect without reading the entire codebase. And typescript will help us here,
because **from now on typescript is going to tell us what to expect and it
will force us, develoeprs, to properly handle what is being returned**!

Viva the machine revolution hehe

## Rules

1. Forget _falsy_ values exist when it comes to returning _things_
   (todo: forced by eslint)
2. Forget `throw` exists when it comes to controlling the flow
   (todo: forced by eslint)
3. You must handle errors/values or pass them upstream (forced by typescript)
4. All your `Result<T, E>` `E` results should be objects with `code` as the discriminator property
