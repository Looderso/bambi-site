---
title: portability
summary: "Written so the core cannot become specific to one machine, one compiler or one locale."
group: working
order: 9
---

bambi runs on macOS, Windows and Linux. The core is where portability is won or lost, and the rules are cheap
to keep now and expensive to recover later.

## in the core

- **No intrinsics**, no architecture flags, no vendor maths libraries. The FFT is the portable one bambi
  vendors. The one place the core touches the processor directly is the denormal guard, one small header with
  a branch per processor family.
- **No platform headers in public headers.** Platform calls sit in a few source files behind small seams.
- **Liveness is a heartbeat, never a process id.** Instances find each other through shared memory and a
  session directory, and a dead one is noticed because it stops beating.
- **Every public header compiles on its own.** `tools/check-portable.sh` checks this, and that an x86-64 build
  renders what the native one does.
- **Include what you use.** One standard library pulls in `<algorithm>` for you and another does not.

## numbers and files

- **Floating point is not fast-math**, on any compiler.
- **Denormals are flushed by one guard**, opened by the plugins and by the render tools alike, so a feedback
  path decays to the same zeros in a golden as in a bounce.
- **The session file is JSON keyed by name**: parameters by key, matrix targets by name, enums as strings. No
  struct is ever written as bytes, so layout, endianness and enum width never enter it, and a project saved on
  one system opens on another with every value intact.
- **Parsing does not depend on the locale.** A decimal point is a point on every machine.
- **Deserialising uses fixed widths**, never `long` or `size_t`, and checks its bounds.
- **Nothing machine-local enters a session**: no absolute path, device name or host name. A value that depends
  on the sample rate is derived when the plugin is prepared, never stored.
