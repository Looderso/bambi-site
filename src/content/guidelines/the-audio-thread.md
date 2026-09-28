---
title: the audio thread
summary: "It computes, and nothing else: no allocation, no freeing, no locks, no waiting."
group: working
order: 4
---

A glitch in audio is a missed deadline. So the audio thread does only what is absolutely necessary, and never
anything whose time is not bounded.

## what never happens there

- **No allocation and no freeing.** Not directly, and not hidden behind a container's `push_back` or
  `resize`, a `std::function` copied, a `shared_ptr` whose count may reach zero, or a lambda capturing by value
  into a callback.
- **No locks**, including one reached through a helper.
- **No logging, no file access, no `juce::String`.**
- **No shared memory.** The link between instances is the message thread's; the audio thread hands its state to
  a publisher there, which costs about a nanosecond.

Atomics are fine, with the reasoning for their ordering stated beside them in the code.

## how state reaches it

The message thread owns the patch. Every change becomes an **immutable snapshot**, which the audio thread
adopts by pointer at the start of a block. The old snapshot goes back to the message thread through a retire
queue and is freed there. A state load returns in a fraction of a millisecond however busy the audio thread
is, and nothing is ever freed inside `processBlock`.

## the control grid

Modulation runs on a fixed grid of **256 samples**, whatever block size the host uses, so the result never
depends on the host's buffer. New modulation or feature work joins that grid rather than inventing a rate of
its own.

## what may be modulated

A parameter can be a modulation target only if its effect is recomputed on the audio thread, in bounded work,
with everything it needs sized in advance — and, if it is a gain, interpolated across the grid step rather than
stepped at its edge. A value that needed the message thread to rebuild something would arrive at a sample the
scheduler picked, and an offline render would pick a different one. So a room's size, which changes hundreds of
delay lengths, is a setting and not a target.

## memory is sized at prepare

Anything the audio thread might need is allocated when the plugin is prepared, at its worst case. A buffer that
grew on demand would grow at a moment the message thread's timing decides, which breaks
[determinism](/contribute/determinism) as surely as it breaks the deadline.

Denormals are flushed for the length of each block by one scoped guard, the same one the render tools use.
