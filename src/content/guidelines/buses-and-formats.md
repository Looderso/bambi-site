---
title: buses, sidechain and formats
summary: "VST3 and CLAP; a fixed main input, an ambisonic output, and a sidechain on a bus of its own."
group: design
order: 28
---

The one property every plugin must have before anything else: **it negotiates its layout and accepts a
sidechain, in both formats, in a real host.** No amount of interface is worth building on top of a plugin that
does not.

## formats

**VST3 and CLAP**, on macOS, Windows and Linux.

| | order ceiling | ambisonic layout | sidechain |
|---|---|---|---|
| VST3 | 7th: the format's layouts stop there | the format's ambisonic layouts, ACN | an aux input bus |
| CLAP | none of the format's own | the ambisonic port extension, ACN and SN3D | an aux input port |

CLAP comes through a patched version of `clap-juce-extensions` that describes ambisonic ports; the patch is
bambi's to maintain and is written to go upstream.

## one rule for every plugin

- **The main input is fixed.** Mono or stereo for the encoder; the field, (N+1)² channels, for an effect.
- **The main output is ambisonic**, at the highest order that fits the channel count. Channels beyond it are
  silent.
- **The sidechain is a real aux bus**, never a wide main bus read past its first pair. For an effect it comes
  after the field.

A new plugin joins by declaring its buses. The checks are the same for all of them.

## the conformance suite

`tools/conformance.sh` loads every installed plugin, in both formats, and asks each the same questions:

1. every layout it claims is accepted, and every layout it does not claim is refused;
2. a wide main input is refused, so a send on channels 3 and 4 can only be the sidechain;
3. the sidechain arrives, sample for sample, at every order;
4. unused output channels are silent;
5. renders are bit-identical at block sizes 1 to 1024;
6. an offline bounce equals realtime in every sample.

The settings page shows what the host negotiated: the sample rate, the channels in, out and on the sidechain,
and the transport.
