---
title: building and checking
summary: "Two build trees, one command that says a change is sound."
group: working
order: 1
---

bambi builds with CMake and Ninja in two separate trees. `core/` and `tools/` need no JUCE and build in
seconds; the plugins need JUCE and take minutes. Most work happens in the first.

## what you need

- **CMake** 3.21 or newer, and **Ninja**.
- **macOS**: Xcode's command-line tools, then `brew install cmake ninja ccache`.
- **Windows**: Visual Studio 2022 or its Build Tools with the C++ workload. Build from a Developer Command
  Prompt for x64, which puts the compiler, CMake and Ninja on the path.
- **Linux**: a C++20 compiler, and for the plugins JUCE's dependencies: ALSA, FreeType, fontconfig, the X11
  development headers (`libx11-dev libxcomposite-dev libxcursor-dev libxext-dev libxinerama-dev libxrandr-dev
  libxrender-dev`) and Mesa's GL headers.
- **clang-format 23**, to check formatting (`brew install llvm`, or `pipx install clang-format`).

Clone with the JUCE submodule:

```bash
git clone --recurse-submodules https://github.com/Looderso/bambi
```

## core and tools

```bash
cmake -B build -G Ninja
cmake --build build
./build/bambi-tests
```

Release is the default, on purpose: an unoptimised build is several times slower, and a benchmark of one says
nothing about what the plugins cost. Configure with `-DCMAKE_BUILD_TYPE=Debug` to step through something.

`tools/watch.sh` rebuilds and reruns the tests on every save. With it open, a change to the engine is checked
in about a second.

## the plugins

```bash
cmake -B build-plugin -G Ninja -DBAMBI_BUILD_PLUGIN=ON
cmake --build build-plugin
```

This builds VST3, CLAP and a standalone app of each plugin, each plugin's check suite and picture tool, and the
conformance suite. On macOS the plugins are copied into `~/Library/Audio/Plug-Ins` after building;
`-DBAMBI_COPY_PLUGIN=OFF` turns that off. Linking with link-time optimisation needs a lot of memory; on a
small machine, link two at a time with `-DCMAKE_JOB_POOLS=link=2 -DCMAKE_JOB_POOL_LINK=link`.

A host holds on to the plugin binaries it loaded. After a rebuild, restart the host before listening.

## checking a change

```bash
tools/verify.sh          # everything
tools/verify.sh --core   # what needs no plugin build: seconds
```

`verify.sh` runs everything that says a change is sound, and a change is ready when it passes:

| check | what it catches |
|---|---|
| `bambi-tests` | the core's unit tests |
| `tools/golden.sh` | an audio render or a control trace that changed; `--update` records them again |
| the check suites | each plugin, driven headless: parameters, state, undo, presets, the editor's controls |
| the picture tools | each plugin's window drawn to a PNG, in every view the tools know |
| `tools/check-style.sh` | a colour, type size or corner radius written anywhere but the theme file |
| `tools/check-layers.sh` | an include that runs upward through the core's layers |
| `tools/format.sh --check` | a file not formatted with `.clang-format`; without `--check` it formats |
| `tools/release/notices.py --check` | a third-party notice that no longer matches what the plugins contain |

Two more run by hand. `tools/conformance.sh` loads every installed plugin in both formats and negotiates its
buses as a host would; run it before a release. `tools/check-portable.sh`, on macOS, compiles every public
header alone and checks that an x86-64 build renders what the native one does.

The golden audio hashes belong to one toolchain, Apple clang on arm64. Other systems check everything else.

## looking at the window

The picture tools draw a plugin's real editor to a PNG, with no host:

```bash
build-plugin/plugins/encoder/bambi-plugin-snapshot_artefacts/Release/bambi-plugin-snapshot out.png --scale 2
build-plugin/plugins/echo/bambi-echo-shot_artefacts/Release/bambi-echo-shot out.png --regions
build-plugin/plugins/reverb/bambi-reverb-shot_artefacts/Release/bambi-reverb-shot out.png --room
```

A UI change is looked at this way in seconds rather than by loading a host. If the view you need has no mode,
add one to the tool: a picture is always drawn by the plugin, never by hand. The pictures in the
[tutorial](/tutorial) are made this way.
