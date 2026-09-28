#!/usr/bin/env bash
#
# Draws every picture on the tutorial page again, from the plugins' own picture tools, and writes them
# to public/tutorial/. Run it whenever the plugins' window changes; nothing on the page is drawn by hand.
#
#   scripts/tutorial-pictures.sh [path to the bambi repository]
#
# The repository defaults to ../AETHER beside this one, or $BAMBI. Its plugins must be built
# (`cmake --build build-plugin`). Needs cwebp (`brew install webp`).
#
# Every shot is the whole window at twice its size, 2040 x 1200; the crops below are the window's own
# regions at that size. If the window's layout changes, these are the numbers to change:
#   header          y    0 ..   88
#   scene           x    0 .. 1236,  y  88 .. 690
#   matrix          x    0 .. 1236,  y 690 .. 1200
#   right panel     x 1240 .. 1936,  y  84 .. 1200
#   level column    x 1936 .. 2040,  y  84 .. 1200
#   bottom edge     y 1128 .. 1200

set -euo pipefail
site=$(cd "$(dirname "$0")/.." && pwd)
repo=${1:-${BAMBI:-$site/../AETHER}}
repo=$(cd "$repo" && pwd)
out=$site/public/tutorial

tool() { echo "$repo/build-plugin/plugins/$1/$2_artefacts/Release/$2"; }
encoder=$(tool encoder bambi-plugin-snapshot)
echo=$(tool echo bambi-echo-shot)
reverb=$(tool reverb bambi-reverb-shot)
for t in "$encoder" "$echo" "$reverb"; do
    [ -x "$t" ] || { echo "no picture tool at $t -- build the plugins first: cmake --build build-plugin" >&2; exit 1; }
done
command -v cwebp > /dev/null || { echo "cwebp is missing: brew install webp" >&2; exit 1; }

shots=$(mktemp -d -t bambi-tutorial)
trap 'rm -rf "$shots"' EXIT

#  the shots: tool, file, the tool's arguments
"$echo"    "$shots/echo.png"                                        > /dev/null
"$echo"    "$shots/echo-regions.png" --regions                      > /dev/null
"$echo"    "$shots/echo-lfo.png" --lfo                              > /dev/null
"$echo"    "$shots/echo-presets.png" --presets                      > /dev/null
"$reverb"  "$shots/reverb-settings.png" --settings                  > /dev/null
"$encoder" "$shots/encoder.png" --scale 2                           > /dev/null
"$encoder" "$shots/encoder-source.png" --scale 2 --tab 2            > /dev/null
"$encoder" "$shots/encoder-region.png" --scale 2 --matrix-tab 3 --source 18 --region-kind 1 > /dev/null

#  picture: shot, then cwebp's crop as x y width height, or nothing for the whole window
picture() {
    local name=$1 shot=$2; shift 2
    local crop=()
    [ $# -eq 4 ] && crop=(-crop "$@")
    cwebp -quiet -q 90 ${crop[@]+"${crop[@]}"} "$shots/$shot" -o "$out/$name.webp"
    echo "  $name"
}

mkdir -p "$out"
echo "tutorial pictures, from $repo"
picture window        echo.png
picture header        encoder.png            0    0 2040   88
picture scene         echo.png               0   88 1236  602
picture matrix        encoder.png            0  690 1236  510
picture source        echo-lfo.png        1240   84  696 1116
picture values        encoder-source.png  1240   84  696 1116
picture regions       echo-regions.png
picture region-source encoder-region.png
picture presets       echo-presets.png    1240    0  800 1200
picture settings      reverb-settings.png
picture levels        echo.png            1936   84  104 1116
picture footer        echo.png               0 1128 2040   72
