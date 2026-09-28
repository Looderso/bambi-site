---
title: tests
summary: "A test names the mistake it catches, and has been seen to catch it."
group: working
order: 6
---

Coverage says a line ran. It does not say a mistake there would be noticed. bambi's tests are held to the
stronger standard: **every test has been run against a deliberately broken version of the code it guards, and
failed.**

## Catches:

When you write a test, break the code the way a real mistake would — drop a sign, skip a reset, read the wrong
index — and watch the test fail. Then say so in the test:

```cpp
/*  Catches: the hold dropped (the turn advancing whatever the transport does). */
```

A reviewer reads the `Catches:` line first. A test without one is asked what it catches. When you propose a
test, propose the mutation with it.

## what to assert

In order of preference:

- **round trips**: save and load, convert and convert back;
- **invariants** under a transformation: a rotation keeps energy, a region's outside is exactly the rest;
- **agreement with a closed form**, where the maths gives one;
- **bit-identical output at block sizes 1 to 1024**.

Test the behaviour a user or a host would see. A UI check clicks where the control is drawn, rather than setting
the state behind it, because "clicking does nothing" is exactly the failure that would otherwise pass.

## where tests live

| | what | run by |
|---|---|---|
| `core/tests/` | unit tests with doctest, one file per module | `./build/bambi-tests` |
| `tests/golden/` | scenarios rendered to audio and control traces, compared with what was recorded | `tools/golden.sh` |
| `plugins/*/Check/` | each plugin driven headless: parameters, state, undo, presets, the editor | the check suites |
| `tests/conformance/` | every installed plugin, both formats, negotiating buses as a host does | `tools/conformance.sh` |

A golden that changed is either a bug or an intended change. If it is intended, record it again with
`tools/golden.sh --update` and say in the change why the sound moved.

## rules for the tests themselves

- Test names say what they check. They carry no ticket numbers or references.
- A concurrency test stops after a number of samples, never after a time, so a loaded machine does not fail it.
- Test scaffolding is shared, not copied: one fake transport serves every check.
