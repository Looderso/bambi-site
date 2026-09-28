---
title: code style
summary: "Formatted by one file, commented for the reader, and nothing kept that nothing uses."
group: working
order: 8
---

## formatting

`.clang-format` formats every file of bambi's own; `tools/format.sh` applies it and `tools/format.sh --check`
fails on anything unformatted. The style is Google's, with 4-space indents and 120 columns.

Two exceptions:

- **Tables stay tables.** The parameter lists and the theme are hand-aligned tables of values and sit inside
  `// clang-format off` and `// clang-format on`.
- **Vendored code is never formatted**: `third_party/` and the test framework's header.

Every file starts with its licence line, `// SPDX-License-Identifier: GPL-3.0-or-later`.

## comments

A comment says **what the code does** and what a reader cannot see from the code: the unit of a number, an
invariant, which thread a function runs on, a reason that is true now.

- **Never how the code came to be.** No history, no "used to", no "fixed", no decision or ticket numbers, no
  references to documents, no names. That lives in version control.
- **Comment only what the code cannot say.** A comment that repeats the line under it is noise that goes
  stale.
- **Units carry their name.** A time constant in seconds is called so, in the variable and in the function.
  A function named for milliseconds and handed seconds is wrong by a factor of a thousand, and both call sites
  look right.

The same goes for everything a user or a developer reads from the program: check output and test names carry
no numbers or references either.

## naming

Degrees exist at the interface and in the parameters; radians everywhere inside. A name says which, where it
could be either. Milliseconds exist only at the interface; stored times are in seconds.

## what stays

- **Unused code is removed.** A getter nothing reads, a helper nothing calls, an option nothing sets: gone,
  not kept for later. Version control keeps it for later.
- **A helper used by one file is private to that file.**
- **A header includes what its users naturally expect from it**, and nothing it does not use.
- **One place for each fact.** A range or a default lives in the plugin's parameter list and is read from
  there, never written a second time. Where two lists must agree and cannot be one, a test holds them together.

## the look in code

Every colour, type size, stroke, radius and spacing is a named role in `ui/include/bambi/ui/Theme.h`.
`tools/check-style.sh` fails on a literal colour, type size or corner radius anywhere else in `ui/`, `editor/`
or `plugins/`. Name the value in the theme and use the name. See [the look](/contribute/the-look).
