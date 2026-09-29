---
title: making a change
summary: "Discuss first, one concern a commit, and say what the change did to the sound."
group: working
order: 3
---

## before you write it

**Open an issue first** for anything that changes the design, how something behaves for a musician, or a
plugin's parameter keys. Hosts save sessions by those keys, so they are the one thing that cannot be taken back
lightly. A fix, a test or a cleanup can go straight to a pull request.

## one concern a commit

- **A change of form and a change of behaviour are separate commits.** Formatting, comments, renames and dead
  code go in one; what the program does goes in another. A comment-only commit changes no code, which a diff
  with the comments stripped shows.
- **The subject is a sentence that says how things are now**: "A stale shared segment is refused at once on
  macOS", not "fix segment bug". The body says why, and what was checked.

## say what it did to the sound

Every change reports what happened to the golden renders:

- **"goldens unchanged"** is how a refactor proves it changed nothing a musician can hear;
- **when some moved**, say which and why, then record them again with `tools/golden.sh --update`. A golden that
  moved without a reason is a bug.

Add a golden when you add a sound the existing scenarios do not cover.

## try it where it will be used

- **UI**: draw it with the picture tools, look at it, and put the picture in the pull request. If the view has
  no mode, add one.
- **Sound and behaviour in a host**: rebuild the plugins, then **restart the host**. A host keeps a plugin's
  code loaded until its last instance is gone, so after a rebuild an open session still runs the old build.
- **The link between instances**: when the shared-memory layout changes, bump its version, `kLinkVersion`,
  every time an installed build could have run the old layout. Instances of different layouts refuse to join,
  and the symptom is instances that silently stop seeing each other.

## ready

`tools/verify.sh` passes, the goldens are accounted for, and new logic has tests that name what they catch.
