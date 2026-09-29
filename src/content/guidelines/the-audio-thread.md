---
title: the audio thread
summary: "It computes and nothing else, and what it computes is the same every time."
group: working
order: 6
---

## nothing that can wait

The audio thread never allocates, frees or locks, and never logs, touches a file or builds a `juce::String`.
Watch for the hidden versions: a container's `push_back` or `resize`, a `std::function` copied, a `shared_ptr`
that may reach zero, a lock inside a helper. The link between instances belongs to the message thread; the
audio thread hands its state over without waiting.

**State arrives as a snapshot.** The message thread owns the patch and turns every change into an immutable
snapshot, which the audio thread adopts by pointer at the start of a block. The old one goes back to the
message thread to be freed. Anything the audio thread might need is allocated when the plugin is prepared, at
its worst case.

**Modulation runs on a fixed grid of 256 samples**, whatever block size the host uses. A parameter can be a
modulation target only if its effect is recomputed on that grid, on the audio thread, in bounded work — and a
gain is interpolated across the step, not stepped at its edge.

## a bounce matches what was heard

**An offline render equals realtime playback in every sample, and is identical at every block size from 1 to
1024.** The goldens and the conformance suite check both.

- **Nothing depends on another instance's live value.** A host freezes and bounces tracks one at a time. The
  link carries definitions and edits, never values that drive audio, and features are always computed from the
  plugin's own input.
- **Every source says why it repeats.** A feature is a function of the audio; a synced LFO, of the song
  position; a free LFO and anything turned by a rate restart with the transport; a random source is seeded. A
  new source that cannot say this does not go in.
- **The one exception is the musician's:** set to *continue*, a generator runs through the transport, and the
  window says that a bounce will then differ.
- **Within one build.** Another compiler or processor family may move a result by a rounding step, so fast-math
  is refused everywhere and anything a golden depends on uses a hand-written random generator.
