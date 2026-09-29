---
title: building and checking
summary: "Two build trees, and one command that says a change is sound."
group: working
order: 1
---

bambi builds with CMake and Ninja in two separate trees. `core/` and `tools/` need no JUCE and build in about a
second; the plugins need JUCE and take minutes. That difference is why most work happens in the core.

## what you need

- **CMake** 3.21 or newer, and **Ninja**.
- **macOS**: Xcode's command-line tools, then `brew install cmake ninja ccache`.
- **Windows**: Visual Studio 2022 or its Build Tools with the C++ workload. Build from a Developer Command
  Prompt for x64, which puts the compiler, CMake and Ninja on the path.
- **Linux**: a C++20 compiler, and for the plugins JUCE's dependencies: ALSA, FreeType, fontconfig, the X11
  development headers (`libx11-dev libxcomposite-dev libxcursor-dev libxext-dev libxinerama-dev libxrandr-dev
  libxrender-dev libxi-dev`) and Mesa's GL headers.
- **clang-format 23**, to check formatting (`brew install llvm`, or `pipx install clang-format`).

```bash
git clone --recurse-submodules https://github.com/Looderso/bambi
```

## core and tools

```bash
cmake -B build -G Ninja
cmake --build build
./build/bambi-tests
```

Release is the default: an unoptimised build says nothing about what anything costs. Configure with
`-DCMAKE_BUILD_TYPE=Debug` to step through something. `tools/watch.sh` rebuilds and reruns the tests on every
save.

## the plugins

```bash
cmake -B build-plugin -G Ninja -DBAMBI_BUILD_PLUGIN=ON
cmake --build build-plugin
```

This builds the VST3 and CLAP of each plugin, each plugin's check suite and picture tool, and the conformance
suite. On macOS the plugins are copied into `~/Library/Audio/Plug-Ins` after building (`-DBAMBI_COPY_PLUGIN=OFF`
turns that off); on Windows, copying into `C:\Program Files\Common Files` needs an administrator prompt. On a
machine with little memory, link two at a time: `-DCMAKE_JOB_POOLS=link=2 -DCMAKE_JOB_POOL_LINK=link`.

A change to `core/` reaches a plugin only through this second build.

## checking a change

```bash
tools/verify.sh          # everything
tools/verify.sh --core   # what needs no plugin build
```

A change is ready when `verify.sh` passes. It runs:

| check | what it catches |
|---|---|
| `bambi-tests` | the core's unit tests |
| `tools/golden.sh` | an audio render or a control trace that changed; `--update` records them again |
| the check suites | each plugin driven headless: parameters, state, undo, presets, the editor's controls |
| the picture tools | each plugin's window drawn in every view the tools know |
| `tools/check-style.sh` | a colour, type size or corner radius written anywhere but the theme file |
| `tools/check-layers.sh` | an include that runs upward through the core's layers |
| `tools/format.sh --check` | a file not formatted with `.clang-format`; without `--check` it formats |
| `tools/release/notices.py --check` | a third-party notice that no longer matches what the plugins contain |

Before a release, `tools/conformance.sh` also loads every installed plugin in both formats and negotiates its
buses as a host would.

The golden audio hashes belong to one toolchain, Apple clang on arm64. Other systems check everything else.

## looking at the window

Each plugin has a picture tool, built beside it under `build-plugin/plugins/`, that draws its real editor to a
PNG with no host. `tools/verify.sh` runs every one in every view it knows, which is also the list of views. If
the view you need has no mode, add one to the tool. The pictures in the [tutorial](/tutorial) are drawn this way.
