#!/usr/bin/env bash
#
# Draws every picture of a plugin on the site again, from the plugins' own picture tools: the tutorial's
# crops into public/tutorial/, and each product page's whole shots into public/product/<plugin>/. Run it
# whenever the plugins' window changes; nothing on the site is drawn by hand.
#
#   scripts/pictures.sh [path to the bambi repository]
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
product=$site/public/product

tool() { echo "$repo/build-plugin/plugins/$1/$2_artefacts/Release/$2"; }
encoder=$(tool encoder bambi-plugin-snapshot)
echo=$(tool echo bambi-echo-shot)
reverb=$(tool reverb bambi-reverb-shot)
decoder=$(tool decoder bambi-decoder-shot)
host="$repo/build-plugin/apps/live-host/bambi-live-host-shot_artefacts/Release/bambi-live-host-shot"
for t in "$encoder" "$echo" "$reverb" "$decoder"; do
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
"$echo"    "$shots/echo-axis.png" --axis                            > /dev/null
"$echo"    "$shots/echo-every-pass.png" --every-pass                > /dev/null
"$reverb"  "$shots/reverb-settings.png" --settings                  > /dev/null
"$reverb"  "$shots/reverb.png"                                     > /dev/null
"$reverb"  "$shots/reverb-room.png" --room                          > /dev/null
"$encoder" "$shots/encoder.png" --scale 2                           > /dev/null
"$encoder" "$shots/encoder-source.png" --scale 2 --tab 2            > /dev/null
"$encoder" "$shots/encoder-region.png" --scale 2 --matrix-tab 3 --source 18 --region-kind 1 > /dev/null
"$encoder" "$shots/encoder-transform.png" --scale 2 --tab 1         > /dev/null
"$encoder" "$shots/encoder-nodes.png" --scale 2 --nodes             > /dev/null
"$decoder" "$shots/decoder.png"                                     > /dev/null
"$decoder" "$shots/decoder-speakers.png" --speakers                > /dev/null
"$decoder" "$shots/decoder-loudspeakers.png" --loudspeakers        > /dev/null

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

#  Echo's tutorial: its own panel, a crop of the panel's width beside the text
picture echo-taps       echo.png            1240   84  696  440
picture echo-timing     echo.png            1240  526  696  580
picture echo-axis       echo-axis.png       1240  526  696  240
picture echo-every-pass echo-every-pass.png 1240  526  696  540
picture echo-send       echo-regions.png    1240   84  696  700

#  Reverb's tutorial
picture reverb-window   reverb.png
picture reverb-room     reverb-room.png     1240   84  696  830
picture reverb-send     reverb.png          1240   84  696  780
picture reverb-scene    reverb.png             0   88 1236  602

#  the path encoder's tutorial
picture encoder-window     encoder.png
picture encoder-trajectory encoder.png           1240   84  696  700
picture encoder-custom     encoder-nodes.png     1240   84  696  484
picture encoder-nodes      encoder-nodes.png        0   88 1236  602
picture encoder-transform  encoder-transform.png 1240   84  696  640
picture encoder-scene      encoder.png              0   88 1236  602

#  the decoder's tutorial
picture decoder-window       decoder.png
picture decoder-outputs      decoder.png                 520    0  640   88
picture decoder-headphones   decoder.png                1240   84  696  720
picture decoder-speakers     decoder-speakers.png       1240   84  696  860
picture decoder-loudspeakers decoder-loudspeakers.png   1240   84  696  820
picture decoder-orientation  decoder.png                   0  690 1236  420
picture decoder-scene        decoder-speakers.png          0   88 1236  602

#  The product pages: whole shots at four times the window's size, so the page's zoom stays sharp. The
#  page crops them itself, in the window's points, from the parts listed in src/content/plugins/<plugin>.md.
#  A tool without --scale draws at twice the size and ignores it.
whole() {
    local plugin=$1 name=$2 tool=$3; shift 3
    mkdir -p "$product/$plugin"
    "$tool" "$shots/product.png" "$@" --scale 4 > /dev/null
    cwebp -quiet -q 90 "$shots/product.png" -o "$product/$plugin/$name.webp"
    echo "  $plugin/$name"
}
whole echo window     "$echo"
whole echo axis       "$echo" --axis
whole echo every-pass "$echo" --every-pass
whole echo regions    "$echo" --regions
whole path-encoder trajectory "$encoder" --tab 0
whole path-encoder transform  "$encoder" --tab 1
whole path-encoder source     "$encoder" --tab 2
whole reverb room         "$reverb" --room
whole reverb send         "$reverb"
whole decoder headphones   "$decoder"
whole decoder speakers     "$decoder" --speakers
whole decoder loudspeakers "$decoder" --loudspeakers

#  The host: its window is wider than a plugin's, 1092 x 600 points. Its tool is built with the host
#  (cmake -DBAMBI_BUILD_HOST=ON); without it these are left as they are.
if [ -x "$host" ]; then
    #  the host's tutorial: crops of its window at twice its size, 2184 x 1200
    "$host" "$shots/host.png" --routing   > /dev/null
    "$host" "$shots/host-wires.png" --wires > /dev/null
    "$host" "$shots/host-timeline.png" --timeline > /dev/null
    "$host" "$shots/host-session.png" --session > /dev/null
    "$host" "$shots/host-outputs.png" --outputs > /dev/null
    picture host-window    host.png
    picture host-tracks    host.png           152  104  760  620
    picture host-returns   host.png          1020  104  640  290
    picture host-wires     host-wires.png     152  104 1520  540
    picture host-decoders  host.png          1760  104  424  360
    picture host-timeline  host-timeline.png
    picture host-session   host-session.png
    picture host-outputs   host-outputs.png   210   44 1760 1060
    whole host routing  "$host" --routing
    whole host wires    "$host" --wires
    whole host timeline "$host" --timeline
    whole host session  "$host" --session
    whole host outputs  "$host" --outputs
else
    echo "  host: no picture tool at $host -- build it with -DBAMBI_BUILD_HOST=ON" >&2
fi
